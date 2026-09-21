import {
	DeleteObjectCommand,
	PutObjectCommand,
	type S3Client,
} from "@aws-sdk/client-s3";
import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { StorageGetResponse } from "@repo/api/types";
import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { ulid } from "ulid";
import { DBS } from "../database-service/constants.js";
import { storageTable } from "../database-service/tables/index.js";
import { S3_CLIENT } from "./constants.js";
import { sanitizeFileName } from "./helpers/sanitize-file-name.js";
import type { UploadAvatarInput } from "./types/storage.js";

@Injectable()
export class StorageService {
	private readonly bucket: string;
	private readonly publicUrlBase: string;

	constructor(
		@Inject(S3_CLIENT) private readonly s3: S3Client,
		@Inject(DBS.APP) private readonly db: NodePgDatabase,
		configService: ConfigService,
	) {
		this.bucket = configService.getOrThrow<string>("STORAGE_BUCKET");
		this.publicUrlBase = configService.getOrThrow<string>("STORAGE_PUBLIC_URL");
	}

	async uploadAvatar({ userId, file }: UploadAvatarInput): Promise<{
		id: string;
	}> {
		const objectKey = `avatars/${userId}/${ulid()}_${sanitizeFileName(file.name)}`;
		const body = Buffer.from(await file.arrayBuffer());

		await this.s3.send(
			new PutObjectCommand({
				Bucket: this.bucket,
				Key: objectKey,
				Body: body,
				ContentType: file.type || undefined,
			}),
		);

		try {
			const [row] = await this.db
				.insert(storageTable)
				.values({ objectKey })
				.returning({ id: storageTable.id });

			if (!row) {
				throw new Error("Storage insert failed");
			}

			return { id: row.id };
		} catch (error) {
			await this.s3.send(
				new DeleteObjectCommand({
					Bucket: this.bucket,
					Key: objectKey,
				}),
			);
			throw error;
		}
	}

	async getPublicUrl(id: string): Promise<StorageGetResponse> {
		const [row] = await this.db
			.select({ objectKey: storageTable.objectKey })
			.from(storageTable)
			.where(eq(storageTable.id, id))
			.limit(1);

		if (!row) {
			throw new Error("Storage object not found");
		}

		return { data: { url: `${this.publicUrlBase}/${row.objectKey}` } };
	}

	async delete(id: string): Promise<void> {
		const [row] = await this.db
			.select({ objectKey: storageTable.objectKey })
			.from(storageTable)
			.where(eq(storageTable.id, id))
			.limit(1);

		if (!row) {
			return;
		}

		await this.s3.send(
			new DeleteObjectCommand({
				Bucket: this.bucket,
				Key: row.objectKey,
			}),
		);

		await this.db.delete(storageTable).where(eq(storageTable.id, id));
	}
}

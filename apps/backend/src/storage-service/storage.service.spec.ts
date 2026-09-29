import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { ConfigModule } from "@nestjs/config";
import { Test, type TestingModule } from "@nestjs/testing";
import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vitest";
import { DBS } from "../database-service/constants";
import { DatabaseModule } from "../database-service/database.module";
import { storageTable } from "../database-service/tables/index";
import { S3_CLIENT } from "./constants";
import { StorageService } from "./storage.service";

const USER_ID = "01ARZ3NDEKTSV4RRFFQ69G5FAV";
const BUCKET = "wealth-storage";
const PUBLIC_URL_BASE = `http://localhost:9000/${BUCKET}`;

const jpegFile = (name: string) =>
	new File(["x"], name, { type: "image/jpeg" });

describe("Storage service", () => {
	let moduleRef: TestingModule;
	let storageService: StorageService;
	let db: NodePgDatabase;
	const send = vi.fn().mockResolvedValue({});

	beforeAll(async () => {
		process.env.STORAGE_BUCKET = BUCKET;
		process.env.STORAGE_PUBLIC_URL = PUBLIC_URL_BASE;

		moduleRef = await Test.createTestingModule({
			imports: [
				ConfigModule.forRoot({
					isGlobal: true,
					ignoreEnvFile: true,
				}),
				DatabaseModule,
			],
			providers: [
				StorageService,
				{
					provide: S3_CLIENT,
					useValue: { send },
				},
			],
		}).compile();
		storageService = moduleRef.get(StorageService);
		db = moduleRef.get(DBS.APP);
	});

	beforeEach(() => {
		send.mockClear();
	});

	afterAll(async () => {
		await moduleRef.close();
	});

	const upload = (name: string) =>
		storageService.uploadAvatar({
			userId: USER_ID,
			file: jpegFile(name),
		});

	it("uploads an avatar under avatars/{userId}/ and returns an id", async () => {
		const { id } = await upload("avatar_name.jpg");

		expect(id).toBeTruthy();
		expect(send.mock.calls[0]?.[0]).toBeInstanceOf(PutObjectCommand);

		const command = send.mock.calls[0]?.[0];

		expect(command).toBeInstanceOf(PutObjectCommand);
		expect(command.input.Bucket).toBe(BUCKET);
		expect(command.input.Key).toMatch(
			new RegExp(`^avatars/${USER_ID}/.+_avatar_name\\.jpg$`),
		);

		const [row] = await db
			.select()
			.from(storageTable)
			.where(eq(storageTable.id, id))
			.limit(1);
		expect(row?.objectKey).toBe(command.input.Key);
	});

	it("returns public urls for many storage ids", async () => {
		const first = await upload("one.jpg");
		const second = await upload("two.jpg");

		const [firstRow] = await db
			.select({ objectKey: storageTable.objectKey })
			.from(storageTable)
			.where(eq(storageTable.id, first.id))
			.limit(1);

		const [secondRow] = await db
			.select({ objectKey: storageTable.objectKey })
			.from(storageTable)
			.where(eq(storageTable.id, second.id))
			.limit(1);

		await expect(
			storageService.resolvePublicUrl([first.id, second.id, first.id]),
		).resolves.toEqual(
			new Map([
				[first.id, `${PUBLIC_URL_BASE}/${firstRow?.objectKey}`],
				[second.id, `${PUBLIC_URL_BASE}/${secondRow?.objectKey}`],
			]),
		);
	});

	it("returns a public url from STORAGE_PUBLIC_URL", async () => {
		const { id } = await upload("pic.jpg");
		const [row] = await db
			.select({ objectKey: storageTable.objectKey })
			.from(storageTable)
			.where(eq(storageTable.id, id))
			.limit(1);

		await expect(storageService.resolvePublicUrl([id])).resolves.toEqual(
			new Map([[id, `${PUBLIC_URL_BASE}/${row?.objectKey}`]]),
		);
	});

	it("deletes the object and row", async () => {
		const { id } = await upload("gone.jpg");
		send.mockClear();

		await storageService.delete(id);

		expect(send.mock.calls[0]?.[0]).toBeInstanceOf(DeleteObjectCommand);

		const [row] = await db
			.select()
			.from(storageTable)
			.where(eq(storageTable.id, id))
			.limit(1);

		expect(row).toBeUndefined();
	});

	it("returns an empty map when the storage row is missing", async () => {
		await expect(
			storageService.resolvePublicUrl(["01ARZ3NDEKTSV4RRFFQ69G5FAZ"]),
		).resolves.toEqual(new Map());
	});
});

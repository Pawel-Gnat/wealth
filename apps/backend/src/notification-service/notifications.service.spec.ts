import type { TestingModule } from "@nestjs/testing";
import { BUDGET_EVENTS, RECORD_EVENTS } from "@repo/api/events";
import { NOTIFICATION_NOT_FOUND } from "@repo/api/schemas";
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
import { notificationsTable } from "../database-service/tables/index";
import { SsePublisher } from "../sse-service/sse-publisher.service";
import { createTestApp } from "../test/helpers/modules";
import { createTestUser } from "../test/mocks/users";
import { UsersService } from "../users-service/users.service";
import { NotificationsService } from "./notifications.service";

const budgetMetadata = {
	budgetId: "budget-1",
	budgetName: "House",
};

describe("Notifications service", () => {
	let moduleRef: TestingModule;
	let notificationsService: NotificationsService;
	let usersService: UsersService;
	let db: NodePgDatabase;
	const publish = vi.fn().mockResolvedValue(true);

	beforeAll(async () => {
		moduleRef = await createTestApp([
			NotificationsService,
			{ provide: SsePublisher, useValue: { publish } },
		]).compile();
		notificationsService = moduleRef.get(NotificationsService);
		usersService = moduleRef.get(UsersService);
		db = moduleRef.get(DBS.APP);
	});

	beforeEach(() => {
		publish.mockClear();
		publish.mockResolvedValue(true);
	});

	afterAll(async () => {
		await moduleRef.close();
	});

	it("rolls the insert back when the caller transaction fails", async () => {
		const user = await createTestUser(usersService, {
			passwordHash: "hash",
			emailTag: "notification-rollback",
		});

		await expect(
			db.transaction(async (tx) => {
				await notificationsService.create(tx, [
					{
						userId: user.id,
						event: BUDGET_EVENTS.updated,
						metadata: budgetMetadata,
					},
				]);
				throw new Error("caller failed");
			}),
		).rejects.toThrow("caller failed");

		await expect(notificationsService.list(user.id)).resolves.toEqual({
			data: [],
		});
		expect(publish).not.toHaveBeenCalled();
	});

	it("publishes a created event only after the caller commits", async () => {
		const user = await createTestUser(usersService, {
			passwordHash: "hash",
			emailTag: "notification-publish",
		});

		const rows = await db.transaction((tx) =>
			notificationsService.create(tx, [
				{
					userId: user.id,
					event: BUDGET_EVENTS.updated,
					metadata: budgetMetadata,
				},
			]),
		);

		expect(publish).not.toHaveBeenCalled();

		await notificationsService.publish(rows);

		expect(publish).toHaveBeenCalledOnce();
		expect(publish.mock.calls[0]?.[0]).toBe(user.id);
		expect(publish.mock.calls[0]?.[1]).toMatchObject({
			type: "notification-created",
			notification: {
				event: BUDGET_EVENTS.updated,
				metadata: budgetMetadata,
				readAt: null,
			},
		});
	});

	it("returns the signed-in user's notifications, newest first", async () => {
		const user = await createTestUser(usersService, {
			passwordHash: "hash",
			emailTag: "notification-list",
		});
		const other = await createTestUser(usersService, {
			passwordHash: "hash",
			emailTag: "notification-list-other",
		});

		await db.transaction((tx) =>
			notificationsService.create(tx, [
				{
					userId: user.id,
					event: BUDGET_EVENTS.updated,
					metadata: budgetMetadata,
				},
			]),
		);
		await db.transaction((tx) =>
			notificationsService.create(tx, [
				{
					userId: user.id,
					event: RECORD_EVENTS.expense.created,
					metadata: { ...budgetMetadata, recordId: "record-1" },
				},
				{
					userId: other.id,
					event: BUDGET_EVENTS.deleted,
					metadata: budgetMetadata,
				},
			]),
		);

		const listed = await notificationsService.list(user.id);

		expect(listed.data.map((notification) => notification.event)).toEqual([
			RECORD_EVENTS.expense.created,
			BUDGET_EVENTS.updated,
		]);
		expect(listed.data[0]).toMatchObject({
			metadata: { ...budgetMetadata, recordId: "record-1" },
			readAt: null,
		});
	});

	it("drops a row whose event is not in the catalog", async () => {
		const user = await createTestUser(usersService, {
			passwordHash: "hash",
			emailTag: "notification-invalid",
		});

		await db.insert(notificationsTable).values({
			userId: user.id,
			event: "budget.created",
			metadata: budgetMetadata,
		});

		await expect(notificationsService.list(user.id)).resolves.toEqual({
			data: [],
		});
	});

	it("rejects marking someone else's notification", async () => {
		const owner = await createTestUser(usersService, {
			passwordHash: "hash",
			emailTag: "notification-owner",
		});
		const other = await createTestUser(usersService, {
			passwordHash: "hash",
			emailTag: "notification-stranger",
		});
		const [row] = await db.transaction((tx) =>
			notificationsService.create(tx, [
				{
					userId: owner.id,
					event: BUDGET_EVENTS.updated,
					metadata: budgetMetadata,
				},
			]),
		);

		await expect(
			notificationsService.markRead(other.id, row.id),
		).rejects.toThrow(NOTIFICATION_NOT_FOUND);
		expect(publish).not.toHaveBeenCalled();
	});

	it("marks one unread notification and skips a second publish", async () => {
		const user = await createTestUser(usersService, {
			passwordHash: "hash",
			emailTag: "notification-mark-one",
		});
		const [row] = await db.transaction((tx) =>
			notificationsService.create(tx, [
				{
					userId: user.id,
					event: BUDGET_EVENTS.left,
					metadata: budgetMetadata,
				},
			]),
		);

		const first = await notificationsService.markRead(user.id, row.id);
		const second = await notificationsService.markRead(user.id, row.id);

		expect(first.data.id).toBe(row.id);
		expect(first.data.readAt).toEqual(expect.any(String));
		expect(second.data.readAt).toBe(first.data.readAt);
		expect(publish).toHaveBeenCalledOnce();
		expect(publish.mock.calls[0]?.[1]).toMatchObject({
			type: "notification-read",
			notificationId: row.id,
			readAt: first.data.readAt,
		});
	});

	it("marks only unread notifications and publishes once", async () => {
		const user = await createTestUser(usersService, {
			passwordHash: "hash",
			emailTag: "notification-mark-all",
		});
		const rows = await db.transaction((tx) =>
			notificationsService.create(tx, [
				{
					userId: user.id,
					event: BUDGET_EVENTS.updated,
					metadata: budgetMetadata,
				},
				{
					userId: user.id,
					event: BUDGET_EVENTS.deleted,
					metadata: budgetMetadata,
				},
			]),
		);

		const alreadyRead = rows[0];
		const unread = rows[1];
		if (!alreadyRead || !unread) {
			throw new Error("expected two notifications");
		}

		const firstMark = await notificationsService.markRead(
			user.id,
			alreadyRead.id,
		);
		publish.mockClear();

		const marked = await notificationsService.markAllRead(user.id);
		const listed = await notificationsService.list(user.id);
		const kept = listed.data.find(
			(notification) => notification.id === alreadyRead.id,
		);
		const changed = listed.data.find(
			(notification) => notification.id === unread.id,
		);

		expect(marked.data.readAt).toEqual(expect.any(String));
		expect(kept?.readAt).toBe(firstMark.data.readAt);
		expect(changed?.readAt).toBe(marked.data.readAt);
		expect(publish).toHaveBeenCalledOnce();
		expect(publish.mock.calls[0]?.[1]).toMatchObject({
			type: "notifications-read",
			readAt: marked.data.readAt,
		});
	});

	it("does not write or publish when every notification is already read", async () => {
		const user = await createTestUser(usersService, {
			passwordHash: "hash",
			emailTag: "notification-mark-all-empty",
		});

		await expect(notificationsService.markAllRead(user.id)).resolves.toEqual({
			data: { readAt: null },
		});
		expect(publish).not.toHaveBeenCalled();
	});

	it("keeps the row read when publishing fails", async () => {
		const user = await createTestUser(usersService, {
			passwordHash: "hash",
			emailTag: "notification-publish-fails",
		});
		const [row] = await db.transaction((tx) =>
			notificationsService.create(tx, [
				{
					userId: user.id,
					event: BUDGET_EVENTS.updated,
					metadata: budgetMetadata,
				},
			]),
		);
		publish.mockRejectedValueOnce(new Error("redis down"));

		await expect(
			notificationsService.markRead(user.id, row.id),
		).resolves.toMatchObject({ data: { id: row.id } });

		const listed = await notificationsService.list(user.id);
		expect(listed.data[0]?.readAt).toEqual(expect.any(String));
	});
});

import { Injectable } from "@nestjs/common";
import { RedisService } from "../redis-service/redis.service.js";
import { getTodayInTimeZone } from "../shared/time-zone/get-today-in-time-zone.js";

const BOTS_DAY_STATE_TTL_SECONDS = 48 * 60 * 60;
const BOTS_MIN_HOUR = 8;
const BOTS_MAX_HOUR = 22;
const BOTS_TIME_ZONE = "Europe/Warsaw";

export type BotsDayState = {
	scheduledHours: Record<string, number>;
	tried: Record<string, boolean>;
};

@Injectable()
export class BotsDayStateService {
	constructor(private readonly redisService: RedisService) {}

	buildDayKey(date: string) {
		return `bots:daily:${date}`;
	}

	getTodayDate(now?: Date) {
		return getTodayInTimeZone(BOTS_TIME_ZONE, now);
	}

	async getDayState(date: string): Promise<BotsDayState | null> {
		const rawState = await this.redisService.get(this.buildDayKey(date));
		if (!rawState) {
			return null;
		}

		return this.parseState(rawState);
	}

	async getOrCreateDayState(
		date: string,
		botIds: readonly string[],
	): Promise<BotsDayState> {
		const existingState = await this.getDayState(date);
		if (existingState) {
			return existingState;
		}

		const initialState = this.createInitialState(botIds);
		const serializedState = JSON.stringify(initialState);
		const wasCreated = await this.redisService.setNxEx(
			this.buildDayKey(date),
			serializedState,
			BOTS_DAY_STATE_TTL_SECONDS,
		);

		if (wasCreated) {
			return initialState;
		}

		const latestState = await this.getDayState(date);
		if (!latestState) {
			await this.redisService.set(this.buildDayKey(date), serializedState, {
				ex: BOTS_DAY_STATE_TTL_SECONDS,
			});
			return initialState;
		}

		return latestState;
	}

	async markBotAsTried(date: string, botId: string): Promise<BotsDayState> {
		const dayState = await this.getDayState(date);
		if (!dayState) {
			throw new Error(`Bots day state is missing for date ${date}`);
		}

		dayState.tried[botId] = true;
		await this.redisService.set(
			this.buildDayKey(date),
			JSON.stringify(dayState),
			{ ex: BOTS_DAY_STATE_TTL_SECONDS },
		);

		return dayState;
	}

	private createInitialState(botIds: readonly string[]): BotsDayState {
		const scheduledHours: Record<string, number> = {};
		const tried: Record<string, boolean> = {};

		for (const botId of botIds) {
			scheduledHours[botId] = this.getRandomScheduledHour();
			tried[botId] = false;
		}

		return {
			scheduledHours,
			tried,
		};
	}

	private getRandomScheduledHour() {
		const hoursCount = BOTS_MAX_HOUR - BOTS_MIN_HOUR + 1;
		return BOTS_MIN_HOUR + Math.floor(Math.random() * hoursCount);
	}

	private parseState(rawState: string): BotsDayState | null {
		try {
			const parsed = JSON.parse(rawState) as Partial<BotsDayState>;
			if (!parsed || typeof parsed !== "object") {
				return null;
			}

			if (!parsed.scheduledHours || !parsed.tried) {
				return null;
			}

			return {
				scheduledHours: parsed.scheduledHours,
				tried: parsed.tried,
			};
		} catch {
			return null;
		}
	}
}

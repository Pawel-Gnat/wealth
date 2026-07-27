import { Module } from "@nestjs/common";
import { RedisModule } from "../redis-service/redis.module.js";
import { BotsDayStateService } from "./bots-day-state.service.js";

@Module({
	imports: [RedisModule],
	providers: [BotsDayStateService],
	exports: [BotsDayStateService],
})
export class BotsModule {}

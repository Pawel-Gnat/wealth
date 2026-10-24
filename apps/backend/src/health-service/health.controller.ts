import { Controller, Get } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import { HealthService } from "./health.service";

@SkipThrottle()
@Controller()
export class HealthController {
	constructor(private readonly healthService: HealthService) {}

	@Get("health")
	getLiveness() {
		return this.healthService.getLiveness();
	}

	@Get("ready")
	getReadiness() {
		return this.healthService.getReadiness();
	}
}

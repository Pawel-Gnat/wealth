import { Controller, Get, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { SseService } from "./sse.service.js";

@Controller()
export class SseController {
	constructor(private readonly sseService: SseService) {}

	@Get("sse")
	connect(@Req() request: Request, @Res() response: Response) {
		return this.sseService.connect(request, response);
	}
}

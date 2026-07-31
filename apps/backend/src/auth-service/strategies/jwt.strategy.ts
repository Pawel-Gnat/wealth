import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { setUserId } from "@repo/observability/node";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(config: ConfigService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: config.getOrThrow<string>("JWT_SECRET"),
		});
	}

	validate(payload: { sub: string; email: string }) {
		setUserId(payload.sub);

		return {
			userId: payload.sub,
			email: payload.email,
		};
	}
}

import { SetMetadata } from "@nestjs/common";
import { AUTH_THROTTLE_ENABLED } from "./constants";

export const AuthThrottle = () => SetMetadata(AUTH_THROTTLE_ENABLED, true);

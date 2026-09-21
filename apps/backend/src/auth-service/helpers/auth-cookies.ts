import {
	AUTH_COOKIE_PATH,
	REFRESH_COOKIE_NAME,
	SESSION_COOKIE_NAME,
} from "@repo/common/constants";
import type { CookieOptions, Request, Response } from "express";

export type AuthCookieTokens = {
	sessionToken: string;
	refreshToken: string;
	sessionExpiresAt: Date;
	refreshExpiresAt: Date;
};

const getAuthCookieOptions = (isProduction: boolean): CookieOptions => ({
	httpOnly: true,
	secure: isProduction,
	sameSite: isProduction ? "none" : "lax",
	path: AUTH_COOKIE_PATH,
});

export const readAuthCookie = (
	request: Request,
	name: string,
): string | null => {
	const token = request.cookies?.[name];
	if (typeof token !== "string" || token.length === 0) {
		return null;
	}

	return token;
};

export const setAuthCookies = (
	response: Response,
	tokens: AuthCookieTokens,
	isProduction: boolean,
): void => {
	const options = getAuthCookieOptions(isProduction);
	response.cookie(SESSION_COOKIE_NAME, tokens.sessionToken, {
		...options,
		expires: tokens.sessionExpiresAt,
	});
	response.cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, {
		...options,
		expires: tokens.refreshExpiresAt,
	});
};

export const clearAuthCookies = (
	response: Response,
	isProduction: boolean,
): void => {
	const options = getAuthCookieOptions(isProduction);
	response.clearCookie(SESSION_COOKIE_NAME, options);
	response.clearCookie(REFRESH_COOKIE_NAME, options);
};

export const SSE_USER_CHANNEL_PREFIX = "sse:user:";

export const sseUserChannel = (userId: string) =>
	`${SSE_USER_CHANNEL_PREFIX}${userId}`;

export const userIdFromSseChannel = (channel: string) => {
	if (!channel.startsWith(SSE_USER_CHANNEL_PREFIX)) {
		return null;
	}
	const userId = channel.slice(SSE_USER_CHANNEL_PREFIX.length);
	return userId.length > 0 ? userId : null;
};

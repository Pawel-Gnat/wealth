import {
	GenericContainer,
	type StartedTestContainer,
	Wait,
} from "testcontainers";

export type TestRedisContext = {
	connectionUrl: string;
	stop: () => Promise<void>;
};

export const setupTestRedis = async (): Promise<TestRedisContext> => {
	const container: StartedTestContainer = await new GenericContainer(
		"redis:7-alpine",
	)
		.withExposedPorts(6379)
		.withWaitStrategy(Wait.forLogMessage("Ready to accept connections"))
		.start();

	const connectionUrl = `redis://${container.getHost()}:${container.getMappedPort(6379)}`;

	return {
		connectionUrl,
		stop: async () => {
			await container.stop();
		},
	};
};

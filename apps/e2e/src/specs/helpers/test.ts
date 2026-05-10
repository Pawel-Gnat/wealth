import { expect } from "@playwright/test";
import { test as base } from "../fixture/fixture.js";

const test = base.extend<{
	// shared mocks can be added here later
}>({});

export { expect, test };

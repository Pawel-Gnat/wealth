import { setupServer } from "msw/node";

import { HANDLERS } from "./mocks/handlers";

export const server = setupServer(...HANDLERS);

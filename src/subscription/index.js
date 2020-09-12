import { PubSub } from "apollo-server";

import * as MESSAGE_EVENTS from "./message";
import * as USER_EVENTS from "./user";

export const EVENTS = {
  MESSAGE: MESSAGE_EVENTS,
  USER: { ...USER_EVENTS }
};

export default new PubSub();

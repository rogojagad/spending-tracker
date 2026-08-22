import limitService from "../../limit/service.ts";
import { ISpending } from "../../spending/repository.ts";
import { EventType, IEvent, OnEventExecutor } from "./index.ts";

export const eventExecutorMap = new Map<EventType, OnEventExecutor>([
  [
    EventType.SPENDING_CREATED,
    async (event: IEvent<unknown>): Promise<void> => {
      const data = event.data as ISpending;
      await limitService.checkForLimitExceeded(data);
    },
  ],
]);

const kv = await Deno.openKv();

export enum EventType {
  SPENDING_CREATED = "SPENDING_CREATED",
}

export type OnEventExecutor = (
  payload: IEvent<unknown>,
) => Promise<void>;

export interface IEvent<T> {
  type: EventType;
  data: T;
}

const publish = <T>(
  payload: IEvent<T>,
): Promise<Deno.KvCommitResult> => {
  return kv.enqueue(payload);
};

const registerListener = (
  listenerMapper: Map<EventType, OnEventExecutor>,
): void => {
  kv.listenQueue(async (msg: unknown) => {
    const message = msg as IEvent<unknown>;
    const eventType = message.type;

    const executor = listenerMapper.get(eventType);

    if (!executor) {
      console.error(`Unregistered executor for event type ${eventType}`);
      return;
    }

    await executor(message);
  });
};

export default { publish, registerListener };

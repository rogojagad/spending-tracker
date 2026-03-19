export class SpendingTrackerError extends Error {}

export enum ErrorCode {
  INVALID_PAYLOAD = "INVALID_PAYLOAD",
  INVALID_CATEGORY_OR_SOURCE = "INVALID_CATEGORY_OR_SOURCE",
}

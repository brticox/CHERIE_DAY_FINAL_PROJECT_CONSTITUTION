export function notificationIdempotencyKey(
  eventType: string,
  aggregateId: string,
  stateOrVersion?: string,
) {
  return [eventType.trim(), aggregateId.trim(), stateOrVersion?.trim()]
    .filter(Boolean)
    .join(':');
}

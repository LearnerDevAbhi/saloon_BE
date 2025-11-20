import ms, { StringValue } from 'ms';

export const durationToSeconds = (value: string | undefined, fallback: string): number => {
  const resolved = resolveMs(value) ?? resolveMs(fallback) ?? 1000;
  return Math.max(1, Math.floor(resolved / 1000));
};

const resolveMs = (input?: string) => {
  if (!input) {
    return undefined;
  }
  const result = ms(input as StringValue);
  return typeof result === 'number' && !Number.isNaN(result) ? result : undefined;
};


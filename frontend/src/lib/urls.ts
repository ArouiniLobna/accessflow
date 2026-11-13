const SAFE_PROTOCOLS = new Set(["http:", "https:"]);

export function isSafeHttpUrl(value: string): boolean {
  try {
    return SAFE_PROTOCOLS.has(new URL(value).protocol);
  } catch {
    return false;
  }
}

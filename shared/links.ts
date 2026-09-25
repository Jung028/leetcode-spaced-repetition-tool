const LINKABLE_PROTOCOLS = new Set(["http:", "https:", "file:"]);

export const isValidUrl = (value: string) => {
  try {
    const url = new URL(value);
    return LINKABLE_PROTOCOLS.has(url.protocol);
  } catch {
    return false;
  }
};

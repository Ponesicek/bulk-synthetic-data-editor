export const parseFileContentToArray = (text: string) => {
  const trimmed = text.trim();
  if (!trimmed) return [] as unknown[];

  try {
    if (trimmed.startsWith("[")) {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed as unknown[];
    }
  } catch {
    // fall through to JSONL parsing
  }

  return trimmed
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch (err) {
        throw new Error(`Invalid JSON/JSONL line: ${line}`);
      }
    });
};

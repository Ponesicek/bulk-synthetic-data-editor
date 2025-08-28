import type { JsonDataType } from "../types";
import { parseFileContentToArray } from "../utils/parsing";
import { JsonDataSchema } from "../types";

export const importFromFile = async (file: File): Promise<JsonDataType> => {
  const text = await file.text();
  const raw = parseFileContentToArray(text);
  return JsonDataSchema.parse(raw);
};

export const exportToJsonl = (jsonlData: JsonDataType) => {
  const lines = (jsonlData ?? []).map((item) => JSON.stringify(item));
  const content = lines.join("\n");
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "data.jsonl";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export const parseTextToJsonl = (text: string): JsonDataType => {
  const processed = text
    .split("\n")
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        if (line === null || line === "") {
          return null;
        }
        alert("Invalid JSONL format: " + line);
        return null;
      }
    })
    .filter(Boolean);
  return JsonDataSchema.parse(processed);
};
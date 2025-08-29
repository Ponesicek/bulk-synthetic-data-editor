import z from "zod";

export const JsonDataSchema = z.array(
  z.object({
    messages: z
      .array(
        z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string().min(2),
        }),
      )
      .max(2),
  }),
);

export type JsonDataType = z.infer<typeof JsonDataSchema>;

export interface SimilarityResult {
  indices: [number, number];
  similarity: number;
  a: string;
  b: string;
}

export interface EditHandler {
  (rowIndex: number, role: "user" | "assistant", value: string): void;
}

export interface DeleteHandler {
  (rowIndex: number): void;
}

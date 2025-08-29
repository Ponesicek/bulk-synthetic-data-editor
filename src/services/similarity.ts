import { gatewayClient } from "./clients";
import { cosineSimilarity, embedMany } from "ai";
import type { JsonDataType, SimilarityResult } from "../types";

export const computeSimilarity = async (
  jsonlData: JsonDataType,
): Promise<SimilarityResult> => {
  const entries = (jsonlData ?? [])
    .map((item, idx) => ({
      idx,
      content: item.messages.find((m) => m.role === "user")?.content ?? "",
    }))
    .filter((e) => e.content.trim().length > 0);

  if (entries.length < 2) {
    throw new Error("Need at least two user messages to compare.");
  }

  const inputs = entries.map((e) => e.content);
  const response = await embedMany({
    model: gatewayClient.textEmbeddingModel("google/gemini-embedding-001"),
    values: inputs,
  });

  const embeddings = response.embeddings;

  let bestI = 0;
  let bestJ = 1;
  let bestSim = -Infinity;

  for (let i = 0; i < embeddings.length; i++) {
    for (let j = i + 1; j < embeddings.length; j++) {
      const a = embeddings[i];
      const b = embeddings[j];
      const sim = cosineSimilarity(a, b);
      if (sim > bestSim) {
        bestSim = sim;
        bestI = i;
        bestJ = j;
      }
    }
  }

  return {
    indices: [entries[bestI].idx, entries[bestJ].idx],
    similarity: bestSim,
    a: entries[bestI].content,
    b: entries[bestJ].content,
  };
};

import { openaiClient } from "./clients";
import type { JsonDataType, SimilarityResult } from "../types";

export const computeSimilarity = async (jsonlData: JsonDataType): Promise<SimilarityResult> => {
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
  const response = await openaiClient.embeddings.create({
    model: "text-embedding-nomic-embed-text-v1.5",
    input: inputs,
    encoding_format: "float",
  });
  
  const embeddings = response.data.map((d) => d.embedding as number[]);
  const norms = embeddings.map((vec) =>
    Math.sqrt(vec.reduce((acc, v) => acc + v * v, 0))
  );

  let bestI = 0;
  let bestJ = 1;
  let bestSim = -Infinity;

  for (let i = 0; i < embeddings.length; i++) {
    for (let j = i + 1; j < embeddings.length; j++) {
      const a = embeddings[i];
      const b = embeddings[j];
      let dot = 0;
      for (let k = 0; k < a.length; k++) dot += a[k] * b[k];
      const sim = dot / (norms[i] * norms[j] || 1);
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
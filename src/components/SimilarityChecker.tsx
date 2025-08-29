import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { computeSimilarity } from "../services/similarity";
import type { JsonDataType } from "../types";
import { useState } from "react";

interface SimilarityCheckerProps {
  jsonlData: JsonDataType | undefined;
}

export const SimilarityChecker = ({ jsonlData }: SimilarityCheckerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const handleSimilarityCheck = async () => {
    if (!jsonlData) {
      toast.error("No data to check.");
      return;
    }

    try {
      setIsLoading(true);
      const result = await computeSimilarity(jsonlData);
      if (result.similarity > 0.9) {
        toast.error(
          "Highly similar pair found:\n" +
            JSON.stringify(result.a) +
            " and " +
            JSON.stringify(result.b) +
            "\nWith similarity: " +
            result.similarity,
        );
      } else {
        toast.success(
          "No similar pair found (biggest similarity: " +
            result.similarity +
            ").",
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to compute embeddings. See console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleSimilarityCheck} disabled={isLoading}>
      Check for similarity using embeddings
    </Button>
  );
};

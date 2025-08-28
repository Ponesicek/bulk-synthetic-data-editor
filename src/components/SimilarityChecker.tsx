import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { computeSimilarity } from "../services/similarity";
import type { JsonDataType } from "../types";

interface SimilarityCheckerProps {
  jsonlData: JsonDataType | undefined;
}

export const SimilarityChecker = ({ jsonlData }: SimilarityCheckerProps) => {
  const handleSimilarityCheck = async () => {
    if (!jsonlData) {
      toast.error("No data to check.");
      return;
    }

    try {
      const result = await computeSimilarity(jsonlData);
      if (result.similarity > 0.9) {
        toast.error(
          "Highly similar pair found:\n" + 
          JSON.stringify(result.a) + " and " + 
          JSON.stringify(result.b) + 
          "\nWith similarity: " + result.similarity
        );
      } else {
        toast.success("No similar pair found (biggest similarity: " + result.similarity + ").");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to compute embeddings. See console for details.");
    }
  };

  return (
    <Button onClick={handleSimilarityCheck}>
      Check for similarity using embeddings
    </Button>
  );
};
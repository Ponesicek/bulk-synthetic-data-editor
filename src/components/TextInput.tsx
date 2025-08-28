import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { parseTextToJsonl } from "../services/fileOperations";
import type { JsonDataType } from "../types";
import { FileOperations } from "./FileOperations";
import { AiGenerationDialog } from "./AiGenerationDialog";

interface TextInputProps {
  onAddData: (data: JsonDataType) => void;
}

export const TextInput = ({ onAddData }: TextInputProps) => {
  const [jsonData, setJsonData] = useState<string>("");

  const handleAddData = () => {
    if (jsonData) {
      try {
        const parsed = parseTextToJsonl(jsonData);
        onAddData(parsed);
        setJsonData("");
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        alert("Failed to parse data: " + message);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <Textarea
        rows={10}
        cols={50}
        wrap="off"
        placeholder="Paste your JSONL data here..."
        onChange={(e) => setJsonData(e.target.value)}
        value={jsonData}
      />
      <div className="flex flex-row gap-2 my-2 justify-between w-full">
        <div className="flex flex-row gap-2">
          <FileOperations onAddData={onAddData} />
          <AiGenerationDialog onAddData={onAddData} />
        </div>
        <Button onClick={handleAddData}>
          Add Data
        </Button>
      </div>
    </div>
  );
};
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { importFromFile } from "../services/fileOperations";
import type { JsonDataType } from "../types";

interface FileOperationsProps {
  onAddData: (data: JsonDataType) => void;
}

export const FileOperations = ({ onAddData }: FileOperationsProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const onImportFile = async (file: File) => {
    try {
      const parsed = await importFromFile(file);
      onAddData(parsed);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert("Failed to import file: " + message);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".jsonl,.json,.ndjson,application/json,text/plain"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onImportFile(file);
        }}
      />
      <Button onClick={() => fileInputRef.current?.click()}>
        Import from file
      </Button>
    </>
  );
};

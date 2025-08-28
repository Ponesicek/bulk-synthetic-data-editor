import { TextInput } from "./components/TextInput";
import { FileOperations } from "./components/FileOperations";
import { AiGenerationDialog } from "./components/AiGenerationDialog";
import type { JsonDataType } from "./types";

interface LoadJsonlProps {
  onAddData: (data: JsonDataType) => void;
}

export default function LoadJsonl({ onAddData }: LoadJsonlProps) {
  return (
    <div className="flex flex-col items-center justify-center">
      <TextInput onAddData={onAddData} />
      <div className="flex flex-row gap-2 my-2 justify-between w-full">
        <div className="flex flex-row gap-2">
          <FileOperations onAddData={onAddData} />
          <AiGenerationDialog onAddData={onAddData} />
        </div>
      </div>
    </div>
  );
}

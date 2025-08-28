import { TextInput } from "./components/TextInput";
import type { JsonDataType } from "./types";

interface LoadJsonlProps {
  onAddData: (data: JsonDataType) => void;
}

export default function LoadJsonl({ onAddData }: LoadJsonlProps) {
  return (
    <div className="flex flex-col items-center justify-center">
      <TextInput onAddData={onAddData} />
    </div>
  );
}

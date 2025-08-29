import { Button } from "@/components/ui/button";
import { exportToJsonl } from "../services/fileOperations";
import type { JsonDataType } from "../types";

interface DataExporterProps {
  jsonlData: JsonDataType | undefined;
}

export const DataExporter = ({ jsonlData }: DataExporterProps) => {
  const handleExport = () => {
    if (!jsonlData) {
      alert("No data to export.");
      return;
    }

    try {
      exportToJsonl(jsonlData);
    } catch (err) {
      console.error(err);
      alert("Failed to export JSONL.");
    }
  };

  return <Button onClick={handleExport}>Download</Button>;
};

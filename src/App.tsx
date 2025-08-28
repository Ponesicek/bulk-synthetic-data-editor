import { useMemo } from "react";
import "./App.css";
import LoadJsonl from "./loadJsonl";
import { DataTable } from "./components/data-table";
import { getColumns } from "./components/column";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useJsonlData } from "./hooks/useJsonlData";
import { SimilarityChecker } from "./components/SimilarityChecker";
import { DataExporter } from "./components/DataExporter";

function App() {
  const { jsonlData, onEdit, onDelete, clearAll, addData } = useJsonlData();

  const columns = useMemo(() => getColumns(onEdit, onDelete), [onEdit, onDelete]);

  return (
    <div className="mx-auto flex flex-col pt-1">
      <h1 className="text-2xl font-bold">Welcome to Synthetic Data Bulk Editor</h1>
      <p className="mt-4 text-lg mb-2">
        Your go-to solution for synthetic data bulk editing.
      </p>
      <LoadJsonl onAddData={addData} />
      {jsonlData && <DataTable columns={columns} data={jsonlData} />}
      <div className="flex flex-row gap-2 justify-between mt-4">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button>Clear All</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete all
                data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={clearAll}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <div className="flex flex-row gap-2">
          <SimilarityChecker jsonlData={jsonlData} />
          <DataExporter jsonlData={jsonlData} />
        </div>
      </div>
    </div>
  );
}

export default App;

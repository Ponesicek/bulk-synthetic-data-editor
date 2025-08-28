import { useCallback, useMemo, useState } from "react";
import "./App.css";
import { JsonDataSchema } from "./loadJsonl";
import LoadJsonl from "./loadJsonl";
import z from "zod";
import { DataTable } from "./components/data-table";
import { getColumns } from "./components/column";

function App() {
  const [jsonlData, setJsonlData] = useState<
    z.infer<typeof JsonDataSchema> | undefined
  >();

  const onEdit = useCallback(
    (rowIndex: number, role: "user" | "assistant", value: string) => {
      setJsonlData((prev) => {
        if (!prev) return prev;
        const next = [...prev];
        const item = { ...next[rowIndex] };
        const messages = [...item.messages];
        const idx = messages.findIndex((m) => m.role === role);
        if (idx >= 0) {
          messages[idx] = { ...messages[idx], content: value };
        } else {
          messages.push({ role, content: value });
        }
        item.messages = messages;
        next[rowIndex] = item;
        return next;
      });
    },
    [],
  );

  const columns = useMemo(() => getColumns(onEdit), [onEdit]);

  return (
    <div className="mx-auto flex flex-col pt-1">
      <h1 className="text-2xl font-bold">Welcome to FineTuneEditor</h1>
      <p className="mt-4 text-lg">
        Your go-to solution for fine-tuning language models.
      </p>
      <LoadJsonl Jsonl={jsonlData} setJsonl={setJsonlData} />
      {jsonlData && <DataTable columns={columns} data={jsonlData} />}
    </div>
  );
}

export default App;

import { useCallback, useMemo, useState } from "react";
import "./App.css";
import { JsonDataSchema } from "./loadJsonl";
import LoadJsonl from "./loadJsonl";
import z from "zod";
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
import OpenAI from "openai";
const client = new OpenAI(
  {
    baseURL: "http://localhost:1234/v1",
    apiKey: "1234567890",
    dangerouslyAllowBrowser: true
  }
);

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

  const onDelete = useCallback(
    (rowIndex: number) => {
      setJsonlData((prev) => {
        if (!prev) return prev;
        const next = [...prev];
        next.splice(rowIndex, 1);
        return next;
      });
    },
    [],
  );

  const columns = useMemo(() => getColumns(onEdit, onDelete), [onEdit, onDelete]);

  return (
    <div className="mx-auto flex flex-col pt-1">
      <h1 className="text-2xl font-bold">Welcome to Synthetic Data Bulk Editor</h1>
      <p className="mt-4 text-lg mb-2">
        Your go-to solution for synthetic data bulk editing.
      </p>
      <LoadJsonl Jsonl={jsonlData} setJsonl={setJsonlData} />
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
              <AlertDialogAction
                onClick={() => {
                  setJsonlData(undefined);
                }}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <div className="flex flex-row gap-2">
          <Button onClick={async () => {
            try {
              const entries = (jsonlData ?? [])
                .map((item, idx) => ({
                  idx,
                  content:
                    item.messages.find((m) => m.role === "user")?.content ?? "",
                }))
                .filter((e) => e.content.trim().length > 0);

              if (entries.length < 2) {
                alert("Need at least two user messages to compare.");
                return;
              }

              const inputs = entries.map((e) => e.content);
              const response = await client.embeddings.create({
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

              const result = {
                indices: [entries[bestI].idx, entries[bestJ].idx],
                similarity: bestSim,
                a: entries[bestI].content,
                b: entries[bestJ].content,
              };
              console.log("Most similar pair by cosine similarity:", result);
            } catch (err) {
              console.error(err);
              alert("Failed to compute embeddings. See console for details.");
            }
          }}>Check for similarity using embeddings</Button>
          <Button>Download</Button>
        </div>
      </div>
    </div>
  );
}

export default App;

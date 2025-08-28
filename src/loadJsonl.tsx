import z from "zod";
import { useState } from "react";
import { Button } from "./components/ui/button";
import { Textarea } from "./components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogFooter, AlertDialogDescription, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./components/ui/alert-dialog";
import { generateObject } from "ai";
import { createGateway } from "@ai-sdk/gateway";
import { DataTable } from "./components/data-table";
import { useCallback, useMemo, useRef } from "react";
import { getColumns } from "./components/column";
import { Input } from "./components/ui/input";

const client = createGateway(
  {
    apiKey: import.meta.env.VITE_API_GATEWAY,
  }
);
export const JsonDataSchema = z.array(
  z.object({
    messages: z.array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(2),
      }),
    ).max(2),
  }),
);

export default function LoadJsonl({
  Jsonl,
  setJsonl,
}: {
  Jsonl: z.infer<typeof JsonDataSchema> | undefined;
  setJsonl: (data: z.infer<typeof JsonDataSchema> | undefined) => void;
}) {
  const [jsonData, setJsonData] = useState<string>();
  const [prompt, setPrompt] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<z.infer<typeof JsonDataSchema> | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [modelString, setModelString] = useState<string>("openai/gpt-4o");
  const [pairCount, setPairCount] = useState<number | undefined>(undefined);
  const parseFileContentToArray = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return [] as unknown[];
    try {
      if (trimmed.startsWith("[")) {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed as unknown[];
      }
    } catch {
      // fall through to JSONL parsing
    }
    return trimmed
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch (err) {
          throw new Error(`Invalid JSON/JSONL line: ${line}`);
        }
      });
  };

  const onImportFile = async (file: File) => {
    try {
      const text = await file.text();
      const raw = parseFileContentToArray(text);
      const parsed = JsonDataSchema.parse(raw);
      if (Jsonl) {
        setJsonl([...Jsonl, ...parsed]);
      } else {
        setJsonl(parsed);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert("Failed to import file: " + message);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };
  const onEdit = useCallback(
    (rowIndex: number, role: "user" | "assistant", value: string) => {
      setResult((prev) => {
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
      setResult((prev) => {
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
    <div className="flex flex-col items-center justify-center">
      <Textarea
        rows={10}
        cols={50}
        wrap="off"
        placeholder="Paste your JSONL data here..."
        onChange={(e) => {
          setJsonData(e.target.value);
        }}
        value={jsonData}
      />
      <div className="flex flex-row gap-2 my-2 justify-between w-full">
        <div className="flex flex-row gap-2">
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
        <Button
          onClick={() => {
            fileInputRef.current?.click();
          }}
        >
          Import from file
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button>Generate using AI</Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="min-w-[1280px]">
            <AlertDialogHeader>
              <AlertDialogTitle>Generate using AI</AlertDialogTitle>
              <AlertDialogDescription>
                <p className="text-sm text-gray-500 mb-2">You can generate data using AI, enter your prompt below.</p>
                {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
                {result ? <DataTable data={result} columns={columns} /> : 
                <div className="flex flex-col gap-2">
                <div className="flex flex-row gap-2">
                <Input
                  placeholder="Model"
                  value={modelString}
                  className="flex-[2]"
                  onChange={(e) => {
                    setModelString(e.target.value);
                  }}
                />
                <Input
                  type="number"
                  placeholder="Pair Count (passed to the model, can be wrong)"
                  value={pairCount}
                  className="flex-[1]"
                  onChange={(e) => {
                    setPairCount(parseInt(e.target.value));
                  }}
                />
                </div>
                <Textarea
                  rows={10}
                  cols={50}
                  wrap="off"
                  placeholder="Enter your prompt here..."
                  onChange={(e) => {
                    setPrompt(e.target.value);
                  }}
                />
                </div>}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              {result ? <AlertDialogAction onClick={() => {
                if (Jsonl) {
                  setJsonl([...Jsonl, ...result]);
                } else {
                  setJsonl(result);
                }
                setResult(undefined);
                setJsonData("");
                setPrompt("");
                setError(null);
              }}>Add Data</AlertDialogAction> :
              isLoading ? <AlertDialogAction disabled>Generating...</AlertDialogAction> :
              <AlertDialogAction
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const model = client(modelString);
                  if (prompt) {
                    try {
                    setIsLoading(true);
                    setError(null);
                    setResult(undefined);
                    const {object} = await generateObject({
                      model,
                      schema: z.object({
                        data: JsonDataSchema,
                      }),
                      system: "You are a synthetic data generator. You will be given a prompt and you will generate a list of messages. Generate " + pairCount + " pairs of messages.",
                      prompt,
                    });
                    setResult(object.data);
                    setIsLoading(false);
                    setError(null);
                    } catch (err) {
                      setError(err instanceof Error ? err.message : String(err));
                    } finally {
                      setIsLoading(false);
                    }
                  } else {
                    setError("No prompt provided");
                  }
                }}
                >
                  Generate
                </AlertDialogAction>
              }
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        </div>
        <Button
          onClick={() => {
            if (jsonData) {
              const processed = jsonData
                .split("\n")
                .map((line) => {
                  try {
                    return JSON.parse(line);
                  } catch {
                    if (line === null || line === "") {
                      return null;
                    }
                    alert("Invalid JSONL format: " + line);
                    return null;
                  }
                })
                .filter(Boolean);
              const parsed = JsonDataSchema.parse(processed);
              if (Jsonl) {
                setJsonl([...Jsonl, ...parsed]);
              } else {
                setJsonl(parsed);
              }
              setJsonData("");
            }
          }}
        >
          Add Data
        </Button>
      </div>
    </div>
  );
}

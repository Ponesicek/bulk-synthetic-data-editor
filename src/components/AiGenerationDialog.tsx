import { useState, useCallback, useMemo } from "react";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogDescription,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { generateObject } from "ai";
import { gatewayClient } from "../services/clients";
import { DataTable } from "./data-table";
import { getColumns } from "./column";
import { JsonDataSchema, type JsonDataType } from "../types";

interface AiGenerationDialogProps {
  onAddData: (data: JsonDataType) => void;
}

export const AiGenerationDialog = ({ onAddData }: AiGenerationDialogProps) => {
  const [prompt, setPrompt] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<JsonDataType | undefined>(undefined);
  const [modelString, setModelString] = useState<string>("openai/gpt-4o");
  const [pairCount, setPairCount] = useState<number | undefined>(undefined);

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

  const handleGenerate = async () => {
    if (!prompt) {
      setError("No prompt provided");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setResult(undefined);
      
      const model = gatewayClient(modelString);
      const { object } = await generateObject({
        model,
        schema: z.object({
          data: JsonDataSchema,
        }),
        system: "You are a synthetic data generator. You will be given a prompt and you will generate a list of messages. Generate " + pairCount + " pairs of messages.",
        prompt,
      });
      
      setResult(object.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddData = () => {
    if (result) {
      onAddData(result);
      setResult(undefined);
      setPrompt("");
      setError(null);
    }
  };

  const resetDialog = () => {
    setResult(undefined);
    setPrompt("");
    setError(null);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>Generate using AI</Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="min-w-[1280px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Generate using AI</AlertDialogTitle>
          <AlertDialogDescription>
            <p className="text-sm text-gray-500 mb-2">
              You can generate data using AI, enter your prompt below.
            </p>
            {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
            {result ? (
              <DataTable data={result} columns={columns} />
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex flex-row gap-2">
                  <Input
                    placeholder="Model"
                    value={modelString}
                    className="flex-[2]"
                    onChange={(e) => setModelString(e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Pair Count (passed to the model, can be wrong)"
                    value={pairCount}
                    className="flex-[1]"
                    onChange={(e) => setPairCount(parseInt(e.target.value))}
                  />
                </div>
                <Textarea
                  rows={10}
                  cols={50}
                  wrap="off"
                  placeholder="Enter your prompt here..."
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={resetDialog}>Cancel</AlertDialogCancel>
          {result ? (
            <AlertDialogAction onClick={handleAddData}>
              Add Data
            </AlertDialogAction>
          ) : isLoading ? (
            <AlertDialogAction disabled>Generating...</AlertDialogAction>
          ) : (
            <AlertDialogAction onClick={handleGenerate}>
              Generate
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
import z from "zod";
import { useState } from "react";
import { Button } from "./components/ui/button";
import { Textarea } from "./components/ui/textarea";
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
//{"messages": [{"role": "user", "content": "Hey there! How are you doing today?"}, {"role": "assistant", "content": "Oh! H-hi there... :3 I'm doing okay, I guess? Just been kinda quiet today, hehe... How are you? I hope you're having a better day than me... >.<"}]}
export const JsonDataSchema = z.array(
  z.object({
    messages: z.array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(2).max(1000),
      }),
    ),
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
                  setJsonl(undefined);
                }}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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

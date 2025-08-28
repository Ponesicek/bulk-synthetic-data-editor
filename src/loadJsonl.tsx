import z from "zod";
import { useState } from "react";
import { Button } from "./components/ui/button";
import { Textarea } from "./components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogFooter, AlertDialogDescription, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./components/ui/alert-dialog";
import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const client = createOpenAI(
  {
    //baseURL: "http://localhost:1234/v1",
    apiKey: "",
  }
);
const model = client("gpt-4o-2024-08-06")
export const JsonDataSchema = z.array(
  z.object({
    messages: z.array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(2),
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
  const [prompt, setPrompt] = useState<string>();
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
        <Button>Import from file</Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button>Generate using AI</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Generate using AI</AlertDialogTitle>
              <AlertDialogDescription>
                <p className="text-sm text-gray-500 mb-2">You can generate data using AI, enter your prompt below.</p>
                <Textarea
                  rows={10}
                  cols={50}
                  wrap="off"
                  placeholder="Enter your prompt here..."
                  onChange={(e) => {
                    setPrompt(e.target.value);
                  }}
                />
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (prompt) {
                    const {object} = await generateObject({
                      model,
                      schema: z.object({
                        data: JsonDataSchema,
                      }),
                      prompt,
                    });
                    console.log(JSON.stringify(object, null, 2));
                  }
                }}
              >
                Continue
              </AlertDialogAction>
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

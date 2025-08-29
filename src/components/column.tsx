"use client";
import { JsonDataSchema } from "../types";
import { type ColumnDef } from "@tanstack/react-table";
import z from "zod";
import { XIcon } from "lucide-react";
import { Button } from "./ui/button";

type JsonDataItem = z.infer<typeof JsonDataSchema>[number];

type Role = "user" | "assistant";

export function getColumns(
  onEdit: (rowIndex: number, role: Role, value: string) => void,
  onDelete: (rowIndex: number) => void,
): ColumnDef<JsonDataItem>[] {
  return [
    {
      id: "select",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(row.index)}
          >
            <XIcon />
          </Button>
        </div>
      ),
    },
    {
      id: "user",
      accessorFn: (row) => {
        const msg = row.messages.find((m) => m.role === "user");
        return msg ? msg.content : "";
      },
      header: "User",
      cell: ({ row }) => {
        const messages = row.original.messages;
        const userMessage = messages.find((msg) => msg.role === "user");
        return (
          <textarea
            className="h-10 w-full focus:outline-none resize-none px-2"
            wrap="off"
            placeholder="No user message"
            value={userMessage ? userMessage.content : ""}
            onChange={(e) => onEdit(row.index, "user", e.target.value)}
          />
        );
      },
    },
    {
      id: "assistant",
      accessorFn: (row) => {
        const msg = row.messages.find((m) => m.role === "assistant");
        return msg ? msg.content : "";
      },
      header: "Assistant",
      cell: ({ row }) => {
        const messages = row.original.messages;
        const assistantMessage = messages.find(
          (msg) => msg.role === "assistant",
        );
        return (
          <textarea
            className="h-10 w-full focus:outline-none resize-none px-2"
            wrap="off"
            placeholder="No assistant message"
            value={assistantMessage ? assistantMessage.content : ""}
            onChange={(e) => onEdit(row.index, "assistant", e.target.value)}
          />
        );
      },
    },
  ];
}

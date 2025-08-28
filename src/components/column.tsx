"use client";
import { JsonDataSchema } from "@/loadJsonl";
import { type ColumnDef } from "@tanstack/react-table";
import z from "zod";

type JsonDataItem = z.infer<typeof JsonDataSchema>[number];

type Role = "user" | "assistant";

export function getColumns(
  onEdit: (rowIndex: number, role: Role, value: string) => void,
): ColumnDef<JsonDataItem>[] {
  return [
    {
      id: "user",
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

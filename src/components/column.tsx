"use client"
import { JsonDataSchema } from "@/loadJsonl"
import { type ColumnDef } from "@tanstack/react-table"
import z from "zod"

type JsonDataItem = z.infer<typeof JsonDataSchema>[number]

export const columns: ColumnDef<JsonDataItem>[] = [
  {
    id: "user",
    header: "User",
    cell: ({ row }) => {
      const messages = row.original.messages
      const userMessage = messages.find(msg => msg.role === "user")
      return userMessage ? userMessage.content : "No user message"
    },
  },
  {
    id: "assistant",
    header: "Assistant",
    cell: ({ row }) => {
      const messages = row.original.messages
      const assistantMessage = messages.find(msg => msg.role === "assistant")
      return assistantMessage ? assistantMessage.content : "No assistant message"
    },
  }
]
import { useCallback, useState } from "react";
import type { JsonDataType, EditHandler, DeleteHandler } from "../types";

export const useJsonlData = () => {
  const [jsonlData, setJsonlData] = useState<JsonDataType | undefined>();

  const onEdit: EditHandler = useCallback(
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

  const onDelete: DeleteHandler = useCallback((rowIndex: number) => {
    setJsonlData((prev) => {
      if (!prev) return prev;
      const next = [...prev];
      next.splice(rowIndex, 1);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setJsonlData(undefined);
  }, []);

  const addData = useCallback((newData: JsonDataType) => {
    setJsonlData((prev) => {
      if (prev) {
        return [...prev, ...newData];
      } else {
        return newData;
      }
    });
  }, []);

  const setData = useCallback((data: JsonDataType | undefined) => {
    setJsonlData(data);
  }, []);

  return {
    jsonlData,
    onEdit,
    onDelete,
    clearAll,
    addData,
    setData,
  };
};

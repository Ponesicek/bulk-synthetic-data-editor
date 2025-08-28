import OpenAI from "openai";
import { createGateway } from "@ai-sdk/gateway";

export const openaiClient = new OpenAI({
  baseURL: "http://localhost:1234/v1",
  apiKey: "1234567890",
  dangerouslyAllowBrowser: true
});

export const gatewayClient = createGateway({
  apiKey: import.meta.env.VITE_API_GATEWAY,
});
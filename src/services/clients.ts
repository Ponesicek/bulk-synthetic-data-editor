import { createGateway } from "@ai-sdk/gateway";

export const gatewayClient = createGateway({
  baseURL: 
    typeof window !== "undefined" && location.origin
      ? "/api/gateway/v1/ai"
      : "https://ai-gateway.vercel.sh/v1/ai",
  apiKey: import.meta.env.VITE_API_GATEWAY,
});
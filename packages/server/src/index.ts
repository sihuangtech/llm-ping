import cors from "@fastify/cors";
import { checkProvider, exportCsv, exportHtml, exportJson, exportMarkdown, listProviderCapabilities } from "@llm-ping/core";
import { providerConfigSchema } from "@llm-ping/shared";
import Fastify from "fastify";
import { z } from "zod";

import { Store } from "./store.js";

const store = new Store(process.env.LLM_PING_DB ?? "llm-ping.db");
const app = Fastify({ logger: true });

await app.register(cors, { origin: true });

app.get("/health", async () => ({ ok: true, name: "llm-ping-server" }));

app.get("/providers/capabilities", async () => listProviderCapabilities());

app.get("/providers", async () => store.listProviders());

app.post("/providers", async (request) => {
  const provider = providerConfigSchema.parse(request.body);
  return store.upsertProvider(provider);
});

app.delete("/providers/:id", async (request) => {
  const params = z.object({ id: z.string() }).parse(request.params);
  store.deleteProvider(params.id);
  return { ok: true };
});

app.post("/checks/:id", async (request, reply) => {
  const params = z.object({ id: z.string() }).parse(request.params);
  const provider = store.listProviders().find((item) => item.id === params.id);
  if (!provider) return reply.code(404).send({ error: "Provider not found" });
  const result = await checkProvider(provider);
  store.saveResult(result);
  return result;
});

app.post("/checks", async () => {
  const results = await Promise.all(store.listProviders().filter((provider) => provider.enabled).map((provider) => checkProvider(provider)));
  for (const result of results) store.saveResult(result);
  return results;
});

app.get("/history", async (request) => {
  const query = z.object({ limit: z.coerce.number().int().positive().max(1000).default(200) }).parse(request.query);
  return store.listResults(query.limit);
});

app.get("/export", async (request, reply) => {
  const query = z.object({ format: z.enum(["json", "csv", "markdown", "html"]).default("json") }).parse(request.query);
  const results = store.listResults(1000);
  const body =
    query.format === "csv"
      ? exportCsv(results)
      : query.format === "markdown"
        ? exportMarkdown(results)
        : query.format === "html"
          ? exportHtml(results)
          : exportJson(results);
  const contentType = query.format === "html" ? "text/html" : "text/plain";
  return reply.type(contentType).send(body);
});

const port = Number(process.env.PORT ?? 4545);
await app.listen({ host: "127.0.0.1", port });

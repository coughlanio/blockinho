import { serve } from "bun";
import { join } from "node:path";
import index from "./index.html";

// Constants
const FILE_PREFIX = "blockinho";
const URL_PATTERN =
  /^(\*\.)?([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$|^\/.*\/[gimuy]*$/;
const CONFIG_DIR = process.env.CONFIG_DIR || ".";
const BLOCKY_URL = process.env.BLOCKY_URL || "http://localhost:4000";

// Constants
const server = serve({
  routes: {
    "/*": index,

    "/api/list": {
      async GET(): Promise<Response> {
        const response: { allow: string[]; deny: string[] } = {
          allow: [],
          deny: [],
        };

        await Promise.all(
          ["allow", "deny"].map(async (mode) => {
            const file = Bun.file(
              join(CONFIG_DIR, `${FILE_PREFIX}-${mode}.txt`),
            );
            if (await file.exists()) {
              const contents = await file.text();
              response[mode as keyof typeof response] = contents
                .trim()
                .split("\n")
                .filter((line) => line.length > 0);
            }
          }),
        );

        return Response.json(response);
      },

      async PUT(req): Promise<Response> {
        const data = await req.json();

        await Promise.all(
          ["allow", "deny"].map(async (mode) => {
            const file = Bun.file(
              join(CONFIG_DIR, `${FILE_PREFIX}-${mode}.txt`),
            );
            await Bun.write(file, data[mode].join("\n"));
          }),
        );

        return Response.json({ success: true });
      },
    },

    "/api/status": {
      async GET(): Promise<Response> {
        return fetch(`${BLOCKY_URL}/api/blocking/status`);
      },
    },

    "/api/disable": {
      async POST(req): Promise<Response> {
        const { duration } = await req.json();
        const url = `${BLOCKY_URL}/api/blocking/disable`;
        const params = duration ? `?duration=${duration}` : "";
        return fetch(url + params);
      },
    },

    "/api/enable": {
      async POST(): Promise<Response> {
        return fetch(`${BLOCKY_URL}/api/blocking/enable`);
      },
    },

    "/api/refresh": {
      async POST(): Promise<Response> {
              console.log('hi');

        return fetch(`${BLOCKY_URL}/api/lists/refresh`, {
          method: "POST",
        });
      },
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);

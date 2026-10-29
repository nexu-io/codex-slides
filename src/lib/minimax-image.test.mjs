import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  buildMiniMaxImageRequest,
  generateMiniMaxImage,
  miniMaxImageOptionsFromEnv,
  parseMiniMaxImageResponse,
} from "./minimax-image.ts";

function jsonResponse(value) {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

test("builds a global aspect-ratio request with required fields", async () => {
  const calls = [];
  const imageBytes = Buffer.from("global-image");
  const bytes = await generateMiniMaxImage("Draw a title slide", {
    apiKey: "local-test-key",
    fetchImpl: async (url, init) => {
      calls.push({ url: String(url), init });
      return jsonResponse({
        base_resp: { status_code: 0 },
        data: { image_urls: [imageBytes.toString("base64")] },
      });
    },
    aspectRatio: "16:9",
  });

  assert.deepEqual(bytes, imageBytes);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://api.minimax.io/v1/image_generation");
  assert.equal(calls[0].init.headers.Authorization, "Bearer local-test-key");
  assert.deepEqual(JSON.parse(calls[0].init.body), {
    model: "image-01",
    prompt: "Draw a title slide",
    response_format: "base64",
    aspect_ratio: "16:9",
  });
});

test("uses the China endpoint, live model, explicit dimensions, and URL output", async () => {
  const calls = [];
  const imageBytes = Buffer.from("china-image");
  const bytes = await generateMiniMaxImage("Draw a product slide", {
    apiKey: "local-test-key",
    region: "cn_zh",
    model: "image-01-live",
    responseFormat: "url",
    width: 1200,
    height: 800,
    fetchImpl: async (url, init) => {
      calls.push({ url: String(url), init });
      if (calls.length === 1) {
        return jsonResponse({
          base_resp: { status_code: 0 },
          data: { image_urls: ["https://images.example.test/generated.png"] },
        });
      }
      return new Response(imageBytes, { status: 200 });
    },
  });

  assert.deepEqual(bytes, imageBytes);
  assert.equal(calls[0].url, "https://api.minimaxi.com/v1/image_generation");
  assert.deepEqual(JSON.parse(calls[0].init.body), {
    model: "image-01-live",
    prompt: "Draw a product slide",
    response_format: "url",
    width: 1200,
    height: 800,
  });
  assert.equal(calls[1].url, "https://images.example.test/generated.png");
});

test("encodes subject references for image-to-image requests", () => {
  const request = buildMiniMaxImageRequest("Preserve the subject", {
    apiKey: "local-test-key",
    subjectReference: [Buffer.from("reference-image")],
  });
  const body = JSON.parse(request.init.body);
  assert.deepEqual(body.subject_reference, [{
    type: "character",
    image_file: `data:image/png;base64,${Buffer.from("reference-image").toString("base64")}`,
  }]);
});

test("enables reference loading for the MiniMax image provider", () => {
  const source = readFileSync(new URL("./image.ts", import.meta.url), "utf8");
  assert.match(source, /provider === "codex" \|\| provider === "minimax"/);
});

test("decodes a data URL response", async () => {
  const imageBytes = Buffer.from("data-url-image");
  const result = await parseMiniMaxImageResponse({
    base_resp: { status_code: 0 },
    data: { image_urls: ["data:image/png;base64," + imageBytes.toString("base64")] },
  });
  assert.deepEqual(result, imageBytes);
});

test("reads the supported backend settings from the environment", () => {
  const options = miniMaxImageOptionsFromEnv({
    MINIMAX_API_KEY: "local-test-key",
    MINIMAX_API_REGION: "cn_zh",
    MINIMAX_IMAGE_MODEL: "image-01-live",
    MINIMAX_IMAGE_RESPONSE_FORMAT: "url",
    MINIMAX_IMAGE_WIDTH: "1200",
    MINIMAX_IMAGE_HEIGHT: "800",
  });
  assert.equal(options.apiKey, "local-test-key");
  assert.equal(options.region, "cn_zh");
  assert.equal(options.model, "image-01-live");
  assert.equal(options.responseFormat, "url");
  assert.equal(options.width, 1200);
  assert.equal(options.height, 800);
});

test("rejects unsupported models and incomplete dimensions", () => {
  assert.throws(
    () => buildMiniMaxImageRequest("prompt", { apiKey: "local-test-key", model: "unknown-model" }),
    /Unsupported MiniMax image model/,
  );
  assert.throws(
    () => buildMiniMaxImageRequest("prompt", { apiKey: "local-test-key", width: 1200 }),
    /width and height must be provided together/,
  );
});

test("surfaces a non-zero API status", async () => {
  await assert.rejects(
    () => parseMiniMaxImageResponse({
      base_resp: { status_code: 1001 },
      data: { image_urls: [] },
    }),
    /status code 1001/,
  );
});

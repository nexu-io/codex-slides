import assert from "node:assert/strict";
import test from "node:test";
import { getCodexResponsesModel } from "./codexModel.ts";
import { sseEvents } from "./responseStream.ts";

test("Codex Responses model can be overridden, with a supported default", () => {
  assert.equal(
    getCodexResponsesModel({ CODEX_SLIDES_CODEX_MODEL: "gpt-6-luna" }),
    "gpt-6-luna",
  );
  assert.equal(getCodexResponsesModel({}), "gpt-6-luna");
  assert.equal(getCodexResponsesModel({ CODEX_SLIDES_CODEX_MODEL: "  " }), "gpt-6-luna");
});

test("an active Responses stream is cancelled when its project run is stopped", async () => {
  const encoder = new TextEncoder();
  let streamCancelled = false;
  const body = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode('data: {"type":"response.output_text.delta","delta":"hello"}\n\n'));
    },
    cancel() {
      streamCancelled = true;
    },
  });
  const controller = new AbortController();
  const events = sseEvents(new Response(body), controller.signal);

  assert.deepEqual(await events.next(), {
    done: false,
    value: { type: "response.output_text.delta", delta: "hello" },
  });

  controller.abort();
  await assert.rejects(events.next(), (error) => error?.name === "AbortError");
  assert.equal(streamCancelled, true);
});

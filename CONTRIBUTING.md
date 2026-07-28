# Contributing to Codex Slides

Thank you for helping make presentation work more visible, steerable, and
agent-native.

## Before you start

- Search existing issues and pull requests.
- Open an issue before a large architectural or product change.
- Keep the Browser-first invariant: normal deck creation opens Codex Slides
  before research, outlining, or rendering begins.
- Never commit private project data, uploaded source files, generated decks, or
  authentication material.

## Development setup

Requirements:

- Node.js 20+
- npm or pnpm
- Codex authenticated with `codex login`

```bash
git clone https://github.com/nexu-io/codex-slides.git
cd codex-slides
pnpm install
pnpm dev:web
```

Open <http://127.0.0.1:4311>.

## Choose the right layer

| Change | Primary files |
|---|---|
| Homepage or project UI | `src/app/`, `src/components/`, `src/app/globals.css` |
| Product copy or locales | `src/i18n/locales/` |
| Project persistence | `src/lib/store.ts`, `src/lib/types.ts`, project API routes |
| Generation or editing behavior | `src/lib/pipeline.ts`, prompt and chat modules |
| Codex workflow | `skills/codex-slides/`, compatibility Skills |
| Typed tool surface | `mcp/server.mjs`, `.mcp.json` |
| Plugin discovery | `.codex-plugin/plugin.json`, `.agents/plugins/marketplace.json` |

Product UI, Browser, CLI, and MCP are one contract. If a capability changes,
update every applicable surface and the capability matrix.

## Browser-first invariant

For a normal creation request, Codex must:

1. open the Codex Slides home screen;
2. create a durable project;
3. keep clarification, outline, style, and render checkpoints visible;
4. inspect the finished result in the Browser.

`create_deck` and CLI `create` are opt-in unattended paths. Do not make them the
default behavior again.

Run the regression guard after changing Skills, MCP instructions, or plugin
prompts:

```bash
npm run check:browser-first
```

## Internationalization

English is the source dictionary. Every key must exist in English, Simplified
Chinese, Traditional Chinese, and Japanese with matching placeholders.

1. Add the English key to `src/i18n/locales/en.ts`.
2. Add translations to `zh-CN.ts`, `zh-TW.ts`, and `ja.ts`.
3. Use `t("key")` in components; do not add user-facing hard-coded strings.
4. Run `npm run check:i18n`.

## Code style

- Use TypeScript for application code.
- Keep components focused and prefer explicit state transitions.
- Preserve project autosave and resume semantics.
- Avoid background behavior that the Browser cannot explain visually.
- Keep accessibility semantics: labels, keyboard navigation, focus handling,
  reduced motion, and adequate touch targets.
- Preserve unrelated changes in a dirty worktree.

## Tests and verification

Before opening a pull request:

```bash
npm run typecheck
npm test
npm run check:i18n
npm run check:project-sync
npm run check:skill
npm run check:mcp
npm run build
```

With the app running:

```bash
npm run check:skill:live
npm run check:mcp:live
```

For UI changes, verify:

- desktop, tablet, and phone layouts;
- English, Simplified Chinese, Traditional Chinese, and Japanese;
- keyboard focus and Escape behavior for dialogs;
- reduced-motion behavior;
- the actual live app, not only static markup.

For project workflow changes, open one project in two tabs. Start or continue a
render in one tab and prove the other tab receives persisted page updates.

## Pull requests

A good pull request includes:

- the problem and intended user outcome;
- a focused implementation summary;
- tests and commands run;
- screenshots or a short recording for visual changes;
- before/after behavior for workflow fixes;
- updated docs, i18n, Skill, MCP, and capability matrix where relevant;
- no generated project data or secrets.

Use a conventional, imperative title such as:

```text
Fix cross-tab project render synchronization
Add Codex visual workflow tutorial
Expose brand assets through Design Files
```

## Bug reports

Include:

- exact reproduction steps;
- expected and actual behavior;
- project workflow stage;
- browser/Codex surface and version;
- Node.js version;
- relevant server or MCP log excerpt;
- screenshots when layout or rendering is involved;
- whether the same project behaves differently across tabs.

Do not attach confidential source documents or authentication files.

## Feature proposals

Explain the user workflow, the visible checkpoint where the feature belongs,
and how Browser, Skill, CLI, and MCP should stay aligned. A feature is not
Codex-ready merely because an API endpoint exists.

## License

By contributing, you agree that your contributions are licensed under the
project's [MIT License](LICENSE).

<p align="center">
  <img src="docs/assets/readme/hero.png" alt="Codex Slides — the open-source AI slide studio inside your coding agent, operated in the Codex in-app Browser" width="960" />
</p>

<h1 align="center">Codex Slides</h1>

<p align="center">
  <strong>The open-source AI slide studio that lives inside Codex.</strong><br />
  Turn a prompt, a repo, or a pile of files into a beautiful, presentation-ready deck — without leaving your coding agent.
</p>

<p align="center">
  <strong>⚡ 10+ high-quality slides in ~4–5 minutes</strong> — Fast mode renders every page in parallel, not one by one<br />
  45 deck templates · 73 community styles · 24 guided scenarios → production-ready <strong>PPTX / PDF</strong> · Browser-first · zero separate API keys · web &amp; desktop
</p>

<p align="center">
  <a href="LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-111827.svg" /></a>
  <img alt="Codex plugin" src="https://img.shields.io/badge/Codex-plugin-6D5EF8.svg" />
  <img alt="Next.js 14" src="https://img.shields.io/badge/Next.js-14-000000.svg" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6.svg" />
  <img alt="MCP" src="https://img.shields.io/badge/MCP-38_tools-6D5EF8.svg" />
  <img alt="Browser first" src="https://img.shields.io/badge/workflow-Browser--first-2563EB.svg" />
</p>

---

**Codex Slides is an open-source slide studio built for coding agents.** Describe a deck, point
it at a repo or a folder of files, and watch your local Codex research, outline, style, render,
and export a presentation — every slide a full visual canvas, all of it visible and steerable,
none of it a hidden background task.

Think of it as the **open-source, agent-native alternative to Gamma and Tome** — except it
lives inside the coding agent you already use, runs on your existing `codex login` with zero
extra API keys, and keeps every project on your own disk.

**What you get, out of the box:**

- **118 ready-made visual systems** — **45 curated deck templates** across 15 professional
  categories, plus **73 community styles** across 12 groups (reports, infographics, diagrams,
  data & maps, dashboards, posters, product, brand, architecture, photography, editorial,
  illustration).
- **24 guided scenarios** in 6 groups — zero-to-one decks, source-to-slides, data stories,
  deep research, redesign, localization, training, keynotes, and more.
- **⚡ Fast mode** — renders every page **in parallel** (not one-by-one), so a **10+ slide deck
  lands in ~4–5 minutes** while the outline and visual direction stay locked.
- **Production export** — real, presentation-ready **PPTX** and print-ready **PDF** with
  speaker notes preserved; 1K/2K/4K render quality and five aspect ratios (16:9, 4:3, 1:1,
  9:16, 3:4).
- **Zero extra keys** — runs on your existing `codex login`; every project stays on your disk.

```text
Open Codex Slides in the Codex Browser and keep it visible.
Create a 12-slide market deck about 2026 humanoid robotics.
Let me confirm the questions, outline, and visual direction before rendering.
```

### Try it in 60 seconds

```bash
codex plugin marketplace add nexu-io/codex-slides
codex plugin add codex-slides@codex-slides
```

Then start a new Codex task: *“Open Codex Slides and build me a 6-slide deck about …”* — and
watch it happen live.

> Like what you see? **[Give it a ⭐](#star-codex-slides)** — one click is the fastest way to
> help the next developer find Codex Slides.

> **Writing about Codex Slides?** Everything a creator or reporter needs — boilerplate, stats,
> comparisons, an FAQ, ready-to-post copy in English / 中文 / 日本語, a video script, and an asset
> manifest — is in the **[Media & creator kit](docs/MEDIA_KIT.md)**. Paste it into your agent and
> it can write the video or article for you.

## Contents

- [Why Codex Slides](#why-codex-slides)
- [How it works](#how-it-works)
- [See it inside Codex](#see-it-inside-codex)
- [Examples](#examples)
- [Install in Codex](#install-in-codex)
- [Create your first deck](#create-your-first-deck)
- [Generate from files](#generate-from-files)
- [Modify an existing deck](#modify-an-existing-deck)
- [Features](#features)
- [CLI and MCP](#cli-and-mcp)
- [Local development](#local-development)
- [Desktop development and releases](#desktop-development-and-releases)
- [Roadmap](#roadmap)
- [Community style library and licenses](#community-style-library-and-licenses)
- [Architecture and data](#architecture-and-data)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)
- [Media & creator kit](#media--creator-kit)
- [Star Codex Slides](#star-codex-slides)
- [Contributing](#contributing)
- [License](#license)

## Why Codex Slides

Most AI slide generators hide the process behind one request and return a file. Codex Slides
treats the presentation as a persistent, inspectable project you own end to end.

| Typical one-shot generator | Codex Slides in Codex |
|---|---|
| Wait for a hidden end-to-end task | Open the live product before work begins |
| Discover problems after export | Confirm requirements, outline, and style first |
| Restart when the result is wrong | Continue editing the same saved project |
| Re-upload context every time | Keep Design Files and brand rules with the project |
| Rebuild a successful visual direction | Save a project as a reusable visual-system template |
| Describe visual bugs in prose | Mark directly on the slide |
| Separate app and agent histories | Codex and the Browser operate one shared project |
| Bring your own API keys and billing | Runs on your existing `codex login`, zero extra keys |

Codex Slides is **image-native**: each slide is composed as a full visual canvas. That makes
it strong for visual fidelity and rapid iteration. Exported PPTX files contain full-slide
images rather than individually editable PowerPoint shapes.

## How it works

Codex Slides keeps the entire chain live and steerable — from a rough idea to a finished,
exportable deck.

<p align="center">
  <img src="docs/assets/readme/pipeline.png" alt="Research, Outline, Style, Render, Edit, Present, Export" width="880" />
</p>

```text
Codex conversation
      │
      ▼
Open the Codex Slides home in the Codex Browser
      │
      ▼
Create a durable project
      │
      ├── Clarify the brief
      ├── Optional source-backed research
      ├── Review and revise the outline
      ├── Choose a visual direction
      ├── Watch slides render progressively
      └── Review the finished canvas
              │
              ├── Chat edits and queued follow-ups
              ├── Add / duplicate / move / delete / transition
              ├── Mark-based slide edits
              ├── Design Files and @ references
              ├── Save as a reusable project template
              ├── Brand &amp; Design System
              ├── Play mode
              └── PDF / PPTX export
```

Projects are written to disk throughout the workflow. Opening the same project from Codex and
another browser stays synchronized; rendering pages refresh from the canonical project state,
and interrupted generation can resume safely.

## See it inside Codex

Everything happens in a live, Browser-first workspace — not a black box. Start from a prompt,
a proven visual direction, or a purpose-built workflow, then stay in the same durable project
through questions, research, outline, generation, editing, presenting, and export.

<p align="center">
  <img src="docs/assets/readme/01-home-community.png" alt="Codex Slides home with the prompt composer, scenario shortcuts, and Community Styles" width="920" />
</p>

<p align="center"><strong>1 · Start at Home</strong> — describe what you want to make, attach source files, choose the engine and output settings, or jump into a guided workflow.</p>

<table>
  <tr>
    <td width="50%"><img src="docs/assets/readme/02-community-styles.png" alt="Community Styles gallery with 73 visual directions" /></td>
    <td width="50%"><img src="docs/assets/readme/03-scenarios.png" alt="Scenario library with 24 presentation workflows" /></td>
  </tr>
  <tr>
    <td><strong>2 · Explore Community Styles</strong> — browse 73 visual directions across reports, infographics, diagrams, data, UI, posters, products, brand systems, architecture, photography, editorial, and illustration.</td>
    <td><strong>3 · Pick a scenario</strong> — choose from 24 configured workflows for zero-to-one decks, source-to-slides, data stories, research, redesign, localization, training, keynotes, and more.</td>
  </tr>
  <tr>
    <td colspan="2"><img src="docs/assets/readme/04-project-questions.png" alt="English clarification form inside a Codex Slides project" /></td>
  </tr>
  <tr>
    <td colspan="2"><strong>4 · Enter a durable project and clarify the brief</strong> — confirm audience, page count, aspect ratio, language, resolution, and visual intent before the outline begins.</td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/assets/readme/05-research-brief.png" alt="Source-backed English research brief in Design Files" /></td>
    <td width="50%"><img src="docs/assets/readme/05-research-outline.png" alt="Editable English presentation outline" /></td>
  </tr>
  <tr>
    <td><strong>5 · Research</strong> — run optional multi-round web research, then keep the Markdown brief and sources inspectable inside Design Files.</td>
    <td><strong>6 · Shape the outline</strong> — edit every title and talking point, add or remove slides, change the order, or ask the agent to revise the story.</td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/assets/readme/06-visual-style.png" alt="Ranked visual direction picker inside a Codex Slides project" /></td>
    <td width="50%"><img src="docs/assets/readme/07-parallel-generation.png" alt="English slide generation with completed and pending pages visible" /></td>
  </tr>
  <tr>
    <td><strong>7 · Lock the visual direction</strong> — Codex Slides ranks Community Styles against the topic and outline; choose one, search the full library, or keep the default.</td>
    <td><strong>8 · Generate progressively or in parallel</strong> — watch completed slides land in the canvas while remaining pages stay visible and resumable. Fast mode fans pages out in parallel and queues overflow.</td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/assets/readme/08-editor.png" alt="English slide editor with the complete 16:9 canvas contained in view, editing toolbar, speaker notes, and thumbnails" /></td>
    <td width="50%"><img src="docs/assets/readme/09-presenter-mode.png" alt="Audience playback and Presenter Mode menu with the complete slide visible behind it" /></td>
  </tr>
  <tr>
    <td><strong>9 · Edit in place</strong> — keep the complete slide in frame while you ask AI, mark a region, rewrite or redraw a page, add and reorder slides, set transitions, replace images, and prepare speaker notes.</td>
    <td><strong>10 · Present</strong> — start audience playback from any slide, or use Presenter Mode with a synchronized audience window, notes, navigation, and timer.</td>
  </tr>
  <tr>
    <td colspan="2"><img src="docs/assets/readme/10-export.png" alt="English PDF and PowerPoint export menu above a fully contained 16:9 slide" /></td>
  </tr>
  <tr>
    <td colspan="2"><strong>11 · Export</strong> — download a production-ready PowerPoint file or a print-ready PDF, with the project's speaker notes preserved.</td>
  </tr>
</table>

## Examples

Every card below is a real **visual system that ships with Codex Slides**, paired with the exact
prompt that turns it into a finished deck. Each prompt opens a **durable project**, stops for
outline and visual-direction approval, then renders in the Browser where you watch it happen —
swap in your own topic, audience, or files and go.

<table>
  <tr>
    <td width="50%">
      <img src="docs/assets/readme/case-market-report.png" alt="Business and market report deck" width="100%" /><br />
      <strong>Business &amp; market report</strong> — charts, KPI callouts, and a tidy consulting-grade grid.
      <details><summary>📋 Copy the prompt</summary>
      <pre>Open Codex Slides in the Codex Browser and build a 12-slide market
report on the 2026 humanoid-robotics market — size, CAGR, average
selling price, and key takeaways — in a consulting-grade chart-and-KPI
grid. Research first, then stop at the outline before rendering.</pre>
      </details>
    </td>
    <td width="50%">
      <img src="docs/assets/readme/case-data.png" alt="Data visualization dashboard deck" width="100%" /><br />
      <strong>Data &amp; dashboards</strong> — maps, donut and trend charts, and metric tiles.
      <details><summary>📋 Copy the prompt</summary>
      <pre>Open Codex Slides and turn the attached dataset into a data dashboard
on global EV-charging infrastructure — a world map of charging points,
a regional donut, a growth trend line, and metric tiles. Analytical and
dense. Confirm the outline first.</pre>
      </details>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="docs/assets/readme/case-keynote.png" alt="Product keynote deck" width="100%" /><br />
      <strong>Product keynote</strong> — cinematic, high-contrast title moments for launches.
      <details><summary>📋 Copy the prompt</summary>
      <pre>Open Codex Slides and create a cinematic product keynote — big
high-contrast title moments, near-black slides with one glowing product
hero and a single bold line per page. 16:9 at 4K. Show me the visual
direction before generating.</pre>
      </details>
    </td>
    <td width="50%">
      <img src="docs/assets/readme/case-editorial.png" alt="Editorial magazine-style deck" width="100%" /><br />
      <strong>Editorial</strong> — refined typography and a print-quality grid.
      <details><summary>📋 Copy the prompt</summary>
      <pre>Open Codex Slides and design an editorial, magazine-style deck — a
refined serif masthead, a strict multi-column print grid, warm
photography, and generous white space. Use my essay as the source.
Approve the outline, then export PDF.</pre>
      </details>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="public/community/foryou-pitch-midnight-traction.jpg" alt="Midnight investor pitch title slide" width="100%" /><br />
      <strong>Seed pitch — midnight &amp; traction</strong> — a confident dark title system, one electric-blue accent.
      <details><summary>📋 Copy the prompt</summary>
      <pre>Open Codex Slides in the Codex Browser and build a 10-slide seed pitch
for a developer-tools startup — problem, insight, product, demo,
traction, market, model, moat, team, ask. Use a confident dark
"midnight" title system with one electric-blue accent. Stop at the
outline, then render in Fast mode.</pre>
      </details>
    </td>
    <td width="50%">
      <img src="public/community/foryou-pitch-clean-daylight.jpg" alt="Clean daylight product keynote with 3D diagram nodes" width="100%" /><br />
      <strong>Product keynote — clean daylight</strong> — a bright, airy layout with soft 3D diagram nodes.
      <details><summary>📋 Copy the prompt</summary>
      <pre>Open Codex Slides and create a 14-slide product keynote for an
agent-native platform. Bright, airy "daylight" layout with soft 3D
diagram nodes and one indigo accent, one idea per slide. Show me the
visual-direction options, then generate at 4K.</pre>
      </details>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="public/community/foryou-data-answer-first.jpg" alt="Answer-first data slide with a national map and KPI callouts" width="100%" /><br />
      <strong>Answer-first data story</strong> — leads with the headline, then a map and trends.
      <details><summary>📋 Copy the prompt</summary>
      <pre>Open Codex Slides in the Browser and turn the attached dataset into a
9-slide data story that leads with the answer: a headline metric, a
national map of where it's happening, trend and regional breakdowns, and
a recommendation. Analytical and uncluttered. Confirm the outline first.</pre>
      </details>
    </td>
    <td width="50%">
      <img src="public/community/foryou-craft-editorial-ink.jpg" alt="Editorial ink-and-paper report title slide" width="100%" /><br />
      <strong>Editorial report</strong> — refined serif headlines and a strict print grid.
      <details><summary>📋 Copy the prompt</summary>
      <pre>Open Codex Slides. Use the attached PDF as the content source and
rebuild it as a 12-slide editorial report — refined serif headlines, an
ink-and-paper craft palette, and a strict print grid. Keep every fact,
add nothing. Stop for outline approval, then export PPTX and PDF.</pre>
      </details>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="public/community/nb-liquid-glass-bento.jpg" alt="Liquid glass bento grid dashboard" width="100%" /><br />
      <strong>Liquid Glass bento dashboard</strong> — transparent glass cards over a soft blurred ground.
      <details><summary>📋 Copy the prompt</summary>
      <pre>Open Codex Slides and build a 6-slide product overview in the Liquid
Glass Bento style — an asymmetric bento grid of transparent glass cards
over a soft blurred ground, one hero cell plus titled metric tiles. Use
my attached specs as the facts. Approve the outline before rendering.</pre>
      </details>
    </td>
    <td width="50%">
      <img src="public/community/nb-summary-infographic.jpg" alt="Dense one-page summary infographic" width="100%" /><br />
      <strong>One-page summary infographic</strong> — a whole story in one dense, sectioned page.
      <details><summary>📋 Copy the prompt</summary>
      <pre>Open Codex Slides and use the attached transcript as the source.
Distill the whole meeting into a single dense "summary infographic"
slide plus 4 supporting pages — decisions, owners, next steps, and
risks, with icons and tidy sections. Show me the outline first.</pre>
      </details>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="public/community/nb-technical-cutaway.jpg" alt="Labeled technical cutaway diagram" width="100%" /><br />
      <strong>Technical cutaway</strong> — a labeled cross-section that formalizes a rough sketch.
      <details><summary>📋 Copy the prompt</summary>
      <pre>Open Codex Slides. Use the attached whiteboard photo as a visual source
and reconstruct the system as a 5-slide "technical cutaway" — a labeled
cross-section hero, data flow, components, tradeoffs, and rollout. Keep
my labels, formalize the sketch. Pause at the outline.</pre>
      </details>
    </td>
    <td width="50%">
      <img src="public/community/nb-bold-product-ad.jpg" alt="Bold high-contrast product ad slide" width="100%" /><br />
      <strong>Bold product ad</strong> — a hero shot, one giant claim per page, a closing CTA.
      <details><summary>📋 Copy the prompt</summary>
      <pre>Open Codex Slides and turn our launch one-pager into a 5-slide "bold
product ad" sequence — a hero shot, one giant claim per page,
high-contrast type, and a closing CTA. Punchy and confident. Confirm the
visual direction, then render at 4K.</pre>
      </details>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="public/community/nb-golden-serif-quote.jpg" alt="Warm golden serif quote slide" width="100%" /><br />
      <strong>Golden serif quote moment</strong> — a warm canvas with one oversized light-gold line.
      <details><summary>📋 Copy the prompt</summary>
      <pre>Open my finished deck and add three "golden serif quote" interstitials
— a warm brown canvas with one oversized light-gold serif line and a
soft portrait fade — between the major sections. Keep the rest of the
visual system intact. Show me the result in Play mode.</pre>
      </details>
    </td>
    <td width="50%">
      <img src="public/community/nb-watercolor-map.jpg" alt="Watercolor annotated regional map" width="100%" /><br />
      <strong>Watercolor annotated map</strong> — a hand-painted map anchoring a market story.
      <details><summary>📋 Copy the prompt</summary>
      <pre>Open Codex Slides and create an 8-slide market-entry brief centered on
a watercolor annotated map of our target regions, with a ranked
opportunity table and a phased plan. Run quick research first and keep
the sources in Design Files. Approve the outline before rendering.</pre>
      </details>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="public/community/nb-retro-industrial-concept.jpg" alt="Retro industrial product concept render" width="100%" /><br />
      <strong>Retro industrial concept</strong> — moody studio renders with utilitarian type.
      <details><summary>📋 Copy the prompt</summary>
      <pre>Open Codex Slides and create a 6-slide product concept deck in a
retro-industrial style — moody studio renders, utilitarian type, and
spec callouts — for a piece of hardware described in the attached brief.
Show the visual direction, then generate.</pre>
      </details>
    </td>
    <td width="50%">
      <img src="public/community/nb-vintage-patent.jpg" alt="Vintage patent filing style technical page" width="100%" /><br />
      <strong>Vintage patent filing</strong> — aged paper, fine linework, numbered figure callouts.
      <details><summary>📋 Copy the prompt</summary>
      <pre>Open Codex Slides and present our hardware concept as a 7-slide
"vintage patent filing" — aged paper, fine technical linework, numbered
callouts, and a formal figure caption on every page. Use the attached
CAD notes as the source. Outline first.</pre>
      </details>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="public/community/nb-engineering-blueprint-grid.jpg" alt="Engineering blueprint grid with annotated diagrams" width="100%" /><br />
      <strong>Engineering blueprint teardown</strong> — annotated diagrams on a precise technical grid.
      <details><summary>📋 Copy the prompt</summary>
      <pre>Open Codex Slides and build a 9-slide competitive teardown of us vs.
three named rivals in an engineering blueprint grid — annotated
diagrams, a feature matrix, pricing, and where we win. Fair and
specific, no strawmen. Show the outline before rendering.</pre>
      </details>
    </td>
    <td width="50%">
      <img src="public/community/nb-chalkboard-lesson.jpg" alt="Warm chalkboard lesson layout with hand-drawn diagrams" width="100%" /><br />
      <strong>Chalkboard lesson</strong> — hand-drawn diagrams and boxed definitions for teaching.
      <details><summary>📋 Copy the prompt</summary>
      <pre>Open Codex Slides and build a 12-slide training module on "Reading a
Flame Graph" in a warm chalkboard-lesson style — hand-drawn diagrams,
boxed definitions, a worked example, and a short quiz. Write full
speaker notes on every slide. Approve the outline before rendering.</pre>
      </details>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="public/community/nb-visual-info-guide.jpg" alt="Clean visual information guide layout" width="100%" /><br />
      <strong>Visual info guide</strong> — a tidy, icon-led explainer for a research readout.
      <details><summary>📋 Copy the prompt</summary>
      <pre>Open Codex Slides and turn the attached survey export into a 10-slide
research readout as a clean visual info guide: method, three headline
findings with supporting charts, verbatim quotes, and recommendations.
Neutral, evidence-first. Outline first.</pre>
      </details>
    </td>
    <td width="50%">
      <img src="public/community/nb-exploded-layers.jpg" alt="Exploded layer stack diagram" width="100%" /><br />
      <strong>Exploded layer stack</strong> — a hero exploded diagram plus one slide per layer.
      <details><summary>📋 Copy the prompt</summary>
      <pre>Open Codex Slides and explain our architecture as a 5-slide "exploded
layer stack" — a hero exploded diagram plus one slide per layer with its
role and interfaces. Use the attached design doc as the source. Pause at
the outline.</pre>
      </details>
    </td>
  </tr>
</table>

> The preview images above are visual systems that ship with Codex Slides — a few are real
> Codex Slides renders, the rest are community-contributed style references the model matches on
> **art direction**, not literal content. Every contributor and source is credited under
> [Community style library and licenses](#community-style-library-and-licenses).

## Scenarios and visual systems

Codex Slides is not a single "generate" button. It ships **118 ready-made visual systems** —
**45 curated deck templates** (15 professional categories × 3) plus **73 community styles**
(12 groups) — driven by **24 guided scenarios** in 6 groups. Start from a finished direction,
pick a scenario, or just describe your own.

### 24 guided scenarios (6 groups)

| Group | Scenarios |
|---|---|
| **Create** | Create from scratch · Business report · Pitch deck · Project proposal |
| **Transform sources** | Beautify a deck (PPTX/HTML/PDF) · Document to deck · Notes / transcript to deck · Visuals / whiteboard to deck |
| **Data & insights** | Data visualization & insights · Recurring performance report · Financial results · Survey & user research |
| **Research & decisions** | Deep research presentation · Market & industry research · Competitive analysis · Literature review |
| **Optimize a deck** | Apply a brand system · Reference recreation / style transfer · Translate & localize · Restructure (compress / expand) |
| **Specialized outputs** | Training & courseware · Keynote & launch story · Portfolio & case study · Template-driven batch |

### 45 curated deck templates (15 categories × 3)

Fundraising Pitch · Corporate Strategy · B2B Sales · Product Management · Design Craft ·
Academic Research · Professional Training · Data & Finance · Marketing & GTM · Consulting ·
Government & Policy · AI Literacy · Student Coursework · Career · Life & Story — each with an
expert role, target audience, and its own visual grammar.

### 73 community styles (12 groups)

Curated from open prompt galleries and adapted into presentation-ready `<page_style>` systems,
across **Business & Report · Infographic · Diagram · Data & Map · UI & Dashboard · Poster & Ad ·
Product · Brand & Identity · Architecture & Space · Photo & Cinematic · Editorial ·
Illustration**. A taste of the catalog:

> Liquid Glass Bento · Summary Infographic · Engineering Blueprint Grid · Technical Cutaway ·
> Watercolor Annotated Map · Visual Info Guide · UI Screenshot System · Retro CRT Interface ·
> Bold Product Ad · Hyperreal Product Poster · Lifestyle Product Shot · Brand Identity Package ·
> Cyberpunk Miniature City · 35mm Surreal Landscape · Golden Serif Quote · Neo-Parametric
> Editorial · Fashion Magazine Cover · Hand-Drawn Infographic · Paper Pop-Up Story · Voxel Icon
> System … and 53 more.

Codex Slides ranks these against your topic and outline at the inspiration step, so you can
lock a direction in one click, search the full library, or keep the default.

### Fast mode → production-ready export

- **Fast mode** renders **every page in parallel** (up to 4 in flight, overflow queued) instead
  of one-by-one, while the outline and visual direction stay locked — a **10+ slide deck lands
  in ~4–5 minutes**.
- **Production export**: download a real **PPTX** and a print-ready **PDF**, with speaker notes
  preserved, straight from the project.
- **Render quality** 1K / 2K / 4K and **five aspect ratios** — 16:9, 4:3, 1:1, 9:16, 3:4.

## Install in Codex

### Requirements

- [Codex](https://developers.openai.com/codex/) with plugin support
- Node.js 20 or newer
- A ChatGPT account authenticated once with `codex login`
- Git

No separate OpenAI API key or `.env` file is required for the default Codex workflow.

### Install from the GitHub marketplace

This repository includes a Codex marketplace manifest, so the repository itself can be added
as a plugin source:

```bash
codex plugin marketplace add nexu-io/codex-slides
codex plugin add codex-slides@codex-slides
```

Restart Codex or the ChatGPT desktop app after installation, then start a new task. You can
also open `/plugins` in Codex to inspect installed plugins.

To update a Git-backed installation:

```bash
codex plugin marketplace upgrade codex-slides
codex plugin remove codex-slides@codex-slides
codex plugin add codex-slides@codex-slides
```

Restart Codex after the update so the new Skill, MCP server, and interface metadata are
loaded. See OpenAI's
[local plugin installation documentation](https://learn.chatgpt.com/docs/build-plugins#install-a-local-plugin-manually)
for the marketplace layout and reload behavior.

### Install from a local checkout

```bash
git clone https://github.com/nexu-io/codex-slides.git
cd codex-slides
codex plugin marketplace add "$PWD"
codex plugin add codex-slides@codex-slides
```

After changing plugin files locally, reinstall the plugin and start a new Codex task so cached
Skills are refreshed.

## Create your first deck

Open a new Codex task and send:

```text
Open Codex Slides in the Codex Browser and keep the product visible.
From the home page, create a project for a six-slide product launch deck.
Guide me through the clarification questions, outline review, visual direction,
and rendering. Do not generate the complete deck in a hidden background call.
```

Codex should:

1. Open the Codex Slides home screen.
2. Submit the brief through the visible composer.
3. Enter the newly created project.
4. Help answer the requirements form.
5. Show the editable outline.
6. Show visual-direction choices.
7. Render inside the project canvas.
8. Inspect the completed slides before export.

For an explicitly unattended or headless job, say so. Only then should Codex use the one-call
`create_deck` / `create` fast path.

A localized visual tutorial with copy-ready prompts in English, Simplified Chinese, and
Japanese is linked from the home page beneath the composer, and is also reachable directly
once the local app is running:

```text
http://127.0.0.1:4311/?tutorial=codex
```

## Generate from files

Attach files to Codex or upload them from the Codex Slides composer. Give each source a clear
semantic role:

```text
Open Codex Slides in the Codex Browser.
Use the attached PDF as the content source, the spreadsheet as the dataset,
and the logo plus product screenshots as brand references.
Create the project through the visible UI and stop for outline approval before
rendering.
```

Supported project context includes images, PDFs, office documents, spreadsheets, Markdown,
text, data files, HTML/CSS, JavaScript, and TypeScript. Scenario workflows can require or
recommend specific source slots.

## Modify an existing deck

### Rewrite one slide

```text
Open my latest Codex Slides project. Rewrite slide 3 for an executive audience,
reduce the copy by 50%, preserve the conclusion, regenerate only that slide,
and show the result in the Browser.
```

### Change the structure

```text
Add an executive summary after slide 1, duplicate slide 5 as an international
market variant, and delete the final appendix. Preserve the visual system and
transitions.
```

### Restyle the complete deck

```text
Restyle this deck as a restrained Swiss editorial report with a strict grid,
high-contrast typography, warm photography, and one blue accent. Keep the
Browser visible and show the result before export.
```

### Edit from annotations

```text
Open slide 4 in Mark mode. Follow my arrows, labels, and comment exactly,
regenerate only that slide, and keep the marked source in project history.
```

### Apply a project-wide brand system

```text
Open Brand & Design System. Save the logo, color roles, typography, spacing,
imagery, and voice as always-on project context. Redraw the deck, review it in
Play mode, then export PPTX and PDF.
```

## Features

- **Browser-first Codex workflow** — open, operate, and verify the live product instead of
  waiting on an invisible task.
- **Durable projects** — every deck, checkpoint, conversation, queue, material, outline, and
  rendered image is persisted locally.
- **Cross-surface synchronization** — a project opened in another Browser tab follows
  externally generated or edited slide state.
- **Gen-UI clarification** — tailored questions for audience, purpose, length, language,
  format, and emphasis.
- **Deep research** — source-backed, editable Markdown briefs used as outline evidence.
- **24 workflow scenarios in six groups** — creation, transformation, data, research,
  optimization, and specialized delivery.
- **45 curated deck templates plus 73 community visual directions** across business reports,
  data, diagrams, UI, posters, products, brand systems, architecture, photography, editorial,
  and illustration.
- **Reusable project templates** — save any project as a visual-system snapshot, then reuse
  its brand rules, base style, format, brand assets, and up to six rendered-slide references
  from the home composer without copying its content.
- **Design Files** — inspect generated artifacts and uploads, edit text sources, reference
  project files in agent turns with `@`, copy an absolute file path, or download any file.
- **Brand & Design System** — persist identity, voice, palette, typography, imagery, effects,
  spacing, radii, and brand assets.
- **Conversational editing** — rewrite, add, remove, duplicate, reorder, transition,
  regenerate, or restyle through the Deck Agent.
- **Automatic version history** — every rendered-deck AI command and manual edit creates an
  immutable checkpoint with its prompt; inspect, play, restore, or export that exact PDF/PPTX.
- **Queued follow-ups** — keep prompting while generation or edits are in progress; requests
  run in order.
- **Mark editing** — draw arrows, shapes, labels, and comments directly on a slide, then
  regenerate from the annotated source.
- **Play mode** — full-screen, dual-window presentation with keyboard navigation and speaker
  notes.
- **PDF and PPTX export** — export after visual review.
- **English, Simplified Chinese, and Japanese UI** with strict key parity.
- **Portable Skill and typed MCP server** — the complete workflow remains available when one
  transport is unavailable.

## CLI and MCP

Codex Slides exposes two equivalent automation transports:

- `skills/codex-slides/scripts/codex-slides.mjs` — portable Node CLI using only built-in web
  APIs and the local HTTP service;
- `mcp/server.mjs` — 38 typed MCP tools for Codex, including durable run start/status/wait/cancel.

Discover the CLI surface:

```bash
node skills/codex-slides/scripts/codex-slides.mjs capabilities
```

Browser-first interactive entry points:

```bash
node skills/codex-slides/scripts/codex-slides.mjs open
node skills/codex-slides/scripts/codex-slides.mjs start-project \
  --json '{"topic":"2026 humanoid robotics market","pages":6,"language":"en"}'
```

Explicit unattended path:

```bash
node skills/codex-slides/scripts/codex-slides.mjs create \
  --json '{"topic":"2026 humanoid robotics market","pages":6,"research":true}'
```

Important tool groups:

| Area | MCP tools |
|---|---|
| Open and discover | `open_codex_slides`, `start_project`, `get_capabilities`, `list_projects`, `get_project` |
| Durable project runs | `start_project_run`, `get_project_run`, `wait_project_run`, `cancel_project_run` |
| Scenarios and sources | `list_scenarios`, `upload_material`, `list_design_files`, `read_design_file`, `write_design_file`, `upload_design_file` |
| Reusable templates | `list_templates`, `list_project_templates`, `save_project_as_template`, `delete_project_template` |
| Research and planning | `get_onboarding_questions`, `deep_research`, `create_outline`, `revise_outline`, `rank_inspiration` |
| Brand system | `get_brand_design_system`, `update_brand_design_system` |
| Create and edit | `create_deck`, `render_deck`, `edit_deck`, `restyle_deck`, `manage_slide`, `regenerate_slide` |
| Visual input and output | `upload_slide_image`, `mark_edit_slide`, `export_deck` |
| Presenter notes | `get_speaker_notes`, `update_speaker_notes`, `generate_speaker_notes` |

The full Browser/CLI/MCP parity contract lives in
[CAPABILITY_MATRIX.md](skills/codex-slides/references/CAPABILITY_MATRIX.md).

## Local development

```bash
git clone https://github.com/nexu-io/codex-slides.git
cd codex-slides
corepack enable
pnpm install
codex login
pnpm dev
```

`pnpm dev` launches the Web service and Electron desktop together. Choose a narrower mode when
you only need one surface:

| Command | Starts | Service behavior |
|---|---|---|
| `pnpm dev` | Web + Desktop | Starts one shared Web service, opens Electron, and stops owned child processes on exit |
| `pnpm dev:web` | Web only | Serves <http://127.0.0.1:4311> |
| `pnpm dev:desktop` | Desktop | Reuses a healthy Web service or starts and waits for one automatically |

### Background lifecycle (start / restart / stop)

`pnpm dev` runs in the foreground and streams logs (Ctrl+C stops it). To run the same Web +
Desktop stack **in the background** and manage it from any shell, use the lifecycle commands.
Each accepts an optional target — `all` (default), `web`, or `desktop`:

| Command | Purpose |
|---|---|
| `pnpm dev:start [all\|web\|desktop]` | Start in the background (daemon); waits for the Web service to become healthy, then returns |
| `pnpm dev:stop [all\|web\|desktop]` | Stop background services (`all` stops Desktop, then Web) |
| `pnpm dev:restart [all\|web\|desktop]` | Restart background services (stop then start) |
| `pnpm dev:status [all\|web\|desktop]` | Show what is running: PID, URL, uptime, and Web health (`--json` for machine-readable output) |
| `pnpm dev:logs [all\|web\|desktop]` | Tail the last 200 log lines; add `-f` / `--follow` to stream new output |

Background output and process state live under `.tmp/dev-runtime/` (`web.log`, `desktop.log`,
and `<target>.json`). `pnpm dev:start desktop` starts its Web dependency automatically, and
`dev:start` reuses an already-healthy Web service instead of starting a second one. Override the
Web port with `--web-port <port>` on `dev:start` / `dev:restart`.

Production build:

```bash
pnpm build
pnpm start
```

Environment variables:

| Variable | Default | Purpose |
|---|---|---|
| `CODEX_SLIDES_URL` | `http://127.0.0.1:4311` | Browser and local API base URL |
| `CODEX_SLIDES_HOME` | auto-detected | Source checkout used by the portable Skill |
| `CODEX_SLIDES_APP_DIR` | plugin root | Source checkout used by the MCP server |
| `CODEX_SLIDES_CODEX_MODEL` | `gpt-6-luna` | Top-level Codex Responses model; override with a model available to your ChatGPT Codex account |
| `CODEX_SLIDES_LOG` | OS temp directory | Auto-start server log |
| `CODEX_SLIDES_NO_AUTO_START` | unset | Set to `1` to disable MCP auto-start |
| `CODEX_SLIDES_DATA_DIR` | `<repo>/data` | Project/template data root; desktop builds set this to the OS user-data directory |

Project data is stored under:

```text
data/projects/<project-id>/
├── project.json
├── 01.png
├── 02.png
├── ...
└── files/
    ├── generated/
    └── uploaded/

data/templates/<template-id>/
├── template.json
├── references/
└── brand-assets/
```

Do not commit personal project data or uploaded source material.

## Desktop development and releases

The same Next.js application can run in Electron on macOS, Windows, and Linux. In packaged
builds, Electron starts the bundled standalone server on an available loopback port and stores
durable data in the operating system's app data directory.

| Command | Purpose |
|---|---|
| `pnpm electron:check` | Validate desktop metadata, icons, service startup, and runtime contracts |
| `pnpm electron:dev` | Alias of `pnpm dev:desktop` |
| `pnpm electron:pack` | Build an unpacked app for the current platform |
| `pnpm electron:dist` | Build installers for the current platform |
| `pnpm smoke:standalone` | Boot the built standalone server and require 200s from core routes |
| `pnpm smoke:packaged` | Boot the server from every unpacked app in `dist/` and probe it |
| `pnpm release <version>` | Bump versions, run gates, tag, and push — the tag ships the release |

The Desktop entry resolves its service dependency first: it attaches to a healthy
`CODEX_SLIDES_URL` when one already exists, otherwise it starts `dev:web`, waits for
`/api/agents`, then opens the Electron window. Closing or interrupting the combined command
stops only the Web process that command owns, so a separately launched Web session is kept.

Desktop builds use an isolated `.next-desktop` output so a concurrent web/dev build cannot
overwrite the runtime being packaged.

Releases are one action: run **Actions → Release desktop apps → Run workflow** with a version
number (the workflow bumps versions, commits, and tags by itself), or locally run
`pnpm release 0.2.0`, which bumps versions, runs the local gates, and pushes a `v0.2.0` tag.
Either path runs
[`release-desktop.yml`](.github/workflows/release-desktop.yml), which creates a draft GitHub
Release, builds on native macOS, Windows, and Linux runners, **boots the packaged server on
every platform and requires HTTP 200 from core routes**, uploads the `.dmg`, `.zip`, `.exe`,
`.AppImage`, and `.deb` files plus `SHA256SUMS.txt`, and only then publishes the release. The
full maintainer guide, including recovery steps, lives in
[`docs/RELEASING.md`](docs/RELEASING.md).

Downloaded builds are not yet notarized: on macOS, right-click the app and choose **Open** on
first launch (or approve it under System Settings → Privacy & Security), and on Windows use
SmartScreen's **More info → Run anyway**. Desktop logs live in the OS app-data directory
(`codex-slides-desktop.log` for the shell, `codex-slides-server.log` for the bundled server).

## Roadmap

Codex Slides is early and moving fast. The goal is simple: be the best way to make slides with
a coding agent. Priorities are grouped by horizon and may shift with community feedback.

| Status | Item |
|---|---|
| ✅ Shipped | Browser-first guided workflow: research → outline → style → render → edit → present → export |
| ✅ Shipped | Durable projects, reusable project templates, and Design Files |
| ✅ Shipped | Brand & Design System, mark-based editing, and dual-window Play mode |
| ✅ Shipped | Immutable automatic version history with prompt inspection, playback, restore, and exact-version PDF/PPTX export |
| ✅ Shipped | Portable Agent Skills, 38 typed MCP tools, durable runs, exact Browser handoffs, and Electron desktop apps |
| ✅ Shipped | Unified Codex Slides naming and icon assets across Web, desktop, and the Codex plugin |
| 🚧 In progress | Sharper template gallery and one-click community-style previews |
| 🔜 Next | Editable-shape PPTX export (native text and vector objects, not just full-slide images) |
| 🔜 Next | Live collaboration and shareable read-only present links |
| 🔜 Next | Bring-your-own-agent support beyond Codex, and additional image backends |
| 🔭 Exploring | Charts and tables from live data sources and spreadsheets |
| 🔭 Exploring | Theme marketplace and per-organization brand kits |
| 🔭 Exploring | Video/animated slide export and speaker-rehearsal mode |

Have a request? Open a [GitHub Issue](https://github.com/nexu-io/codex-slides/issues) or start
a discussion — roadmap items are prioritized in the open.

## Community style library and licenses

The Community styles Browser is a presentation-focused index distilled from the open prompt
galleries below. Codex Slides keeps one catalog for the home Browser, the project inspiration
checkpoint, Brand & Design System, prompt generation, the portable CLI, and MCP. Selecting a
community style injects its adapted `<page_style>` rules and, when available, sends its
preview as the first visual reference image. The model is told to match art direction and
layout grammar, not to copy the preview's literal text, logos, subject, or composition.

| Reference | License noted by the source | How Codex Slides uses it |
|---|---|---|
| [YouMind Awesome GPT Image 2](https://github.com/YouMind-OpenLab/awesome-gpt-image-2) and [web gallery](https://youmind.com/gpt-image-2-prompts) | [CC BY 4.0](https://github.com/YouMind-OpenLab/awesome-gpt-image-2/blob/main/LICENSE) | Category research, prompt-language references, and source discovery |
| [freestylefly Awesome GPT Image 2](https://github.com/freestylefly/awesome-gpt-image-2) | [MIT](https://github.com/freestylefly/awesome-gpt-image-2/blob/main/LICENSE) | Adapted industrial template taxonomy and attributed remote previews |
| [JimmyLv Awesome Nano Banana](https://github.com/JimmyLv/awesome-nano-banana) | [CC BY 4.0](https://github.com/JimmyLv/awesome-nano-banana/blob/main/LICENSE), subject to per-case attribution overrides | Case discovery, prompt authorship, and presentation-suitable visual directions |
| [YouMind Awesome Nano Banana Pro Prompts](https://github.com/YouMind-OpenLab/awesome-nano-banana-pro-prompts) | [CC BY 4.0](https://github.com/YouMind-OpenLab/awesome-nano-banana-pro-prompts/blob/main/LICENSE) | Curated local previews and adapted presentation style blocks |
| [muset-ai Awesome Nano Banana Pro](https://github.com/muset-ai/awesome-nano-banana-pro) | [CC BY 4.0](https://github.com/muset-ai/awesome-nano-banana-pro/blob/main/LICENSE), subject to per-case attribution overrides | Cross-checking Nano Banana Pro cases and visual coverage |
| [jamez-bondos Awesome GPT-4o Images](https://github.com/jamez-bondos/awesome-gpt4o-images) | [CC BY 4.0](https://github.com/jamez-bondos/awesome-gpt4o-images/blob/main/LICENSE), except separately noted OpenAI files and per-case overrides | Attributed preview images and reusable case-derived art directions |

Each catalog item keeps its source collection, original author when known, and source URL in
[`src/lib/community.ts`](src/lib/community.ts). The files under
[`public/community`](public/community) and remote community previews retain their upstream
terms and attribution requirements; Codex Slides' MIT license does not relicense those assets.
Before redistributing a specific preview, follow its source link and check any case-level
`ATTRIBUTION.yml` or notice.

## Architecture and data

```text
Codex Skill / MCP server / Browser UI / Electron
                 │
                 ▼
        Next.js local HTTP API
                 │
        ┌────────┼────────┐
        ▼        ▼        ▼
    Codex text  web search  image generation
        │                   │
        └────────┬──────────┘
                 ▼
      on-disk project store
                 │
        ┌────────┴────────┐
        ▼                 ▼
      Browser          PDF / PPTX
```

Key directories:

```text
.codex-plugin/    installable Codex plugin manifest
.agents/          Git marketplace metadata
.mcp.json         MCP registration
mcp/              typed MCP server
skills/           canonical and compatibility Skills
src/app/          Next.js UI and API routes
src/components/   launcher, tutorial, project workspace, editing surfaces
src/lib/          agents, research, pipeline, project store, export
scripts/          contract, i18n, Skill, and MCP probes
data/projects/    local project state and generated assets
data/templates/   reusable project visual systems and reference assets
```

The local app uses the existing `codex login` authentication. Text generation, web research,
and image generation are invoked through the same authenticated Codex environment; no separate
application API key is stored by Codex Slides.

## Verification

Run the complete static contract:

```bash
pnpm typecheck
pnpm test
pnpm check:i18n
pnpm check:project-sync
pnpm check:skill
pnpm check:mcp
pnpm electron:check
pnpm build
```

With the local app running:

```bash
pnpm check:skill:live
pnpm check:mcp:live
pnpm check:project-sync:live
```

UI changes should also be checked at desktop, tablet, and phone widths. For project workflow
changes, verify both the Codex Browser and a second browser tab using the same project URL.

## Troubleshooting

### Codex does not see the plugin

1. Run `codex plugin list` and confirm `codex-slides` is enabled.
2. Reinstall the plugin after changing its version or Skill files.
3. Restart Codex or the ChatGPT desktop app.
4. Start a new task; existing tasks may retain the old Skill snapshot.

### The local app does not start

```bash
node --version       # must be 20+
pnpm install
pnpm build
pnpm start
```

Inspect the log at `CODEX_SLIDES_LOG` or the operating system temp directory.

### One browser tab shows stale slides

Every open project page polls the canonical project, including while it already looks complete,
and also refreshes on focus or visibility changes. This lets a visible browser discover a new
Codex, MCP, CLI, or second-tab mutation. If an older build is still open, restart the local
server and reload both tabs. Confirm the API state:

```bash
curl http://127.0.0.1:4311/api/projects/<project-id>
```

### A project is stuck in rendering

Codex Slides waits for the active renderer and only resumes after the project has no disk
heartbeat for 90 seconds. Reopen the project; already rendered pages are preserved and only
pending or failed pages are retried.

### Exported PPTX text is not editable

This is expected today. Codex Slides currently exports each completed slide as a full-slide
image for visual fidelity. Editable-shape export is on the [roadmap](#roadmap).

## GitHub repository metadata

Recommended repository title, description, categories, topics, social-preview copy, and
release naming are documented in [docs/GITHUB_METADATA.md](docs/GITHUB_METADATA.md).

## Media & creator kit

Covering Codex Slides — a video, a thread, a newsletter, a review? You don't have to learn the
product first. [**docs/MEDIA_KIT.md**](docs/MEDIA_KIT.md) is a press kit written to be handed to
an AI agent: paste it in and ask for the piece you want.

It includes:

- Boilerplate, one-liners, and elevator pitches at multiple lengths — in **English, 简体中文, and 日本語**.
- A **by-the-numbers** table, **story angles**, and **audience personas** to build a piece around.
- A category **comparison**, an **FAQ**, and **ready-to-post** tweets, threads, and LinkedIn copy.
- **30- and 60-second video scripts** with a shot list, plus an **asset manifest** mapping every screenshot.
- Two guardrail sections — **✅ Safe to claim** and **⚠️ Do not claim** — so generated promo stays
  accurate and never invents features, benchmarks, or an OpenAI affiliation.

## Star Codex Slides

<p align="center">
  <img src="docs/assets/readme/star-us.png" alt="If this saved you an afternoon, give it a star" width="880" />
</p>

If Codex Slides saved you an afternoon, give it a ⭐. Stars don't pay rent — but they tell the
next developer, agent, and contributor that this project is worth their attention. One click,
three seconds, a real signal.

## Contributing

Contributions are welcome. Start with [CONTRIBUTING.md](CONTRIBUTING.md), which covers setup,
architecture boundaries, i18n, Skill/MCP parity, visual QA, tests, and pull-request
expectations.

- Use [GitHub Issues](https://github.com/nexu-io/codex-slides/issues) for bugs and feature
  proposals.
- Use GitHub private vulnerability reporting for security issues; see [SECURITY.md](SECURITY.md).
- Be respectful and constructive; see [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## License

Codex Slides source code is available under the [MIT License](LICENSE). Community previews and
adapted prompt references retain the upstream terms and attribution documented in
[Community style library and licenses](#community-style-library-and-licenses).

## Acknowledgements

Codex Slides builds on ideas and implementation patterns from:

- [`Anionex/banana-slides`](https://github.com/Anionex/banana-slides) for the original
  image-generation presentation mechanism;
- [`nexu-io/html-anything`](https://github.com/nexu-io/html-anything) for local agent
  detection and invocation patterns;
- [`nexu-io/html-video`](https://github.com/nexu-io/html-video) and
  [`zhongerxin/cowart`](https://github.com/zhongerxin/cowart) for per-unit and mark-edit
  interaction ideas;
- [Open Design](https://github.com/nexu-io/open-design) for the agent-native design workflow
  and product direction.

---

<p align="center">
  <strong>Open Codex Slides in Codex. Keep it visible. Make every slide steerable.</strong>
</p>

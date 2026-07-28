// Template catalog (M7). Taxonomy from the genspark commercialization spec
// (§5 Category System, §6.9 Visual Director) + banana-slides' style-descriptor model.
//
// A "template" is a concrete visual system inside a category. It plugs into the
// image pipeline by supplying the <page_style> block of buildImagePrompt (plus a
// palette/typography/density the model should honor). Category-level visual
// grammar keeps every template in a category recognizably of that scene.
//
// STATUS: seeded for the 5 "paid" categories (3 each) to prove the mechanism.
// The abundant full catalog (>=3 per all 15 categories) is filled once the core
// capabilities (M2-M6) land — see SPEC.md M7. Do not mass-produce before then.

export type CategoryPriority = "paid" | "secondary" | "acquisition";
export type Density = "low" | "medium" | "high";

export interface DeckCategory {
  id: string;
  labelZh: string;
  labelEn: string;
  labelJa: string;
  expertRole: string;
  audience: string;
  visualGrammar: string; // §6.9
  priority: CategoryPriority;
}

export interface DeckTemplate {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  palette: string[]; // hex, first = primary accent
  font: string; // typography guidance
  density: Density;
  imageStyle: string; // illustration/photo grammar
  styleBlock: string; // injected verbatim into <page_style>
}

// ---- 15 categories (spec §5.1) -----------------------------------------
export const CATEGORIES: DeckCategory[] = [
  { id: "fundraising-pitch", labelZh: "融资/路演", labelEn: "Fundraising Pitch", labelJa: "資金調達・ピッチ", expertRole: "VC-backed founder", audience: "Investors", visualGrammar: "Bold story rhythm, low text density, strong section breaks, traction visuals", priority: "paid" },
  { id: "corporate-strategy", labelZh: "企业战略/经营管理", labelEn: "Corporate Strategy", labelJa: "企業戦略・経営管理", expertRole: "Strategy exec", audience: "Board & C-suite", visualGrammar: "Dense but scan-friendly, tables, decisions, owners, risks", priority: "paid" },
  { id: "b2b-sales", labelZh: "B2B 销售/续约", labelEn: "B2B Sales", labelJa: "B2B営業・契約更新", expertRole: "Enterprise AE", audience: "Buying committee", visualGrammar: "Buyer language, ROI proof, comparison, case study, value stack", priority: "paid" },
  { id: "product-management", labelZh: "产品/技术管理", labelEn: "Product Management", labelJa: "プロダクト・技術管理", expertRole: "Senior PM", audience: "Eng & product reviewers", visualGrammar: "Decision matrix, roadmap, tradeoff table, architecture diagram", priority: "paid" },
  { id: "design-craft", labelZh: "设计打磨/视觉系统", labelEn: "Design Craft", labelJa: "デザイン改善・ビジュアルシステム", expertRole: "Design lead", audience: "Brand & keynote viewers", visualGrammar: "High whitespace, answer titles, visual hierarchy, brand system", priority: "paid" },
  { id: "academic-research", labelZh: "学术研究/科研申请", labelEn: "Academic Research", labelJa: "学術研究・研究申請", expertRole: "Principal investigator", audience: "Reviewers & committees", visualGrammar: "Evidence maps, source citations, methods, contribution framing", priority: "secondary" },
  { id: "professional-training", labelZh: "培训/教学交付", labelEn: "Professional Training", labelJa: "研修・教育", expertRole: "Instructional designer", audience: "Trainees", visualGrammar: "Steps, exercises, checks, scenarios, behavior prompts", priority: "secondary" },
  { id: "data-finance", labelZh: "数据/KPI/金融", labelEn: "Data & Finance", labelJa: "データ・KPI・金融", expertRole: "Analytics lead", audience: "CRO/PM/investors", visualGrammar: "Answer-above-chart, KPI tiles, clean data ink, decision callouts", priority: "secondary" },
  { id: "marketing-gtm", labelZh: "市场/增长/GTM", labelEn: "Marketing & GTM", labelJa: "マーケティング・成長・GTM", expertRole: "Growth lead", audience: "Marketing & CFO", visualGrammar: "Funnel-to-revenue, campaign timelines, pipeline metrics, brand energy", priority: "secondary" },
  { id: "consulting", labelZh: "咨询/客户交付", labelEn: "Consulting", labelJa: "コンサルティング・顧客納品", expertRole: "Engagement manager", audience: "Client steering committee", visualGrammar: "Governing thought, action titles, MECE frameworks, opportunity ranking", priority: "secondary" },
  { id: "government-policy", labelZh: "公共政策/监管/非营利", labelEn: "Government & Policy", labelJa: "公共政策・規制・非営利", expertRole: "Policy analyst", audience: "Institutional reviewers", visualGrammar: "Rubric, evidence, accountability, risk framing, sober authority", priority: "secondary" },
  { id: "ai-literacy", labelZh: "AI 素养/企业 AI", labelEn: "AI Literacy", labelJa: "AIリテラシー・企業AI", expertRole: "AI transformation lead", audience: "Enterprise decision makers", visualGrammar: "Model selection, workflow diagrams, rollout stages, ROI horizon", priority: "secondary" },
  { id: "student-coursework", labelZh: "课业/课程作业", labelEn: "Student Coursework", labelJa: "授業・課題", expertRole: "Top student", audience: "Teachers & judges", visualGrammar: "Structured argument, evidence, contribution naming, clean academic", priority: "acquisition" },
  { id: "career", labelZh: "职业/个人发展", labelEn: "Career", labelJa: "キャリア・自己成長", expertRole: "Career coach", audience: "Managers & interviewers", visualGrammar: "Impact, scope, counterfactuals, portfolio, memorable story", priority: "acquisition" },
  { id: "life", labelZh: "生活/兴趣/故事", labelEn: "Life & Story", labelJa: "暮らし・趣味・ストーリー", expertRole: "Storyteller", audience: "Friends & audiences", visualGrammar: "Theme, emotion, memory hooks, photographic, editorial warmth", priority: "acquisition" },
];

export function categoryLabel(category: DeckCategory, locale: string): string {
  return locale === "zh-CN" || locale === "zh-TW"
    ? category.labelZh
    : locale === "ja"
      ? category.labelJa
      : category.labelEn;
}

// ---- seeded templates (5 paid categories x 3) --------------------------
export const TEMPLATES: DeckTemplate[] = [
  // fundraising-pitch
  { id: "pitch-midnight-traction", categoryId: "fundraising-pitch", name: "Midnight Traction", description: "Dark, high-contrast pitch with neon accents and big traction numbers.", palette: ["#F4B400", "#0E1A2B", "#1B2A44", "#EAF0FF"], font: "Geometric sans (Inter/Söhne), tight display headers", density: "low", imageStyle: "cinematic dark gradients, glowing metric callouts, minimal flat icons", styleBlock: "Dark navy canvas with a single warm-gold accent. Oversized display headline, one idea per slide, huge legible traction numbers, strong section breaks. Confident, high-contrast, investor-grade." },
  { id: "pitch-clean-daylight", categoryId: "fundraising-pitch", name: "Clean Daylight", description: "Bright, optimistic pitch with generous whitespace and a single vivid accent.", palette: ["#4F46E5", "#0B1020", "#FFFFFF", "#EEF1FF"], font: "Humanist sans, bold weight for hero lines", density: "low", imageStyle: "light airy backgrounds, soft shadows, simple 2-tone vector spots", styleBlock: "White canvas, indigo accent, lots of whitespace. Bold hero titles, low text density, one clear message per slide, tasteful traction visuals. Modern startup keynote feel." },
  { id: "pitch-editorial-story", categoryId: "fundraising-pitch", name: "Editorial Story", description: "Magazine-style narrative pitch with big serif headlines and photo heroes.", palette: ["#E4572E", "#141414", "#F7F3EC", "#2B2B2B"], font: "Serif display headline + grotesk body", density: "low", imageStyle: "full-bleed photography, editorial captions, warm paper tone", styleBlock: "Warm paper background, oversized serif headline as the story beat, one photographic hero per slide. Reads like a founder's manifesto in a design magazine, not a template deck." },

  // corporate-strategy
  { id: "strategy-boardroom-slate", categoryId: "corporate-strategy", name: "Boardroom Slate", description: "Dense, scan-friendly board pre-read with decision tables and owners.", palette: ["#1F6FEB", "#0D1B2A", "#F5F7FA", "#8B98A9"], font: "Neutral grotesk, tabular figures", density: "high", imageStyle: "clean tables, decision matrices, muted corporate charts", styleBlock: "Cool slate palette, single blue accent. Scan-friendly dense layouts: decision tables, owners, risks, dates. Answer-first action titles. CEO/board-ready, sober, credible." },
  { id: "strategy-executive-warm", categoryId: "corporate-strategy", name: "Executive Warm", description: "Approachable exec deck balancing narrative and structured decisions.", palette: ["#0F766E", "#10231F", "#FBFAF7", "#4B5563"], font: "Transitional serif headers + sans body", density: "medium", imageStyle: "muted teal charts, restrained iconography, calm backgrounds", styleBlock: "Warm off-white ground, deep teal accent. Medium density: a clear governing thought, then a structured decision block. Confident and calm, board-readable." },
  { id: "strategy-mono-authority", categoryId: "corporate-strategy", name: "Mono Authority", description: "Monochrome, ink-on-paper authority for high-stakes strategy reviews.", palette: ["#111827", "#374151", "#FFFFFF", "#D1D5DB"], font: "Single grotesk family, weight for hierarchy", density: "high", imageStyle: "monochrome diagrams, thin rules, precise grids", styleBlock: "Near-monochrome ink-on-white. Strict grid, thin dividing rules, weight-only hierarchy, dense but disciplined. Reads as institutional and precise." },

  // b2b-sales
  { id: "sales-value-stack", categoryId: "b2b-sales", name: "Value Stack", description: "Buyer-facing proposal with ROI proof, comparison, and value stacking.", palette: ["#2563EB", "#0A1E3F", "#FFFFFF", "#E8F0FE"], font: "Friendly grotesk, strong number styles", density: "medium", imageStyle: "comparison tables, ROI tiles, logo walls, checkmark stacks", styleBlock: "Trust-blue palette on white. Buyer language, big ROI numbers, side-by-side comparison, value-stack lists, case-study callouts. Forwardable and sign-off ready." },
  { id: "sales-enterprise-trust", categoryId: "b2b-sales", name: "Enterprise Trust", description: "Sober enterprise proposal that survives procurement and security review.", palette: ["#0E7490", "#0B1B22", "#F8FAFC", "#334155"], font: "Neutral sans, tabular ROI figures", density: "medium", imageStyle: "muted charts, security/compliance badges, restrained accents", styleBlock: "Cool cyan-slate, calm and credible. ROI proof, rubric-style comparison, compliance and security cues. Designed to be internally forwarded and pass review." },
  { id: "sales-momentum-bold", categoryId: "b2b-sales", name: "Momentum Bold", description: "High-energy sales deck for competitive displacement and renewals.", palette: ["#EA580C", "#1A1A1A", "#FFFFFF", "#FFF1E8"], font: "Bold condensed display + clean body", density: "medium", imageStyle: "bold accent blocks, before/after, win-story photography", styleBlock: "White with a hot-orange accent. Punchy value claims, before/after contrast, win stories, competitor knockouts. Energetic but still professional." },

  // product-management
  { id: "pm-decision-grid", categoryId: "product-management", name: "Decision Grid", description: "Reviewer-ready business case with matrices, roadmap, and tradeoffs.", palette: ["#7C3AED", "#0F1020", "#FFFFFF", "#EEE9FF"], font: "Grotesk with monospace for specs", density: "high", imageStyle: "decision matrices, roadmaps, tradeoff tables, simple arch diagrams", styleBlock: "White ground, violet accent, monospace for specs. Decision matrix, roadmap swimlanes, tradeoff tables, crisp architecture diagrams. Built to get reviewers to yes." },
  { id: "pm-systems-blueprint", categoryId: "product-management", name: "Systems Blueprint", description: "Technical RFC/architecture-review look with blueprint diagrams.", palette: ["#0EA5E9", "#0A192F", "#F1F5F9", "#64748B"], font: "Mono-leaning sans, engineering feel", density: "high", imageStyle: "blueprint-style diagrams, thin technical lines, node graphs", styleBlock: "Deep navy + sky accent, blueprint aesthetic. Node/flow diagrams, sequence charts, thin technical linework, dense but legible. Reads as an engineering review artifact." },
  { id: "pm-calm-alignment", categoryId: "product-management", name: "Calm Alignment", description: "Lower-density PM deck optimized for cross-team alignment.", palette: ["#059669", "#0C1F17", "#FBFDFC", "#475569"], font: "Humanist sans, gentle weights", density: "medium", imageStyle: "soft cards, simple flows, restrained iconography", styleBlock: "Soft near-white, emerald accent. Medium density, one decision per slide, simple flows and cards. Calm, aligning, easy for 4-8 reviewers to skim and agree." },

  // design-craft
  { id: "craft-swiss-international", categoryId: "design-craft", name: "Swiss International", description: "Grid-driven Swiss deck: one accent, ruthless whitespace, answer titles.", palette: ["#E4002B", "#111111", "#FFFFFF", "#9CA3AF"], font: "Neue-grotesque, strict scale", density: "low", imageStyle: "grid systems, one saturated accent, geometric shapes", styleBlock: "Swiss International: strict column grid, one saturated accent, ruthless whitespace, answer titles, weight-only hierarchy. Cold, rational, unmistakably designed." },
  { id: "craft-editorial-ink", categoryId: "design-craft", name: "Editorial Ink", description: "E-ink editorial art-zine look with locked layouts and ink palette.", palette: ["#1F2937", "#3F3F46", "#F5F4ED", "#B45309"], font: "Serif display + humanist body", density: "low", imageStyle: "paper texture, ink illustration, editorial captions", styleBlock: "Warm paper (#f5f4ed) with ink and a single muted accent. Magazine editorial layouts, big serif headlines, generous margins. Reads like a printed art-zine, not slides." },
  { id: "craft-brand-keynote", categoryId: "design-craft", name: "Brand Keynote", description: "Apple-keynote-grade brand system with hero moments and calm rhythm.", palette: ["#111111", "#FF375F", "#FFFFFF", "#F2F2F7"], font: "Clean geometric sans, large hero type", density: "low", imageStyle: "full-bleed hero shots, subtle gradients, product-glamour", styleBlock: "Keynote-grade brand system: full-bleed hero moments, huge calm type, one accent, immaculate spacing. Every slide is a single confident idea. Premium and brand-consistent." },

  // academic-research
  { id: "acad-journal-clean", categoryId: "academic-research", name: "Journal Clean", description: "Restrained journal look for methods, evidence, and contributions.", palette: ["#1E3A8A", "#0B1220", "#FFFFFF", "#64748B"], font: "Serif headers + sans body, tabular figures", density: "high", imageStyle: "evidence maps, method diagrams, citation callouts", styleBlock: "Academic journal restraint: white ground, ink-blue accent, serif headers. Evidence maps, method figures, clearly framed contributions with inline citations. Dense but legible; sober and credible." },
  { id: "acad-lab-poster", categoryId: "academic-research", name: "Lab Poster", description: "Conference-poster energy: figure-forward with labeled panels.", palette: ["#0F766E", "#0C1F1B", "#F8FAFC", "#334155"], font: "Humanist sans, strong figure labels", density: "medium", imageStyle: "labeled figure panels, flow diagrams, data plots", styleBlock: "Conference-poster look: teal accent, figure-forward panels with clear labels, method→result flow, plots and diagrams over prose. Rigorous and scannable." },
  { id: "acad-thesis-serif", categoryId: "academic-research", name: "Thesis Serif", description: "Warm scholarly serif for defenses and grant narratives.", palette: ["#7C2D12", "#1C1917", "#FAF7F2", "#57534E"], font: "Old-style serif throughout", density: "medium", imageStyle: "quiet diagrams, timelines, contribution framing", styleBlock: "Warm parchment ground, single serif voice, umber accent. Contribution-first framing, quiet timelines and diagrams. Reads like a well-typeset thesis defense." },

  // professional-training
  { id: "train-step-cards", categoryId: "professional-training", name: "Step Cards", description: "Numbered step cards with checks and behavior prompts.", palette: ["#2563EB", "#0A1E3F", "#FFFFFF", "#DBEAFE"], font: "Rounded sans, big step numbers", density: "medium", imageStyle: "numbered step cards, checklists, do/don't panels", styleBlock: "Friendly blue palette, big numbered step cards, checklists and do/don't panels, scenario callouts. Optimized for 'what the learner does tomorrow', not lecture." },
  { id: "train-workbook", categoryId: "professional-training", name: "Workbook", description: "Warm workbook feel with exercises and reflection prompts.", palette: ["#D97706", "#1C1917", "#FFFBEB", "#78716C"], font: "Humanist sans, friendly", density: "medium", imageStyle: "exercise boxes, fill-in prompts, icons", styleBlock: "Warm amber workbook: exercise boxes, reflection prompts, simple icons, plenty of breathing room. Approachable and action-oriented." },
  { id: "train-safety-bold", categoryId: "professional-training", name: "Safety Bold", description: "High-legibility onboarding/compliance with strong signage.", palette: ["#DC2626", "#111827", "#FFFFFF", "#F3F4F6"], font: "Bold grotesk, high contrast", density: "medium", imageStyle: "signage-style icons, warning/OK states, steps", styleBlock: "High-contrast, signage-grade legibility: bold red/black on white, clear step sequences, warning/OK states, big icons. For onboarding, safety, and compliance." },

  // data-finance
  { id: "data-answer-first", categoryId: "data-finance", name: "Answer First", description: "The answer sits above the chart; KPI tiles and decision callouts.", palette: ["#0EA5E9", "#0A192F", "#FFFFFF", "#475569"], font: "Neutral sans, tabular figures", density: "high", imageStyle: "KPI tiles, clean charts, answer-above-chart callouts", styleBlock: "Data-ink discipline: white ground, cyan accent, tabular numerals. Every chart has its ANSWER as the title; KPI tiles and decision callouts. Minimal chartjunk, maximum signal." },
  { id: "data-terminal-dark", categoryId: "data-finance", name: "Terminal Dark", description: "Bloomberg-terminal dark deck for finance and analytics.", palette: ["#22D3EE", "#0B0F19", "#111827", "#94A3B8"], font: "Mono-leaning sans", density: "high", imageStyle: "dark charts, glowing metrics, dense tables", styleBlock: "Dark terminal aesthetic: near-black ground, cyan/green metric glow, dense but ordered tables and charts. Reads like a trading desk; numbers are the hero." },
  { id: "data-report-editorial", categoryId: "data-finance", name: "Report Editorial", description: "Economist-style editorial data report with restrained accents.", palette: ["#B91C1C", "#1F2937", "#FBFBF9", "#6B7280"], font: "Serif headline + sans body", density: "high", imageStyle: "editorial charts, red accent lines, footnotes", styleBlock: "Editorial data-report look: warm off-white, single red accent, serif headlines. Clean charts with source footnotes and a clear takeaway per exhibit. Authoritative and calm." },

  // marketing-gtm
  { id: "gtm-funnel-bold", categoryId: "marketing-gtm", name: "Funnel Bold", description: "Exposure-to-revenue funnels with vivid campaign energy.", palette: ["#DB2777", "#1A1030", "#FFFFFF", "#F5D0FE"], font: "Bold display + clean body", density: "medium", imageStyle: "funnels, campaign timelines, pipeline metrics", styleBlock: "Vivid magenta energy on white: funnel-to-revenue visuals, campaign timelines, pipeline metrics that a CFO would accept. Brand-forward but metrics-anchored." },
  { id: "gtm-launch-gradient", categoryId: "marketing-gtm", name: "Launch Gradient", description: "Product-launch gradients with hero moments and social proof.", palette: ["#7C3AED", "#0EA5E9", "#0B1020", "#FFFFFF"], font: "Geometric sans, big headers", density: "low", imageStyle: "gradient heroes, product shots, social proof rows", styleBlock: "Launch-day gradients (violet→cyan), hero product moments, social-proof and metric rows. Energetic and modern, still tied to growth outcomes." },
  { id: "gtm-brand-editorial", categoryId: "marketing-gtm", name: "Brand Editorial", description: "Editorial brand-story look for campaigns and annual plans.", palette: ["#EA580C", "#171717", "#FFF7ED", "#525252"], font: "Serif display + grotesk body", density: "medium", imageStyle: "editorial imagery, campaign story beats, KPIs", styleBlock: "Warm editorial brand story: serif display, orange accent, campaign narrative beats paired with pipeline KPIs. Creative meets accountable." },

  // consulting
  { id: "consult-mece-slate", categoryId: "consulting", name: "MECE Slate", description: "McKinsey-style action-title deck with MECE frameworks.", palette: ["#1D4ED8", "#0B1526", "#FFFFFF", "#64748B"], font: "Neutral grotesk, tight", density: "high", imageStyle: "MECE frameworks, 2x2 matrices, action titles", styleBlock: "Consulting-grade: governing thought up top, action titles (the title IS the takeaway), MECE frameworks, 2x2s and opportunity rankings. Blue/slate, disciplined grid." },
  { id: "consult-exhibit-clean", categoryId: "consulting", name: "Exhibit Clean", description: "Exhibit-driven final deck with numbered findings.", palette: ["#0F766E", "#10231F", "#FFFFFF", "#475569"], font: "Sans with tabular figures", density: "high", imageStyle: "numbered exhibits, waterfall/bridge charts, callouts", styleBlock: "Exhibit-first client deck: teal accent, numbered exhibits, waterfall/bridge charts, crisp callouts. Steering-committee cadence, no decoration." },
  { id: "consult-executive-warm", categoryId: "consulting", name: "Executive Warm", description: "Warmer executive-summary style for adoption-focused clients.", palette: ["#B45309", "#1C1917", "#FBFAF7", "#57534E"], font: "Transitional serif + sans", density: "medium", imageStyle: "clean frameworks, restrained charts, action titles", styleBlock: "Warmer consulting look: parchment ground, amber accent, serif emphasis. Action titles and tidy frameworks, medium density. Persuasive and adoption-oriented." },

  // government-policy
  { id: "gov-briefing-sober", categoryId: "government-policy", name: "Briefing Sober", description: "Institutional policy briefing with rubric and accountability.", palette: ["#1E40AF", "#0B1220", "#FFFFFF", "#475569"], font: "Neutral serif + sans", density: "high", imageStyle: "rubric tables, evidence, risk/owner matrices", styleBlock: "Sober institutional authority: navy accent, restrained serif, rubric tables, evidence and accountability/owner matrices, explicit risk framing. Auditable and calm." },
  { id: "gov-civic-clean", categoryId: "government-policy", name: "Civic Clean", description: "Accessible civic look for public-facing briefs.", palette: ["#047857", "#0C1F1B", "#F8FAFC", "#334155"], font: "Accessible humanist sans", density: "medium", imageStyle: "clear infographics, step processes, legends", styleBlock: "Accessible civic palette: green accent, high-legibility sans, clear infographics and step processes with legends. Trustworthy and easy to review." },
  { id: "gov-regulatory-mono", categoryId: "government-policy", name: "Regulatory Mono", description: "Monochrome, document-grade look for regulated submissions.", palette: ["#111827", "#374151", "#FFFFFF", "#9CA3AF"], font: "Single serif family", density: "high", imageStyle: "document tables, compliance checklists, footnotes", styleBlock: "Document-grade monochrome: ink-on-white, serif, compliance checklists and tables with footnotes. Reads like a regulatory submission — precise and defensible." },

  // ai-literacy
  { id: "ai-rollout-futuristic", categoryId: "ai-literacy", name: "Rollout Futuristic", description: "Model selection, workflow diagrams, and ROI-horizon staging.", palette: ["#06B6D4", "#0B1020", "#111827", "#E2E8F0"], font: "Geometric sans, mono accents", density: "medium", imageStyle: "workflow diagrams, model-compare tables, rollout stages", styleBlock: "Near-dark tech palette with cyan accent: model-selection tables, copilot workflow diagrams, staged rollout timelines, ROI horizon. Concrete and de-hyped." },
  { id: "ai-enterprise-clean", categoryId: "ai-literacy", name: "Enterprise Clean", description: "Board-ready enterprise-AI look, calm and concrete.", palette: ["#4F46E5", "#0B1020", "#FFFFFF", "#64748B"], font: "Neutral sans", density: "medium", imageStyle: "process diagrams, comparison tables, metric tiles", styleBlock: "White ground, indigo accent, board-ready calm. Workflow-change diagrams, capability comparisons, adoption metrics and ROI period. AI made selectable and measurable." },
  { id: "ai-workshop-warm", categoryId: "ai-literacy", name: "Workshop Warm", description: "Approachable enablement/workshop style for AI literacy.", palette: ["#F59E0B", "#1C1917", "#FFFBEB", "#78716C"], font: "Rounded humanist sans", density: "medium", imageStyle: "friendly diagrams, examples, do/try panels", styleBlock: "Warm amber workshop vibe: friendly diagrams, concrete examples, 'try this' panels. Demystifies AI for teams without dumbing it down." },

  // student-coursework
  { id: "course-scholar-clean", categoryId: "student-coursework", name: "Scholar Clean", description: "Clean high-score academic structure for defenses.", palette: ["#1E3A8A", "#0B1220", "#FFFFFF", "#64748B"], font: "Serif headers + sans body", density: "medium", imageStyle: "argument structure, evidence, contribution callouts", styleBlock: "Clean scholarly look, navy accent: structured argument, evidence, explicit contribution naming, reviewer-facing framing. The 'top-student' rubric made visible." },
  { id: "course-vivid-project", categoryId: "student-coursework", name: "Vivid Project", description: "Energetic student project deck with bold color and clarity.", palette: ["#7C3AED", "#0F1020", "#FFFFFF", "#EDE9FE"], font: "Geometric sans, bold headers", density: "medium", imageStyle: "bold section colors, simple charts, highlights", styleBlock: "Energetic violet palette, bold section headers, simple charts and highlights. Confident and clear for class presentations without looking like a corporate deck." },
  { id: "course-notebook-warm", categoryId: "student-coursework", name: "Notebook Warm", description: "Warm, approachable notebook style for coursework.", palette: ["#B45309", "#1C1917", "#FFFBEB", "#57534E"], font: "Humanist serif + sans", density: "medium", imageStyle: "annotated diagrams, callouts, tidy sections", styleBlock: "Warm notebook feel: amber accent, tidy annotated sections, callouts. Friendly yet organized — argument and evidence stay front and center." },

  // career
  { id: "career-impact-bold", categoryId: "career", name: "Impact Bold", description: "Impact-first self-review/promo deck with scope and evidence.", palette: ["#DC2626", "#111827", "#FFFFFF", "#FEE2E2"], font: "Bold grotesk, big numbers", density: "medium", imageStyle: "impact numbers, scope maps, before/after", styleBlock: "Impact-first: bold red accent, big outcome numbers, scope maps, before/after and counterfactuals. Turns a career story into an evidence chain, not a résumé." },
  { id: "career-portfolio-clean", categoryId: "career", name: "Portfolio Clean", description: "Elegant portfolio/interview look with work samples.", palette: ["#111111", "#4F46E5", "#FFFFFF", "#F2F2F7"], font: "Clean geometric sans", density: "low", imageStyle: "work samples, hero shots, tidy captions", styleBlock: "Elegant portfolio: mostly white, indigo accent, hero work samples with tidy captions and generous whitespace. Interview- and promo-ready." },
  { id: "career-story-warm", categoryId: "career", name: "Story Warm", description: "Warm narrative style for talks and personal branding.", palette: ["#EA580C", "#1C1917", "#FFF7ED", "#525252"], font: "Serif display + humanist body", density: "low", imageStyle: "photographic moments, quotes, story beats", styleBlock: "Warm narrative: orange accent, serif display, photographic moments and quotes. A memorable, human story arc — impact told, not just listed." },

  // life
  { id: "life-photo-essay", categoryId: "life", name: "Photo Essay", description: "Full-bleed photo-essay for travel and life stories.", palette: ["#0F172A", "#F59E0B", "#FFFFFF", "#94A3B8"], font: "Elegant serif captions", density: "low", imageStyle: "full-bleed photography, minimal captions", styleBlock: "Full-bleed photo-essay: images lead, minimal elegant serif captions, one warm accent. Emotional and cinematic — a story you can retell, not an album." },
  { id: "life-scrapbook-warm", categoryId: "life", name: "Scrapbook Warm", description: "Playful scrapbook collage for events and hobbies.", palette: ["#E11D48", "#1C1917", "#FFF1F2", "#78716C"], font: "Handwritten-feel display + sans", density: "medium", imageStyle: "collage frames, stickers, captions", styleBlock: "Playful scrapbook: warm rose palette, collage frames, sticker accents, casual captions. Fun and personal while keeping a clear theme and memory hooks." },
  { id: "life-zine-editorial", categoryId: "life", name: "Zine Editorial", description: "Indie-zine editorial layout for personal talks.", palette: ["#1F2937", "#22C55E", "#F5F4ED", "#57534E"], font: "Mixed serif + grotesk, editorial", density: "medium", imageStyle: "editorial collage, pull quotes, paper texture", styleBlock: "Indie-zine editorial: paper texture, mixed type, pull quotes and collage. A themed emotional arc with print-magazine character." },
];

// ---- helpers -----------------------------------------------------------
export function getTemplate(id?: string | null): DeckTemplate | undefined {
  if (!id) return undefined;
  return TEMPLATES.find((t) => t.id === id);
}

export function templatesByCategory(categoryId: string): DeckTemplate[] {
  return TEMPLATES.filter((t) => t.categoryId === categoryId);
}

export function categoriesWithTemplates(): { category: DeckCategory; templates: DeckTemplate[] }[] {
  return CATEGORIES.map((category) => ({
    category,
    templates: templatesByCategory(category.id),
  })).filter((g) => g.templates.length > 0);
}

/** The <page_style> paragraph for a template (palette + typography folded in). */
export function styleBlockFor(t: DeckTemplate): string {
  return [
    t.styleBlock,
    `Palette: ${t.palette.join(", ")} (first color is the accent).`,
    `Typography: ${t.font}.`,
    `Text density: ${t.density}. Illustration grammar: ${t.imageStyle}.`,
  ].join(" ");
}

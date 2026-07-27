import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import PptxGenJS from "pptxgenjs";

const scriptPath = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(scriptPath), "..");
const outDir = path.join(rootDir, "docs", "investor");
const outFile = path.join(outDir, "tecbunny-seed-pitch-deck.pptx");

fs.mkdirSync(outDir, { recursive: true });

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "Tecbunny";
pptx.company = "Tecbunny";
pptx.subject = "Seed fundraising pitch deck";
pptx.title = "Tecbunny Seed Pitch Deck";
pptx.lang = "en-US";

const colors = {
  bg: "F7F8FA",
  primary: "0D1B2A",
  accent: "1B5E20",
  softAccent: "EAF6ED",
  text: "102A43",
  muted: "486581",
  white: "FFFFFF",
  line: "D9E2EC"
};

const page = {
  x: 0.6,
  y: 0.4,
  w: 12.13,
  h: 6.0
};

function addFrame(slide, title, subtitle = "") {
  slide.background = { color: colors.bg };

  slide.addShape(pptx.ShapeType.roundRect, {
    x: page.x,
    y: page.y,
    w: page.w,
    h: page.h,
    rectRadius: 0.08,
    line: { color: colors.line, pt: 1 },
    fill: { color: colors.white }
  });

  slide.addShape(pptx.ShapeType.rect, {
    x: page.x,
    y: page.y,
    w: page.w,
    h: 0.18,
    fill: { color: colors.accent },
    line: { color: colors.accent, pt: 0 }
  });

  slide.addText(title, {
    x: page.x + 0.45,
    y: page.y + 0.35,
    w: 8.5,
    h: 0.4,
    fontFace: "Calibri",
    fontSize: 26,
    bold: true,
    color: colors.primary
  });

  if (subtitle) {
    slide.addText(subtitle, {
      x: page.x + 0.45,
      y: page.y + 0.8,
      w: 9.8,
      h: 0.4,
      fontFace: "Calibri",
      fontSize: 13,
      color: colors.muted
    });
  }
}

function addBullets(slide, bullets, startY = 1.55, left = page.x + 0.6, width = 10.9) {
  const lines = bullets.map((text) => ({ text, options: { bullet: { indent: 12 } } }));
  slide.addText(lines, {
    x: left,
    y: startY,
    w: width,
    h: 3.8,
    fontFace: "Calibri",
    fontSize: 18,
    color: colors.text,
    breakLine: true,
    paraSpaceAfterPt: 10,
    valign: "top"
  });
}

function addKpiCard(slide, x, y, label, value, note) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w: 2.65,
    h: 1.8,
    rectRadius: 0.06,
    fill: { color: colors.softAccent },
    line: { color: "C7E7CE", pt: 1 }
  });
  slide.addText(label, {
    x: x + 0.2,
    y: y + 0.2,
    w: 2.2,
    h: 0.28,
    fontFace: "Calibri",
    fontSize: 11,
    bold: true,
    color: colors.muted
  });
  slide.addText(value, {
    x: x + 0.2,
    y: y + 0.55,
    w: 2.2,
    h: 0.5,
    fontFace: "Calibri",
    fontSize: 23,
    bold: true,
    color: colors.primary
  });
  slide.addText(note, {
    x: x + 0.2,
    y: y + 1.2,
    w: 2.2,
    h: 0.45,
    fontFace: "Calibri",
    fontSize: 10,
    color: colors.muted
  });
}

{
  const slide = pptx.addSlide();
  slide.background = { color: colors.primary };
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.33,
    h: 7.5,
    fill: { color: colors.primary },
    line: { color: colors.primary, pt: 0 }
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.75,
    y: 0.75,
    w: 11.9,
    h: 5.9,
    rectRadius: 0.08,
    fill: { color: "13344F" },
    line: { color: "326B8C", pt: 1 }
  });
  slide.addText("Tecbunny", {
    x: 1.2,
    y: 1.5,
    w: 5,
    h: 0.9,
    fontFace: "Calibri",
    fontSize: 48,
    bold: true,
    color: colors.white
  });
  slide.addText("Seed Round Pitch Deck", {
    x: 1.2,
    y: 2.45,
    w: 6,
    h: 0.5,
    fontFace: "Calibri",
    fontSize: 22,
    color: "D9E2EC"
  });
  slide.addText("Raise ask: INR 50 lakh", {
    x: 1.2,
    y: 3.15,
    w: 6,
    h: 0.4,
    fontFace: "Calibri",
    fontSize: 18,
    bold: true,
    color: "9AE6B4"
  });
  slide.addText("Date: July 2026", {
    x: 1.2,
    y: 3.65,
    w: 4,
    h: 0.35,
    fontFace: "Calibri",
    fontSize: 13,
    color: "BCCCDC"
  });
  slide.addText("Confidential - For prospective investors only", {
    x: 1.2,
    y: 6.05,
    w: 6,
    h: 0.3,
    fontFace: "Calibri",
    fontSize: 11,
    color: "BCCCDC"
  });
}

{
  const slide = pptx.addSlide();
  addFrame(slide, "1. Vision", "A trusted operating layer for digital commerce workflows");
  addBullets(slide, [
    "Build a unified platform that helps teams launch, manage, and scale customer communication workflows.",
    "Reduce operational complexity across product, support, and growth teams through one execution fabric.",
    "Become the default control plane for high-frequency customer journey automation in India-first SMB and mid-market segments."
  ]);
}

{
  const slide = pptx.addSlide();
  addFrame(slide, "2. Problem", "Operators are forced to stitch fragmented tools under constant time pressure");
  addBullets(slide, [
    "Teams currently juggle multiple systems for messaging, analytics, compliance, and workflow orchestration.",
    "Fragmentation creates delayed responses, inconsistent customer experiences, and avoidable manual work.",
    "Leaders lack a single source of truth for campaign performance, reliability, and risk management."
  ]);
}

{
  const slide = pptx.addSlide();
  addFrame(slide, "3. Solution", "Tecbunny combines orchestration, governance, and insights in one platform");
  addBullets(slide, [
    "Unified worker-based architecture for resilient message processing and automation.",
    "Role-aware admin surfaces for operations, governance, and audit readiness.",
    "Built-in telemetry and runtime readiness checks to improve reliability and trust."
  ]);
}

{
  const slide = pptx.addSlide();
  addFrame(slide, "4. Market Opportunity", "Large and expanding need for workflow automation in digital-first businesses");
  slide.addText("TAM", {
    x: 1.2,
    y: 2.0,
    w: 2,
    h: 0.4,
    bold: true,
    fontSize: 16,
    color: colors.primary
  });
  slide.addText("INR 12,000 Cr", {
    x: 1.2,
    y: 2.35,
    w: 3,
    h: 0.45,
    bold: true,
    fontSize: 24,
    color: colors.accent
  });
  slide.addText("SAM", {
    x: 4.6,
    y: 2.0,
    w: 2,
    h: 0.4,
    bold: true,
    fontSize: 16,
    color: colors.primary
  });
  slide.addText("INR 2,200 Cr", {
    x: 4.6,
    y: 2.35,
    w: 3,
    h: 0.45,
    bold: true,
    fontSize: 24,
    color: colors.accent
  });
  slide.addText("SOM (3 yr)", {
    x: 8.0,
    y: 2.0,
    w: 2,
    h: 0.4,
    bold: true,
    fontSize: 16,
    color: colors.primary
  });
  slide.addText("INR 120 Cr", {
    x: 8.0,
    y: 2.35,
    w: 3,
    h: 0.45,
    bold: true,
    fontSize: 24,
    color: colors.accent
  });
  addBullets(
    slide,
    [
      "Initial wedge: SMB and mid-market brands requiring compliant multi-channel automation.",
      "Expansion path: analytics products, premium governance modules, and enterprise integrations."
    ],
    3.35,
    1.2,
    10.6
  );
}

{
  const slide = pptx.addSlide();
  addFrame(slide, "5. Business Model", "Recurring software revenue with high-margin add-ons");
  addBullets(slide, [
    "Subscription tiers based on automation volume and advanced feature access.",
    "Implementation and onboarding revenue for managed enterprise rollouts.",
    "Future upside through premium modules: advanced compliance, intelligence, and integrations."
  ]);
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 8.45,
    y: 1.9,
    w: 3.9,
    h: 2.8,
    rectRadius: 0.06,
    fill: { color: "F2F7FC" },
    line: { color: "D9E2EC", pt: 1 }
  });
  slide.addText("Illustrative plan mix", {
    x: 8.75,
    y: 2.1,
    w: 3.2,
    h: 0.3,
    bold: true,
    fontSize: 13,
    color: colors.primary
  });
  slide.addText("Starter: INR 9,999 / month", { x: 8.75, y: 2.55, w: 3.2, h: 0.25, fontSize: 11, color: colors.text });
  slide.addText("Growth: INR 24,999 / month", { x: 8.75, y: 2.9, w: 3.2, h: 0.25, fontSize: 11, color: colors.text });
  slide.addText("Scale: INR 59,999 / month", { x: 8.75, y: 3.25, w: 3.2, h: 0.25, fontSize: 11, color: colors.text });
  slide.addText("Enterprise: custom contract", { x: 8.75, y: 3.6, w: 3.2, h: 0.25, fontSize: 11, color: colors.text });
}

{
  const slide = pptx.addSlide();
  addFrame(slide, "6. Traction", "Early validation across product, reliability, and go-to-market readiness");
  addKpiCard(slide, 1.15, 2.0, "Pilot customers", "12", "Active pilots in target verticals");
  addKpiCard(slide, 4.05, 2.0, "Net revenue retention", "108%", "Expansion within pilot cohort");
  addKpiCard(slide, 6.95, 2.0, "Uptime", "99.9%", "Across core service layer");
  addKpiCard(slide, 9.85, 2.0, "NPS", "+41", "Customer sentiment from pilot users");
  slide.addText("Replace these placeholders with current audited metrics before investor circulation.", {
    x: 1.2,
    y: 4.7,
    w: 10.8,
    h: 0.3,
    fontSize: 10,
    color: "829AB1",
    italic: true
  });
}

{
  const slide = pptx.addSlide();
  addFrame(slide, "7. Go-to-Market", "Land-and-expand motion anchored in performance proof");
  addBullets(slide, [
    "Acquire through founder-led sales, partner referrals, and verticalized content.",
    "Activate with fast onboarding and measurable success criteria in first 30 days.",
    "Expand through usage growth, premium modules, and multi-team adoption within each account."
  ]);
  slide.addShape(pptx.ShapeType.line, { x: 1.2, y: 4.2, w: 10.6, h: 0, line: { color: colors.line, pt: 1 } });
  slide.addText("Lead -> Pilot -> Annual Contract -> Expansion", {
    x: 1.2,
    y: 4.35,
    w: 10.6,
    h: 0.4,
    bold: true,
    align: "center",
    fontSize: 15,
    color: colors.primary
  });
}

{
  const slide = pptx.addSlide();
  addFrame(slide, "8. Competitive Positioning", "Execution depth and governance are our strongest differentiators");
  slide.addText("Key differentiators", {
    x: 1.2,
    y: 1.6,
    w: 4,
    h: 0.3,
    bold: true,
    fontSize: 14,
    color: colors.primary
  });
  addBullets(slide, [
    "Workflow reliability engineered for production-grade message throughput.",
    "Built-in governance and audit pathways for regulated and enterprise-sensitive workflows.",
    "Single command surface for operations, analytics, and risk controls."
  ], 1.95, 1.2, 5.5);

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 7.1,
    y: 1.9,
    w: 4.9,
    h: 3.2,
    rectRadius: 0.05,
    fill: { color: "F8FAFC" },
    line: { color: colors.line, pt: 1 }
  });
  slide.addText("Relative score (illustrative)", {
    x: 7.35,
    y: 2.1,
    w: 4.4,
    h: 0.3,
    fontSize: 12,
    bold: true,
    color: colors.primary
  });
  slide.addText("Reliability: 9/10", { x: 7.35, y: 2.55, w: 4, h: 0.24, fontSize: 11, color: colors.text });
  slide.addText("Governance: 9/10", { x: 7.35, y: 2.9, w: 4, h: 0.24, fontSize: 11, color: colors.text });
  slide.addText("Usability: 8/10", { x: 7.35, y: 3.25, w: 4, h: 0.24, fontSize: 11, color: colors.text });
  slide.addText("Extensibility: 8/10", { x: 7.35, y: 3.6, w: 4, h: 0.24, fontSize: 11, color: colors.text });
}

{
  const slide = pptx.addSlide();
  addFrame(slide, "9. Product Roadmap", "Clear sequence from core platform to intelligence-led expansion");
  slide.addShape(pptx.ShapeType.line, { x: 1.4, y: 2.9, w: 10.2, h: 0, line: { color: colors.line, pt: 2 } });

  const milestones = [
    { quarter: "Q3 2026", title: "Core scale", note: "Reliability hardening + ops automation" },
    { quarter: "Q4 2026", title: "Monetization", note: "Tiered plans + self-serve onboarding" },
    { quarter: "Q1 2027", title: "Expansion", note: "Partner channels + enterprise controls" },
    { quarter: "Q2 2027", title: "Intelligence", note: "Insights modules + predictive workflows" }
  ];

  milestones.forEach((m, i) => {
    const x = 1.7 + i * 2.5;
    slide.addShape(pptx.ShapeType.ellipse, {
      x,
      y: 2.68,
      w: 0.45,
      h: 0.45,
      fill: { color: colors.accent },
      line: { color: colors.accent, pt: 1 }
    });
    slide.addText(m.quarter, {
      x: x - 0.35,
      y: 3.3,
      w: 1.25,
      h: 0.25,
      fontSize: 10,
      bold: true,
      align: "center",
      color: colors.primary
    });
    slide.addText(m.title, {
      x: x - 0.45,
      y: 3.58,
      w: 1.45,
      h: 0.28,
      fontSize: 11,
      bold: true,
      align: "center",
      color: colors.text
    });
    slide.addText(m.note, {
      x: x - 0.8,
      y: 3.86,
      w: 2.15,
      h: 0.45,
      fontSize: 9,
      align: "center",
      color: colors.muted
    });
  });
}

{
  const slide = pptx.addSlide();
  addFrame(slide, "10. Technology", "Cloud-native architecture built for resilience and controlled scale");
  addBullets(slide, [
    "Service boundaries and worker pipelines designed to isolate failures and protect throughput.",
    "Runtime checks and quality gates integrated into release workflow.",
    "Security-first development with role-based control surfaces and audit trails."
  ]);
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 8.3,
    y: 1.75,
    w: 3.9,
    h: 3.4,
    rectRadius: 0.06,
    fill: { color: "EEF4FA" },
    line: { color: colors.line, pt: 1 }
  });
  slide.addText("Architecture outcomes", {
    x: 8.6,
    y: 2.0,
    w: 3.3,
    h: 0.3,
    bold: true,
    fontSize: 13,
    color: colors.primary
  });
  slide.addText("Low-latency processing", { x: 8.6, y: 2.45, w: 3.2, h: 0.25, fontSize: 11, color: colors.text });
  slide.addText("Structured observability", { x: 8.6, y: 2.8, w: 3.2, h: 0.25, fontSize: 11, color: colors.text });
  slide.addText("Security & compliance readiness", { x: 8.6, y: 3.15, w: 3.2, h: 0.25, fontSize: 11, color: colors.text });
  slide.addText("Enterprise integration path", { x: 8.6, y: 3.5, w: 3.2, h: 0.25, fontSize: 11, color: colors.text });
}

{
  const slide = pptx.addSlide();
  addFrame(slide, "11. Financial Summary", "Path to disciplined growth and improving efficiency");
  slide.addText("Illustrative 5-year snapshot", {
    x: 1.2,
    y: 1.5,
    w: 3.5,
    h: 0.3,
    fontSize: 12,
    bold: true,
    color: colors.primary
  });

  const cols = [1.2, 3.25, 5.15, 7.05, 8.95, 10.85];
  const header = ["Metric", "FY27", "FY28", "FY29", "FY30", "FY31"];
  header.forEach((h, i) => {
    slide.addText(h, {
      x: cols[i],
      y: 1.95,
      w: i === 0 ? 2.05 : 1.65,
      h: 0.3,
      fontSize: 11,
      bold: true,
      align: i === 0 ? "left" : "center",
      color: colors.primary
    });
  });

  const rows = [
    ["Revenue (INR Cr)", "0.8", "2.6", "6.0", "11.2", "17.5"],
    ["Gross Margin %", "58%", "64%", "69%", "72%", "74%"],
    ["EBITDA Margin %", "-58%", "-25%", "2%", "14%", "22%"],
    ["Runway (months)", "22", "16", "-", "-", "-"]
  ];

  rows.forEach((row, r) => {
    const y = 2.35 + r * 0.55;
    slide.addShape(pptx.ShapeType.rect, {
      x: 1.15,
      y: y - 0.05,
      w: 11.45,
      h: 0.46,
      fill: { color: r % 2 === 0 ? "F8FBFD" : "FFFFFF" },
      line: { color: "E6EEF5", pt: 0.5 }
    });
    row.forEach((val, c) => {
      slide.addText(val, {
        x: cols[c],
        y,
        w: c === 0 ? 2.05 : 1.65,
        h: 0.28,
        fontSize: 10,
        align: c === 0 ? "left" : "center",
        color: colors.text
      });
    });
  });

  slide.addText("Replace with finalized model outputs before circulation.", {
    x: 1.2,
    y: 4.9,
    w: 6,
    h: 0.25,
    fontSize: 9,
    italic: true,
    color: "829AB1"
  });
}

{
  const slide = pptx.addSlide();
  addFrame(slide, "12. Funding Ask", "INR 50 lakh to reach the next measurable value inflection");
  addBullets(slide, [
    "Round size: INR 50 lakh (seed) targeting 18-24 months of runway.",
    "Use of funds: product and reliability (40%), growth engine (35%), team and operations (20%), compliance reserve (5%).",
    "Milestones: repeatable acquisition channel, improved retention, and readiness for larger institutional round."
  ]);

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 8.0,
    y: 2.0,
    w: 4.3,
    h: 2.9,
    rectRadius: 0.08,
    fill: { color: "F1FAF4" },
    line: { color: "CDEED8", pt: 1 }
  });
  slide.addText("Milestones by Month 18", {
    x: 8.3,
    y: 2.2,
    w: 3.8,
    h: 0.3,
    bold: true,
    fontSize: 12,
    color: colors.primary
  });
  slide.addText("MRR > INR 25 lakh", { x: 8.3, y: 2.65, w: 3.6, h: 0.25, fontSize: 11, color: colors.text });
  slide.addText("Net retention > 115%", { x: 8.3, y: 3.0, w: 3.6, h: 0.25, fontSize: 11, color: colors.text });
  slide.addText("Payback < 8 months", { x: 8.3, y: 3.35, w: 3.6, h: 0.25, fontSize: 11, color: colors.text });
  slide.addText("Enterprise-ready controls", { x: 8.3, y: 3.7, w: 3.6, h: 0.25, fontSize: 11, color: colors.text });
}

{
  const slide = pptx.addSlide();
  addFrame(slide, "13. Team", "Execution-focused founders with product and systems depth");

  const members = [
    ["Founder / CEO", "Business, GTM, and strategic partnerships"],
    ["Co-Founder / CTO", "Architecture, platform reliability, and product engineering"],
    ["Core Operators", "Delivery, customer success, and compliance operations"]
  ];

  members.forEach((m, i) => {
    const y = 1.85 + i * 1.35;
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 1.2,
      y,
      w: 10.9,
      h: 1.05,
      rectRadius: 0.05,
      fill: { color: i % 2 === 0 ? "F8FBFD" : "FFFFFF" },
      line: { color: colors.line, pt: 1 }
    });
    slide.addText(m[0], {
      x: 1.55,
      y: y + 0.24,
      w: 3.0,
      h: 0.3,
      fontSize: 14,
      bold: true,
      color: colors.primary
    });
    slide.addText(m[1], {
      x: 4.15,
      y: y + 0.24,
      w: 7.5,
      h: 0.45,
      fontSize: 12,
      color: colors.text
    });
  });
}

{
  const slide = pptx.addSlide();
  slide.background = { color: colors.primary };
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.33,
    h: 7.5,
    fill: { color: colors.primary },
    line: { color: colors.primary, pt: 0 }
  });
  slide.addText("Thank You", {
    x: 1.0,
    y: 2.1,
    w: 4.5,
    h: 0.9,
    fontFace: "Calibri",
    fontSize: 52,
    bold: true,
    color: colors.white
  });
  slide.addText("Let us build the next trusted operating layer for digital commerce.", {
    x: 1.05,
    y: 3.2,
    w: 7.2,
    h: 0.55,
    fontSize: 20,
    color: "D9E2EC"
  });
  slide.addText("Contact", {
    x: 1.05,
    y: 4.3,
    w: 1.8,
    h: 0.3,
    fontSize: 14,
    bold: true,
    color: "9AE6B4"
  });
  slide.addText("[Founder Name]  |  [Email]  |  [Phone]", {
    x: 1.05,
    y: 4.65,
    w: 5.8,
    h: 0.3,
    fontSize: 13,
    color: colors.white
  });
  slide.addText("Confidential - Not for redistribution", {
    x: 1.05,
    y: 6.45,
    w: 4,
    h: 0.25,
    fontSize: 10,
    color: "BCCCDC"
  });
}

await pptx.writeFile({ fileName: outFile });
console.log(`Created deck: ${outFile}`);

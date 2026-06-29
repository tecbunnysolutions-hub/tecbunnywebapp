import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load env variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase configuration in .env.local!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const projectData = {
  name: "EduPortal and EduOS",
  explanation: "EduPortal and EduOS form a hybrid, offline-first edge computing architecture engineered specifically for low-connectivity and rural school environments. Traditional educational software completely breaks when internet connectivity drops, creating massive administrative bottlenecks.\n\nBy deploying a localized hardware-software ecosystem on campus, this project unifies entire school daily workflows—from registration to final examinations—into a single, highly resilient application. Operating as \"one calm control room for modern schools,\" the platform addresses structural administrative chaos while acting as a compliant vehicle for India's National Education Policy (NEP 2020) mandates.",
  target_amount: 10000000, // 1 Crore (100 Lakhs = 1,00,00,000)
  amount_raised: 0,
  motive: "EduPortal and EduOS unifies entire school daily workflows—from registration to final examinations—into a single, highly resilient application. The platform addresses structural administrative chaos while acting as a compliant vehicle for India's National Education Policy (NEP 2020) mandates in low-connectivity rural school environments.",
  status: "Pipeline",
  detailed_information: `<h3>1. EXECUTIVE SUMMARY</h3>
<p>EduPortal and EduOS form a hybrid, offline-first edge computing architecture engineered specifically for low-connectivity and rural school environments. Traditional educational software completely breaks when internet connectivity drops, creating massive administrative bottlenecks. By deploying a localized hardware-software ecosystem on campus, this project unifies entire school daily workflows—from registration to final examinations—into a single, highly resilient application. Operating as "one calm control room for modern schools," the platform addresses structural administrative chaos while acting as a compliant vehicle for India's National Education Policy (NEP 2020) mandates.</p>

<h3>2. PROBLEM STATEMENT & MARKET OPPORTUNITY</h3>
<p>• The Connectivity Paradox: Schools across regional and Tier-2/3 sectors heavily desire modern, AI-powered digital tools but lack the persistent, high-bandwidth internet connectivity required to run traditional cloud software.</p>
<p>• Cloud Dependency Fragility: Pure-cloud platforms suffer total operational failure during internet blackouts, leaving teachers unable to access basic daily tools like attendance tracking or digital lesson plans.</p>
<p>• Administrative Fragmentation: School operations are structurally chaotic, forcing educators to juggle multiple disconnected applications for attendance, compliance, gradebooks, and student reporting.</p>
<p>• The Maintenance Nightmare: Deploying localized servers or complex IT networks in remote setups traditionally requires an extensive, highly expensive on-the-ground IT support presence.</p>
<p>• Capital Intensity: Hardware distribution models for educational technology are notorious for exhausting upfront capital without providing long-term operational scaling mechanisms.</p>

<h3>3. PRODUCT & TECHNICAL ARCHITECTURE SPECIFICATION</h3>
<p>The system replaces standard cloud-only models with a two-tiered, offline-resilient edge infrastructure.</p>
<p>• Class Station (Edge Server Node): Operates on the campus perimeter, hosting local services on http://127.0.0.1:4102/school/teacher. It connects to external networks only to execute cloud syncs or external cloud API calls, running flawlessly offline during dropouts by queuing database updates locally.</p>
<p>• Resilient Data Storage: Backed by 1.5TB of local storage. It features an automated First-In-First-Out (FIFO) cleaning mechanism to purge the oldest cached assets and prevent storage overflow. To protect against physical drive corruption, it enforces a minimum RAID 1 (Mirroring) disk setup.</p>
<p>• Student Hub (Intranet Client): Accessible locally on http://127.0.0.1:4101/school/student. It functions entirely within the school's local intranet perimeter with zero outbound public internet access required, serving as the interactive thin-client for student desks.</p>

<h3>4. CORE WORKFLOWS & FUNCTIONAL MODULES</h3>
<p>• Asynchronous "Local-to-Cloud" AI Workflow: A student or teacher submits a prompt (e.g., creating flashcards or summarizations) from an offline Student Hub thin-client. The Next.js API captures the request and inserts a pending row into the local Supabase database. The moment the Class Station catches an internet signal, a background worker handles the payload, securely executing remote cloud API endpoints (Gemini). The generated assets are downloaded, cached at the edge, and pushed to the Student Hub interface using real-time browser subscriptions.</p>
<p>• Interactive Media & AI Studio: The AI Studio module parses raw JSON schemas generated from notes and renders interactive slides or presentation decks completely inside the browser viewport, avoiding capital-heavy generation of physical .pptx files. Media transfers adapt to weak cellular connections by leveraging chunked, resumable file uploads.</p>
<p>• The Localized Exam Lifecycle: Live examinations are deployed and completed locally across Student Hubs without pinging public clouds. When connection permits, encrypted performance arrays push to the central cloud repository, triggering automated AI-driven OCR document grading.</p>

<h3>5. UNIQUE SELLING PROPOSITION (USP) & POLICY ALIGNMENT</h3>
<p>• The "Calm" Operational Control Room: The primary interface unifies staff management, lesson pacing, student registration, scheduling, and standard administrative overhead into one central dashboard. This gives administrators emotional relief from traditional, chaotic school management overhead.</p>
<p>• NEP-2020 Compliance Engine: "NEP-Ready Operations" act as an aggressive compliance wedge. 360-Degree Holistic Progress Cards aggregate academic testing, behavioral metrics, and continuous extracurricular development parameters. Competency-Based Assessment replaces traditional high-stakes testing matrices with formative metric tracking arrays evaluating critical thinking.</p>

<h3>6. BUSINESS MODEL & GO-TO-MARKET STRATEGY</h3>
<p>• Revenue Model: Sustainable B2B model tailored for educational groups and regional systems. Recurrent subscription modeling charged per student node for platform access, AI features, and compliance logging. Hardware Licensing Packages offer one-time or leased licensing models for localized edge-server equipment.</p>
<p>• Scalability via Fleet Management: Remote telemetry tracking layout lets central administrators trace the systemic health, compute load, disk capacity, and background sync logs of thousands of scattered edge systems from a remote cloud dashboard, ensuring hyper-scalability.</p>

<h3>7. RISK MANAGEMENT & ENGINEERING Q&A</h3>
<p>• Q: How does the system resolve data collisions if record modifications occur concurrently online and offline?</p>
<p>• A: When an offline Class Station triggers its data re-sync, entries are merged using Conflict-free Replicated Data Types (CRDTs) or explicit, timestamped vector clocks embedded in the Supabase schema layer.</p>
<p>• Q: What prevents student lockouts from localized interfaces during prolonged internet outages?</p>
<p>• A: EduOS implements a secure local auth-proxy on the Class Station that issues short-lived offline authentication tokens, keeping students verified on the local intranet indefinitely.</p>

<h3>8. CURRENT IMPLEMENTATION STATUS & FINANCIAL ASK</h3>
<p>• Repository Benchmarks: Active private repository tracking over 101 developmental commits, with successfully compiled deployment-ready image footprints for student-hub-v1.0.0.img and class-station-v1.0.0.img.</p>
<p>• Fund Requirement: Evaluating a 1 Crore (1CR) Convertible Note framework. Capital will fund hardware deployment provisioning, local quantized LLM integration fallbacks, and regional compliance expansion campaigns.</p>`
};

async function insertProject() {
  try {
    // Check if the project already exists
    const { data: existing, error: fetchError } = await supabase
      .from('upcoming_projects')
      .select('id')
      .eq('name', projectData.name)
      .maybeSingle();

    if (fetchError) {
      console.error("Error checking existing project:", fetchError);
      return;
    }

    if (existing) {
      console.log(`Project "${projectData.name}" already exists in the database. Updating it...`);
      const { error: updateError } = await supabase
        .from('upcoming_projects')
        .update(projectData)
        .eq('id', existing.id);
      
      if (updateError) {
        console.error("Error updating project:", updateError);
      } else {
        console.log("Project successfully updated!");
      }
    } else {
      console.log(`Inserting new project "${projectData.name}"...`);
      const { error: insertError } = await supabase
        .from('upcoming_projects')
        .insert([projectData]);

      if (insertError) {
        console.error("Error inserting project:", insertError);
      } else {
        console.log("Project successfully inserted!");
      }
    }
  } catch (err) {
    console.error("Failed to run database script:", err);
  }
}

insertProject();

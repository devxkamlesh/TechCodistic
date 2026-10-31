import {
  AssessmentQuestion,
  Course,
  CourseType,
  DifficultyLevel,
  Internship,
  InternshipTask,
  Lesson,
  PlatformState,
} from './schema';

interface RawCourseSpec {
  catalogNumber: number;
  title: string;
  category: string;
  type: CourseType;
  level: DifficultyLevel;
  durationHours: number;
  learnerCount: number;
  summary: string;
}

const TOP_50_COURSE_SPECS: RawCourseSpec[] = [
  // Information Technology & AI (1–12)
  {
    catalogNumber: 1,
    title: 'Diploma in Full-Stack Web Development (Next.js & TypeScript)',
    category: 'Information Technology & AI',
    type: 'diploma',
    level: 'intermediate',
    durationHours: 28,
    learnerCount: 148200,
    summary: 'Architect edge-rendered Next.js App Router applications with Server Actions, Drizzle ORM, and serverless PostgreSQL pooling.',
  },
  {
    catalogNumber: 2,
    title: 'Diploma in Artificial Intelligence and Machine Learning',
    category: 'Information Technology & AI',
    type: 'diploma',
    level: 'advanced',
    durationHours: 32,
    learnerCount: 162400,
    summary: 'Master supervised learning, transformer architectures, vector embeddings, and production model evaluation pipelines.',
  },
  {
    catalogNumber: 3,
    title: 'Diploma in Cybersecurity and Network Defense',
    category: 'Information Technology & AI',
    type: 'diploma',
    level: 'intermediate',
    durationHours: 24,
    learnerCount: 118900,
    summary: 'Implement zero-trust network defense, intrusion detection systems, cryptographic protocols, and incident triage.',
  },
  {
    catalogNumber: 4,
    title: 'Diploma in Data Science and Analytics with Python',
    category: 'Information Technology & AI',
    type: 'diploma',
    level: 'intermediate',
    durationHours: 26,
    learnerCount: 134600,
    summary: 'Build statistical data pipelines, exploratory visualizations, and predictive regression models with NumPy and Pandas.',
  },
  {
    catalogNumber: 5,
    title: 'Introduction to Software Quality Management (Certificate)',
    category: 'Information Technology & AI',
    type: 'certificate',
    level: 'beginner',
    durationHours: 8,
    learnerCount: 74300,
    summary: 'Establish automated testing pyramids, continuous integration gates, ISO software quality metrics, and defect auditing.',
  },
  {
    catalogNumber: 6,
    title: 'Certificate in Prompt Engineering & LLM Applications',
    category: 'Information Technology & AI',
    type: 'certificate',
    level: 'beginner',
    durationHours: 10,
    learnerCount: 189500,
    summary: 'Design structured system prompts, retrieval-augmented generation (RAG) workflows, and deterministic tool-calling evaluations.',
  },
  {
    catalogNumber: 7,
    title: 'Diploma in Cloud Computing & DevOps (Docker, CI/CD, Linux)',
    category: 'Information Technology & AI',
    type: 'diploma',
    level: 'advanced',
    durationHours: 30,
    learnerCount: 112400,
    summary: 'Automate multi-stage container builds, Linux kernel tuning, GitHub Actions deployment pipelines, and cloud observability.',
  },
  {
    catalogNumber: 8,
    title: 'Certificate in Ethical Hacking & Penetration Testing',
    category: 'Information Technology & AI',
    type: 'certificate',
    level: 'intermediate',
    durationHours: 12,
    learnerCount: 98700,
    summary: 'Execute OWASP Top 10 vulnerability assessments, reconnaissance workflows, and responsible remediation reporting.',
  },
  {
    catalogNumber: 9,
    title: 'Diploma in Database Administration (PostgreSQL & SQL)',
    category: 'Information Technology & AI',
    type: 'diploma',
    level: 'intermediate',
    durationHours: 22,
    learnerCount: 91200,
    summary: 'Optimize B-Tree and GIN indexing, PgBouncer connection pooling, MVCC transaction isolation, and write-ahead log replication.',
  },
  {
    catalogNumber: 10,
    title: 'Certificate in UI/UX Design Fundamentals with Figma',
    category: 'Information Technology & AI',
    type: 'certificate',
    level: 'beginner',
    durationHours: 11,
    learnerCount: 106800,
    summary: 'Create accessible design systems, tokenized auto-layout components, interactive prototypes, and usability heuristics.',
  },
  {
    catalogNumber: 11,
    title: 'Diploma in Python Programming from Beginner to Advanced',
    category: 'Information Technology & AI',
    type: 'diploma',
    level: 'beginner',
    durationHours: 25,
    learnerCount: 176300,
    summary: 'Write idiomatic Python covering data structures, asynchronous coroutines, type annotations, and package engineering.',
  },
  {
    catalogNumber: 12,
    title: 'Certificate in IT Support and Helpdesk Fundamentals',
    category: 'Information Technology & AI',
    type: 'certificate',
    level: 'beginner',
    durationHours: 9,
    learnerCount: 68400,
    summary: 'Troubleshoot enterprise operating systems, DNS/DHCP networking, Active Directory identity, and ITIL ticket SLA workflows.',
  },

  // Business, Finance & Management (13–24)
  {
    catalogNumber: 13,
    title: 'Diploma in Certified Associate in Project Management',
    category: 'Business, Finance & Management',
    type: 'diploma',
    level: 'intermediate',
    durationHours: 24,
    learnerCount: 129400,
    summary: 'Lead complex project charters using critical path scheduling, earned value management, and risk mitigation matrices.',
  },
  {
    catalogNumber: 14,
    title: 'Diploma in Financial Accounting',
    category: 'Business, Finance & Management',
    type: 'diploma',
    level: 'beginner',
    durationHours: 22,
    learnerCount: 114200,
    summary: 'Prepare accrual-basis balance sheets, income statements, cash flow reconciliations, and IFRS/GAAP audit disclosures.',
  },
  {
    catalogNumber: 15,
    title: 'Diploma in Operations and Supply Management',
    category: 'Business, Finance & Management',
    type: 'diploma',
    level: 'intermediate',
    durationHours: 20,
    learnerCount: 88600,
    summary: 'Streamline global procurement, EOQ inventory forecasting, Six Sigma process capability, and warehouse throughput.',
  },
  {
    catalogNumber: 16,
    title: 'Diploma in Organizational Behaviour',
    category: 'Business, Finance & Management',
    type: 'diploma',
    level: 'intermediate',
    durationHours: 18,
    learnerCount: 72100,
    summary: 'Analyze team dynamics, incentive architecture, institutional culture transformation, and cross-functional decision making.',
  },
  {
    catalogNumber: 17,
    title: 'Business Ethics and Corporate Social Responsibility (Certificate)',
    category: 'Business, Finance & Management',
    type: 'certificate',
    level: 'beginner',
    durationHours: 7,
    learnerCount: 64900,
    summary: 'Evaluate stakeholder governance, ESG sustainability reporting frameworks, anti-bribery compliance, and ethical leadership.',
  },
  {
    catalogNumber: 18,
    title: 'Microeconomics: Supply, Demand, and Equilibrium (Certificate)',
    category: 'Business, Finance & Management',
    type: 'certificate',
    level: 'beginner',
    durationHours: 8,
    learnerCount: 79300,
    summary: 'Model price elasticity, marginal utility curves, market structure competition, and welfare economics.',
  },
  {
    catalogNumber: 19,
    title: 'Diploma in Human Resource Management (HRM)',
    category: 'Business, Finance & Management',
    type: 'diploma',
    level: 'intermediate',
    durationHours: 21,
    learnerCount: 109500,
    summary: 'Structure competency-based talent acquisition, performance calibration rubrics, compensation bands, and labor compliance.',
  },
  {
    catalogNumber: 20,
    title: 'Diploma in Business Administration & Office Management',
    category: 'Business, Finance & Management',
    type: 'diploma',
    level: 'beginner',
    durationHours: 19,
    learnerCount: 95400,
    summary: 'Coordinate executive operations, vendor contracts, budgetary controls, and enterprise documentation standards.',
  },
  {
    catalogNumber: 21,
    title: 'Certificate in GST, Taxation, and Business Invoicing',
    category: 'Business, Finance & Management',
    type: 'certificate',
    level: 'intermediate',
    durationHours: 10,
    learnerCount: 83700,
    summary: 'Compute input tax credits, HSN/SAC classification codes, e-invoicing reconciliations, and statutory tax filings.',
  },
  {
    catalogNumber: 22,
    title: 'Diploma in Entrepreneurship and Startup Management',
    category: 'Business, Finance & Management',
    type: 'diploma',
    level: 'intermediate',
    durationHours: 23,
    learnerCount: 101200,
    summary: 'Validate unit economics, customer acquisition payback, cap table dilution modeling, and go-to-market product launches.',
  },
  {
    catalogNumber: 23,
    title: 'Certificate in Agile, Scrum, and Kanban Methodologies',
    category: 'Business, Finance & Management',
    type: 'certificate',
    level: 'beginner',
    durationHours: 9,
    learnerCount: 121800,
    summary: 'Facilitate sprint planning, backlog refinement, cumulative flow diagnostics, and velocity-driven engineering delivery.',
  },
  {
    catalogNumber: 24,
    title: 'Diploma in Strategic Leadership and Team Management',
    category: 'Business, Finance & Management',
    type: 'diploma',
    level: 'advanced',
    durationHours: 22,
    learnerCount: 89100,
    summary: 'Drive OKR alignment, high-stakes conflict resolution, executive coaching, and multi-quarter capital allocation.',
  },

  // Sales, Marketing & Digital Growth (25–30)
  {
    catalogNumber: 25,
    title: 'Diploma in Digital Marketing, SEO, and PPC Strategy',
    category: 'Sales, Marketing & Digital Growth',
    type: 'diploma',
    level: 'intermediate',
    durationHours: 24,
    learnerCount: 138400,
    summary: 'Execute technical SEO audits, programmatic search bidding, multi-touch attribution, and ROAS optimization.',
  },
  {
    catalogNumber: 26,
    title: 'Certificate in Social Media Marketing & Content Creation',
    category: 'Sales, Marketing & Digital Growth',
    type: 'certificate',
    level: 'beginner',
    durationHours: 8,
    learnerCount: 94200,
    summary: 'Build short-form video editorial calendars, audience retention hooks, and organic community growth loops.',
  },
  {
    catalogNumber: 27,
    title: 'Certificate in Google Analytics and Conversion Optimization',
    category: 'Sales, Marketing & Digital Growth',
    type: 'certificate',
    level: 'intermediate',
    durationHours: 10,
    learnerCount: 87500,
    summary: 'Instrument GA4 custom event funnels, cohort retention tables, and statistically rigorous A/B landing page tests.',
  },
  {
    catalogNumber: 28,
    title: 'Diploma in E-Commerce and Direct-to-Consumer (D2C) Brand Building',
    category: 'Sales, Marketing & Digital Growth',
    type: 'diploma',
    level: 'intermediate',
    durationHours: 21,
    learnerCount: 78900,
    summary: 'Scale merchandising conversion rates, checkout recovery flows, 3PL fulfillment SLAs, and LTV/CAC unit economics.',
  },
  {
    catalogNumber: 29,
    title: 'Certificate in B2B Sales, Negotiation, and CRM Mastery',
    category: 'Sales, Marketing & Digital Growth',
    type: 'certificate',
    level: 'intermediate',
    durationHours: 9,
    learnerCount: 81300,
    summary: 'Run consultative MEDDIC discovery calls, enterprise procurement negotiations, and pipeline forecasting in CRM systems.',
  },
  {
    catalogNumber: 30,
    title: 'Certificate in Copywriting and Brand Storytelling',
    category: 'Sales, Marketing & Digital Growth',
    type: 'certificate',
    level: 'beginner',
    durationHours: 7,
    learnerCount: 73600,
    summary: 'Craft high-converting value propositions, editorial case studies, and direct-response email sequences.',
  },

  // Engineering, Manufacturing & Safety (31–38)
  {
    catalogNumber: 31,
    title: 'Diploma in Structural Dynamics for Civil Engineers - SDOF Systems',
    category: 'Engineering, Manufacturing & Safety',
    type: 'diploma',
    level: 'advanced',
    durationHours: 26,
    learnerCount: 62400,
    summary: 'Formulate equations of motion for single-degree-of-freedom structures under harmonic, impulse, and seismic excitation.',
  },
  {
    catalogNumber: 32,
    title: 'Advanced Diploma in Wastewater Treatment and Recycling',
    category: 'Engineering, Manufacturing & Safety',
    type: 'diploma',
    level: 'advanced',
    durationHours: 28,
    learnerCount: 54800,
    summary: 'Design biological nutrient removal reactors, membrane filtration stages, and zero-liquid-discharge industrial plants.',
  },
  {
    catalogNumber: 33,
    title: 'Digital Manufacturing and Industry 4.0 (Certificate)',
    category: 'Engineering, Manufacturing & Safety',
    type: 'certificate',
    level: 'intermediate',
    durationHours: 10,
    learnerCount: 69200,
    summary: 'Integrate IIoT sensor telemetry, digital twins, predictive maintenance algorithms, and PLC automation cells.',
  },
  {
    catalogNumber: 34,
    title: 'Diploma in Fire Safety',
    category: 'Engineering, Manufacturing & Safety',
    type: 'diploma',
    level: 'intermediate',
    durationHours: 18,
    learnerCount: 84100,
    summary: 'Conduct NFPA fire hazard audits, suppression hydraulic calculations, compartmentalization, and emergency egress planning.',
  },
  {
    catalogNumber: 35,
    title: 'An Introduction to Good Lab Practices (Certificate)',
    category: 'Engineering, Manufacturing & Safety',
    type: 'certificate',
    level: 'beginner',
    durationHours: 6,
    learnerCount: 58900,
    summary: 'Enforce analytical instrument calibration, chain-of-custody sample logging, biosafety cabinets, and SOP documentation.',
  },
  {
    catalogNumber: 36,
    title: 'Diploma in Electrical Engineering and Circuit Design',
    category: 'Engineering, Manufacturing & Safety',
    type: 'diploma',
    level: 'intermediate',
    durationHours: 25,
    learnerCount: 92700,
    summary: 'Analyze AC/DC network theorems, three-phase power distribution, operational amplifiers, and PCB layout constraints.',
  },
  {
    catalogNumber: 37,
    title: 'Diploma in Renewable Energy and Solar Technology',
    category: 'Engineering, Manufacturing & Safety',
    type: 'diploma',
    level: 'intermediate',
    durationHours: 22,
    learnerCount: 77400,
    summary: 'Size photovoltaic arrays, MPPT inverter topologies, battery storage capacity, and grid-tie interconnection protection.',
  },
  {
    catalogNumber: 38,
    title: 'Certificate in AutoCAD and Architectural Drafting',
    category: 'Engineering, Manufacturing & Safety',
    type: 'certificate',
    level: 'beginner',
    durationHours: 12,
    learnerCount: 88300,
    summary: 'Produce precise 2D orthographic projections, layer standards, GD&T dimensioning, and structural construction blueprints.',
  },

  // Health, Food Safety & Hospitality (39–44)
  {
    catalogNumber: 39,
    title: 'Diploma in Food Safety',
    category: 'Health, Food Safety & Hospitality',
    type: 'diploma',
    level: 'intermediate',
    durationHours: 20,
    learnerCount: 104600,
    summary: 'Prevent foodborne pathogens through cold-chain thermal monitoring, allergen segregation, and sanitation validation.',
  },
  {
    catalogNumber: 40,
    title: 'HACCP Essentials and Catering Food Safety (Certificate)',
    category: 'Health, Food Safety & Hospitality',
    type: 'certificate',
    level: 'beginner',
    durationHours: 8,
    learnerCount: 91800,
    summary: 'Implement the 7 principles of Hazard Analysis Critical Control Point (HACCP) across commercial kitchen operations.',
  },
  {
    catalogNumber: 41,
    title: 'Food Processing Technology and Quality of Food (Certificate)',
    category: 'Health, Food Safety & Hospitality',
    type: 'certificate',
    level: 'intermediate',
    durationHours: 9,
    learnerCount: 53400,
    summary: 'Evaluate pasteurization kinetics, modified atmosphere packaging, sensory shelf-life testing, and ISO 22000 standards.',
  },
  {
    catalogNumber: 42,
    title: 'Managing Health and Safety in Healthcare (Certificate)',
    category: 'Health, Food Safety & Hospitality',
    type: 'certificate',
    level: 'intermediate',
    durationHours: 10,
    learnerCount: 76200,
    summary: 'Maintain clinical infection control protocols, sharps disposal compliance, patient ergonomics, and ward safety audits.',
  },
  {
    catalogNumber: 43,
    title: 'Hospitality Management - Health and Safety in Food Service (Certificate)',
    category: 'Health, Food Safety & Hospitality',
    type: 'certificate',
    level: 'beginner',
    durationHours: 7,
    learnerCount: 67900,
    summary: 'Standardize front-of-house hygiene, banquet thermal holding compliance, and guest allergen response protocols.',
  },
  {
    catalogNumber: 44,
    title: 'Diploma in Physical Fitness',
    category: 'Health, Food Safety & Hospitality',
    type: 'diploma',
    level: 'intermediate',
    durationHours: 19,
    learnerCount: 82500,
    summary: 'Program periodized strength conditioning, biomechanical movement screening, and cardiopulmonary VO2 max progression.',
  },

  // Academics, Languages & Personal Development (45–50)
  {
    catalogNumber: 45,
    title: 'Soft Skills for Professionals (Certificate)',
    category: 'Academics, Languages & Personal Development',
    type: 'certificate',
    level: 'beginner',
    durationHours: 6,
    learnerCount: 115400,
    summary: 'Communicate with executive clarity, structure persuasive technical memos, and navigate cross-cultural collaboration.',
  },
  {
    catalogNumber: 46,
    title: 'Diploma in Development & Education in Early Childhood',
    category: 'Academics, Languages & Personal Development',
    type: 'diploma',
    level: 'intermediate',
    durationHours: 20,
    learnerCount: 74800,
    summary: 'Apply Piaget and Vygotsky developmental scaffolding, play-based literacy curricula, and inclusive classroom observation.',
  },
  {
    catalogNumber: 47,
    title: 'Understanding Research Methods and Approaches (Certificate)',
    category: 'Academics, Languages & Personal Development',
    type: 'certificate',
    level: 'intermediate',
    durationHours: 9,
    learnerCount: 69700,
    summary: 'Design quantitative and qualitative research instruments, sampling frames, hypothesis tests, and peer-review citations.',
  },
  {
    catalogNumber: 48,
    title: 'Diploma in Music Theory',
    category: 'Academics, Languages & Personal Development',
    type: 'diploma',
    level: 'beginner',
    durationHours: 18,
    learnerCount: 61200,
    summary: 'Analyze diatonic harmony, voice leading counterpoint, modal modulation, and rhythmic metric orchestration.',
  },
  {
    catalogNumber: 49,
    title: 'Diploma in Meteorology',
    category: 'Academics, Languages & Personal Development',
    type: 'diploma',
    level: 'intermediate',
    durationHours: 21,
    learnerCount: 49800,
    summary: 'Interpret synoptic pressure charts, atmospheric thermodynamics, geostrophic wind vectors, and Doppler radar mesocyclones.',
  },
  {
    catalogNumber: 50,
    title: 'Navigating Geopolitics in the 21st Century (Certificate)',
    category: 'Academics, Languages & Personal Development',
    type: 'certificate',
    level: 'intermediate',
    durationHours: 8,
    learnerCount: 71500,
    summary: 'Examine semiconductor supply chains, maritime trade corridors, sovereign energy transitions, and multilateral treaties.',
  },
];

function slugify(title: string, catalogNumber: number): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${catalogNumber}-${base}`;
}

export function buildCoursesAndContent(): {
  courses: Course[];
  lessonsByCourseId: Record<string, Lesson[]>;
  questionsByCourseId: Record<string, AssessmentQuestion[]>;
} {
  const courses: Course[] = [];
  const lessonsByCourseId: Record<string, Lesson[]> = {};
  const questionsByCourseId: Record<string, AssessmentQuestion[]> = {};

  for (const spec of TOP_50_COURSE_SPECS) {
    const id = `course-${spec.catalogNumber}`;
    const slug = slugify(spec.title, spec.catalogNumber);
    courses.push({
      id,
      catalogNumber: spec.catalogNumber,
      title: spec.title,
      slug,
      category: spec.category,
      type: spec.type,
      level: spec.level,
      durationHours: spec.durationHours,
      learnerCount: spec.learnerCount,
      passingScore: 80,
      isPublished: true,
      summary: spec.summary,
      outcomes: [
        `Master core architecture and practical methodologies in ${spec.title}`,
        'Complete adaptive HLS video modules with synchronized study notes',
        'Pass the randomized final competency assessment with ≥ 80% accuracy',
        'Unlock a cryptographically signed, QR-verifiable credential and prerequisite access',
      ],
      createdAt: '2026-01-10T09:00:00.000Z',
    });

    lessonsByCourseId[id] = [
      {
        id: `${id}-lesson-1`,
        courseId: id,
        title: `Module 1: Architectural Foundations & Core Principles`,
        sortOrder: 1,
        durationMinutes: 24,
        videoHlsUrl: `https://edge-cdn.techcodistic.com/hls/${slug}/module-1/master.m3u8`,
        contentMarkdown: `### 1. Domain Foundations\n${spec.summary}\n\n#### Key Technical Takeaways\n- Establish deterministic workflows and measurable quality benchmarks.\n- Align daily execution with industry-verified standards across **${spec.category}**.\n- Prepare for the hands-on case study in Module 2.`,
      },
      {
        id: `${id}-lesson-2`,
        courseId: id,
        title: `Module 2: Applied Systems, Tooling & Implementation`,
        sortOrder: 2,
        durationMinutes: 32,
        videoHlsUrl: `https://edge-cdn.techcodistic.com/hls/${slug}/module-2/master.m3u8`,
        contentMarkdown: `### 2. Production Implementation\nIn this module, we transition from theoretical models to operational execution.\n\n#### Implementation Checklist\n1. Configure reproducible environments and baseline telemetry.\n2. Audit failure modes and latency bottlenecks before scaling.\n3. Document verification artifacts for peer and employer review.`,
      },
      {
        id: `${id}-lesson-3`,
        courseId: id,
        title: `Module 3: Performance Optimization, Auditing & Verification`,
        sortOrder: 3,
        durationMinutes: 28,
        videoHlsUrl: `https://edge-cdn.techcodistic.com/hls/${slug}/module-3/master.m3u8`,
        contentMarkdown: `### 3. Auditing & Industry Readiness\nComplete this final module to unlock the Final Assessment.\n\n#### Readiness Criteria\n- Verify all module bitmaps are marked complete.\n- Review core architectural invariants to achieve **≥ 80%** on the final assessment.`,
      },
    ];

    questionsByCourseId[id] = [
      {
        id: `${id}-q1`,
        question: `In ${spec.title}, what is the primary objective of establishing a decoupled verification and execution workflow?`,
        options: [
          'Ensuring deterministic quality, auditability, and scalable maintenance across production environments',
          'Bypassing validation checks to reduce initial setup time',
          'Storing unindexed credentials in plain text logs',
          'Replacing structured assessments with unverified self-reporting',
        ],
        correctOptionIndex: 0,
        explanation: 'Decoupled architectures guarantee deterministic quality and auditability under high concurrency.',
      },
      {
        id: `${id}-q2`,
        question: `Which performance and reliability practice is critical when scaling ${spec.category} systems?`,
        options: [
          'Composite indexing, connection pooling, and continuous validation against explicit SLAs',
          'Disabling caching layers during peak traffic spikes',
          'Running synchronous blocking operations on the main UI thread',
          'Skipping prerequisite verification gates for production deployments',
        ],
        correctOptionIndex: 0,
        explanation: 'Indexed queries, pooled connections, and explicit SLA thresholds prevent bottlenecks.',
      },
      {
        id: `${id}-q3`,
        question: 'What minimum assessment score is required on TechCodistic (techcodistic.com) to issue a cryptographically verified credential?',
        options: [
          '80% or higher across all competency modules',
          '50% with partial module completion',
          'No assessment is required after enrollment',
          '65% without completing video modules',
        ],
        correctOptionIndex: 0,
        explanation: 'The platform enforces a strict ≥ 80% passing score threshold before issuing verifiable credentials.',
      },
      {
        id: `${id}-q4`,
        question: 'How does the platform verify credential authenticity when an employer scans the QR code?',
        options: [
          'By resolving the unique verification code against the edge-cached credentials registry in sub-50ms',
          'By requiring the employer to email the student for a manual screenshot',
          'By trusting unverified PDF filenames without cryptographic lookup',
          'By waiting 5 business days for manual registrar review',
        ],
        correctOptionIndex: 0,
        explanation: 'Every credential carries a unique verification code indexed for sub-50ms edge verification.',
      },
      {
        id: `${id}-q5`,
        question: `When applying principles from ${spec.title} to real-world deliverables, which artifact provides the strongest proof of competency?`,
        options: [
          'Verifiable source repositories, live production deployments, and passed benchmark evaluations',
          'Untested theoretical slides without working implementation',
          'Anonymous completion claims without verification IDs',
          'Static mockups without functional validation',
        ],
        correctOptionIndex: 0,
        explanation: 'Working repositories, live deployments, and verified assessments substantiate real engineering skill.',
      },
    ];
  }

  return { courses, lessonsByCourseId, questionsByCourseId };
}

export const INITIAL_INTERNSHIPS: Internship[] = [
  // Track 1: Virtual Cohort Internships (Automated & Scalable)
  {
    id: 'intern-vc-1',
    title: 'Full-Stack Next.js & Serverless PostgreSQL Engineering Cohort',
    slug: 'fullstack-nextjs-drizzle-virtual-cohort',
    companyName: 'TechCodistic Engineering Labs',
    type: 'virtual_cohort',
    domain: 'Full-Stack Engineering',
    durationWeeks: 4,
    stipendInr: 0,
    prerequisiteCourseId: null,
    summary:
      'Enroll for an instant automated Offer Letter, complete 3 progressive engineering sprints building a Next.js App Router + Drizzle ORM platform, and submit your GitHub repo + live Vercel URL to unlock an Official Internship Completion Certificate.',
    isActive: true,
    createdAt: '2026-01-12T00:00:00.000Z',
  },
  {
    id: 'intern-vc-2',
    title: 'Applied AI, RAG Pipelines & LLM Evaluation Virtual Cohort',
    slug: 'applied-ai-rag-virtual-cohort',
    companyName: 'TechCodistic AI Research Studio',
    type: 'virtual_cohort',
    domain: 'Artificial Intelligence & ML',
    durationWeeks: 6,
    stipendInr: 0,
    prerequisiteCourseId: null,
    summary:
      'Build deterministic LLM tool-calling agents, vector hybrid search indexes, and automated hallucination benchmarks across 3 structured milestone sprints.',
    isActive: true,
    createdAt: '2026-01-14T00:00:00.000Z',
  },
  {
    id: 'intern-vc-3',
    title: 'Cloud DevOps, Docker & Edge Observability Virtual Cohort',
    slug: 'cloud-devops-docker-virtual-cohort',
    companyName: 'TechCodistic Cloud Infrastructure',
    type: 'virtual_cohort',
    domain: 'Cloud & DevOps',
    durationWeeks: 8,
    stipendInr: 0,
    prerequisiteCourseId: null,
    summary:
      'Architect multi-stage container builds, zero-downtime CI/CD deployment workflows, and OpenTelemetry latency dashboards with automated mentor grading.',
    isActive: true,
    createdAt: '2026-01-18T00:00:00.000Z',
  },
  {
    id: 'intern-vc-4',
    title: 'Cybersecurity Threat Hunting & OWASP Defense Virtual Cohort',
    slug: 'cybersecurity-owasp-virtual-cohort',
    companyName: 'TechCodistic Security Operations',
    type: 'virtual_cohort',
    domain: 'Cybersecurity',
    durationWeeks: 4,
    stipendInr: 0,
    prerequisiteCourseId: null,
    summary:
      'Audit web applications against OWASP Top 10 vectors, write automated security regression suites, and deliver a hardened security architecture repository.',
    isActive: true,
    createdAt: '2026-01-20T00:00:00.000Z',
  },

  // Track 2: Company-Posted Internships (Skill-Gated Marketplace)
  {
    id: 'intern-co-1',
    title: 'Product Engineering Intern — Edge Commerce Platform',
    slug: 'product-engineering-intern-razorpayx-partner',
    companyName: 'FinScale Systems (Partner Company)',
    type: 'company_hiring',
    domain: 'Full-Stack Engineering',
    durationWeeks: 12,
    stipendInr: 45000,
    prerequisiteCourseId: 'course-1', // Pre-verified for Aarav in initial seed!
    summary:
      'Skill-gated partner opening. Requires completion of Course #1: Diploma in Full-Stack Web Development (Next.js & TypeScript) so recruiters only review pre-verified candidates.',
    isActive: true,
    createdAt: '2026-02-01T00:00:00.000Z',
  },
  {
    id: 'intern-co-2',
    title: 'LLM Systems & Prompt Reliability Intern',
    slug: 'llm-systems-intern-neuralworks',
    companyName: 'NeuralWorks AI (Partner Company)',
    type: 'company_hiring',
    domain: 'Artificial Intelligence & ML',
    durationWeeks: 12,
    stipendInr: 55000,
    prerequisiteCourseId: 'course-6', // Certificate in Prompt Engineering & LLM Applications
    summary:
      'Work directly with production LLM inference pipelines. Strictly gated on completing Course #6: Certificate in Prompt Engineering & LLM Applications (≥ 80% score).',
    isActive: true,
    createdAt: '2026-02-03T00:00:00.000Z',
  },
  {
    id: 'intern-co-3',
    title: 'PostgreSQL Performance & Data Engineering Intern',
    slug: 'postgresql-data-intern-supabase-partner',
    companyName: 'DataPulse Cloud (Partner Company)',
    type: 'company_hiring',
    domain: 'Database & Backend',
    durationWeeks: 8,
    stipendInr: 40000,
    prerequisiteCourseId: 'course-9', // Diploma in Database Administration (PostgreSQL & SQL)
    summary:
      'Optimize high-throughput analytical queries and connection poolers. Requires Course #9: Diploma in Database Administration (PostgreSQL & SQL).',
    isActive: true,
    createdAt: '2026-02-05T00:00:00.000Z',
  },
  {
    id: 'intern-co-4',
    title: 'Structural Dynamics & CAD Simulation Intern',
    slug: 'structural-dynamics-intern-apex-civil',
    companyName: 'Apex Civil & Infrastructure (Partner Company)',
    type: 'company_hiring',
    domain: 'Civil & Structural Engineering',
    durationWeeks: 12,
    stipendInr: 35000,
    prerequisiteCourseId: 'course-31', // Diploma in Structural Dynamics for Civil Engineers
    summary:
      'Assist senior structural engineers in SDOF seismic response modeling. Requires Course #31: Diploma in Structural Dynamics for Civil Engineers.',
    isActive: true,
    createdAt: '2026-02-08T00:00:00.000Z',
  },
];

export const INITIAL_INTERNSHIP_TASKS: InternshipTask[] = [
  // Tasks for intern-vc-1
  {
    id: 'task-vc1-1',
    internshipId: 'intern-vc-1',
    sprintNumber: 1,
    title: 'Sprint 1: Drizzle ORM Schema & Serverless Connection Pooler',
    specificationMarkdown:
      'Define the 8 core PostgreSQL tables (`users`, `courses`, `lessons`, `enrollments`, `internships`, `internship_tasks`, `internship_applications`, `credentials`) with composite indexes on `(category, learner_count)` and disable prepared statements (`{ prepare: false }`) for serverless connection pooling.',
    deliverableHint: 'src/db/schema.ts & src/db/index.ts committed to GitHub',
  },
  {
    id: 'task-vc1-2',
    internshipId: 'intern-vc-1',
    sprintNumber: 2,
    title: 'Sprint 2: Decoupled Service Layer & Offer Letter Transaction',
    specificationMarkdown:
      'Implement `src/services/internship.service.ts` using `db.transaction` so enrolling in a Virtual Cohort atomically inserts an `offer_issued` application and issues a cryptographic `OFFER-2026-XXXX` credential.',
    deliverableHint: 'src/services/internship.service.ts with transactional integrity',
  },
  {
    id: 'task-vc1-3',
    internshipId: 'intern-vc-1',
    sprintNumber: 3,
    title: 'Sprint 3: Edge-Cached QR Verification Route (/verify/[code])',
    specificationMarkdown:
      'Build `src/app/verify/[code]/page.tsx` with `export const revalidate = 3600` for sub-50ms edge credential verification and deploy the live application.',
    deliverableHint: 'Live production deployment URL + public GitHub repository',
  },

  // Tasks for intern-vc-2
  {
    id: 'task-vc2-1',
    internshipId: 'intern-vc-2',
    sprintNumber: 1,
    title: 'Sprint 1: Deterministic Prompt Templates & Schema Validation',
    specificationMarkdown:
      'Construct structured JSON schema output validators using Zod to guarantee type-safe LLM responses across educational grading workflows.',
    deliverableHint: 'Structured prompt evaluation module',
  },
  {
    id: 'task-vc2-2',
    internshipId: 'intern-vc-2',
    sprintNumber: 2,
    title: 'Sprint 2: Hybrid Semantic + Keyword Retrieval Engine',
    specificationMarkdown:
      'Combine dense vector similarity with BM25 lexical scoring to retrieve course syllabus passages with sub-100ms p95 latency.',
    deliverableHint: 'Hybrid retrieval benchmark script',
  },
  {
    id: 'task-vc2-3',
    internshipId: 'intern-vc-2',
    sprintNumber: 3,
    title: 'Sprint 3: Automated Evaluation Harness & Live Deployment',
    specificationMarkdown:
      'Deploy an interactive evaluation dashboard measuring faithfulness, answer relevance, and citation precision.',
    deliverableHint: 'GitHub repo + live demo link',
  },

  // Tasks for intern-vc-3
  {
    id: 'task-vc3-1',
    internshipId: 'intern-vc-3',
    sprintNumber: 1,
    title: 'Sprint 1: Multi-Stage Distroless Container Architecture',
    specificationMarkdown:
      'Reduce production image footprint by 75% using multi-stage builds, non-root execution users, and deterministic lockfile caching.',
    deliverableHint: 'Dockerfile + CI workflow',
  },
  {
    id: 'task-vc3-2',
    internshipId: 'intern-vc-3',
    sprintNumber: 2,
    title: 'Sprint 2: Blue/Green Deployment & Healthcheck Rollback',
    specificationMarkdown:
      'Configure automated zero-downtime rollout gates that verify HTTP `/healthz` and database pool readiness before shifting edge traffic.',
    deliverableHint: 'Deployment pipeline specification',
  },

  // Tasks for intern-vc-4
  {
    id: 'task-vc4-1',
    internshipId: 'intern-vc-4',
    sprintNumber: 1,
    title: 'Sprint 1: OWASP Top 10 Threat Modeling & Auth Hardening',
    specificationMarkdown:
      'Audit session management, CSRF protections, rate limiting, and parameterized SQL queries across all public endpoints.',
    deliverableHint: 'Security audit report + patched codebase',
  },
  {
    id: 'task-vc4-2',
    internshipId: 'intern-vc-4',
    sprintNumber: 2,
    title: 'Sprint 2: Automated Security Regression & CSP Headers',
    specificationMarkdown:
      'Enforce strict Content-Security-Policy headers, cryptographic HMAC webhook verification, and automated vulnerability scanning.',
    deliverableHint: 'Hardened live deployment + GitHub repository',
  },
];

export function createInitialPlatformState(): PlatformState {
  const { courses, lessonsByCourseId, questionsByCourseId } = buildCoursesAndContent();

  const currentUser = {
    id: 'user-aarav-01',
    name: 'Aarav Mehta',
    email: 'aarav.mehta@techcodistic.com',
    role: 'student' as const,
    createdAt: '2026-01-05T08:00:00.000Z',
  };

  return {
    currentUser,
    courses,
    lessonsByCourseId,
    questionsByCourseId,
    enrollments: [
      // Completed Course #1 so Aarav already has a verified Diploma AND unlocks Company Internship #1
      {
        id: 'enr-initial-1',
        userId: currentUser.id,
        courseId: 'course-1',
        completedLessonIds: ['course-1-lesson-1', 'course-1-lesson-2', 'course-1-lesson-3'],
        progressPercent: 100,
        quizScore: 100,
        isCompleted: true,
        completedAt: '2026-02-10T14:30:00.000Z',
      },
      // In-progress Course #6 (2 of 3 lessons completed -> ready to finish Module 3 & take Final Assessment)
      {
        id: 'enr-initial-6',
        userId: currentUser.id,
        courseId: 'course-6',
        completedLessonIds: ['course-6-lesson-1', 'course-6-lesson-2'],
        progressPercent: 67,
        quizScore: null,
        isCompleted: false,
        completedAt: null,
      },
    ],
    internships: INITIAL_INTERNSHIPS,
    internshipTasks: INITIAL_INTERNSHIP_TASKS,
    internshipApplications: [
      {
        id: 'app-initial-vc1',
        userId: currentUser.id,
        internshipId: 'intern-vc-1',
        status: 'offer_issued',
        completedSprintNumbers: [1, 2],
        githubRepoUrl: null,
        liveDemoUrl: null,
        evaluationScore: null,
        appliedAt: '2026-02-12T10:15:00.000Z',
        completedAt: null,
      },
    ],
    credentials: [
      {
        id: 'cred-initial-dip-1',
        verificationCode: 'DIP-2026-4B19E82A',
        userId: currentUser.id,
        credentialType: 'course_diploma',
        referenceId: 'course-1',
        recipientName: currentUser.name,
        titleName: 'Diploma in Full-Stack Web Development (Next.js & TypeScript)',
        issuerOrganization: 'TechCodistic Academic Senate',
        scorePercent: 100,
        pdfUrl: 'https://techcodistic.com/verify/DIP-2026-4B19E82A',
        issuedAt: '2026-02-10T14:30:00.000Z',
      },
      {
        id: 'cred-initial-offer-1',
        verificationCode: 'OFFER-2026-8F4A2C91',
        userId: currentUser.id,
        credentialType: 'internship_offer_letter',
        referenceId: 'intern-vc-1',
        recipientName: currentUser.name,
        titleName: 'Full-Stack Next.js & Serverless PostgreSQL Engineering Cohort at TechCodistic Engineering Labs',
        issuerOrganization: 'TechCodistic Engineering Labs',
        pdfUrl: 'https://techcodistic.com/verify/OFFER-2026-8F4A2C91',
        issuedAt: '2026-02-12T10:15:00.000Z',
      },
    ],
  };
}

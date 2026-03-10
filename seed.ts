import Database from 'better-sqlite3';
import { unlinkSync, existsSync } from 'fs';

const DB_PATH = 'portfolio.db';

if (existsSync(DB_PATH)) {
  unlinkSync(DB_PATH);
}

const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    category TEXT,
    description TEXT,
    image TEXT,
    tags TEXT,
    link TEXT,
    media TEXT
  );

  CREATE TABLE experiences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT,
    company TEXT,
    period TEXT,
    location TEXT,
    summary TEXT,
    tags TEXT,
    wins TEXT,
    behindTheResume TEXT,
    showImage INTEGER,
    imageCaption TEXT,
    presentationLink TEXT,
    attachmentLink TEXT,
    attachmentText TEXT,
    sortOrder INTEGER DEFAULT 0
  );

  CREATE TABLE skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    type TEXT
  );

  CREATE TABLE content (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE education (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school TEXT,
    degree TEXT,
    field TEXT,
    location TEXT,
    period TEXT,
    gpa TEXT,
    details TEXT,
    sortOrder INTEGER DEFAULT 0
  );

  CREATE TABLE certifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    issuer TEXT,
    date TEXT,
    link TEXT,
    sortOrder INTEGER DEFAULT 0
  );
`);

// --- Seed Data ---

const projects = [
  {
    title: "Subway Soundtracks",
    category: "Digital Production",
    description: "A documentary project exploring the isolation and connection of NYC transit through sound and visual storytelling.",
    image: "https://picsum.photos/seed/subway_pm/800/450",
    tags: ["Premiere Pro", "Research"],
    link: "View Video",
    media: [{ type: 'link', label: 'Watch Video', url: 'https://vimeo.com/example' }]
  },
  {
    title: "Pure Plate",
    category: "App Prototyping",
    description: "All-encompassing allergy management platform. Solving complex user dietary constraints through intuitive interface design.",
    image: "https://picsum.photos/seed/pureplate_pm/800/450",
    tags: ["Figma", "UX Research"],
    link: "View Prototype",
    media: [{ type: 'link', label: 'Figma Preview', url: 'https://figma.com/example' }]
  },
  {
    title: "LinkedIn Feature Strategy",
    category: "Product Thinking",
    description: "Redesigning connection requests for increased high-value networking outcomes. Identified major user types and pain points.",
    image: "https://picsum.photos/seed/linkedin_pm/800/450",
    tags: ["Strategy", "Wireframing"],
    link: "Read Case Study",
    media: []
  },
  {
    title: "Market Insight Engine",
    category: "Data Analysis",
    description: "A Python-based tool for scraping and analyzing competitor sentiment across social platforms.",
    image: "https://picsum.photos/seed/market_pm/800/450",
    tags: ["Python", "NLP"],
    link: "View Repository",
    media: [{ type: 'file', label: 'Technical Report', url: '#' }]
  }
];

const experiences = [
  {
    role: "Product Manager Intern",
    company: "Louisa AI",
    period: "SEP 2025 — DEC 2025",
    location: "New York, NY",
    summary: "Partnered closely with Product Strategists and Managers to define product vision, shape roadmaps, and prioritize features for an enterprise-grade AI platform.",
    tags: ["Product Strategy", "Roadmapping", "Feature Prioritization", "UX Collaboration", "Stakeholder Communication"],
    wins: [
      "Partnered closely with a Product Strategist and Product Managers to support product vision, roadmap development, and feature prioritization across multiple client engagements.",
      "Collaborated cross-functionally with engineering, design, and strategy teams to align customer needs, business objectives, and technical constraints.",
      "Conducted competitive and market analysis across 5–7 comparable products to identify differentiation opportunities.",
      "Led end-to-end QA by managing regression testing and reviewing automation reports.",
      "Supported UX and brand consistency through detailed UI audits and the creation of personalized onboarding videos."
    ],
    behindTheResume: "I spent hours shadowing client pitches which helped me realize that product strategy isn't just about what you build, but deeply understanding the psychological friction points.",
    showImage: 1,
    imageCaption: "With Muriel Daccache (Product Strategist) & Relina Vas (Product Manager)",
    sortOrder: 1
  },
  {
    role: "IT Software Quality Assurance Analyst",
    company: "Stellantis Financial Services",
    period: "JUN 2025 — AUG 2025",
    location: "Houston, Texas",
    summary: "Ensuring high-performance reliability across complex financial loan workflows through rigorous analytical testing and RPA automation.",
    tags: ["Agile Execution", "QA Strategy", "JIRA Bug Triage", "RPA Automation (UiPath)", "Cross-Functional Delivery"],
    wins: [
      "Embedded in an agile scrum team, participating in daily stand-ups, sprint reviews, and defect triage.",
      "Executed regression testing in Salesforce Sandbox and authored manual test cases for a major production release.",
      "Developed and automated test validations for core MySFS portal features using UiPath Studio.",
      "Presented internship impact recap to senior leadership, recognized in company-wide Town Hall."
    ],
    behindTheResume: "Key takeaway: impact isn’t defined by role titles. I proactively collaborated with PMs to uncover product gaps.",
    showImage: 1,
    imageCaption: "SFS contributions recognized in company-wide Town Hall!",
    presentationLink: "https://www.canva.com/design/DAGumOl5vIk/Kc2mrHFmeBXte9L3FRLtXg/edit",
    sortOrder: 2
  },
  {
    role: "Associate Product Manager",
    company: "Blumetra Solutions",
    period: "MAY 2024 — AUG 2024",
    location: "Pleasanton, California",
    summary: "Worked on Filesense, a no-code, AI-enabled data observability platform at a cloud-computing company focused on scalable data reliability.",
    tags: ["Product Discovery", "AI Product Strategy", "Roadmapping & OKRs", "Metrics & Analytics", "Market & Competitive Research"],
    wins: [
      "Led product discovery by identifying inefficiencies in anomaly detection, contributing to a ~30% reduction in cycle time.",
      "Authored product vision, MVP scope, user stories, KPIs, and OKRs.",
      "Built Tableau dashboards to track anomaly trends, improving prioritization speed by ~25%."
    ],
    behindTheResume: "Consulting taught me the importance of rapid prototyping and failing fast.",
    showImage: 0,
    attachmentLink: "https://blumetra.com/bdop",
    attachmentText: "Learn more about the product",
    sortOrder: 3
  },
  {
    role: "Founder",
    company: "Sthirta Thrift Store",
    period: "NOV 2020 — FEB 2024",
    location: "Hyderabad, India",
    summary: "Founded a non-profit online merchandise store, overseeing photography of handmade jewelry pieces and second-hand clothes.",
    tags: ["Zero-to-One Execution", "Customer Discovery", "Product-Market Fit", "Operations Strategy", "Entrepreneurship"],
    wins: [
      "Founded a non-profit online merchandise store, oversaw photography and operations.",
      "Created Instagram content, generating average of 5.8K views per post.",
      "Amassed total revenue of $7000, donated all profits to local NGOs."
    ],
    behindTheResume: "Building a business from scratch for a cause I believe in was the most challenging and rewarding experience.",
    showImage: 0,
    sortOrder: 4
  }
];

const skills = [
  { name: "Google AI Studio", type: "technical" },
  { name: "SQL", type: "technical" },
  { name: "Python", type: "technical" },
  { name: "Tableau", type: "technical" },
  { name: "Figma", type: "technical" },
  { name: "UiPath", type: "technical" },
  { name: "Agile SDLC", type: "technical" },
  { name: "Adaptability", type: "soft" },
  { name: "Curiosity", type: "soft" },
  { name: "Storytelling", type: "soft" },
  { name: "Leadership", type: "soft" },
  { name: "Problem-Solving", type: "soft" }
];

const education = [
  {
    school: "Fordham University",
    degree: "B.S. in Global Business",
    field: "Digital Media & Technology",
    location: "New York, NY",
    period: "Sep 2022 – Dec 2025",
    gpa: "3.72",
    details: "Dean’s List: 2023-2024; 2024-2025 • Information Systems Scholar (2024; 2025)",
    sortOrder: 1
  }
];

const content = [
  { key: 'hero_title_1', value: 'CRAFTING STORIES' },
  { key: 'hero_title_2', value: 'BUILDING PRODUCTS' },
  { key: 'hero_title_3', value: 'THROUGH AI' },
  { key: 'hero_description', value: 'Turning complexity into clarity through empathy, AI, and thoughtful product design.' },
  { key: 'hero_photo_url', value: 'https://picsum.photos/seed/product_management_dashboard/600/800' },
  { key: 'manifesto', value: "I believe that the best products aren't just collections of features, but coherent narratives that speak directly to the human experience. Through the lens of AI and empathy, we can build tools that don't just solve problems, but empower people to write their own stories." }
];

// --- Insertion ---

const insertProject = db.prepare('INSERT INTO projects (title, category, description, image, tags, link, media) VALUES (?, ?, ?, ?, ?, ?, ?)');
projects.forEach(p => insertProject.run(p.title, p.category, p.description, p.image, JSON.stringify(p.tags), p.link, JSON.stringify(p.media)));

const insertExperience = db.prepare('INSERT INTO experiences (role, company, period, location, summary, tags, wins, behindTheResume, showImage, imageCaption, presentationLink, attachmentLink, attachmentText, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
experiences.forEach(e => insertExperience.run(e.role, e.company, e.period, e.location, e.summary, JSON.stringify(e.tags), JSON.stringify(e.wins), e.behindTheResume, e.showImage, e.imageCaption || '', e.presentationLink || '', e.attachmentLink || '', e.attachmentText || '', e.sortOrder));

const insertSkill = db.prepare('INSERT INTO skills (name, type) VALUES (?, ?)');
skills.forEach(s => insertSkill.run(s.name, s.type));

const insertEdu = db.prepare('INSERT INTO education (school, degree, field, location, period, gpa, details, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
education.forEach(e => insertEdu.run(e.school, e.degree, e.field, e.location, e.period, e.gpa, e.details, e.sortOrder));

const insertContent = db.prepare('INSERT INTO content (key, value) VALUES (?, ?)');
content.forEach(c => insertContent.run(c.key, c.value));

console.log('Phase 2 Database seeded successfully!');

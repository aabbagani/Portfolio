import { motion, useScroll, useTransform } from "motion/react";
import {
  Brain,
  CheckCircle2,
  ChevronDown,
  PlayCircle,
  Mail,
  ArrowRight,
  Linkedin,
  Activity,
  Cpu,
  UploadCloud,
  Github,
  Twitter,
  ExternalLink,
  Image as ImageIcon,
  FileText,
  GraduationCap,
  Award
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Admin from "./Admin";

const API_URL = '/api';

const Logo = ({ className = "w-8 h-8", color = "currentColor" }: { className?: string; color?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* First A - Shifted slightly left, less transparent */}
    <path d="M45 15L75 85H65L45 35L25 85H15L45 15Z" fill={color} opacity="0.6" />
    <path d="M30 60H55V68H30V60Z" fill={color} opacity="0.6" />

    {/* Second A - Shifted right, more overlap but distinct lines */}
    <path d="M55 25L85 95H75L55 45L35 95H25L55 25Z" fill={color} />
    <path d="M40 70H65V78H40V70Z" fill={color} />
  </svg>
);

// --- Sub-components ---

const Hero = ({ content }: any) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <header ref={containerRef} className="relative pt-32 pb-20 overflow-hidden min-h-[90vh] flex flex-col justify-center">
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mono-label mb-8 flex items-center gap-3"
            >
              <Activity className="w-4 h-4 text-primary" />
              <span className="font-black">Creative Strategist Pursuing Product Management</span>
            </motion.div>
            <h1 className="text-5xl lg:text-[75px] font-black leading-[0.95] mb-10 text-white tracking-tighter">
              <span className="block">{content.hero_title_1 || 'CRAFTING STORIES'}</span>
              <span className="block text-primary">{content.hero_title_2 || 'BUILDING PRODUCTS'}</span>
              <span className="block">{content.hero_title_3 || 'THROUGH AI'}</span>
            </h1>
            <p className="text-xl text-slate-400 mb-12 max-w-xl leading-relaxed font-bold">
              {content.hero_description || 'Turning complexity into clarity through empathy, AI, and thoughtful product design.'}
            </p>
            <div className="flex flex-wrap gap-6">
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="mailto:aabbagani@gmail.com"
                className="px-10 py-5 bg-primary text-white font-black rounded hover:bg-blue-600 transition-all flex items-center gap-3 shadow-2xl shadow-primary/30"
              >
                <Mail className="w-5 h-5" />
                INITIATE CONTACT
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="https://www.linkedin.com/in/aabbagani/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-10 py-5 border-2 border-border text-white font-black rounded hover:bg-white/5 transition-all flex items-center gap-3"
              >
                <Linkedin className="w-5 h-5" />
                LINKEDIN PROFILE
              </motion.a>
            </div>
          </motion.div>

          <motion.div
            style={{ y, opacity }}
            className="lg:col-span-4 relative hidden lg:block ml-auto"
          >
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden border-2 border-border group shadow-[0_0_80px_rgba(59,130,246,0.45)] hover:shadow-[0_0_120px_rgba(59,130,246,0.7)] transition-shadow duration-1000">
              <img
                alt="Anvitha Abbagani"
                className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
                src={content.hero_photo_url || "https://picsum.photos/seed/product_management_dashboard/600/800"}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 border-[1px] border-primary/20 rounded-lg pointer-events-none z-30"></div>
              <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black/90 to-transparent z-20">
                <div className="mono-label text-white mb-2 font-black">Subject: Anvitha Abbagani</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </header>
  );
};

const SkillsSection = ({ skills, education, certifications }: any) => {
  const technical = skills.filter((s: any) => s.type === 'technical');
  const soft = skills.filter((s: any) => s.type === 'soft');

  return (
    <section id="skills" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-20">
          <div className="lg:col-span-4">
            <div className="sticky top-32">
              <div className="mono-label text-primary mb-6 font-black">Capabilities</div>
              <h2 className="text-5xl font-black text-white mb-8 tracking-tighter">SKILL SET</h2>
              <p className="text-slate-400 text-base leading-relaxed font-bold">
                A comprehensive toolkit spanning technical execution and strategic leadership. Built for the modern product landscape.
              </p>
              <div className="mt-12 p-8 border-2 border-primary/20 bg-primary/5 rounded-lg">
                <div className="flex items-center gap-4 mb-4">
                  <Brain className="w-6 h-6 text-primary" />
                  <span className="text-white font-black uppercase tracking-widest text-sm">Core Philosophy</span>
                </div>
                <p className="text-sm text-slate-300 italic leading-relaxed font-medium">
                  "Bridging the gap between complex technical architectures and intuitive user experiences through data-driven storytelling."
                </p>
              </div>
            </div>
          </div>
          <div className="lg:col-span-8 space-y-24">
            <div>
              <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-4 tracking-tight">
                <span className="w-8 h-[2px] bg-primary"></span>
                TECHNICAL STACK
              </h3>
              <div className="flex flex-wrap gap-3">
                {technical.map((skill: any, i: number) => (
                  <motion.span
                    key={i}
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(59, 130, 246, 0.2)" }}
                    className="px-5 py-3 bg-surface border-2 border-border text-slate-300 font-sans text-[11px] uppercase tracking-widest font-black transition-colors cursor-default"
                  >
                    {skill.name}
                  </motion.span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-4 tracking-tight">
                <span className="w-8 h-[2px] bg-accent"></span>
                SOFT INTELLIGENCE
              </h3>
              <div className="flex flex-wrap gap-3">
                {soft.map((skill: any, i: number) => (
                  <motion.span
                    key={i}
                    whileHover={{ scale: 1.05, borderColor: "rgba(0, 255, 65, 0.4)" }}
                    className="px-5 py-3 bg-surface border-2 border-border text-slate-300 font-sans text-[11px] uppercase tracking-widest font-black transition-colors cursor-default"
                  >
                    {skill.name}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Academic Foundation */}
            {education.length > 0 && (
              <div>
                <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-4 tracking-tight">
                  <span className="w-8 h-[2px] bg-primary"></span>
                  ACADEMIC FOUNDATION
                </h3>
                <div className="space-y-6">
                  {education.sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0)).map((edu: any) => (
                    <div key={edu.id} className="p-8 border-2 border-primary/40 bg-primary/5 neon-border-hover transition-all rounded-2xl group">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-primary/10 rounded-2xl overflow-hidden flex items-center justify-center text-primary font-black text-2xl italic shadow-inner shrink-0 border border-primary/20">
                            {edu.showImage && edu.image ? <img src={edu.image} className="w-full h-full object-cover" /> : edu.school[0]}
                          </div>
                          <div>
                            <div className="mono-label text-primary mb-1 font-black flex items-center gap-2">
                              {edu.school}
                            </div>
                            <h4 className="text-2xl font-black text-white tracking-tight">{edu.degree} in {edu.field}</h4>
                            <p className="text-slate-500 font-bold text-sm mt-1">{edu.details}</p>
                          </div>
                        </div>
                        <div className="mt-4 md:mt-0 md:text-right whitespace-nowrap">
                          <div className="text-white font-black text-sm uppercase">{edu.location}</div>
                          <div className="text-primary font-black text-sm">{edu.period}</div>
                        </div>
                      </div>
                      {edu.gpa && (
                        <div className="mt-6 pt-6 border-t border-border flex items-center justify-end gap-4">
                          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Asset Performance Index (GPA):</span>
                          <span className="text-white font-black text-2xl font-mono">{edu.gpa}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
              <div>
                <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-4 tracking-tight">
                  <span className="w-8 h-[2px] bg-accent"></span>
                  CERTIFICATIONS
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {certifications.map((cert: any) => {
                    const Content = (
                      <div className="p-6 border border-border bg-surface/50 rounded-xl hover:border-accent/40 transition-colors flex items-center gap-6 w-full h-full">
                        <div className="w-16 h-16 bg-accent/10 rounded-xl overflow-hidden flex items-center justify-center text-accent font-black text-xs italic shadow-inner shrink-0 border border-accent/20">
                          {cert.showImage && cert.image ? <img src={cert.image} className="w-full h-full object-cover" /> : <Award className="w-6 h-6" />}
                        </div>
                        <div>
                          <div className="text-white font-black text-md uppercase tracking-tight mb-1">{cert.name}</div>
                          <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest whitespace-nowrap">{cert.issuer} • {cert.date}</div>
                        </div>
                      </div>
                    );

                    return cert.link ? (
                      <a key={cert.id} href={cert.link} target="_blank" rel="noopener noreferrer" className="block outline-none focus:ring-2 focus:ring-accent rounded-xl">
                        {Content}
                      </a>
                    ) : (
                      <div key={cert.id}>{Content}</div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const ExperienceCard = ({ exp }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="p-12 border-2 border-border bg-surface/20 hover:bg-surface/40 transition-all group relative overflow-hidden rounded-3xl"
    >
      <div className="flex flex-col lg:flex-row gap-16 relative z-10">
        {exp.showImage === 1 && exp.image && (
          <div className="lg:w-1/3 shrink-0">
            <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-border group/img">
              <img src={exp.image} alt={exp.imageCaption} className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" />
              {exp.imageCaption && (
                <div className="absolute bottom-0 left-0 w-full p-4 bg-black/60 backdrop-blur-md text-[10px] font-black uppercase text-white tracking-widest text-center border-t border-white/10 rounded-b-2xl">
                  {exp.imageCaption}
                </div>
              )}
            </div>
          </div>
        )}
        <div className="flex-1">
          <div className="flex flex-wrap items-start justify-between gap-6 mb-10">
            <div className="space-y-4">
              <h4 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight">
                {exp.role}
              </h4>
              <div className="flex items-center gap-4 text-slate-400 font-black text-sm uppercase tracking-widest font-sans">
                <span className="text-primary">{exp.company}</span>
                <span className="text-slate-700">/</span>
                <span>{exp.location}</span>
              </div>
            </div>
            <div className="px-6 py-3 border-2 border-border bg-background/50 rounded-xl font-mono text-xs text-slate-300 font-black whitespace-nowrap">
              {exp.period}
            </div>
          </div>
          <div className="h-[1px] w-full bg-border mb-12"></div>
          <div className="relative pl-8 mb-16">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
            <p className="text-xl md:text-2xl font-bold text-slate-300 leading-relaxed italic">
              {exp.summary}
            </p>
          </div>
          <div className="mb-16">
            <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8">
              Core Deliverables
            </h5>
            <ul className="space-y-6">
              {exp.wins.map((win: string, i: number) => (
                <li key={i} className="flex items-start gap-5 text-base text-slate-400 font-medium">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 border border-primary/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span>{win}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap gap-3 mb-12">
            {exp.tags?.map((tag: string, i: number) => (
              <span key={i} className="px-5 py-2.5 bg-surface border border-border text-slate-500 font-sans text-[10px] uppercase tracking-widest font-black rounded-lg group-hover:border-primary/20 transition-colors">
                {tag}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-6 items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] hover:text-white transition-colors"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              View Internal Notes
            </button>
            {exp.presentationLink && (
              <a href={exp.presentationLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 px-6 py-3 border-2 border-primary text-primary rounded-lg font-sans text-[11px] font-black uppercase tracking-[0.2em] hover:bg-primary/10 transition-all bg-primary/5">
                <PlayCircle className="w-4 h-4 animate-pulse" />
                View Presentation
              </a>
            )}
          </div>
          {isOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-6 p-8 bg-black/40 border-l-4 border-primary font-sans text-sm text-slate-400 leading-relaxed italic rounded-r-xl">
              {exp.behindTheResume}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const ProjectCard = ({ project }: any) => (
  <motion.div whileHover={{ y: -10 }} className="group bg-background border-2 border-border overflow-hidden neon-border-hover flex flex-col h-full rounded-2xl">
    <div className="aspect-video relative overflow-hidden">
      <img src={project.image} alt={project.title} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
      <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-all duration-500"></div>
      <div className="absolute top-6 left-6">
        <span className="px-3 py-1 bg-black/80 backdrop-blur-md border border-white/10 font-sans text-[10px] text-white uppercase tracking-[0.2em] font-black rounded">
          {project.category}
        </span>
      </div>
    </div>
    <div className="p-8 flex flex-col flex-1">
      <div className="flex gap-3 mb-6">
        {project.tags.map((tag: string, j: number) => (
          <span key={j} className="font-sans text-[10px] text-slate-500 uppercase font-black">{tag}</span>
        ))}
      </div>
      <h3 className="text-2xl font-black text-white mb-4 group-hover:text-primary transition-colors tracking-tight leading-none">{project.title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed mb-8 font-bold flex-1">{project.description}</p>

      {project.media?.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {project.media.map((m: any, i: number) => (
            <a key={i} href={m.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-primary/10 border border-primary/30 rounded-lg text-[10px] font-black text-primary uppercase flex items-center gap-2 hover:bg-primary/20 transition-all shadow-[0_0_15px_rgba(59,130,246,0.15)] hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              {m.type === 'image' && <ImageIcon size={12} />}
              {m.type === 'link' && <ExternalLink size={12} />}
              {m.type === 'file' && <FileText size={12} />}
              {m.label}
            </a>
          ))}
        </div>
      )}
    </div>
  </motion.div>
);

const Footer = () => (
  <footer className="py-24 border-t border-border bg-background">
    <div className="max-w-7xl mx-auto px-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-12">
        <div className="flex items-center space-x-4">
          <Logo className="w-10 h-10 text-primary" />
          <span className="font-sans text-sm font-black text-white uppercase tracking-tighter">Anvitha Abbagani</span>
        </div>
        <div className="flex gap-10">
          {/* Social icons removed per request */}
        </div>
        <div className="font-sans text-[11px] text-slate-600 uppercase tracking-[0.3em] font-black">
          © 2025 Built with precision by Anvitha Abbagani
        </div>
      </div>
    </div>
  </footer>
);

// --- Main App ---

export default function App() {
  const [view, setView] = useState<"home" | "experience" | "artifacts" | "admin">("home");
  const [data, setData] = useState<any>({ projects: [], experiences: [], skills: [], content: {}, education: [], certifications: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (window.location.pathname === '/admin') {
      setView('admin');
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projRes, expRes, skillRes, contentRes, eduRes, certRes] = await Promise.all([
        fetch(`${API_URL}/projects`),
        fetch(`${API_URL}/experiences`),
        fetch(`${API_URL}/skills`),
        fetch(`${API_URL}/content`),
        fetch(`${API_URL}/education`),
        fetch(`${API_URL}/certifications`)
      ]);
      setData({
        projects: await projRes.json(),
        experiences: await expRes.json(),
        skills: await skillRes.json(),
        content: await contentRes.json(),
        education: await eduRes.json(),
        certifications: await certRes.json()
      });
    } catch (e) {
      console.error("Fetch failed", e);
    } finally {
      setLoading(false);
    }
  };

  const navigateTo = (newView: "home" | "experience" | "artifacts" | "admin") => {
    setView(newView);
    if (newView === 'admin') window.history.pushState({}, '', '/admin');
    else window.history.pushState({}, '', '/');
    window.scrollTo(0, 0);
  };

  if (view === 'admin') return <Admin />;

  const Navbar = () => (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigateTo("home")}>
          <Logo className="w-8 h-8 text-primary" />
          <span className="font-sans text-sm font-black tracking-tighter text-white uppercase">Anvitha Abbagani</span>
        </div>
        <div className="hidden md:flex items-center space-x-8 font-sans text-[10px] uppercase tracking-widest font-black">
          <button className={`${view === 'home' ? 'text-primary' : 'text-slate-500'} hover:text-white transition-colors`} onClick={() => navigateTo("home")}>Home</button>
          <button className={`${view === 'experience' ? 'text-primary' : 'text-slate-500'} hover:text-white transition-colors`} onClick={() => navigateTo("experience")}>Experience</button>
          <button className={`${view === 'artifacts' ? 'text-primary' : 'text-slate-500'} hover:text-white transition-colors`} onClick={() => navigateTo("artifacts")}>Artifacts</button>
        </div>
        <div className="flex items-center space-x-4">
          {/* Admin link removed for security */}
        </div>
      </div>
    </nav>
  );

  const HomeView = () => (
    <>
      <Hero content={data.content} />
      <section id="case-studies" className="py-32 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div>
              <div className="mono-label text-primary mb-6 font-black cursor-pointer" onClick={() => navigateTo("artifacts")}>Artifacts</div>
              <h2 className="text-5xl font-black text-white tracking-tighter">PROJECT GALLERY</h2>
            </div>
          </div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-10"
          >
            {data.projects.slice(0, 3).map((project: any, i: number) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
                }}
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      <SkillsSection skills={data.skills} education={data.education} certifications={data.certifications} />
      <section className="py-20 border-t border-border bg-background overflow-hidden relative text-center">
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="mono-label text-primary mb-8 font-black">Product Manifesto</div>
          <blockquote className="text-xl md:text-3xl font-black text-white leading-relaxed tracking-tight">
            "{data.content.manifesto}"
          </blockquote>
        </div>
      </section>
    </>
  );

  return (
    <div className="min-h-screen selection:bg-primary/30 text-white bg-background font-sans">
      <Navbar />
      <main>
        {loading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin text-primary"><Cpu size={40} /></div>
          </div>
        ) : (
          <>
            {view === 'home' && <HomeView />}
            {view === 'experience' && (
              <section className="py-32 min-h-screen">
                <div className="max-w-7xl mx-auto px-6">
                  <h2 className="text-6xl font-black text-white tracking-tighter mb-20 italic">COMPLETE CAREER LOG</h2>
                  <div className="space-y-12">
                    {data.experiences.map((exp: any) => <ExperienceCard key={exp.id} exp={exp} />)}
                  </div>
                </div>
              </section>
            )}
            {view === 'artifacts' && (
              <section className="py-32 min-h-screen">
                <div className="max-w-7xl mx-auto px-6">
                  <h2 className="text-6xl font-black text-white tracking-tighter mb-20 italic underline decoration-primary/30 decoration-8 underline-offset-8">ARTIFACT LIBRARY</h2>
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
                    }}
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-10"
                  >
                    {data.projects.map((project: any, i: number) => (
                      <motion.div
                        key={i}
                        variants={{
                          hidden: { opacity: 0, scale: 0.95, y: 20 },
                          visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5 } }
                        }}
                      >
                        <ProjectCard project={project} />
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </section>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import initialProjectsData from "@/data/projects.json";
import {
  Smartphone,
  Globe,
  Database,
  Terminal as TerminalIcon,
  Mail,
  ExternalLink,
  MapPin,
  GraduationCap,
  Layers,
  Code2,
  Cpu,
  ArrowRight,
  CheckCircle2,
  CornerDownLeft,
  X,
  Lock,
  Sun,
  Moon,
  Menu,
} from "lucide-react";

// Inline SVG GitHub Icon
function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

interface Project {
  id: string;
  title: string;
  category: "Mobile" | "Web" | "Data & GIS" | "Featured";
  role: string;
  shortDescription: string;
  fullDescription: string;
  features: string[];
  tags: string[];
  githubUrl: string;
  demoUrl: string;
  featured?: boolean;
}

interface TerminalLog {
  id: string;
  cwd?: string;
  command?: string;
  output: React.ReactNode;
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string>("Semua");
  const [projectsList, setProjectsList] = useState<Project[]>(initialProjectsData as Project[]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);

  // Smart Sticky Navbar: Hide on scroll down, instant reveal on scroll up
  useEffect(() => {
    let lastY = window.scrollY;
    let accumulatedUp = 0;
    let accumulatedDown = 0;

    const handleScroll = () => {
      const currentY = window.scrollY;
      const diff = currentY - lastY;

      // Di dekat puncak halaman, selalu tampilkan navbar
      if (currentY <= 30) {
        setIsNavVisible(true);
        accumulatedUp = 0;
        accumulatedDown = 0;
        lastY = currentY;
        return;
      }

      if (diff > 0) {
        // Scroll ke bawah: sembunyikan navbar jika menu mobile tidak terbuka
        accumulatedDown += diff;
        accumulatedUp = 0;
        if (accumulatedDown > 12 && !mobileMenuOpen) {
          setIsNavVisible(false);
        }
      } else if (diff < 0) {
        // Scroll ke atas: geser jempol sedikit ke atas (>= 5px akumulatif), langsung munculkan kembali!
        accumulatedUp += Math.abs(diff);
        accumulatedDown = 0;
        if (accumulatedUp > 4) {
          setIsNavVisible(true);
        }
      }

      lastY = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mobileMenuOpen]);

  // Theme Sync on Mount & Trigger Agentic Builder cleanly after hydration
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setIsDarkTheme(isDark);

    const bannaTimer = setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof window !== "undefined" && (window as any).Banna) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).Banna.start();
      }
    }, 30);

    return () => clearTimeout(bannaTimer);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDarkTheme;
    setIsDarkTheme(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("musgun_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("musgun_theme", "light");
    }
  };

  // Sync projects from /api/projects dynamically
  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProjectsList(data);
        }
      })
      .catch(() => {});
  }, []);

  const categories = ["Semua", "Mobile", "Web", "Data & GIS"];

  // Terminal Realistis State
  const [currentCwd, setCurrentCwd] = useState<string>("~");
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([
    {
      id: "init",
      output: (
        <div className="space-y-0.5 text-slate-400 font-mono text-xs">
          <p className="text-cyan-400 font-bold">Muslim OS [Version 24.1.0-UNIMAL Kernel 6.1 x86_64]</p>
          <p>© 2026 Muslim Gunawan. All systems online.</p>
          <p className="text-slate-500 pt-0.5">Type &apos;help&apos; for system commands or explore filesystem with ls, cat, cd.</p>
        </div>
      ),
    },
  ]);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyPointer, setHistoryPointer] = useState<number>(-1);
  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredProjects =
    activeCategory === "Semua"
      ? projectsList
      : projectsList.filter((p) => p.category === activeCategory);

  const handleCommand = (rawCmd: string) => {
    const trimmed = rawCmd.trim();
    if (!trimmed) return;

    setCmdHistory((prev) => [trimmed, ...prev]);
    setHistoryPointer(-1);

    const parts = trimmed.split(" ").filter(Boolean);
    const mainCmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(" ");

    let responseContent: React.ReactNode;

    switch (mainCmd) {
      case "cls":
      case "clear":
        setTerminalLogs([]);
        return;

      case "ls":
      case "dir":
        if (currentCwd === "~" || currentCwd === "") {
          responseContent = (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono py-1">
              <span className="text-cyan-400 font-bold">📁 projects/</span>
              <span className="text-emerald-400 font-bold">📁 skills/</span>
              <span className="text-slate-200">📄 about.txt</span>
              <span className="text-slate-200">📄 unimal.md</span>
              <span className="text-slate-200">📄 contact.json</span>
              <span className="text-amber-400">⚙️ kernel.cfg</span>
            </div>
          );
        } else if (currentCwd.includes("projects")) {
          responseContent = (
            <div className="space-y-1 text-xs font-mono py-1 text-cyan-300">
              {projectsList.map((p) => (
                <p key={p.id}>• {p.title} [{p.category}]</p>
              ))}
            </div>
          );
        } else if (currentCwd.includes("skills")) {
          responseContent = (
            <div className="space-y-1 text-xs font-mono py-1 text-emerald-300">
              <p>• mobile: Flutter, Dart, Riverpod</p>
              <p>• backend: Laravel, PHP 8.5, MySQL, REST API</p>
              <p>• frontend: Next.js 16, TypeScript, Tailwind CSS</p>
              <p>• spatial_data: Python, R, QGIS</p>
            </div>
          );
        } else {
          responseContent = <p className="text-xs text-slate-400 font-mono">Directory empty.</p>;
        }
        break;

      case "cd":
        if (!arg || arg === "~" || arg === "/") {
          setCurrentCwd("~");
          responseContent = null;
        } else if (arg === ".." || arg === "../") {
          setCurrentCwd("~");
          responseContent = null;
        } else if (arg.includes("projects") || arg.includes("skills")) {
          setCurrentCwd(`~/${arg.replace(/[/]/g, "")}`);
          responseContent = null;
        } else {
          responseContent = (
            <p className="text-xs text-rose-400 font-mono">
              cd: no such file or directory: {arg}
            </p>
          );
        }
        break;

      case "pwd":
        responseContent = (
          <p className="text-xs text-slate-300 font-mono">
            /home/musgun{currentCwd === "~" ? "" : currentCwd.replace("~", "")}
          </p>
        );
        break;

      case "cat":
      case "type":
        if (arg === "about.txt") {
          responseContent = (
            <div className="space-y-1 text-xs text-slate-300 font-mono">
              <p><strong className="text-white">Muslim Gunawan</strong> (NIM 240170036)</p>
              <p>Origin: Kutacane, Aceh Tenggara | Informatics Engineering UNIMAL (Semester 5).</p>
              <p>Focus: High-performance Flutter Mobile Apps, scalable Fullstack Web (Laravel &amp; Next.js), and GIS Spatial Data Analytics.</p>
            </div>
          );
        } else if (arg === "unimal.md") {
          responseContent = (
            <div className="space-y-1 text-xs text-slate-300 font-mono">
              <p className="text-amber-300 font-bold"># Universitas Malikussaleh (UNIMAL)</p>
              <p>• Faculty of Engineering • Department of Informatics</p>
              <p>• Campus: Bukit Indah / Reuleut, Lhokseumawe, Aceh</p>
              <p>• Academic Status: Active Student (Semester 5)</p>
            </div>
          );
        } else if (arg === "contact.json") {
          responseContent = (
            <pre className="text-xs text-cyan-300 font-mono bg-slate-950/70 p-2.5 rounded border border-slate-800">
{`{
  "name": "Muslim Gunawan",
  "email": "musgun.slyr@gmail.com",
  "github": "https://github.com/MuslimGunawan",
  "institution": "Universitas Malikussaleh",
  "location": "Lhokseumawe, Aceh, Indonesia"
}`}
            </pre>
          );
        } else if (arg === "kernel.cfg") {
          responseContent = (
            <p className="text-xs text-slate-400 font-mono">
              BUILD_ENV=production | NEXT_VERSION=16.4.6 | TURBO=active
            </p>
          );
        } else if (!arg) {
          responseContent = <p className="text-xs text-rose-400 font-mono">usage: cat &lt;filename&gt;</p>;
        } else {
          responseContent = <p className="text-xs text-rose-400 font-mono">cat: {arg}: No such file or directory</p>;
        }
        break;

      case "whoami":
        responseContent = <p className="text-xs text-emerald-400 font-mono">musgun (Muslim Gunawan - Software Engineer)</p>;
        break;

      case "date":
      case "time":
        responseContent = <p className="text-xs text-slate-300 font-mono">{new Date().toUTCString()}</p>;
        break;

      case "ver":
      case "uname":
        responseContent = (
          <p className="text-xs text-slate-300 font-mono">
            Linux unimal-station 6.6.14-musgun-x86_64 #1 SMP PREEMPT GNU/Linux
          </p>
        );
        break;

      case "echo":
        responseContent = <p className="text-xs text-slate-200 font-mono">{arg || ""}</p>;
        break;

      case "ping":
        responseContent = (
          <div className="space-y-0.5 text-xs text-slate-300 font-mono">
            <p>PING {arg || "unimal.ac.id"} (103.111.82.12): 56 data bytes</p>
            <p>64 bytes from 103.111.82.12: icmp_seq=0 ttl=57 time=14.2 ms</p>
            <p>64 bytes from 103.111.82.12: icmp_seq=1 ttl=57 time=12.8 ms</p>
            <p className="text-emerald-400">--- {arg || "unimal.ac.id"} ping statistics: 0% packet loss ---</p>
          </div>
        );
        break;

      case "flutter":
        responseContent = (
          <div className="space-y-0.5 text-xs text-sky-300 font-mono">
            <p>Flutter 3.27.x • channel stable</p>
            <p>Framework • Dart 3.6.x • DevTools 2.40.x</p>
            <p className="text-emerald-400">[✓] Flutter doctor: System architecture healthy.</p>
          </div>
        );
        break;

      case "php":
        responseContent = (
          <p className="text-xs text-indigo-300 font-mono">
            PHP 8.5.0 (cli) (built: 2026) with Zend OPcache &amp; Laravel 12 Engine
          </p>
        );
        break;

      case "python":
      case "python3":
        responseContent = (
          <p className="text-xs text-amber-300 font-mono">
            Python 3.13.0 (main) [GCC / Clang] • Spatial GIS &amp; Pandas toolchain
          </p>
        );
        break;

      case "git":
        if (arg === "status") {
          responseContent = (
            <div className="space-y-0.5 text-xs text-slate-300 font-mono">
              <p className="text-emerald-400">On branch main</p>
              <p>Your branch is up to date with &apos;origin/main&apos;.</p>
              <p className="text-slate-500">nothing to commit, working tree clean</p>
            </div>
          );
        } else {
          responseContent = <p className="text-xs text-slate-300 font-mono">git version 2.47.0</p>;
        }
        break;

      case "history":
        responseContent = (
          <div className="space-y-0.5 text-xs text-slate-400 font-mono">
            {cmdHistory.slice(0, 8).map((h, i) => (
              <p key={i}>{i + 1}  {h}</p>
            ))}
          </div>
        );
        break;

      case "sudo":
        responseContent = (
          <p className="text-xs text-rose-400 font-mono">
            [sudo] musgun is in the sudoers file. Root guest session active.
          </p>
        );
        break;

      case "help":
      case "man":
        responseContent = (
          <div className="space-y-1.5 text-xs font-mono">
            <p className="text-cyan-400 font-bold">Supported Commands:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-slate-300">
              <p><span className="text-amber-400 font-bold">ls / dir</span> - list files</p>
              <p><span className="text-amber-400 font-bold">cd &lt;dir&gt;</span> - navigate</p>
              <p><span className="text-amber-400 font-bold">cat &lt;file&gt;</span> - inspect</p>
              <p><span className="text-amber-400 font-bold">cls / clear</span> - clear</p>
              <p><span className="text-amber-400 font-bold">pwd</span> - print path</p>
              <p><span className="text-amber-400 font-bold">whoami</span> - user id</p>
              <p><span className="text-amber-400 font-bold">ping</span> - network</p>
              <p><span className="text-amber-400 font-bold">flutter</span> - check sdk</p>
            </div>
          </div>
        );
        break;

      default:
        responseContent = (
          <p className="text-xs text-rose-400 font-mono">
            bash: {mainCmd}: command not found. Type &apos;help&apos; for available commands.
          </p>
        );
    }

    if (responseContent !== null) {
      setTerminalLogs((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          cwd: currentCwd,
          command: trimmed,
          output: responseContent,
        },
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCommand(terminalInput);
      setTerminalInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length > 0) {
        const nextPtr = Math.min(historyPointer + 1, cmdHistory.length - 1);
        setHistoryPointer(nextPtr);
        setTerminalInput(cmdHistory[nextPtr]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyPointer > 0) {
        const nextPtr = historyPointer - 1;
        setHistoryPointer(nextPtr);
        setTerminalInput(cmdHistory[nextPtr]);
      } else if (historyPointer === 0) {
        setHistoryPointer(-1);
        setTerminalInput("");
      }
    }
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (terminalContainerRef.current) {
      terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  return (
    <div className="relative min-h-screen bg-grid-pattern overflow-x-hidden font-sans">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-gradient-to-b from-cyan-500/15 via-blue-600/10 to-transparent blur-[120px] pointer-events-none" />

      {/* MINIMALIST TOP BAR NAVIGATION (Clean, Smart Sticky & Floating Overlay) */}
      <header
        data-banna-skip
        className={`sticky top-0 z-40 backdrop-blur-md bg-[var(--header-bg)] border-b border-slate-200 dark:border-white/10 px-6 py-3.5 transition-transform duration-300 ${
          isNavVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo / Brand Name Bersih */}
          <a href="#" className="flex flex-col group">
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors font-display">
              Muslim Gunawan
            </span>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tracking-wider">
              @musgun // UNIMAL
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300 font-mono">
            <a href="#about" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
              // tentang
            </a>
            <a href="#stack" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
              // tech_stack
            </a>
            <a href="#projects" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
              // proyek
            </a>
            <a href="#terminal" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
              // terminal
            </a>
            <a href="#contact" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
              // kontak
            </a>
          </nav>

          {/* Right Action: Theme Switcher + Admin Lock + CTA */}
          <div className="flex items-center gap-2.5">
            {/* Theme Toggle (Dark / Light) */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-all text-xs"
              title={isDarkTheme ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Theme"
            >
              {isDarkTheme ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Admin Dashboard Lock Link */}
            <Link
              href="/admin"
              className="p-2 rounded-xl text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all text-xs"
              title="Admin Terminal"
            >
              <Lock className="w-4 h-4" />
            </Link>

            <a
              href="#contact"
              className="hidden sm:inline-flex px-4 py-1.5 rounded-full text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-md shadow-cyan-500/20 font-mono"
            >
              Hubungi
            </a>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 text-rose-500" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu: TRUE FLOATING OVERLAY (TIDAK MENDORONG CONTENT BODY) */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop Transparan Blur */}
            <div
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 top-[62px] bg-black/40 backdrop-blur-xs z-40 transition-opacity"
            />
            {/* Floating Menu Drawer Di Atas Body */}
            <div className="md:hidden absolute top-full left-0 right-0 z-50 bg-white/95 dark:bg-[#070b14]/95 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 shadow-2xl px-6 py-4 space-y-2 text-sm font-mono animate-in fade-in slide-in-from-top-2 duration-200">
              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
              >
                <span>// tentang</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-500" />
              </a>
              <a
                href="#stack"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
              >
                <span>// tech_stack</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-500" />
              </a>
              <a
                href="#projects"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
              >
                <span>// proyek</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-500" />
              </a>
              <a
                href="#terminal"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
              >
                <span>// terminal</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-500" />
              </a>
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
              >
                <span>// kontak</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-500" />
              </a>
            </div>
          </>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-10 pb-24 space-y-24">
        {/* HERO SECTION */}
        <section id="hero" className="relative pt-6 pb-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Kiri: Teks & Headline */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/70 text-slate-700 dark:text-slate-300 text-xs font-mono shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Teknik Informatika // Universitas Malikussaleh</span>
                <span className="text-slate-400">|</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-bold">Semester 5</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12] font-display">
                Engineering Scalable{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-sky-500 to-blue-600 dark:from-cyan-400 dark:via-sky-400 dark:to-blue-500">
                  Mobile &amp; Fullstack
                </span>{" "}
                Architectures.
              </h1>

              <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed max-w-xl">
                Halo, saya <strong className="text-slate-900 dark:text-white font-bold">Muslim Gunawan</strong> (MusGun). 
                Mahasiswa Teknik Informatika UNIMAL yang berdedikasi membangun aplikasi mobile performa tinggi dengan{" "}
                <strong className="text-cyan-700 dark:text-cyan-300 font-mono font-bold">Flutter</strong>, sistem web terukur dengan{" "}
                <strong className="text-blue-700 dark:text-sky-300 font-mono font-bold">Laravel &amp; Next.js</strong>, serta visualisasi analitik geospasial.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#projects"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-sm hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/25 font-mono"
                >
                  <span>// JELAJAHI_PROYEK</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <a
                  href="https://github.com/MuslimGunawan"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 font-medium text-sm transition-all shadow-xs font-mono"
                >
                  <GithubIcon className="w-4 h-4" />
                  <span>GitHub</span>
                </a>

                <a
                  href="#terminal"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 font-medium text-sm transition-all shadow-xs font-mono"
                >
                  <TerminalIcon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span>Terminal</span>
                </a>
              </div>

              {/* Status info bar */}
              <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-white/10 font-mono">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>Lhokseumawe / Aceh, ID</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5 text-amber-500" />
                  <span>NIM: 240170036</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Open for Opportunities</span>
                </div>
              </div>
            </div>

            {/* Kanan: Foto Profil & Kartu Identitas */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative group w-full max-w-[340px]">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-500 to-blue-600 opacity-20 dark:opacity-40 blur-xl group-hover:opacity-40 dark:group-hover:opacity-60 transition duration-500" />

                <div className="relative rounded-3xl p-4 bg-white/95 dark:bg-[#0d1424]/90 border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-2xl space-y-4">
                  {/* Foto Utama */}
                  <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700/60 bg-slate-100 dark:bg-slate-900">
                    <Image
                      src="/pp.jpeg"
                      alt="Muslim Gunawan"
                      fill
                      sizes="(max-width: 768px) 100vw, 340px"
                      priority
                      className="object-cover object-top transition duration-500 group-hover:scale-105"
                    />
                    {/* Badge UNIMAL di dalam foto */}
                    <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl backdrop-blur-md bg-slate-950/85 border border-white/15 flex items-center gap-3">
                      <div className="relative w-7 h-7 flex-shrink-0">
                        <Image
                          src="/logo_unimal.png"
                          alt="Logo UNIMAL"
                          fill
                          sizes="28px"
                          className="object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">
                          Universitas Malikussaleh
                        </p>
                        <p className="text-[10px] text-cyan-300 truncate font-mono">
                          Fakultas Teknik // Teknik Informatika
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Ringkasan Profil Card */}
                  <div className="space-y-1.5 px-1 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900 dark:text-white font-display">Muslim Gunawan</span>
                      <span className="px-2 py-0.5 text-[10px] rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800/60 font-bold">
                        240170036
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
                      Software engineering practitioner focused on high-efficiency mobile apps &amp; modern web distributed systems.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BENTO GRID: TENTANG & FOKUS BIDANG */}
        <section id="about" className="space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 tracking-wider uppercase font-bold">
              // 01. CAPABILITIES
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5 font-display">
              <Layers className="w-6 h-6 text-cyan-500" />
              <span>Core Domains &amp; Foundation</span>
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl font-sans">
              Kompetensi teknik terintegrasi dari kurikulum Teknik Informatika UNIMAL dan praktik rekayasa sistem modern.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Bento Card 1: Mobile Development */}
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden group bg-white/95 dark:bg-[#0c1220]/80 border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md hover:border-cyan-500/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-5 group-hover:scale-110 transition-transform">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 font-display">Mobile App Engineering</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                Pengembangan aplikasi multi-platform (Android, Web) menggunakan Flutter dan Dart dengan arsitektur bersih, 60fps UI, state management, dan interaksi native yang halus.
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5 font-mono">
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 border border-slate-200 dark:border-slate-700">Flutter</span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 border border-slate-200 dark:border-slate-700">Dart</span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 border border-slate-200 dark:border-slate-700">Riverpod</span>
              </div>
            </div>

            {/* Bento Card 2: Fullstack Web */}
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden group bg-white/95 dark:bg-[#0c1220]/80 border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md hover:border-blue-500/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-5 group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 font-display">Fullstack Web Systems</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                Merancang backend API yang aman &amp; tangguh menggunakan PHP 8.5 &amp; Laravel, serta antarmuka web modern reaktif berbasis Next.js 16, TypeScript, dan Tailwind CSS.
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5 font-mono">
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-blue-300 border border-slate-200 dark:border-slate-700">Laravel</span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-blue-300 border border-slate-200 dark:border-slate-700">Next.js 16</span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-blue-300 border border-slate-200 dark:border-slate-700">MySQL</span>
              </div>
            </div>

            {/* Bento Card 3: Data & Spatial */}
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden group bg-white/95 dark:bg-[#0c1220]/80 border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md hover:border-purple-500/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-5 group-hover:scale-110 transition-transform">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 font-display">Data Science &amp; GIS</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                Eksplorasi data spasial, pemodelan statistik dengan R &amp; Python, serta analisis sistem informasi geografis (GIS) untuk digitasi batas wilayah dan infrastruktur dengan QGIS.
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5 font-mono">
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-purple-700 dark:text-purple-300 border border-slate-200 dark:border-slate-700">Python</span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-purple-700 dark:text-purple-300 border border-slate-200 dark:border-slate-700">R Language</span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-purple-700 dark:text-purple-300 border border-slate-200 dark:border-slate-700">QGIS</span>
              </div>
            </div>
          </div>
        </section>

        {/* TECH STACK DETAIL SECTION */}
        <section id="stack" className="space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 tracking-wider uppercase font-bold">
              // 02. TOOLCHAIN_MATRIX
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5 font-display">
              <Cpu className="w-6 h-6 text-cyan-500" />
              <span>Technology Toolchain</span>
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-sans">
              Perangkat dan bahasa pemrograman yang digunakan dalam implementasi solusi sistem.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { name: "Flutter", role: "Mobile Framework", level: "Production", color: "from-sky-500 to-cyan-500" },
              { name: "Dart", role: "Object-oriented Language", level: "Advanced", color: "from-blue-600 to-cyan-500" },
              { name: "Laravel", role: "Backend Framework", level: "Production", color: "from-red-600 to-rose-500" },
              { name: "PHP 8.5", role: "Server-side Language", level: "Advanced", color: "from-indigo-600 to-purple-600" },
              { name: "Next.js 16", role: "React Server Framework", level: "Production", color: "from-slate-400 to-slate-200" },
              { name: "TypeScript", role: "Strict Type System", level: "Advanced", color: "from-blue-500 to-sky-400" },
              { name: "Python", role: "Scripting & Spatial ETL", level: "Proficient", color: "from-amber-400 to-yellow-600" },
              { name: "R Language", role: "Statistical Modeling", level: "Academic", color: "from-blue-500 to-indigo-500" },
              { name: "MySQL / Postgres", role: "Relational Storage", level: "Production", color: "from-cyan-600 to-blue-700" },
              { name: "Tailwind CSS v4", role: "Utility Design Engine", level: "Production", color: "from-cyan-400 to-teal-400" },
              { name: "QGIS", role: "Spatial Geospatial SIG", level: "Academic", color: "from-emerald-500 to-green-600" },
              { name: "Git & GitHub", role: "CI/CD & Version Control", level: "Production", color: "from-orange-500 to-rose-600" },
            ].map((tech) => (
              <div
                key={tech.name}
                className="glass-card rounded-xl p-4 flex flex-col justify-between group bg-white/90 dark:bg-[#0c1220]/75 border border-slate-200 dark:border-white/10 shadow-xs hover:border-cyan-500/40 transition-all"
              >
                <div>
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${tech.color} mb-3`} />
                  <p className="font-bold text-sm text-slate-900 dark:text-white font-mono">{tech.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{tech.role}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>TIER</span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-bold">{tech.level}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CLICKABLE FEATURED PROJECTS SHOWCASE */}
        <section id="projects" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 tracking-wider uppercase font-bold">
                // 03. REPOSITORIES
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5 font-display">
                <Code2 className="w-6 h-6 text-cyan-500" />
                <span>Featured Systems</span>
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-sans">
                Pilih kartu proyek untuk membaca detail arsitektur, fitur, dan dokumentasi teknis.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono shadow-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    activeCategory === cat
                      ? "bg-cyan-500 text-slate-950 font-bold shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className="glass-card rounded-2xl p-6 cursor-pointer flex flex-col justify-between group space-y-4 relative bg-white/95 dark:bg-[#0c1220]/80 border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md hover:border-cyan-500/50 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between font-mono">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 border border-slate-200 dark:border-slate-700">
                      {project.category}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">{project.role}</span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors flex items-center justify-between font-display">
                    <span>{project.title}</span>
                    <span className="text-xs text-cyan-600 dark:text-cyan-400 font-normal flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                      <span>Inspect</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {project.shortDescription}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex flex-wrap gap-1.5 font-mono">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* MODAL DETAIL PROYEK INTERAKTIF */}
        {selectedProject && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 relative">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 border border-slate-200 dark:border-slate-700 font-mono">
                    {selectedProject.category}
                  </span>
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white pt-1 font-display">
                    {selectedProject.title}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">// Role: {selectedProject.role}</p>
                </div>

                <button
                  onClick={() => setSelectedProject(null)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                    // OVERVIEW
                  </h4>
                  <p>{selectedProject.fullDescription || selectedProject.shortDescription}</p>
                </div>

                {selectedProject.features && selectedProject.features.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 font-mono">
                      // KEY_SPECIFICATIONS
                    </h4>
                    <ul className="space-y-1.5 font-mono text-xs text-slate-700 dark:text-slate-300">
                      {selectedProject.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 font-mono">
                    // STACK_DEPENDENCIES
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProject.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-950 text-cyan-700 dark:text-cyan-300 border border-slate-200 dark:border-slate-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 font-mono">
                <div className="flex items-center gap-2">
                  {selectedProject.githubUrl && (
                    <a
                      href={selectedProject.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-medium text-xs transition-all border border-slate-200 dark:border-slate-700"
                    >
                      <GithubIcon className="w-4 h-4" />
                      <span>View Source</span>
                    </a>
                  )}
                  {selectedProject.demoUrl && (
                    <a
                      href={selectedProject.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Launch App</span>
                    </a>
                  )}
                </div>

                <button
                  onClick={() => setSelectedProject(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* HACKER TERMINAL SECTION */}
        <section id="terminal" className="space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 tracking-wider uppercase font-bold">
              // 04. SHELL_ENVIRONMENT
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5 font-display">
              <TerminalIcon className="w-6 h-6 text-cyan-500" />
              <span>Interactive Developer Terminal</span>
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-sans">
              Direct command-line session running on virtual POSIX emulator.
            </p>
          </div>

          <div
            onClick={() => inputRef.current?.focus()}
            className="rounded-2xl border border-slate-300 dark:border-white/10 bg-[#090d16] shadow-xl dark:shadow-2xl overflow-hidden font-mono text-xs sm:text-sm transition-all focus-within:border-cyan-500/60"
          >
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-black/40 border-b border-white/5 text-slate-400 select-none">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-2 text-slate-300 font-semibold text-xs flex items-center gap-1.5">
                  <span>musgun@unimal: {currentCwd}</span>
                </span>
              </div>
              <span className="text-[11px] text-slate-500 hidden sm:inline">bash 5.2-release</span>
            </div>

            {/* Terminal Output Logs */}
            <div
              ref={terminalContainerRef}
              className="p-4 sm:p-5 space-y-3 min-h-[220px] max-h-[360px] overflow-y-auto"
            >
              {terminalLogs.map((log) => (
                <div key={log.id} className="space-y-1">
                  {log.command && (
                    <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                      <span className="text-emerald-400">musgun@unimal:{log.cwd || "~"}$</span>
                      <span>{log.command}</span>
                    </div>
                  )}
                  <div className="pl-3 border-l-2 border-white/10">{log.output}</div>
                </div>
              ))}
            </div>

            {/* Terminal Input Line */}
            <div className="p-4 bg-black/50 border-t border-white/5 flex items-center gap-2">
              <span className="text-emerald-400 font-bold whitespace-nowrap">
                musgun@unimal:{currentCwd}$
              </span>
              <input
                ref={inputRef}
                id="terminal-cli-input"
                name="terminal_input"
                type="text"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="type command (e.g. ls, cat about.txt, flutter, cls)..."
                className="flex-1 bg-transparent text-white outline-none font-mono text-xs sm:text-sm placeholder:text-slate-600"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                onClick={() => {
                  handleCommand(terminalInput);
                  setTerminalInput("");
                }}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-cyan-500 hover:text-black text-slate-300 transition-all"
                title="Execute"
              >
                <CornerDownLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* KONTAK & FOOTER BERSIH */}
        <section id="contact" className="text-center space-y-6 pt-8 border-t border-slate-200 dark:border-white/10">
          <div className="space-y-2">
            <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 tracking-wider uppercase font-bold">
              // 05. HANDSHAKE
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
              Initiate Collaboration
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto font-sans">
              Open for software engineering roles, mobile architecture projects, and high-impact technical initiatives.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 font-mono">
            <a
              href="mailto:musgun.slyr@gmail.com"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-sm hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/20"
            >
              <Mail className="w-4 h-4" />
              <span>musgun.slyr@gmail.com</span>
            </a>
            <a
              href="https://github.com/MuslimGunawan"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-xs"
            >
              <GithubIcon className="w-4 h-4" />
              <span>github.com/MuslimGunawan</span>
            </a>
          </div>

          <footer className="pt-12 text-xs text-slate-500 space-y-1 select-none font-mono">
            <p>© 2026 Muslim Gunawan. All rights reserved.</p>
            <p className="text-slate-600 dark:text-slate-400">Teknik Informatika // Universitas Malikussaleh</p>
          </footer>
        </section>
      </main>
    </div>
  );
}

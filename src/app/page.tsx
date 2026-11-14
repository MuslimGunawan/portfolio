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
          <p className="text-white font-bold">Muslim OS [Version 24.1.0-UNIMAL Kernel 6.1]</p>
          <p>© 2026 Muslim Gunawan. All rights reserved.</p>
          <p className="text-slate-500 pt-1">Type &apos;help&apos; for a list of built-in commands or explore with ls, cat, cd, etc.</p>
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

    // Command Parser untuk Linux, CMD, & PowerShell
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
              <span className="text-cyan-400">📁 projects/</span>
              <span className="text-emerald-400">📁 skills/</span>
              <span className="text-slate-200">📄 about.txt</span>
              <span className="text-slate-200">📄 unimal.md</span>
              <span className="text-slate-200">📄 contact.json</span>
              <span className="text-amber-400">⚙️ system.cfg</span>
            </div>
          );
        } else if (currentCwd.includes("projects")) {
          responseContent = (
            <div className="space-y-1 text-xs font-mono py-1 text-cyan-300">
              {projectsList.map((p) => (
                <p key={p.id}>• {p.title} ({p.category})</p>
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
          responseContent = <p className="text-xs text-slate-400">Directory is empty.</p>;
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
              <p>Asal: Kutacane, Aceh Tenggara | Mahasiswa Teknik Informatika UNIMAL Semester 5.</p>
              <p>Fokus: Pengembangan aplikasi mobile multi-platform Flutter, arsitektur web modern full-stack Laravel &amp; Next.js, serta analisis geospasial.</p>
            </div>
          );
        } else if (arg === "unimal.md") {
          responseContent = (
            <div className="space-y-1 text-xs text-slate-300 font-mono">
              <p className="text-amber-300 font-bold"># Universitas Malikussaleh (UNIMAL)</p>
              <p>• Fakultas Teknik • Jurusan Teknik Informatika</p>
              <p>• Kampus Utama: Bukit Indah / Reuleut, Lhokseumawe, Aceh</p>
              <p>• Status: Mahasiswa Aktif Semester 5</p>
            </div>
          );
        } else if (arg === "contact.json") {
          responseContent = (
            <pre className="text-xs text-cyan-300 font-mono bg-slate-950/60 p-2 rounded border border-slate-800">
{`{
  "name": "Muslim Gunawan",
  "email": "muslimgunawan@example.com",
  "github": "https://github.com/MuslimGunawan",
  "location": "Lhokseumawe, Aceh, Indonesia"
}`}
            </pre>
          );
        } else if (arg === "system.cfg") {
          responseContent = (
            <p className="text-xs text-slate-400 font-mono">
              NODE_ENV=production | FRAMEWORK=Next.js 16 | TURBOPACK=enabled
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
        responseContent = <p className="text-xs text-slate-300 font-mono">{new Date().toString()}</p>;
        break;

      case "ver":
      case "uname":
        responseContent = (
          <p className="text-xs text-slate-300 font-mono">
            Linux unimal-station 6.6.14-musgun-x86_64 #1 SMP PREEMPT GNU/Linux (Next.js Runtime)
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
            <p>Tools • Dart 3.6.x • DevTools 2.40.x</p>
            <p className="text-emerald-400">[✓] Flutter doctor: No issues found!</p>
          </div>
        );
        break;

      case "php":
        responseContent = (
          <p className="text-xs text-indigo-300 font-mono">
            PHP 8.5.0 (cli) (built: 2026) with Zend OPcache &amp; Laravel 12 Support
          </p>
        );
        break;

      case "python":
      case "python3":
        responseContent = (
          <p className="text-xs text-amber-300 font-mono">
            Python 3.13.0 (main) [Clang / GCC] on linux • QGIS &amp; Pandas ready
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
            [sudo] musgun is already in the sudoers file. You hold root guest privileges.
          </p>
        );
        break;

      case "help":
      case "man":
        responseContent = (
          <div className="space-y-1.5 text-xs font-mono">
            <p className="text-cyan-300 font-bold">Standard Shell Commands:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-slate-300">
              <p><span className="text-amber-300 font-bold">ls / dir</span> - list files</p>
              <p><span className="text-amber-300 font-bold">cd &lt;dir&gt;</span> - change dir</p>
              <p><span className="text-amber-300 font-bold">cat &lt;file&gt;</span> - read file</p>
              <p><span className="text-amber-300 font-bold">cls / clear</span> - clear screen</p>
              <p><span className="text-amber-300 font-bold">pwd</span> - current path</p>
              <p><span className="text-amber-300 font-bold">whoami</span> - user identity</p>
              <p><span className="text-amber-300 font-bold">ping</span> - network probe</p>
              <p><span className="text-amber-300 font-bold">flutter</span> - check tools</p>
            </div>
          </div>
        );
        break;

      default:
        responseContent = (
          <p className="text-xs text-rose-400 font-mono">
            bash: {mainCmd}: command not found. Type &apos;help&apos; to view valid commands.
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
    <div className="relative min-h-screen bg-[#06080d] bg-grid-pattern text-slate-100 overflow-x-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[360px] bg-gradient-to-b from-cyan-500/15 via-blue-600/10 to-transparent blur-[120px] pointer-events-none" />

      {/* MINIMALIST TOP BAR NAVIGATION (Bersih & Elegan) */}
      <header
        data-banna-skip
        className="sticky top-0 z-40 backdrop-blur-md bg-[#06080d]/85 border-b border-slate-800/80 px-6 py-4 transition-all"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo / Brand Name Bersih */}
          <a href="#" className="flex flex-col group">
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white group-hover:text-cyan-400 transition-colors">
              Muslim Gunawan
            </span>
            <span className="text-[11px] font-mono text-slate-400 tracking-wider">
              @musgun • UNIMAL
            </span>
          </a>

          {/* Navigasi Utama */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#about" className="hover:text-cyan-400 transition-colors">
              Tentang
            </a>
            <a href="#stack" className="hover:text-cyan-400 transition-colors">
              Tech Stack
            </a>
            <a href="#projects" className="hover:text-cyan-400 transition-colors">
              Proyek
            </a>
            <a href="#terminal" className="hover:text-cyan-400 transition-colors">
              Terminal
            </a>
            <a href="#contact" className="hover:text-cyan-400 transition-colors">
              Kontak
            </a>
          </nav>

          {/* Minimalist Right Action */}
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all text-xs"
              title="Admin Dashboard (CRUD Proyek)"
            >
              <Lock className="w-3.5 h-3.5" />
            </Link>

            <a
              href="#contact"
              className="px-4 py-1.5 rounded-full text-xs font-bold bg-cyan-400 hover:bg-cyan-300 text-slate-950 transition-all shadow-md shadow-cyan-500/20"
            >
              Hubungi
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-12 pb-24 space-y-24">
        {/* HERO SECTION */}
        <section id="hero" className="relative pt-6 pb-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Kiri: Teks & Headline */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/70 text-slate-300 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Teknik Informatika • Universitas Malikussaleh</span>
                <span className="text-slate-500">|</span>
                <span className="text-cyan-400 font-mono font-bold">Semester 5</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
                Merancang Aplikasi{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
                  Mobile &amp; Fullstack
                </span>{" "}
                yang Tangguh &amp; Elegan.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
                Halo! Saya <strong className="text-white">Muslim Gunawan</strong> (MusGun). 
                Mahasiswa Teknik Informatika UNIMAL yang aktif membangun aplikasi mobile performa tinggi dengan{" "}
                <strong className="text-cyan-300">Flutter</strong>, sistem web terukur dengan{" "}
                <strong className="text-sky-300">Laravel &amp; Next.js</strong>, serta visualisasi data geospasial.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#projects"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-sm hover:from-cyan-300 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/25"
                >
                  <span>Jelajahi Portofolio</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <a
                  href="https://github.com/MuslimGunawan"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-medium text-sm transition-all"
                >
                  <GithubIcon className="w-4 h-4 text-slate-300" />
                  <span>GitHub</span>
                </a>

                <a
                  href="#terminal"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-medium text-sm transition-all"
                >
                  <TerminalIcon className="w-4 h-4 text-cyan-400" />
                  <span>Terminal</span>
                </a>
              </div>

              {/* Status info bar */}
              <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-slate-400 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>Lhokseumawe / Aceh, Indonesia</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                  <span>NIM: 240170036</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tersedia untuk Magang &amp; Project</span>
                </div>
              </div>
            </div>

            {/* Kanan: Foto Profil & Kartu Identitas */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative group w-full max-w-[340px]">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-500 to-blue-600 opacity-40 blur-xl group-hover:opacity-60 transition duration-500" />

                <div className="relative rounded-3xl p-4 glass-card border border-slate-700/80 shadow-2xl space-y-4">
                  {/* Foto Utama */}
                  <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden border border-slate-700/60 bg-slate-900">
                    <Image
                      src="/pp.jpeg"
                      alt="Muslim Gunawan"
                      fill
                      sizes="(max-width: 768px) 100vw, 340px"
                      priority
                      className="object-cover object-top transition duration-500 group-hover:scale-105"
                    />
                    {/* Badge UNIMAL di dalam foto */}
                    <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl backdrop-blur-md bg-slate-950/85 border border-slate-700/60 flex items-center gap-3">
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
                        <p className="text-[10px] text-cyan-300 truncate">
                          Fakultas Teknik • Teknik Informatika
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Ringkasan Profil Card */}
                  <div className="space-y-1.5 px-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">Muslim Gunawan</span>
                      <span className="px-2 py-0.5 text-[10px] rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-mono">
                        NIM 240170036
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Mobile &amp; Fullstack Web Developer enthusiast yang berdedikasi membangun solusi perangkat lunak berdampak nyata.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BENTO GRID: TENTANG & FOKUS BIDANG */}
        <section id="about" className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Layers className="w-6 h-6 text-cyan-400" />
              <span>Bidang Keahlian &amp; Fondasi Akademik</span>
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl">
              Kombinasi kompetensi teknis dari bangku kuliah dan eksplorasi intensif di ekosistem software engineering modern.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Bento Card 1: Mobile Development */}
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-5 group-hover:scale-110 transition-transform">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Pemrograman Mobile (Flutter)</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Pengembangan aplikasi multi-platform (Android, Web) menggunakan Flutter dan Dart dengan fokus pada arsitektur bersih, UI responsif, state management, dan interaksi yang halus.
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-cyan-300 border border-slate-700">Flutter</span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-cyan-300 border border-slate-700">Dart</span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-cyan-300 border border-slate-700">Responsive UI</span>
              </div>
            </div>

            {/* Bento Card 2: Fullstack Web */}
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-5 group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Fullstack Web Engineering</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Membangun sistem web dinamis dan backend API yang tangguh menggunakan PHP 8.5 &amp; Laravel, serta frontend modern berbasis React, TypeScript, dan Next.js.
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-blue-300 border border-slate-700">PHP 8.5</span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-blue-300 border border-slate-700">Laravel</span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-blue-300 border border-slate-700">Next.js</span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-blue-300 border border-slate-700">MySQL</span>
              </div>
            </div>

            {/* Bento Card 3: Data & Spatial */}
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-110 transition-transform">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Data Analytics &amp; GIS Spasial</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Eksplorasi data dan visualisasi statistik menggunakan R &amp; Python, serta analisis sistem informasi geografis (GIS) untuk pemetaan wilayah dengan QGIS.
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-purple-300 border border-slate-700">R Language</span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-purple-300 border border-slate-700">Python</span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-purple-300 border border-slate-700">QGIS</span>
              </div>
            </div>
          </div>
        </section>

        {/* TECH STACK DETAIL SECTION */}
        <section id="stack" className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Cpu className="w-6 h-6 text-cyan-400" />
              <span>Teknologi &amp; Tooling yang Digunakan</span>
            </h2>
            <p className="text-sm text-slate-400">
              Tech stack yang saya gunakan sehari-hari dalam perkuliahan maupun pengembangan proyek aplikasi mandiri.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { name: "Flutter", role: "Mobile Framework", level: "Core", color: "from-sky-500 to-cyan-500" },
              { name: "Dart", role: "Programming Language", level: "Core", color: "from-blue-600 to-cyan-500" },
              { name: "Laravel", role: "Backend Framework", level: "Core", color: "from-red-600 to-rose-500" },
              { name: "PHP 8.5", role: "Server-side Language", level: "Core", color: "from-indigo-600 to-purple-600" },
              { name: "Next.js", role: "Modern React Framework", level: "Core", color: "from-slate-400 to-slate-200" },
              { name: "TypeScript", role: "Type-safe JavaScript", level: "Proficient", color: "from-blue-500 to-sky-400" },
              { name: "Python", role: "Scripting & Data Analysis", level: "Proficient", color: "from-amber-400 to-yellow-600" },
              { name: "R Language", role: "Data Visualization & Stats", level: "Academic", color: "from-blue-500 to-indigo-500" },
              { name: "MySQL / PostgreSQL", role: "Relational Database", level: "Core", color: "from-cyan-600 to-blue-700" },
              { name: "Tailwind CSS v4", role: "Modern Utility Styling", level: "Core", color: "from-cyan-400 to-teal-400" },
              { name: "QGIS", role: "Geographic Information System", level: "Academic", color: "from-emerald-500 to-green-600" },
              { name: "Git & GitHub", role: "Version Control System", level: "Core", color: "from-orange-500 to-rose-600" },
            ].map((tech) => (
              <div
                key={tech.name}
                className="glass-card rounded-xl p-4 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${tech.color} mb-3`} />
                  <p className="font-bold text-sm text-white">{tech.name}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{tech.role}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>Level</span>
                  <span className="text-slate-300">{tech.level}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CLICKABLE FEATURED PROJECTS SHOWCASE */}
        <section id="projects" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
                <Code2 className="w-6 h-6 text-cyan-400" />
                <span>Featured Projects</span>
              </h2>
              <p className="text-sm text-slate-400">
                Klik kartu proyek untuk melihat detail fitur, arsitektur, dan tautan kode.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    activeCategory === cat
                      ? "bg-cyan-400 text-slate-950 font-semibold shadow-sm"
                      : "text-slate-400 hover:text-white"
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
                className="glass-card rounded-2xl p-6 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/70 cursor-pointer transition-all flex flex-col justify-between group space-y-4 relative"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800/90 text-cyan-300 border border-slate-700">
                      {project.category}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">{project.role}</span>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors flex items-center justify-between">
                    <span>{project.title}</span>
                    <span className="text-xs text-cyan-400 font-normal flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Detail</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {project.shortDescription}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 border border-slate-800"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* MODAL DETAIL PROYEK YANG DAPAT DI-KLIK */}
        {selectedProject && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 relative">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-cyan-300 border border-slate-700">
                    {selectedProject.category}
                  </span>
                  <h2 className="text-2xl font-bold text-white pt-1">
                    {selectedProject.title}
                  </h2>
                  <p className="text-xs text-slate-400 font-mono">Peran: {selectedProject.role}</p>
                </div>

                <button
                  onClick={() => setSelectedProject(null)}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                  title="Tutup"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                    Tentang Proyek
                  </h4>
                  <p>{selectedProject.fullDescription || selectedProject.shortDescription}</p>
                </div>

                {selectedProject.features && selectedProject.features.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                      Fitur &amp; Arsitektur Kunci
                    </h4>
                    <ul className="space-y-1.5">
                      {selectedProject.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                    Teknologi yang Digunakan
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProject.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-950 text-cyan-300 border border-slate-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {selectedProject.githubUrl && (
                    <a
                      href={selectedProject.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-all border border-slate-700"
                    >
                      <GithubIcon className="w-4 h-4" />
                      <span>Lihat Kode di GitHub</span>
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
                      <span>Buka Live Demo</span>
                    </a>
                  )}
                </div>

                <button
                  onClick={() => setSelectedProject(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs"
                >
                  Tutup Dialog
                </button>
              </div>
            </div>
          </div>
        )}

        {/* REAL AUTHENTIC TERMINAL SECTION (Tanpa Clue, Dukung cls/dir/ls/cat) */}
        <section id="terminal" className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <TerminalIcon className="w-6 h-6 text-cyan-400" />
              <span>Interactive Developer Terminal</span>
            </h2>
            <p className="text-sm text-slate-400">
              Konsol command-line interaktif dengan dukungan perintah standar (ls, dir, cat, cd, cls, flutter, git).
            </p>
          </div>

          <div
            onClick={() => inputRef.current?.focus()}
            className="glass-card rounded-2xl border border-slate-800 shadow-2xl overflow-hidden font-mono text-xs sm:text-sm transition-all focus-within:border-cyan-500/50"
          >
            {/* Terminal Header Bersih */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800 text-slate-400 select-none">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-2 text-slate-300 font-semibold text-xs flex items-center gap-1.5">
                  <span>musgun@unimal: {currentCwd}</span>
                </span>
              </div>
              <span className="text-[11px] text-slate-500 hidden sm:inline">bash / zsh session</span>
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
                  <div className="pl-3 border-l-2 border-slate-800/80">{log.output}</div>
                </div>
              ))}
            </div>

            {/* Terminal Input Line */}
            <div className="p-4 bg-slate-950/70 border-t border-slate-800/80 flex items-center gap-2">
              <span className="text-emerald-400 font-bold whitespace-nowrap">
                musgun@unimal:{currentCwd}$
              </span>
              <input
                ref={inputRef}
                type="text"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="type a command (e.g. ls, cat about.txt, flutter, cls)..."
                className="flex-1 bg-transparent text-white outline-none font-mono text-xs sm:text-sm placeholder:text-slate-600"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                onClick={() => {
                  handleCommand(terminalInput);
                  setTerminalInput("");
                }}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-cyan-400 hover:text-black text-slate-300 transition-all"
                title="Execute command"
              >
                <CornerDownLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* KONTAK & FOOTER BERSIH */}
        <section id="contact" className="text-center space-y-6 pt-8 border-t border-slate-800/80">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Mari Terhubung &amp; Berkolaborasi
            </h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Tertarik mendiskusikan proyek aplikasi mobile, web modern, atau peluang kolaborasi akademik? Pintu selalu terbuka.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="mailto:muslimgunawan@example.com"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-bold text-sm hover:bg-cyan-300 transition-all shadow-md shadow-cyan-500/20"
            >
              <Mail className="w-4 h-4" />
              <span>Email Saya</span>
            </a>
            <a
              href="https://github.com/MuslimGunawan"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium text-sm hover:bg-slate-800 transition-all"
            >
              <GithubIcon className="w-4 h-4" />
              <span>GitHub Profile</span>
            </a>
          </div>

          <footer className="pt-12 text-xs text-slate-500 space-y-1 select-none">
            <p>© 2026 Muslim Gunawan. All rights reserved.</p>
            <p className="text-slate-600">Teknik Informatika • Universitas Malikussaleh</p>
          </footer>
        </section>
      </main>
    </div>
  );
}

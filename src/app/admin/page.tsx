"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FolderPlus,
  Edit2,
  Trash2,
  GitBranch,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Unlock,
  Save,
  RotateCw,
  ExternalLink,
  AlertCircle,
  Eye,
} from "lucide-react";

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

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "Mobile" as Project["category"],
    role: "",
    shortDescription: "",
    fullDescription: "",
    featuresText: "",
    tagsText: "",
    githubUrl: "",
    demoUrl: "",
    featured: true,
  });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (Array.isArray(data)) {
        setProjects(data);
      }
    } catch (err) {
      console.error("Gagal load projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default PIN: NIM Muslim (240170036) atau 1234
    if (pinInput === "240170036" || pinInput === "1234") {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      title: "",
      category: "Mobile",
      role: "Lead Developer",
      shortDescription: "",
      fullDescription: "",
      featuresText: "",
      tagsText: "",
      githubUrl: "https://github.com/MuslimGunawan",
      demoUrl: "",
      featured: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setEditingId(project.id);
    setFormData({
      title: project.title,
      category: project.category,
      role: project.role,
      shortDescription: project.shortDescription,
      fullDescription: project.fullDescription,
      featuresText: project.features.join("\n"),
      tagsText: project.tags.join(", "),
      githubUrl: project.githubUrl,
      demoUrl: project.demoUrl,
      featured: project.featured ?? true,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus proyek ini?")) return;
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    await saveProjectsToBackend(updated);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newProject: Project = {
      id: editingId || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      title: formData.title,
      category: formData.category,
      role: formData.role,
      shortDescription: formData.shortDescription,
      fullDescription: formData.fullDescription,
      features: formData.featuresText
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean),
      tags: formData.tagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      githubUrl: formData.githubUrl,
      demoUrl: formData.demoUrl,
      featured: formData.featured,
    };

    let updated: Project[];
    if (editingId) {
      updated = projects.map((p) => (p.id === editingId ? newProject : p));
    } else {
      updated = [newProject, ...projects];
    }

    setProjects(updated);
    setIsModalOpen(false);
    await saveProjectsToBackend(updated);
  };

  const saveProjectsToBackend = async (data: Project[]) => {
    setSaving(true);
    try {
      await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch (err) {
      console.error("Gagal save projects:", err);
      alert("Gagal menyimpan ke server");
    } finally {
      setSaving(false);
    }
  };

  const handleGitSync = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      // Pastikan data tersimpan dulu
      await saveProjectsToBackend(projects);

      const res = await fetch("/api/git-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `chore(portfolio): update projects via admin dashboard [${new Date().toLocaleTimeString()}]`,
        }),
      });
      const result = await res.json();
      setSyncMessage(result.message || "Sinkronisasi selesai!");
    } catch (err) {
      setSyncMessage("Gagal git sync: " + String(err));
    } finally {
      setSyncing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#06080d] text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl text-center space-y-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl font-bold tracking-tight text-white">
              Admin Dashboard Portfolio
            </h1>
            <p className="text-xs text-slate-400">
              Masukkan PIN Admin untuk mengelola portofolio Muslim Gunawan.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Masukkan PIN (Default: NIM kamu)"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-center font-mono tracking-widest text-lg outline-none focus:border-cyan-400 transition-all text-white placeholder:text-slate-600"
              autoFocus
            />

            {pinError && (
              <p className="text-xs text-rose-400 flex items-center justify-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>PIN salah! Coba gunakan NIM kamu (240170036).</span>
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-sm hover:from-cyan-300 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/20"
            >
              Buka Dashboard
            </button>
          </form>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors pt-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Halaman Utama</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06080d] text-slate-100 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Bar Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all border border-slate-800"
                title="Kembali ke Web Portofolio"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>Manajemen Proyek Portofolio</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                  Admin
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 pl-11">
              Kelola proyek yang tampil di portofolio. Setiap simpan bisa langsung di-push ke GitHub untuk auto-deploy Vercel.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pl-11 sm:pl-0">
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/20"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Tambah Proyek</span>
            </button>

            <button
              onClick={handleGitSync}
              disabled={syncing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold text-xs hover:from-emerald-400 hover:to-teal-500 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
            >
              {syncing ? (
                <RotateCw className="w-4 h-4 animate-spin" />
              ) : (
                <GitBranch className="w-4 h-4" />
              )}
              <span>{syncing ? "Menyinkronkan..." : "Simpan & Push ke GitHub"}</span>
            </button>
          </div>
        </div>

        {/* Sync Status Banner */}
        {syncMessage && (
          <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-3 shadow-lg">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            <div className="flex-1">
              <p className="font-semibold text-white">Status Git & Vercel Sync:</p>
              <p className="text-slate-300 mt-0.5">{syncMessage}</p>
            </div>
            <button
              onClick={() => setSyncMessage(null)}
              className="text-slate-500 hover:text-white text-xs px-2 py-1"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Project List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Daftar Proyek Aktif ({projects.length})</span>
            {saving && <span className="text-cyan-400">Menyimpan perubahan...</span>}
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              Memuat data proyek...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-cyan-300 border border-slate-700">
                        {project.category}
                      </span>
                      <h3 className="text-base font-bold text-white">{project.title}</h3>
                      <span className="text-xs text-slate-500 font-mono">({project.role})</span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {project.shortDescription}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => openEditModal(project)}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all border border-slate-700"
                      title="Edit Proyek"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="p-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 transition-all border border-rose-800/60"
                      title="Hapus Proyek"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL FORM TAMBAH / EDIT PROYEK */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl my-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">
                {editingId ? "Edit Proyek" : "Tambah Proyek Baru"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                Tutup ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">Judul Proyek</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Contoh: Temu Kampus"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Project["category"] })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none focus:border-cyan-400"
                  >
                    <option value="Mobile">Mobile</option>
                    <option value="Web">Web</option>
                    <option value="Data & GIS">Data & GIS</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Peran / Role Kamu</label>
                <input
                  type="text"
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="Contoh: Lead Mobile Developer / Backend Engineer"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Deskripsi Singkat (Tampil di kartu)</label>
                <textarea
                  rows={2}
                  required
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Rangkuman 1-2 kalimat..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Deskripsi Lengkap (Tampil di popup detail)</label>
                <textarea
                  rows={3}
                  required
                  value={formData.fullDescription}
                  onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                  placeholder="Penjelasan mendalam arsitektur dan solusi yang dibangun..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Fitur Utama (Satu per baris)</label>
                <textarea
                  rows={3}
                  value={formData.featuresText}
                  onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
                  placeholder="Otentikasi mahasiswa&#10;Push notification jadwal&#10;State management Riverpod"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Tech Tags (Pisahkan dengan koma)</label>
                <input
                  type="text"
                  value={formData.tagsText}
                  onChange={(e) => setFormData({ ...formData, tagsText: e.target.value })}
                  placeholder="Flutter, Dart, Laravel, MySQL"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">GitHub Repository URL</label>
                  <input
                    type="url"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    placeholder="https://github.com/MuslimGunawan/..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">Live Demo URL (Opsional)</label>
                  <input
                    type="url"
                    value={formData.demoUrl}
                    onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold hover:from-cyan-300 hover:to-blue-400 transition-all shadow-md shadow-cyan-500/20"
                >
                  Simpan Proyek
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

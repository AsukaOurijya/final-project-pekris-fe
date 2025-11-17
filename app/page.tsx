"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAcademicData } from "./state/AcademicDataProvider";

const statusColors: Record<string, string> = {
  BELUM_DIKERJAKAN: "bg-slate-100 text-slate-800",
  SEDANG_DIKERJAKAN: "bg-amber-100 text-amber-800",
  SELESAI: "bg-emerald-100 text-emerald-800",
};

const formatDate = (value?: string) =>
  new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(value ? new Date(value) : new Date());

export default function Home() {
  const { courses, tasks, isLoading } = useAcademicData();

  const summary = useMemo(() => {
    const normalizeStatus = (status?: string) =>
      (status as keyof typeof statusColors) ?? "BELUM_DIKERJAKAN";

    const pending = tasks.filter(
      (task) => normalizeStatus(task.status) === "BELUM_DIKERJAKAN",
    );
    const inProgress = tasks.filter(
      (task) => normalizeStatus(task.status) === "SEDANG_DIKERJAKAN",
    );
    const done = tasks.filter(
      (task) => normalizeStatus(task.status) === "SELESAI",
    );

    const upcoming = tasks
      .filter((task) => normalizeStatus(task.status) !== "SELESAI")
      .slice()
      .sort(
        (a, b) =>
          new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
      )
      .slice(0, 3);

    return { pending, inProgress, done, upcoming };
  }, [tasks]);

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-8 text-white shadow-xl">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-200">
            Tugas Tracker 
          </p>
          <h1 className="mt-2 text-3xl font-semibold lg:text-4xl">
            allocat
          </h1>
          <p className="mt-3 max-w-2xl text-slate-200">
            Tugas makin numpuk dan susah diatur? allocat saja!
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/assignments"
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-md transition hover:-translate-y-[1px] hover:shadow-lg"
            >
              Tambah Tugas Cepat
            </Link>
            <Link
              href="/tracker"
              className="rounded-xl border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:border-white hover:bg-white/10"
            >
              Buka Tracker
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Total Mata Kuliah</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {courses.length}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Pastikan data deskripsi & sks selalu terbaru.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Tugas {isLoading && "(memuat...)"}
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {tasks.length}
            </p>
            <div className="mt-3 flex gap-2 text-xs">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                Pending: {summary.pending.length}
              </span>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-800">
                Progres: {summary.inProgress.length}
              </span>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800">
                Selesai: {summary.done.length}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Tugas Mendekat</p>
              <h2 className="text-xl font-semibold text-slate-900">
                Utamakan yang deadline-nya dekat
              </h2>
            </div>
            <Link
              href="/assignments"
              className="text-sm font-semibold text-indigo-600 hover:underline"
            >
              Lihat semua
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {summary.upcoming.map((task) => {
              const course = courses.find((c) => c.id === task.mataKuliahId);
              const status = (task.status as keyof typeof statusColors) ?? "BELUM_DIKERJAKAN";
              return (
                <div
                  key={task.id}
                  className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50/60 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {task.nama}
                    </p>
                    <p className="text-xs text-slate-500">
                      {course?.nama ?? "Mata kuliah tidak ditemukan"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[status]}`}
                    >
                      {status}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">
                      {formatDate(task.deadline)}
                    </span>
                  </div>
                </div>
              );
            })}
            {summary.upcoming.length === 0 && (
              <p className="text-sm text-slate-500">
                {isLoading
                  ? "Memuat tugas..."
                  : "Belum ada tugas aktif. Yuk tambahkan tugas baru!"}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Langsung mulai</p>
            <h3 className="text-lg font-semibold text-slate-900">
              Akses cepat fitur utama
            </h3>
            <div className="mt-3 grid gap-3">
              <QuickLink href="/courses" title="Manajemen Mata Kuliah">
                Tambah, ubah, atau hapus data mata kuliah.
              </QuickLink>
              <QuickLink href="/assignments" title="Manajemen Tugas">
                Catat detail tugas dan deadline per mata kuliah.
              </QuickLink>
              <QuickLink href="/tracker" title="Tracker Tugas">
                Gerakkan status tugas dari pending hingga selesai.
              </QuickLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function QuickLink({
  href,
  title,
  children,
}: {
  href: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-slate-200 bg-slate-50/60 p-4 transition hover:-translate-y-[1px] hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="text-xs text-slate-500">{children}</p>
        </div>
        <span className="text-sm font-bold text-indigo-600 transition group-hover:translate-x-1">
          →
        </span>
      </div>
    </Link>
  );
}

"use client";

import { useMemo } from "react";
import { TaskResponse, TaskStatus } from "../lib/api";
import { useAcademicData } from "../state/AcademicDataProvider";

const statuses: TaskStatus[] = [
  "BELUM_DIKERJAKAN",
  "SEDANG_DIKERJAKAN",
  "SELESAI",
];

const badgeStyles: Record<TaskStatus, string> = {
  BELUM_DIKERJAKAN: "bg-slate-100 text-slate-800",
  SEDANG_DIKERJAKAN: "bg-amber-100 text-amber-800",
  SELESAI: "bg-emerald-100 text-emerald-800",
};

export default function TrackerPage() {
  const { tasks, courses, setTaskStatus, isLoading } = useAcademicData();

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "SELESAI").length;
    const doing = tasks.filter((t) => t.status === "SEDANG_DIKERJAKAN").length;
    const pending = tasks.filter((t) => t.status === "BELUM_DIKERJAKAN").length;
    const progress = total === 0 ? 0 : Math.round((done / total) * 100);

    return { total, done, doing, pending, progress };
  }, [tasks]);

  const tasksByStatus = useMemo(() => {
    return statuses.map((status) => ({
      status,
      items: tasks.filter((task) => task.status === status),
    }));
  }, [tasks]);

  const courseLookup = useMemo(
    () =>
      courses.reduce<Record<string, string>>((acc, course) => {
        acc[course.id] = course.nama;
        return acc;
      }, {}),
    [courses],
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">Tracker Tugas</p>
          <h1 className="text-2xl font-semibold text-slate-900">
            Gerakkan status tugas sampai selesai
          </h1>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {stats.total} tugas terdaftar
        </span>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pending" value={stats.pending} color="text-slate-900" />
        <StatCard
          label="Sedang dikerjakan"
          value={stats.doing}
          color="text-amber-700"
        />
        <StatCard label="Selesai" value={stats.done} color="text-emerald-700" />
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Progress keseluruhan</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-slate-900">
              {stats.progress}%
            </span>
            <span className="text-xs text-slate-500">tugas selesai</span>
          </div>
          <div className="mt-3 h-3 w-full rounded-full bg-slate-100">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 transition-[width]"
              style={{ width: `${stats.progress}%` }}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {tasksByStatus.map((column) => (
          <div
            key={column.status}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">
                {column.status}
              </h2>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeStyles[column.status]}`}
              >
                {column.items.length} tugas
              </span>
            </div>

            <div className="mt-3 space-y-3">
              {column.items.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  courseName={courseLookup[task.mataKuliahId]}
                  onUpdate={setTaskStatus}
                />
              ))}
              {isLoading && (
                <p className="text-xs text-slate-500">Memuat tugas...</p>
              )}
              {column.items.length === 0 && (
                <p className="text-xs text-slate-500">
                  Belum ada tugas di status ini.
                </p>
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

function TaskCard({
  task,
  courseName,
  onUpdate,
}: {
  task: TaskResponse;
  courseName?: string;
  onUpdate: (id: string, status: TaskStatus) => void;
}) {
  const nextAction =
    task.status === "BELUM_DIKERJAKAN"
      ? { label: "Mulai kerjakan", status: "SEDANG_DIKERJAKAN" as TaskStatus }
      : task.status === "SEDANG_DIKERJAKAN"
        ? { label: "Tandai selesai", status: "SELESAI" as TaskStatus }
        : null;

  return (
    <article className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">{task.nama}</p>
          <p className="text-xs text-slate-500">
            {courseName ?? "Mata kuliah tidak ditemukan"}
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-700">
          {new Intl.DateTimeFormat("id-ID", {
            day: "numeric",
            month: "short",
          }).format(new Date(task.deadline))}
        </span>
      </div>
      {task.deskripsi && (
        <p className="text-xs text-slate-600">{task.deskripsi}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {nextAction && (
          <button
            onClick={() => onUpdate(task.id, nextAction.status)}
            className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
          >
            {nextAction.label}
          </button>
        )}
        {task.status !== "BELUM_DIKERJAKAN" && (
          <button
            onClick={() => onUpdate(task.id, "BELUM_DIKERJAKAN")}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 transition hover:bg-white"
          >
            Kembalikan ke Pending
          </button>
        )}
        {task.status !== "SELESAI" && (
          <button
            onClick={() => onUpdate(task.id, "SELESAI")}
            className="rounded-lg bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-200"
          >
            Tandai Selesai
          </button>
        )}
      </div>
    </article>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}

"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { TaskResponse, TaskStatus } from "../lib/api";
import { useAcademicData } from "../state/AcademicDataProvider";

interface TaskFormState {
  nama: string;
  mataKuliahId: string;
  deadline: string;
  deskripsi: string;
  status: TaskStatus;
}

const statusStyles: Record<TaskStatus, string> = {
  BELUM_DIKERJAKAN: "bg-slate-100 text-slate-800",
  SEDANG_DIKERJAKAN: "bg-amber-100 text-amber-800",
  SELESAI: "bg-emerald-100 text-emerald-800",
};

const statuses: TaskStatus[] = [
  "BELUM_DIKERJAKAN",
  "SEDANG_DIKERJAKAN",
  "SELESAI",
];

export default function AssignmentsPage() {
  const {
    courses,
    tasks,
    addTask,
    updateTask,
    deleteTask,
    setTaskStatus,
    isLoading,
  } = useAcademicData();

  const [filterCourse, setFilterCourse] = useState<string>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TaskFormState>({
    nama: "",
    mataKuliahId: courses[0]?.id ?? "",
    deadline: new Date().toISOString().split("T")[0],
    deskripsi: "",
    status: "BELUM_DIKERJAKAN",
  });

  useEffect(() => {
    if (!form.mataKuliahId && courses[0]) {
      setForm((prev) => ({ ...prev, mataKuliahId: courses[0].id }));
    }
  }, [courses, form.mataKuliahId]);

  const visibleTasks = useMemo(() => {
    const filtered =
      filterCourse === "all"
        ? tasks
        : tasks.filter((task) => task.mataKuliahId === filterCourse);

    return filtered
      .slice()
      .sort(
        (a, b) =>
          new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
      );
  }, [filterCourse, tasks]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.nama.trim() || !form.mataKuliahId) return;

    if (editingId) {
      await updateTask(editingId, form);
      setEditingId(null);
    } else {
      await addTask(form);
    }

    setForm({
      nama: "",
      mataKuliahId: courses[0]?.id ?? "",
      deadline: new Date().toISOString().split("T")[0],
      deskripsi: "",
      status: "BELUM_DIKERJAKAN",
    });
  };

  const startEdit = (task: TaskResponse) => {
    setEditingId(task.id);
    setForm({
      nama: task.nama,
      mataKuliahId: task.mataKuliahId,
      deadline: task.deadline,
      deskripsi: task.deskripsi ?? "",
      status: task.status,
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      nama: "",
      mataKuliahId: courses[0]?.id ?? "",
      deadline: new Date().toISOString().split("T")[0],
      deskripsi: "",
      status: "BELUM_DIKERJAKAN",
    });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">Manajemen Tugas</p>
          <h1 className="text-2xl font-semibold text-slate-900">
            Tambah, ubah, dan kelola deadline
          </h1>
        </div>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
          {tasks.length} tugas tercatat
        </span>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1fr,1.5fr]">
        <form
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          onSubmit={handleSubmit}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Isi detail tugas dan tautkan ke mata kuliah
              </p>
              <h2 className="text-lg font-semibold text-slate-900">
                {editingId ? "Edit Tugas" : "Input Tugas"}
              </h2>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs font-semibold text-slate-500 hover:underline"
              >
                Batalkan edit
              </button>
            )}
          </div>

          <div className="mt-4 space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              Judul Tugas
              <input
                required
                value={form.nama}
                onChange={(e) => setForm((prev) => ({ ...prev, nama: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="misal: Laporan Jurnal Sistem Operasi"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Mata Kuliah
              <select
                required
                value={form.mataKuliahId}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, mataKuliahId: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.nama}
                  </option>
                ))}
                {courses.length === 0 && <option>Tidak ada mata kuliah</option>}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Deadline
              <input
                type="date"
                required
                value={form.deadline}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, deadline: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Status
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    status: e.target.value as TaskStatus,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Deskripsi (opsional)
              <textarea
                value={form.deskripsi}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, deskripsi: e.target.value }))
                }
                rows={3}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="Detail tugas, format pengumpulan, dsb."
              />
            </label>
          </div>

          <div className="mt-5 flex gap-2">
            <button
              type="submit"
              disabled={courses.length === 0}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition enabled:hover:-translate-y-[1px] enabled:hover:shadow-md disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {editingId ? "Simpan Perubahan" : "Tambah Tugas"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
          {courses.length === 0 && (
            <p className="mt-3 text-xs text-rose-600">
              Tambahkan mata kuliah dulu agar tugas bisa ditautkan.
            </p>
          )}
        </form>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">Daftar tugas</p>
              <h2 className="text-lg font-semibold text-slate-900">
                Filter berdasarkan mata kuliah
              </h2>
            </div>
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              <option value="all">Semua mata kuliah</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.nama}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 space-y-3">
            {isLoading && (
              <p className="text-sm text-slate-500">Memuat tugas...</p>
            )}
            {visibleTasks.map((task) => {
              const course = courses.find((c) => c.id === task.mataKuliahId);
              return (
                <article
                  key={task.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-900">
                        {task.nama}
                      </p>
                      <p className="text-xs text-slate-500">
                        {course?.nama ?? "Mata kuliah tidak ditemukan"}
                      </p>
                      {task.deskripsi && (
                        <p className="text-xs text-slate-600">
                          {task.deskripsi}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-white px-3 py-1 font-semibold text-slate-700">
                          Deadline:{" "}
                          {new Intl.DateTimeFormat("id-ID", {
                            day: "numeric",
                            month: "short",
                          }).format(new Date(task.deadline))}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 font-semibold ${statusStyles[task.status]}`}
                        >
                          {task.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {task.status !== "BELUM_DIKERJAKAN" && (
                        <button
                          onClick={() => setTaskStatus(task.id, "BELUM_DIKERJAKAN")}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 transition hover:bg-white"
                        >
                          Tandai Pending
                        </button>
                      )}
                      {task.status !== "SEDANG_DIKERJAKAN" && (
                        <button
                          onClick={() => setTaskStatus(task.id, "SEDANG_DIKERJAKAN")}
                          className="rounded-lg bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-800 transition hover:bg-amber-200"
                        >
                          Kerjakan
                        </button>
                      )}
                      {task.status !== "SELESAI" && (
                        <button
                          onClick={() => setTaskStatus(task.id, "SELESAI")}
                          className="rounded-lg bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-200"
                        >
                          Selesai
                        </button>
                      )}
                      <button
                        onClick={() => startEdit(task)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 transition hover:bg-white"
                      >
                        Ubah
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="rounded-lg bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-800 transition hover:bg-rose-200"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
            {!isLoading && visibleTasks.length === 0 && (
              <p className="text-sm text-slate-500">
                Belum ada tugas untuk filter ini. Tambahkan tugas baru terlebih
                dahulu.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

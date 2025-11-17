"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  CoursePayload,
  CourseResponse,
} from "../lib/api";
import { useAcademicData } from "../state/AcademicDataProvider";

export default function CoursesPage() {
  const {
    courses,
    tasks,
    addCourse,
    updateCourse,
    deleteCourse,
    isLoading,
    error,
  } = useAcademicData();
  const [form, setForm] = useState<CoursePayload>({
    nama: "",
    deskripsi: "",
    sks: 3,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const taskCountByCourse = useMemo(() => {
    return tasks.reduce<Record<string, number>>((acc, task) => {
      acc[task.mataKuliahId] = (acc[task.mataKuliahId] ?? 0) + 1;
      return acc;
    }, {});
  }, [tasks]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.nama.trim()) return;

    if (editingId) {
      await updateCourse(editingId, form);
      setEditingId(null);
    } else {
      await addCourse(form);
    }

    setForm({ nama: "", deskripsi: "", sks: 3 });
  };

  const startEdit = (course: CourseResponse) => {
    setEditingId(course.id);
    setForm({
      nama: course.nama,
      deskripsi: course.deskripsi,
      sks: course.sks,
    });
  };

  const resetForm = () => {
    setForm({ nama: "", deskripsi: "", sks: 3 });
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">Manajemen Mata Kuliah</p>
          <h1 className="text-2xl font-semibold text-slate-900">
            Kelola daftar mata kuliah & SKS
          </h1>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {courses.length} mata kuliah aktif
        </span>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1fr,1.3fr]">
        <form
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          onSubmit={handleSubmit}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                {editingId ? "Update data mata kuliah" : "Tambah mata kuliah"}
              </p>
              <h2 className="text-lg font-semibold text-slate-900">
                {editingId ? "Ubah Detail Kelas" : "Input Baru"}
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
              Nama Mata Kuliah
              <input
                name="nama"
                required
                value={form.nama}
                onChange={(e) => setForm((prev) => ({ ...prev, nama: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="misal: Pengantar Organisasi Komputer"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Deskripsi
              <textarea
                name="deskripsi"
                value={form.deskripsi}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, deskripsi: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="Ringkasan materi, jadwal, atau catatan khusus"
                rows={3}
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              SKS
              <input
                type="number"
                min={1}
                max={6}
                required
                value={form.sks}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, sks: Number(e.target.value) }))
                }
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </label>
          </div>

          <div className="mt-5 flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
            >
              {editingId ? "Simpan Perubahan" : "Tambah Mata Kuliah"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
        </form>

        <div className="space-y-3">
          {error && (
            <p className="text-sm text-rose-600">
              Gagal memuat data: {error}
            </p>
          )}
          {isLoading && (
            <p className="text-sm text-slate-500">Memuat data mata kuliah...</p>
          )}
          {courses.map((course) => (
            <article
              key={course.id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between"
            >
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-slate-900">
                  {course.nama}
                </h3>
                <p className="text-sm text-slate-600">
                  SKS: {course.sks}
                </p>
                {course.deskripsi && (
                  <p className="text-xs text-slate-500">
                    Deskripsi: {course.deskripsi}
                  </p>
                )}
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {taskCountByCourse[course.id] ?? 0} tugas terdaftar
                </span>
              </div>
              <div className="flex gap-2 self-start md:self-auto">
                <button
                  onClick={() => startEdit(course)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 transition hover:bg-slate-100"
                >
                  Ubah
                </button>
                <button
                  onClick={() => deleteCourse(course.id)}
                  className="rounded-lg bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-800 transition hover:bg-rose-200"
                >
                  Hapus
                </button>
              </div>
            </article>
          ))}
          {courses.length === 0 && (
            <p className="text-sm text-slate-500">
              Belum ada mata kuliah. Tambahkan data kelas terlebih dahulu.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

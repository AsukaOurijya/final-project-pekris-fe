"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useAcademicData } from "./state/AcademicDataProvider";
import catImage from "../img/cat.png";

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
      <section className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 bg-white">
        <div className="flex min-h-[calc(100vh-120px)] w-full flex-col justify-center gap-10 px-6 py-10 sm:px-12 lg:flex-row lg:items-center lg:gap-16 lg:px-16">
          <div className="max-w-xl lg:ml-16 lg:pr-12">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
              Tugas Tracker 
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900 lg:text-4xl">
              allocat
            </h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              Tugas makin numpuk dan susah diatur? allocat saja!
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/assignments"
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:-translate-y-[1px] hover:shadow-lg"
              >
                Tambah Tugas Cepat
              </Link>
              <Link
                href="/tracker"
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:-translate-y-[1px] hover:border-slate-400 hover:bg-slate-50"
              >
                Buka Tracker
              </Link>
            </div>
          </div>
          <div className="flex w-full justify-center lg:w-auto lg:justify-end">
            <Image
              src={catImage}
              alt="Kucing"
              width={420}
              height={420}
              className="h-auto w-64 sm:w-80 lg:w-[26rem] lg:h-auto object-contain"
              priority
            />
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

"use client";

export type TaskStatus = "BELUM_DIKERJAKAN" | "SEDANG_DIKERJAKAN" | "SELESAI";

export interface CoursePayload {
  nama: string;
  deskripsi: string;
  sks: number;
}

export interface CourseResponse extends CoursePayload {
  id: string;
  createdAt: string;
  updatedAt: string;
  tugas?: TaskResponse[];
}

export interface TaskPayload {
  nama: string;
  deskripsi?: string;
  status?: TaskStatus;
  deadline: string;
  mataKuliahId: string;
}

export interface TaskResponse extends TaskPayload {
  id: string;
  createdAt: string;
  updatedAt: string;
  mataKuliah?: Pick<CourseResponse, "id" | "nama" | "sks">;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://pekris-webdev.vercel.app";
const API_KEY =
  process.env.NEXT_PUBLIC_API_KEY ?? "VyBGCPZhPlHjnyPPnLKZKMpOuuRH6xUx";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { ...headers, ...(init?.headers ?? {}) },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      body || `API error ${res.status}: ${res.statusText} (${path})`,
    );
  }

  if (res.status === 204) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return undefined as unknown as T;
  }

  return res.json() as Promise<T>;
}

export const api = {
  courses: {
    list: (includeTugas = true) =>
      request<CourseResponse[]>(
        `/api/matkul${includeTugas ? "?include=tugas" : ""}`,
      ),
    create: (payload: CoursePayload) =>
      request<CourseResponse>("/api/matkul", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    update: (id: string, payload: CoursePayload) =>
      request<CourseResponse>(`/api/matkul/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    delete: (id: string) =>
      request<{ message: string; deletedTugasCount: number }>(
        `/api/matkul/${id}`,
        { method: "DELETE" },
      ),
  },
  tasks: {
    list: () => request<TaskResponse[]>("/api/tugas"),
    create: (payload: TaskPayload) =>
      request<TaskResponse>("/api/tugas", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    update: (id: string, payload: Partial<TaskPayload>) =>
      request<TaskResponse>(`/api/tugas/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    delete: (id: string) =>
      request<{ message: string }>(`/api/tugas/${id}`, { method: "DELETE" }),
  },
  stats: () => request<{ courses: number; tasks: number }>("/api/stats"),
  health: () => request<{ status: string }>("/api/health"),
};

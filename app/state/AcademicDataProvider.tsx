"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, CoursePayload, CourseResponse, TaskResponse } from "../lib/api";

export type TaskStatus = "BELUM_DIKERJAKAN" | "SEDANG_DIKERJAKAN" | "SELESAI";

export interface AcademicDataContextProps {
  courses: CourseResponse[];
  tasks: TaskResponse[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  addCourse: (payload: CoursePayload) => Promise<void>;
  updateCourse: (id: string, payload: CoursePayload) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  addTask: (payload: TaskPayloadInput) => Promise<void>;
  updateTask: (id: string, payload: Partial<TaskPayloadInput>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  error?: string;
}

export interface TaskPayloadInput {
  nama: string;
  deskripsi?: string;
  deadline: string;
  mataKuliahId: string;
  status?: TaskStatus;
}

const AcademicDataContext = createContext<
  AcademicDataContextProps | undefined
>(undefined);

export function AcademicDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    refresh();
  }, []);

  const refresh = async () => {
    setIsLoading(true);
    setError(undefined);
    try {
      const [courseRes, taskRes] = await Promise.all([
        api.courses.list(true),
        api.tasks.list(),
      ]);
      setCourses(courseRes);
      setTasks(taskRes);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const addCourse = async (payload: CoursePayload) => {
    const created = await api.courses.create(payload);
    setCourses((prev) => [...prev, created]);
  };

  const updateCourse = async (id: string, payload: CoursePayload) => {
    const updated = await api.courses.update(id, payload);
    setCourses((prev) =>
      prev.map((course) => (course.id === id ? updated : course)),
    );
  };

  const deleteCourse = async (id: string) => {
    await api.courses.delete(id);
    setCourses((prev) => prev.filter((course) => course.id !== id));
    setTasks((prev) => prev.filter((task) => task.mataKuliahId !== id));
  };

  const addTask = async (payload: TaskPayloadInput) => {
    const created = await api.tasks.create({
      ...payload,
      status: payload.status ?? "BELUM_DIKERJAKAN",
    });
    setTasks((prev) => [...prev, created]);
  };

  const updateTask = async (
    id: string,
    payload: Partial<TaskPayloadInput>,
  ) => {
    const updated = await api.tasks.update(id, payload);
    setTasks((prev) => prev.map((task) => (task.id === id ? updated : task)));
  };

  const deleteTask = async (id: string) => {
    await api.tasks.delete(id);
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const setTaskStatus = async (id: string, status: TaskStatus) => {
    await updateTask(id, { status });
  };

  const value = useMemo(
    () => ({
      courses,
      tasks,
      isLoading,
      refresh,
      addCourse,
      updateCourse,
      deleteCourse,
      addTask,
      updateTask,
      deleteTask,
      setTaskStatus,
      error,
    }),
    [courses, tasks, isLoading, error],
  );

  return (
    <AcademicDataContext.Provider value={value}>
      {children}
    </AcademicDataContext.Provider>
  );
}

export function useAcademicData() {
  const context = useContext(AcademicDataContext);
  if (!context) {
    throw new Error("useAcademicData must be used within AcademicDataProvider");
  }
  return context;
}

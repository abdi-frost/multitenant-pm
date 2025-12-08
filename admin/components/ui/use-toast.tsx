"use client";

import * as React from "react";
import Toast, { ToastItem } from "./toast";

type AddToast = (t: Omit<ToastItem, "id"> & { duration?: number }) => string;

const ToastContext = React.createContext<{ addToast: AddToast } | undefined>(undefined);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const addToast = React.useCallback<AddToast>((t) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const toast: ToastItem = { id, title: t.title, description: t.description, type: t.type };
    setToasts((s) => [toast, ...s]);

    const duration = t.duration ?? 4000;
    window.setTimeout(() => {
      setToasts((s) => s.filter((x) => x.id !== id));
    }, duration);

    return id;
  }, []);

  const remove = React.useCallback((id: string) => {
    setToasts((s) => s.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div aria-live="assertive" className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none">
        <div className="w-full flex flex-col items-end space-y-2">
          {toasts.map((t) => (
            <div key={t.id} className="pointer-events-auto">
              <Toast toast={t} onClose={remove} />
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;

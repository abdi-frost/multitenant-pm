import * as React from "react";

export type ToastType = "default" | "success" | "error" | "warning";

export interface ToastItem {
  id: string;
  title?: string;
  description?: string;
  type?: ToastType;
}

export function Toast({
  toast,
  onClose,
}: {
  toast: ToastItem;
  onClose: (id: string) => void;
}) {
  const { id, title, description, type = "default" } = toast;

  const bg =
    type === "success"
      ? "bg-green-50 border-green-200"
      : type === "error"
      ? "bg-red-50 border-red-200"
      : type === "warning"
      ? "bg-yellow-50 border-yellow-200"
      : "bg-white border-gray-200";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`w-80 max-w-full pointer-events-auto ${bg} border p-3 rounded-md shadow-md flex gap-3 items-start`}
    >
      <div className="flex-1">
        {title && <div className="font-medium text-sm">{title}</div>}
        {description && <div className="text-sm text-zinc-600 mt-1">{description}</div>}
      </div>
      <button
        onClick={() => onClose(id)}
        aria-label="Close"
        className="text-zinc-500 hover:text-zinc-700"
      >
        ✕
      </button>
    </div>
  );
}

export default Toast;

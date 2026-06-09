"use client";

import { AlertCircle, UploadCloud } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/utils";
import { useSimulatorStore } from "@/store/use-simulator-store";

export function UploadBar() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { file, uploadImage, reset, isAnalyzing, error, validationErrors } = useSimulatorStore();

  const handleFile = useCallback(
    async (nextFile?: File) => {
      if (!nextFile) {
        return;
      }
      await uploadImage(nextFile);
    },
    [uploadImage]
  );

  const displayErrors = validationErrors.length > 0 ? validationErrors : error ? [error] : [];

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-white/70 p-5">
      <h2 className="mb-3 text-base font-bold">Upload a screenshot</h2>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />

      {file ? (
        <div className="rounded-xl border border-[var(--border)] bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm">
              <span className="font-semibold">{file.name}</span>
              <span className="text-[var(--muted-foreground)]"> · {formatBytes(file.size)}</span>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={reset}>
                Remove
              </Button>
              <Button type="button" size="sm" onClick={() => inputRef.current?.click()} disabled={isAnalyzing}>
                Replace
              </Button>
            </div>
          </div>
          {isAnalyzing ? (
            <p className="mt-3 text-sm font-medium text-[var(--muted-foreground)]">Analyzing screenshot...</p>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            void handleFile(event.dataTransfer.files[0]);
          }}
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-10 transition ${
            isDragging
              ? "border-[var(--accent)] bg-[#fdf6ef]"
              : "border-[var(--border)] bg-white hover:bg-[#fdf6ef]"
          }`}
        >
          <UploadCloud aria-hidden="true" size={28} className="text-[var(--primary)]" />
          <span className="text-base font-bold">{isAnalyzing ? "Analyzing..." : "Drag & drop or click to upload"}</span>
          <span className="text-xs text-[var(--muted-foreground)]">PNG, JPEG, WebP · max 10MB · 320×240 to 4000×4000px</span>
        </button>
      )}

      {displayErrors.length > 0 ? (
        <div className="mt-3 space-y-2">
          {displayErrors.map((message) => (
            <div
              key={message}
              className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"
            >
              <AlertCircle aria-hidden="true" size={16} className="mt-0.5 shrink-0" />
              <span>{message}</span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

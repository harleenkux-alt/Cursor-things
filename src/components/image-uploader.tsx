"use client";

import { ImagePlus, RotateCcw, UploadCloud } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBytes } from "@/lib/utils";
import { useSimulatorStore } from "@/store/use-simulator-store";

export function ImageUploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { file, uploadImage, reset, isAnalyzing } = useSimulatorStore();

  const handleFile = useCallback(
    async (nextFile?: File) => {
      if (!nextFile) {
        return;
      }
      await uploadImage(nextFile);
    },
    [uploadImage]
  );

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>Upload a product screen</CardTitle>
            <CardDescription>
              Use a website, app, dashboard, form, or design screenshot. PNG, JPG, and WebP work best.
            </CardDescription>
          </div>
          <div className="rounded-2xl bg-[var(--muted)] p-3 text-[var(--primary)]">
            <ImagePlus aria-hidden="true" size={22} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
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
          className={`checkerboard flex min-h-56 w-full flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed p-8 text-center transition ${
            isDragging
              ? "border-[var(--accent)] bg-white/80"
              : "border-[var(--border)] bg-white/45 hover:bg-white/70"
          }`}
        >
          <UploadCloud aria-hidden="true" className="mb-4 text-[var(--primary)]" size={34} />
          <span className="text-base font-bold">Drop an interface screenshot here</span>
          <span className="mt-2 max-w-md text-sm leading-6 text-[var(--muted-foreground)]">
            The simulator keeps the original image in your browser while the API extracts lightweight image metadata for
            the scorecard.
          </span>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          onChange={(event) => void handleFile(event.target.files?.[0])}
        />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-[var(--muted-foreground)]">
            {file ? (
              <>
                <span className="font-semibold text-[var(--foreground)]">{file.name}</span> · {formatBytes(file.size)}
              </>
            ) : (
              "No screenshot uploaded yet."
            )}
          </div>
          <div className="flex gap-2">
            {file ? (
              <Button type="button" variant="secondary" size="sm" onClick={reset}>
                <RotateCcw aria-hidden="true" size={15} />
                Reset
              </Button>
            ) : null}
            <Button type="button" size="sm" onClick={() => inputRef.current?.click()} disabled={isAnalyzing}>
              {isAnalyzing ? "Analyzing..." : "Choose image"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

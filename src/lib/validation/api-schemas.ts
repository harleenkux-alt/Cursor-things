import { z } from "zod";

export const AnalyzeResponseSchema = z.object({
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  channels: z.number().int().positive().optional(),
  dominant: z
    .object({
      r: z.number().min(0).max(255),
      g: z.number().min(0).max(255),
      b: z.number().min(0).max(255)
    })
    .optional(),
  tonalRange: z.number().min(0).max(255).optional()
});

export type AnalyzeResponse = z.infer<typeof AnalyzeResponseSchema>;

export function parseAnalyzeResponse(payload: unknown): AnalyzeResponse | null {
  const result = AnalyzeResponseSchema.safeParse(payload);

  if (!result.success) {
    console.error("Invalid analyze API response:", result.error.flatten());
    return null;
  }

  return result.data;
}

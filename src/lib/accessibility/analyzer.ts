import type { AccessibilityFinding, AccessibilityReport } from "@/lib/simulations/types";
import { parseAnalyzeResponse } from "@/lib/validation/api-schemas";
import { sanitizeReport } from "@/lib/validation/scorecard";

type ServerImageStats = {
  width?: number;
  height?: number;
  channels?: number;
  dominant?: { r: number; g: number; b: number };
  tonalRange?: number;
};

type PixelSample = {
  luminance: number;
  saturation: number;
};

export async function analyzeImage(file: File, imageUrl: string): Promise<AccessibilityReport> {
  const image = await loadImage(imageUrl);
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    throw new Error("Canvas is not supported in this browser.");
  }

  context.drawImage(image, 0, 0);
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const samples = samplePixels(imageData.data);
  const luminances = samples.map((sample) => sample.luminance);
  const averageLuminance = average(luminances);
  const localContrast = calculateLocalContrast(context, canvas);
  const edgeDensity = calculateEdgeDensity(context, canvas);
  const saturationVariance = variance(samples.map((sample) => sample.saturation));
  const serverStats = await getServerStats(file);

  const contrastScore = computeContrastScore(localContrast, luminances, serverStats?.tonalRange);
  const densityScore = clampScore(100 - edgeDensity * 145);
  const readabilityScore = clampScore(
    contrastScore * 0.54 + densityScore * 0.34 + (100 - saturationVariance * 120) * 0.12
  );
  const touchTargetScore = clampScore(100 - edgeDensity * 115 - (canvas.width < 390 ? 10 : 0));

  const findings = buildFindings({
    contrastScore,
    densityScore,
    readabilityScore,
    touchTargetScore,
    edgeDensity,
    localContrast,
    width: canvas.width,
    height: canvas.height,
    tonalRange: serverStats?.tonalRange
  });

  return sanitizeReport({
    contrastScore,
    densityScore,
    readabilityScore,
    touchTargetScore,
    findings,
    imageMeta: {
      width: serverStats?.width ?? canvas.width,
      height: serverStats?.height ?? canvas.height,
      fileSize: file.size,
      averageLuminance,
      tonalRange: serverStats?.tonalRange
    }
  });
}

function computeContrastScore(localContrast: number, luminances: number[], tonalRange?: number) {
  const localScore = scoreFromRange(localContrast, 0.02, 0.22);
  const varianceScore = scoreFromRange(Math.sqrt(variance(luminances)), 0.008, 0.12);
  const tonalScore = tonalRange !== undefined ? scoreFromRange(tonalRange, 48, 220) : localScore;
  const blended = clampScore(localScore * 0.45 + varianceScore * 0.3 + tonalScore * 0.25);

  if (blended < 8 && tonalRange !== undefined && tonalRange > 40) {
    return clampScore(Math.max(blended, tonalScore * 0.55));
  }

  return blended;
}

function buildFindings(input: {
  contrastScore: number;
  densityScore: number;
  readabilityScore: number;
  touchTargetScore: number;
  edgeDensity: number;
  localContrast: number;
  width: number;
  height: number;
  tonalRange?: number;
}): AccessibilityFinding[] {
  const findings: AccessibilityFinding[] = [
    {
      id: "contrast",
      label: "Contrast score",
      value: `${Math.round(input.contrastScore)}/100`,
      severity: severityForScore(input.contrastScore),
      explanation:
        input.contrastScore >= 72
          ? "The screenshot has enough local luminance separation for many interface elements."
          : "Low local contrast suggests text, borders, or status indicators may blur together."
    },
    {
      id: "density",
      label: "Dense content warnings",
      value: input.edgeDensity > 0.58 ? "High density" : input.edgeDensity > 0.42 ? "Moderate density" : "Low density",
      severity: input.edgeDensity > 0.58 ? "critical" : input.edgeDensity > 0.42 ? "warning" : "good",
      explanation:
        "Edge density estimates how visually crowded the screen is; dense screens increase cognitive load."
    },
    {
      id: "font-size",
      label: "Font size warnings",
      value: input.readabilityScore < 66 ? "Likely small or tight text" : "No major warning",
      severity: severityForScore(input.readabilityScore),
      explanation:
        "Screenshots cannot expose real CSS font sizes, so this estimates readability from contrast, density, and texture."
    },
    {
      id: "touch-target",
      label: "Touch target warnings",
      value: input.touchTargetScore < 70 ? "Review target sizing" : "Targets appear spacious",
      severity: severityForScore(input.touchTargetScore),
      explanation:
        "Small clustered visual components are a proxy for controls that may be difficult for tremor or limited-precision users."
    },
    {
      id: "reading-complexity",
      label: "Reading complexity estimate",
      value: input.densityScore < 65 ? "High effort" : input.densityScore < 82 ? "Moderate effort" : "Lower effort",
      severity: severityForScore(input.densityScore),
      explanation: "Content hierarchy appears more inclusive when the screen has clear separation and fewer competing regions."
    }
  ];

  if (input.tonalRange !== undefined && input.tonalRange < 96) {
    findings.push({
      id: "tonal-range",
      label: "Tonal range",
      value: `${Math.round(input.tonalRange)}/255`,
      severity: "warning",
      explanation: "Sharp analysis found a compressed tonal range, which can indicate low contrast or washed-out UI states."
    });
  }

  if (input.width < 375 || input.height < 667) {
    findings.push({
      id: "viewport",
      label: "Viewport size",
      value: `${input.width}x${input.height}`,
      severity: "warning",
      explanation: "Small screenshots make text and touch target assessments stricter because less room is available."
    });
  }

  return findings;
}

async function getServerStats(file: File): Promise<ServerImageStats | null> {
  try {
    const payload = await fileToDataUrl(file);
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: payload })
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return parseAnalyzeResponse(data);
  } catch {
    return null;
  }
}

function samplePixels(data: Uint8ClampedArray): PixelSample[] {
  const stride = Math.max(4, Math.floor(data.length / 4200));
  const pixelStride = Math.max(4, stride - (stride % 4));
  const samples: PixelSample[] = [];

  for (let index = 0; index < data.length; index += pixelStride) {
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);

    samples.push({
      luminance: relativeLuminance(red, green, blue),
      saturation: max === 0 ? 0 : (max - min) / max
    });
  }

  return samples;
}

function calculateLocalContrast(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  const sampleSize = 16;
  const contrasts: number[] = [];

  for (let y = 0; y < canvas.height - sampleSize; y += sampleSize * 2) {
    for (let x = 0; x < canvas.width - sampleSize; x += sampleSize * 2) {
      const current = context.getImageData(x, y, sampleSize, sampleSize).data;
      const next = context.getImageData(Math.min(x + sampleSize, canvas.width - sampleSize), y, sampleSize, sampleSize).data;
      contrasts.push(Math.abs(averageLuminance(current) - averageLuminance(next)));
    }
  }

  return average(contrasts);
}

function calculateEdgeDensity(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  const width = Math.min(360, canvas.width);
  const height = Math.round((width / canvas.width) * canvas.height);
  const scaled = document.createElement("canvas");
  scaled.width = width;
  scaled.height = height;
  const scaledContext = scaled.getContext("2d", { willReadFrequently: true });
  if (!scaledContext) {
    return 0;
  }

  scaledContext.drawImage(canvas, 0, 0, width, height);
  const data = scaledContext.getImageData(0, 0, width, height).data;
  let edges = 0;
  let total = 0;

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = (y * width + x) * 4;
      const right = (y * width + x + 1) * 4;
      const bottom = ((y + 1) * width + x) * 4;
      const currentLum = relativeLuminance(data[index], data[index + 1], data[index + 2]);
      const rightLum = relativeLuminance(data[right], data[right + 1], data[right + 2]);
      const bottomLum = relativeLuminance(data[bottom], data[bottom + 1], data[bottom + 2]);

      if (Math.abs(currentLum - rightLum) + Math.abs(currentLum - bottomLum) > 0.23) {
        edges += 1;
      }
      total += 1;
    }
  }

  return total === 0 ? 0 : edges / total;
}

function averageLuminance(data: Uint8ClampedArray) {
  const values: number[] = [];
  for (let index = 0; index < data.length; index += 4) {
    values.push(relativeLuminance(data[index], data[index + 1], data[index + 2]));
  }
  return average(values);
}

function relativeLuminance(red: number, green: number, blue: number) {
  const [r, g, b] = [red, green, blue].map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function scoreFromRange(value: number, min: number, max: number) {
  return clampScore(((value - min) / (max - min)) * 100);
}

function severityForScore(score: number) {
  if (score >= 76) {
    return "good";
  }
  if (score >= 58) {
    return "warning";
  }
  return "critical";
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function variance(values: number[]) {
  const mean = average(values);
  return average(values.map((value) => (value - mean) ** 2));
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, value));
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load image for analysis."));
    image.src = src;
  });
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Unable to read image."));
    reader.readAsDataURL(file);
  });
}

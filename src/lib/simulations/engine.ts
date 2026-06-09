import type { SimulationId, SimulationResult } from "./types";

type CanvasPair = {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
};

type Matrix = [number, number, number, number, number, number, number, number, number];

const colorBlindnessMatrices: Record<"protanopia" | "deuteranopia", Matrix> = {
  protanopia: [0.567, 0.433, 0, 0.558, 0.442, 0, 0, 0.242, 0.758],
  deuteranopia: [0.625, 0.375, 0, 0.7, 0.3, 0, 0, 0.3, 0.7]
};

export async function generateSimulation(imageUrl: string, simulation: SimulationId): Promise<SimulationResult> {
  const image = await loadImage(imageUrl);
  const { canvas, context } = createCanvas(image.naturalWidth, image.naturalHeight);

  context.drawImage(image, 0, 0);

  if (simulation in colorBlindnessMatrices) {
    applyColorMatrix(context, canvas, colorBlindnessMatrices[simulation as keyof typeof colorBlindnessMatrices]);
  } else if (simulation === "cataracts") {
    applyCataracts(context, canvas);
  } else if (simulation === "low-vision") {
    applyLowVision(context, canvas);
  } else if (simulation === "glare-sensitivity") {
    applyGlareSensitivity(context, canvas);
  } else if (simulation === "adhd") {
    applyAdhd(context, canvas);
  } else if (simulation === "cognitive-load") {
    applyCognitiveLoad(context, canvas);
  } else if (simulation === "reading-difficulty") {
    applyReadingDifficulty(context, canvas);
  } else if (simulation === "tremors") {
    applyTremors(context, canvas, image);
  } else if (simulation === "one-hand-navigation") {
    applyOneHandNavigation(context, canvas);
  }

  return {
    dataUrl: canvas.toDataURL("image/png"),
    generatedAt: new Date().toISOString()
  };
}

function createCanvas(width: number, height: number): CanvasPair {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    throw new Error("Canvas is not supported in this browser.");
  }

  return { canvas, context };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load image for simulation."));
    image.src = src;
  });
}

function applyColorMatrix(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement, matrix: Matrix) {
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = imageData;

  for (let index = 0; index < data.length; index += 4) {
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];

    data[index] = clamp(red * matrix[0] + green * matrix[1] + blue * matrix[2]);
    data[index + 1] = clamp(red * matrix[3] + green * matrix[4] + blue * matrix[5]);
    data[index + 2] = clamp(red * matrix[6] + green * matrix[7] + blue * matrix[8]);
  }

  context.putImageData(imageData, 0, 0);
}

function applyCataracts(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  runFilteredPass(context, canvas, "blur(2.8px) contrast(0.64) brightness(1.03) sepia(0.34) saturate(0.72)");
  context.globalCompositeOperation = "source-atop";
  context.fillStyle = "rgba(245, 206, 109, 0.16)";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.globalCompositeOperation = "source-over";
}

function applyLowVision(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  runFilteredPass(context, canvas, "blur(5px) contrast(0.46) brightness(0.9) saturate(0.62)");
  addVignette(context, canvas, "rgba(15, 18, 21, 0.24)", 0.2, 0.95);
}

function applyGlareSensitivity(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  runFilteredPass(context, canvas, "brightness(1.35) contrast(0.72) saturate(0.88)");
  context.globalCompositeOperation = "screen";
  context.fillStyle = "rgba(255, 252, 235, 0.42)";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.globalCompositeOperation = "source-over";
  addVignette(context, canvas, "rgba(255, 255, 255, 0.28)", 0.35, 0.88);
}

function applyCognitiveLoad(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  runFilteredPass(context, canvas, "contrast(1.04) saturate(1.08)");
  const scale = Math.min(canvas.width, canvas.height);

  const labels = ["Step 2 of 4", "Required", "New", "Save draft?", "3 unread", "Confirm"];
  labels.forEach((label, index) => {
    context.save();
    context.font = `600 ${Math.max(11, Math.round(scale * 0.018))}px Inter, sans-serif`;
    const x = (0.08 + (index % 3) * 0.28) * canvas.width;
    const y = (0.12 + Math.floor(index / 3) * 0.08) * canvas.height;
    context.fillStyle = index % 2 === 0 ? "rgba(180, 35, 24, 0.82)" : "rgba(37, 99, 235, 0.82)";
    context.fillRect(x, y, context.measureText(label).width + 16, 24);
    context.fillStyle = "#fff";
    context.fillText(label, x + 8, y + 17);
    context.restore();
  });

  context.save();
  context.strokeStyle = "rgba(31, 58, 53, 0.35)";
  context.setLineDash([6, 6]);
  context.lineWidth = 2;
  context.strokeRect(canvas.width * 0.06, canvas.height * 0.22, canvas.width * 0.88, canvas.height * 0.58);
  context.restore();
}

function applyReadingDifficulty(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  const original = context.getImageData(0, 0, canvas.width, canvas.height);
  context.clearRect(0, 0, canvas.width, canvas.height);

  const bandHeight = Math.max(7, Math.round(canvas.height / 70));
  for (let y = 0; y < canvas.height; y += bandHeight) {
    const shift = Math.round((seededRandom(y + 11) - 0.5) * 10);
    context.putImageData(original, shift, 0, 0, y, canvas.width, Math.min(bandHeight, canvas.height - y));
  }

  context.save();
  context.globalAlpha = 0.18;
  context.filter = "blur(0.7px)";
  context.drawImage(canvas, 2, 1);
  context.drawImage(canvas, -2, -1);
  context.restore();

  context.save();
  context.fillStyle = "rgba(31, 58, 53, 0.13)";
  context.font = `${Math.max(12, Math.round(canvas.width / 54))}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  const glyphs = ["b/d", "p/q", "rn/m", "was/saw", "ei/ie"];
  glyphs.forEach((glyph, index) => {
    context.fillText(glyph, (0.14 + index * 0.15) * canvas.width, (0.24 + seededRandom(index) * 0.5) * canvas.height);
  });
  context.restore();
}

function applyAdhd(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  runFilteredPass(context, canvas, "contrast(1.08) saturate(1.22)");
  addNoise(context, canvas, 0.08);

  const scale = Math.min(canvas.width, canvas.height);
  const zones = [
    [0.08, 0.1, 0.28, 0.1],
    [0.66, 0.12, 0.24, 0.14],
    [0.1, 0.68, 0.32, 0.16],
    [0.58, 0.58, 0.28, 0.2],
    [0.34, 0.34, 0.25, 0.13]
  ];

  zones.forEach(([x, y, width, height], index) => {
    context.save();
    context.strokeStyle = index % 2 === 0 ? "rgba(229, 102, 62, 0.82)" : "rgba(37, 99, 235, 0.78)";
    context.fillStyle = index % 2 === 0 ? "rgba(229, 102, 62, 0.12)" : "rgba(37, 99, 235, 0.12)";
    context.lineWidth = Math.max(3, scale * 0.004);
    context.setLineDash([10, 8]);
    roundedRect(context, x * canvas.width, y * canvas.height, width * canvas.width, height * canvas.height, 18);
    context.fill();
    context.stroke();
    context.restore();
  });

  context.save();
  context.globalAlpha = 0.72;
  context.fillStyle = "rgba(255, 255, 255, 0.72)";
  for (let index = 0; index < 14; index += 1) {
    const x = seededRandom(index + 3) * canvas.width;
    const y = seededRandom(index + 13) * canvas.height;
    context.beginPath();
    context.arc(x, y, 2 + seededRandom(index + 23) * 5, 0, Math.PI * 2);
    context.fill();
  }
  context.restore();
}

function applyTremors(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement, image: HTMLImageElement) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  const offsets = [
    [-5, 3],
    [4, -4],
    [-2, -3],
    [3, 4],
    [0, 0]
  ];

  offsets.forEach(([x, y], index) => {
    context.save();
    context.globalAlpha = index === offsets.length - 1 ? 0.7 : 0.16;
    context.drawImage(image, x, y, canvas.width, canvas.height);
    context.restore();
  });

  drawCursorTrail(context, canvas, "rgba(229, 102, 62, 0.86)");
}

function applyOneHandNavigation(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  runFilteredPass(context, canvas, "contrast(0.92) saturate(0.85)");
  const target = Math.max(44, Math.round(Math.min(canvas.width, canvas.height) * 0.08));

  context.save();
  context.strokeStyle = "rgba(180, 35, 24, 0.36)";
  context.fillStyle = "rgba(180, 35, 24, 0.08)";
  context.lineWidth = 2;

  for (let y = target * 0.8; y < canvas.height; y += target * 1.45) {
    for (let x = target * 0.8; x < canvas.width; x += target * 1.65) {
      const radius = target * (0.35 + seededRandom(x + y) * 0.3);
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
      context.stroke();
    }
  }

  // Thumb reach zone — bottom-right corner is easy; top-left is hard
  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "rgba(180, 35, 24, 0.22)");
  gradient.addColorStop(0.55, "rgba(180, 35, 24, 0.06)");
  gradient.addColorStop(1, "rgba(31, 58, 53, 0.04)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.restore();
  drawCursorTrail(context, canvas, "rgba(180, 35, 24, 0.82)");
}

function runFilteredPass(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement, filter: string) {
  const original = document.createElement("canvas");
  original.width = canvas.width;
  original.height = canvas.height;
  const originalContext = original.getContext("2d");
  if (!originalContext) {
    return;
  }

  originalContext.drawImage(canvas, 0, 0);
  context.save();
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.filter = filter;
  context.drawImage(original, 0, 0);
  context.restore();
}

function addVignette(
  context: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  color: string,
  innerStop: number,
  outerStop: number
) {
  const gradient = context.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    Math.min(canvas.width, canvas.height) * innerStop,
    canvas.width / 2,
    canvas.height / 2,
    Math.max(canvas.width, canvas.height) * outerStop
  );
  gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
  gradient.addColorStop(0.46, "rgba(0, 0, 0, 0.04)");
  gradient.addColorStop(1, color);
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
}

function addNoise(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement, opacity: number) {
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = imageData;

  for (let index = 0; index < data.length; index += 4) {
    const noise = (seededRandom(index) - 0.5) * 38;
    data[index] = clamp(data[index] + noise);
    data[index + 1] = clamp(data[index + 1] + noise);
    data[index + 2] = clamp(data[index + 2] + noise);
    data[index + 3] = clamp(data[index + 3] * (1 - opacity) + 255 * opacity);
  }

  context.putImageData(imageData, 0, 0);
}

function drawCursorTrail(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement, color: string) {
  const centerX = canvas.width * 0.64;
  const centerY = canvas.height * 0.56;
  context.save();
  context.strokeStyle = color;
  context.fillStyle = "rgba(255, 255, 255, 0.85)";
  context.lineWidth = Math.max(2, Math.min(canvas.width, canvas.height) * 0.005);

  for (let index = 0; index < 8; index += 1) {
    const x = centerX + (seededRandom(index + 4) - 0.5) * 70;
    const y = centerY + (seededRandom(index + 17) - 0.5) * 58;
    context.beginPath();
    context.arc(x, y, 8 + index, 0, Math.PI * 2);
    context.globalAlpha = 0.16 + index * 0.055;
    context.fill();
    context.stroke();
  }

  context.globalAlpha = 1;
  context.fillStyle = color;
  context.beginPath();
  context.moveTo(centerX, centerY);
  context.lineTo(centerX + 13, centerY + 36);
  context.lineTo(centerX + 23, centerY + 22);
  context.lineTo(centerX + 42, centerY + 21);
  context.closePath();
  context.fill();
  context.restore();
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

function seededRandom(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function clamp(value: number) {
  return Math.max(0, Math.min(255, value));
}

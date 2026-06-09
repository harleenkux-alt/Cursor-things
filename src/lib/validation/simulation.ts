export function imageDataDiffers(original: ImageData, simulated: ImageData, sampleStride = 16): boolean {
  const { data: a, width, height } = original;
  const { data: b } = simulated;

  if (a.length !== b.length) {
    return true;
  }

  for (let y = 0; y < height; y += sampleStride) {
    for (let x = 0; x < width; x += sampleStride) {
      const index = (y * width + x) * 4;
      const delta =
        Math.abs(a[index] - b[index]) +
        Math.abs(a[index + 1] - b[index + 1]) +
        Math.abs(a[index + 2] - b[index + 2]);

      if (delta > 12) {
        return true;
      }
    }
  }

  return false;
}

export function validateSimulationOutput(
  originalUrl: string,
  simulatedDataUrl: string
): Promise<void> {
  return Promise.all([loadImage(originalUrl), loadImage(simulatedDataUrl)]).then(([original, simulated]) => {
    if (original.naturalWidth !== simulated.naturalWidth || original.naturalHeight !== simulated.naturalHeight) {
      throw new Error("Simulation validation failed: imageSize");
    }

    const originalCanvas = drawToCanvas(original);
    const simulatedCanvas = drawToCanvas(simulated);
    const originalContext = originalCanvas.getContext("2d", { willReadFrequently: true });
    const simulatedContext = simulatedCanvas.getContext("2d", { willReadFrequently: true });

    if (!originalContext || !simulatedContext) {
      throw new Error("Simulation validation failed: canvasUnsupported");
    }

    const originalData = originalContext.getImageData(0, 0, originalCanvas.width, originalCanvas.height);
    const simulatedData = simulatedContext.getImageData(0, 0, simulatedCanvas.width, simulatedCanvas.height);

    if (simulatedData.data.length < 4) {
      throw new Error("Simulation validation failed: pixelDataExists");
    }

    if (!imageDataDiffers(originalData, simulatedData)) {
      throw new Error("Simulation validation failed: notIdentical");
    }

    for (let index = 0; index < simulatedData.data.length; index += 4) {
      if (
        simulatedData.data[index] > 255 ||
        simulatedData.data[index + 1] > 255 ||
        simulatedData.data[index + 2] > 255 ||
        simulatedData.data[index + 3] > 255
      ) {
        throw new Error("Simulation validation failed: withinThresholds");
      }
    }
  });
}

function drawToCanvas(image: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas is not supported.");
  }
  context.drawImage(image, 0, 0);
  return canvas;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load image for validation."));
    image.src = src;
  });
}

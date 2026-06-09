import { NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";

type AnalyzePayload = {
  image?: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as AnalyzePayload;

    if (!payload.image || !payload.image.startsWith("data:image/")) {
      return NextResponse.json({ error: "A base64 image data URL is required." }, { status: 400 });
    }

    const buffer = Buffer.from(payload.image.replace(/^data:image\/\w+;base64,/, ""), "base64");
    const image = sharp(buffer, { limitInputPixels: 25_000_000 }).rotate();
    const [metadata, stats] = await Promise.all([image.metadata(), image.stats()]);

    const channelMins = stats.channels.map((channel) => channel.min);
    const channelMaxes = stats.channels.map((channel) => channel.max);
    const tonalRange = Math.max(...channelMaxes) - Math.min(...channelMins);
    const dominant = {
      r: Math.round(stats.dominant.r),
      g: Math.round(stats.dominant.g),
      b: Math.round(stats.dominant.b)
    };

    return NextResponse.json({
      width: metadata.width,
      height: metadata.height,
      channels: metadata.channels,
      dominant,
      tonalRange
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to analyze image.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}

import { ImageResponse } from "next/og";
import { AppIconGlyph } from "@/lib/app-icon";

// Maskable icons get cropped to a circle/squircle/rounded-square by the OS, so the glyph
// needs to sit inside a safe zone instead of bleeding to the edges like the regular icon does.
export async function GET() {
  return new ImageResponse(<AppIconGlyph size={512} padding={64} />, { width: 512, height: 512 });
}

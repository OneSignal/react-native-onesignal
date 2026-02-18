#!/usr/bin/env bun
/**
 * Generates Android and iOS app icons from a source PNG.
 *
 * Usage:
 *   bun examples/generate-icons.ts [source-image]
 *
 * Defaults to: examples/demo/assets/onesignal_logo_icon_padded.png
 *
 * Requires macOS (uses sips). iOS development already requires macOS.
 */

import { join } from "path";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";

const REPO_ROOT = join(import.meta.dir, "..");
const DEFAULT_SOURCE = join(
  REPO_ROOT,
  "examples/demo/assets/onesignal_logo_icon_padded.png"
);

const source = process.argv[2] ?? DEFAULT_SOURCE;

if (!existsSync(source)) {
  console.error(`Source image not found: ${source}`);
  process.exit(1);
}

async function resize(src: string, dest: string, size: number): Promise<void> {
  await Bun.$`sips -z ${size} ${size} ${src} --out ${dest}`.quiet();
}

async function flattenToWhiteBackground(src: string, dest: string): Promise<void> {
  const swift = `
import AppKit

let args = CommandLine.arguments
guard args.count == 3 else {
  fputs("Usage: flatten.swift <input> <output>\\n", stderr)
  exit(1)
}

let inputPath = args[1]
let outputPath = args[2]

guard let image = NSImage(contentsOfFile: inputPath) else {
  fputs("Unable to open input image\\n", stderr)
  exit(1)
}

let width = image.size.width
let height = image.size.height

guard width > 0, height > 0 else {
  fputs("Invalid image size\\n", stderr)
  exit(1)
}

let canvas = NSImage(size: NSSize(width: width, height: height))
canvas.lockFocus()
NSColor.white.setFill()
NSRect(x: 0, y: 0, width: width, height: height).fill()
image.draw(
  in: NSRect(x: 0, y: 0, width: width, height: height),
  from: .zero,
  operation: .sourceOver,
  fraction: 1.0
)
canvas.unlockFocus()

guard
  let tiffData = canvas.tiffRepresentation,
  let rep = NSBitmapImageRep(data: tiffData),
  let pngData = rep.representation(using: .png, properties: [:])
else {
  fputs("Unable to encode PNG\\n", stderr)
  exit(1)
}

try pngData.write(to: URL(fileURLWithPath: outputPath))
`;

  const tempDir = mkdtempSync(join(tmpdir(), "onesignal-icon-"));
  const swiftFile = join(tempDir, "flatten.swift");
  writeFileSync(swiftFile, swift);
  try {
    await Bun.$`swift ${swiftFile} ${src} ${dest}`.quiet();
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

// ─── Android ──────────────────────────────────────────────────────────────────

const ANDROID_BASE = join(
  REPO_ROOT,
  "examples/demo/android/app/src/main/res"
);

const ANDROID_SIZES: Record<string, number> = {
  "mipmap-mdpi": 48,
  "mipmap-hdpi": 72,
  "mipmap-xhdpi": 96,
  "mipmap-xxhdpi": 144,
  "mipmap-xxxhdpi": 192,
};

async function generateAndroid(): Promise<void> {
  console.log("Generating Android icons...");
  for (const [dir, size] of Object.entries(ANDROID_SIZES)) {
    const base = join(ANDROID_BASE, dir);
    await resize(source, join(base, "ic_launcher.png"), size);
    await resize(source, join(base, "ic_launcher_round.png"), size);
    console.log(`  ${dir}: ${size}x${size}`);
  }
}

// ─── iOS ──────────────────────────────────────────────────────────────────────

const IOS_APPICONSET = join(
  REPO_ROOT,
  "examples/demo/ios/demo/Images.xcassets/AppIcon.appiconset"
);
const IOS_CONTENTS = join(IOS_APPICONSET, "Contents.json");

const IOS_ICONS: Array<{
  filename: string;
  pixels: number;
  idiom: "iphone" | "ios-marketing";
  size: string;
  scale: string;
}> = [
  { filename: "icon-20@2x.png", pixels: 40, idiom: "iphone", size: "20x20", scale: "2x" },
  { filename: "icon-20@3x.png", pixels: 60, idiom: "iphone", size: "20x20", scale: "3x" },
  { filename: "icon-29@2x.png", pixels: 58, idiom: "iphone", size: "29x29", scale: "2x" },
  { filename: "icon-29@3x.png", pixels: 87, idiom: "iphone", size: "29x29", scale: "3x" },
  { filename: "icon-40@2x.png", pixels: 80, idiom: "iphone", size: "40x40", scale: "2x" },
  { filename: "icon-40@3x.png", pixels: 120, idiom: "iphone", size: "40x40", scale: "3x" },
  { filename: "icon-60@2x.png", pixels: 120, idiom: "iphone", size: "60x60", scale: "2x" },
  { filename: "icon-60@3x.png", pixels: 180, idiom: "iphone", size: "60x60", scale: "3x" },
  {
    filename: "icon-1024@1x.png",
    pixels: 1024,
    idiom: "ios-marketing",
    size: "1024x1024",
    scale: "1x",
  },
];

async function writeIosContents(): Promise<void> {
  const contents = {
    images: IOS_ICONS.map(({ filename, idiom, size, scale }) => ({
      filename,
      idiom,
      scale,
      size,
    })),
    info: {
      author: "xcode",
      version: 1,
    },
  };
  writeFileSync(IOS_CONTENTS, `${JSON.stringify(contents, null, 2)}\n`);
}

async function generateIos(): Promise<void> {
  console.log("Generating iOS icons...");
  const tempDir = mkdtempSync(join(tmpdir(), "onesignal-ios-icon-"));
  const iosSource = join(tempDir, "ios-source-white.png");
  await flattenToWhiteBackground(source, iosSource);
  await writeIosContents();
  try {
    for (const { filename, pixels } of IOS_ICONS) {
      await resize(iosSource, join(IOS_APPICONSET, filename), pixels);
      console.log(`  ${filename}: ${pixels}x${pixels}`);
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

// ─── Run ──────────────────────────────────────────────────────────────────────

console.log(`Source: ${source}\n`);
await generateAndroid();
console.log();
await generateIos();
console.log("\nDone.");

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
import { existsSync } from "fs";

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

// Derived from Contents.json: filename -> pixel size (size * scale)
const IOS_ICONS: Array<{ filename: string; pixels: number }> = [
  { filename: "icon-20@2x.png", pixels: 40 },
  { filename: "icon-20@3x.png", pixels: 60 },
  { filename: "icon-29@2x.png", pixels: 58 },
  { filename: "icon-29@3x.png", pixels: 87 },
  { filename: "icon-40@2x.png", pixels: 80 },
  { filename: "icon-40@3x.png", pixels: 120 },
  { filename: "icon-60@2x.png", pixels: 120 },
  { filename: "icon-60@3x.png", pixels: 180 },
  { filename: "icon-1024@1x.png", pixels: 1024 },
];

async function generateIos(): Promise<void> {
  console.log("Generating iOS icons...");
  for (const { filename, pixels } of IOS_ICONS) {
    await resize(source, join(IOS_APPICONSET, filename), pixels);
    console.log(`  ${filename}: ${pixels}x${pixels}`);
  }
}

// ─── Run ──────────────────────────────────────────────────────────────────────

console.log(`Source: ${source}\n`);
await generateAndroid();
console.log();
await generateIos();
console.log("\nDone.");

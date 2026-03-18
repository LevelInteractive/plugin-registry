/**
 * Registry index generator.
 * Reads all plugin manifests and produces registry/index.json.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { join, resolve } from "path";
import { manifestSchema, type Manifest } from "./manifest-schema.js";

const PLUGINS_DIR = "plugins";
const INDEX_OUTPUT = join("registry", "index.json");

interface IndexEntry {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly author: string;
  readonly category: string;
  readonly supportedClis: readonly string[];
  readonly trustLevel: string;
}

interface RegistryIndex {
  readonly generatedAt: string;
  readonly pluginCount: number;
  readonly plugins: readonly IndexEntry[];
}

function loadManifest(pluginDir: string): Manifest | null {
  const manifestPath = join(pluginDir, "manifest.json");

  if (!existsSync(manifestPath)) {
    console.error(`[SKIP] No manifest.json in ${pluginDir}`);
    return null;
  }

  try {
    const raw = readFileSync(manifestPath, "utf-8");
    const json: unknown = JSON.parse(raw);
    const result = manifestSchema.safeParse(json);

    if (!result.success) {
      console.error(`[INVALID] ${manifestPath}:`, result.error.issues);
      return null;
    }

    return result.data;
  } catch (err) {
    console.error(`[ERROR] Failed to read ${manifestPath}:`, err);
    return null;
  }
}

export function generateIndex(rootDir: string): RegistryIndex {
  const pluginsPath = resolve(rootDir, PLUGINS_DIR);

  if (!existsSync(pluginsPath)) {
    return { generatedAt: new Date().toISOString(), pluginCount: 0, plugins: [] };
  }

  const pluginDirs = readdirSync(pluginsPath, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const entries: IndexEntry[] = [];

  for (const dirName of pluginDirs) {
    const manifest = loadManifest(join(pluginsPath, dirName));
    if (manifest) {
      entries.push({
        id: manifest.id,
        name: manifest.name,
        version: manifest.version,
        description: manifest.description,
        author: manifest.author,
        category: manifest.category,
        supportedClis: manifest.supportedClis,
        trustLevel: manifest.trustLevel,
      });
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    pluginCount: entries.length,
    plugins: entries,
  };
}

// CLI entrypoint
if (process.argv[1]?.endsWith("generate-index.ts") || process.argv[1]?.endsWith("generate-index")) {
  const rootDir = resolve(import.meta.dirname ?? ".", "..");
  const index = generateIndex(rootDir);

  const outputPath = resolve(rootDir, INDEX_OUTPUT);
  const TWO_SPACES = 2;
  writeFileSync(outputPath, JSON.stringify(index, null, TWO_SPACES) + "\n");

  console.info(`Generated ${outputPath} with ${index.pluginCount} plugins`);
}

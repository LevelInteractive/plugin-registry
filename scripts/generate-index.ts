/**
 * Registry index generator.
 * Reads all entity manifests and produces registry/index.json.
 *
 * Supports two directory layouts:
 * 1. Flat: plugins/{entityId}/manifest.json (latest version)
 * 2. Versioned: plugins/{entityId}/v{version}/manifest.json (per-version)
 *
 * The top-level manifest.json in each entity directory is treated as the
 * latest/current version. Version subdirectories (v1.0.0, v1.1.0, etc.)
 * provide the version history.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { join, resolve } from "path";
import { manifestSchema, type Manifest } from "./manifest-schema.js";

const PLUGINS_DIR = "plugins";
const INDEX_OUTPUT = join("registry", "index.json");
const VERSION_DIR_PATTERN = /^v\d+\.\d+\.\d+/;

interface IndexEntry {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly author: string;
  readonly category: string;
  readonly entityType: string;
  readonly supportedClis: readonly string[];
  readonly trustLevel: string;
  readonly versions: readonly string[];
}

interface RegistryIndex {
  readonly generatedAt: string;
  readonly entityCount: number;
  readonly entities: readonly IndexEntry[];
}

function loadManifest(manifestPath: string): Manifest | null {
  if (!existsSync(manifestPath)) {
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

function findVersions(entityDir: string): readonly string[] {
  if (!existsSync(entityDir)) {
    return [];
  }

  return readdirSync(entityDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && VERSION_DIR_PATTERN.test(d.name))
    .map((d) => d.name.slice(1)) // Remove "v" prefix
    .sort((a, b) => {
      // Sort semver descending (latest first)
      const [aMaj, aMin, aPat] = a.split(".").map(Number);
      const [bMaj, bMin, bPat] = b.split(".").map(Number);
      return bMaj - aMaj || bMin - aMin || bPat - aPat;
    });
}

export function generateIndex(rootDir: string): RegistryIndex {
  const pluginsPath = resolve(rootDir, PLUGINS_DIR);

  if (!existsSync(pluginsPath)) {
    return { generatedAt: new Date().toISOString(), entityCount: 0, entities: [] };
  }

  const entityDirs = readdirSync(pluginsPath, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const entries: IndexEntry[] = [];

  for (const dirName of entityDirs) {
    const entityPath = join(pluginsPath, dirName);
    const manifest = loadManifest(join(entityPath, "manifest.json"));

    if (!manifest) {
      continue;
    }

    const versions = findVersions(entityPath);

    entries.push({
      id: manifest.id,
      name: manifest.name,
      version: manifest.version,
      description: manifest.description,
      author: manifest.author,
      category: manifest.category,
      entityType: manifest.entityType ?? "plugin",
      supportedClis: manifest.supportedClis,
      trustLevel: manifest.trustLevel ?? "pending",
      versions: versions.length > 0 ? versions : [manifest.version],
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    entityCount: entries.length,
    entities: entries,
  };
}

// CLI entrypoint
if (process.argv[1]?.endsWith("generate-index.ts") || process.argv[1]?.endsWith("generate-index")) {
  const rootDir = resolve(import.meta.dirname ?? ".", "..");
  const index = generateIndex(rootDir);

  const outputPath = resolve(rootDir, INDEX_OUTPUT);
  const TWO_SPACES = 2;
  writeFileSync(outputPath, JSON.stringify(index, null, TWO_SPACES) + "\n");

  console.info(`Generated ${outputPath} with ${index.entityCount} entities`);
}

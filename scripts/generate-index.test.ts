import { describe, it, expect } from "vitest";
import { resolve } from "path";
import { generateIndex } from "./generate-index.js";

describe("generateIndex", () => {
  const rootDir = resolve(import.meta.dirname ?? ".", "..");

  it("produces index with 4 seed plugins", () => {
    const index = generateIndex(rootDir);
    expect(index.pluginCount).toBe(4);
    expect(index.plugins).toHaveLength(4);
  });

  it("includes correct plugin IDs", () => {
    const index = generateIndex(rootDir);
    const ids = index.plugins.map((p) => p.id).sort();
    expect(ids).toEqual([
      "code-review-skill",
      "devops-bundle",
      "external-data-mcp",
      "slack-mcp",
    ]);
  });

  it("includes correct categories", () => {
    const index = generateIndex(rootDir);
    const byId = Object.fromEntries(index.plugins.map((p) => [p.id, p]));
    expect(byId["code-review-skill"]?.category).toBe("code-quality");
    expect(byId["slack-mcp"]?.category).toBe("productivity");
    expect(byId["devops-bundle"]?.category).toBe("devops");
    expect(byId["external-data-mcp"]?.category).toBe("data");
  });

  it("all plugins have version 1.0.0", () => {
    const index = generateIndex(rootDir);
    for (const plugin of index.plugins) {
      expect(plugin.version).toBe("1.0.0");
    }
  });

  it("includes generatedAt timestamp", () => {
    const index = generateIndex(rootDir);
    expect(index.generatedAt).toBeDefined();
    const parsed = new Date(index.generatedAt);
    expect(parsed.toISOString()).toBe(index.generatedAt);
  });

  it("handles empty plugins directory", () => {
    const index = generateIndex("/tmp/nonexistent-dir");
    expect(index.pluginCount).toBe(0);
    expect(index.plugins).toEqual([]);
  });
});

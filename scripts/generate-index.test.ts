import { describe, it, expect } from "vitest";
import { resolve } from "path";
import { generateIndex } from "./generate-index.js";

describe("generateIndex", () => {
  const rootDir = resolve(import.meta.dirname ?? ".", "..");

  it("produces empty index when no plugins exist", () => {
    const index = generateIndex(rootDir);
    expect(index.entityCount).toBe(0);
    expect(index.entities).toEqual([]);
  });

  it("includes generatedAt timestamp", () => {
    const index = generateIndex(rootDir);
    expect(index.generatedAt).toBeDefined();
    const parsed = new Date(index.generatedAt);
    expect(parsed.toISOString()).toBe(index.generatedAt);
  });

  it("handles nonexistent plugins directory", () => {
    const index = generateIndex("/tmp/nonexistent-dir");
    expect(index.entityCount).toBe(0);
    expect(index.entities).toEqual([]);
  });
});

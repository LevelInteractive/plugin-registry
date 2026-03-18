/**
 * Registry-local Zod manifest schema.
 * Mirrors the canonical schema from @level/shared for independent CI validation.
 */

import { z } from "zod";

const SEMVER_PATTERN = /^\d+\.\d+\.\d+(?:-[\w.]+)?(?:\+[\w.]+)?$/;

const CLI_TARGETS = ["claude-code", "codex", "gemini-cli", "claude-cowork"] as const;
const INSTALL_SCOPES = ["user", "project"] as const;
const TRUST_LEVELS = ["pending", "approved", "external"] as const;
const PLUGIN_CATEGORIES = [
  "code-quality",
  "devops",
  "data",
  "communication",
  "productivity",
  "custom",
] as const;

export const manifestSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    version: z.string().regex(SEMVER_PATTERN),
    description: z.string().min(1),
    author: z.string().min(1),
    license: z.string().min(1),
    category: z.enum(PLUGIN_CATEGORIES),
    supportedClis: z.array(z.enum(CLI_TARGETS)).min(1),
    supportedScopes: z.array(z.enum(INSTALL_SCOPES)).min(1),
    skills: z.array(z.object({ name: z.string(), path: z.string() })).default([]),
    tools: z.array(z.object({ name: z.string(), config: z.record(z.unknown()) })).default([]),
    dependencies: z.array(z.object({ pluginId: z.string(), minVersion: z.string() })).optional(),
    manifestVersion: z.string().regex(SEMVER_PATTERN),
    changelog: z
      .array(
        z.object({
          version: z.string(),
          date: z.string(),
          description: z.string(),
          breaking: z.boolean(),
        }),
      )
      .min(1),
    externalSource: z.string().optional(),
    externalVersion: z.string().optional(),
    trustLevel: z.enum(TRUST_LEVELS),
    ownerId: z.string().optional(),
    ownerBypassReview: z.boolean(),
    iconUrl: z.string().url().optional(),
  })
  .refine(
    (d) => !(d.externalSource && !d.externalVersion) && !(!d.externalSource && d.externalVersion),
    { message: "externalSource and externalVersion must be provided together" },
  );

export type Manifest = z.infer<typeof manifestSchema>;

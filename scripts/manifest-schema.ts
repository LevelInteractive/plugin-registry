/**
 * Registry-local Zod manifest schema.
 * Validates plugin/skill/tool manifests pushed by the marketplace app.
 *
 * Accepts both the full marketplace manifest format and the legacy seed format.
 */

import { z } from "zod";

const SEMVER_PATTERN = /^\d+\.\d+\.\d+(?:-[\w.]+)?(?:\+[\w.]+)?$/;

const CLI_TARGETS = ["claude-code", "codex", "gemini-cli", "claude-cowork"] as const;
const INSTALL_SCOPES = ["user", "project"] as const;
const TRUST_LEVELS = ["pending", "approved", "external"] as const;
const ENTITY_TYPES = ["skill", "tool", "plugin"] as const;
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
    license: z.string().min(1).optional(),
    category: z.enum(PLUGIN_CATEGORIES),
    entityType: z.enum(ENTITY_TYPES).optional(),
    supportedClis: z.array(z.enum(CLI_TARGETS)).min(1),
    supportedScopes: z.array(z.enum(INSTALL_SCOPES)).optional(),
    skills: z.array(z.object({ name: z.string(), path: z.string() })).optional(),
    tools: z.array(z.object({ name: z.string(), config: z.record(z.unknown()) })).optional(),
    skillIds: z.array(z.string()).optional(),
    toolIds: z.array(z.string()).optional(),
    requiredToolIds: z.array(z.string()).optional(),
    mcpConfig: z.record(z.unknown()).optional(),
    dependencies: z.array(z.object({ pluginId: z.string(), minVersion: z.string() })).optional(),
    manifestVersion: z.string().regex(SEMVER_PATTERN).optional(),
    changelog: z
      .array(
        z.object({
          version: z.string(),
          date: z.string().optional(),
          description: z.string(),
          breaking: z.boolean().optional(),
          isBreaking: z.boolean().optional(),
        }),
      )
      .optional(),
    externalSource: z.string().optional(),
    externalVersion: z.string().optional(),
    trustLevel: z.enum(TRUST_LEVELS).optional(),
    ownerId: z.string().optional(),
    ownerBypassReview: z.boolean().optional(),
    iconUrl: z.string().url().optional(),
  });

export type Manifest = z.infer<typeof manifestSchema>;

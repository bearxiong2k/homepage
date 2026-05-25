import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const axisA = z.enum(['A1', 'A2', 'A3', 'A4', 'A5', 'A6']);
const axisB = z.enum(['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7']);
const optionalText = z.string().nullable().optional();
const optionalUrl = z.url().nullable().optional();
const publication = z.object({
  venue: optionalText,
  type: z.enum(['conference', 'journal', 'article', 'preprint', 'artifact', 'other']).nullable().optional(),
  doi: optionalText,
  url: optionalUrl
}).default({});

const papers = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/papers' }),
  schema: z.object({
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: z.string(),
    short_title: z.string(),
    subtitle: optionalText,
    year: z.number().int().nullable().optional(),
    publication,
    authors: z.array(z.string()).default([]),
    author_note: optionalText,
    bibtex: optionalText,
    citation_source: optionalUrl,
    summary: z.string(),
    links: z.object({
      paper: optionalUrl,
      artifact: optionalUrl,
      docs: optionalUrl,
      code: optionalUrl
    }).default({}),
    technology: z.array(z.string()).default([]),
    workloads: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    baselines: z.array(z.string()).default([]),
    axis_A: z.object({
      primary: axisA,
      secondary: z.array(axisA).default([])
    }),
    axis_B: z.array(axisB).min(1),
    axis_C_first_class_objects: z.array(z.string()).default([]),
    axis_D_rewrite_objects: z.array(z.string()).default([]),
    artifact: z.object({
      status: z.string(),
      url: optionalUrl,
      license: optionalText,
      last_checked: optionalText
    }).default({ status: 'unknown' }),
    integration_roles: z.array(z.string()).default([]),
    reproducibility_level: z.enum(['high', 'medium', 'low', 'unknown']).default('unknown'),
    notes: z.array(z.string()).default([]),
    takeaways: z.array(z.string()).default([])
  })
});

export const collections = { papers };

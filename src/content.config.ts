import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const baseSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  pubDate: z.coerce.date().optional(),
  updatedDate: z.coerce.date().optional(),
  draft: z.boolean().default(false),
  cover: z.string().optional(),
  tags: z.array(z.string()).default([]),
  lang: z.enum(['zh-cn']).optional(),
  toc: z.union([z.boolean(), z.enum(['center', 'side'])]).optional(),
  comments: z.boolean().optional(),
  math: z.boolean().optional(),
  mermaid: z.boolean().optional(),
  gallery: z.boolean().optional(),
  lightbox: z.boolean().optional()
});

const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
  schema: baseSchema.extend({
    pubDate: z.coerce.date(),
    series: z.array(z.string()).optional(),
    seriesOrder: z.number().optional(),
    audio: z.string().url().optional(),
    comments: z.boolean().default(true)
  })
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
  schema: baseSchema.extend({
    links: z.array(z.object({
      label: z.string(),
      url: z.string().url(),
      icon: z.string().optional(),
      variant: z.enum(['primary', 'secondary']).default('secondary')
    })).default([]),
    featured: z.boolean().default(false)
  })
});

const resumeExperience = z.object({
  company: z.string(),
  title: z.string(),
  location: z.string().optional(),
  start: z.string(),
  end: z.string(),
  description: z.string().optional(),
  highlights: z.array(z.string()).optional(),
  stack: z.array(z.string()).optional()
});

const resumeEducation = z.object({
  institution: z.string(),
  degree: z.string(),
  location: z.string().optional(),
  start: z.string(),
  end: z.string(),
  description: z.string().optional()
});

const resumeSkillGroup = z.object({
  category: z.string(),
  items: z.array(z.string())
});

const resumeCertification = z.object({
  name: z.string(),
  issuer: z.string(),
  date: z.string().optional(),
  url: z.string().optional()
});

const resumeLanguage = z.object({
  language: z.string(),
  level: z.string()
});

const pages = defineCollection({
  loader: glob({ base: './src/content/pages', pattern: '**/*.{md,mdx}' }),
  schema: baseSchema.extend({
    layout: z.enum(['page', 'timeline', 'resume']).default('page'),
    name: z.string().optional(),
    jobTitle: z.string().optional(),
    location: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    website: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
    summary: z.string().optional(),
    experience: z.array(resumeExperience).optional(),
    education: z.array(resumeEducation).optional(),
    skills: z.array(resumeSkillGroup).optional(),
    certifications: z.array(resumeCertification).optional(),
    languages: z.array(resumeLanguage).optional()
  })
});

const series = defineCollection({
  loader: glob({ base: './src/content/series', pattern: '**/*.{md,mdx}' }),
  schema: baseSchema
});

export const collections = {
  posts,
  projects,
  pages,
  series
};

import path from 'node:path';
import fs from 'node:fs';

import { slugify } from './slugify.ts';
import { getPostTemplate } from './new-post.ts';

const run = async () => {
  const dirRoot = path.resolve(process.cwd());

  const template = getPostTemplate();

  const [_, __, title, ...tagsArgv] = process.argv;
  const tags = ['personal', 'weekly', ...tagsArgv];

  let frontmatter = template
    .split('\n')
    .filter(Boolean)
    .filter((str) => str !== '---')
    .join('\n');

  console.log('frontmatter', frontmatter);
  const createdAt = new Date();

  const fileTitle = slugify(title);
  const yearMonthDay = createdAt.toISOString().slice(0, 10);
  const slug = slugify(`${yearMonthDay}-${title}`);

  frontmatter = frontmatter.replace('{{slug}}', `'${slug}'`);
  frontmatter = frontmatter.replace('{{title}}', `'${title}'`);
  frontmatter = frontmatter.replace(
    '{{pubDate}}',
    `${createdAt.toISOString()}`,
  );

  if (Array.isArray(tags) && tags.length > 0) {
    const tagsFormatted = tags
      .map((tag) => slugify(tag))
      .map((tag, i) => `  - ${tag}`)
      .join('\n');

    frontmatter += `\ntags:\n${tagsFormatted}`;
  }

  const dirBlog = path.resolve(dirRoot, 'src', 'content', 'blog');

  const weeklyFiles = fs
    .readdirSync(dirBlog)
    .filter((file) => file.endsWith('-weekly-update.md'));
  const lastWeekFile = weeklyFiles[weeklyFiles.length - 1];

  console.log('weekly files', weeklyFiles);
  let lastWeekSlug = `${lastWeekFile.slice(0, 10)}-weekly-update`;

  const data = `---
${frontmatter}
---

## Review

Since [last week](/blog/${lastWeekSlug}), I ...

## What is next

`;

  fs.writeFileSync(
    path.resolve(dirBlog, `${createdAt.toISOString()}-${fileTitle}.md`),
    data,
    { encoding: 'utf-8' },
  );
};

run();

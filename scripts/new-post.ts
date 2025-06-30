import path from 'node:path';
import fs from 'node:fs';

import { slugify } from './slugify.ts';
import { fileURLToPath } from 'node:url';

export const getPostTemplate = (templateName = 'post.template.md') => {
  const template = path.resolve(process.cwd(), 'scripts', templateName);
  const content = fs.readFileSync(template, { encoding: 'utf-8' });

  return content;
};

const run = async () => {
  const dirRoot = path.resolve(process.cwd());

  const template = getPostTemplate();

  const [_, __, title, ...tags] = process.argv;

  let frontmatter = template
    .split('\n')
    .filter(Boolean)
    .filter((str) => str !== '---')
    .join('\n');

  const createdAt = new Date();

  const slug = slugify(title);

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

  const data = `\
---
${frontmatter}
---
`;

  const dirBlog = path.resolve(dirRoot, 'src', 'content', 'blog');

  fs.writeFileSync(
    path.resolve(dirBlog, `${createdAt.toISOString()}-${slug}.md`),
    data,
    { encoding: 'utf-8' },
  );
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run();
}

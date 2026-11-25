import { generate, isAvailable } from './ollama.mjs';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([a-z]:)/i, '$1')), '..');
const PAGES_DIR = path.join(ROOT, 'site', 'pages');

function slugify(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

async function main() {
  const topic = process.argv[2] || 'best standing desk for remote work';
  const slug = slugify(topic);

  if (!(await isAvailable())) {
    console.error('Ollama not available.');
    process.exit(1);
  }

  fs.mkdirSync(PAGES_DIR, { recursive: true });

  const prompt = `Write an original, helpful, SEO-friendly article (900-1200 words) about: "${topic}".
Audience: remote workers and home office builders.
Structure: H1 title, intro, "What to look for" criteria list, "Top considerations" section, "Common mistakes", "FAQ" (3 Q&A), conclusion with a soft call to action.
Rules: no fabricated product reviews or specs; use generic criteria and publicly known facts only; include an affiliate disclosure placeholder; plain markdown, no emojis; honest about limitations.`;

  const article = await generate(prompt, { num_predict: 2000 });
  const filePath = path.join(PAGES_DIR, `${slug}.md`);
  fs.writeFileSync(filePath, article, 'utf8');
  console.log('Wrote article:', filePath);

  // Update index of pages
  const indexPath = path.join(PAGES_DIR, 'index.json');
  let index = [];
  try { index = JSON.parse(fs.readFileSync(indexPath, 'utf8')); } catch {}
  if (!index.includes(slug)) index.push(slug);
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf8');
  console.log('Updated page index.');
}

main().catch(err => { console.error(err); process.exit(1); });
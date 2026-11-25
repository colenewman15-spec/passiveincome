import { generate, isAvailable } from './ollama.mjs';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([a-z]:)/i, '$1')), '..');
const PRODUCTS_DIR = path.join(ROOT, 'products');

function slugify(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

async function main() {
  const niche = process.argv[2] || 'remote work productivity';
  const date = new Date().toISOString().slice(0, 10);
  const slug = slugify(niche) + '-' + date;

  if (!(await isAvailable())) {
    console.error('Ollama not available at configured URL. Start Ollama first.');
    process.exit(1);
  }

  const outDir = path.join(PRODUCTS_DIR, slug);
  fs.mkdirSync(outDir, { recursive: true });

  console.log(`Generating product for niche: "${niche}" -> ${outDir}`);

  // 1. Caption pack
  const captionPrompt = `You are a social media copywriter. Create 30 original, high-quality Instagram/TikTok caption templates for the niche: "${niche}".
Format as markdown with sections: Launch, Behind the Scenes, Engagement Question, Value/Tips, Story Hooks, Hashtag groups (broad/mid/niche).
Keep each caption under 120 words. Use placeholders like [PRODUCT] or [TOPIC]. Do NOT use emojis that may break encoding; use plain text only. Output markdown only.`;
  const captions = await generate(captionPrompt, { num_predict: 2000 });
  fs.writeFileSync(path.join(outDir, 'caption_pack.md'), captions, 'utf8');
  console.log('  wrote caption_pack.md');

  // 2. Mini guide
  const guidePrompt = `Write a concise, original, practical guide (600-900 words) titled "Getting Started with ${niche}".
Audience: beginners. Include: what it is, 5 actionable steps, common mistakes, tools/resources list (generic, no specific brands unless widely known), and a short FAQ.
Plain text markdown, no emojis. Be honest about limitations and effort required. No income guarantees.`;
  const guide = await generate(guidePrompt, { num_predict: 1500 });
  fs.writeFileSync(path.join(outDir, 'guide.md'), guide, 'utf8');
  console.log('  wrote guide.md');

  // 3. Posting plan
  const planPrompt = `Create a 30-day content posting plan for the niche "${niche}".
Output as CSV with columns: Day,Platform,PostType,Topic,CTA. 30 rows. Keep topics varied (educational, story, engagement, promo). Plain text, no commas inside fields unless quoted. Output only the CSV.`;
  const plan = await generate(planPrompt, { num_predict: 1500 });
  fs.writeFileSync(path.join(outDir, 'posting_plan.csv'), plan, 'utf8');
  console.log('  wrote posting_plan.csv');

  // 4. Product metadata
  const meta = {
    niche,
    slug,
    created: new Date().toISOString(),
    files: ['caption_pack.md', 'guide.md', 'posting_plan.csv'],
    suggested_price_usd: 19,
    format: 'digital download (zip)',
  };
  fs.writeFileSync(path.join(outDir, 'product.json'), JSON.stringify(meta, null, 2), 'utf8');
  console.log('  wrote product.json');

  console.log('Product generation complete:', slug);
}

main().catch(err => { console.error(err); process.exit(1); });
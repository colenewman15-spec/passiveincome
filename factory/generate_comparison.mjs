import { generate, isAvailable } from './ollama.mjs';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([a-z]:)/i, '$1')), '..');
const COMPARE_DIR = path.join(ROOT, 'site', 'compare');
const PAGES_DIR = path.join(COMPARE_DIR, 'pages');

function slugify(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function extractJson(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) throw new Error('No JSON object found');
  return JSON.parse(text.slice(start, end + 1));
}

function fallback(category) {
  return {
    title: `Best ${category} in 2026`,
    metaDescription: `Compare ${category} options by criteria that matter: features, usability, integrations, support, and pricing transparency.`,
    intro: `Choosing ${category} is less about finding the "best" tool and more about matching a tool to your team size, workflow, and budget. This guide explains the criteria to compare and lists widely used options to evaluate. Always confirm current pricing and features with the vendor.`,
    criteria: [
      { name: 'Core features', description: 'Does it cover the workflows you use daily without add-ons?' },
      { name: 'Integrations', description: 'Does it connect to the tools your team already uses?' },
      { name: 'Usability', description: 'Can a new team member get productive in a day?' },
      { name: 'Support', description: 'What channels, response times, and documentation are available?' },
      { name: 'Pricing transparency', description: 'Are limits and overage costs clear before you commit?' }
    ],
    products: [],
    faq: [
      { q: `How do I choose ${category}?`, a: 'Start with your must-have workflows, then compare integrations, admin controls, and total cost. Run a trial with real data before committing.' },
      { q: 'Is the cheapest option always best?', a: 'No. Cheap plans often lack admin controls or support. Compare total cost including add-ons and migration time.' },
      { q: 'How are products selected?', a: 'We list widely used options for evaluation. We do not claim hands-on testing of every product, and we do not invent reviews or specifications.' }
    ]
  };
}

function buildHtml(category, data) {
  const slug = slugify(category);
  const products = Array.isArray(data.products) ? data.products : [];
  const criteria = Array.isArray(data.criteria) && data.criteria.length ? data.criteria : fallback(category).criteria;
  const faq = Array.isArray(data.faq) && data.faq.length ? data.faq : fallback(category).faq;

  const rows = products.map(p => `
    <tr>
      <td><strong>${escapeHtml(p.name)}</strong></td>
      <td>${escapeHtml(p.bestFor || '')}</td>
      <td>${Array.isArray(p.strengths) ? p.strengths.map(s => escapeHtml(s)).join('<br>') : escapeHtml(p.strengths || '')}</td>
      <td>${escapeHtml(p.consideration || '')}</td>
      <td>${p.website ? `<a href="${escapeHtml(p.website)}" rel="nofollow sponsored noopener" target="_blank">Visit site</a>` : `<a href="https://www.google.com/search?q=${encodeURIComponent(p.name + ' official site')}" rel="nofollow noopener" target="_blank">Find official site</a>`}</td>
    </tr>`).join('');

  const criteriaHtml = criteria.map(c => `<li><strong>${escapeHtml(c.name)}:</strong> ${escapeHtml(c.description)}</li>`).join('');
  const faqHtml = faq.map(f => `<details><summary>${escapeHtml(f.q)}</summary><p>${escapeHtml(f.a)}</p></details>`).join('');

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: data.title,
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.name,
      url: p.website || undefined
    }))
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(f => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a }
    }))
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(data.title)} | StackCompare</title>
<meta name="description" content="${escapeHtml(data.metaDescription)}">
<link rel="canonical" href="https://stackcompare.example/${slug}.html">
<script type="application/ld+json">${JSON.stringify(itemList)}</script>
<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', system-ui, sans-serif; background:#f8fafc; color:#1e293b; line-height:1.65; }
  header { background: linear-gradient(135deg,#111827,#1f2937); color:#fff; padding:36px 20px; }
  header a { color:#fff; text-decoration:none; font-weight:700; }
  .wrap { max-width: 980px; margin: 0 auto; padding: 32px 20px; }
  h1 { font-size: clamp(1.6rem,4vw,2.2rem); margin: 18px 0 10px; color:#0f172a; }
  h2 { font-size: 1.3rem; margin: 26px 0 10px; color:#0e7490; }
  .intro { color:#475569; margin-bottom: 18px; }
  table { width:100%; border-collapse: collapse; background:#fff; border:1px solid #e2e8f0; border-radius:10px; overflow:hidden; font-size:.92rem; }
  th, td { padding:12px; border-bottom:1px solid #e2e8f0; vertical-align:top; text-align:left; }
  th { background:#f1f5f9; }
  tr:last-child td { border-bottom:none; }
  a { color:#0891b2; }
  .muted { color:#94a3b8; font-size:.85rem; }
  ul { padding-left:1.3rem; }
  li { margin-bottom:.5rem; }
  details { background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:12px 16px; margin-bottom:10px; }
  summary { cursor:pointer; font-weight:600; }
  .disclosure { background:#fff8e1; border-left:4px solid #f59e0b; padding:14px 18px; border-radius:8px; margin:24px 0; font-size:.9rem; }
  footer { text-align:center; padding:30px; color:#64748b; font-size:.85rem; border-top:1px solid #e2e8f0; margin-top:30px; }
</style>
</head>
<body>
<header><div class="wrap"><a href="../index.html">StackCompare</a></div></header>
<div class="wrap">
  <h1>${escapeHtml(data.title)}</h1>
  <p class="intro">${escapeHtml(data.intro)}</p>
  <h2>Comparison</h2>
  <table>
    <thead><tr><th>Product</th><th>Best for</th><th>Strengths</th><th>Consider</th><th>Link</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="5" class="muted">Product list pending verification.</td></tr>'}</tbody>
  </table>
  <h2>How we evaluate</h2>
  <ul>${criteriaHtml}</ul>
  <h2>FAQ</h2>
  ${faqHtml}
  <div class="disclosure"><strong>Affiliate disclosure:</strong> Some links on this page may be affiliate links. If you buy through them, StackCompare may earn a commission at no extra cost to you. We do not invent product reviews or specifications; always verify current pricing and features with the vendor.</div>
</div>
<footer>&copy; 2026 StackCompare. <a href="../index.html">Home</a></footer>
</body>
</html>`;
}

async function main() {
  const category = process.argv[2] || 'CRM software';
  if (!(await isAvailable())) { console.error('Ollama not available.'); process.exit(1); }
  fs.mkdirSync(PAGES_DIR, { recursive: true });

  const prompt = `You are a B2B software researcher. Produce a comparison page for: "${category}".
Return ONLY valid JSON with this exact shape:
{
 "title": "Best ${category} in 2026",
 "metaDescription": "one sentence under 160 chars",
 "intro": "2-3 sentences, honest, no hype",
 "criteria": [{"name":"...","description":"..."}] (5 items),
 "products": [{"name":"...","bestFor":"...","strengths":["...","..."],"consideration":"...","website":"https://..."}] (5-7 real, well-known products),
 "faq": [{"q":"...","a":"..."}] (3 items)
}
Rules:
- Use only real, widely known software products.
- Do NOT invent prices, specifications, ratings, or customer reviews.
- Do NOT make pricing claims (no "affordable", "cheap", "costly") or value judgments.
- Strengths must be generic and verifiable (e.g., "strong integration ecosystem", "visual pipeline view"), not numeric or pricing claims.
- No income claims, no fake testimonials, no superlatives like "guaranteed" or "best overall".
- Keep every claim general; when unsure, describe the category, not the product.
- Output JSON only, no markdown fences.`;

  let data;
  try {
    const raw = await generate(prompt, { temperature: 0.4, num_predict: 2200 });
    data = extractJson(raw);
  } catch (err) {
    console.warn('Model JSON parse failed, using fallback template:', err.message);
    data = fallback(category);
  }

  const slug = slugify(category);
  const html = buildHtml(category, data);
  fs.writeFileSync(path.join(PAGES_DIR, slug + '.html'), html, 'utf8');

  const indexPath = path.join(COMPARE_DIR, 'pages.json');
  let index = [];
  try { index = JSON.parse(fs.readFileSync(indexPath, 'utf8')); } catch {}
  const entry = { slug, title: data.title || `Best ${category} in 2026`, category };
  index = index.filter(x => x.slug !== slug);
  index.push(entry);
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf8');

  console.log('Wrote comparison page:', path.join(PAGES_DIR, slug + '.html'));
}

main().catch(err => { console.error(err); process.exit(1); });
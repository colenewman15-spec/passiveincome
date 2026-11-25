import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([a-z]:)/i, '$1')), '..');
const COMPARE_DIR = path.join(ROOT, 'site', 'compare');
const PAGES_DIR = path.join(COMPARE_DIR, 'pages');
const INDEX_FILE = path.join(COMPARE_DIR, 'pages.json');

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function main() {
  let index = [];
  try { index = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8')); } catch {}
  // Only include pages that actually exist
  index = index.filter(e => fs.existsSync(path.join(PAGES_DIR, e.slug + '.html')));
  fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2), 'utf8');

  const cards = index.map(e => `
    <a class="card" href="pages/${e.slug}.html">
      <h2>${escapeHtml(e.title)}</h2>
      <p>Compare options, evaluation criteria, and buyer considerations.</p>
    </a>`).join('\n');

  const home = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>StackCompare - Honest B2B Software Comparisons</title>
<meta name="description" content="Criteria-based comparisons of B2B software: CRM, project management, email marketing, accounting, HR, and support tools. No fabricated reviews.">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', system-ui, sans-serif; background:#f8fafc; color:#1e293b; line-height:1.65; }
  header { background: linear-gradient(135deg,#111827,#1f2937); color:#fff; padding:60px 20px; text-align:center; }
  header h1 { font-size: clamp(2rem,5vw,2.8rem); margin-bottom:10px; }
  header p { color:#cbd5e1; max-width:640px; margin:0 auto; }
  .wrap { max-width: 980px; margin: 0 auto; padding: 32px 20px; }
  .grid { display:grid; grid-template-columns: repeat(auto-fit,minmax(280px,1fr)); gap:18px; }
  .card { display:block; background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:20px; text-decoration:none; color:inherit; transition: box-shadow .2s; }
  .card:hover { box-shadow: 0 6px 20px rgba(0,0,0,.08); }
  .card h2 { font-size:1.1rem; color:#0e7490; margin-bottom:6px; }
  .card p { color:#64748b; font-size:.9rem; }
  .disclosure { background:#fff8e1; border-left:4px solid #f59e0b; padding:14px 18px; border-radius:8px; margin-top:24px; font-size:.9rem; }
  footer { text-align:center; padding:30px; color:#64748b; font-size:.85rem; border-top:1px solid #e2e8f0; margin-top:30px; }
</style>
</head>
<body>
<header><div class="wrap"><h1>StackCompare</h1><p>Criteria-based B2B software comparisons. No fabricated reviews, no invented specs, no income promises.</p></div></header>
<div class="wrap">
  <div class="grid">
    ${cards || '<p>Comparisons are being generated. Check back soon.</p>'}
  </div>
  <div class="disclosure"><strong>Affiliate disclosure:</strong> Some links may be affiliate links. If you buy through them, StackCompare may earn a commission at no extra cost to you. Always verify current pricing and features with the vendor.</div>
</div>
<footer>&copy; 2026 StackCompare. <a href="../index.html">Atlas Studio</a></footer>
</body>
</html>`;
  fs.writeFileSync(path.join(COMPARE_DIR, 'index.html'), home, 'utf8');
  console.log('Wrote compare/index.html with', index.length, 'comparisons.');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://stackcompare.example/</loc></url>
${index.map(e => `  <url><loc>https://stackcompare.example/pages/${e.slug}.html</loc></url>`).join('\n')}
</urlset>`;
  fs.writeFileSync(path.join(COMPARE_DIR, 'sitemap.xml'), sitemap, 'utf8');
  fs.writeFileSync(path.join(COMPARE_DIR, 'robots.txt'), 'User-agent: *\nAllow: /\nSitemap: https://stackcompare.example/sitemap.xml\n', 'utf8');
  console.log('Wrote sitemap.xml and robots.txt.');
}

main();
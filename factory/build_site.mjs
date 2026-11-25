import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([a-z]:)/i, '$1')), '..');
const PAGES_DIR = path.join(ROOT, 'site', 'pages');
const GUIDES_DIR = path.join(ROOT, 'site', 'guides');
const PAGE_INDEX = path.join(PAGES_DIR, 'index.json');

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function inline(s) {
  s = escapeHtml(s);
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');
  s = s.replace(/`(.+?)`/g, '<code>$1</code>');
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return s;
}

function mdToHtml(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let inList = null; // 'ul' | 'ol'
  let inCode = false;
  const closeList = () => { if (inList) { out.push(`</${inList}>`); inList = null; } };

  for (let raw of lines) {
    const line = raw.trimEnd();
    if (line.trim().startsWith('```')) {
      closeList();
      if (inCode) { out.push('</code></pre>'); inCode = false; }
      else { out.push('<pre><code>'); inCode = true; }
      continue;
    }
    if (inCode) { out.push(escapeHtml(line)); continue; }

    if (!line.trim()) { closeList(); continue; }

    let m;
    if ((m = line.match(/^###\s+(.*)$/))) { closeList(); out.push(`<h3>${inline(m[1])}</h3>`); continue; }
    if ((m = line.match(/^##\s+(.*)$/))) { closeList(); out.push(`<h2>${inline(m[1])}</h2>`); continue; }
    if ((m = line.match(/^#\s+(.*)$/))) { closeList(); out.push(`<h1>${inline(m[1])}</h1>`); continue; }
    if (/^---+$/.test(line.trim())) { closeList(); out.push('<hr>'); continue; }
    if ((m = line.match(/^\s*[-*]\s+(.*)$/))) {
      if (inList !== 'ul') { closeList(); out.push('<ul>'); inList = 'ul'; }
      out.push(`<li>${inline(m[1])}</li>`); continue;
    }
    if ((m = line.match(/^\s*\d+\.\s+(.*)$/))) {
      if (inList !== 'ol') { closeList(); out.push('<ol>'); inList = 'ol'; }
      out.push(`<li>${inline(m[1])}</li>`); continue;
    }
    closeList();
    out.push(`<p>${inline(line)}</p>`);
  }
  closeList();
  if (inCode) out.push('</code></pre>');
  return out.join('\n');
}

function pageShell(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)} | Atlas Studio</title>
<meta name="description" content="${escapeHtml(title)} - practical remote work and creator guides from Atlas Studio.">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', system-ui, sans-serif; background: #f8fafc; color: #1e293b; line-height: 1.7; }
  header { background: linear-gradient(135deg,#06B6D4,#0EA5E9); color:#fff; padding:40px 20px; }
  header a { color:#fff; text-decoration:none; font-weight:700; }
  .wrap { max-width: 820px; margin: 0 auto; padding: 40px 20px; }
  article h1 { font-size: 2rem; margin-bottom: 1rem; color:#0f172a; }
  article h2 { font-size: 1.4rem; margin: 1.5rem 0 .5rem; color:#0e7490; }
  article h3 { font-size: 1.15rem; margin: 1.2rem 0 .4rem; color:#155e75; }
  article p, article li { margin-bottom: .6rem; }
  article ul, article ol { padding-left: 1.5rem; margin-bottom: 1rem; }
  article a { color:#0891b2; }
  article code { background:#e2e8f0; padding:.1rem .3rem; border-radius:4px; font-size:.9em; }
  article pre { background:#1e293b; color:#e2e8f0; padding:1rem; border-radius:8px; overflow:auto; margin-bottom:1rem; }
  footer { text-align:center; padding:30px; color:#64748b; font-size:.85rem; border-top:1px solid #e2e8f0; margin-top:40px; }
</style>
</head>
<body>
<header><div class="wrap"><a href="../index.html">&larr; Atlas Studio</a></div></header>
<div class="wrap"><article>
${bodyHtml}
</article></div>
<footer>&copy; Atlas Studio. Affiliate disclosure: some links may be affiliate links. No income guarantees.</footer>
</body>
</html>`;
}

function main() {
  if (!fs.existsSync(PAGES_DIR)) { console.log('No pages dir.'); return; }
  fs.mkdirSync(GUIDES_DIR, { recursive: true });
  const slugs = fs.readdirSync(PAGES_DIR).filter(f => f.endsWith('.md')).map(f => f.replace(/\.md$/, ''));

  const cards = [];
  for (const slug of slugs) {
    const md = fs.readFileSync(path.join(PAGES_DIR, slug + '.md'), 'utf8');
    const firstHeading = (md.match(/^#\s+(.*)$/m) || [null, slug])[1].trim();
    const html = pageShell(firstHeading, mdToHtml(md));
    fs.writeFileSync(path.join(GUIDES_DIR, slug + '.html'), html, 'utf8');
    cards.push({ slug, title: firstHeading });
    console.log('Rendered guide:', slug);
  }

  const list = cards.length
    ? cards.map(c => `<li><a href="${c.slug}.html">${escapeHtml(c.title)}</a></li>`).join('\n')
    : '<li>No guides generated yet. Run the factory.</li>';

  const featured = fs.existsSync(path.join(GUIDES_DIR, 'remote-work-essentials.html'))
    ? '<h2>Featured guide</h2><ul><li><a href="remote-work-essentials.html">Remote Work Essentials - Ergonomic Setup Guide</a></li></ul>'
    : '';

  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Remote Work Guides | Atlas Studio</title>
<meta name="description" content="Practical, honest guides for remote work, home office setup, and content creation.">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', system-ui, sans-serif; background:#f8fafc; color:#1e293b; }
  header { background: linear-gradient(135deg,#06B6D4,#0EA5E9); color:#fff; padding:40px 20px; }
  header a { color:#fff; text-decoration:none; font-weight:700; }
  .wrap { max-width:820px; margin:0 auto; padding:40px 20px; }
  h1 { margin-bottom:1rem; }
  ul { padding-left:1.25rem; }
  li { margin-bottom:.6rem; }
  a { color:#0891b2; }
  footer { text-align:center; padding:30px; color:#64748b; font-size:.85rem; border-top:1px solid #e2e8f0; margin-top:40px; }
</style>
</head>
<body>
<header><div class="wrap"><a href="../index.html">&larr; Atlas Studio</a></div></header>
<div class="wrap">
<h1>Remote Work Guides</h1>
<p>Practical, honest guides. No fabricated reviews, no income guarantees.</p>
${featured}
<h2>Latest guides</h2>
<ul>
${list}
</ul>
</div>
<footer>&copy; Atlas Studio. Affiliate disclosure: some links may be affiliate links.</footer>
</body>
</html>`;
  fs.writeFileSync(path.join(GUIDES_DIR, 'index.html'), indexHtml, 'utf8');
  console.log('Wrote guides index.');
}

main();
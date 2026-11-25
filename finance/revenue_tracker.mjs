// Pulls Gumroad sales and computes net revenue + reinvestment allocation.
// Usage: set GUMROAD_ACCESS_TOKEN, then: node finance/revenue_tracker.mjs
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([a-z]:)/i, '$1')), '..');
const LEDGER = path.join(ROOT, 'finance', 'ledger.csv');
const SUMMARY = path.join(ROOT, 'finance', 'summary.json');
const TOKEN = process.env.GUMROAD_ACCESS_TOKEN;

function cents(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  // Gumroad API returns cents; if a value looks like dollars (< 1000 and has decimals), leave as-is.
  return n > 1000 ? n / 100 : n;
}

async function fetchSales() {
  if (!TOKEN) throw new Error('GUMROAD_ACCESS_TOKEN not set');
  const res = await fetch(`https://api.gumroad.com/v2/sales?access_token=${encodeURIComponent(TOKEN)}`);
  if (!res.ok) throw new Error(`Gumroad HTTP ${res.status}: ${await res.text()}`);
  const data = await res.json();
  if (!data.success) throw new Error('Gumroad API returned success=false');
  return data.sales || [];
}

function main() {
  fetchSales().then(sales => {
    const rows = [['date', 'product', 'price_usd', 'fee_usd', 'net_usd']];
    let totalNet = 0;
    const byMonth = {};
    const byProduct = {};

    for (const s of sales) {
      const price = cents(s.price);
      const fee = cents(s.gumroad_fee);
      const net = Math.max(0, price - fee);
      const date = (s.created_at || '').slice(0, 10);
      const product = s.product_name || s.product_id || 'unknown';
      rows.push([date, product, price.toFixed(2), fee.toFixed(2), net.toFixed(2)]);
      totalNet += net;
      const month = date.slice(0, 7) || 'unknown';
      byMonth[month] = (byMonth[month] || 0) + net;
      byProduct[product] = (byProduct[product] || 0) + net;
    }

    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    fs.writeFileSync(LEDGER, csv, 'utf8');

    const avgMonthly = Object.values(byMonth).length
      ? Object.values(byMonth).reduce((a, b) => a + b, 0) / Object.values(byMonth).length
      : 0;

    let reinvestPct = 1.0;
    if (avgMonthly >= 2000) reinvestPct = 0.5;
    else if (avgMonthly >= 500) reinvestPct = 0.7;

    const summary = {
      generatedAt: new Date().toISOString(),
      salesCount: sales.length,
      totalNetUsd: Number(totalNet.toFixed(2)),
      byMonth: Object.fromEntries(Object.entries(byMonth).map(([k, v]) => [k, Number(v.toFixed(2))])),
      byProduct: Object.fromEntries(Object.entries(byProduct).map(([k, v]) => [k, Number(v.toFixed(2))])),
      averageMonthlyNetUsd: Number(avgMonthly.toFixed(2)),
      reinvestPct,
      reinvestUsd: Number((totalNet * reinvestPct).toFixed(2)),
      reserveUsd: Number((totalNet * (1 - reinvestPct)).toFixed(2)),
    };
    fs.writeFileSync(SUMMARY, JSON.stringify(summary, null, 2), 'utf8');
    console.log(JSON.stringify(summary, null, 2));
    console.log('Ledger:', LEDGER);
  }).catch(err => {
    console.error('Revenue tracker error:', err.message);
    process.exit(1);
  });
}

main();
// Generates supabase/seed.sql from the PRODUCT_DATA object embedded in products.html.
// Run with: node supabase/generate-seed.js
// Then paste the contents of supabase/seed.sql into the Supabase SQL Editor
// (after schema.sql has been run once) to populate the products table.

const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'products.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const match = html.match(/const PRODUCT_DATA\s*=\s*(\{[\s\S]*?\n\s*\});/);
if (!match) {
  console.error('Could not find PRODUCT_DATA in products.html');
  process.exit(1);
}

const PRODUCT_DATA = eval('(' + match[1] + ')');

function sqlString(value) {
  if (value === undefined || value === null) return 'null';
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlTextArray(arr) {
  if (!arr || arr.length === 0) return "'{}'";
  const escaped = arr.map((s) => String(s).replace(/'/g, "''").replace(/"/g, '\\"'));
  return `'{${escaped.map((s) => `"${s}"`).join(',')}}'`;
}

function categorySlug(category) {
  return category.replace(/&/g, 'and');
}

const lines = [];
lines.push('-- Auto-generated from products.html PRODUCT_DATA. Do not hand-edit;');
lines.push('-- re-run node supabase/generate-seed.js after changing products.html instead.');
lines.push('');
lines.push(
  'insert into products (name, category, category_slug, cat_color, price, image_url, emoji, emoji_bg, description, personalisation, care, sort_order)'
);
lines.push('values');

const names = Object.keys(PRODUCT_DATA);
const rows = names.map((name, i) => {
  const p = PRODUCT_DATA[name];
  const values = [
    sqlString(name),
    sqlString(p.category),
    sqlString(categorySlug(p.category)),
    sqlString(p.catColor),
    p.price,
    p.img ? sqlString(p.img) : 'null',
    p.emoji ? sqlString(p.emoji) : 'null',
    p.emojiBg ? sqlString(p.emojiBg) : 'null',
    sqlString(p.desc),
    sqlTextArray(p.personal),
    p.care ? sqlString(p.care) : 'null',
    i,
  ];
  return `  (${values.join(', ')})`;
});

lines.push(rows.join(',\n') + '');
lines.push(
  'on conflict (name) do update set'
);
lines.push(
  '  category = excluded.category, category_slug = excluded.category_slug, cat_color = excluded.cat_color,'
);
lines.push(
  '  price = excluded.price, image_url = excluded.image_url, emoji = excluded.emoji, emoji_bg = excluded.emoji_bg,'
);
lines.push(
  '  description = excluded.description, personalisation = excluded.personalisation, care = excluded.care,'
);
lines.push('  sort_order = excluded.sort_order;');
lines.push('');

const outPath = path.join(__dirname, 'seed.sql');
fs.writeFileSync(outPath, lines.join('\n'));
console.log(`Wrote ${names.length} products to ${outPath}`);

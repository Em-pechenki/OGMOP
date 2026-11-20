const fs = require('fs');
const path = require('path');
const root = 'D:/OGMOP/src/backend/seed/demo-repo';
const out = {};
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full);
    else {
      const rel = path.relative(root, full).replace(/\\/g, '/');
      out[rel] = fs.readFileSync(full, 'utf8');
    }
  }
}
walk(root);
// also bundle cve db
const cve = fs.readFileSync('D:/OGMOP/src/backend/seed/cve-database.json', 'utf8');
const templates = fs.existsSync('D:/OGMOP/src/backend/seed/templates') 
  ? fs.readdirSync('D:/OGMOP/src/backend/seed/templates').map(f => JSON.parse(fs.readFileSync('D:/OGMOP/src/backend/seed/templates/'+f,'utf8')))
  : [];
fs.writeFileSync('D:/OGMOP/public/demo-repo.json', JSON.stringify({ files: out, cve: JSON.parse(cve), templates }, null, 0), 'utf8');
console.log('bundled', Object.keys(out).length, 'files,', JSON.parse(cve).length, 'CVEs,', templates.length, 'templates');

// server/src/utils/i18nScan.js
const fs = require("fs");
const path = require("path");

function walk(dir, exts, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name === "dist" || e.name === "build") continue;
      walk(full, exts, out);
    } else {
      const ext = path.extname(e.name).toLowerCase();
      if (exts.has(ext)) out.push(full);
    }
  }
  return out;
}

function scanSourceForKeys({ srcRoot }) {
  const exts = new Set([".js", ".jsx", ".ts", ".tsx"]);
  const files = walk(srcRoot, exts);
  const keys = new Set();

  // t("a.b.c") OR t('a.b.c') OR t(`a.b.c`)
  const tCall = /\bt\s*\(\s*(['"`])([^'"`]+)\1/g;

  // <Trans i18nKey="a.b.c" ... />
  // also catches i18nKey={'a.b.c'}
  const transKey1 = /\bi18nKey\s*=\s*(['"])([^'"]+)\1/g;
  const transKey2 = /\bi18nKey\s*=\s*\{\s*(['"])([^'"]+)\1\s*\}/g;

  for (const f of files) {
    const content = fs.readFileSync(f, "utf8");

    let m;
    while ((m = tCall.exec(content))) keys.add(m[2].trim());
    while ((m = transKey1.exec(content))) keys.add(m[2].trim());
    while ((m = transKey2.exec(content))) keys.add(m[2].trim());
  }

  return { usedKeys: Array.from(keys).sort(), fileCount: files.length };
}

module.exports = { scanSourceForKeys };

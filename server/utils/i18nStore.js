// server/src/utils/i18nStore.js
const fs = require("fs");
const path = require("path");

const ALLOWED_LANGS = new Set(["en", "es", "fr"]);

// Adjust this to your repo structure:
const LOCALES_ROOT = path.resolve(__dirname, "../../client/src/locales");

function assertSafePathKey(seg) {
  // prevent prototype pollution
  if (seg === "__proto__" || seg === "prototype" || seg === "constructor") {
    throw new Error("Unsafe key segment");
  }
}

function splitPath(dotPath) {
  if (typeof dotPath !== "string" || !dotPath.trim()) throw new Error("Invalid path");
  if (!/^[a-zA-Z0-9_.-]+$/.test(dotPath)) throw new Error("Invalid path format");
  const parts = dotPath.split(".");
  parts.forEach(assertSafePathKey);
  return parts;
}

function getLangFilePath(lang) {
  if (!ALLOWED_LANGS.has(lang)) throw new Error("Unsupported language");
  return path.join(LOCALES_ROOT, lang, "translation.json");
}

function readJsonFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function writeJsonAtomic(filePath, data) {
  const tmp = `${filePath}.tmp`;
  const json = JSON.stringify(data, null, 2) + "\n";
  fs.writeFileSync(tmp, json, "utf8");
  fs.renameSync(tmp, filePath);
}

function setByDotPath(obj, dotPath, value) {
  const parts = splitPath(dotPath);
  let cur = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    if (cur[k] == null || typeof cur[k] !== "object") cur[k] = {};
    cur = cur[k];
  }
  cur[parts[parts.length - 1]] = value;
}

function removeByDotPath(obj, dotPath) {
  const parts = splitPath(dotPath);
  let cur = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    if (cur[k] == null || typeof cur[k] !== "object") return; // nothing to remove
    cur = cur[k];
  }
  delete cur[parts[parts.length - 1]];
}

function flattenKeys(obj, prefix = "") {
  const keys = [];
  if (obj && typeof obj === "object" && !Array.isArray(obj)) {
    for (const k of Object.keys(obj)) {
      assertSafePathKey(k);
      const next = prefix ? `${prefix}.${k}` : k;
      const v = obj[k];
      if (v && typeof v === "object" && !Array.isArray(v)) {
        keys.push(...flattenKeys(v, next));
      } else {
        // arrays/strings/numbers/bools count as leaf keys
        keys.push(next);
      }
    }
  }
  return keys;
}

function applyOps(doc, ops = []) {
  if (!Array.isArray(ops)) throw new Error("ops must be an array");
  for (const op of ops) {
    if (!op || typeof op !== "object") continue;
    if (op.op === "set") {
      setByDotPath(doc, op.path, op.value);
    } else if (op.op === "remove") {
      removeByDotPath(doc, op.path);
    } else {
      throw new Error(`Unsupported op: ${op.op}`);
    }
  }
  return doc;
}

module.exports = {
  ALLOWED_LANGS,
  getLangFilePath,
  readJsonFile,
  writeJsonAtomic,
  applyOps,
  flattenKeys,
};

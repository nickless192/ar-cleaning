// server/src/routes/i18n.routes.js
const express = require("express");
const path = require("path");

const {
  ALLOWED_LANGS,
  getLangFilePath,
  readJsonFile,
  writeJsonAtomic,
  applyOps,
  flattenKeys,
} = require("../../utils/i18nStore");

const { scanSourceForKeys } = require("../../utils/i18nScan");

const router = express.Router();

// TODO: protect with your admin auth middleware
// router.use(requireAdminAuth);

router.get("/:lang", (req, res) => {
  try {
    const { lang } = req.params;
    const filePath = getLangFilePath(lang);
    const doc = readJsonFile(filePath);
    res.json({ lang, doc });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.put("/:lang", (req, res) => {
  try {
    const { lang } = req.params;
    const { ops } = req.body || {};
    const filePath = getLangFilePath(lang);

    const doc = readJsonFile(filePath);
    const updated = applyOps(doc, ops);

    writeJsonAtomic(filePath, updated);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.get("/scan/all", (req, res) => {
  try {
    // Adjust path to your client src
    const clientSrc = path.resolve(__dirname, "../../../client/src");
    const { usedKeys, fileCount } = scanSourceForKeys({ srcRoot: clientSrc });

    const byLang = {};
    for (const lang of ALLOWED_LANGS) {
      const doc = readJsonFile(getLangFilePath(lang));
      const existing = new Set(flattenKeys(doc));
      byLang[lang] = {
        missing: usedKeys.filter((k) => !existing.has(k)),
        unused: Array.from(existing).filter((k) => !usedKeys.includes(k)).sort(),
      };
    }

    res.json({ usedKeys, fileCount, byLang });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post("/apply-missing", (req, res) => {
  try {
    const { placeholderMode = "empty" } = req.body || {};
    const clientSrc = path.resolve(__dirname, "../../../client/src");
    const { usedKeys } = scanSourceForKeys({ srcRoot: clientSrc });

    const changes = {};

    for (const lang of ALLOWED_LANGS) {
      const filePath = getLangFilePath(lang);
      const doc = readJsonFile(filePath);
      const existing = new Set(flattenKeys(doc));
      const missing = usedKeys.filter((k) => !existing.has(k));

      if (missing.length) {
        const ops = missing.map((k) => ({
          op: "set",
          path: k,
          value:
            placeholderMode === "tag"
              ? `__MISSING__:${k}`
              : "", // empty string placeholder
        }));

        applyOps(doc, ops);
        writeJsonAtomic(filePath, doc);
      }

      changes[lang] = { added: missing.length };
    }

    res.json({ ok: true, changes });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;

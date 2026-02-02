// src/components/Pages/Admin/AdminTranslationsManager.jsx
// Full-featured i18n JSON manager UI for CleanAR Solutions
// - View/Edit translations for en/es/fr
// - Search + filter by namespace
// - Edit strings + arrays (JSON editor) + booleans/numbers
// - Add new key (dot-path) + delete key
// - Scan source for used keys + show missing/unused per language
// - Apply missing keys to files (server writes placeholders)
//
// Requires backend endpoints (as described earlier):
//   GET  /api/i18n/:lang               -> { lang, doc }
//   PUT  /api/i18n/:lang               -> { ops: [{op:"set"|"remove", path, value?}] }
//   GET  /api/i18n/scan/all            -> { usedKeys, fileCount, byLang: {en:{missing,unused}, ...} }
//   POST /api/i18n/apply-missing       -> { placeholderMode: "empty"|"tag" }
//
// UI libs: reactstrap + bootstrap (matches your codebase style)
// If you don't use reactstrap, swap components for your UI system.

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Nav,
  NavItem,
  NavLink,
  Row,
  Spinner,
  Table,
} from "reactstrap";

const LANGS = ["en", "es", "fr"];
const API_BASE = "/api/i18n";

// ---------- Helpers ----------
const isPlainObject = (v) => v && typeof v === "object" && !Array.isArray(v);

function flattenDoc(obj, prefix = "", out = []) {
  if (!isPlainObject(obj)) return out;
  Object.keys(obj).forEach((k) => {
    const next = prefix ? `${prefix}.${k}` : k;
    const v = obj[k];
    if (isPlainObject(v)) flattenDoc(v, next, out);
    else out.push({ key: next, value: v });
  });
  return out;
}

function inferType(v) {
  if (Array.isArray(v)) return "array";
  if (v === null) return "null";
  return typeof v; // "string" | "number" | "boolean" | "object" | "undefined"
}

function safeJsonParse(text) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (e) {
    return { ok: false, error: e?.message || "Invalid JSON" };
  }
}

function normalizeKeyPath(path) {
  const p = String(path || "").trim();
  if (!p) return { ok: false, error: "Key is required." };
  if (!/^[a-zA-Z0-9_.-]+$/.test(p)) return { ok: false, error: "Only letters, numbers, underscore, dash, and dots are allowed." };
  const parts = p.split(".");
  const banned = new Set(["__proto__", "prototype", "constructor"]);
  for (const seg of parts) {
    if (!seg) return { ok: false, error: "Key cannot contain empty segments (e.g., '..')." };
    if (banned.has(seg)) return { ok: false, error: `Unsafe key segment: ${seg}` };
  }
  return { ok: true, value: p };
}

function prettyValueForEditor(value) {
  const t = inferType(value);
  if (t === "array") return JSON.stringify(value, null, 2);
  if (t === "object") return JSON.stringify(value, null, 2);
  if (t === "boolean") return value ? "true" : "false";
  if (t === "number") return String(value);
  if (t === "null") return "null";
  return value ?? "";
}

function parseEditedValue(rawText, originalValue) {
  const originalType = inferType(originalValue);

  // Arrays/objects -> JSON editor
  if (originalType === "array" || originalType === "object") {
    const parsed = safeJsonParse(rawText);
    if (!parsed.ok) return parsed;
    const val = parsed.value;
    if (originalType === "array" && !Array.isArray(val)) {
      return { ok: false, error: "Expected a JSON array." };
    }
    if (originalType === "object" && !isPlainObject(val)) {
      return { ok: false, error: "Expected a JSON object." };
    }
    return { ok: true, value: val };
  }

  // Numbers
  if (originalType === "number") {
    const n = Number(rawText);
    if (Number.isNaN(n)) return { ok: false, error: "Expected a number." };
    return { ok: true, value: n };
  }

  // Booleans
  if (originalType === "boolean") {
    const s = String(rawText).trim().toLowerCase();
    if (s === "true") return { ok: true, value: true };
    if (s === "false") return { ok: true, value: false };
    return { ok: false, error: "Expected 'true' or 'false'." };
  }

  // null -> allow null keyword or empty -> null
  if (originalType === "null") {
    const s = String(rawText).trim().toLowerCase();
    if (s === "" || s === "null") return { ok: true, value: null };
    return { ok: false, error: "Expected null." };
  }

  // Default: string
  return { ok: true, value: String(rawText) };
}

async function apiGetJson(url) {
  const res = await fetch(url, { credentials: "include" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `Request failed (${res.status})`);
  return data;
}

async function apiSendJson(url, method, body) {
  const res = await fetch(url, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `Request failed (${res.status})`);
  return data;
}

function shortPreview(value) {
  const t = inferType(value);
  if (t === "array") return `[Array: ${value.length}]`;
  if (t === "object") return "{Object}";
  if (t === "string") {
    const s = value || "";
    if (s.length <= 60) return s;
    return s.slice(0, 57) + "…";
  }
  return String(value);
}

function groupByNamespace(flatItems) {
  const map = new Map();
  flatItems.forEach((it) => {
    const ns = it.key.includes(".") ? it.key.split(".")[0] : "(root)";
    if (!map.has(ns)) map.set(ns, []);
    map.get(ns).push(it);
  });
  // sort namespaces and keys
  const namespaces = Array.from(map.keys()).sort((a, b) => a.localeCompare(b));
  return { namespaces, map };
}

// ---------- UI Components ----------
function StatPill({ color = "secondary", children }) {
  return (
    <Badge color={color} pill className="me-2 mb-2" style={{ fontSize: 12 }}>
      {children}
    </Badge>
  );
}

function InlineError({ text }) {
  if (!text) return null;
  return (
    <div className="mt-2" style={{ color: "#b00020", fontSize: 13 }}>
      {text}
    </div>
  );
}

// ---------- Main Page ----------
const AdminTranslationsManager = () => {
  const [activeLang, setActiveLang] = useState("en");
  const [docByLang, setDocByLang] = useState({ en: null, es: null, fr: null });
  const [loadingByLang, setLoadingByLang] = useState({ en: false, es: false, fr: false });
  const [errorByLang, setErrorByLang] = useState({ en: "", es: "", fr: "" });

  const [search, setSearch] = useState("");
  const [namespaceFilter, setNamespaceFilter] = useState("ALL");
  const [showOnlyChanged, setShowOnlyChanged] = useState(false);

  const [editKey, setEditKey] = useState("");
  const [editOriginal, setEditOriginal] = useState(null);
  const [editText, setEditText] = useState("");
  const [editError, setEditError] = useState("");
  const [saving, setSaving] = useState(false);

  const [dirtyMap, setDirtyMap] = useState(() => new Map()); // key -> { lang -> {original, draft} }

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addKey, setAddKey] = useState("");
  const [addValueType, setAddValueType] = useState("string");
  const [addValueText, setAddValueText] = useState("");
  const [addError, setAddError] = useState("");
  const [addApplyAllLangs, setAddApplyAllLangs] = useState(true);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteKey, setDeleteKey] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState("");
  const [scanResult, setScanResult] = useState(null);

  const [applyMissingLoading, setApplyMissingLoading] = useState(false);
  const [applyMissingError, setApplyMissingError] = useState("");
  const [placeholderMode, setPlaceholderMode] = useState("empty");

  const searchRef = useRef(null);

  // Load language on demand
  const loadLang = async (lang) => {
    setLoadingByLang((p) => ({ ...p, [lang]: true }));
    setErrorByLang((p) => ({ ...p, [lang]: "" }));
    try {
      const data = await apiGetJson(`${API_BASE}/${lang}`);
      setDocByLang((p) => ({ ...p, [lang]: data.doc }));
    } catch (e) {
      setErrorByLang((p) => ({ ...p, [lang]: e.message || "Failed to load language file." }));
      setDocByLang((p) => ({ ...p, [lang]: null }));
    } finally {
      setLoadingByLang((p) => ({ ...p, [lang]: false }));
    }
  };

  useEffect(() => {
    // load active lang initially
    loadLang(activeLang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLang]);

  // Flatten active language doc for listing
  const flatActive = useMemo(() => {
    const doc = docByLang[activeLang];
    if (!doc) return [];
    return flattenDoc(doc);
  }, [docByLang, activeLang]);

  const { namespaces, map: nsMap } = useMemo(() => groupByNamespace(flatActive), [flatActive]);

  const allKeysActive = useMemo(() => flatActive.map((x) => x.key), [flatActive]);

  // Build displayed list
  const displayedItems = useMemo(() => {
    const s = search.trim().toLowerCase();
    const wantNs = namespaceFilter;

    const changedKeysForLang = new Set();
    if (showOnlyChanged) {
      for (const [k, perLang] of dirtyMap.entries()) {
        if (perLang?.[activeLang]) changedKeysForLang.add(k);
      }
    }

    const items = flatActive
      .filter((it) => {
        if (wantNs !== "ALL") {
          const ns = it.key.includes(".") ? it.key.split(".")[0] : "(root)";
          if (wantNs !== ns) return false;
        }
        if (s) {
          const valStr = typeof it.value === "string" ? it.value.toLowerCase() : "";
          if (!it.key.toLowerCase().includes(s) && !valStr.includes(s)) return false;
        }
        if (showOnlyChanged && !changedKeysForLang.has(it.key)) return false;
        return true;
      })
      .sort((a, b) => a.key.localeCompare(b.key));

    return items;
  }, [flatActive, search, namespaceFilter, showOnlyChanged, dirtyMap, activeLang]);

  // Counts
  const counts = useMemo(() => {
    const total = flatActive.length;
    const changed = Array.from(dirtyMap.entries()).filter(([, perLang]) => perLang?.[activeLang]).length;
    return { total, shown: displayedItems.length, changed };
  }, [flatActive.length, displayedItems.length, dirtyMap, activeLang]);

  // Open editor for a key
  const openEditor = (key, value) => {
    setEditKey(key);
    setEditOriginal(value);

    // If there's a draft in dirtyMap for this key/lang, use it
    const perLang = dirtyMap.get(key);
    const draft = perLang?.[activeLang]?.draft;
    if (draft !== undefined) {
      setEditText(prettyValueForEditor(draft));
    } else {
      setEditText(prettyValueForEditor(value));
    }
    setEditError("");
  };

  const closeEditor = () => {
    setEditKey("");
    setEditOriginal(null);
    setEditText("");
    setEditError("");
  };

  const markDirty = (key, lang, original, draft) => {
    setDirtyMap((prev) => {
      const next = new Map(prev);
      const perLang = { ...(next.get(key) || {}) };
      perLang[lang] = { original, draft };
      next.set(key, perLang);
      return next;
    });
  };

  const clearDirty = (key, lang) => {
    setDirtyMap((prev) => {
      const next = new Map(prev);
      const perLang = { ...(next.get(key) || {}) };
      delete perLang[lang];
      if (Object.keys(perLang).length === 0) next.delete(key);
      else next.set(key, perLang);
      return next;
    });
  };

  const isKeyDirty = (key, lang) => {
    const perLang = dirtyMap.get(key);
    return !!perLang?.[lang];
  };

  const saveEdit = async () => {
    if (!editKey) return;

    setSaving(true);
    setEditError("");

    try {
      const parsed = parseEditedValue(editText, editOriginal);
      if (!parsed.ok) {
        setEditError(parsed.error);
        setSaving(false);
        return;
      }

      const newValue = parsed.value;

      // mark dirty immediately (lets you batch-save if you want)
      markDirty(editKey, activeLang, editOriginal, newValue);

      // persist now (single-save behavior)
      await apiSendJson(`${API_BASE}/${activeLang}`, "PUT", {
        ops: [{ op: "set", path: editKey, value: newValue }],
      });

      // reload lang doc to reflect formatting and ensure canonical state
      await loadLang(activeLang);

      // clear dirty for this key/lang because we saved
      clearDirty(editKey, activeLang);

      closeEditor();
    } catch (e) {
      setEditError(e.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const openAddModal = () => {
    setAddKey("");
    setAddValueType("string");
    setAddValueText("");
    setAddError("");
    setAddApplyAllLangs(true);
    setAddModalOpen(true);
  };

  const computeAddValue = () => {
    if (addValueType === "string") return { ok: true, value: addValueText };
    if (addValueType === "number") {
      const n = Number(addValueText);
      if (Number.isNaN(n)) return { ok: false, error: "Value must be a number." };
      return { ok: true, value: n };
    }
    if (addValueType === "boolean") {
      const s = String(addValueText).trim().toLowerCase();
      if (s !== "true" && s !== "false") return { ok: false, error: "Use 'true' or 'false'." };
      return { ok: true, value: s === "true" };
    }
    if (addValueType === "array") {
      const parsed = safeJsonParse(addValueText || "[]");
      if (!parsed.ok) return { ok: false, error: parsed.error };
      if (!Array.isArray(parsed.value)) return { ok: false, error: "Expected a JSON array." };
      return { ok: true, value: parsed.value };
    }
    if (addValueType === "object") {
      const parsed = safeJsonParse(addValueText || "{}");
      if (!parsed.ok) return { ok: false, error: parsed.error };
      if (!isPlainObject(parsed.value)) return { ok: false, error: "Expected a JSON object." };
      return { ok: true, value: parsed.value };
    }
    return { ok: true, value: addValueText };
  };

  const addNewKey = async () => {
    setAddError("");
    const nk = normalizeKeyPath(addKey);
    if (!nk.ok) {
      setAddError(nk.error);
      return;
    }

    const v = computeAddValue();
    if (!v.ok) {
      setAddError(v.error);
      return;
    }

    const langsToApply = addApplyAllLangs ? LANGS : [activeLang];

    try {
      // Apply in selected languages
      for (const lang of langsToApply) {
        await apiSendJson(`${API_BASE}/${lang}`, "PUT", {
          ops: [{ op: "set", path: nk.value, value: v.value }],
        });
        // Reload only those we touched
        await loadLang(lang);
      }

      setAddModalOpen(false);
      // auto-select namespace filter to show the new key (nice UX)
      const ns = nk.value.includes(".") ? nk.value.split(".")[0] : "(root)";
      setNamespaceFilter(ns);
      setSearch(nk.value);
      setTimeout(() => searchRef.current?.focus?.(), 150);
    } catch (e) {
      setAddError(e.message || "Failed to add key.");
    }
  };

  const openDeleteModal = (key) => {
    setDeleteKey(key);
    setDeleteError("");
    setDeleteModalOpen(true);
  };

  const deleteKeyEverywhere = async () => {
    if (!deleteKey) return;
    setDeleting(true);
    setDeleteError("");

    try {
      // remove from all languages to avoid drift
      for (const lang of LANGS) {
        await apiSendJson(`${API_BASE}/${lang}`, "PUT", {
          ops: [{ op: "remove", path: deleteKey }],
        });
        await loadLang(lang);
        clearDirty(deleteKey, lang);
      }
      setDeleteModalOpen(false);
    } catch (e) {
      setDeleteError(e.message || "Failed to delete key.");
    } finally {
      setDeleting(false);
    }
  };

  const runScan = async () => {
    setScanLoading(true);
    setScanError("");
    try {
      const data = await apiGetJson(`${API_BASE}/scan/all`);
      setScanResult(data);
    } catch (e) {
      setScanError(e.message || "Failed to scan.");
      setScanResult(null);
    } finally {
      setScanLoading(false);
    }
  };

  const applyMissing = async () => {
    setApplyMissingLoading(true);
    setApplyMissingError("");
    try {
      await apiSendJson(`${API_BASE}/apply-missing`, "POST", { placeholderMode });
      // reload active lang (and ideally all)
      for (const lang of LANGS) {
        await loadLang(lang);
      }
      // rerun scan to update counts
      await runScan();
    } catch (e) {
      setApplyMissingError(e.message || "Failed to apply missing keys.");
    } finally {
      setApplyMissingLoading(false);
    }
  };

  const activeDocLoaded = !!docByLang[activeLang] && !loadingByLang[activeLang];

  const namespaceOptions = useMemo(() => {
    const base = ["ALL", ...namespaces];
    // keep current selection even if empty
    if (namespaceFilter !== "ALL" && !base.includes(namespaceFilter)) base.push(namespaceFilter);
    return base;
  }, [namespaces, namespaceFilter]);

  return (
    <Container fluid className="py-4">
      <Row className="mb-3">
        <Col lg="12">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
            <div>
              <h3 className="mb-1">Translations Manager</h3>
              <div style={{ color: "#6c757d" }}>
                Manage <strong>src/locales/*/translation.json</strong> (strings, arrays, Trans keys)
              </div>
              <div className="mt-2">
                <StatPill color="primary">{counts.total} keys</StatPill>
                <StatPill color="info">{counts.shown} shown</StatPill>
                <StatPill color={counts.changed ? "warning" : "secondary"}>{counts.changed} changed</StatPill>
                {scanResult?.fileCount != null && <StatPill color="secondary">scanned {scanResult.fileCount} files</StatPill>}
              </div>
            </div>

            <div className="d-flex flex-wrap align-items-center gap-2">
              <Button color="success" onClick={openAddModal}>
                + Add Key
              </Button>
              <Button color="secondary" outline onClick={runScan} disabled={scanLoading}>
                {scanLoading ? (
                  <>
                    <Spinner size="sm" className="me-2" /> Scanning…
                  </>
                ) : (
                  "Scan Missing Keys"
                )}
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col lg="12">
          <Card className="shadow-sm">
            <CardBody>
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                {/* Language tabs */}
                <Nav tabs style={{ borderBottom: "0" }}>
                  {LANGS.map((lang) => (
                    <NavItem key={lang}>
                      <NavLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveLang(lang);
                        }}
                        active={activeLang === lang}
                      >
                        {lang.toUpperCase()}
                        {loadingByLang[lang] && <Spinner size="sm" className="ms-2" />}
                      </NavLink>
                    </NavItem>
                  ))}
                </Nav>

                {/* Filters */}
                <div className="d-flex flex-wrap align-items-end gap-2" style={{ minWidth: 420 }}>
                  <FormGroup className="mb-0" style={{ minWidth: 220, flex: 1 }}>
                    <Label className="mb-1" for="searchKeys">
                      Search
                    </Label>
                    <Input
                      id="searchKeys"
                      innerRef={searchRef}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder='Find keys/values (e.g. "navbar", "ISSA", "quote")'
                    />
                  </FormGroup>

                  <FormGroup className="mb-0" style={{ minWidth: 180 }}>
                    <Label className="mb-1" for="namespaceFilter">
                      Namespace
                    </Label>
                    <Input
                      type="select"
                      id="namespaceFilter"
                      value={namespaceFilter}
                      onChange={(e) => setNamespaceFilter(e.target.value)}
                    >
                      {namespaceOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt === "ALL" ? "All" : opt}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>

                  <FormGroup className="mb-0">
                    <Label className="mb-1" for="showChanged">
                      &nbsp;
                    </Label>
                    <div className="d-flex align-items-center gap-2">
                      <Input
                        id="showChanged"
                        type="checkbox"
                        checked={showOnlyChanged}
                        onChange={(e) => setShowOnlyChanged(e.target.checked)}
                      />
                      <span style={{ fontSize: 13 }}>Changed only</span>
                    </div>
                  </FormGroup>

                  <Button
                    color="secondary"
                    outline
                    onClick={() => {
                      setSearch("");
                      setNamespaceFilter("ALL");
                      setShowOnlyChanged(false);
                      setTimeout(() => searchRef.current?.focus?.(), 80);
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </div>

              {/* Load errors */}
              {errorByLang[activeLang] && (
                <div className="mt-3 p-3" style={{ background: "#fff3f3", borderRadius: 10, border: "1px solid #ffd1d1" }}>
                  <strong style={{ color: "#b00020" }}>Error:</strong> {errorByLang[activeLang]}
                  <div className="mt-2">
                    <Button color="danger" outline size="sm" onClick={() => loadLang(activeLang)}>
                      Retry loading {activeLang.toUpperCase()}
                    </Button>
                  </div>
                </div>
              )}

              {/* Scan Panel */}
              {scanError && (
                <div className="mt-3 p-3" style={{ background: "#fff3f3", borderRadius: 10, border: "1px solid #ffd1d1" }}>
                  <strong style={{ color: "#b00020" }}>Scan error:</strong> {scanError}
                </div>
              )}

              {scanResult && (
                <div className="mt-3 p-3" style={{ background: "#f8f9fa", borderRadius: 12 }}>
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                    <div>
                      <strong>Scan results</strong>
                      <div style={{ color: "#6c757d", fontSize: 13 }}>
                        Used keys found in source: <strong>{scanResult.usedKeys?.length ?? 0}</strong>
                      </div>
                    </div>

                    <div className="d-flex flex-wrap align-items-center gap-2">
                      <FormGroup className="mb-0">
                        <Label className="mb-1" for="placeholderMode">
                          Placeholder mode
                        </Label>
                        <Input
                          type="select"
                          id="placeholderMode"
                          value={placeholderMode}
                          onChange={(e) => setPlaceholderMode(e.target.value)}
                        >
                          <option value="empty">Empty string</option>
                          <option value="tag">__MISSING__ tag</option>
                        </Input>
                      </FormGroup>

                      <Button color="primary" onClick={applyMissing} disabled={applyMissingLoading}>
                        {applyMissingLoading ? (
                          <>
                            <Spinner size="sm" className="me-2" /> Applying…
                          </>
                        ) : (
                          "Apply Missing Keys"
                        )}
                      </Button>
                    </div>
                  </div>

                  {applyMissingError && <InlineError text={applyMissingError} />}

                  <Row className="mt-3">
                    {LANGS.map((lang) => {
                      const missing = scanResult.byLang?.[lang]?.missing || [];
                      const unused = scanResult.byLang?.[lang]?.unused || [];
                      return (
                        <Col key={lang} md="4" className="mb-3">
                          <Card className="shadow-sm h-100">
                            <CardHeader className="d-flex align-items-center justify-content-between">
                              <strong>{lang.toUpperCase()}</strong>
                              <div className="d-flex gap-2">
                                <Badge color={missing.length ? "danger" : "success"} pill>
                                  Missing: {missing.length}
                                </Badge>
                                <Badge color={unused.length ? "warning" : "secondary"} pill>
                                  Unused: {unused.length}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardBody style={{ maxHeight: 220, overflow: "auto" }}>
                              {missing.length ? (
                                <>
                                  <div style={{ fontSize: 13, marginBottom: 8 }}>
                                    Missing keys (used in code, not in this language):
                                  </div>
                                  <ul style={{ paddingLeft: 18, marginBottom: 0, fontSize: 13 }}>
                                    {missing.slice(0, 50).map((k) => (
                                      <li key={k}>
                                        <button
                                          type="button"
                                          className="btn btn-link p-0"
                                          style={{ fontSize: 13 }}
                                          onClick={() => {
                                            setActiveLang(lang);
                                            setSearch(k);
                                            setNamespaceFilter("ALL");
                                            setTimeout(() => searchRef.current?.focus?.(), 120);
                                          }}
                                        >
                                          {k}
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                  {missing.length > 50 && (
                                    <div className="mt-2" style={{ color: "#6c757d", fontSize: 12 }}>
                                      Showing first 50…
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div style={{ color: "#198754" }}>No missing keys 🎉</div>
                              )}
                            </CardBody>
                          </Card>
                        </Col>
                      );
                    })}
                  </Row>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Main table */}
      <Row>
        <Col lg="12">
          <Card className="shadow-sm">
            <CardHeader className="d-flex flex-wrap align-items-center justify-content-between gap-2">
              <strong>Keys ({activeLang.toUpperCase()})</strong>
              <div style={{ color: "#6c757d", fontSize: 13 }}>
                Tip: arrays like <code>commercial_cleaning_description</code> are editable as JSON.
              </div>
            </CardHeader>

            <CardBody>
              {!activeDocLoaded && loadingByLang[activeLang] && (
                <div className="py-5 text-center">
                  <Spinner /> <div className="mt-2">Loading {activeLang.toUpperCase()}…</div>
                </div>
              )}

              {activeDocLoaded && (
                <>
                  {displayedItems.length === 0 ? (
                    <div className="py-5 text-center" style={{ color: "#6c757d" }}>
                      No matches found. Try a different search or reset filters.
                    </div>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <Table responsive hover className="align-middle">
                        <thead>
                          <tr>
                            <th style={{ width: "38%" }}>Key</th>
                            <th style={{ width: "42%" }}>Preview</th>
                            <th style={{ width: "10%" }}>Type</th>
                            <th style={{ width: "10%" }} className="text-end">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayedItems.slice(0, 500).map((it) => {
                            const t = inferType(it.value);
                            const dirty = isKeyDirty(it.key, activeLang);
                            return (
                              <tr key={it.key}>
                                <td>
                                  <div className="d-flex align-items-center gap-2">
                                    <code style={{ fontSize: 13 }}>{it.key}</code>
                                    {dirty && (
                                      <Badge color="warning" pill>
                                        changed
                                      </Badge>
                                    )}
                                  </div>
                                </td>
                                <td style={{ fontSize: 13, color: "#495057" }}>{shortPreview(it.value)}</td>
                                <td>
                                  <Badge color={t === "array" ? "info" : t === "string" ? "secondary" : "dark"} pill>
                                    {t}
                                  </Badge>
                                </td>
                                <td className="text-end">
                                  <Button
                                    size="sm"
                                    color="primary"
                                    outline
                                    className="me-2"
                                    onClick={() => openEditor(it.key, it.value)}
                                  >
                                    Edit
                                  </Button>
                                  <Button size="sm" color="danger" outline onClick={() => openDeleteModal(it.key)}>
                                    Delete
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>

                      {displayedItems.length > 500 && (
                        <div className="mt-2" style={{ color: "#6c757d", fontSize: 12 }}>
                          Showing first 500 results. Narrow your search to edit other keys.
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Edit Modal */}
      <Modal isOpen={!!editKey} toggle={closeEditor} size="lg">
        <ModalHeader toggle={closeEditor}>
          Edit key: <code className="ms-2">{editKey}</code>
        </ModalHeader>
        <ModalBody>
          <div className="mb-2" style={{ color: "#6c757d", fontSize: 13 }}>
            Language: <strong>{activeLang.toUpperCase()}</strong> • Type: <strong>{inferType(editOriginal)}</strong>
          </div>

          <FormGroup>
            <Label for="editValue">Value</Label>
            <Input
              id="editValue"
              type="textarea"
              value={editText}
              onChange={(e) => {
                setEditText(e.target.value);
                setEditError("");
              }}
              style={{ minHeight: inferType(editOriginal) === "string" ? 140 : 220, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}
              invalid={!!editError}
              placeholder={
                inferType(editOriginal) === "array"
                  ? "Enter JSON array, e.g.\n[\n  \"item one\",\n  \"item two\"\n]"
                  : inferType(editOriginal) === "object"
                  ? "Enter JSON object"
                  : "Enter value"
              }
            />
            {editError ? <FormFeedback>{editError}</FormFeedback> : null}
          </FormGroup>

          <div className="mt-3 p-3" style={{ background: "#f8f9fa", borderRadius: 12 }}>
            <div style={{ fontSize: 13, color: "#6c757d" }}>Preview (read-only)</div>
            <div style={{ marginTop: 6, fontSize: 14 }}>
              <em>{shortPreview(parseEditedValue(editText, editOriginal).ok ? parseEditedValue(editText, editOriginal).value : editOriginal)}</em>
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="d-flex justify-content-between">
          <Button
            color="secondary"
            outline
            onClick={() => {
              // revert draft to original (and clear dirty)
              clearDirty(editKey, activeLang);
              setEditText(prettyValueForEditor(editOriginal));
              setEditError("");
            }}
            disabled={saving}
          >
            Revert
          </Button>

          <div className="d-flex gap-2">
            <Button color="secondary" onClick={closeEditor} disabled={saving}>
              Cancel
            </Button>
            <Button color="primary" onClick={saveEdit} disabled={saving}>
              {saving ? (
                <>
                  <Spinner size="sm" className="me-2" /> Saving…
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </ModalFooter>
      </Modal>

      {/* Add Key Modal */}
      <Modal isOpen={addModalOpen} toggle={() => setAddModalOpen((v) => !v)} size="lg">
        <ModalHeader toggle={() => setAddModalOpen((v) => !v)}>Add new translation key</ModalHeader>
        <ModalBody>
          <Row>
            <Col md="7">
              <FormGroup>
                <Label for="addKey">Key (dot-path)</Label>
                <Input
                  id="addKey"
                  value={addKey}
                  onChange={(e) => {
                    setAddKey(e.target.value);
                    setAddError("");
                  }}
                  placeholder="e.g., navbar.new_link or booking.confirmation.title"
                  invalid={!!addError && addError.toLowerCase().includes("key")}
                />
                <div className="mt-1" style={{ color: "#6c757d", fontSize: 12 }}>
                  Use the same format as your existing file, e.g. <code>certification.intro</code>
                </div>
              </FormGroup>
            </Col>

            <Col md="5">
              <FormGroup>
                <Label for="addType">Value type</Label>
                <Input
                  id="addType"
                  type="select"
                  value={addValueType}
                  onChange={(e) => {
                    setAddValueType(e.target.value);
                    setAddValueText(e.target.value === "array" ? "[]" : e.target.value === "object" ? "{}" : "");
                    setAddError("");
                  }}
                >
                  <option value="string">String</option>
                  <option value="array">Array (JSON)</option>
                  <option value="object">Object (JSON)</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                </Input>
              </FormGroup>
            </Col>
          </Row>

          <FormGroup>
            <Label for="addValue">Value</Label>
            <Input
              id="addValue"
              type="textarea"
              value={addValueText}
              onChange={(e) => {
                setAddValueText(e.target.value);
                setAddError("");
              }}
              style={{ minHeight: addValueType === "string" ? 140 : 220, fontFamily: addValueType === "string" ? "inherit" : "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}
              placeholder={
                addValueType === "array"
                  ? `[\n  "First line",\n  "Second line"\n]`
                  : addValueType === "object"
                  ? `{\n  "title": "Example"\n}`
                  : addValueType === "boolean"
                  ? "true"
                  : addValueType === "number"
                  ? "123"
                  : "Enter a string value"
              }
              invalid={!!addError && !addError.toLowerCase().includes("key")}
            />
          </FormGroup>

          <div className="d-flex align-items-center gap-2">
            <Input
              id="applyAllLangs"
              type="checkbox"
              checked={addApplyAllLangs}
              onChange={(e) => setAddApplyAllLangs(e.target.checked)}
            />
            <Label for="applyAllLangs" className="mb-0" style={{ fontSize: 13 }}>
              Apply to all languages (en/es/fr)
            </Label>
          </div>

          <InlineError text={addError} />

          <div className="mt-3 p-3" style={{ background: "#f8f9fa", borderRadius: 12 }}>
            <div style={{ fontSize: 13, color: "#6c757d" }}>Quick tips</div>
            <ul style={{ marginBottom: 0, paddingLeft: 18, fontSize: 13 }}>
              <li>
                For <code>&lt;Trans /&gt;</code> strings, you can include HTML tags like <code>&lt;strong&gt;</code>.
              </li>
              <li>
                For arrays used with <code>returnObjects: true</code>, choose <strong>Array</strong> and paste JSON.
              </li>
            </ul>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={() => setAddModalOpen(false)}>
            Cancel
          </Button>
          <Button color="success" onClick={addNewKey}>
            Add Key
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={deleteModalOpen} toggle={() => setDeleteModalOpen((v) => !v)}>
        <ModalHeader toggle={() => setDeleteModalOpen((v) => !v)}>Delete key</ModalHeader>
        <ModalBody>
          <div>
            You’re about to delete:
            <div className="mt-2">
              <code>{deleteKey}</code>
            </div>
          </div>
          <div className="mt-3" style={{ color: "#6c757d", fontSize: 13 }}>
            This will remove the key from <strong>en/es/fr</strong> to keep language files aligned.
          </div>
          <InlineError text={deleteError} />
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={() => setDeleteModalOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button color="danger" onClick={deleteKeyEverywhere} disabled={deleting}>
            {deleting ? (
              <>
                <Spinner size="sm" className="me-2" /> Deleting…
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
}

export default AdminTranslationsManager;
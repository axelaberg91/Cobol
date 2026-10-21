/* Original tests © 2026 axelaberg91. CC BY-NC 4.0. */
"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
const contentSource = fs.readFileSync(path.join(root, "content.js"), "utf8");
const levelSource = fs.readFileSync(path.join(root, "content-levels.js"), "utf8");
const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");

function boot(saved, blocked = false) {
  const listeners = {};
  const nodes = new Map();
  function node(selector) {
    if (!nodes.has(selector)) nodes.set(selector, { innerHTML: "", textContent: "", open: false, isConnected: true, addEventListener(name, fn) { listeners[`${selector}:${name}`] = fn; }, focus() {}, after() {}, scrollIntoView() {}, setAttribute() {}, showModal() { this.open = true; }, close() { this.open = false; }, querySelector() { return node(".modal-close"); } });
    return nodes.get(selector);
  }
  let serialized = saved;
  const context = vm.createContext({ window: { scrollTo() {} }, document: { activeElement: null, querySelector: selector => selector === "#save-warning" ? null : node(selector), querySelectorAll: () => [], createElement: () => ({ setAttribute() {} }), addEventListener: (name, fn) => { listeners[name] = fn; } }, localStorage: { getItem() { if (blocked) throw new Error("Blocked"); return serialized || null; }, setItem(key, value) { if (blocked) throw new Error("Blocked"); serialized = value; } } });
  vm.runInContext(contentSource, context);
  vm.runInContext(levelSource, context);
  vm.runInContext(appSource, context);
  return { main: node("#main"), modal: node("#modal-content"), state: () => JSON.parse(serialized), content: context.window.GAME_CONTENT, answer(index) { listeners.change({ target: { matches: () => true, value: String(index) } }); }, click(action, extra = {}) { listeners.click({ target: { closest: () => ({ disabled: false, dataset: { action, ...extra } }) } }); } };
}

test("All three levels have complete, distinct puzzle variants", () => {
  const { content } = boot();
  assert.deepEqual(Array.from(content.levels, level => level.id), ["easy", "normal", "hard"]);
  for (const base of content.puzzles) {
    for (const level of ["easy", "hard"]) {
      const variant = content.variants[level][base.id];
      assert.ok(variant, `Missing ${level}:${base.id}`);
      assert.notEqual(variant.declarations + variant.code, base.declarations + base.code, `Unchanged ${level}:${base.id}`);
      assert.equal(variant.answers.length, 3);
      assert.equal(new Set(variant.answers).size, 3);
      assert.ok(Number.isInteger(variant.correct) && variant.correct >= 0 && variant.correct < 3);
      assert.equal(variant.hints.length, 3);
      assert.ok(variant.explanation.length > 30);
    }
  }
});

test("Switching level changes the current puzzle, clears the pending answer, and preserves completed jobs", () => {
  const game = boot();
  game.click("continue");
  game.answer(1);
  game.click("check");
  assert.deepEqual(game.state().solved, ["stock"]);
  game.click("difficulty", { level: "hard" });
  assert.equal(game.state().current, 0);
  assert.match(game.main.innerHTML, /STOCK 120 \/ TOTAL 135/);
  assert.match(game.main.innerHTML, /data-action="check" disabled/);
  game.click("check");
  assert.deepEqual(game.state().results, ["normal:stock"]);
  game.answer(1);
  game.click("check");
  assert.deepEqual(game.state().results, ["normal:stock", "hard:stock"]);
  assert.deepEqual(game.state().solved, ["stock"]);
});

test("Hints belong to each difficulty and switching back restores only its own hints", () => {
  const game = boot();
  game.click("continue");
  game.click("hint");
  game.click("difficulty", { level: "easy" });
  assert.doesNotMatch(game.main.innerHTML, /class="hint-panel"/);
  game.click("hint");
  game.click("difficulty", { level: "normal" });
  assert.match(game.main.innerHTML, /class="hint-panel"/);
  assert.deepEqual(game.state().hints, { "normal:stock": 1, "easy:stock": 1 });
});

test("Selected difficulty and results survive reload; unknown difficulty falls back safely", () => {
  const first = boot();
  first.click("difficulty", { level: "easy" });
  first.click("continue");
  first.answer(1);
  first.click("check");
  const restored = boot(JSON.stringify(first.state()));
  assert.equal(restored.state().difficulty, "easy");
  assert.deepEqual(restored.state().results, ["easy:stock"]);
  const invalid = boot(JSON.stringify({ solved: [], difficulty: "unknown", results: ["unknown:stock", "hard:unknown"] }));
  assert.equal(invalid.state().difficulty, "normal");
  assert.deepEqual(invalid.state().results, []);
});

test("Every puzzle has a unique stable ID, valid answer, three hints and a data declaration", () => {
  const { content } = boot();
  assert.equal(content.puzzles.length, 15);
  assert.equal(new Set(content.puzzles.map(p => p.id)).size, 15);
  for (const p of content.puzzles) {
    assert.ok(content.chapters.some(c => c.id === p.chapter));
    assert.equal(p.answers.length, 3);
    assert.ok(Number.isInteger(p.correct) && p.correct >= 0 && p.correct < p.answers.length);
    assert.equal(p.hints.length, 3);
    assert.match(p.declarations, /01 .+ PIC /);
    assert.ok(p.explanation.length > 30);
  }
});

test("Trenton follows exactly three introductory puzzles and locked chapters cannot open", () => {
  const game = boot();
  assert.equal(game.content.puzzles.findIndex(p => p.chapter === "trenton"), 3);
  game.click("chapter", { chapter: "trenton" });
  assert.match(game.main.innerHTML, /Välkommen tillbaka/);
  assert.deepEqual(game.state().visits, []);
});

test("Reloaded progress unlocks Trenton and ignores unknown IDs and invalid fields", () => {
  const game = boot(JSON.stringify({ solved: ["stock", "delivery", "loop", "stock", "unknown"], current: 999, hints: { stock: 99, delivery: 2 }, visits: ["unknown"] }));
  assert.deepEqual(game.state().solved, ["stock", "delivery", "loop"]);
  assert.equal(game.state().current, 0);
  assert.deepEqual(game.state().hints, { "normal:delivery": 2 });
  game.click("continue");
  assert.match(game.main.innerHTML, /Första leveransen i Trenton/);
  assert.match(game.modal.innerHTML, /inte oberoende bekräftad/);
  assert.equal(game.state().current, 3);
});

test("Malformed storage and denied storage still allow playing", () => {
  const malformed = boot("not-json");
  malformed.click("continue");
  assert.match(malformed.main.innerHTML, /Vi börjar med en leverans/);
  const blocked = boot(null, true);
  blocked.click("continue");
  assert.match(blocked.main.innerHTML, /Vi börjar med en leverans/);
  assert.match(blocked.main.innerHTML, /Framsteg kan inte sparas/);
});

test("Saved HTML-like IDs are discarded and comparison operators are escaped in code", () => {
  const game = boot(JSON.stringify({ solved: ['<img src=x onerror=alert(1)>', "stock"], hints: {}, visits: [] }));
  game.click("continue");
  assert.match(game.main.innerHTML, /&gt;=/);
  assert.doesNotMatch(game.main.innerHTML, /onerror/);
});

test("Completion requires all puzzles and reset requires an explicit second action", () => {
  const fresh = boot();
  fresh.click("complete");
  assert.match(fresh.main.innerHTML, /Dagens körningar/);
  const complete = boot(JSON.stringify({ solved: fresh.content.puzzles.map(p => p.id), hints: {}, visits: [] }));
  complete.click("complete");
  assert.match(complete.main.innerHTML, /FELLISTAN: TOM/);
  complete.click("reset-confirm");
  assert.equal(complete.state().solved.length, 15);
  complete.click("reset");
  assert.deepEqual(complete.state().solved, []);
  assert.match(complete.main.innerHTML, /Börja arbetspasset/);
});

test("GitHub Pages entry assets use relative paths and every local asset exists", () => {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const app = appSource;
  for (const source of [html, app]) {
    for (const match of source.matchAll(/(?:src|href)="([^"#]+)"/g)) {
      if (/^(https?:|\$)/.test(match[1])) continue;
      assert.ok(!match[1].startsWith("/"), `Root-relative path breaks project Pages: ${match[1]}`);
      assert.ok(fs.existsSync(path.join(root, match[1])), `Missing asset: ${match[1]}`);
    }
  }
  assert.ok(fs.existsSync(path.join(root, ".nojekyll")));
});

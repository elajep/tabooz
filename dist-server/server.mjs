var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// server/index.js
import sqlite3 from "sqlite3";
console.log("Attempting to import sqlite3...");
try {
  const sqlite32 = __require("sqlite3");
  console.log("sqlite3 imported successfully!");
} catch (e) {
  console.error("Failed to import sqlite3:", e);
}

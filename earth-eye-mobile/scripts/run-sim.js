#!/usr/bin/env node
/**
 * scripts/run-sim.js
 *
 * Mission 10 — runs a sim/*.ts entry file under plain Node by
 * transpiling .ts on the fly (TypeScript compiler API) and resolving
 * this project's '@/' -> 'src/' alias. No ts-node dependency needed.
 *
 * Usage: node scripts/run-sim.js [path-relative-to-src, default: sim/runBakersfieldRoute]
 */
const path = require('path');
const fs = require('fs');
const ts = require('typescript');
const Module = require('module');

const SRC_ROOT = path.join(__dirname, '..', 'src');

require.extensions['.ts'] = function (mod, filename) {
  const source = fs.readFileSync(filename, 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2019,
      esModuleInterop: true,
      strict: false,
    },
    fileName: filename,
  });
  mod._compile(outputText, filename);
};

const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain, options) {
  if (request.startsWith('@/')) {
    request = path.join(SRC_ROOT, request.slice(2));
  }
  return origResolve.call(this, request, parent, isMain, options);
};

const target = process.argv[2] || 'sim/runBakersfieldRoute';
require(path.join(SRC_ROOT, target));

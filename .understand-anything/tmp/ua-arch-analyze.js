#!/usr/bin/env node
// ua-arch-analyze.js — Phase 1: Structural Analysis Script
// Reads ua-arch-input.json and writes ua-arch-results.json

const fs = require('fs');
const path = require('path');

const [,, inputPath, outputPath] = process.argv;
if (!inputPath || !outputPath) {
  console.error('Usage: node ua-arch-analyze.js <input.json> <output.json>');
  process.exit(1);
}

const input = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const { fileNodes, allEdges } = input;

// ── 1. Directory group analysis ──────────────────────────────────────────────
const dirGroups = {};
for (const node of fileNodes) {
  const fp = node.filePath;
  const parts = fp.split('/');
  // Top-level directory (or '.' for root files)
  const topDir = parts.length > 1 ? parts[0] : '.';
  const subDir = parts.length > 2 ? parts[0] + '/' + parts[1] : topDir;

  if (!dirGroups[topDir]) dirGroups[topDir] = [];
  dirGroups[topDir].push(node.id);
}

// ── 2. Node type groups ──────────────────────────────────────────────────────
const typeGroups = {};
for (const node of fileNodes) {
  const t = node.type;
  if (!typeGroups[t]) typeGroups[t] = [];
  typeGroups[t].push(node.id);
}

// ── 3. Extension groups ──────────────────────────────────────────────────────
const extGroups = {};
for (const node of fileNodes) {
  const ext = path.extname(node.name.split(' ')[0]) || 'none';
  if (!extGroups[ext]) extGroups[ext] = [];
  extGroups[ext].push(node.id);
}

// ── 4. Path-based layer pattern matching ─────────────────────────────────────
const layerPatterns = [
  { layer: '고객 페이지', patterns: [/^frontend\/(?!admin|js\/|css\/|admin\/)/, /^frontend\/auth\//, /^frontend\/menus\//, /^frontend\/basket\//, /^frontend\/orders\//, /^frontend\/my\//, /^frontend\/index\./] },
  { layer: '관리자 패널', patterns: [/^frontend\/admin\//] },
  { layer: '공유 유틸리티', patterns: [/^frontend\/js\//, /^frontend\/css\//] },
  { layer: '레거시 백업', patterns: [/^legacy-step2-backup\//] },
  { layer: '프로젝트 지원', patterns: [/^\.understand-anything\//, /^BLUEPRINT\.md$/, /^backend\//, /^README\.md$/] },
];

const layerAssignment = {};
const layerCounts = {};
for (const { layer } of layerPatterns) layerCounts[layer] = 0;

for (const node of fileNodes) {
  const fp = node.filePath;
  let assigned = null;
  for (const { layer, patterns } of layerPatterns) {
    if (patterns.some(p => p.test(fp))) {
      assigned = layer;
      break;
    }
  }
  if (!assigned) assigned = '미분류';
  layerAssignment[node.id] = { layer: assigned, filePath: fp };
  layerCounts[assigned] = (layerCounts[assigned] || 0) + 1;
}

// ── 5. Edge cross-layer analysis ─────────────────────────────────────────────
const crossLayerEdges = [];
for (const edge of allEdges) {
  const srcLayer = layerAssignment[edge.source]?.layer;
  const tgtLayer = layerAssignment[edge.target]?.layer;
  if (srcLayer && tgtLayer && srcLayer !== tgtLayer) {
    crossLayerEdges.push({ ...edge, sourceLayer: srcLayer, targetLayer: tgtLayer });
  }
}

// ── 6. Summary ───────────────────────────────────────────────────────────────
const results = {
  totalNodes: fileNodes.length,
  dirGroups,
  typeGroups,
  extGroups,
  layerAssignment,
  layerCounts,
  crossLayerEdges,
  allNodeIds: fileNodes.map(n => n.id),
};

fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8');
console.log('Analysis complete.');
console.log('Total nodes:', fileNodes.length);
console.log('Layer counts:', layerCounts);
console.log('Cross-layer edges:', crossLayerEdges.length);
console.log('Written to:', outputPath);

import fs from 'fs'; import { MeshoptSimplifier } from 'meshoptimizer'; await MeshoptSimplifier.ready;
const out = {};
for (const [name, target] of [['CommonTree_1', 360], ['CommonTree_2', 360], ['CommonTree_3', 300], ['PineTree_1', 260], ['PineTree_2', 260], ['Bush_1', 120], ['Rock_1', 60]]) {
  const mtl = {}; let cur; for (const l of fs.readFileSync(`/tmp/q/nat/${name}.mtl`, 'utf8').split('\n')) { const p = l.trim().split(/\s+/); if (p[0] === 'newmtl') cur = p[1]; if (p[0] === 'Kd') mtl[cur] = p.slice(1, 4).map(Number); }
  const V = []; let m = null; const groups = {};
  for (const l of fs.readFileSync(`/tmp/q/nat/${name}.obj`, 'utf8').split('\n')) { const p = l.trim().split(/\s+/); if (p[0] === 'v') V.push(p.slice(1, 4).map(Number)); else if (p[0] === 'usemtl') m = p[1]; else if (p[0] === 'f') { const id = p.slice(1).map(t => parseInt(t) - 1); for (let k = 1; k < id.length - 1; k++) (groups[m] ||= []).push(id[0], id[k], id[k + 1]); } }
  const P = [], C = []; let tris = 0;
  for (const [mn, idx] of Object.entries(groups)) {
    // 每個材質分開簡化（保留顏色邊界）
    const used = [...new Set(idx)], remap = new Map(used.map((v, i) => [v, i])); const pos = new Float32Array(used.length * 3); used.forEach((v, i) => pos.set(V[v], i * 3));
    const ind = new Uint32Array(idx.map(v => remap.get(v))); const share = Math.max(12, Math.round(target * ind.length / 3 / Object.values(groups).reduce((a, g) => a + g.length / 3, 0)) * 3);
    const [s] = MeshoptSimplifier.simplify(ind, pos, 3, Math.min(ind.length, share), 0.05);
    const col = mtl[mn] || [0.5, 0.5, 0.5];
    for (let i = 0; i < s.length; i++) { const v = s[i]; P.push(+pos[v * 3].toFixed(3), +pos[v * 3 + 1].toFixed(3), +pos[v * 3 + 2].toFixed(3)); }
    for (let i = 0; i < s.length; i++) C.push(...col.map(x => +Math.pow(x, 1 / 2.2).toFixed(3))); tris += s.length / 3;
  }
  let y0 = 1e9, y1 = -1e9; for (let i = 1; i < P.length; i += 3) { y0 = Math.min(y0, P[i]); y1 = Math.max(y1, P[i]); }
  out[name] = { p: P, c: C, h: +(y1 - y0).toFixed(3), y0: +y0.toFixed(3) }; console.log(name, 'tris', tris, 'h', (y1 - y0).toFixed(2), Object.keys(groups));
}
fs.writeFileSync('/home/claude/kinmen/dist/nature.json', JSON.stringify(out)); console.log(fs.statSync('/home/claude/kinmen/dist/nature.json').size);

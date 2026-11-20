import { NodeIO } from '@gltf-transform/core'; import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS); const doc = await io.read(process.argv[2]); const r = doc.getRoot();
let tris = 0, verts = 0; for (const m of r.listMeshes()) for (const p of m.listPrimitives()) { const i = p.getIndices(); tris += (i ? i.getCount() : p.getAttribute('POSITION').getCount()) / 3; verts += p.getAttribute('POSITION').getCount(); }
console.log(process.argv[2], 'meshes', r.listMeshes().length, 'skins', r.listSkins().length, 'tris', tris, 'verts', verts, 'anims', r.listAnimations().length, 'morph', r.listMeshes().some(m => m.listPrimitives().some(p => p.listTargets().length)));

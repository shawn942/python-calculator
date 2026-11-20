import { NodeIO } from '@gltf-transform/core'; import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer'; import fs from 'fs';
await MeshoptDecoder.ready; await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
for (const f of process.argv.slice(2)) {
  const doc = await io.read(f); const { json, resources } = await io.writeJSON(doc, { format: 'gltf' });
  for (const b of json.buffers || []) { if (b.uri && resources[b.uri]) { b.uri = 'data:application/octet-stream;base64,' + Buffer.from(resources[b.uri]).toString('base64'); } }
  for (const im of json.images || []) { if (im.uri && resources[im.uri]) im.uri = 'data:' + (im.mimeType || 'image/png') + ';base64,' + Buffer.from(resources[im.uri]).toString('base64'); }
  const out = f.replace(/\.glb$/, '.json'); fs.writeFileSync(out, JSON.stringify(json)); console.log(out, fs.statSync(out).size);
}

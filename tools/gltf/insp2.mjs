import { NodeIO } from '@gltf-transform/core'; import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer'; await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
for (const f of process.argv.slice(2)) { const r = (await io.read(f)).getRoot();
console.log(f, r.listMaterials().map(m => m.getName() + ':' + m.getBaseColorFactor().slice(0,3).map(x=>x.toFixed(2)).join(',') + (m.getBaseColorTexture() ? 'T' : '')).join(' '), 'tex', r.listTextures().length); }
const r = (await io.read(process.argv[2])).getRoot(); console.log(r.listSkins()[0].listJoints().map(j => j.getName()).join(' '));
const n = r.listNodes().find(n => n.getName().includes('Hips') || n.getName()==='Root'); 
let mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9]; for (const m of r.listMeshes()) for (const p of m.listPrimitives()) { const a=p.getAttribute('POSITION'); const lo=a.getMin([]),hi=a.getMax([]); for(let i=0;i<3;i++){mn[i]=Math.min(mn[i],lo[i]);mx[i]=Math.max(mx[i],hi[i]);} } console.log('bbox',mn,mx);
console.log(r.listScenes()[0].listChildren().map(c=>c.getName()+' s'+c.getScale()+' r'+c.getRotation()));

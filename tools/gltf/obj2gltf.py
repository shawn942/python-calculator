import sys, json, base64, struct, re, os
import numpy as np
def conv(objp, out):
    mtl={}; cur=None
    for l in open(objp.replace('.obj','.mtl')):
        p=l.split()
        if not p: continue
        if p[0]=='newmtl': cur=p[1]; mtl[cur]=[0.8,0.8,0.8]
        elif p[0]=='Kd' and cur: mtl[cur]=[float(x) for x in p[1:4]]
    V=[];N=[];objs=[];o=None;m=None
    for l in open(objp):
        p=l.split()
        if not p: continue
        if p[0]=='v': V.append([float(x) for x in p[1:4]])
        elif p[0]=='vn': N.append([float(x) for x in p[1:4]])
        elif p[0]=='o': o={'name':p[1],'prims':{}}; objs.append(o)
        elif p[0]=='usemtl': m=p[1]
        elif p[0]=='f':
            if o is None: o={'name':'obj','prims':{}}; objs.append(o)
            idx=[]
            for t in p[1:]:
                a=t.split('/'); vi=int(a[0])-1; ni=int(a[2])-1 if len(a)>2 and a[2] else -1; idx.append((vi,ni))
            for k in range(1,len(idx)-1): o['prims'].setdefault(m,[]).extend([idx[0],idx[k],idx[k+1]])
    V=np.array(V,dtype=np.float32); N=np.array(N or [[0,1,0]],dtype=np.float32)
    mats=sorted(mtl); mi={n:i for i,n in enumerate(mats)}
    buf=bytearray(); bvs=[]; accs=[]; meshes=[]; nodes=[]
    def add(arr, target, comp, typ, mm=False):
        while len(buf)%4: buf.append(0)
        off=len(buf); b=arr.tobytes(); buf.extend(b)
        bvs.append({'buffer':0,'byteOffset':off,'byteLength':len(b),**({'target':target} if target else {})})
        a={'bufferView':len(bvs)-1,'componentType':comp,'count':int(arr.shape[0]),'type':typ}
        if mm: a['min']=arr.min(0).tolist(); a['max']=arr.max(0).tolist()
        accs.append(a); return len(accs)-1
    for ob in objs:
        allv=[vi for pr in ob['prims'].values() for vi,_ in pr]
        c=V[allv].mean(0) if 'Wheel' in ob['name'] else np.zeros(3,dtype=np.float32)
        if 'Wheel' in ob['name']: lo=V[allv].min(0); hi=V[allv].max(0); c=(lo+hi)/2
        prims=[]
        for mname,tris in ob['prims'].items():
            P=np.array([V[vi]-c for vi,_ in tris],dtype=np.float32); NN=np.array([N[ni] if ni>=0 else [0,1,0] for _,ni in tris],dtype=np.float32)
            prims.append({'attributes':{'POSITION':add(P,34962,5126,'VEC3',True),'NORMAL':add(NN,34962,5126,'VEC3')},'material':mi.get(mname,0)})
        meshes.append({'name':ob['name'],'primitives':prims})
        nodes.append({'name':ob['name'],'mesh':len(meshes)-1,'translation':[float(x) for x in c]})
    g={'asset':{'version':'2.0','generator':'obj2gltf-kinmen'},'scene':0,'scenes':[{'nodes':list(range(len(nodes)))}],'nodes':nodes,'meshes':meshes,
       'materials':[{'name':n,'pbrMetallicRoughness':{'baseColorFactor':mtl[n]+[1],'metallicFactor':0.1,'roughnessFactor':0.6}} for n in mats],
       'accessors':accs,'bufferViews':bvs,'buffers':[{'byteLength':len(buf),'uri':'data:application/octet-stream;base64,'+base64.b64encode(bytes(buf)).decode()}]}
    json.dump(g,open(out,'w'),separators=(',',':'))
    lo=V.min(0); hi=V.max(0); print(os.path.basename(out), 'bbox', lo.round(2).tolist(), hi.round(2).tolist(), [o['name'] for o in objs], os.path.getsize(out))
for f in sys.argv[2:]: conv(f, os.path.join(sys.argv[1], os.path.basename(f).replace('.obj','.json')))

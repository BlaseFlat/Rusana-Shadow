import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import {GLTFLoader} from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';
import {RGBELoader} from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/RGBELoader.js';
export const BASE='https://raw.githubusercontent.com/BlaseFlat/ballbuster-empire/source/web/assets/';
const gltf=new GLTFLoader(), tex=new THREE.TextureLoader(), hdr=new RGBELoader();
export const loadGLB=(p)=>new Promise((res,rej)=>gltf.load(BASE+p,res,undefined,rej));
export const loadJSON=(p)=>fetch(BASE+p).then(r=>r.json());
export const loadTex=(p,srgb=false)=>new Promise((res,rej)=>tex.load(BASE+p,t=>{t.colorSpace=srgb?THREE.SRGBColorSpace:THREE.NoColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;res(t)},undefined,rej));
export const loadHDR=(p)=>new Promise((res,rej)=>hdr.load(BASE+p,res,undefined,rej));
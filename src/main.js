import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import {CombatSystem} from './combat.js';
import {StealthSystem} from './stealth.js';
import {GuardAI} from './ai.js';
const combatSystem=new CombatSystem(),stealthSystem=new StealthSystem(),guardAI=new GuardAI();
const C=(c,r=.6)=>new THREE.MeshStandardMaterial({color:c,roughness:r}),S=new THREE.Scene(),R=new THREE.WebGLRenderer({antialias:true});S.background=new THREE.Color(0x07090d);S.fog=new THREE.Fog(0x10131a,12,40);R.setPixelRatio(Math.min(devicePixelRatio,1.7));R.setSize(innerWidth,innerHeight);R.shadowMap.enabled=true;document.body.appendChild(R.domElement);
const cam=new THREE.PerspectiveCamera(52,innerWidth/innerHeight,.05,80),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));cam.position.set(6,5,11);S.add(new THREE.HemisphereLight(0x9eb4d0,0x141116,1.8));const sun=new THREE.DirectionalLight(0xffd7c2,3);sun.position.set(-5,9,4);sun.castShadow=true;S.add(sun);
const floor=new THREE.Mesh(new THREE.PlaneGeometry(50,50),C(0x24262b,.8));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;S.add(floor);const wall=C(0x171a20,.8);function box(x,y,z,a,b,c,m=wall){const o=new THREE.Mesh(new THREE.BoxGeometry(a,b,c),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;S.add(o)}box(0,2,-14,28,4,1);box(-14,2,0,1,4,28);box(14,2,0,1,4,28);
const skin=C(0xd6a07f,.72),hair=C(0x151218,.28),red=C(0xb54250,.36),black=C(0x101217,.5),cloth=C(0x343845,.48),metal=C(0x777d8a,.28);
function part(g,geo,pos,mat,scale){const o=new THREE.Mesh(geo,mat);o.position.copy(pos);if(scale)o.scale.copy(scale);o.castShadow=o.receiveShadow=true;g.add(o);return o}
function limb(g,a,b,r,m){const v=b.clone().sub(a),n=v.length(),o=new THREE.Mesh(new THREE.CapsuleGeometry(r,n,6,12),m);o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());o.castShadow=o.receiveShadow=true;g.add(o);return o}
function makeBody(g,color,player){
 const top=C(color,.44),skinM=skin,hairM=hair;
 part(g,new THREE.CapsuleGeometry(.43,.72,8,16),new THREE.Vector3(0,1.35,0),top,new THREE.Vector3(1.05,1,.72));
 part(g,new THREE.CylinderGeometry(.31,.38,.22,16),new THREE.Vector3(0,.91,0),black);
 part(g,new THREE.SphereGeometry(.29,24,18),new THREE.Vector3(0,2.13,0),skinM);
 part(g,new THREE.SphereGeometry(.305,24,16,0,Math.PI*2,0,Math.PI*.6),new THREE.Vector3(0,2.2,0),hairM,new THREE.Vector3(1,1,.96));
 part(g,new THREE.CylinderGeometry(.055,.075,.18,10),new THREE.Vector3(0,1.82,0),skinM);
 // face
 part(g,new THREE.SphereGeometry(.035,10,8),new THREE.Vector3(-.105,2.15,-.255),black);
 part(g,new THREE.SphereGeometry(.035,10,8),new THREE.Vector3(.105,2.15,-.255),black);
 part(g,new THREE.SphereGeometry(.04,10,8),new THREE.Vector3(0,2.045,-.285),skinM);
 // shoulders / arms
 limb(g,new THREE.Vector3(-.39,1.62,0),new THREE.Vector3(-.62,1.12,.02),.12,skinM);
 limb(g,new THREE.Vector3(-.62,1.12,.02),new THREE.Vector3(-.56,.72,.03),.105,skinM);
 const atk=new THREE.Group();atk.position.set(.39,1.62,0);g.add(atk);limb(atk,new THREE.Vector3(0,0,0),new THREE.Vector3(.23,-.5,.02),.12,skinM);limb(atk,new THREE.Vector3(.23,-.5,.02),new THREE.Vector3(.17,-.9,.03),.105,skinM);g.userData.attackArm=atk;
 // gloves
 part(g,new THREE.SphereGeometry(.115,14,10),new THREE.Vector3(-.56,.66,.03),player?red:black);
 part(g,new THREE.SphereGeometry(.115,14,10),new THREE.Vector3(.56,.66,.03),player?red:black);
 // legs
 limb(g,new THREE.Vector3(-.19,.82,0),new THREE.Vector3(-.24,.38,0),.16,cloth);
 limb(g,new THREE.Vector3(.19,.82,0),new THREE.Vector3(.24,.38,0),.16,cloth);
 // boots
 part(g,new THREE.BoxGeometry(.27,.16,.48),new THREE.Vector3(-.24,.13,-.08),black);
 part(g,new THREE.BoxGeometry(.27,.16,.48),new THREE.Vector3(.24,.13,-.08),black);
 // clothing detail
 part(g,new THREE.BoxGeometry(.16,.34,.035),new THREE.Vector3(0,1.43,-.365),metal);
 if(player){part(g,new THREE.TorusGeometry(.31,.035,10,28),new THREE.Vector3(0,1.0,0),red).rotation.x=Math.PI/2;}
}
class Fighter{constructor(color,player=false){this.player=player;this.g=new THREE.Group();this.hp=100;this.st=100;this.cool=0;this.at=0;this.kind='light';this.alert=0;this.dead=false;makeBody(this.g,color,player);this.arm=this.g.userData.attackArm;S.add(this.g)}
f(){return new THREE.Vector3(0,0,-1).applyQuaternion(this.g.quaternion)}d(o){return this.g.position.distanceTo(o.g.position)}attack(k='light'){if(this.at||this.cool||this.st<(k==='heavy'?24:10)||this.dead)return false;this.kind=k;this.at=.001;this.cool=k==='heavy'?.48:.27;this.st-=k==='heavy'?24:10;return true}hit(d,dir){if(this.dead)return;this.hp-=d;this.g.position.addScaledVector(dir,.16);if(this.hp<=0){this.dead=true;this.g.rotation.x=-Math.PI/2;this.g.position.y=.25}}update(dt){this.cool=Math.max(0,this.cool-dt);this.st=Math.min(100,this.st+dt*17);if(this.at){this.at+=dt;const dur=this.kind==='heavy'?.62:.38,p=clamp(this.at/dur,0,1),q=Math.sin(p*Math.PI);this.arm.rotation.x=-q*1.65;this.arm.rotation.y=(this.kind==='heavy'?-0.75:0)*q;if(p>=1){this.at=0;this.arm.rotation.set(0,0,0)}}}}const rus=new Fighter(0x343946,true),g1=new Fighter(0x3d3338),g2=new Fighter(0x29333d);rus.g.position.set(0,0,7);g1.g.position.set(0,0,-4);g2.g.position.set(5,0,-9);g1.g.rotation.y=g2.g.rotation.y=Math.PI;
const keys={};let stealth=false,combat=false,threat=0,last=0,dodgeT=0,invulnerable=0;addEventListener('keydown',e=>{keys[e.code]=1;if(e.code==='Space'&&!dodgeT){dodgeT=.32;invulnerable=.28;rus.g.position.addScaledVector(rus.f(),-1.05);msg('DODGE')} if(e.code.startsWith('Shift'))stealth=true;if(e.code==='KeyJ'||e.code==='Space')attack();if(e.code==='KeyK')attack('heavy')});addEventListener('keyup',e=>{keys[e.code]=0;if(e.code.startsWith('Shift'))stealth=false});addEventListener('mousedown',e=>e.button===0&&attack());
function attack(k='light'){if(rus.attack(k)){combat=true;document.body.classList.add('combat');msg(k==='heavy'?'HEAVY STRIKE':'STRIKE')}}
function msg(t){const e=document.querySelector('#message');e.textContent=t;e.style.opacity=1;setTimeout(()=>e.style.opacity=0,350)}
function resolve(t){if(!rus.at||t.dead)return;const v=t.g.position.clone().sub(rus.g.position).normalize(),a=Math.acos(clamp(rus.f().dot(v),-1,1));if(rus.d(t)<1.7&&a<.9&&performance.now()-last>160){t.hit(rus.kind==='heavy'?32:18,v);threat=clamp(threat+(rus.kind==='heavy'?28:14),0,100);last=performance.now();msg('HIT')}}
function ai(g,dt){if(g.dead)return;guardAI.update(g,rus,dt);const d=g.d(rus),v=rus.g.position.clone().sub(g.g.position).setY(0),dir=v.clone().normalize(),a=Math.acos(clamp(g.f().dot(dir),-1,1)),seen=d<8&&a<.72;if(seen&&!stealth)g.alert=Math.min(1,g.alert+dt*1.5);else g.alert=Math.max(0,g.alert-dt*.45);if(g.alert>.8){threat=Math.min(100,threat+dt*20);combat=true}if(g.alert>.5){if(d>1.45){g.g.position.addScaledVector(dir,dt*(g.alert>.85?2.2:1.3));g.g.lookAt(rus.g.position.x,rus.g.position.y+.9,rus.g.position.z)}else if(g.cool<=0)g.attack(Math.random()<.2?'heavy':'light')}}
function move(dt){const x=(keys.KeyD?1:0)-(keys.KeyA?1:0),z=(keys.KeyS?1:0)-(keys.KeyW?1:0),v=new THREE.Vector3(x,0,z);if(v.lengthSq()){v.normalize();rus.g.position.addScaledVector(v,dt*(stealth?2:3.7));rus.g.rotation.y=Math.atan2(v.x,v.z)+Math.PI}rus.g.position.x=clamp(rus.g.position.x,-12.5,12.5);rus.g.position.z=clamp(rus.g.position.z,-12.5,12.5)}
let prev=performance.now();function loop(now){requestAnimationFrame(loop);const dt=Math.min((now-prev)/1000,.033);prev=now;move(dt);rus.update(dt);g1.update(dt);g2.update(dt);ai(g1,dt);ai(g2,dt);if(!invulnerable){resolve(g1);resolve(g2)}dodgeT=Math.max(0,dodgeT-dt);invulnerable=Math.max(0,invulnerable-dt);combatSystem.update(dt);threat=Math.max(0,threat-(combat?.04:.2)*dt);document.querySelector('#stamina').style.transform='scaleX('+rus.st/100+')';document.querySelector('#threat').style.transform='scaleX('+threat/100+')';document.querySelector('#mode').textContent=combat?'COMBAT':threat>.05?'ALERT':'STEALTH';document.querySelector('#objective').textContent=combat?'Выведи противников из строя':'Подойди к противнику незаметно или начни бой';document.body.classList.toggle('alert',threat>.5);const p=rus.g.position;cam.position.lerp(new THREE.Vector3(p.x+5.2,p.y+4.2,p.z+6.4),1-Math.exp(-5*dt));cam.lookAt(p.x,p.y+1.1,p.z);R.render(S,cam)}requestAnimationFrame(loop);addEventListener('resize',()=>{cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();R.setSize(innerWidth,innerHeight)});setTimeout(()=>{const e=document.querySelector('#loading');e.style.opacity=0;setTimeout(()=>e.remove(),550)},350);
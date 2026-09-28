import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import {EffectComposer} from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/postprocessing/OutputPass.js';
import {buildGym,collide} from './gym.js';
import {Character} from './character.js';
import {loadGLB,loadJSON,loadTex,loadHDR} from './loader.js';
import {CombatSystem} from './combat.js';
import {StealthSystem} from './stealth.js';
import {GuardAI} from './ai.js';

const $=s=>document.querySelector(s), clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const scene=new THREE.Scene();scene.background=new THREE.Color(0x0c0a0d);scene.fog=new THREE.Fog(0x16110f,16,42);
const renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:'high-performance'});renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;document.body.appendChild(renderer.domElement);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.05,80);
const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.28,.55,.9));composer.addPass(new OutputPass());
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight)});
scene.add(new THREE.HemisphereLight(0xffe5cf,0x16131a,1.25));
const key=new THREE.DirectionalLight(0xffd8bf,2.1);key.position.set(-7,10,5);key.castShadow=true;key.shadow.mapSize.set(2048,2048);scene.add(key);

const TEXSETS={rubber:'rubber_tiles',brick:'red_brick',leather:'leather_red_02',concrete:'concrete_floor_painted',wood:'wood_floor',plaster:'painted_plaster_wall'};
async function assets(){
 const tex={};for(const [k,n] of Object.entries(TEXSETS)){const [diff,nor,arm]=await Promise.all([loadTex('tex/'+n+'_diff_1k.jpg',true),loadTex('tex/'+n+'_nor_gl_1k.jpg'),loadTex('tex/'+n+'_arm_1k.jpg')]);tex[k]={diff,nor,arm}}
 const [rus,guy,meta,hdr]=await Promise.all([loadGLB('models/rusana.glb'),loadGLB('models/guy.glb'),loadJSON('models/anim_meta.json'),loadHDR('hdri/gym_01_1k.hdr')]);
 return {tex,rus,guy,meta,hdr};
}
function bar(id,v){$(id).style.transform='scaleX('+clamp(v,0,1)+')'}
function msg(t){const e=$('#message');e.textContent=t;e.style.opacity=1;clearTimeout(msg.t);msg.t=setTimeout(()=>e.style.opacity=0,500)}

const combatSystem=new CombatSystem(),stealthSystem=new StealthSystem(),guardAI=new GuardAI();
let gym,rus,g1,g2,hidden=false,threat=0,combat=false,attackState=null,dodge=0,inv=0,last=0;
const keys={};
addEventListener('keydown',e=>{keys[e.code]=true;if(e.repeat)return;if(e.code==='ShiftLeft'||e.code==='ShiftRight')hidden=true;if(e.code==='Space'&&!dodge&&rus){dodge=.28;inv=.24;rus.group.position.addScaledVector(forward(rus),-1.0);msg('DODGE')}if(e.code==='KeyJ'||e.code==='KeyK')startAttack(e.code==='KeyK'?'knee':'kick')});
addEventListener('keyup',e=>{keys[e.code]=false;if(e.code==='ShiftLeft'||e.code==='ShiftRight')hidden=false});
addEventListener('mousedown',e=>{if(e.button===0)startAttack('kick')});

function forward(c){return new THREE.Vector3(0,0,-1).applyQuaternion(c.group.quaternion)}
function dist(a,b){return a.group.position.distanceTo(b.group.position)}
function startAttack(type){if(!rus||attackState||rus.st<=(type==='knee'?28:12))return;rus.st-=type==='knee'?28:12;attackState={type,t:0,hit:false};rus.play(type,{fade:.08,loop:false,restart:true});combat=true;msg(type==='knee'?'KNEE':'STRIKE')}
function hitTarget(t){if(!t||t.dead)return;const v=t.group.position.clone().sub(rus.group.position).setY(0);const d=v.length();if(!d)return;v.normalize();const dot=forward(rus).dot(v);if(d<1.75&&dot>.58){const heavy=attackState.type==='knee';const dmg=heavy?34:20;t.hp-=dmg;t.group.position.addScaledVector(v,.13);t.play(t.hp<=0?'floor':'flinch',{fade:.05,loop:t.hp>0,restart:true});threat=clamp(threat+(heavy?25:14),0,100);msg('HIT');if(t.hp<=0){t.dead=true;t.group.position.y=.05;}}}
function finishAttack(){attackState=null;rus.play('idle',{fade:.12,loop:true})}
function updateAttack(dt){if(!attackState)return;attackState.t+=dt;const hitAt=attackState.type==='knee'?.38:.25;if(!attackState.hit&&attackState.t>=hitAt){attackState.hit=true;for(const t of [g1,g2])if(!t.dead)hitTarget(t)}const dur=attackState.type==='knee'?1.0:.78;if(attackState.t>=dur)finishAttack()}

function move(dt){
 if(attackState)return;
 const x=(keys.KeyD?1:0)-(keys.KeyA?1:0),z=(keys.KeyS?1:0)-(keys.KeyW?1:0);const v=new THREE.Vector3(x,0,z);
 if(v.lengthSq()){v.normalize();const sp=hidden?1.55:3.1;rus.group.position.addScaledVector(v,dt*sp);rus.group.rotation.y=Math.atan2(v.x,v.z)+Math.PI;rus.play('walk',{fade:.15,loop:true,timeScale:hidden?.72:1,restart:false})}
 else rus.play('idle',{fade:.18,loop:true,restart:false});
 collide(rus.group.position,.38,gym,[g1,g2].filter(x=>x&&!x.dead).map(x=>({x:x.group.position.x,z:x.group.position.z,r:.38})));
}
function enemyAI(g,dt){
 if(g.dead)return;
 const d=dist(g,rus),v=rus.group.position.clone().sub(g.group.position).setY(0),dir=v.clone().normalize(),angle=Math.acos(clamp(forward(g).dot(dir),-1,1));
 const sees=d<8&&angle<.72&&!hidden;
 if(sees)g.alert=Math.min(1,g.alert+dt*1.35);else g.alert=Math.max(0,g.alert-dt*.35);
 if(g.alert>.55){combat=true;if(d>1.45){g.group.position.addScaledVector(dir,dt*(g.alert>.82?2.0:1.15));g.group.lookAt(rus.group.position.x,1,rus.group.position.z);g.play('walk',{fade:.16,loop:true,timeScale:g.alert>.82?1.05:.8,restart:false})}else if(!g.attack&&g.hp>0&&g.cool<=0){g.cool=.75+Math.random()*.35;g.play(Math.random()<.25?'flinch':'idle',{fade:.08,loop:true})}}
 else g.play('idle',{fade:.2,loop:true,restart:false});
 collide(g.group.position,.38,gym,[rus,g1,g2].filter(x=>x!==g&&!x.dead).map(x=>({x:x.group.position.x,z:x.group.position.z,r:.38})));
}
async function boot(){
 try{
  const a=await assets();
  const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromEquirectangular(a.hdr).texture;a.hdr.dispose();pmrem.dispose();
  gym=buildGym(scene,a.tex,renderer);
  rus=new Character(a.rus,{name:'Rusana',clone:false,meta:a.meta,idle:'idle'});g1=new Character(a.guy,{name:'Guard A',clone:true,meta:a.meta,idle:'idle'});g2=new Character(a.guy,{name:'Guard B',clone:true,meta:a.meta,idle:'idle'});
  for(const c of [rus,g1,g2]){scene.add(c.group);c.group.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}})}
  rus.group.position.set(0,0,5.8);g1.group.position.set(-2,0,-2.8);g2.group.position.set(4.5,0,-4.8);g1.group.rotation.y=Math.PI;g2.group.rotation.y=Math.PI;
  rus.st=100;rus.hp=100;g1.hp=100;g2.hp=100;g1.alert=g2.alert=0;g1.cool=g2.cool=0;
  rus.play('idle',{fade:0,loop:true});g1.play('idle',{fade:0,loop:true});g2.play('idle',{fade:0,loop:true});
  $('#loading').style.opacity=0;setTimeout(()=>$('#loading')?.remove(),500);
  loop(performance.now());
 }catch(e){console.error(e);$('#loading').innerHTML='ОШИБКА ЗАГРУЗКИ<br><small>'+e.message+'</small>'}
}
let prev=performance.now();
function loop(now){requestAnimationFrame(loop);const dt=Math.min((now-prev)/1000,.033);prev=now;
 if(!rus)return;
 move(dt);updateAttack(dt);for(const c of [rus,g1,g2])c.update(dt);enemyAI(g1,dt);enemyAI(g2,dt);
 dodge=Math.max(0,dodge-dt);inv=Math.max(0,inv-dt);combatSystem.update(dt);
 let p=0;for(const g of [g1,g2])if(!g.dead)p=Math.max(p,g.alert||0);threat=clamp(p*100,0,100);if(!combat)threat=Math.max(0,threat-dt*7);
 bar('#stamina',rus.st/100);bar('#threat',threat/100);$('#mode').textContent=combat?'COMBAT':threat>5?'ALERT':'STEALTH';$('#objective').textContent=combat?'Свободный бой — выбирай момент удара':'Скрытность: подойди сзади или наблюдай за патрулем';
 const p0=rus.group.position;camera.position.lerp(new THREE.Vector3(p0.x+4.8,p0.y+2.9,p0.z+6.2),1-Math.exp(-4.5*dt));camera.lookAt(p0.x,p0.y+1.05,p0.z);composer.render();
}
boot();
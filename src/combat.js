export class CombatSystem{
 constructor(){this.hitCooldown=0}
 resolve(attacker,target){if(!attacker.at||target.dead)return null;const d=attacker.d(target);const v=target.g.position.clone().sub(attacker.g.position).normalize();const dot=attacker.f().dot(v);if(d>1.75||dot<.62||this.hitCooldown>0)return null;this.hitCooldown=.12;const heavy=attacker.kind==='heavy';const damage=heavy?32:18;target.hit(damage,v);return{damage,heavy,critical:dot>.9,distance:d}}
 update(dt){this.hitCooldown=Math.max(0,this.hitCooldown-dt)}
}
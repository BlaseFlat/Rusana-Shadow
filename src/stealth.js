export class StealthSystem{
 constructor(){this.threat=0;this.alerted=false}
 visibility(player,npc,hidden){const d=player.d(npc);const v=player.g.position.clone().sub(npc.g.position).setY(0).normalize();const angle=Math.acos(Math.max(-1,Math.min(1,npc.f().dot(v))));return d<8&&angle<.72&&!hidden}
 update(dt,player,npcs,hidden){let pressure=0;for(const n of npcs){if(n.dead)continue;if(this.visibility(player,n,hidden)){n.alert=Math.min(1,n.alert+dt*1.5)}else n.alert=Math.max(0,n.alert-dt*.45);pressure=Math.max(pressure,n.alert)}this.threat=Math.max(0,Math.min(100,pressure*100));this.alerted=pressure>.8;return{threat:this.threat,alerted:this.alerted}}
}
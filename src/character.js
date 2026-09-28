export class CharacterController{
 constructor(root){this.root=root;this.state='idle';this.hitFlash=0}
 setState(state){this.state=state}
 update(dt){this.hitFlash=Math.max(0,this.hitFlash-dt)}
}
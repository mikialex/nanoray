import { Primitive } from "./primitive";
import { BoxGeometry } from "../geometry/box";
import { SimpleMaterial } from "../material/simple-material";
import { Triangle } from "../geometry/triangle";

export class Scene{
  constructor() {
    
  }

  position=[]
  
  getObject(obj) {
    obj.children.forEach(mesh => {
      this.position = this.position.concat(
        Array.from(mesh.geometry.attributes.position.array)
      );
    });
  }

}
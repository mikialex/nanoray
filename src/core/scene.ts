import { Primitive } from "./primitive";
import { BoxGeometry } from "../geometry/box";
import { SimpleMaterial } from "../material/simple-material";
import { Triangle } from "../geometry/triangle";
import { Vector3 } from "../math/vector3";

export class Scene{
  constructor() {
    
  }

  primitiveList: Array<Primitive> = [];

  addPrimitive(prim:Primitive) {
    this.primitiveList.push(prim);
  }

  get dataLength() {
    let sum = 0;
    this.primitiveList.forEach(data => {
      sum += data.dataLength;
    })
    return sum;
  }

  parseSceneJson(data:any) {
    data.forEach((item: any) => {
      let geo = new Triangle();
      geo.parseJson(item.geo);
      let mate = new SimpleMaterial();
      mate.parseJson(item.mate);
      let prim = new Primitive(geo, mate);
      this.addPrimitive(prim);
    });
  }

  toDataArray() {
    let result: Array<number> = [];
    this.primitiveList.forEach(data => {
      result = result.concat(data.geometry.toArrayData())
            .concat(data.material.toArrayData());
    })
    return result;
  }

  // toDataMapArray() {
  //   let result: Array<number> = [];
  //   let dataAu: Array<number> = [];
  //   this.primitiveList.forEach(data => {
  //     result = result.concat([data.geometry.geoId, data.material.mateId, dataAu.length]);
  //     dataAu = dataAu.concat(data.geometry.toArrayData())
  //       .concat(data.material.toArrayData());
  //   })
  //   return result;
  // }

  loadFromThree(threeObj) {
    
    threeObj.children.forEach(element => {
      let position = element.geometry.attributes.position.array;
      for (let i = 0; i < position.length / 9; i++) {
        let index = 9 * i;
        const tri = new Triangle(
          new Vector3(position[index], position[index + 1], position[index + 2]).multiScalar(1),
          new Vector3(position[index + 3], position[index + 4], position[index + 5]).multiScalar(1),
          new Vector3(position[index + 6], position[index + 7], position[index + 8]).multiScalar(1));
        const mat = new SimpleMaterial(new Vector3(Math.random(), 0.6, 1), new Vector3(0, 0, 0));
        this.addPrimitive(new Primitive(tri, mat));
      }
    });

    const tri = new Triangle(
      new Vector3(-100, 100, -100).multiScalar(0.1),
      new Vector3(-100, 100, 100).multiScalar(0.1),
      new Vector3(100, 100, -100).multiScalar(0.1));
    const mat = new SimpleMaterial(new Vector3(Math.random(), 0.6, 1), new Vector3(10, 10, 10));
    this.addPrimitive(new Primitive(tri, mat));
  }
}
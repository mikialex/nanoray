import { Primitive } from "./primitive";
import { BoxGeometry } from "../geometry/box";
import { SimpleMaterial } from "../material/simple";

export class Scene{
  constructor() {
    
  }

  addPrimitive(prim:Primitive) {
    this.primitiveList.push(prim);
  }

  primitiveList: Array<Primitive> = [];

  get dataLength() {
    let sum = 0;
    this.primitiveList.forEach(data => {
      sum += data.dataLength;
    })
    return sum;
  }

  parseSceneJson(data:any) {
    data.forEach((item: any) => {
      let geo = new BoxGeometry();
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

  toDataMapArray() {
    let result: Array<number> = [];
    let dataAu: Array<number> = [];
    this.primitiveList.forEach(data => {
      result = result.concat([data.geometry.geoId, data.material.mateId, dataAu.length]);
      dataAu = dataAu.concat(data.geometry.toArrayData())
        .concat(data.material.toArrayData());
    })
    return result;
  }
}
import { Vector3 } from "../math/vector3";
import { Geometry } from "../core/geometry";

export class Triangle extends Geometry {
  constructor(p1?: Vector3, p2?: Vector3, p3?: Vector3) {
    super();
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;
  }

  p1: Vector3
  p2: Vector3
  p3: Vector3
  dataLength = 9;
  type = 'box';
  geoId: 1;

  parseJson(data:any) {
    this.p1 = data.x;
    this.p2 = data.y;
    this.p3 = data.z;
  }

  toArrayData() {
    return [
      this.p1.x, this.p1.y, this.p1.z, 0,
      this.p2.x, this.p2.y, this.p2.z, 0,
      this.p3.x, this.p3.y, this.p3.z, 0,
    ]
  }
}
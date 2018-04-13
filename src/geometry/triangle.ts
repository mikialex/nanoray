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
    this.p1 = new Vector3(data.x[0], data.x[1], data.x[2]);
    this.p2 = new Vector3(data.y[0], data.y[1], data.y[2]);
    this.p3 = new Vector3(data.z[0], data.z[1], data.z[2]);
  }

  toArrayData() {
    return [
      this.p1.x, this.p1.y, this.p1.z, 0,
      this.p2.x, this.p2.y, this.p2.z, 0,
      this.p3.x, this.p3.y, this.p3.z, 0,
    ]
  }

  getAABBMin() {
    return new Vector3(
      Math.min(this.p1.x, this.p2.x, this.p3.x),
      Math.min(this.p1.y, this.p2.y, this.p3.y),
      Math.min(this.p1.z, this.p2.z, this.p3.z),
    );
  }
  getAABBMax() {
    return new Vector3(
      Math.max(this.p1.x, this.p2.x, this.p3.x),
      Math.max(this.p1.y, this.p2.y, this.p3.y),
      Math.max(this.p1.z, this.p2.z, this.p3.z),
    );
  }
  getCenter() {
    return new Vector3(
      Math.max(this.p1.x, this.p2.x, this.p3.x) + Math.min(this.p1.x, this.p2.x, this.p3.x),
      Math.max(this.p1.y, this.p2.y, this.p3.y) + Math.min(this.p1.y, this.p2.y, this.p3.y),
      Math.max(this.p1.z, this.p2.z, this.p3.z) + Math.min(this.p1.z, this.p2.z, this.p3.z),
    ).multiScalar(0.5);
  }
}
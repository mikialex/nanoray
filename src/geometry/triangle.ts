import { Vector3 } from "../math/vector3";

export class Triangle {
  constructor(p1: Vector3, p2: Vector3, p3: Vector3) {
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;
  }

  p1: Vector3
  p2: Vector3
  p3: Vector3
}
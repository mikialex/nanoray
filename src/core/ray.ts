import { Vector3 } from "../math/vector3";

export class Triangle {
  constructor(origin: Vector3, direction: Vector3) {
    this.origin = origin;
    this.direction = direction;
  }

  origin: Vector3
  direction: Vector3
}
import { Vector3 } from "../math/vector3";

export class Ray {
  constructor(origin: Vector3, direction: Vector3) {
    this.origin = origin;
    this.direction = direction;
  }

  origin: Vector3
  direction: Vector3
}
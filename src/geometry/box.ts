import { Vector3 } from "../math/vector3";

export class BoxGeometry {
  constructor(minPoint: Vector3, maxPoint: Vector3) {
    this.minPoint = minPoint;
    this.maxPoint = maxPoint;
  }
  minPoint: Vector3;
  maxPoint: Vector3;

  toArrayData() {
    return [this.minPoint.x, this.minPoint.y, this.minPoint.z,
      this.maxPoint.x, this.maxPoint.y, this.maxPoint.z,
      
    ]
  }
}
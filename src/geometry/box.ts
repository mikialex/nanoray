import { Vector3 } from "../math/vector3";
import { Geometry } from "../core/geometry";

export class BoxGeometry extends Geometry{
  constructor(minPoint?: Vector3, maxPoint?: Vector3) {
    super();
    this.minPoint = minPoint;
    this.maxPoint = maxPoint;
  }
  minPoint: Vector3;
  maxPoint: Vector3;
  dataLength = 8;
  type = 'box';
  geoId = 0;

  parseJson(data: any) {
    this.minPoint = new Vector3(data.min[0], data.min[1], data.min[2]);
    this.maxPoint = new Vector3(data.max[0], data.max[1], data.max[2]);
  }

  toArrayData() {
    return [this.minPoint.x, this.minPoint.y, this.minPoint.z,0,
      this.maxPoint.x, this.maxPoint.y, this.maxPoint.z,0
    ]
  }

  getAABBMin() {
    return this.minPoint;
  }
  getAABBMax() {
    return this.maxPoint;
  }
  getCenter() {
    return new Vector3(0,0,0); // not imple
  }

}
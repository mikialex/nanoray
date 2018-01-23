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
  dataLength = 6;
  type = 'box';
  geoId = 1;

  parseJson(data: any) {
    this.minPoint = new Vector3(data.min[0], data.min[1], data.min[2]);
    this.maxPoint = new Vector3(data.max[0], data.max[1], data.max[2]);
  }

  toArrayData() {
    return [this.minPoint.x, this.minPoint.y, this.minPoint.z,
      this.maxPoint.x, this.maxPoint.y, this.maxPoint.z,
    ]
  }



}
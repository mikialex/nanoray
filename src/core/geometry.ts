import { Vector3 } from "../math/vector3";

export abstract class Geometry{
  abstract toArrayData(): Array<number>;
  dataLength: number;
  geoId: number;

  abstract getAABBMin();
  abstract getAABBMax();
  abstract getCenter();
}
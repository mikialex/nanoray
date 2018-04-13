import { Vector3 } from "../math/vector3";

export abstract class Geometry{
  abstract toArrayData(): Array<number>;
  dataLength: number;
  geoId: number;

  abstract getAABBMin(): Vector3;
  abstract getAABBMax(): Vector3;
  abstract getCenter(): Vector3;
}
import { Vector3 } from "../math/vector3";
import { Material } from "../core/material";

export class SimpleMaterial extends Material{
  constructor(color?: Vector3, lightness?: Vector3) {
    super();
    this.color = color;
    this.lightness = color;
  }

  color: Vector3;
  lightness: Vector3;

  parseJson(data: any) {
    this.color = new Vector3(data.color[0], data.color[1], data.color[2]);
    this.lightness = new Vector3(data.lightness[0], data.lightness[1], data.lightness[2]);
  }

  dataLength = 6;
  mateId = 1;

  toArrayData() {
    return [this.color.x, this.color.y, this.color.z,
      this.lightness.x, this.lightness.y, this.lightness.z,
    ]
  }

}
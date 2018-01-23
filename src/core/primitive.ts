import { Geometry } from "./geometry";
import { Material } from "./material";

export class Primitive  {
  constructor(geometry: Geometry, material: Material) {
    this._geometry = geometry;
    this._material = material;
  }
  
  private _geometry: Geometry;
  private _material: Material;

  get geometry(){
    return this._geometry;
  }
  get material() {
    return this._material;
  }

  get dataLength() {
    return this.geometry.dataLength + this.material.dataLength;
  }

  toArrayData() {
    return this.geometry.toArrayData()
      .concat(this.material.toArrayData());
  }
}
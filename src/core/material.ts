export abstract class Material {
  abstract toArrayData(): Array<number>;
  dataLength: number;
  mateId: number;
}
import { WebglRenderer } from "./webgl/webgl-renderer";
import { CameraControler } from "./camera-controler";

export class Camera {
  constructor(fieldOfView: number, aspectRatio: number, nearPlane: number, farPlane: number) {
    this.fieldOfView = fieldOfView;
    this.aspectRatio = aspectRatio;
    this.nearPlane = nearPlane;
    this.farPlane = farPlane;
  }

  renderer: WebglRenderer;
  controler: CameraControler;

  //焦距
  fieldOfView = Math.PI / 4.0;
  //长宽比
  aspectRatio = 500 / 250;
  //近裁剪面距离
  nearPlane = 1;
  //远裁剪面距离
  farPlane = 100;

  center = new Float32Array([0.0, 0.0, 0.0]);
  eye = new Float32Array([0.0, 0.0, 1.0]);
  up = new Float32Array([0.0, 1.0, 0.0]);
  matrix = new Float32Array(16);

  moveTo(x: number, y: number, z: number) {
    this.eye[0] = x;
    this.eye[1] = y;
    this.eye[2] = z;
  }

  lookAt(x: number, y: number, z: number) {
    this.center[0] = x;
    this.center[1] = y;
    this.center[2] = z;
  }

  update() {
    document.querySelector('#camera').textContent =
      `camera position: ${this.eye[0]} , ${this.eye[1]}, ${this.eye[2]}<br>
      look at :  ${this.center[0]} , ${this.center[1]}, ${this.center[2]}
      `
    var tan = Math.tan(this.fieldOfView / 2.0);
    var nf = (this.nearPlane - this.farPlane) / (2.0 * this.farPlane * this.nearPlane);
    var fn = (this.farPlane + this.nearPlane) / (2.0 * this.farPlane * this.nearPlane);
    var z0 = this.eye[0] - this.center[0];
    var z1 = this.eye[1] - this.center[1];
    var z2 = this.eye[2] - this.center[2];
    var lz = 1.0 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
    var x0 = this.up[1] * z2 - this.up[2] * z1;
    var x1 = this.up[2] * z0 - this.up[0] * z2;
    var x2 = this.up[0] * z1 - this.up[1] * z0;
    var lx = tan * this.aspectRatio / Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
    var y0 = z1 * x2 - z2 * x1;
    var y1 = z2 * x0 - z0 * x2;
    var y2 = z0 * x1 - z1 * x0;
    var ly = tan / Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
    this.matrix[0] = x0 * lx;
    this.matrix[1] = x1 * lx;
    this.matrix[2] = x2 * lx;
    this.matrix[3] = 0.0;
    this.matrix[4] = y0 * ly;
    this.matrix[5] = y1 * ly;
    this.matrix[6] = y2 * ly;
    this.matrix[7] = 0.0;
    this.matrix[8] = this.eye[0] * nf;
    this.matrix[9] = this.eye[1] * nf;
    this.matrix[10] = this.eye[2] * nf;
    this.matrix[11] = nf;
    this.matrix[12] = this.eye[0] * fn - z0 * lz;
    this.matrix[13] = this.eye[1] * fn - z1 * lz;
    this.matrix[14] = this.eye[2] * fn - z2 * lz;
    this.matrix[15] = fn;
  }
}

declare var THREE;

export function threeToMatrix(camera) {
  var pLocal = new THREE.Vector3(0, 0, -1);
  var pWorld = pLocal.applyMatrix4(camera.matrixWorld);
  return matrix(
    [camera.position.x, camera.position.y, camera.position.z],
    [pLocal.x, pLocal.y, pLocal.z],
    Math.PI * camera.fov / 270,
    camera.aspect,
    camera.near,
    camera.far,
    [0.0, 1.0, 0.0]
  )
}

function matrix(eye, center, fieldOfView, aspectRatio, near, far, up) {
  var matrix = [];
  matrix.length = 16;
  var tan = Math.tan(fieldOfView / 2.0);
  var nf = (near - far) / (2.0 * far * near);
  var fn = (far + near) / (2.0 * far * near);
  var z0 = eye[0] - center[0];
  var z1 = eye[1] - center[1];
  var z2 = eye[2] - center[2];
  var lz = 1.0 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
  var x0 = up[1] * z2 - up[2] * z1;
  var x1 = up[2] * z0 - up[0] * z2;
  var x2 = up[0] * z1 - up[1] * z0;
  var lx = tan * aspectRatio / Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
  var y0 = z1 * x2 - z2 * x1;
  var y1 = z2 * x0 - z0 * x2;
  var y2 = z0 * x1 - z1 * x0;
  var ly = tan / Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
  matrix[0] = x0 * lx;
  matrix[1] = x1 * lx;
  matrix[2] = x2 * lx;
  matrix[3] = 0.0;
  matrix[4] = y0 * ly;
  matrix[5] = y1 * ly;
  matrix[6] = y2 * ly;
  matrix[7] = 0.0;
  matrix[8] = eye[0] * nf;
  matrix[9] = eye[1] * nf;
  matrix[10] = eye[2] * nf;
  matrix[11] = nf;
  matrix[12] = eye[0] * fn - z0 * lz;
  matrix[13] = eye[1] * fn - z1 * lz;
  matrix[14] = eye[2] * fn - z2 * lz;
  matrix[15] = fn;
  return matrix;
}
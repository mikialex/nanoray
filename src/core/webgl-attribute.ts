import { WebglRenderer } from "./webgl-renderer";
import { GLProgram } from "./webgl-program";

export class GLAttribute {
  constructor(renderer: WebglRenderer, name: string, program: GLProgram) {
    this.renderer = renderer;
    renderer.attributes.push(this);
    this.name = name;
    this.getAttributeLocation(name, program);
  }
  renderer: WebglRenderer;
  buffer: WebGLBuffer;
  name: string;
  position: number;

  getAttributeLocation(name: string, program: GLProgram) {
    this.position = this.renderer.gl.getAttribLocation(program.program, name);
  }

  setData(data: any, stride: number) {
    const gl = this.renderer.gl;
    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.vertexAttribPointer(this.position, stride, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.position);
  }
}
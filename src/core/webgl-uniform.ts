import { WebglRenderer } from "./webgl-renderer";
import { GLProgram } from "./webgl-program";

export enum DataType{
  uniform1f,
  uniform3fv,
  uniformMatrix4fv,
  uniform1i
}

export class GLUniform {
  constructor(renderer: WebglRenderer, name: string, program: GLProgram) {
    this.renderer = renderer;
    renderer.uniforms.push(this);
    this.name = name;
    this.getUniformLocation(name, program);
  }
  renderer: WebglRenderer;
  buffer: WebGLBuffer;
  name: string;
  position: WebGLUniformLocation;

  getUniformLocation(name: string, program: GLProgram) {
    const gl = this.renderer.gl;
    this.position = gl.getUniformLocation(program.program, name);
  }

  setData(data: any, type: DataType) {
    const gl = this.renderer.gl;
    switch (type) {
      case DataType.uniform1f:
        gl.uniform1f(this.position, data);
        break;
      case DataType.uniformMatrix4fv:
        gl.uniformMatrix4fv(this.position, false, data);
        break;
      case DataType.uniform3fv:
        gl.uniform3fv(this.position, data);
        break;
      case DataType.uniform1i:
        gl.uniform1i(this.position, data);
        break;
      default:
        break;
    }
  }


}

import { WebglRenderer } from "./webgl-renderer";

export enum ShaderType {
  vertex,
  fragment
}

export class GLShader {
  constructor(renderer: WebglRenderer) {
    this.renderer = renderer;
  }
  renderer: WebglRenderer
  shader: WebGLShader
  compileRawShader = (source: string, type: ShaderType): WebGLShader => {
    const gl = this.renderer.gl;
    var shader = gl.createShader(type === ShaderType.vertex ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      let log = gl.getShaderInfoLog(shader);
      if (log) {
        throw new Error(log);
      }
    }
    if (!shader) {
      throw new Error("Something went wrong while compile the shader.");
    }
    this.shader = shader;
    return shader;
  };

}
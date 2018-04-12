import { WebglRenderer } from "./webgl-renderer";
import { GLShader } from "./webgl-shader";

export class GLProgram {
  constructor(renderer: WebglRenderer, vertexShader: GLShader, fragmentShader: GLShader) {
    this.renderer = renderer;
    renderer.program.push(this);
    this.createProgram(vertexShader, fragmentShader);
  }
  renderer: WebglRenderer
  program: WebGLProgram

  createProgram(vertexShader: GLShader, fragmentShader: GLShader) {
    const gl = this.renderer.gl;
    this.program = gl.createProgram();
    gl.attachShader(this.program, vertexShader.shader);
    gl.attachShader(this.program, fragmentShader.shader);
    gl.linkProgram(this.program);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      let info = gl.getProgramInfoLog(this.program);
      throw 'Could not compile WebGL program. \n\n' + info;
    }
  }
}
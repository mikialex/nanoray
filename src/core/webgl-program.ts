
const fragmentShaderPreclude =
  `
  #ifndef GL_FRAGMENT_PRECISION_HIGH
  precision mediump float;
  precision mediump int;
  #else
  precision highp float;
  precision highp int;
  #endif
  `




export class RayWebGLProgram{
  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
  }
  public gl: WebGLRenderingContext;

  private vertexShader: string;
  private fragmentShader: string;

  private program: WebGLProgram;

  createProgram() {
    let program = this.gl.createProgram();
    this.gl.attachShader(program, this.vertexShader);
    this.gl.attachShader(program, this.fragmentShader);
    this.gl.linkProgram(program);
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      throw ("Program linking failed:" + this.gl.getProgramInfoLog(program));
    }
    this.program = program;
    return program;
  }

  

}
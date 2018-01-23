
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




export class WebGLProgram{
  constructor() {
    
  }

  private vertexShader: string;
  private fragmentShader: string;

  private program: WebGLProgram;


  

}
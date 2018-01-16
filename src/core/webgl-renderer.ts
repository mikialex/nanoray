export class WebglRenderer {
  constructor() {

  }

  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;

  compileShader(gl: WebGLRenderingContext, shaderSource, shaderType) {
    var shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw "Shader compilation failed:" + gl.getShaderInfoLog(shader);
    }
    return shader;
  }

  createProgram(gl: WebGLRenderingContext, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw ("Program linking failed:" + gl.getProgramInfoLog(program));
    }
    return program;
  }

  createProgramFromScripts(gl: WebGLRenderingContext, vertexShaderId, fragmentShaderId) {
    var vs = compileShader(gl, document.getElementById(vertexShaderId).text, gl.VERTEX_SHADER);
    var fs = compileShader(gl, document.getElementById(fragmentShaderId).text, gl.FRAGMENT_SHADER);
    return this.createProgram(gl, vs, fs);
  }

  initGL() {
    gl = this.canvas.getContext('webgl');

    //https://developer.mozilla.org/en-US/docs/Web/API/OES_texture_float
    gl.getExtension('OES_texture_float');
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    renderProgram = this.createProgramFromScripts(gl, "render-vertex-shader", "render-fragment-shader");
    renderProgram.aPositionLocation = gl.getAttribLocation(renderProgram, "aPosition");
    renderProgram.uTextureLocation = gl.getUniformLocation(renderProgram, "uTexture");
    gl.enableVertexAttribArray(renderProgram.aPositionLocation);

    tracerProgram = this.createProgramFromScripts(gl, "tracer-vertex-shader", "tracer-fragment-shader");
    tracerProgram.aPositionLocation = gl.getAttribLocation(tracerProgram, "aPosition");
    tracerProgram.uSampleLocation = gl.getUniformLocation(tracerProgram, "uSampler");
    tracerProgram.uTextureLocation = gl.getUniformLocation(tracerProgram, "uTexture");
    tracerProgram.uSeedLocation = gl.getUniformLocation(tracerProgram, "uSeed");
    tracerProgram.uOriginLocation = gl.getUniformLocation(tracerProgram, "uOrigin");
    tracerProgram.uMatrixLocation = gl.getUniformLocation(tracerProgram, "uMatrix");
    tracerProgram.uTextureWeightLocation = gl.getUniformLocation(tracerProgram, "uTextureWeight");
    tracerProgram.uFocalDistance = gl.getUniformLocation(tracerProgram, "uFocalDistance");
    gl.enableVertexAttribArray(tracerProgram.aPositionLocation);
  }

}
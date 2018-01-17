export class WebglRenderer {
  constructor() {

  }

  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;

  compileShader(gl: WebGLRenderingContext, shaderSource:string, shaderType:number) {
    var shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw "Shader compilation failed:" + gl.getShaderInfoLog(shader);
    }
    return shader;
  }

  createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
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

  render() {
  window.requestAnimationFrame(render);

  // stats.begin();

  fpsCamera.update(1.0, 0.1);

  gl.useProgram(tracerProgram);
  gl.uniform1f(tracerProgram.uSeedLocation, Math.random());
  gl.uniform1f(tracerProgram.uTextureWeightLocation, sampleCount / ++sampleCount);
  gl.uniform3fv(tracerProgram.uOriginLocation, camera.eye);
  gl.uniformMatrix4fv(tracerProgram.uMatrixLocation, gl.FALSE, camera.matrix);
  gl.uniform1i(tracerProgram.uSampleLocation, 0);
  gl.uniform1i(tracerProgram.uTextureLocation, 1);
  gl.uniform1f(tracerProgram.uFocalDistance, focalDistance);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, sceneTexture);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, textures[0]);
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textures[1], 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(tracerProgram.aPositionLocation, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  textures.reverse();

  gl.useProgram(renderProgram);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, textures[0]);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(renderProgram.aPositionLocation, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  // stats.end();
}

}
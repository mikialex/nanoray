import { Camera } from "./camera";
declare var require: any;
const renderVertexShader = require('../shader/vertex/render.glsl');
const renderFragmenShader = require('../shader/fragment/render.glsl');
const tracerVertexShader = require('../shader/vertex/tracer.glsl');
const tracerFragmentShader = require('../shader/fragment/tracer.glsl');

export class WebglRenderer {
  constructor() {

  }

  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;

  vertexBuffer: WebGLBuffer;
  framebuffer: WebGLBuffer;
  tracerProgram: WebGLProgram;
  renderProgram: WebGLProgram;
  sceneTexture: WebGLTexture;
  textures: Array<WebGLTexture> = [];
  sampleCount = 0;
  focalDistance = 2.0;

  render_aPositionLocation: number;
  render_uTextureLocation: WebGLUniformLocation;
  tracer_aPositionLocation: number;
  tracer_uSampleLocation: WebGLUniformLocation;
  tracer_uTextureLocation: WebGLUniformLocation;
  tracer_uSeedLocation: WebGLUniformLocation;
  tracer_uOriginLocation: WebGLUniformLocation;
  tracer_uMatrixLocation: WebGLUniformLocation;
  tracer_uTextureWeightLocation: WebGLUniformLocation;
  tracer_uFocalDistance: WebGLUniformLocation;

  compileShader(gl: WebGLRenderingContext, shaderSource: string, shaderType: number) {
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

  createProgramFromScripts(gl: WebGLRenderingContext, vertexShaderStr: string, fragmentShaderStr: string) {
    var vs = this.compileShader(gl, vertexShaderStr, gl.VERTEX_SHADER);
    var fs = this.compileShader(gl, fragmentShaderStr, gl.FRAGMENT_SHADER);
    return this.createProgram(gl, vs, fs);
  }

  createTexture(gl: WebGLRenderingContext, width: number, height: number, format: number, type: number, data: ArrayBufferView) {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, format, width, height, 0, format, type, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return texture;
  }

  initGL(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.gl = this.canvas.getContext('webgl');

    //https://developer.mozilla.org/en-US/docs/Web/API/OES_texture_float
    this.gl.getExtension('OES_texture_float');
    this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);

    this.renderProgram = this.createProgramFromScripts(this.gl, renderVertexShader, renderFragmenShader);
    this.render_aPositionLocation = this.gl.getAttribLocation(this.renderProgram, "aPosition");
    this.render_uTextureLocation = this.gl.getUniformLocation(this.renderProgram, "uTexture");
    this.gl.enableVertexAttribArray(this.render_aPositionLocation);

    this.tracerProgram = this.createProgramFromScripts(this.gl, tracerVertexShader, tracerFragmentShader);
    this.tracer_aPositionLocation = this.gl.getAttribLocation(this.tracerProgram, "aPosition");
    this.tracer_uSampleLocation = this.gl.getUniformLocation(this.tracerProgram, "uSampler");
    this.tracer_uTextureLocation = this.gl.getUniformLocation(this.tracerProgram, "uTexture");
    this.tracer_uSeedLocation = this.gl.getUniformLocation(this.tracerProgram, "uSeed");
    this.tracer_uOriginLocation = this.gl.getUniformLocation(this.tracerProgram, "uOrigin");
    this.tracer_uMatrixLocation = this.gl.getUniformLocation(this.tracerProgram, "uMatrix");
    this.tracer_uTextureWeightLocation = this.gl.getUniformLocation(this.tracerProgram, "uTextureWeight");
    this.tracer_uFocalDistance = this.gl.getUniformLocation(this.tracerProgram, "uFocalDistance");
    this.gl.enableVertexAttribArray(this.tracer_aPositionLocation);

    this.framebuffer = this.gl.createFramebuffer();

    this.vertexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER,
      new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0]), this.gl.STATIC_DRAW);
    this.load();
  }




  load() {
    let ars = [-2.5, 9.25, -2.5, 0.0, 2.50, 9.75, 2.5, 0.0, 0.0, 0.0, 0.0, 0.0, 4.95, 4.95, 4.90, 0.0,
    -6.0, -0.25, -6.0, 0.0, 6.00, 0.00, 6.00, 0.0, 0.98, 0.96, 0.95, 0.0, 0.0, 0.0, 0.0, 0.0,
    -6.0, 0.00, -6.0, 0.0, -5.75, 10.0, 6.00, 0.0, 0.98, 0.11, 0.11, 0.0, 0.0, 0.0, 0.0, 0.0,
      5.75, 0.00, -6.0, 0.0, 6.00, 10.0, 6.00, 0.0, 0.11, 0.96, 0.11, 0.0, 0.0, 0.0, 0.0, 0.0,
    -6.0, 0.00, -6.0, 0.0, 6.00, 10.0, -5.75, 0.0, 0.11, 0.11, 0.95, 0.0, 0.0, 0.0, 0.0, 0.0,
    -6.0, 9.75, -6.0, 0.0, 6.00, 10.0, 6.0, 0.0, 0.95, 0.95, 0.95, 0.0, 0.0, 0.0, 0.0, 0.0,
    -4.8884, 0.9438, 4.3047, 0.0, -3.2175, 0.9672, 4.7171, 0.0, 0.8079, 0.7742, 0.7772, 0.0, 0.0, 0.0, 0.0, 0.0,
      1.2155, 1.9332, 4.1487, 0.0, 1.9990, 2.1517, 4.9285, 0.0, 0.8344, 0.8135, 0.9842, 0.0, 0.0, 0.0, 0.0, 0.0,
      0.6696, 0.4090, -3.0291, 0.0, 1.1314, 1.7304, -1.0926, 0.0, 0.8084, 0.8448, 0.8999, 0.0, 0.0, 0.0, 0.0, 0.0,
    -0.2099, 1.7601, -2.1734, 0.0, 0.6790, 3.5146, -0.5156, 0.0, 0.7688, 0.9017, 0.7752, 0.0, 0.0, 0.0, 0.0, 0.0,
      4.4918, 1.6187, 3.9845, 0.0, 5.2070, 1.6217, 5.4813, 0.0, 0.7585, 0.7591, 0.9039, 0.0, 0.0, 0.0, 0.0, 0.0,
    -2.4885, 0.6684, 2.2240, 0.0, -1.3027, 1.3663, 3.2155, 0.0, 0.8799, 0.8083, 0.7553, 0.0, 0.0, 0.0, 0.0, 0.0,
    -2.7202, 0.1569, -4.6699, 0.0, -1.4223, 0.4250, -3.1171, 0.0, 0.8791, 0.9136, 0.9615, 0.0, 0.0, 0.0, 0.0, 0.0,
    -3.6977, 0.3360, 1.7127, 0.0, -3.5931, 1.1968, 2.7514, 0.0, 0.8642, 0.9097, 0.9653, 0.0, 0.0, 0.0, 0.0, 0.0,
    -4.9988, 0.4070, -1.2279, 0.0, -3.1323, 1.4978, -0.3877, 0.0, 0.8354, 0.7684, 0.9235, 0.0, 0.0, 0.0, 0.0, 0.0,
      2.6933, 0.3583, -4.7250, 0.0, 2.9540, 1.4425, -3.1683, 0.0, 0.7759, 0.9237, 0.8485, 0.0, 0.0, 0.0, 0.0, 0.0,
    -3.3556, 0.8372, 0.1274, 0.0, -1.6361, 2.1600, 1.4404, 0.0, 0.8133, 0.8919, 0.7686, 0.0, 0.0, 0.0, 0.0, 0.0,
    -1.5279, 1.3853, 1.9451, 0.0, -0.5163, 1.4883, 3.8063, 0.0, 0.8701, 0.9644, 0.7799, 0.0, 0.0, 0.0, 0.0, 0.0,
    -1.8864, 0.0514, 3.8656, 0.0, -1.4495, 1.7500, 5.6893, 0.0, 0.8819, 0.9008, 0.8108, 0.0, 0.0, 0.0, 0.0, 0.0,
      1.9946, 1.0934, -2.4594, 0.0, 2.7050, 1.2595, -1.0017, 0.0, 0.8189, 0.8470, 0.7967, 0.0, 0.0, 0.0, 0.0, 0.0,
    -4.5562, 0.6591, 3.5972, 0.0, -4.3863, 0.9523, 4.1893, 0.0, 0.8198, 0.9312, 0.8017, 0.0, 0.0, 0.0, 0.0, 0.0,
    -0.7357, 0.9370, -4.1798, 0.0, 0.3768, 2.0961, -3.7460, 0.0, 0.7781, 0.9312, 0.7859, 0.0, 0.0, 0.0, 0.0, 0.0,
    -1.8124, 0.6097, -2.6622, 0.0, -0.1962, 2.1262, -1.2709, 0.0, 0.9756, 0.7885, 0.8154, 0.0, 0.0, 0.0, 0.0, 0.0,
    -4.7429, 1.4883, -1.4831, 0.0, -3.0640, 3.4726, -0.1590, 0.0, 0.7621, 0.9639, 0.7776, 0.0, 0.0, 0.0, 0.0, 0.0,
    -1.6244, 1.4063, 1.3717, 0.0, -1.4551, 3.3293, 2.7592, 0.0, 0.8340, 0.8413, 0.9413, 0.0, 0.0, 0.0, 0.0, 0.0,
      2.6098, 1.5540, -2.7852, 0.0, 4.4415, 2.6538, -1.8009, 0.0, 0.8577, 0.8482, 0.8286, 0.0, 0.0, 0.0, 0.0, 0.0,
      3.9410, 0.4234, 2.0108, 0.0, 4.9422, 1.5542, 3.1677, 0.0, 0.9356, 0.8159, 0.9979, 0.0, 0.0, 0.0, 0.0, 0.0,
      4.8600, 0.2409, -3.2157, 0.0, 5.3004, 1.3446, -2.6498, 0.0, 0.9035, 0.9144, 0.8291, 0.0, 0.0, 0.0, 0.0, 0.0,
      2.1441, 0.3811, -0.7159, 0.0, 4.1392, 0.7279, -0.1898, 0.0, 0.9178, 0.7582, 0.8913, 0.0, 0.0, 0.0, 0.0, 0.0,
    -4.4011, 1.5791, 1.4743, 0.0, -4.1392, 3.4521, 2.9430, 0.0, 0.9369, 0.7979, 0.9896, 0.0, 0.0, 0.0, 0.0, 0.0,
    -3.6750, 1.8329, 3.2574, 0.0, -2.8801, 3.7302, 3.7498, 0.0, 0.9572, 0.9556, 0.9235, 0.0, 0.0, 0.0, 0.0, 0.0,
    -1.7772, 0.9417, -0.3841, 0.0, -0.4311, 1.1049, 1.1686, 0.0, 0.7622, 0.9839, 0.8235, 0.0, 0.0, 0.0, 0.0, 0.0,
      2.6714, 1.0744, -4.3868, 0.0, 3.9744, 1.6687, -3.4645, 0.0, 0.9162, 0.9139, 0.7767, 0.0, 0.0, 0.0, 0.0, 0.0,
    -2.9935, 0.2222, -4.6232, 0.0, -1.2154, 1.7582, -4.3809, 0.0, 0.9235, 0.9024, 0.8032, 0.0, 0.0, 0.0, 0.0, 0.0,
      0.3143, 1.8736, -3.8087, 0.0, 1.3016, 3.5159, -3.0918, 0.0, 0.7750, 0.8400, 0.9310, 0.0, 0.0, 0.0, 0.0, 0.0,
    -2.5042, 0.9942, -2.0096, 0.0, -1.6642, 2.4788, -0.9306, 0.0, 0.9357, 0.8053, 0.9345, 0.0, 0.0, 0.0, 0.0, 0.0,
      4.9826, 0.8764, -4.5216, 0.0, 5.0776, 1.3555, -3.1181, 0.0, 0.8057, 0.9616, 0.8061, 0.0, 0.0, 0.0, 0.0, 0.0,
    -3.0357, 1.4890, 2.5575, 0.0, -2.2004, 1.7139, 2.9921, 0.0, 0.8511, 0.8391, 0.8151, 0.0, 0.0, 0.0, 0.0, 0.0,
      4.4391, 1.8939, -0.3021, 0.0, 4.7463, 3.1197, 0.8862, 0.0, 0.8147, 0.7905, 0.8436, 0.0, 0.0, 0.0, 0.0, 0.0,
    -1.3821, 0.4704, 4.6827, 0.0, 0.4726, 1.4747, 4.9332, 0.0, 0.9042, 0.9622, 0.9633, 0.0, 0.0, 0.0, 0.0, 0.0,
    -0.9906, 0.4310, 1.7783, 0.0, -0.4937, 1.2405, 2.6354, 0.0, 0.8569, 0.7948, 0.8825, 0.0, 0.0, 0.0, 0.0, 0.0,
      4.4325, 1.8159, -0.0048, 0.0, 5.8359, 2.8698, 0.0174, 0.0, 0.8333, 0.9809, 0.8324, 0.0, 0.0, 0.0, 0.0, 0.0,
      2.2482, 0.5016, 4.2097, 0.0, 2.5304, 2.0761, 4.7603, 0.0, 0.9864, 0.9798, 0.7759, 0.0, 0.0, 0.0, 0.0, 0.0,
    -1.4974, 0.1071, -2.5000, 0.0, 0.3072, 1.9274, -2.4956, 0.0, 0.9595, 0.8289, 0.8990, 0.0, 0.0, 0.0, 0.0, 0.0,
      3.3698, 0.5413, 3.8859, 0.0, 3.5560, 0.6128, 3.8908, 0.0, 0.8997, 0.9099, 0.8730, 0.0, 0.0, 0.0, 0.0, 0.0,
      2.3872, 1.3269, -1.9325, 0.0, 4.2181, 2.5110, -0.8463, 0.0, 0.8635, 0.8278, 0.7559, 0.0, 0.0, 0.0, 0.0, 0.0,
      0.9014, 1.6745, 2.8760, 0.0, 1.8249, 2.8202, 4.1703, 0.0, 0.7720, 0.8626, 0.9829, 0.0, 0.0, 0.0, 0.0, 0.0,
      1.7946, 1.3205, -4.2132, 0.0, 1.8127, 2.2739, -2.7559, 0.0, 0.8395, 0.8301, 0.9506, 0.0, 0.0, 0.0, 0.0, 0.0,
    -0.6123, 1.9971, 1.3686, 0.0, 0.3162, 2.7540, 2.3581, 0.0, 0.9198, 0.8045, 0.9247, 0.0, 0.0, 0.0, 0.0, 0.0,
      2.5917, 1.1150, -3.1565, 0.0, 4.0358, 1.5402, -1.8596, 0.0, 0.9785, 0.8101, 0.7923, 0.0, 0.0, 0.0, 0.0, 0.0,
    -3.4755, 1.8364, -0.5704, 0.0, -2.7019, 2.2108, -0.5251, 0.0, 0.8360, 0.7517, 0.7808, 0.0, 0.0, 0.0, 0.0, 0.0,
      4.7899, 1.6214, -0.9300, 0.0, 5.5767, 2.9872, -0.4880, 0.0, 0.9891, 0.9292, 0.8143, 0.0, 0.0, 0.0, 0.0, 0.0,
      1.8049, 1.4387, 0.7340, 0.0, 2.8751, 2.7719, 2.0693, 0.0, 0.8385, 0.9355, 0.8976, 0.0, 0.0, 0.0, 0.0, 0.0,
    -4.3737, 1.6107, 1.0283, 0.0, -3.4775, 2.2408, 1.9254, 0.0, 0.9114, 0.9282, 0.8853, 0.0, 0.0, 0.0, 0.0, 0.0,
      2.0616, 1.8798, 0.1498, 0.0, 3.8738, 2.4479, 0.7128, 0.0, 0.7856, 0.8781, 0.8426, 0.0, 0.0, 0.0, 0.0, 0.0,
      4.4056, 0.9949, 2.9227, 0.0, 4.9743, 1.7831, 4.9195, 0.0, 0.8879, 0.9544, 0.8426, 0.0, 0.0, 0.0, 0.0, 0.0,
    -3.8763, 1.7058, 3.8701, 0.0, -2.6264, 3.1525, 4.4597, 0.0, 0.9397, 0.7957, 0.7717, 0.0, 0.0, 0.0, 0.0, 0.0,
      0.4768, 0.2388, 0.8921, 0.0, 1.5219, 1.4613, 2.7956, 0.0, 0.9966, 0.8009, 0.8249, 0.0, 0.0, 0.0, 0.0, 0.0,
    -0.3624, 1.3806, 0.2586, 0.0, 1.4902, 3.2406, 0.5921, 0.0, 0.8163, 0.9159, 0.8008, 0.0, 0.0, 0.0, 0.0, 0.0,
      2.1223, 0.4255, 4.6267, 0.0, 2.1558, 2.0380, 6.2717, 0.0, 0.9814, 0.9684, 0.9187, 0.0, 0.0, 0.0, 0.0, 0.0,
      1.8886, 1.0666, 1.8341, 0.0, 3.1035, 1.9769, 1.9963, 0.0, 0.9476, 0.7562, 0.9653, 0.0, 0.0, 0.0, 0.0, 0.0,
    -2.1412, 1.9813, 2.0058, 0.0, -0.7645, 2.5152, 2.2114, 0.0, 0.7832, 0.7615, 0.9675, 0.0, 0.0, 0.0, 0.0, 0.0,
    -3.1038, 0.4980, -3.1453, 0.0, -2.2750, 0.9468, -1.4658, 0.0, 0.8752, 0.7828, 0.7747, 0.0, 0.0, 0.0, 0.0, 0.0,
      4.7941, 0.6800, 1.6302, 0.0, 4.9945, 1.2557, 3.2982, 0.0, 0.8958, 0.9470, 0.8119, 0.0, 0.0, 0.0, 0.0, 0.0];

    var data = new Float32Array(ars);
    this.sceneTexture = this.createTexture(this.gl, 256, 1, this.gl.RGBA, this.gl.FLOAT, data);
    this.textures.push(this.createTexture(this.gl, this.canvas.width, this.canvas.height, this.gl.RGBA, this.gl.FLOAT, null));
    this.textures.push(this.createTexture(this.gl, this.canvas.width, this.canvas.height, this.gl.RGBA, this.gl.FLOAT, null));
  }


  camera: Camera;
  addCamera(camera: Camera) {
    this.camera = camera;
    this.camera.renderer = this;
    this.camera.controler.renderer = this;
  }


  render() {
    this.camera.controler.update(1.0, 0.1);
    window.requestAnimationFrame((this.render).bind(this));
    this.gl.useProgram(this.tracerProgram);
    this.gl.uniform1f(this.tracer_uSeedLocation, Math.random());
    this.gl.uniform1f(this.tracer_uTextureWeightLocation, this.sampleCount / ++this.sampleCount);
    this.gl.uniform3fv(this.tracer_uOriginLocation, this.camera.eye);
    this.gl.uniformMatrix4fv(this.tracer_uMatrixLocation, false, this.camera.matrix);
    this.gl.uniform1i(this.tracer_uSampleLocation, 0);
    this.gl.uniform1i(this.tracer_uTextureLocation, 1);
    this.gl.uniform1f(this.tracer_uFocalDistance, this.focalDistance);
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.sceneTexture);
    this.gl.activeTexture(this.gl.TEXTURE1);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[0]);
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.textures[1], 0);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.vertexAttribPointer(this.tracer_aPositionLocation, 2, this.gl.FLOAT, false, 0, 0);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

    this.textures.reverse();

    this.gl.useProgram(this.renderProgram);
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[0]);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.vertexAttribPointer(this.render_aPositionLocation, 2, this.gl.FLOAT, false, 0, 0);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

    // stats.end();
  }



}
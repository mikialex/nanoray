import { Camera } from "./camera";
declare var require: any;
const renderVertexShader = require('../shader/vertex/render.glsl');
const renderFragmenShader = require('../shader/fragment/render.glsl');
const tracerVertexShader = require('../shader/vertex/tracer.glsl');
const tracerFragmentShader = require('../shader/fragment/tracer.glsl');

import {ars} from '../scene/box-scene'

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
    // window.requestAnimationFrame((this.render).bind(this));
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
    window.requestAnimationFrame((this.render).bind(this));

    // stats.end();
  }



}
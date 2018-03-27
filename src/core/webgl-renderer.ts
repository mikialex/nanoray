import { Camera } from "./camera";
declare var require: any;
const renderVertexShader = require('../shader/vertex/render.glsl');
const renderFragmenShader = require('../shader/fragment/render.glsl');
const tracerVertexShader = require('../shader/vertex/tracer.glsl');
const tracerFragmentShader = require('../shader/fragment/tracer.glsl');

import {ars} from '../scene/box-scene'

import { sceneJson } from '../scene/box-scene-o'
import { triangleSceneJson } from '../scene/triangle-scene'
import { Scene } from "./scene";

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
  sceneMapTexture: WebGLTexture;
  tranglesData:WebGLTexture;

  textures: Array<WebGLTexture> = [];
  sampleCount = 0;
  focalDistance = 2.0;

  render_aPositionLocation: number;
  render_uTextureLocation: WebGLUniformLocation;
  tracer_aPositionLocation: number;

  tracer_uSampleLocation: WebGLUniformLocation;
  tracer_uTextureLocation: WebGLUniformLocation;
  tracer_uSceneMapLocation: WebGLUniformLocation;
  tracer_trianglesDataLocatioin: WebGLUniformLocation;

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

    this.tracer_uSceneMapLocation = this.gl.getUniformLocation(this.tracerProgram, "uSceneMap");
    this.tracer_trianglesDataLocatioin = this.gl.getUniformLocation(this.tracerProgram, "trianglesData");

    this.tracer_uSeedLocation = this.gl.getUniformLocation(this.tracerProgram, "uSeed"); // 随机数种子uniform
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
    let scene = new Scene();
    scene.parseSceneJson(sceneJson);
    console.log(scene);
    console.log('scene array data:', scene.toDataArray());
    console.log(scene.dataLength);

    //data length must >1024 ???  over 1024 is cutted
    let d = scene.toDataArray();
    let fill = 1024 - d.length;
    if (d.length < 1024) {
      for (let i = 0; i < fill; i++) {
        d.push(0);
      }
    }
    var data = new Float32Array(d);
  
    // const alignment = 1;
    // this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT, alignment);
    // console.log(data.length / 4)
    this.sceneTexture = this.createTexture(this.gl, data.length/4, 1, this.gl.RGBA, this.gl.FLOAT, data);
    // this.sceneMapTexture= this.createTexture(this.gl,)

    let d2 = scene.toDataMapArray();
    let fill2 = 1024 - d2.length;
    if (d2.length < 1024) {
      for (let i = 0; i < fill2; i++) {
        d2.push(0);
      }
    }
    console.log('scene map texture data', d2); 
    let mapData = new Float32Array(d2);
    this.sceneMapTexture = this.createTexture(this.gl, 256, 1, this.gl.RGBA, this.gl.FLOAT, mapData);


    this.tranglesData = this.createTexture(this.gl, 256, 1, this.gl.RGBA, this.gl.FLOAT, mapData);

    // let d = ars;
    // let fill = 1024 - d.length;
    // if (d.length < 1024) {
    //   for (let i = 0; i < fill; i++) {
    //     d.push(0);
    //   }
    // }
    // var data = new Float32Array(d);
    // this.sceneTexture = this.createTexture(this.gl, 256, 1, this.gl.RGBA, this.gl.FLOAT, data);

    this.textures.push(this.createTexture(this.gl, this.canvas.width, this.canvas.height, this.gl.RGBA, this.gl.FLOAT, null));
    this.textures.push(this.createTexture(this.gl, this.canvas.width, this.canvas.height, this.gl.RGBA, this.gl.FLOAT, null));
  }


  render(camera: Camera) {
    if (!camera.controler.renderer) {
      console.log(camera.controler)
      camera.controler.renderer = this;
    }
    camera.controler.update(1.0, 0.1);


    //运行光线跟踪着色器program
    this.gl.useProgram(this.tracerProgram);
    this.gl.uniform1f(this.tracer_uSeedLocation, Math.random()); // 随机数种子
    this.gl.uniform1f(this.tracer_uTextureWeightLocation, this.sampleCount / ++this.sampleCount);// 当前采样比重
    this.gl.uniform3fv(this.tracer_uOriginLocation, camera.eye); //相机位置
    this.gl.uniformMatrix4fv(this.tracer_uMatrixLocation, false, camera.matrix); //相机矩阵
    this.gl.uniform1i(this.tracer_uSampleLocation, 0);  //绑定至 纹理0
    this.gl.uniform1i(this.tracer_uTextureLocation, 1); //绑定至 纹理1
    this.gl.uniform1i(this.tracer_trianglesDataLocatioin, 2); //绑定至 纹理2
    this.gl.uniform1f(this.tracer_uFocalDistance, this.focalDistance); //焦距

    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.sceneTexture);//绑定场景到 0纹理

    this.gl.activeTexture(this.gl.TEXTURE1);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[0]);//绑定前一次trace结果（texture【2】）到 1纹理

    this.gl.activeTexture(this.gl.TEXTURE2);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.sceneMapTexture);//绑定前一次trace结果（texture【2】）到 1纹理

    this.gl.activeTexture(this.gl.TEXTURE3);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.tranglesData);//绑定前一次trace结果（texture【2】）到 1纹理

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer); //设置 片元着色器输出的帧缓存
    // 将帧缓存绑定到纹理texture【1】
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.textures[1], 0); 

    // 指定覆盖屏幕的两个三角形
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.vertexAttribPointer(this.tracer_aPositionLocation, 2, this.gl.FLOAT, false, 0, 0);
    //向帧缓存即纹理 draw 
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null); //解绑




    //交换缓冲区 用以显示前一次光线跟踪的结果
    this.textures.reverse();




    //运行绘制结果program
    this.gl.useProgram(this.renderProgram);
    this.gl.uniform1i(this.render_uTextureLocation, 0);  //绑定至 纹理0
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[0]); //绑定上面光线跟踪的新结果到 纹理0

    //向屏幕 draw 
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.vertexAttribPointer(this.render_aPositionLocation, 2, this.gl.FLOAT, false, 0, 0);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

    // stats.end();
  }



}
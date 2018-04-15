import { Camera } from "../camera";
declare var require: any;
let renderVertexShader = require('../../shader/vertex/render.glsl');
let renderFragmenShader = require('../../shader/fragment/render.glsl');
let tracerVertexShader = require('../../shader/vertex/tracer.glsl');
let tracerFragmentShader = require('../../shader/fragment/tracer.glsl');


import { sceneJson } from '../../scene/box-scene-o'
import { triangleSceneJson } from '../../scene/triangle-scene'
import { Scene } from "../scene";

import { test } from '../../loader/test-obj';
import { Vector3 } from "../../math/vector3";
import { GLProgram } from "./webgl-program";
import { GLAttribute } from "./webgl-attribute";
import { GLUniform, DataType } from "./webgl-uniform";
import { GLShader, ShaderType } from "./webgl-shader";
import { createTexture } from "./webgl-texture";
import { ObjFileLoader } from "../../loader/obj-loader";
import { Primitive } from "../primitive";
import { Triangle } from "../../geometry/triangle";
import { SimpleMaterial } from "../../material/simple-material";
import { BVHTree } from "../../bvh/bvh";





export class WebglRenderer {
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.gl = this.canvas.getContext('webgl2');
    console.log(this.gl);

    //https://developer.mozilla.org/en-US/docs/Web/API/OES_texture_float
    this.gl.getExtension('EXT_color_buffer_float');
    this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
  }

  canvas: HTMLCanvasElement;
  // gl: WebGLRenderingContext;
  gl: any;

  program: GLProgram[] = [];
  attributes: GLAttribute[] = [];
  uniforms: GLUniform[] = [];

  renderProgram: GLProgram;
  traceProgram: GLProgram;

  framebuffer: WebGLBuffer;


  textures: WebGLTexture[] = [];
  sampleCount = 0;
  focalDistance = 2.0;

  // attribute
  positionAttRender
  positionAttTrace

  // sample result
  uTextureRender
  uTextureTrace

  trianglesData
  utrianglesData

  bvhData
  uBvhData

  uSeed
  uOrigin
  uMatrix
  uTextureWeight
  uFocalDistance

  prepare() {
    let scene = new Scene();
    // ObjFileLoader.loadFromObjString(test, scene);
    // let dataArray = scene.toDataArray();
    // dataArray = dataArray.concat([
    //   100, 0, 0, 0,
    //   0, 100, 0, 0,
    //   0, 0, 100, 0,
    //   1, 1, 1, 1,
    //   1, 1, 1, 1
    // ]);
    // var data = new Float32Array(dataArray);


    scene.addPrimitive(new Primitive(
      new Triangle(
        new Vector3(0, 0, 0),
        new Vector3(0, 1, 0),
        new Vector3(0, 0, 1),
      ), new SimpleMaterial(new Vector3(0, 0, 0), new Vector3(0, 0, 0))));
    scene.addPrimitive(new Primitive(
      new Triangle(
        new Vector3(5, 0, 0),
        new Vector3(5, 1, 0),
        new Vector3(5, 0, 1),
      ), new SimpleMaterial(new Vector3(0, 0, 0), new Vector3(0, 0, 0))));
    scene.addPrimitive(new Primitive(
      new Triangle(
        new Vector3(5, 5, 0),
        new Vector3(5, 6, 0),
        new Vector3(5, 5, 1),
      ), new SimpleMaterial(new Vector3(0, 0, 0), new Vector3(0, 0, 0))));
    
    let testBvh = new BVHTree();
    testBvh.parseScene(scene);
    testBvh.buildBVH();
    testBvh.generateFlattenList();

    let tridataArray = testBvh.BVHTriangleToDataArray();
    console.log('triangle data in shader', tridataArray);
    let triangle = tridataArray.length / 4
    this.trianglesData = createTexture(this.gl, triangle, 1, this.gl.RGBA, this.gl.RGBA32F, this.gl.FLOAT, tridataArray);

    let bvhdataArray = testBvh.BVHToDataArray();
    console.log('bvh data in shader', bvhdataArray);
    let bvhd = bvhdataArray.length / 4
    this.bvhData = createTexture(this.gl, bvhd, 1, this.gl.RGBA, this.gl.RGBA32F, this.gl.FLOAT, bvhdataArray);

    let renderVertexS = new GLShader(this);
    renderVertexS.compileRawShader(renderVertexShader, ShaderType.vertex);
    let renderFragmentS = new GLShader(this);
    renderFragmentS.compileRawShader(renderFragmenShader, ShaderType.fragment);
    this.renderProgram = new GLProgram(this, renderVertexS, renderFragmentS);


    let traceVertexS = new GLShader(this);
    traceVertexS.compileRawShader(tracerVertexShader, ShaderType.vertex);
    let traceFragmentS = new GLShader(this);
    tracerFragmentShader = tracerFragmentShader.replace(/{#triangleNumber#}/g, triangle / 5);
    tracerFragmentShader = tracerFragmentShader.replace(/{#bvhNodeNumber#}/g, bvhd / 3);
    traceFragmentS.compileRawShader(tracerFragmentShader, ShaderType.fragment);
    this.traceProgram = new GLProgram(this, traceVertexS, traceFragmentS);


    this.positionAttRender = new GLAttribute(this, 'aPosition', this.renderProgram);
    this.positionAttTrace = new GLAttribute(this, 'aPosition', this.traceProgram);
    this.positionAttRender.setData(
      new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0]), 2
    )
    this.positionAttTrace.setData(
      new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0]), 2
    )


    this.uTextureRender = new GLUniform(this, 'uTexture', this.renderProgram);
    this.uTextureTrace = new GLUniform(this, 'uTexture', this.traceProgram);


    this.utrianglesData = new GLUniform(this, 'trianglesData', this.traceProgram);
    this.uBvhData = new GLUniform(this, 'bvhData', this.traceProgram);

    this.uSeed = new GLUniform(this, 'uSeed', this.traceProgram);
    this.uOrigin = new GLUniform(this, 'uOrigin', this.traceProgram);
    this.uMatrix = new GLUniform(this, 'uMatrix', this.traceProgram);
    this.uTextureWeight = new GLUniform(this, 'uTextureWeight', this.traceProgram);
    this.uFocalDistance = new GLUniform(this, 'uFocalDistance', this.traceProgram);

    this.framebuffer = this.gl.createFramebuffer();

    this.textures.push(createTexture(this.gl, this.canvas.width, this.canvas.height, this.gl.RGBA, this.gl.RGBA32F, this.gl.FLOAT, null));
    this.textures.push(createTexture(this.gl, this.canvas.width, this.canvas.height, this.gl.RGBA, this.gl.RGBA32F, this.gl.FLOAT, null));
  }







  render(camera: Camera) {
    if (!camera.controler.renderer) {
      console.log(camera.controler)
      camera.controler.renderer = this;
    }
    camera.controler.update(1.0, 0.1);


    //运行光线跟踪着色器program
    this.gl.useProgram(this.traceProgram.program);

    this.uSeed.setData(Math.random(), DataType.uniform1f);
    this.uTextureWeight.setData(this.sampleCount / ++this.sampleCount, DataType.uniform1f);
    this.uFocalDistance.setData(this.focalDistance, DataType.uniform1f);

    this.uOrigin.setData(camera.eye, DataType.uniform3fv);
    this.uMatrix.setData(camera.matrix, DataType.uniformMatrix4fv);

    this.uTextureTrace.setData(0, DataType.uniform1i);
    this.utrianglesData.setData(1, DataType.uniform1i);
    this.uBvhData.setData(2, DataType.uniform1i);


    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[0]);

    this.gl.activeTexture(this.gl.TEXTURE1);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.trianglesData);

    this.gl.activeTexture(this.gl.TEXTURE2);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.bvhData);

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer); //设置 片元着色器输出的帧缓存

    // 将帧缓存绑定到纹理texture【1】
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.textures[1], 0);


    //向帧缓存即纹理 draw 
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null); //解绑




    // 交换缓冲区 用以显示前一次光线跟踪的结果
    this.textures.reverse();




    //运行绘制结果program
    this.gl.useProgram(this.renderProgram.program);
    this.uTextureRender.setData(0, DataType.uniform1i);
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[0]); //绑定上面光线跟踪的新结果到 纹理0

    //向屏幕 draw 
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
  }



}



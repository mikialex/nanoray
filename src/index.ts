
//http://madebyevan.com/webgl-path-tracing/
//https://github.com/evanw/webgl-path-tracing
//https://experiments.withgoogle.com/chrome/blox-path-tracer


import { WebglRenderer } from './core/webgl-renderer'
import { Camera } from './core/camera';

window.onload = function () {
  let renderer = new WebglRenderer();
  renderer.initGL(document.getElementById('canvas') as HTMLCanvasElement);

  let camera = new Camera(Math.PI / 4.0, renderer.canvas.clientWidth / renderer.canvas.clientHeight, 1.0, 100.0);
  camera.moveTo(4.286099433898926, 3.482257127761841, 6.155584335327148);
  camera.lookAt(-0.843035936355591, 0.2343626022338867, 0.294049263000488);

  // renderer.load();
  renderer.addCamera(camera);
  renderer.render();
}


// var stats;
// var gl;
// var canvas;
// var camera;
// var fpsCamera;
// var vertexBuffer;
// var framebuffer;
// var tracerProgram;
// var renderProgram;
// var sceneTexture;
// var textures = [];
// var sampleCount = 0;
// var focalDistance = 2.0;



// function init() {
//   stats = new Stats();
//   stats.showPanel(0);
//   stats.domElement.style.position = 'absolute';
//   stats.domElement.style.left = '';
//   stats.domElement.style.top = '0px';
//   stats.domElement.style.right = '0px';
//   document.body.appendChild(stats.dom);

//   canvas = document.getElementById('glPathTracer');
//   canvas.width = 1280;
//   canvas.height = 692;

//   camera = new Camera(Math.PI / 4.0, canvas.clientWidth / canvas.clientHeight, 1.0, 100.0);
//   camera.moveTo(4.286099433898926, 3.482257127761841, 6.155584335327148);
//   camera.lookAt(-0.843035936355591, 0.2343626022338867, 0.294049263000488);

//   fpsCamera = new FreeCameraController(camera);

//   window.addEventListener("mousedown", function (e) {
//     if (e.button === 0) {
//       fpsCamera.mouseDown();
//     }
//   });

//   window.addEventListener("mouseup", function () {
//     fpsCamera.mouseUp();
//   });

//   window.addEventListener("mousemove", function (e) {
//     if (fpsCamera.mouseMove(e.clientX, e.clientY)) {
//       sampleCount = 0;
//     }
//   });

//   window.addEventListener("dblclick", function (e) {
//     var x = Math.floor(gl.drawingBufferWidth * e.clientX / e.target.clientWidth);
//     var y = Math.floor(gl.drawingBufferHeight * e.clientY / e.target.clientHeight);
//     var pixels = new Float32Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4);
//     gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
//     gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.FLOAT, pixels);
//     gl.bindFramebuffer(gl.FRAMEBUFFER, null);
//     focalDistance = pixels[((gl.drawingBufferHeight - y - 1) * gl.drawingBufferWidth + x) * 4 + 3];
//     sampleCount = 0;
//   });

//   window.addEventListener("keydown", function (e) {
//     if (fpsCamera.keyDown(String.fromCharCode(e.keyCode).toLowerCase())) {
//       sampleCount = 0;
//     }
//   });

//   window.addEventListener("keyup", function (e) {
//     if (fpsCamera.keyUp(String.fromCharCode(e.keyCode).toLowerCase())) {
//       sampleCount = 0;
//     }
//   });

//   initGL();
// }

// function initGL() {
//   gl = canvas.getContext('webgl');

//   gl.getExtension('OES_texture_float');
//   gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

//   renderProgram = createProgramFromScripts(gl, "render-vertex-shader", "render-fragment-shader");
//   renderProgram.aPositionLocation = gl.getAttribLocation(renderProgram, "aPosition");
//   renderProgram.uTextureLocation = gl.getUniformLocation(renderProgram, "uTexture");
//   gl.enableVertexAttribArray(renderProgram.aPositionLocation);

//   tracerProgram = createProgramFromScripts(gl, "tracer-vertex-shader", "tracer-fragment-shader");
//   tracerProgram.aPositionLocation = gl.getAttribLocation(tracerProgram, "aPosition");
//   tracerProgram.uSampleLocation = gl.getUniformLocation(tracerProgram, "uSampler");
//   tracerProgram.uTextureLocation = gl.getUniformLocation(tracerProgram, "uTexture");
//   tracerProgram.uSeedLocation = gl.getUniformLocation(tracerProgram, "uSeed");
//   tracerProgram.uOriginLocation = gl.getUniformLocation(tracerProgram, "uOrigin");
//   tracerProgram.uMatrixLocation = gl.getUniformLocation(tracerProgram, "uMatrix");
//   tracerProgram.uTextureWeightLocation = gl.getUniformLocation(tracerProgram, "uTextureWeight");
//   tracerProgram.uFocalDistance = gl.getUniformLocation(tracerProgram, "uFocalDistance");
//   gl.enableVertexAttribArray(tracerProgram.aPositionLocation);

//   framebuffer = gl.createFramebuffer();

//   vertexBuffer = gl.createBuffer();
//   gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
//   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0]), gl.STATIC_DRAW);

//   var ars = [-2.5, 9.25, -2.5, 0.0, 2.50, 9.75, 2.5, 0.0, 0.0, 0.0, 0.0, 0.0, 4.95, 4.95, 4.90, 0.0,
//   -6.0, -0.25, -6.0, 0.0, 6.00, 0.00, 6.00, 0.0, 0.98, 0.96, 0.95, 0.0, 0.0, 0.0, 0.0, 0.0,
//   -6.0, 0.00, -6.0, 0.0, -5.75, 10.0, 6.00, 0.0, 0.98, 0.11, 0.11, 0.0, 0.0, 0.0, 0.0, 0.0,
//     5.75, 0.00, -6.0, 0.0, 6.00, 10.0, 6.00, 0.0, 0.11, 0.96, 0.11, 0.0, 0.0, 0.0, 0.0, 0.0,
//   -6.0, 0.00, -6.0, 0.0, 6.00, 10.0, -5.75, 0.0, 0.11, 0.11, 0.95, 0.0, 0.0, 0.0, 0.0, 0.0,
//   -6.0, 9.75, -6.0, 0.0, 6.00, 10.0, 6.0, 0.0, 0.95, 0.95, 0.95, 0.0, 0.0, 0.0, 0.0, 0.0,
//   -4.8884, 0.9438, 4.3047, 0.0, -3.2175, 0.9672, 4.7171, 0.0, 0.8079, 0.7742, 0.7772, 0.0, 0.0, 0.0, 0.0, 0.0,
//     1.2155, 1.9332, 4.1487, 0.0, 1.9990, 2.1517, 4.9285, 0.0, 0.8344, 0.8135, 0.9842, 0.0, 0.0, 0.0, 0.0, 0.0,
//     0.6696, 0.4090, -3.0291, 0.0, 1.1314, 1.7304, -1.0926, 0.0, 0.8084, 0.8448, 0.8999, 0.0, 0.0, 0.0, 0.0, 0.0,
//   -0.2099, 1.7601, -2.1734, 0.0, 0.6790, 3.5146, -0.5156, 0.0, 0.7688, 0.9017, 0.7752, 0.0, 0.0, 0.0, 0.0, 0.0,
//     4.4918, 1.6187, 3.9845, 0.0, 5.2070, 1.6217, 5.4813, 0.0, 0.7585, 0.7591, 0.9039, 0.0, 0.0, 0.0, 0.0, 0.0,
//   -2.4885, 0.6684, 2.2240, 0.0, -1.3027, 1.3663, 3.2155, 0.0, 0.8799, 0.8083, 0.7553, 0.0, 0.0, 0.0, 0.0, 0.0,
//   -2.7202, 0.1569, -4.6699, 0.0, -1.4223, 0.4250, -3.1171, 0.0, 0.8791, 0.9136, 0.9615, 0.0, 0.0, 0.0, 0.0, 0.0,
//   -3.6977, 0.3360, 1.7127, 0.0, -3.5931, 1.1968, 2.7514, 0.0, 0.8642, 0.9097, 0.9653, 0.0, 0.0, 0.0, 0.0, 0.0,
//   -4.9988, 0.4070, -1.2279, 0.0, -3.1323, 1.4978, -0.3877, 0.0, 0.8354, 0.7684, 0.9235, 0.0, 0.0, 0.0, 0.0, 0.0,
//     2.6933, 0.3583, -4.7250, 0.0, 2.9540, 1.4425, -3.1683, 0.0, 0.7759, 0.9237, 0.8485, 0.0, 0.0, 0.0, 0.0, 0.0,
//   -3.3556, 0.8372, 0.1274, 0.0, -1.6361, 2.1600, 1.4404, 0.0, 0.8133, 0.8919, 0.7686, 0.0, 0.0, 0.0, 0.0, 0.0,
//   -1.5279, 1.3853, 1.9451, 0.0, -0.5163, 1.4883, 3.8063, 0.0, 0.8701, 0.9644, 0.7799, 0.0, 0.0, 0.0, 0.0, 0.0,
//   -1.8864, 0.0514, 3.8656, 0.0, -1.4495, 1.7500, 5.6893, 0.0, 0.8819, 0.9008, 0.8108, 0.0, 0.0, 0.0, 0.0, 0.0,
//     1.9946, 1.0934, -2.4594, 0.0, 2.7050, 1.2595, -1.0017, 0.0, 0.8189, 0.8470, 0.7967, 0.0, 0.0, 0.0, 0.0, 0.0,
//   -4.5562, 0.6591, 3.5972, 0.0, -4.3863, 0.9523, 4.1893, 0.0, 0.8198, 0.9312, 0.8017, 0.0, 0.0, 0.0, 0.0, 0.0,
//   -0.7357, 0.9370, -4.1798, 0.0, 0.3768, 2.0961, -3.7460, 0.0, 0.7781, 0.9312, 0.7859, 0.0, 0.0, 0.0, 0.0, 0.0,
//   -1.8124, 0.6097, -2.6622, 0.0, -0.1962, 2.1262, -1.2709, 0.0, 0.9756, 0.7885, 0.8154, 0.0, 0.0, 0.0, 0.0, 0.0,
//   -4.7429, 1.4883, -1.4831, 0.0, -3.0640, 3.4726, -0.1590, 0.0, 0.7621, 0.9639, 0.7776, 0.0, 0.0, 0.0, 0.0, 0.0,
//   -1.6244, 1.4063, 1.3717, 0.0, -1.4551, 3.3293, 2.7592, 0.0, 0.8340, 0.8413, 0.9413, 0.0, 0.0, 0.0, 0.0, 0.0,
//     2.6098, 1.5540, -2.7852, 0.0, 4.4415, 2.6538, -1.8009, 0.0, 0.8577, 0.8482, 0.8286, 0.0, 0.0, 0.0, 0.0, 0.0,
//     3.9410, 0.4234, 2.0108, 0.0, 4.9422, 1.5542, 3.1677, 0.0, 0.9356, 0.8159, 0.9979, 0.0, 0.0, 0.0, 0.0, 0.0,
//     4.8600, 0.2409, -3.2157, 0.0, 5.3004, 1.3446, -2.6498, 0.0, 0.9035, 0.9144, 0.8291, 0.0, 0.0, 0.0, 0.0, 0.0,
//     2.1441, 0.3811, -0.7159, 0.0, 4.1392, 0.7279, -0.1898, 0.0, 0.9178, 0.7582, 0.8913, 0.0, 0.0, 0.0, 0.0, 0.0,
//   -4.4011, 1.5791, 1.4743, 0.0, -4.1392, 3.4521, 2.9430, 0.0, 0.9369, 0.7979, 0.9896, 0.0, 0.0, 0.0, 0.0, 0.0,
//   -3.6750, 1.8329, 3.2574, 0.0, -2.8801, 3.7302, 3.7498, 0.0, 0.9572, 0.9556, 0.9235, 0.0, 0.0, 0.0, 0.0, 0.0,
//   -1.7772, 0.9417, -0.3841, 0.0, -0.4311, 1.1049, 1.1686, 0.0, 0.7622, 0.9839, 0.8235, 0.0, 0.0, 0.0, 0.0, 0.0,
//     2.6714, 1.0744, -4.3868, 0.0, 3.9744, 1.6687, -3.4645, 0.0, 0.9162, 0.9139, 0.7767, 0.0, 0.0, 0.0, 0.0, 0.0,
//   -2.9935, 0.2222, -4.6232, 0.0, -1.2154, 1.7582, -4.3809, 0.0, 0.9235, 0.9024, 0.8032, 0.0, 0.0, 0.0, 0.0, 0.0,
//     0.3143, 1.8736, -3.8087, 0.0, 1.3016, 3.5159, -3.0918, 0.0, 0.7750, 0.8400, 0.9310, 0.0, 0.0, 0.0, 0.0, 0.0,
//   -2.5042, 0.9942, -2.0096, 0.0, -1.6642, 2.4788, -0.9306, 0.0, 0.9357, 0.8053, 0.9345, 0.0, 0.0, 0.0, 0.0, 0.0,
//     4.9826, 0.8764, -4.5216, 0.0, 5.0776, 1.3555, -3.1181, 0.0, 0.8057, 0.9616, 0.8061, 0.0, 0.0, 0.0, 0.0, 0.0,
//   -3.0357, 1.4890, 2.5575, 0.0, -2.2004, 1.7139, 2.9921, 0.0, 0.8511, 0.8391, 0.8151, 0.0, 0.0, 0.0, 0.0, 0.0,
//     4.4391, 1.8939, -0.3021, 0.0, 4.7463, 3.1197, 0.8862, 0.0, 0.8147, 0.7905, 0.8436, 0.0, 0.0, 0.0, 0.0, 0.0,
//   -1.3821, 0.4704, 4.6827, 0.0, 0.4726, 1.4747, 4.9332, 0.0, 0.9042, 0.9622, 0.9633, 0.0, 0.0, 0.0, 0.0, 0.0,
//   -0.9906, 0.4310, 1.7783, 0.0, -0.4937, 1.2405, 2.6354, 0.0, 0.8569, 0.7948, 0.8825, 0.0, 0.0, 0.0, 0.0, 0.0,
//     4.4325, 1.8159, -0.0048, 0.0, 5.8359, 2.8698, 0.0174, 0.0, 0.8333, 0.9809, 0.8324, 0.0, 0.0, 0.0, 0.0, 0.0,
//     2.2482, 0.5016, 4.2097, 0.0, 2.5304, 2.0761, 4.7603, 0.0, 0.9864, 0.9798, 0.7759, 0.0, 0.0, 0.0, 0.0, 0.0,
//   -1.4974, 0.1071, -2.5000, 0.0, 0.3072, 1.9274, -2.4956, 0.0, 0.9595, 0.8289, 0.8990, 0.0, 0.0, 0.0, 0.0, 0.0,
//     3.3698, 0.5413, 3.8859, 0.0, 3.5560, 0.6128, 3.8908, 0.0, 0.8997, 0.9099, 0.8730, 0.0, 0.0, 0.0, 0.0, 0.0,
//     2.3872, 1.3269, -1.9325, 0.0, 4.2181, 2.5110, -0.8463, 0.0, 0.8635, 0.8278, 0.7559, 0.0, 0.0, 0.0, 0.0, 0.0,
//     0.9014, 1.6745, 2.8760, 0.0, 1.8249, 2.8202, 4.1703, 0.0, 0.7720, 0.8626, 0.9829, 0.0, 0.0, 0.0, 0.0, 0.0,
//     1.7946, 1.3205, -4.2132, 0.0, 1.8127, 2.2739, -2.7559, 0.0, 0.8395, 0.8301, 0.9506, 0.0, 0.0, 0.0, 0.0, 0.0,
//   -0.6123, 1.9971, 1.3686, 0.0, 0.3162, 2.7540, 2.3581, 0.0, 0.9198, 0.8045, 0.9247, 0.0, 0.0, 0.0, 0.0, 0.0,
//     2.5917, 1.1150, -3.1565, 0.0, 4.0358, 1.5402, -1.8596, 0.0, 0.9785, 0.8101, 0.7923, 0.0, 0.0, 0.0, 0.0, 0.0,
//   -3.4755, 1.8364, -0.5704, 0.0, -2.7019, 2.2108, -0.5251, 0.0, 0.8360, 0.7517, 0.7808, 0.0, 0.0, 0.0, 0.0, 0.0,
//     4.7899, 1.6214, -0.9300, 0.0, 5.5767, 2.9872, -0.4880, 0.0, 0.9891, 0.9292, 0.8143, 0.0, 0.0, 0.0, 0.0, 0.0,
//     1.8049, 1.4387, 0.7340, 0.0, 2.8751, 2.7719, 2.0693, 0.0, 0.8385, 0.9355, 0.8976, 0.0, 0.0, 0.0, 0.0, 0.0,
//   -4.3737, 1.6107, 1.0283, 0.0, -3.4775, 2.2408, 1.9254, 0.0, 0.9114, 0.9282, 0.8853, 0.0, 0.0, 0.0, 0.0, 0.0,
//     2.0616, 1.8798, 0.1498, 0.0, 3.8738, 2.4479, 0.7128, 0.0, 0.7856, 0.8781, 0.8426, 0.0, 0.0, 0.0, 0.0, 0.0,
//     4.4056, 0.9949, 2.9227, 0.0, 4.9743, 1.7831, 4.9195, 0.0, 0.8879, 0.9544, 0.8426, 0.0, 0.0, 0.0, 0.0, 0.0,
//   -3.8763, 1.7058, 3.8701, 0.0, -2.6264, 3.1525, 4.4597, 0.0, 0.9397, 0.7957, 0.7717, 0.0, 0.0, 0.0, 0.0, 0.0,
//     0.4768, 0.2388, 0.8921, 0.0, 1.5219, 1.4613, 2.7956, 0.0, 0.9966, 0.8009, 0.8249, 0.0, 0.0, 0.0, 0.0, 0.0,
//   -0.3624, 1.3806, 0.2586, 0.0, 1.4902, 3.2406, 0.5921, 0.0, 0.8163, 0.9159, 0.8008, 0.0, 0.0, 0.0, 0.0, 0.0,
//     2.1223, 0.4255, 4.6267, 0.0, 2.1558, 2.0380, 6.2717, 0.0, 0.9814, 0.9684, 0.9187, 0.0, 0.0, 0.0, 0.0, 0.0,
//     1.8886, 1.0666, 1.8341, 0.0, 3.1035, 1.9769, 1.9963, 0.0, 0.9476, 0.7562, 0.9653, 0.0, 0.0, 0.0, 0.0, 0.0,
//   -2.1412, 1.9813, 2.0058, 0.0, -0.7645, 2.5152, 2.2114, 0.0, 0.7832, 0.7615, 0.9675, 0.0, 0.0, 0.0, 0.0, 0.0,
//   -3.1038, 0.4980, -3.1453, 0.0, -2.2750, 0.9468, -1.4658, 0.0, 0.8752, 0.7828, 0.7747, 0.0, 0.0, 0.0, 0.0, 0.0,
//     4.7941, 0.6800, 1.6302, 0.0, 4.9945, 1.2557, 3.2982, 0.0, 0.8958, 0.9470, 0.8119, 0.0, 0.0, 0.0, 0.0, 0.0];

//   var data = new Float32Array(ars);
//   sceneTexture = createTexture(gl, 256, 1, gl.RGBA, gl.FLOAT, data);
//   textures.push(createTexture(gl, canvas.width, canvas.height, gl.RGBA, gl.FLOAT, null));
//   textures.push(createTexture(gl, canvas.width, canvas.height, gl.RGBA, gl.FLOAT, null));

//   render();
// }

// function render() {
//   window.requestAnimationFrame(render);

//   stats.begin();

//   fpsCamera.update(1.0, 0.1);

//   gl.useProgram(tracerProgram);
//   gl.uniform1f(tracerProgram.uSeedLocation, Math.random());
//   gl.uniform1f(tracerProgram.uTextureWeightLocation, sampleCount / ++sampleCount);
//   gl.uniform3fv(tracerProgram.uOriginLocation, camera.eye);
//   gl.uniformMatrix4fv(tracerProgram.uMatrixLocation, gl.FALSE, camera.matrix);
//   gl.uniform1i(tracerProgram.uSampleLocation, 0);
//   gl.uniform1i(tracerProgram.uTextureLocation, 1);
//   gl.uniform1f(tracerProgram.uFocalDistance, focalDistance);
//   gl.activeTexture(gl.TEXTURE0);
//   gl.bindTexture(gl.TEXTURE_2D, sceneTexture);
//   gl.activeTexture(gl.TEXTURE1);
//   gl.bindTexture(gl.TEXTURE_2D, textures[0]);
//   gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
//   gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textures[1], 0);
//   gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
//   gl.vertexAttribPointer(tracerProgram.aPositionLocation, 2, gl.FLOAT, false, 0, 0);
//   gl.drawArrays(gl.TRIANGLES, 0, 6);
//   gl.bindFramebuffer(gl.FRAMEBUFFER, null);

//   textures.reverse();

//   gl.useProgram(renderProgram);
//   gl.activeTexture(gl.TEXTURE0);
//   gl.bindTexture(gl.TEXTURE_2D, textures[0]);
//   gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
//   gl.vertexAttribPointer(renderProgram.aPositionLocation, 2, gl.FLOAT, false, 0, 0);
//   gl.drawArrays(gl.TRIANGLES, 0, 6);

//   stats.end();
// }

// window.onload = init;

//Reference
//http://madebyevan.com/webgl-path-tracing/
//https://github.com/evanw/webgl-path-tracing
//https://experiments.withgoogle.com/chrome/blox-path-tracer


import { WebglRenderer } from './core/webgl-renderer'
import { Camera } from './core/camera';
import { CameraControler } from './core/camera-controler';

window.onload = function () {
  let renderer = new WebglRenderer();
  renderer.initGL(document.getElementById('canvas') as HTMLCanvasElement);

  let camera = new Camera(Math.PI / 4.0, renderer.canvas.clientWidth / renderer.canvas.clientHeight, 1.0, 100.0);
  camera.moveTo(4.286099433898926, 3.482257127761841, 6.155584335327148);
  camera.lookAt(-0.843035936355591, 0.2343626022338867, 0.294049263000488);

  let cameraControler = new CameraControler(camera);
  cameraControler.mount();

  // renderer.addCamera(camera);
  renderer.render(camera);

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(camera);
  }
  animate();
}



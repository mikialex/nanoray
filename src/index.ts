
import { WebglRenderer } from './core/webgl/webgl-renderer'
import { Camera } from './core/camera';
import { CameraControler } from './core/camera-controler';

window.onload = function () {
  let renderer = new WebglRenderer(document.getElementById('canvas') as HTMLCanvasElement);
  renderer.prepare();



  let camera = new Camera(Math.PI / 4.0, renderer.canvas.clientWidth / renderer.canvas.clientHeight, 1.0, 100.0);
  camera.moveTo(18, -20, -20);

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



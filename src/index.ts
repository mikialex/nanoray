
import { WebglRenderer } from './core/webgl/webgl-renderer'
import { Camera } from './core/camera';
import { CameraControler } from './core/camera-controler';

window.onload = function () {
  let renderer = new WebglRenderer(document.getElementById('canvas') as HTMLCanvasElement);
  renderer.prepare();



  let camera = new Camera(Math.PI / 4.0, renderer.canvas.clientWidth / renderer.canvas.clientHeight, 1.0, 100.0);
  camera.moveTo(18, -20, -20);
  camera.lookAt(0, 0, 0);

  let cameraControler = new CameraControler(camera);
  cameraControler.mount();

  // renderer.addCamera(camera);
  renderer.render(camera);





  let count = 0;

  function animate() {
    requestAnimationFrame(animate);
    if (count < 1) {
      renderer.render(camera);
      // console.log('render');
      // count++;
    }
  }
  animate();





}



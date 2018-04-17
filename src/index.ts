
import { WebglRenderer } from './core/webgl/webgl-renderer'
import { Camera } from './core/camera';
import { CameraControler } from './core/camera-controler';

declare var Stats;

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


  var stats = new Stats();
  stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild(stats.dom);

  let sampleLimit = false;
  let maxSample = 1000;
  let currentSample = 0;

  function animate() {
    if (currentSample < maxSample || !sampleLimit) {
      stats.begin();
      renderer.render(camera);
      stats.end();
      // console.log('render');
      currentSample++;
    }
    requestAnimationFrame(animate);
  }
  animate();





}



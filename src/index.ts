
import { WebglRenderer } from './core/webgl/webgl-renderer'
import { Camera } from './core/camera';
import { CameraControler } from './core/camera-controler';

declare var Stats, THREE;

window.onload = function () {
  let renderer = new WebglRenderer(document.getElementById('canvas') as HTMLCanvasElement);
  let camera = new Camera(45, renderer.canvas.clientWidth / renderer.canvas.clientHeight, 0.1, 100.0);
  camera.moveTo(18, -20, -20);
  camera.lookAt(0, 0, 0);
  // let cameraControler = new CameraControler(camera);
  // cameraControler.mount(document.querySelector('#canvas'));

  var threeScene = new THREE.Scene();
  (window as any).scene = threeScene;
  var threeCamera = new THREE.PerspectiveCamera(75, 500 / 250, 0.1, 10000);
  console.log(threeCamera);
  var threeControls = new THREE.OrbitControls(threeCamera);
  var threeRenderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#three')
  });
  threeRenderer.setClearColor('rgb(250,250,255)')
  threeRenderer.setSize(500, 250);
  var geometry = new THREE.BoxGeometry(1, 1, 1);
  var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  var cube = new THREE.Mesh(geometry, material);
  threeScene.add(cube);
  var amlight = new THREE.AmbientLight(0x404040);
  threeScene.add(amlight);
  var light = new THREE.PointLight(0xffffff, 1, 100);
  light.position.set(50, 50, 50);
  threeScene.add(light)
  threeCamera.position.z = 5;


  var stats = new Stats();
  stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
  document.querySelector('.trace-container').appendChild(stats.dom);

  let isSampling = true;
  let maxSample = 1000;
  let currentSample = 0;

  function animate() {
    if (isSampling) {
      // threeRenderer.render(threeScene, threeCamera);
      stats.begin();
      renderer.render(threeCamera);
      stats.end();
      // console.log('render');
      currentSample++;
    }
    requestAnimationFrame(animate);
  }

  document.querySelector('#stop').addEventListener('click', event => {
    isSampling = false;
  })

  document.querySelector('#three').addEventListener("click", e => {
      renderer.sampleCount = 0;
  });

  document.querySelector('#file').addEventListener('change', event => {
    function getString(file: any) {
      const reader = new FileReader();
      return new Promise(function (resolve, reject) {
        reader.onload = function (e) {
          resolve((e.target as FileReader).result);
        };
        reader.readAsText(file);
      });
    }
    getString((event.target as any).files[0]).then(objstr => {
      var loader = new THREE.OBJLoader();
      let obj = loader.parse(objstr);
      // let obj = new THREE.Group();
      // var geometry = new THREE.TorusBufferGeometry(10, 3, 16, 100);
      // var material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
      // var mesh = new THREE.Mesh(geometry, material);
      // obj.add(mesh);
      renderer.prepare(threeScene, obj);
      threeScene.add(obj);
      animate();
    })

  })

}



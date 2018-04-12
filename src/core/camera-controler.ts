import { Camera } from "./camera";
import { WebglRenderer } from "./webgl/webgl-renderer";

export class CameraControler {
  constructor(camera: Camera) {
    this.camera = camera;
    camera.controler = this;
    this.lookX = camera.center[0] - camera.eye[0];
    this.lookY = camera.center[1] - camera.eye[1];
    this.lookY = camera.center[2] - camera.eye[2];
    this.length = Math.sqrt(this.lookX * this.lookX + this.lookY * this.lookY + this.lookZ * this.lookZ);
    this.lookX /= this.length;
    this.lookY /= this.length;
    this.lookZ /= this.length;
    this.yaw = Math.atan2(-this.lookX, -this.lookZ);
    this.pitch = Math.asin(this.lookY);
  }

  camera: Camera;
  renderer: WebglRenderer;
  movementMask = 0;
  lastMouseXPos = 0;
  lastMouseYPos = 0;
  dragging = false;
  lookX = 0;
  lookY = 0;
  lookZ = 0;
  length = 0;
  yaw = 0;
  pitch = 0;

  keyUp(code:string) {
    switch (code) {
      case 'w':
        this.movementMask ^= 1;
        return true;
      case 's':
        this.movementMask ^= 2;
        return true;
      case 'a':
        this.movementMask ^= 4;
        return true;
      case 'd':
        this.movementMask ^= 8;
        return true;
    }
    return false;
  }
  keyDown(code:string) {
    switch (code) {
      case 'w':
        this.movementMask |= 1;
        return true;
      case 's':
        this.movementMask |= 2;
        return true;
      case 'a':
        this.movementMask |= 4;
        return true;
      case 'd':
        this.movementMask |= 8;
        return true;
    }
    return false;
  }
  mouseDown() {
    this.dragging = true;
  }
  mouseUp() {
    this.dragging = false;
  }
  mouseMove(x:number, y:number) {
    if (this.dragging) {
      this.yaw -= 0.005 * (x - this.lastMouseXPos);
      this.pitch -= 0.005 * (y - this.lastMouseYPos);
      this.pitch = Math.max(-1.57, Math.min(this.pitch, 1.57));
      this.lookX = -Math.sin(this.yaw) * Math.cos(this.pitch);
      this.lookY = Math.sin(this.pitch);
      this.lookZ = -Math.cos(this.yaw) * Math.cos(this.pitch);
    }
    this.lastMouseXPos = x;
    this.lastMouseYPos = y;
    return this.dragging;
  }

  update(seconds: number, speed: number) {
    var x = this.camera.eye[0];
    var y = this.camera.eye[1];
    var z = this.camera.eye[2];
    var scaledSpeed = seconds * speed;
    var scalar = scaledSpeed / Math.sqrt(this.lookZ * this.lookZ + this.lookX * this.lookX);

    if ((this.movementMask & 1) == 1) {
      x += this.lookX * scaledSpeed;
      y += this.lookY * scaledSpeed;
      z += this.lookZ * scaledSpeed;
    }

    if ((this.movementMask & 2) == 2) {
      x -= this.lookX * scaledSpeed;
      y -= this.lookY * scaledSpeed;
      z -= this.lookZ * scaledSpeed;
    }

    if ((this.movementMask & 4) == 4) {
      x -= -this.lookZ * scalar;
      y -= 0.0;
      z -= this.lookX * scalar;
    }

    if ((this.movementMask & 8) == 8) {
      x += -this.lookZ * scalar;
      y += 0.0;
      z += this.lookX * scalar;
    }

    this.camera.moveTo(x, y, z);
    this.camera.lookAt(x + this.lookX, y + this.lookY, z + this.lookZ);
    this.camera.update();
    // console.log(this.camera)
  }


  mount() {
    window.addEventListener("mousedown", e => {
      if (e.button === 0) {
        this.mouseDown();
      }
    });

    window.addEventListener("mouseup", () => {
      this.mouseUp();
    });

    window.addEventListener("mousemove",  e => {
      if (this.mouseMove(e.clientX, e.clientY)) {
        this.renderer.sampleCount = 0;
      }
    });

    window.addEventListener("dblclick", e=> {
      var x = Math.floor(this.renderer.gl.drawingBufferWidth * e.clientX / (e.target as HTMLElement).clientWidth);
      var y = Math.floor(this.renderer.gl.drawingBufferHeight * e.clientY / (e.target as HTMLElement).clientHeight);
      var pixels = new Float32Array(this.renderer.gl.drawingBufferWidth * this.renderer.gl.drawingBufferHeight * 4);
      this.renderer.gl.bindFramebuffer(this.renderer.gl.FRAMEBUFFER, this.renderer.framebuffer);
      this.renderer.gl.readPixels(0, 0, this.renderer.gl.drawingBufferWidth, this.renderer.gl.drawingBufferHeight, this.renderer.gl.RGBA, this.renderer.gl.FLOAT, pixels);
      this.renderer.gl.bindFramebuffer(this.renderer.gl.FRAMEBUFFER, null);
      this.renderer.focalDistance = pixels[((this.renderer.gl.drawingBufferHeight - y - 1) * this.renderer.gl.drawingBufferWidth + x) * 4 + 3];
      this.renderer.sampleCount = 0;
    });

    window.addEventListener("keydown", e=> {
      if (this.keyDown(String.fromCharCode(e.keyCode).toLowerCase())) {
        this.renderer.sampleCount = 0;
      }
    });

    window.addEventListener("keyup", e=> {
      if (this.keyUp(String.fromCharCode(e.keyCode).toLowerCase())) {
        this.renderer.sampleCount = 0;
      }
    });
  }


}



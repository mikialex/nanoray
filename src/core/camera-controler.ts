import { Camera } from "./camera";

export class CameraControler {
  constructor(camera: Camera) {
    this.camera = camera;
  }

  camera: Camera

}

// var FreeCameraController = function (camera) {
//   var _camera = camera;
//   var _movementMask = 0;
//   var _lastMouseXPos = 0;
//   var _lastMouseYPos = 0;
//   var _dragging = false;
//   var _lookX = _camera.center[0] - _camera.eye[0];
//   var _lookY = _camera.center[1] - _camera.eye[1];
//   var _lookZ = _camera.center[2] - _camera.eye[2];
//   var len = Math.sqrt(_lookX * _lookX + _lookY * _lookY + _lookZ * _lookZ);
//   _lookX /= len;
//   _lookY /= len;
//   _lookZ /= len;
//   var _yaw = Math.atan2(-_lookX, -_lookZ);
//   var _pitch = Math.asin(_lookY);

//   return {
//     keyUp: function (code) {
//       switch (code) {
//         case 'w':
//           _movementMask ^= 1;
//           return true;
//         case 's':
//           _movementMask ^= 2;
//           return true;
//         case 'a':
//           _movementMask ^= 4;
//           return true;
//         case 'd':
//           _movementMask ^= 8;
//           return true;
//       }
//       return false;
//     },
//     keyDown: function (code) {
//       switch (code) {
//         case 'w':
//           _movementMask |= 1;
//           return true;
//         case 's':
//           _movementMask |= 2;
//           return true;
//         case 'a':
//           _movementMask |= 4;
//           return true;
//         case 'd':
//           _movementMask |= 8;
//           return true;
//       }
//       return false;
//     },
//     mouseDown: function () {
//       _dragging = true;
//     },
//     mouseUp: function () {
//       _dragging = false;
//     },
//     mouseMove: function (x, y) {
//       if (_dragging) {
//         _yaw -= 0.005 * (x - _lastMouseXPos);
//         _pitch -= 0.005 * (y - _lastMouseYPos);
//         _pitch = Math.max(-1.57, Math.min(_pitch, 1.57));
//         _lookX = -Math.sin(_yaw) * Math.cos(_pitch);
//         _lookY = Math.sin(_pitch);
//         _lookZ = -Math.cos(_yaw) * Math.cos(_pitch);
//       }
//       _lastMouseXPos = x;
//       _lastMouseYPos = y;
//       return _dragging;
//     },
//     update: function (seconds, speed) {
//       var x = _camera.eye[0];
//       var y = _camera.eye[1];
//       var z = _camera.eye[2];
//       var scaledSpeed = seconds * speed;
//       var scalar = scaledSpeed / Math.sqrt(_lookZ * _lookZ + _lookX * _lookX);

//       if ((_movementMask & 1) == 1) {
//         x += _lookX * scaledSpeed;
//         y += _lookY * scaledSpeed;
//         z += _lookZ * scaledSpeed;
//       }

//       if ((_movementMask & 2) == 2) {
//         x -= _lookX * scaledSpeed;
//         y -= _lookY * scaledSpeed;
//         z -= _lookZ * scaledSpeed;
//       }

//       if ((_movementMask & 4) == 4) {
//         x -= -_lookZ * scalar;
//         y -= 0.0;
//         z -= _lookX * scalar;
//       }

//       if ((_movementMask & 8) == 8) {
//         x += -_lookZ * scalar;
//         y += 0.0;
//         z += _lookX * scalar;
//       }

//       _camera.moveTo(x, y, z);
//       _camera.lookAt(x + _lookX, y + _lookY, z + _lookZ);
//       _camera.update();
//     }
//   }
// };
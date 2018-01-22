var GL = function () {
  function t() {
    x.MODELVIEW = 1 | y, x.PROJECTION = 2 | y;
    var t = new a,
      e = new a;
    x.modelviewMatrix = new a, x.projectionMatrix = new a;
    var r, n, i = [],
      o = [];
    x.matrixMode = function (t) {
      switch (t) {
        case x.MODELVIEW:
          r = "modelviewMatrix", n = i;
          break;
        case x.PROJECTION:
          r = "projectionMatrix", n = o;
          break;
        default:
          throw Error("invalid matrix mode " + t)
      }
    }, x.loadIdentity = function () {
      a.identity(x[r])
    }, x.loadMatrix = function (t) {
      t = t.m;
      for (var e = x[r].m, n = 0; 16 > n; n++) e[n] = t[n]
    }, x.multMatrix = function (t) {
      x.loadMatrix(a.multiply(x[r], t, e))
    }, x.perspective = function (e, r, n, i) {
      x.multMatrix(a.perspective(e, r, n, i, t))
    }, x.frustum = function (e, r, n, i, o, s) {
      x.multMatrix(a.frustum(e, r, n, i, o, s, t))
    }, x.ortho = function (e, r, n, i, o, s) {
      x.multMatrix(a.ortho(e, r, n, i, o, s, t))
    }, x.scale = function (e, r, n) {
      x.multMatrix(a.scale(e, r, n, t))
    }, x.translate = function (e, r, n) {
      x.multMatrix(a.translate(e, r, n, t))
    }, x.rotate = function (e, r, n, i) {
      x.multMatrix(a.rotate(e, r, n, i, t))
    }, x.lookAt = function (e, r, n, i, o, s, u, f, l) {
      x.multMatrix(a.lookAt(e, r, n, i, o, s, u, f, l, t))
    }, x.pushMatrix = function () {
      n.push(Array.prototype.slice.call(x[r].m))
    }, x.popMatrix = function () {
      var t = n.pop();
      x[r].m = E ? new Float32Array(t) : t
    }, x.project = function (t, e, r, n, i, o) {
      return n = n || x.modelviewMatrix, i = i || x.projectionMatrix, o = o || x.getParameter(x.VIEWPORT), t = i.transformPoint(n.transformPoint(new v(t, e, r))), new v(o[0] + o[2] * (.5 * t.x + .5), o[1] + o[3] * (.5 * t.y + .5), .5 * t.z + .5)
    }, x.unProject = function (r, n, i, o, s, u) {
      return o = o || x.modelviewMatrix, s = s || x.projectionMatrix, u = u || x.getParameter(x.VIEWPORT), r = new v(2 * ((r - u[0]) / u[2]) - 1, 2 * ((n - u[1]) / u[3]) - 1, 2 * i - 1), a.inverse(a.multiply(s, o, t), e).transformPoint(r)
    }, x.matrixMode(x.MODELVIEW)
  }

  function e() {
    var t = new f({
        coords: !0,
        colors: !0,
        triangles: !1
      }),
      e = -1,
      r = [0, 0, 0, 0],
      n = [1, 1, 1, 1],
      i = new d("uniform float pointSize;varying vec4 color;varying vec4 coord;void main(){color=gl_Color;coord=gl_TexCoord;gl_Position=gl_ModelViewProjectionMatrix*gl_Vertex;gl_PointSize=pointSize;}", "uniform sampler2D texture;uniform float pointSize;uniform bool useTexture;varying vec4 color;varying vec4 coord;void main(){gl_FragColor=color;if(useTexture)gl_FragColor*=texture2D(texture,coord.xy);}");
    x.pointSize = function (t) {
      i.uniforms({
        pointSize: t
      })
    }, x.begin = function (r) {
      if (-1 != e) throw Error("mismatched gl.begin() and gl.end() calls");
      e = r, t.colors = [], t.coords = [], t.vertices = []
    }, x.color = function (t, e, r, i) {
      n = 1 == arguments.length ? t.toArray().concat(1) : [t, e, r, i || 1]
    }, x.texCoord = function (t, e) {
      r = 1 == arguments.length ? t.toArray(2) : [t, e]
    }, x.vertex = function (e, i, o) {
      t.colors.push(n), t.coords.push(r), t.vertices.push(1 == arguments.length ? e.toArray() : [e, i, o])
    }, x.end = function () {
      if (-1 == e) throw Error("mismatched gl.begin() and gl.end() calls");
      t.compile(), i.uniforms({
        useTexture: !!x.getParameter(x.TEXTURE_BINDING_2D)
      }).draw(t, e), e = -1
    }
  }

  function r() {
    function t() {
      for (var t in u)
        if (l.call(u, t) && u[t]) return !0;
      return !1
    }

    function e(e) {
      var r, n = {};
      for (r in e) n[r] = "function" == typeof e[r] ? function (t) {
        return function () {
          t.apply(e, arguments)
        }
      }(e[r]) : e[r];
      for (n.original = e, n.x = n.pageX, n.y = n.pageY, r = x.canvas; r; r = r.offsetParent) n.x -= r.offsetLeft, n.y -= r.offsetTop;
      return f ? (n.deltaX = n.x - a, n.deltaY = n.y - s) : (n.deltaX = 0, n.deltaY = 0, f = !0), a = n.x, s = n.y, n.dragging = t(), n.preventDefault = function () {
        n.original.preventDefault()
      }, n.stopPropagation = function () {
        n.original.stopPropagation()
      }, n
    }

    function r(t) {
      x = o, t = e(t), x.onmousemove && x.onmousemove(t), t.preventDefault()
    }

    function n(i) {
      x = o, u[i.which] = !1, t() || (document.removeEventListener("mousemove", r), document.removeEventListener("mouseup", n), x.canvas.addEventListener("mousemove", r), x.canvas.addEventListener("mouseup", n)), i = e(i), x.onmouseup && x.onmouseup(i), i.preventDefault()
    }

    function i() {
      f = !1
    }
    var o = x,
      a = 0,
      s = 0,
      u = {},
      f = !1,
      l = Object.prototype.hasOwnProperty;
    x.canvas.addEventListener("mousedown", function (i) {
      x = o, t() || (document.addEventListener("mousemove", r), document.addEventListener("mouseup", n), x.canvas.removeEventListener("mousemove", r), x.canvas.removeEventListener("mouseup", n)), u[i.which] = !0, i = e(i), x.onmousedown && x.onmousedown(i), i.preventDefault()
    }), x.canvas.addEventListener("mousemove", r), x.canvas.addEventListener("mouseup", n), x.canvas.addEventListener("mouseover", i), x.canvas.addEventListener("mouseout", i), document.addEventListener("contextmenu", function () {
      u = {}, f = !1
    })
  }

  function n(t) {
    return {
      8: "BACKSPACE",
      9: "TAB",
      13: "ENTER",
      16: "SHIFT",
      27: "ESCAPE",
      32: "SPACE",
      37: "LEFT",
      38: "UP",
      39: "RIGHT",
      40: "DOWN"
    }[t] || (t >= 65 && 90 >= t ? String.fromCharCode(t) : null)
  }

  function i(t, e, r) {
    t.addEventListener(e, r)
  }

  function o() {
    ! function (t) {
      x.makeCurrent = function () {
        x = t
      }
    }(x), x.animate = function () {
      function t() {
        x = n;
        var i = (new Date).getTime();
        x.onupdate && x.onupdate((i - r) / 1e3), x.ondraw && x.ondraw(), e(t), r = i
      }
      var e = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || function (t) {
          setTimeout(t, 1e3 / 60)
        },
        r = (new Date).getTime(),
        n = x;
      t()
    }, x.fullscreen = function (t) {
      function e() {
        x.canvas.width = window.innerWidth - n - i, x.canvas.height = window.innerHeight - r - o, x.viewport(0, 0, x.canvas.width, x.canvas.height), !t.camera && "camera" in t || (x.matrixMode(x.PROJECTION), x.loadIdentity(), x.perspective(t.fov || 45, x.canvas.width / x.canvas.height, t.near || .1, t.far || 1e3), x.matrixMode(x.MODELVIEW)), x.ondraw && x.ondraw()
      }
      t = t || {};
      var r = t.paddingTop || 0,
        n = t.paddingLeft || 0,
        i = t.paddingRight || 0,
        o = t.paddingBottom || 0;
      if (!document.body) throw Error("document.body doesn't exist yet (call gl.fullscreen() from window.onload() or from inside the <body> tag)");
      document.body.appendChild(x.canvas), document.body.style.overflow = "hidden", x.canvas.style.position = "absolute", x.canvas.style.left = n + "px", x.canvas.style.top = r + "px", window.addEventListener("resize", e), e()
    }
  }

  function a() {
    var t = Array.prototype.concat.apply([], arguments);
    t.length || (t = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]), this.m = E ? new Float32Array(t) : t
  }

  function s() {
    this.unique = [], this.indices = [], this.map = {}
  }

  function u(t, e) {
    this.buffer = null, this.target = t, this.type = e, this.data = []
  }

  function f(t) {
    t = t || {}, this.vertexBuffers = {}, this.indexBuffers = {}, this.addVertexBuffer("vertices", "gl_Vertex"), t.coords && this.addVertexBuffer("coords", "gl_TexCoord"), t.normals && this.addVertexBuffer("normals", "gl_Normal"), t.colors && this.addVertexBuffer("colors", "gl_Color"), "triangles" in t && !t.triangles || this.addIndexBuffer("triangles"), t.lines && this.addIndexBuffer("lines")
  }

  function l(t) {
    return new v(2 * (1 & t) - 1, (2 & t) - 1, (4 & t) / 2 - 1)
  }

  function c(t, e, r) {
    this.t = arguments.length ? t : Number.MAX_VALUE, this.hit = e, this.normal = r
  }

  function h() {
    var t = x.getParameter(x.VIEWPORT),
      e = x.modelviewMatrix.m,
      r = new v(e[0], e[4], e[8]),
      n = new v(e[1], e[5], e[9]),
      i = new v(e[2], e[6], e[10]),
      e = new v(e[3], e[7], e[11]);
    this.eye = new v(-e.dot(r), -e.dot(n), -e.dot(i)), r = t[0], n = r + t[2], i = t[1], e = i + t[3], this.ray00 = x.unProject(r, i, 1).subtract(this.eye), this.ray10 = x.unProject(n, i, 1).subtract(this.eye), this.ray01 = x.unProject(r, e, 1).subtract(this.eye), this.ray11 = x.unProject(n, e, 1).subtract(this.eye), this.viewport = t
  }

  function m(t, e, r) {
    for (; null != (result = t.exec(e));) r(result)
  }

  function d(t, e) {
    function r(t) {
      var e = document.getElementById(t);
      return e ? e.text : t
    }

    function n(t, e) {
      var r = {},
        n = /^((\s*\/\/.*\n|\s*#extension.*\n)+)[^]*$/.exec(e);
      return e = n ? n[1] + t + e.substr(n[1].length) : t + e, m(/\bgl_\w+\b/g, t, function (t) {
        t in r || (e = e.replace(RegExp("\\b" + t + "\\b", "g"), M + t), r[t] = !0)
      }), e
    }

    function i(t, e) {
      var r = x.createShader(t);
      if (x.shaderSource(r, e), x.compileShader(r), !x.getShaderParameter(r, x.COMPILE_STATUS)) throw Error("compile error: " + x.getShaderInfoLog(r));
      return r
    }
    t = r(t), e = r(e);
    var o = t + e,
      a = {};
    if (m(/\b(gl_[^;]*)\b;/g, "uniform mat3 gl_NormalMatrix;uniform mat4 gl_ModelViewMatrix;uniform mat4 gl_ProjectionMatrix;uniform mat4 gl_ModelViewProjectionMatrix;uniform mat4 gl_ModelViewMatrixInverse;uniform mat4 gl_ProjectionMatrixInverse;uniform mat4 gl_ModelViewProjectionMatrixInverse;", function (t) {
        if (t = t[1], -1 != o.indexOf(t)) {
          var e = t.replace(/[a-z_]/g, "");
          a[e] = M + t
        }
      }), -1 != o.indexOf("ftransform") && (a.MVPM = M + "gl_ModelViewProjectionMatrix"), this.usedMatrices = a, t = n("uniform mat3 gl_NormalMatrix;uniform mat4 gl_ModelViewMatrix;uniform mat4 gl_ProjectionMatrix;uniform mat4 gl_ModelViewProjectionMatrix;uniform mat4 gl_ModelViewMatrixInverse;uniform mat4 gl_ProjectionMatrixInverse;uniform mat4 gl_ModelViewProjectionMatrixInverse;attribute vec4 gl_Vertex;attribute vec4 gl_TexCoord;attribute vec3 gl_Normal;attribute vec4 gl_Color;vec4 ftransform(){return gl_ModelViewProjectionMatrix*gl_Vertex;}", t), e = n("precision highp float;uniform mat3 gl_NormalMatrix;uniform mat4 gl_ModelViewMatrix;uniform mat4 gl_ProjectionMatrix;uniform mat4 gl_ModelViewProjectionMatrix;uniform mat4 gl_ModelViewMatrixInverse;uniform mat4 gl_ProjectionMatrixInverse;uniform mat4 gl_ModelViewProjectionMatrixInverse;", e), this.program = x.createProgram(), x.attachShader(this.program, i(x.VERTEX_SHADER, t)), x.attachShader(this.program, i(x.FRAGMENT_SHADER, e)), x.linkProgram(this.program), !x.getProgramParameter(this.program, x.LINK_STATUS)) throw Error("link error: " + x.getProgramInfoLog(this.program));
    this.attributes = {}, this.uniformLocations = {};
    var s = {};
    m(/uniform\s+sampler(1D|2D|3D|Cube)\s+(\w+)\s*;/g, t + e, function (t) {
      s[t[2]] = 1
    }), this.isSampler = s
  }

  function g(t, e, r) {
    r = r || {}, this.id = x.createTexture(), this.width = t, this.height = e, this.format = r.format || x.RGBA, this.type = r.type || x.UNSIGNED_BYTE;
    var n = r.filter || r.magFilter || x.LINEAR,
      i = r.filter || r.minFilter || x.LINEAR;
    if (this.type === x.FLOAT) {
      if (!g.canUseFloatingPointTextures()) throw Error("OES_texture_float is required but not supported");
      if ((i !== x.NEAREST || n !== x.NEAREST) && !g.canUseFloatingPointLinearFiltering()) throw Error("OES_texture_float_linear is required but not supported")
    } else if (this.type === x.HALF_FLOAT_OES) {
      if (!g.canUseHalfFloatingPointTextures()) throw Error("OES_texture_half_float is required but not supported");
      if ((i !== x.NEAREST || n !== x.NEAREST) && !g.canUseHalfFloatingPointLinearFiltering()) throw Error("OES_texture_half_float_linear is required but not supported")
    }
    x.bindTexture(x.TEXTURE_2D, this.id), x.pixelStorei(x.UNPACK_FLIP_Y_WEBGL, 1), x.texParameteri(x.TEXTURE_2D, x.TEXTURE_MAG_FILTER, n), x.texParameteri(x.TEXTURE_2D, x.TEXTURE_MIN_FILTER, i), x.texParameteri(x.TEXTURE_2D, x.TEXTURE_WRAP_S, r.wrap || r.wrapS || x.CLAMP_TO_EDGE), x.texParameteri(x.TEXTURE_2D, x.TEXTURE_WRAP_T, r.wrap || r.wrapT || x.CLAMP_TO_EDGE), x.texImage2D(x.TEXTURE_2D, 0, this.format, t, e, 0, this.format, this.type, null)
  }

  function v(t, e, r) {
    this.x = t || 0, this.y = e || 0, this.z = r || 0
  }
  var x, p = {
    create: function (n) {
      n = n || {};
      var i = document.createElement("canvas");
      i.width = 800, i.height = 600, "alpha" in n || (n.alpha = !1);
      try {
        x = i.getContext("webgl", n)
      } catch (a) {}
      try {
        x = x || i.getContext("experimental-webgl", n)
      } catch (s) {}
      if (!x) throw Error("WebGL not supported");
      return x.HALF_FLOAT_OES = 36193, t(), e(), r(), o(), x
    },
    keys: {},
    Matrix: a,
    Indexer: s,
    Buffer: u,
    Mesh: f,
    HitTest: c,
    Raytracer: h,
    Shader: d,
    Texture: g,
    Vector: v
  };
  i(document, "keydown", function (t) {
    if (!t.altKey && !t.ctrlKey && !t.metaKey) {
      var e = n(t.keyCode);
      e && (p.keys[e] = !0), p.keys[t.keyCode] = !0
    }
  }), i(document, "keyup", function (t) {
    if (!t.altKey && !t.ctrlKey && !t.metaKey) {
      var e = n(t.keyCode);
      e && (p.keys[e] = !1), p.keys[t.keyCode] = !1
    }
  });
  var y = 305397760,
    E = "undefined" != typeof Float32Array;
  a.prototype = {
    inverse: function () {
      return a.inverse(this, new a)
    },
    transpose: function () {
      return a.transpose(this, new a)
    },
    multiply: function (t) {
      return a.multiply(this, t, new a)
    },
    transformPoint: function (t) {
      var e = this.m;
      return new v(e[0] * t.x + e[1] * t.y + e[2] * t.z + e[3], e[4] * t.x + e[5] * t.y + e[6] * t.z + e[7], e[8] * t.x + e[9] * t.y + e[10] * t.z + e[11]).divide(e[12] * t.x + e[13] * t.y + e[14] * t.z + e[15])
    },
    transformVector: function (t) {
      var e = this.m;
      return new v(e[0] * t.x + e[1] * t.y + e[2] * t.z, e[4] * t.x + e[5] * t.y + e[6] * t.z, e[8] * t.x + e[9] * t.y + e[10] * t.z)
    }
  }, a.inverse = function (t, e) {
    e = e || new a;
    var r = t.m,
      n = e.m;
    n[0] = r[5] * r[10] * r[15] - r[5] * r[14] * r[11] - r[6] * r[9] * r[15] + r[6] * r[13] * r[11] + r[7] * r[9] * r[14] - r[7] * r[13] * r[10], n[1] = -r[1] * r[10] * r[15] + r[1] * r[14] * r[11] + r[2] * r[9] * r[15] - r[2] * r[13] * r[11] - r[3] * r[9] * r[14] + r[3] * r[13] * r[10], n[2] = r[1] * r[6] * r[15] - r[1] * r[14] * r[7] - r[2] * r[5] * r[15] + r[2] * r[13] * r[7] + r[3] * r[5] * r[14] - r[3] * r[13] * r[6], n[3] = -r[1] * r[6] * r[11] + r[1] * r[10] * r[7] + r[2] * r[5] * r[11] - r[2] * r[9] * r[7] - r[3] * r[5] * r[10] + r[3] * r[9] * r[6], n[4] = -r[4] * r[10] * r[15] + r[4] * r[14] * r[11] + r[6] * r[8] * r[15] - r[6] * r[12] * r[11] - r[7] * r[8] * r[14] + r[7] * r[12] * r[10], n[5] = r[0] * r[10] * r[15] - r[0] * r[14] * r[11] - r[2] * r[8] * r[15] + r[2] * r[12] * r[11] + r[3] * r[8] * r[14] - r[3] * r[12] * r[10], n[6] = -r[0] * r[6] * r[15] + r[0] * r[14] * r[7] + r[2] * r[4] * r[15] - r[2] * r[12] * r[7] - r[3] * r[4] * r[14] + r[3] * r[12] * r[6], n[7] = r[0] * r[6] * r[11] - r[0] * r[10] * r[7] - r[2] * r[4] * r[11] + r[2] * r[8] * r[7] + r[3] * r[4] * r[10] - r[3] * r[8] * r[6], n[8] = r[4] * r[9] * r[15] - r[4] * r[13] * r[11] - r[5] * r[8] * r[15] + r[5] * r[12] * r[11] + r[7] * r[8] * r[13] - r[7] * r[12] * r[9], n[9] = -r[0] * r[9] * r[15] + r[0] * r[13] * r[11] + r[1] * r[8] * r[15] - r[1] * r[12] * r[11] - r[3] * r[8] * r[13] + r[3] * r[12] * r[9], n[10] = r[0] * r[5] * r[15] - r[0] * r[13] * r[7] - r[1] * r[4] * r[15] + r[1] * r[12] * r[7] + r[3] * r[4] * r[13] - r[3] * r[12] * r[5], n[11] = -r[0] * r[5] * r[11] + r[0] * r[9] * r[7] + r[1] * r[4] * r[11] - r[1] * r[8] * r[7] - r[3] * r[4] * r[9] + r[3] * r[8] * r[5], n[12] = -r[4] * r[9] * r[14] + r[4] * r[13] * r[10] + r[5] * r[8] * r[14] - r[5] * r[12] * r[10] - r[6] * r[8] * r[13] + r[6] * r[12] * r[9], n[13] = r[0] * r[9] * r[14] - r[0] * r[13] * r[10] - r[1] * r[8] * r[14] + r[1] * r[12] * r[10] + r[2] * r[8] * r[13] - r[2] * r[12] * r[9], n[14] = -r[0] * r[5] * r[14] + r[0] * r[13] * r[6] + r[1] * r[4] * r[14] - r[1] * r[12] * r[6] - r[2] * r[4] * r[13] + r[2] * r[12] * r[5], n[15] = r[0] * r[5] * r[10] - r[0] * r[9] * r[6] - r[1] * r[4] * r[10] + r[1] * r[8] * r[6] + r[2] * r[4] * r[9] - r[2] * r[8] * r[5];
    for (var r = r[0] * n[0] + r[1] * n[4] + r[2] * n[8] + r[3] * n[12], i = 0; 16 > i; i++) n[i] /= r;
    return e
  }, a.transpose = function (t, e) {
    e = e || new a;
    var r = t.m,
      n = e.m;
    return n[0] = r[0], n[1] = r[4], n[2] = r[8], n[3] = r[12], n[4] = r[1], n[5] = r[5], n[6] = r[9], n[7] = r[13], n[8] = r[2], n[9] = r[6], n[10] = r[10], n[11] = r[14], n[12] = r[3], n[13] = r[7], n[14] = r[11], n[15] = r[15], e
  }, a.multiply = function (t, e, r) {
    r = r || new a, t = t.m, e = e.m;
    var n = r.m;
    return n[0] = t[0] * e[0] + t[1] * e[4] + t[2] * e[8] + t[3] * e[12], n[1] = t[0] * e[1] + t[1] * e[5] + t[2] * e[9] + t[3] * e[13], n[2] = t[0] * e[2] + t[1] * e[6] + t[2] * e[10] + t[3] * e[14], n[3] = t[0] * e[3] + t[1] * e[7] + t[2] * e[11] + t[3] * e[15], n[4] = t[4] * e[0] + t[5] * e[4] + t[6] * e[8] + t[7] * e[12], n[5] = t[4] * e[1] + t[5] * e[5] + t[6] * e[9] + t[7] * e[13], n[6] = t[4] * e[2] + t[5] * e[6] + t[6] * e[10] + t[7] * e[14], n[7] = t[4] * e[3] + t[5] * e[7] + t[6] * e[11] + t[7] * e[15], n[8] = t[8] * e[0] + t[9] * e[4] + t[10] * e[8] + t[11] * e[12], n[9] = t[8] * e[1] + t[9] * e[5] + t[10] * e[9] + t[11] * e[13], n[10] = t[8] * e[2] + t[9] * e[6] + t[10] * e[10] + t[11] * e[14], n[11] = t[8] * e[3] + t[9] * e[7] + t[10] * e[11] + t[11] * e[15], n[12] = t[12] * e[0] + t[13] * e[4] + t[14] * e[8] + t[15] * e[12], n[13] = t[12] * e[1] + t[13] * e[5] + t[14] * e[9] + t[15] * e[13], n[14] = t[12] * e[2] + t[13] * e[6] + t[14] * e[10] + t[15] * e[14], n[15] = t[12] * e[3] + t[13] * e[7] + t[14] * e[11] + t[15] * e[15], r
  }, a.identity = function (t) {
    t = t || new a;
    var e = t.m;
    return e[0] = e[5] = e[10] = e[15] = 1, e[1] = e[2] = e[3] = e[4] = e[6] = e[7] = e[8] = e[9] = e[11] = e[12] = e[13] = e[14] = 0, t
  }, a.perspective = function (t, e, r, n, i) {
    return t = Math.tan(t * Math.PI / 360) * r, e *= t, a.frustum(-e, e, -t, t, r, n, i)
  }, a.frustum = function (t, e, r, n, i, o, s) {
    s = s || new a;
    var u = s.m;
    return u[0] = 2 * i / (e - t), u[1] = 0, u[2] = (e + t) / (e - t), u[3] = 0, u[4] = 0, u[5] = 2 * i / (n - r), u[6] = (n + r) / (n - r), u[7] = 0, u[8] = 0, u[9] = 0, u[10] = -(o + i) / (o - i), u[11] = -2 * o * i / (o - i), u[12] = 0, u[13] = 0, u[14] = -1, u[15] = 0, s
  }, a.ortho = function (t, e, r, n, i, o, s) {
    s = s || new a;
    var u = s.m;
    return u[0] = 2 / (e - t), u[1] = 0, u[2] = 0, u[3] = -(e + t) / (e - t), u[4] = 0, u[5] = 2 / (n - r), u[6] = 0, u[7] = -(n + r) / (n - r), u[8] = 0, u[9] = 0, u[10] = -2 / (o - i), u[11] = -(o + i) / (o - i), u[12] = 0, u[13] = 0, u[14] = 0, u[15] = 1, s
  }, a.scale = function (t, e, r, n) {
    n = n || new a;
    var i = n.m;
    return i[0] = t, i[1] = 0, i[2] = 0, i[3] = 0, i[4] = 0, i[5] = e, i[6] = 0, i[7] = 0, i[8] = 0, i[9] = 0, i[10] = r, i[11] = 0, i[12] = 0, i[13] = 0, i[14] = 0, i[15] = 1, n
  }, a.translate = function (t, e, r, n) {
    n = n || new a;
    var i = n.m;
    return i[0] = 1, i[1] = 0, i[2] = 0, i[3] = t, i[4] = 0, i[5] = 1, i[6] = 0, i[7] = e, i[8] = 0, i[9] = 0, i[10] = 1, i[11] = r, i[12] = 0, i[13] = 0, i[14] = 0, i[15] = 1, n
  }, a.rotate = function (t, e, r, n, i) {
    if (!t || !e && !r && !n) return a.identity(i);
    i = i || new a;
    var o = i.m,
      s = Math.sqrt(e * e + r * r + n * n);
    t *= Math.PI / 180, e /= s, r /= s, n /= s, s = Math.cos(t), t = Math.sin(t);
    var u = 1 - s;
    return o[0] = e * e * u + s, o[1] = e * r * u - n * t, o[2] = e * n * u + r * t, o[3] = 0, o[4] = r * e * u + n * t, o[5] = r * r * u + s, o[6] = r * n * u - e * t, o[7] = 0, o[8] = n * e * u - r * t, o[9] = n * r * u + e * t, o[10] = n * n * u + s, o[11] = 0, o[12] = 0, o[13] = 0, o[14] = 0, o[15] = 1, i
  }, a.lookAt = function (t, e, r, n, i, o, s, u, f, l) {
    l = l || new a;
    var c = l.m;
    return t = new v(t, e, r), n = new v(n, i, o), u = new v(s, u, f), s = t.subtract(n).unit(), u = u.cross(s).unit(), f = s.cross(u).unit(), c[0] = u.x, c[1] = u.y, c[2] = u.z, c[3] = -u.dot(t), c[4] = f.x, c[5] = f.y, c[6] = f.z, c[7] = -f.dot(t), c[8] = s.x, c[9] = s.y, c[10] = s.z, c[11] = -s.dot(t), c[12] = 0, c[13] = 0, c[14] = 0, c[15] = 1, l
  }, s.prototype = {
    add: function (t) {
      var e = JSON.stringify(t);
      return e in this.map || (this.map[e] = this.unique.length, this.unique.push(t)), this.map[e]
    }
  }, u.prototype = {
    compile: function (t) {
      for (var e = [], r = 0; r < this.data.length; r += 1e4) e = Array.prototype.concat.apply(e, this.data.slice(r, r + 1e4));
      if (r = this.data.length ? e.length / this.data.length : 0, r != Math.round(r)) throw Error("buffer elements not of consistent size, average size is " + r);
      this.buffer = this.buffer || x.createBuffer(), this.buffer.length = e.length, this.buffer.spacing = r, x.bindBuffer(this.target, this.buffer), x.bufferData(this.target, new this.type(e), t || x.STATIC_DRAW)
    }
  }, f.prototype = {
    addVertexBuffer: function (t, e) {
      (this.vertexBuffers[e] = new u(x.ARRAY_BUFFER, Float32Array)).name = t, this[t] = []
    },
    addIndexBuffer: function (t) {
      this.indexBuffers[t] = new u(x.ELEMENT_ARRAY_BUFFER, Uint16Array), this[t] = []
    },
    compile: function () {
      for (var t in this.vertexBuffers) {
        var e = this.vertexBuffers[t];
        e.data = this[e.name], e.compile()
      }
      for (var r in this.indexBuffers) e = this.indexBuffers[r], e.data = this[r], e.compile()
    },
    transform: function (t) {
      if (this.vertices = this.vertices.map(function (e) {
          return t.transformPoint(v.fromArray(e)).toArray()
        }), this.normals) {
        var e = t.inverse().transpose();
        this.normals = this.normals.map(function (t) {
          return e.transformVector(v.fromArray(t)).unit().toArray()
        })
      }
      return this.compile(), this
    },
    computeNormals: function () {
      this.normals || this.addVertexBuffer("normals", "gl_Normal");
      for (var t = 0; t < this.vertices.length; t++) this.normals[t] = new v;
      for (t = 0; t < this.triangles.length; t++) {
        var e = this.triangles[t],
          r = v.fromArray(this.vertices[e[0]]),
          n = v.fromArray(this.vertices[e[1]]),
          i = v.fromArray(this.vertices[e[2]]),
          r = n.subtract(r).cross(i.subtract(r)).unit();
        this.normals[e[0]] = this.normals[e[0]].add(r), this.normals[e[1]] = this.normals[e[1]].add(r), this.normals[e[2]] = this.normals[e[2]].add(r)
      }
      for (t = 0; t < this.vertices.length; t++) this.normals[t] = this.normals[t].unit().toArray();
      return this.compile(), this
    },
    computeWireframe: function () {
      for (var t = new s, e = 0; e < this.triangles.length; e++)
        for (var r = this.triangles[e], n = 0; n < r.length; n++) {
          var i = r[n],
            o = r[(n + 1) % r.length];
          t.add([Math.min(i, o), Math.max(i, o)])
        }
      return this.lines || this.addIndexBuffer("lines"), this.lines = t.unique, this.compile(), this
    },
    getAABB: function () {
      var t = {
        min: new v(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE)
      };
      t.max = t.min.negative();
      for (var e = 0; e < this.vertices.length; e++) {
        var r = v.fromArray(this.vertices[e]);
        t.min = v.min(t.min, r), t.max = v.max(t.max, r)
      }
      return t
    },
    getBoundingSphere: function () {
      for (var t = this.getAABB(), t = {
          center: t.min.add(t.max).divide(2),
          radius: 0
        }, e = 0; e < this.vertices.length; e++) t.radius = Math.max(t.radius, v.fromArray(this.vertices[e]).subtract(t.center).length());
      return t
    }
  }, f.plane = function (t) {
    t = t || {};
    var e = new f(t);
    for (detailX = t.detailX || t.detail || 1, detailY = t.detailY || t.detail || 1, t = 0; t <= detailY; t++)
      for (var r = t / detailY, n = 0; n <= detailX; n++) {
        var i = n / detailX;
        e.vertices.push([2 * i - 1, 2 * r - 1, 0]), e.coords && e.coords.push([i, r]), e.normals && e.normals.push([0, 0, 1]), n < detailX && t < detailY && (i = n + t * (detailX + 1), e.triangles.push([i, i + 1, i + detailX + 1]), e.triangles.push([i + detailX + 1, i + 1, i + detailX + 2]))
      }
    return e.compile(), e
  };
  var w = [
    [0, 4, 2, 6, -1, 0, 0],
    [1, 3, 5, 7, 1, 0, 0],
    [0, 1, 4, 5, 0, -1, 0],
    [2, 6, 3, 7, 0, 1, 0],
    [0, 2, 1, 3, 0, 0, -1],
    [4, 5, 6, 7, 0, 0, 1]
  ];
  f.cube = function (t) {
    t = new f(t);
    for (var e = 0; e < w.length; e++) {
      for (var r = w[e], n = 4 * e, i = 0; 4 > i; i++) t.vertices.push(l(r[i]).toArray()), t.coords && t.coords.push([1 & i, (2 & i) / 2]), t.normals && t.normals.push(r.slice(4, 7));
      t.triangles.push([n, n + 1, n + 2]), t.triangles.push([n + 2, n + 1, n + 3])
    }
    return t.compile(), t
  }, f.sphere = function (t) {
    t = t || {};
    var e = new f(t),
      r = new s;
    for (detail = t.detail || 6, t = 0; 8 > t; t++)
      for (var n = l(t), i = 0 < n.x * n.y * n.z, o = [], a = 0; a <= detail; a++) {
        for (var u = 0; a + u <= detail; u++) {
          var c = a / detail,
            h = u / detail,
            m = (detail - a - u) / detail,
            h = {
              vertex: new v(c + (c - c * c) / 2, h + (h - h * h) / 2, m + (m - m * m) / 2).unit().multiply(n).toArray()
            };
          e.coords && (h.coord = 0 < n.y ? [1 - c, m] : [m, 1 - c]), o.push(r.add(h))
        }
        if (a > 0)
          for (u = 0; a + u <= detail; u++) c = (a - 1) * (detail + 1) + (a - 1 - (a - 1) * (a - 1)) / 2 + u, h = a * (detail + 1) + (a - a * a) / 2 + u, e.triangles.push(i ? [o[c], o[h], o[c + 1]] : [o[c], o[c + 1], o[h]]), a + u < detail && e.triangles.push(i ? [o[h], o[h + 1], o[c + 1]] : [o[h], o[c + 1], o[h + 1]])
      }
    return e.vertices = r.unique.map(function (t) {
      return t.vertex
    }), e.coords && (e.coords = r.unique.map(function (t) {
      return t.coord
    })), e.normals && (e.normals = e.vertices), e.compile(), e
  }, f.load = function (t, e) {
    e = e || {}, "coords" in e || (e.coords = !!t.coords), "normals" in e || (e.normals = !!t.normals), "colors" in e || (e.colors = !!t.colors), "triangles" in e || (e.triangles = !!t.triangles), "lines" in e || (e.lines = !!t.lines);
    var r = new f(e);
    return r.vertices = t.vertices, r.coords && (r.coords = t.coords), r.normals && (r.normals = t.normals), r.colors && (r.colors = t.colors), r.triangles && (r.triangles = t.triangles), r.lines && (r.lines = t.lines), r.compile(), r
  }, c.prototype = {
    mergeWith: function (t) {
      0 < t.t && t.t < this.t && (this.t = t.t, this.hit = t.hit, this.normal = t.normal)
    }
  }, h.prototype = {
    getRayForPixel: function (t, e) {
      t = (t - this.viewport[0]) / this.viewport[2], e = 1 - (e - this.viewport[1]) / this.viewport[3];
      var r = v.lerp(this.ray00, this.ray10, t),
        n = v.lerp(this.ray01, this.ray11, t);
      return v.lerp(r, n, e).unit()
    }
  }, h.hitTestBox = function (t, e, r, n) {
    var i = r.subtract(t).divide(e),
      o = n.subtract(t).divide(e),
      a = v.min(i, o),
      i = v.max(i, o),
      a = a.max(),
      i = i.min();
    return a > 0 && i > a ? (t = t.add(e.multiply(a)), r = r.add(1e-6), n = n.subtract(1e-6), new c(a, t, new v((t.x > n.x) - (t.x < r.x), (t.y > n.y) - (t.y < r.y), (t.z > n.z) - (t.z < r.z)))) : null
  }, h.hitTestSphere = function (t, e, r, n) {
    var i = t.subtract(r),
      o = e.dot(e),
      a = 2 * e.dot(i),
      i = i.dot(i) - n * n,
      i = a * a - 4 * o * i;
    return i > 0 ? (o = (-a - Math.sqrt(i)) / (2 * o), t = t.add(e.multiply(o)), new c(o, t, t.subtract(r).divide(n))) : null
  }, h.hitTestTriangle = function (t, e, r, n, i) {
    var o = n.subtract(r),
      a = i.subtract(r);
    if (i = o.cross(a).unit(), n = i.dot(r.subtract(t)) / i.dot(e), n > 0) {
      t = t.add(e.multiply(n));
      var s = t.subtract(r);
      r = a.dot(a), e = a.dot(o);
      var a = a.dot(s),
        u = o.dot(o),
        o = o.dot(s),
        s = r * u - e * e,
        u = (u * a - e * o) / s,
        o = (r * o - e * a) / s;
      if (u >= 0 && o >= 0 && 1 >= u + o) return new c(n, t, i)
    }
    return null
  };
  var M = "LIGHTGL";
  new a, new a, d.prototype = {
    uniforms: function (t) {
      x.useProgram(this.program);
      for (var e in t) {
        var r = this.uniformLocations[e] || x.getUniformLocation(this.program, e);
        if (r) {
          this.uniformLocations[e] = r;
          var n = t[e];
          n instanceof v ? n = [n.x, n.y, n.z] : n instanceof a && (n = n.m);
          var i = Object.prototype.toString.call(n);
          if ("[object Array]" == i || "[object Float32Array]" == i) switch (n.length) {
            case 1:
              x.uniform1fv(r, new Float32Array(n));
              break;
            case 2:
              x.uniform2fv(r, new Float32Array(n));
              break;
            case 3:
              x.uniform3fv(r, new Float32Array(n));
              break;
            case 4:
              x.uniform4fv(r, new Float32Array(n));
              break;
            case 9:
              x.uniformMatrix3fv(r, !1, new Float32Array([n[0], n[3], n[6], n[1], n[4], n[7], n[2], n[5], n[8]]));
              break;
            case 16:
              x.uniformMatrix4fv(r, !1, new Float32Array([n[0], n[4], n[8], n[12], n[1], n[5], n[9], n[13], n[2], n[6], n[10], n[14], n[3], n[7], n[11], n[15]]));
              break;
            default:
              throw Error("don't know how to load uniform \"" + e + '" of length ' + n.length)
          } else {
            if (i = Object.prototype.toString.call(n), "[object Number]" != i && "[object Boolean]" != i) throw Error('attempted to set uniform "' + e + '" to invalid value ' + n);
            (this.isSampler[e] ? x.uniform1i : x.uniform1f).call(x, r, n)
          }
        }
      }
      return this
    },
    draw: function (t, e) {
      this.drawBuffers(t.vertexBuffers, t.indexBuffers[e == x.LINES ? "lines" : "triangles"], 2 > arguments.length ? x.TRIANGLES : e)
    },
    drawBuffers: function (t, e, r) {
      var n = this.usedMatrices,
        i = x.modelviewMatrix,
        o = x.projectionMatrix,
        a = n.MVMI || n.NM ? i.inverse() : null,
        s = n.PMI ? o.inverse() : null,
        u = n.MVPM || n.MVPMI ? o.multiply(i) : null,
        f = {};
      n.MVM && (f[n.MVM] = i), n.MVMI && (f[n.MVMI] = a), n.PM && (f[n.PM] = o), n.PMI && (f[n.PMI] = s), n.MVPM && (f[n.MVPM] = u), n.MVPMI && (f[n.MVPMI] = u.inverse()), n.NM && (i = a.m, f[n.NM] = [i[0], i[4], i[8], i[1], i[5], i[9], i[2], i[6], i[10]]), this.uniforms(f);
      var l, n = 0;
      for (l in t) f = t[l], i = this.attributes[l] || x.getAttribLocation(this.program, l.replace(/^(gl_.*)$/, M + "$1")), -1 != i && f.buffer && (this.attributes[l] = i, x.bindBuffer(x.ARRAY_BUFFER, f.buffer), x.enableVertexAttribArray(i), x.vertexAttribPointer(i, f.buffer.spacing, x.FLOAT, !1, 0, 0), n = f.buffer.length / f.buffer.spacing);
      for (l in this.attributes) l in t || x.disableVertexAttribArray(this.attributes[l]);
      return !n || e && !e.buffer || (e ? (x.bindBuffer(x.ELEMENT_ARRAY_BUFFER, e.buffer), x.drawElements(r, e.buffer.length, x.UNSIGNED_SHORT, 0)) : x.drawArrays(r, 0, n)), this
    }
  };
  var b, T, _;
  return g.prototype = {
    bind: function (t) {
      x.activeTexture(x.TEXTURE0 + (t || 0)), x.bindTexture(x.TEXTURE_2D, this.id)
    },
    unbind: function (t) {
      x.activeTexture(x.TEXTURE0 + (t || 0)), x.bindTexture(x.TEXTURE_2D, null)
    },
    canDrawTo: function () {
      b = b || x.createFramebuffer(), x.bindFramebuffer(x.FRAMEBUFFER, b), x.framebufferTexture2D(x.FRAMEBUFFER, x.COLOR_ATTACHMENT0, x.TEXTURE_2D, this.id, 0);
      var t = x.checkFramebufferStatus(x.FRAMEBUFFER) == x.FRAMEBUFFER_COMPLETE;
      return x.bindFramebuffer(x.FRAMEBUFFER, null), t
    },
    drawTo: function (t) {
      var e = x.getParameter(x.VIEWPORT);
      if (b = b || x.createFramebuffer(), T = T || x.createRenderbuffer(), x.bindFramebuffer(x.FRAMEBUFFER, b), x.bindRenderbuffer(x.RENDERBUFFER, T), (this.width != T.width || this.height != T.height) && (T.width = this.width, T.height = this.height, x.renderbufferStorage(x.RENDERBUFFER, x.DEPTH_COMPONENT16, this.width, this.height)), x.framebufferTexture2D(x.FRAMEBUFFER, x.COLOR_ATTACHMENT0, x.TEXTURE_2D, this.id, 0), x.framebufferRenderbuffer(x.FRAMEBUFFER, x.DEPTH_ATTACHMENT, x.RENDERBUFFER, T), x.checkFramebufferStatus(x.FRAMEBUFFER) != x.FRAMEBUFFER_COMPLETE) throw Error("Rendering to this texture is not supported (incomplete framebuffer)");
      x.viewport(0, 0, this.width, this.height), t(), x.bindFramebuffer(x.FRAMEBUFFER, null), x.bindRenderbuffer(x.RENDERBUFFER, null), x.viewport(e[0], e[1], e[2], e[3])
    },
    swapWith: function (t) {
      var e;
      e = t.id, t.id = this.id, this.id = e, e = t.width, t.width = this.width, this.width = e, e = t.height, t.height = this.height, this.height = e
    }
  }, g.fromImage = function (t, e) {
    e = e || {};
    var r = new g(t.width, t.height, e);
    try {
      x.texImage2D(x.TEXTURE_2D, 0, r.format, r.format, r.type, t)
    } catch (n) {
      if ("file:" == location.protocol) throw Error('image not loaded for security reasons (serve this page over "http://" instead)');
      throw Error("image not loaded for security reasons (image must originate from the same domain as this page or use Cross-Origin Resource Sharing)")
    }
    return e.minFilter && e.minFilter != x.NEAREST && e.minFilter != x.LINEAR && x.generateMipmap(x.TEXTURE_2D), r
  }, g.fromURL = function (t, e) {
    _ = _ || function () {
      var t = document.createElement("canvas").getContext("2d");
      t.canvas.width = t.canvas.height = 128;
      for (var e = 0; e < t.canvas.height; e += 16)
        for (var r = 0; r < t.canvas.width; r += 16) t.fillStyle = 16 & (r ^ e) ? "#FFF" : "#DDD", t.fillRect(r, e, 16, 16);
      return t.canvas
    }();
    var r = g.fromImage(_, e),
      n = new Image,
      i = x;
    return n.onload = function () {
      i.makeCurrent(), g.fromImage(n, e).swapWith(r)
    }, n.src = t, r
  }, g.canUseFloatingPointTextures = function () {
    return !!x.getExtension("OES_texture_float")
  }, g.canUseFloatingPointLinearFiltering = function () {
    return !!x.getExtension("OES_texture_float_linear")
  }, g.canUseHalfFloatingPointTextures = function () {
    return !!x.getExtension("OES_texture_half_float")
  }, g.canUseHalfFloatingPointLinearFiltering = function () {
    return !!x.getExtension("OES_texture_half_float_linear")
  }, v.prototype = {
    negative: function () {
      return new v(-this.x, -this.y, -this.z)
    },
    add: function (t) {
      return t instanceof v ? new v(this.x + t.x, this.y + t.y, this.z + t.z) : new v(this.x + t, this.y + t, this.z + t)
    },
    subtract: function (t) {
      return t instanceof v ? new v(this.x - t.x, this.y - t.y, this.z - t.z) : new v(this.x - t, this.y - t, this.z - t)
    },
    multiply: function (t) {
      return t instanceof v ? new v(this.x * t.x, this.y * t.y, this.z * t.z) : new v(this.x * t, this.y * t, this.z * t)
    },
    divide: function (t) {
      return t instanceof v ? new v(this.x / t.x, this.y / t.y, this.z / t.z) : new v(this.x / t, this.y / t, this.z / t)
    },
    equals: function (t) {
      return this.x == t.x && this.y == t.y && this.z == t.z
    },
    dot: function (t) {
      return this.x * t.x + this.y * t.y + this.z * t.z
    },
    cross: function (t) {
      return new v(this.y * t.z - this.z * t.y, this.z * t.x - this.x * t.z, this.x * t.y - this.y * t.x)
    },
    length: function () {
      return Math.sqrt(this.dot(this))
    },
    unit: function () {
      return this.divide(this.length())
    },
    min: function () {
      return Math.min(Math.min(this.x, this.y), this.z)
    },
    max: function () {
      return Math.max(Math.max(this.x, this.y), this.z)
    },
    toAngles: function () {
      return {
        theta: Math.atan2(this.z, this.x),
        phi: Math.asin(this.y / this.length())
      }
    },
    angleTo: function (t) {
      return Math.acos(this.dot(t) / (this.length() * t.length()))
    },
    toArray: function (t) {
      return [this.x, this.y, this.z].slice(0, t || 3)
    },
    clone: function () {
      return new v(this.x, this.y, this.z)
    },
    init: function (t, e, r) {
      return this.x = t, this.y = e, this.z = r, this
    }
  }, v.negative = function (t, e) {
    return e.x = -t.x, e.y = -t.y, e.z = -t.z, e
  }, v.add = function (t, e, r) {
    return e instanceof v ? (r.x = t.x + e.x, r.y = t.y + e.y, r.z = t.z + e.z) : (r.x = t.x + e, r.y = t.y + e, r.z = t.z + e), r
  }, v.subtract = function (t, e, r) {
    return e instanceof v ? (r.x = t.x - e.x, r.y = t.y - e.y, r.z = t.z - e.z) : (r.x = t.x - e, r.y = t.y - e, r.z = t.z - e), r
  }, v.multiply = function (t, e, r) {
    return e instanceof v ? (r.x = t.x * e.x, r.y = t.y * e.y, r.z = t.z * e.z) : (r.x = t.x * e, r.y = t.y * e, r.z = t.z * e), r
  }, v.divide = function (t, e, r) {
    return e instanceof v ? (r.x = t.x / e.x, r.y = t.y / e.y, r.z = t.z / e.z) : (r.x = t.x / e, r.y = t.y / e, r.z = t.z / e), r
  }, v.cross = function (t, e, r) {
    return r.x = t.y * e.z - t.z * e.y, r.y = t.z * e.x - t.x * e.z, r.z = t.x * e.y - t.y * e.x, r
  }, v.unit = function (t, e) {
    var r = t.length();
    return e.x = t.x / r, e.y = t.y / r, e.z = t.z / r, e
  }, v.fromAngles = function (t, e) {
    return new v(Math.cos(t) * Math.cos(e), Math.sin(e), Math.sin(t) * Math.cos(e))
  }, v.randomDirection = function () {
    return v.fromAngles(2 * Math.random() * Math.PI, Math.asin(2 * Math.random() - 1))
  }, v.min = function (t, e) {
    return new v(Math.min(t.x, e.x), Math.min(t.y, e.y), Math.min(t.z, e.z))
  }, v.max = function (t, e) {
    return new v(Math.max(t.x, e.x), Math.max(t.y, e.y), Math.max(t.z, e.z))
  }, v.lerp = function (t, e, r) {
    return e.subtract(t).multiply(r).add(t)
  }, v.fromArray = function (t) {
    return new v(t[0], t[1], t[2])
  }, v.angleBetween = function (t, e) {
    return t.angleTo(e)
  }, p
}();
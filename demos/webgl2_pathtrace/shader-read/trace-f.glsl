#version 300 es
precision highp float;
precision highp int;
precision highp sampler3D;
precision highp sampler2D;

#define EPSILON 0.000001

uniform vec2 resolution;
uniform float inseed; // Math.random()
uniform int incount;  // 当前是第几次采样

uniform mat4 MVP;  // 相机矩阵
uniform mat4 proj; // 世界矩阵

uniform sampler3D grid;
uniform sampler2D tris;
uniform vec3 bbina, bbinb; // grid 外框

vec3 bboxA, bboxB;

in vec3 origin;
out vec4 color;

uint N = ${pbrtSamples} u, i;

float seed;

float minc(const vec3 x) { 
  return min(x.x, min(x.y, x.z)); 
}

// 生成半球上均匀分布的方向 http://holger.dammertz.org/stuff/notes_HammersleyOnHemisphere.html
float random_ofs = 0.0;
vec3 cosWeightedRandomHemisphereDirectionHammersley(const vec3 n)
{
  i = (i << 16u) | (i >> 16u);
  i = ((i & 0x55555555u) << 1u) | ((i & 0xAAAAAAAAu) >> 1u);
  i = ((i & 0x33333333u) << 2u) | ((i & 0xCCCCCCCCu) >> 2u);
  i = ((i & 0x0F0F0F0Fu) << 4u) | ((i & 0xF0F0F0F0u) >> 4u);
  i = ((i & 0x00FF00FFu) << 8u) | ((i & 0xFF00FF00u) >> 8u);
  vec2 r = vec2(x, (float(i) * 2.32830643653086963e-10 * 6.2831) + random_ofs);
  vec3 uu = normalize(cross(n, vec3(1.0, 1.0, 0.0))), vv = cross(uu, n);
  float sqrtx = sqrt(r.x);
  return normalize(vec3(sqrtx * cos(r.y) * uu + sqrtx * sin(r.y) * vv + sqrt(1.0 - r.x) * n));
}

vec4 trace(inout vec3 realori, const vec3 dir){
  float len = 0.0;
  float l;
  float b;
  float mint = 1000.0;
  vec2 minuv, mintri, cpos;
  vec3 scaler = vec3(bbinb / $ { gridres } .0) / dir;
  vec3 orig = realori;
  vec3 v0, v1, v2;


  for (int i = 0; i < 150; i++){

    vec3 txc = (orig - bboxA) * bboxB;  // 判断orig是否在grid 外框中
    if (txc != clamp(txc, 0.0, 1.0))    
      break;


    vec3 tex = textureLod(grid, txc, 0.0).rgb; // origin 所在grid block

    for (int tri = 0; tri < 512; tri++){
      if (tex.b <= 0.0)  // block 内三角形数量
        break;
      cpos = tex.rg; //  当前三角形索引 ，r当前块三角形索引，g块索引
      tex.rb += vec2(3.0 / 4096.0, -1.0); // 每检测一个三角形，取下一个，三角形数目－1；

      v1 = textureLodOffset(tris, cpos, 0.0, ivec2(1, 0)).rgb; // 三角形顶点
      v2 = textureLodOffset(tris, cpos, 0.0, ivec2(2, 0)).rgb; // 三角形顶点

      vec3 P = cross(dir, v2);
      float det = dot(v1, P);
      if (det > -EPSILON) // 光线若与三角形一边平行，则不会相交
        continue;

      v0 = textureLod(tris, cpos, 0.0).rgb; // 三角形顶点

      vec3 T = realori - v0;
      float invdet = 1.0 / det;
      float u = dot(T, P) * invdet;
      if (u < 0.0 || u > 1.0)
        continue;


      vec3 Q = cross(T, v1);
      float v = dot(dir, Q) * invdet;
      if (v < 0.0 || u + v > 1.0)
        continue;

      float t = dot(v2, Q) * invdet; // t 相交距离
      if (t > EPSILON && t < mint){  // 找到相交最近距离的三角形
        mint = t;
        mintri = cpos;
        minuv = vec2(u, v);
      }
    }

    b = max(0.0, -tex.b - 1.0);  //  ?
    txc = fract(txc * $ { gridres } .0);
    // vec3 scaler = vec3(bbinb / $ { gridres } .0) / dir;
    l = minc(scaler * mix(b + 1.0 - txc, -b - txc, vec3(lessThan(dir, vec3(0.0))) )) + EPSILON * 50.0;
    len += l;

    if (mint <= len){
      realori += dir * (mint);
      mintri += vec2(0.0, 1.0 / 4.0);  // 换行准备取法线数据
      vec3 n0 = -textureLod(tris, mintri, 0.0).rgb;  // 取法线
      vec3 n1 = -textureLodOffset(tris, mintri, 0.0, ivec2(1, 0)).rgb;
      vec3 n2 = -textureLodOffset(tris, mintri, 0.0, ivec2(2, 0)).rgb;
      return vec4(normalize(n0 * (1.0 - minuv.x - minuv.y) + n1 * minuv.x + n2 * minuv.y), mint); // 返回插值后的法向量
    }

    orig += dir * l;
  }
  return vec4(0.0);
}

void main(){
  bboxA = bbina;
  bboxB = 1.0 / bbinb; 
  i = uint(incount);
  vec2 fc = vec2(gl_FragCoord.xy);
  vec2 fcu = fc / resolution;
  seed = inseed + fcu.x + fcu.y;
  vec2 aa = fract(sin(vec2(seed, seed + 0.1)) * vec2(43758.5453123, 22578.1459123)); // 随机抖动 aa 抗锯齿

  random_ofs = fract(gl_FragCoord.x * gl_FragCoord.y * inseed + aa.x) * 6.2831;

  vec4 view = proj * vec4((fc + aa) / (resolution / 2.0) - 1.0, 0.0, 1.0);
  view = normalize(MVP * vec4(view.xyz / view.w, 0.0));

  vec3 orig = origin;
  vec3 v1 = (bboxA - orig) / view.xyz;
  vec3 v2 = v1 + (bbinb - vec3(0.2)) / view.xyz,;
  vec3 far = max(v1, v2);
  vec3 near = min(v1, v2);

  float en = max(near.x, max(near.y, near.z));

  float ex = min(far.x, min(far.y, far.z));

  if (ex < 0.0 || en > ex){
    color = vec4(1.0);
    return;
  }

  orig += max(0.0, en) * view.xyz;

  vec4 hit = trace(orig, view.xyz);

  if (hit.w <= 0.0){
    color.rgb = vec3(1.0);
    return;
  }

  hit = trace(orig, -cosWeightedRandomHemisphereDirectionHammersley(hit.xyz));

  if (hit.w <= 0.0){
    color.rgb = vec3(0.8);
    return;
  }

}
#ifndef GL_FRAGMENT_PRECISION_HIGH
precision mediump float;
precision mediump int;
#else
precision highp float;
precision highp int;
#endif

#define EPSILON 0.00001

const float POSITIVE_INFINITY = 1.0 / 0.0;

const vec3 bgcolor = vec3(0.1, 0.1, 0.2);
const float width = 1280.0;
const float height = 692.0;
const float blurRadius = 0.01;

uniform vec3 uOrigin;
uniform mat4 uMatrix;
uniform sampler2D uTexture;
uniform sampler2D uSampler;
uniform sampler2D uSceneMap;
uniform float uSeed;
uniform float uTextureWeight;
uniform float uFocalDistance;

varying vec2 vTexCoords;

float seed = uSeed;

struct Box {
    vec3 min;
    vec3 max;
    vec3 rgb;
    vec3 lit;
};

const float u1 = 1.0 / 256.0;
const float u2 = 2.0 / 256.0;
const float u3 = 3.0 / 256.0;
const float u4 = 4.0 / 256.0;

Box getBox(int index) {
    float u = float(index) * u4;
    return Box(texture2D(uSampler, vec2(u, 0.0)).rgb,
              texture2D(uSampler, vec2(u + u1, 0.0)).rgb,
              texture2D(uSampler, vec2(u + u2, 0.0)).rgb,
              texture2D(uSampler, vec2(u + u3, 0.0)).rgb);
}

float Box_getIntersection(int index, vec3 origin, vec3 delta) {
    Box box = getBox(index);
    vec3 t0 = (box.min - origin) / delta;
    vec3 t1 = (box.max - origin) / delta;
    vec3 r0 = min(t0, t1);
    vec3 r1 = max(t0, t1);
    float tn = max(r0.x, max(r0.y, r0.z));
    float tf = min(r1.x, min(r1.y, r1.z));
    return (tn <= tf) && (tf > EPSILON) ? tn : POSITIVE_INFINITY;
}

vec3 Box_getPointNormal(int index, vec3 hit) {
    Box box = getBox(index);
    if (hit.x < box.min.x + EPSILON) return vec3(-1.0, 0.0, 0.0); else
    if (hit.x > box.max.x - EPSILON) return vec3(1.0, 0.0, 0.0); else
    if (hit.y < box.min.y + EPSILON) return vec3(0.0, -1.0, 0.0); else
    if (hit.y > box.max.y - EPSILON) return vec3(0.0, 1.0, 0.0); else
    if (hit.z < box.min.z + EPSILON) return vec3(0.0, 0.0, -1.0); else
                                     return vec3(0.0, 0.0, 1.0);
}


// struct Trangle {
//     vec3 p1;
//     vec3 p2;
//     vec3 p3;
// }

float general_getIntersection(int type, int index, vec3 origin, vec3 delta) {
    if(type == 1){ //box
        return Box_getIntersection(index, origin, delta);
    }
    return POSITIVE_INFINITY;
}



float rand() {
    seed += 0.1573519;
    return fract(sin(dot(gl_FragCoord.xy, vec2(12.9898 + seed, 78.2331 + seed))) * 43758.5453);
}

vec2 rand2() {
    seed += 0.3973519;
    return vec2(fract(sin(dot(gl_FragCoord.xy, vec2(12.9898 + seed, 78.2331 + seed))) * 43758.5453),
                fract(cos(dot(gl_FragCoord.yx, vec2(63.7264 + seed, 10.8731 + seed))) * 43758.5453));
}

vec3 cosineSampleHemisphere(vec3 normal) {
    float r1 = rand() * 6.283185307179586;
    float r2 = rand();
    float r3 = sqrt(r2);
    vec3 u = normalize((abs(normal.x) > 0.1) ? vec3(normal.z, 0.0, -normal.x) : vec3(0.0, -normal.z, normal.y));
    return r3 * (u * cos(r1) + cross(normal, u) * sin(r1)) + normal * sqrt(1.0 - r2);
}


bool intersect(vec3 origin, vec3 delta, out vec3 position, out vec3 normal, out vec3 diffuse, out vec3 emittance) {
    float hitResult = 1.0;
    int hitIndex;
    float t;

    // for (int i = 0; i < 64; ++i) {
    //     t = general_getIntersection(1 , i, origin, delta);
    //     if (t < hitResult) {
    //         hitResult = t;
    //         hitIndex = i;
    //     }
    // }

    for (int i = 0; i < 10; ++i) {
        float u = float(i) * u3;
        int geoId = int(texture2D(uSceneMap, vec2(u, 0.0)).r);
        int matId = int(texture2D(uSceneMap, vec2(u, 0.0)).g);
        int position = int(texture2D(uSceneMap, vec2(u, 0.0)).b);
        t = general_getIntersection(1 , i, origin, delta);
        if (t < hitResult) {
            hitResult = t;
            hitIndex = i;
        }
    }

    if (hitResult < 1.0) {
        Box box = getBox(hitIndex);
        position = origin + delta * hitResult;
        normal = Box_getPointNormal(hitIndex, position);
        diffuse = box.rgb;
        emittance = box.lit;
        return true;
    } else {
        return false;
    }
}

void main(void) {
    vec4 worldir = uMatrix * vec4(2.0 * (gl_FragCoord.xy + rand2()) / vec2(width, height) - 1.0, 1.0, 1.0);
    vec3 delta = worldir.xyz / worldir.w;
    vec3 origin = uOrigin;

    float r1 = rand() * 6.283185307179586;
    float r2 = rand();
    vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), delta));
    vec3 up = normalize(cross(delta, right)) * sin(r1) * r2 * blurRadius;
    right *= cos(r1) * r2 * blurRadius;
    vec3 p = origin + normalize(delta) * uFocalDistance;

    origin = origin + up + right;
    delta = normalize(p - origin) * 100.0;

    float dist = 100.0;
    vec3 color = vec3(0.0, 0.0, 0.0);
    vec3 reflectance = vec3(1.0, 1.0, 1.0);
    vec3 position, normal, diffuse, emittance;

    for (int depth = 0; depth < 6; ++depth) {
        if (intersect(origin, delta, position, normal, diffuse, emittance)) {
            if (depth == 0) {
              dist = length(position - origin);
            }
            color += reflectance * emittance;
            reflectance *= diffuse;
            origin = position + normal * EPSILON;
            normal = cosineSampleHemisphere(normal);
            delta = normal * 100.0;
        } else {
            color += reflectance * bgcolor;
            break;
        }
    }
    gl_FragColor = vec4(mix(color, texture2D(uTexture, vTexCoords).rgb, uTextureWeight), dist);
}

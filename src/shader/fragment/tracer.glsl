#version 300 es

#ifndef GL_FRAGMENT_PRECISION_HIGH
precision mediump float;
precision mediump int;
#else
precision highp float;
precision highp int;
#endif

#define EPSILON 0.00001

const float POSITIVE_INFINITY = 1.0 / EPSILON;

const vec3 bgcolor = vec3(0.8, 0.7, 0.6);
const float width = 1280.0;
const float height = 692.0;
const float blurRadius = 0.01;

uniform vec3 uOrigin;
uniform mat4 uMatrix;

uniform sampler2D uTexture;
uniform sampler2D trianglesData;
uniform sampler2D bvhData;

uniform float uSeed;
uniform float uTextureWeight;
uniform float uFocalDistance;

in vec2 vTexCoords;


float rand(inout float seed) {
    seed += 0.1573519;
    return fract(sin(dot(gl_FragCoord.xy, vec2(12.9898 + seed, 78.2331 + seed))) * 43758.5453);
}

vec2 rand2(inout float seed) {
    seed += 0.3973519;
    return vec2(fract(sin(dot(gl_FragCoord.xy, vec2(12.9898 + seed, 78.2331 + seed))) * 43758.5453),
                fract(cos(dot(gl_FragCoord.yx, vec2(63.7264 + seed, 10.8731 + seed))) * 43758.5453));
}

vec3 cosineSampleHemisphere(inout float seed, vec3 normal) {
    float r1 = rand(seed) * 6.283185307179586;
    float r2 = rand(seed);
    float r3 = sqrt(r2);
    vec3 u = normalize((abs(normal.x) > 0.1) ? vec3(normal.z, 0.0, -normal.x) : vec3(0.0, -normal.z, normal.y));
    return r3 * (u * cos(r1) + cross(normal, u) * sin(r1)) + normal * sqrt(1.0 - r2);
}

const float triNum = {#triangleWidthNumber#}.0;
const float sep = triNum * 5.0 - 0.001;
const float u1 = 1.0 / sep;
const float u2 = 2.0 / sep;
const float u3 = 3.0 / sep;
const float u4 = 4.0 / sep;
const float u5 = 5.0 / sep;

const float triHeightNumber = {#triHeightNumber#}.0;
const float triHeightNumberReverse = 1.0 / triHeightNumber;

struct Triangle {
    vec3 p1;
    vec3 p2;
    vec3 p3;
    vec3 rgb;
    vec3 lit;
    
};

Triangle getTriangle(float index) {

    // float u = index * u5;

    float l = index * 5. * u1;
    float x = fract(l);
    float y = floor(l) * triHeightNumberReverse;

    return Triangle(texture(trianglesData, vec2(x, y)).rgb,
                    texture(trianglesData, vec2(x + u1, y)).rgb,
                    texture(trianglesData, vec2(x + u2, y)).rgb,
                    texture(trianglesData, vec2(x + u3, y)).rgb,
                    texture(trianglesData, vec2(x + u4, y)).rgb
                    );
}

// }
// float float triangle_getIntersection(int index, vec3 origin, vec3 delta) {
float triangle_getIntersection( float index, vec3 orig, vec3 dir)
{
    Triangle triangle = getTriangle(index);
    const float INFINITY = 1e10;
    vec3 u, v, n; // triangle vectors
    vec3 w0, w;  // ray vectors
    float r, a, b; // params to calc ray-plane intersect

    // get triangle edge vectors and plane normal
    u = triangle.p2 - triangle.p1;
    v = triangle.p3 - triangle.p1;
    n = cross(u, v);

    w0 = orig - triangle.p1;
    a = -dot(n, w0);
    b = dot(n, dir);
    if (abs(b) < 1e-5)
    {
        // ray is parallel to triangle plane, and thus can never intersect.
        return INFINITY;
    }

    // get intersect point of ray with triangle plane
    r = a / b;
    if (r < 0.0)
        return INFINITY; // ray goes away from triangle.

    vec3 I = orig + r * dir;
    float uu, uv, vv, wu, wv, D;
    uu = dot(u, u);
    uv = dot(u, v);
    vv = dot(v, v);
    w = I - triangle.p1;
    wu = dot(w, u);
    wv = dot(w, v);
    D = uv * uv - uu * vv;

    // get and test parametric coords
    float s, t;
    s = (uv * wv - vv * wu) / D;
    if (s < 0.0 || s > 1.0)
        return INFINITY;
    t = (uv * wu - uu * wv) / D;
    if (t < 0.0 || (s + t) > 1.0)
        return INFINITY;

    return (r > 1e-5) ? r : -1.0;
}

vec3 triangle_getPointNormal(float index, vec3 hit) {
    Triangle triangle = getTriangle(index);
    vec3 a1 = triangle.p1-hit;
    vec3 a2 = triangle.p2-hit;


    return normalize(cross(a1,a2));
    
}

// node.aabbMin.x,
// node.aabbMin.y,
// node.aabbMin.z,
// node.aabbMax.x,

// node.aabbMax.y,
// node.aabbMax.z,
// parent:(node.parent !== null) ? node.parent.offset : -1,
// left:node.leftNode ? offset + 12 : -1,

// right:node.leftNode ? offset + (node.leftNode.getSubTreeNodeCount() + 1) * 12 : -1,
// pass: offset + node.getSubTreeNodeCount() * 12 ,
// start,
// end,

const float bvhNodeNum = {#bvhNodeNumber#}.0;
const float bvhNodeNumReverse = 1. / bvhNodeNum;
const float bvhWidthNodeNum = {#bvhWidthNodeNum#}.0;
const float bvhWidthNodeNumReverse = 1. / bvhWidthNodeNum;
const float bvhHeightNodeNum = {#bvhNodeRowNumber#}.0;
const float bvhHeightNodeNumReverse = 1. / bvhHeightNodeNum;
// const float bvhAllLength = bvhNodeNum / bvhWidthNodeNum;
const float bvhsep = bvhWidthNodeNum * 3.0;
const float bvhStep = 1.0 / bvhsep;

float bvh_index_start(float bvh_node) {
    float l = bvh_node * 3. * bvhStep;
    float x = fract(l);
    float y = floor(l) * bvhHeightNodeNumReverse;
	return texture(bvhData, vec2(x + bvhStep * 2.0, y)).b;
}

float bvh_index_end(float bvh_node) {
    float l = bvh_node * 3. * bvhStep;
    float x = fract(l);
    float y = floor(l) * bvhHeightNodeNumReverse;
	return texture(bvhData, vec2(x + bvhStep * 2.0, y)).a;
}

float bvh_left(float bvh_node) {
    float l = bvh_node * 3. * bvhStep;
    float x = fract(l);
    float y = floor(l) * bvhHeightNodeNumReverse;
	return texture(bvhData, vec2(x + bvhStep, y)).a;
}

// get bvh right brother node, if not have return -1
float bvh_pass(float bvh_node) {
    float l = bvh_node * 3. * bvhStep;
    float x = fract(l);
    float y = floor(l) * bvhHeightNodeNumReverse;
	return texture(bvhData, vec2(x + bvhStep * 2.0, y)).g;
}

float BvhBox_getIntersection(float bvh_node, vec3 origin, vec3 delta) {
    float l = bvh_node * 3. * bvhStep;
    float x = fract(l);
    float y = floor(l) * bvhHeightNodeNumReverse;
    vec3 minPoint = vec3(
        texture(bvhData, vec2(x, y)).r,
        texture(bvhData, vec2(x, y)).g,
        texture(bvhData, vec2(x, y)).b
    );
    vec3 maxPoint = vec3(
        texture(bvhData, vec2(x, y)).a,
        texture(bvhData, vec2(x + bvhStep, y)).r,
        texture(bvhData, vec2(x + bvhStep, y)).g
    );
    vec3 t0 = (minPoint - origin) / delta;
    vec3 t1 = (maxPoint - origin) / delta;
    vec3 r0 = min(t0, t1);
    vec3 r1 = max(t0, t1);
    float tn = max(r0.x, max(r0.y, r0.z));
    float tf = min(r1.x, min(r1.y, r1.z));
    // return (tn <= tf) && (tf > EPSILON) ? tn : -1.0;
    if((tn <= tf) && (tn > EPSILON)){
        return tn;
    } else{
        if((EPSILON <= tf) && (tn < 0.0)){
            return tf;
        } else {
            return -1.0;
        }
    }
}


// index: index of nearest hit triangle
float bvh_intersect(vec3 ray_o, vec3 ray_t, inout float index, inout vec3 debug) {
	float depth = 1.0; // intersection distance//
	float bvh_node = 0.0; // current visit nodes index
	int t = 0;    // maybe use as intersection count

	while ( bvh_node < {#bvhNodeNumber#}.0 ) {
		t += 1;
        float cur_depth = BvhBox_getIntersection(bvh_node, ray_o, ray_t); //   bvh box intersect test
        
        if (cur_depth < 0.0 || cur_depth > depth) {
            bvh_node = bvh_pass(bvh_node);
        } else {
            // debug += 1.0;
            if(bvh_left(bvh_node) > 0.5){ // trunk
                bvh_node ++;
            }else{ // leaf
                for (float i = bvh_index_start(bvh_node); i < bvh_index_end(bvh_node); ++i) {
                    cur_depth = triangle_getIntersection(i, ray_o, ray_t);
                    if (cur_depth >= 0.0 && cur_depth < depth) {
                        index = i;
                        depth = cur_depth;
                    }
                }
                bvh_node ++;
            }
        }
	};
	return depth;
}

bool intersect(
    vec3 origin, 
    vec3 delta, 
    out vec3 position,
    out vec3 normal,
    out vec3 diffuse, 
    out vec3 emittance,
    inout vec3 debug
    ) {

    float hitResult = 1.0;
    float hitIndex = 0.0;
    float t;



    hitResult = bvh_intersect(origin,delta,hitIndex , debug);
    

    if (hitResult < 1.0) {
        debug += vec3(1.0);
        Triangle triangle = getTriangle(hitIndex);
        position = origin + delta * hitResult;
        normal = triangle_getPointNormal(hitIndex, position);
        diffuse = triangle.rgb;
        emittance = triangle.lit;
        // debug = emittance;
        return true;
    } else {
        return false;
    }
}





out vec4 Finalcolor;
void main(void) {
    float seed = uSeed;

    vec4 worldir = uMatrix * vec4(2.0 * (gl_FragCoord.xy + rand2(seed)) / vec2(width, height) - 1.0, 1.0, 1.0);
    vec3 delta = worldir.xyz / worldir.w;
    vec3 origin = uOrigin;

    float r1 = rand(seed) * 6.283185307179586;
    float r2 = rand(seed);
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
    vec3 debug = vec3(0.0);

    for (int depth = 0; depth < 5; ++depth) {
        if (intersect(origin, delta, position, normal, diffuse, emittance, debug)) {
            if (depth == 0) {
              dist = length(position - origin);
            }
            color += reflectance * emittance;
            reflectance *= diffuse;
            origin = position + normal * EPSILON;
            // if(dot(normal, delta) > 0.0){
            //     normal= normal * -1.0;
            // }
            normal = cosineSampleHemisphere(seed, normal);
            delta = normal * 100.0;
        } else {
            color += reflectance * bgcolor;
            break;
        }
    }
    Finalcolor = vec4(mix(color, texture(uTexture, vTexCoords).rgb, uTextureWeight), dist);
    // Finalcolor=vec4(vec3(1.),1.);
    
    // Finalcolor = vec3(texture(bvhData, vec2(0.0 + bvhStep * 1.0 , 0.0)).r ) / 40.0;
    // Finalcolor = vec3(bvh_pass(200.0) - 2400.5) / 1.0;


}

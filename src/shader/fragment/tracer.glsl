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

varying vec2 vTexCoords;

float seed = uSeed;


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



const float triNum = {#triangleNumber#}.0;
const float sep =triNum * 5.0 - 0.001;
const float u1 = 1.0 / sep;
const float u2 = 2.0 / sep;
const float u3 = 3.0 / sep;
const float u4 = 4.0 / sep;
const float u5 = 5.0 / sep;

struct Triangle {
    vec3 p1;
    vec3 p2;
    vec3 p3;
    vec3 rgb;
    vec3 lit;
    
};

Triangle getTriangle(int index) {
    float u = float(index) * u5;
    return Triangle(texture2D(trianglesData, vec2(u, 0.0)).rgb,
                    texture2D(trianglesData, vec2(u + u1, 0.0)).rgb,
                    texture2D(trianglesData, vec2(u + u2, 0.0)).rgb,
                    texture2D(trianglesData, vec2(u + u3, 0.0)).rgb,
                    texture2D(trianglesData, vec2(u + u4, 0.0)).rgb
                    );
}

// }
// float float triangle_getIntersection(int index, vec3 origin, vec3 delta) {
float triangle_getIntersection( int index, vec3 orig, vec3 dir)
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

    return (r > 1e-5) ? r : INFINITY;
}

vec3 triangle_getPointNormal(int index, vec3 hit) {
    Triangle triangle = getTriangle(index);
    vec3 a1 = triangle.p1-hit;
    vec3 a2 = triangle.p2-hit;


    return normalize(cross(a1,a2));
    
}




struct BvhBox {
    vec3 min;
    vec3 max;
    vec3 info; // rightChild  start  end
};

Box getBvhBox(int index) {
    float u = float(index) * u4;
    return BvhBox(texture2D(uSampler, vec2(u, 0.0)).rgb,
              texture2D(uSampler, vec2(u + u1, 0.0)).rgb,
              texture2D(uSampler, vec2(u + u2, 0.0)).rgb,);
}

float BvhBox_getIntersection(float offset, vec3 origin, vec3 delta) {
    Box box = getBox(offset);
    vec3 t0 = (box.min - origin) / delta;
    vec3 t1 = (box.max - origin) / delta;
    vec3 r0 = min(t0, t1);
    vec3 r1 = max(t0, t1);
    float tn = max(r0.x, max(r0.y, r0.z));
    float tf = min(r1.x, min(r1.y, r1.z));
    return (tn <= tf) && (tf > EPSILON) ? tn : POSITIVE_INFINITY;
}

// vec3 Box_getPointNormal(int index, vec3 hit) {
//     Box box = getBox(index);
//     if (hit.x < box.min.x + EPSILON) return vec3(-1.0, 0.0, 0.0); else
//     if (hit.x > box.max.x - EPSILON) return vec3(1.0, 0.0, 0.0); else
//     if (hit.y < box.min.y + EPSILON) return vec3(0.0, -1.0, 0.0); else
//     if (hit.y > box.max.y - EPSILON) return vec3(0.0, 1.0, 0.0); else
//     if (hit.z < box.min.z + EPSILON) return vec3(0.0, 0.0, -1.0); else
//                                      return vec3(0.0, 0.0, 1.0);
// }


float bvh_index(float bvh_node) {
	return texture2D(bvhSampler, vec2(7.5 / 11, (bvh_node + 0.5) / num_bvh)).r;
}

float bvh_left(float bvh_node) {
	return texture2D(bvhSampler, vec2(8.5 / 11, (bvh_node + 0.5) / num_bvh)).r;
}

float bvh_right(float bvh_node) {
	return texture2D(bvhSampler, vec2(9.5 / 11, (bvh_node + 0.5) / num_bvh)).r;
}

float bvh_parent(float bvh_node) {
	return texture2D(bvhSampler, vec2(10.5 / 11,(bvh_node + 0.5) / num_bvh)).r;
}

bool bvh_dir(float bvh_node, vec3 ray) {
	float axis = texture2D(bvhSampler, vec2(6.5 / 11, (bvh_node + 0.5) / num_bvh)).r;
	if (axis < 0.5)
		return ray.x > 0;
	if (axis < 1.5)
		return ray.y > 0;
	return ray.z <= 0;
}

float bvh_intersect(vec3 ray_o, vec3 ray_t, inout float index, inout float u, inout float v) {
	float depth = 1e30; // intersection distance
	index = -1;     // 
	float bvh_node = 0; // current visit nodes index
	float last_node = -1;  
	float u1, v1;
	int t = 0;    // use as intersection count
	while (bvh_node >= 0) {
		t += 1;
		if (last_node == -1) {
			float cur_depth = box_intersect(bvh_node, ray_o, ray_t); //   bvh box intersect test
			if (cur_depth < 0 || cur_depth > depth) {  　// not intersected
				last_node = bvh_node;
				bvh_node = bvh_parent(bvh_node);
				continue;
			}
			if (bvh_left(bvh_node) < 0) { // intersected leaf
				float cur_index = bvh_index(bvh_node);
				cur_depth = tri_intersect(cur_index, ray_o, ray_t, u1, v1);
				if (cur_depth >= 0 && cur_depth < depth) {
					index = cur_index;
					u = u1;
					v = v1;
					depth = cur_depth;
				}
				last_node = bvh_node;
				bvh_node = bvh_parent(bvh_node);
				continue;
			} else {     // inter
				last_node = -1;
				if (bvh_dir(bvh_node, ray_t)) {
					bvh_node = bvh_left(bvh_node);
				} else {
					bvh_node = bvh_right(bvh_node);
				}
			}
		} else {
			bool dir = bvh_dir(bvh_node, ray_t);
			float left_node = bvh_left(bvh_node);
			float right_node = bvh_right(bvh_node);
			if (dir && left_node == last_node) {
				last_node = -1;
				bvh_node = bvh_right(bvh_node);
			} else
			if (!dir && right_node == last_node) {
				last_node = -1;
				bvh_node = bvh_left(bvh_node);
			} else {
				last_node = bvh_node;
				bvh_node = bvh_parent(bvh_node);
			}
		}
	}
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
    int hitIndex;
    float t;

    debug=vec3(0,0,0);


    // triangle_getIntersection(origin,delta)
    //  for (int i = 0; i < {#triangleNumber#}; ++i) {
    //      Triangle triangle = getTriangle(index);
    //      triangle_getIntersection(origin,delta, )

    //     // t = triangle_getIntersection( i, origin, delta);
    //     // if (t < hitResult) {
    //     //     hitResult = t;
    //     //     hitIndex = i;
    //     // }
    // }


    // for (int i = 0; i < {#triangleNumber#}; ++i) {
    //     t = triangle_getIntersection( i, origin, delta);
    //     if (t < hitResult) {
    //         hitResult = t;
    //         hitIndex = i;
    //     }
    // }
    
    if (hitResult < 1.0) {
        Triangle triangle = getTriangle(hitIndex);
        position = origin + delta * hitResult;
        normal = triangle_getPointNormal(hitIndex, position);
        diffuse = triangle.rgb;
        emittance = triangle.lit;
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
    vec3 debug=vec3(0.0, 0.0, 0.0);

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
            normal = cosineSampleHemisphere(normal);
            delta = normal * 100.0;
        } else {
            color += reflectance * bgcolor;
            break;
        }
    }
    gl_FragColor = vec4(mix(color, texture2D(uTexture, vTexCoords).rgb, uTextureWeight), dist);

    // float testT = triangle_getIntersection(0,vec3(0.25,0.25,1),vec3(0,-1,0));
    // Triangle triangle = getTriangle(0);
    // debug=vec3(testT/ 100000.0,testT,testT);
    // color = debug;
    // gl_FragColor = vec4(color.rgb, 1);

}

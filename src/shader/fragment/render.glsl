precision mediump float;
const vec3 gamma = vec3(1.0 / 2.2);
uniform sampler2D uTexture;
varying vec2 vTexCoords;
void main() {
    gl_FragColor = vec4(pow(texture2D(uTexture, vTexCoords).rgb, gamma), 1.0);
}

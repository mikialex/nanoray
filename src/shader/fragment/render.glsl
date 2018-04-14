#version 300 es

precision mediump float;
const vec3 gamma = vec3(1.0 / 2.2);
uniform sampler2D uTexture;
in vec2 vTexCoords;
out vec4 FinalColor;

void main() {
    FinalColor = vec4(pow(texture(uTexture, vTexCoords).rgb, gamma), 1.0);
}

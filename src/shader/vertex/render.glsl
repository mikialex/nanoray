#version 300 es

precision lowp float;
const vec2 scale = vec2(0.5, 0.5);
in vec2 aPosition;
out vec2 vTexCoords;
void main() {
    vTexCoords  = aPosition * scale + scale;
    gl_Position = vec4(aPosition, 0.0, 1.0);
}

precision lowp float;
const vec2 scale = vec2(0.5, 0.5);
attribute vec2 aPosition;
varying vec2 vTexCoords;
void main() {
    vTexCoords  = aPosition * scale + scale;
    gl_Position = vec4(aPosition, 0.0, 1.0);
}
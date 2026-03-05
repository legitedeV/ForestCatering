precision highp float;

uniform float uTime;
uniform float uStrength;

varying vec2 vUv;

void main() {
  vUv = uv;

  vec3 pos = position;

  // Subtle wavy displacement driven by position and time
  float dx = sin(pos.y * 3.0 + uTime * 1.2) * cos(pos.z * 2.0 + uTime * 0.8);
  float dy = cos(pos.x * 2.5 + uTime * 1.0) * sin(pos.z * 1.5 + uTime * 1.4);
  float dz = sin(pos.x * 2.0 + uTime * 0.6) * cos(pos.y * 1.8 + uTime * 1.1);

  pos += normal * vec3(dx, dy, dz) * uStrength;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}

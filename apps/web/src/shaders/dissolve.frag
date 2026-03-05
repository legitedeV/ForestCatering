precision highp float;

uniform float uProgress;
uniform sampler2D uTexture;
uniform sampler2D uNoise;

varying vec2 vUv;

void main() {
  vec4 tex   = texture2D(uTexture, vUv);
  float noise = texture2D(uNoise, vUv).r;

  // Dissolve threshold driven by progress
  float edge  = smoothstep(uProgress - 0.08, uProgress, noise);
  float glow  = smoothstep(uProgress - 0.12, uProgress - 0.08, noise);

  // Gold edge color (#C8A862)
  vec3 goldColor = vec3(0.784, 0.659, 0.384);
  vec3 edgeGlow  = goldColor * glow * (1.0 - edge) * 3.0;

  vec3 color = tex.rgb * edge + edgeGlow;
  float alpha = max(edge, glow * (1.0 - edge));

  // Fully dissolved at progress = 1
  gl_FragColor = vec4(color, alpha * tex.a);
}

import * as PIXI from "pixi.js";

export class HighlightFilter extends PIXI.Filter {
  constructor() {
    super(vertex, fragment);
    this.uniforms.originalColor = new Float32Array(4);
    this.uniforms.newColor = new Float32Array(4);
    this.uniforms.epsilon = 0.1;

    this.uniforms.originalColor = [0.6, 0.6, 0.6, 1.0];
    this.uniforms.newColor = [1.0, 1.0, 1.0, 1.0];
  }
}

const vertex = `
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}
`;

const fragment = `
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec4 originalColor;
uniform vec4 newColor;
uniform float epsilon;
void main(void) {
    vec4 currentColor = texture2D(uSampler, vTextureCoord);

    if (currentColor.a > 0.001) {
        if (currentColor.r < 0.001 && currentColor.g < 0.001 && currentColor.b < 0.001) {
            gl_FragColor = newColor;
        } else {
            gl_FragColor = originalColor;
        }
    }
}
`;

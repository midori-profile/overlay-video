// Buffer-related functions:

export function createAndUpdateWebGLBuffer(
  gl: WebGLRenderingContext,
  data?: Float32Array | number[]
): WebGLBuffer | null {
  const buffer = gl.createBuffer();

  if (buffer && data) {
    bindDataToWebGLBuffer(gl, buffer, data);
  }

  return buffer;
}

export function bindDataToWebGLBuffer(
  gl: WebGLRenderingContext,
  buffer: WebGLBuffer,
  data: Float32Array | number[]
): void {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  const bufferData = Array.isArray(data) ? new Float32Array(data) : data;
  gl.bufferData(gl.ARRAY_BUFFER, bufferData, gl.STATIC_DRAW);
}

export function bindBufferToShaderAttribute(
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  attribute: string,
  buffer: WebGLBuffer,
  itemSize: number
): void {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  const attributeLocation = gl.getAttribLocation(program, attribute);

  if (attributeLocation === -1) {
    console.error(`Attribute ${attribute} not found in shader program`);
    return;
  }

  gl.enableVertexAttribArray(attributeLocation);
  gl.vertexAttribPointer(attributeLocation, itemSize, gl.FLOAT, false, 0, 0);
}

// Shader program creation
export function createWebGLProgramFromShaders(
  gl: WebGLRenderingContext,
  vsCode: string,
  fsCode: string
): WebGLProgram | null {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsCode);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsCode);

  if (!vertexShader || !fragmentShader) {
    return null;
  }

  const program = gl.createProgram();
  if (!program) {
    console.error("Error creating program");
    return null;
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Error linking program: ", gl.getProgramInfoLog(program));
    return null;
  }

  return program;
}

function createShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) {
    console.error("Error creating shader");
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}

// Texture creation and setup
export function createAndSetupWebGLTexture(
  gl: WebGLRenderingContext
): WebGLTexture | null {
  const texture = gl.createTexture();
  if (!texture) {
    console.error("Error creating texture");
    return null;
  }

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  gl.bindTexture(gl.TEXTURE_2D, null);

  return texture;
}

export const FRAGMENT_SHADER_CODE = `precision highp float;
varying vec2 textureCoordinates;
uniform sampler2D tex;
void main() {
    float alpha = texture2D(tex, textureCoordinates * vec2(0.5, 1.0)).r;
    vec3 rgb = texture2D(tex, textureCoordinates * vec2(0.5, 1.0) + vec2(0.5, 0.0)).rgb;
    gl_FragColor = vec4(rgb, alpha);
}`;

export const VERTEX_SHADER_CODE = `
varying vec2 textureCoordinates;
attribute vec2 position;
void main() {
    textureCoordinates = (position + 1.0) * 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
}`;


"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VERTEX_SHADER_CODE = exports.FRAGMENT_SHADER_CODE = void 0;
exports.bindBufferToShaderAttribute = bindBufferToShaderAttribute;
exports.bindDataToWebGLBuffer = bindDataToWebGLBuffer;
exports.createAndSetupWebGLTexture = createAndSetupWebGLTexture;
exports.createAndUpdateWebGLBuffer = createAndUpdateWebGLBuffer;
exports.createWebGLProgramFromShaders = createWebGLProgramFromShaders;
// Buffer-related functions:

function createAndUpdateWebGLBuffer(gl, data) {
  var buffer = gl.createBuffer();
  if (buffer && data) {
    bindDataToWebGLBuffer(gl, buffer, data);
  }
  return buffer;
}
function bindDataToWebGLBuffer(gl, buffer, data) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  var bufferData = Array.isArray(data) ? new Float32Array(data) : data;
  gl.bufferData(gl.ARRAY_BUFFER, bufferData, gl.STATIC_DRAW);
}
function bindBufferToShaderAttribute(gl, program, attribute, buffer, itemSize) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  var attributeLocation = gl.getAttribLocation(program, attribute);
  if (attributeLocation === -1) {
    console.error("Attribute ".concat(attribute, " not found in shader program"));
    return;
  }
  gl.enableVertexAttribArray(attributeLocation);
  gl.vertexAttribPointer(attributeLocation, itemSize, gl.FLOAT, false, 0, 0);
}

// Shader program creation
function createWebGLProgramFromShaders(gl, vsCode, fsCode) {
  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vsCode);
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsCode);
  if (!vertexShader || !fragmentShader) {
    return null;
  }
  var program = gl.createProgram();
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
function createShader(gl, type, source) {
  var shader = gl.createShader(type);
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
function createAndSetupWebGLTexture(gl) {
  var texture = gl.createTexture();
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
var FRAGMENT_SHADER_CODE = exports.FRAGMENT_SHADER_CODE = "precision highp float;\nvarying vec2 textureCoordinates;\nuniform sampler2D tex;\nvoid main() {\n    float alpha = texture2D(tex, textureCoordinates * vec2(0.5, 1.0)).r;\n    vec3 rgb = texture2D(tex, textureCoordinates * vec2(0.5, 1.0) + vec2(0.5, 0.0)).rgb;\n    gl_FragColor = vec4(rgb, alpha);\n}";
var VERTEX_SHADER_CODE = exports.VERTEX_SHADER_CODE = "\nvarying vec2 textureCoordinates;\nattribute vec2 position;\nvoid main() {\n    textureCoordinates = (position + 1.0) * 0.5;\n    gl_Position = vec4(position, 0.0, 1.0);\n}";
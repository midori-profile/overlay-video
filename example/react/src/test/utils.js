"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createImageTexture = createImageTexture;
exports.createProgram = createProgram;
exports.createVertexBuffer = createVertexBuffer;
exports.setVertexBuffer = setVertexBuffer;
exports.updateVertexBuffer = updateVertexBuffer;
function createVertexBuffer(gl, data) {
  var buffer = gl.createBuffer();
  if (data) {
    updateVertexBuffer(gl, buffer, data);
  }
  return buffer;
}
function updateVertexBuffer(gl, buffer, data) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  if (data instanceof Array) {
    data = new Float32Array(data);
  }
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
}
function createProgram(gl, vsCode, fsCode) {
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(vertexShader, vsCode);
  gl.shaderSource(fragmentShader, fsCode);
  gl.compileShader(vertexShader);
  gl.compileShader(fragmentShader);
  [vertexShader, fragmentShader].forEach(function (shader) {
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
      return null;
    }
  });
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  return program;
}
function setVertexBuffer(gl, program, symbol, buffer, itemSize) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  var posLoc = gl.getAttribLocation(program, symbol);
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, itemSize, gl.FLOAT, false, 0, 0);
}
function createImageTexture(gl) {
  var tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.bindTexture(gl.TEXTURE_2D, null);
  return tex;
}
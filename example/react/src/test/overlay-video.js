"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _react = _interopRequireWildcard(require("react"));
var _utils = require("./utils");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
var VSCODE = "\nattribute vec2 position;\nvarying vec2 v_Texcoord;\nvoid main() {\n    v_Texcoord = (position + 1.0) * 0.5;\n    gl_Position = vec4(position, 0.0, 1.0);\n}";
var FSCODE = "precision highp float;\nuniform sampler2D tex;\nvarying vec2 v_Texcoord;\nvoid main() {\n    vec3 rgb = texture2D(tex, v_Texcoord * vec2(0.5, 1.0) + vec2(0.5, 0.0)).rgb;\n    float a = texture2D(tex, v_Texcoord * vec2(0.5, 1.0)).r;\n    gl_FragColor = vec4(rgb, a);\n}";
var AnimationVideo = function AnimationVideo(_ref) {
  var id = _ref.id,
    path = _ref.path,
    resourceWidth = _ref.resourceWidth,
    resourceHeight = _ref.resourceHeight,
    loop = _ref.loop,
    autoplay = _ref.autoplay,
    canvasStyle = _ref.canvasStyle;
  var canvasRef = (0, _react.useRef)(null);
  var videoRef = (0, _react.useRef)(null);
  var glRef = (0, _react.useRef)(null);
  var posBufferRef = (0, _react.useRef)(null);
  var videoTextureRef = (0, _react.useRef)(null);
  var frameDrawHandlerRef = (0, _react.useRef)(null);
  (0, _react.useEffect)(function () {
    console.log('Initializing video element');
    var video = document.createElement('video');
    video.muted = true;
    video.style.visibility = 'hidden'; // Hide the video element
    video.style.position = 'absolute'; // Keep it positioned absolutely
    video.style.top = '0'; // Position it at the top
    video.style.left = '0'; // Position it at the left
    video.crossOrigin = 'anonymous';
    video.playsInline = true;
    video.src = path;
    video.loop = loop;
    video.autoplay = autoplay;
    videoRef.current = video;
    document.body.appendChild(video);
    video.addEventListener('error', function (e) {
      console.error('Video error', e);
    });
    var canvas = canvasRef.current;
    var gl = canvas.getContext('webgl');
    if (!gl) {
      console.error('Failed to get WebGL context');
      return;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var posBuffer = (0, _utils.createVertexBuffer)(gl, [-1, -1, 1, -1, -1, 1, 1, 1]);
    var program = (0, _utils.createProgram)(gl, VSCODE, FSCODE);
    if (!program) {
      console.error('Failed to create shader program');
      return;
    }
    var texLoc = gl.getUniformLocation(program, 'tex');
    if (texLoc === null) {
      console.error('Failed to get uniform location for tex');
      return;
    }
    gl.useProgram(program);
    (0, _utils.setVertexBuffer)(gl, program, 'position', posBuffer, 2);
    gl.uniform1i(texLoc, 0);
    var videoTexture = (0, _utils.createImageTexture)(gl);
    glRef.current = gl;
    posBufferRef.current = posBuffer;
    videoTextureRef.current = videoTexture;
    frameDrawHandlerRef.current = prepareFrameDraw(gl, posBuffer, videoTexture, video);
    video.addEventListener('play', frameDrawHandlerRef.current.startFrameUpdate);
    video.addEventListener('pause', frameDrawHandlerRef.current.stopFrameUpdate);
    video.addEventListener('ended', frameDrawHandlerRef.current.stopFrameUpdate);
    console.log('Video element initialized:', video);
    return function () {
      console.log('Cleaning up video event listeners');
      video.removeEventListener('play', frameDrawHandlerRef.current.startFrameUpdate);
      video.removeEventListener('pause', frameDrawHandlerRef.current.stopFrameUpdate);
      video.removeEventListener('ended', frameDrawHandlerRef.current.stopFrameUpdate);
    };
  }, [path, loop, autoplay]);
  var prepareFrameDraw = function prepareFrameDraw(gl, posBuffer, videoTexture, video) {
    var currentFrameID = null;
    function frameUpdate() {
      console.log('Drawing frame');
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
      gl.bindTexture(gl.TEXTURE_2D, videoTexture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      currentFrameID = requestAnimationFrame(frameUpdate);
    }
    function startFrameUpdate() {
      console.log('Starting frame update');
      frameUpdate();
    }
    function stopFrameUpdate() {
      console.log('Stopping frame update');
      cancelAnimationFrame(currentFrameID);
    }
    return {
      startFrameUpdate: startFrameUpdate,
      stopFrameUpdate: stopFrameUpdate
    };
  };
  return /*#__PURE__*/_react["default"].createElement("div", null, /*#__PURE__*/_react["default"].createElement("canvas", {
    ref: canvasRef,
    width: resourceWidth / 2,
    height: resourceHeight,
    style: canvasStyle
  }));
};
var _default = exports["default"] = AnimationVideo;
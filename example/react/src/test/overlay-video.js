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
var OverlayVideo = /*#__PURE__*/(0, _react.forwardRef)(function (_ref, ref) {
  var id = _ref.id,
    path = _ref.path,
    resourceWidth = _ref.resourceWidth,
    resourceHeight = _ref.resourceHeight,
    loop = _ref.loop,
    autoplay = _ref.autoplay,
    canvasStyle = _ref.canvasStyle,
    onerror = _ref.onerror;
  var canvasRef = (0, _react.useRef)(null);
  var videoRef = (0, _react.useRef)(null);
  var glRef = (0, _react.useRef)(null);
  var posBufferRef = (0, _react.useRef)(null);
  var videoTextureRef = (0, _react.useRef)(null);
  var frameDrawHandlerRef = (0, _react.useRef)(null);
  (0, _react.useImperativeHandle)(ref, function () {
    return {
      play: function play() {
        var _videoRef$current;
        (_videoRef$current = videoRef.current) === null || _videoRef$current === void 0 ? void 0 : _videoRef$current.play();
      },
      pause: function pause() {
        var _videoRef$current2;
        (_videoRef$current2 = videoRef.current) === null || _videoRef$current2 === void 0 ? void 0 : _videoRef$current2.pause();
      }
    };
  });
  (0, _react.useEffect)(function () {
    initializeVideoElement();
    var canvas = canvasRef.current;
    if (!canvas) {
      console.error('Canvas element not found');
      return;
    }
    var gl = canvas.getContext('webgl');
    if (!gl) {
      console.error('Failed to get WebGL context');
      return;
    }
    initializeWebGL(gl);
    setupVideoEventHandlers();
    return cleanup;

    // Functions
    function initializeVideoElement() {
      console.log('Initializing video element');
      var video = document.createElement('video');
      video.muted = true;
      video.style.visibility = 'hidden';
      video.style.position = 'absolute';
      video.style.top = '0';
      video.style.left = '0';
      video.crossOrigin = 'anonymous';
      video.playsInline = true;
      video.src = path;
      video.loop = loop;
      video.autoplay = autoplay;
      videoRef.current = video;
      document.body.appendChild(video);
      video.addEventListener('error', handleVideoError);
    }
    function initializeWebGL(gl) {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      var posBuffer = (0, _utils.createAndUpdateWebGLBuffer)(gl, [-1, -1, 1, -1, -1, 1, 1, 1]);
      var program = (0, _utils.createWebGLProgramFromShaders)(gl, _utils.VERTEX_SHADER_CODE, _utils.FRAGMENT_SHADER_CODE);
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
      (0, _utils.bindBufferToShaderAttribute)(gl, program, 'position', posBuffer, 2);
      gl.uniform1i(texLoc, 0);
      var videoTexture = (0, _utils.createAndSetupWebGLTexture)(gl);
      glRef.current = gl;
      posBufferRef.current = posBuffer;
      videoTextureRef.current = videoTexture;
      frameDrawHandlerRef.current = prepareFrameDraw(gl, posBuffer, videoTexture, videoRef.current);
    }
    function setupVideoEventHandlers() {
      var video = videoRef.current;
      if (frameDrawHandlerRef.current) {
        video.addEventListener('play', frameDrawHandlerRef.current.startFrameUpdate);
        video.addEventListener('pause', frameDrawHandlerRef.current.stopFrameUpdate);
        video.addEventListener('ended', frameDrawHandlerRef.current.stopFrameUpdate);
      }
      console.log('Video element initialized:', video);
    }
    function handleVideoError(e) {
      console.error('Video error', e);
      if (onerror) {
        onerror(e);
      }
    }
    function cleanup() {
      console.log('Cleaning up video and canvas event listeners');
      var video = videoRef.current;
      if (frameDrawHandlerRef.current) {
        video.removeEventListener('play', frameDrawHandlerRef.current.startFrameUpdate);
        video.removeEventListener('pause', frameDrawHandlerRef.current.stopFrameUpdate);
        video.removeEventListener('ended', frameDrawHandlerRef.current.stopFrameUpdate);
      }
      video.src = ''; // Set video src to an empty string
      document.body.removeChild(video);
      var canvas = canvasRef.current;
      if (canvas && canvas.parentElement) {
        // completely remove canvas element and cashed context
        canvas.width = 0; // Set canvas width to 0
        canvas.height = 0; // Set canvas height to 0
        canvas.parentElement.removeChild(canvas);
      }
    }
    function prepareFrameDraw(gl, posBuffer, videoTexture, video) {
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
        if (currentFrameID !== null) {
          cancelAnimationFrame(currentFrameID);
        }
      }
      return {
        startFrameUpdate: startFrameUpdate,
        stopFrameUpdate: stopFrameUpdate
      };
    }
  }, [path, loop, autoplay]);
  return /*#__PURE__*/_react["default"].createElement("div", null, /*#__PURE__*/_react["default"].createElement("canvas", {
    ref: canvasRef,
    width: resourceWidth / 2,
    height: resourceHeight,
    style: canvasStyle
  }));
});
var _default = exports["default"] = OverlayVideo;
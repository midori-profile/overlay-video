"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createAnimationVideo = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var AnimationVideoContext = /*#__PURE__*/function () {
  function AnimationVideoContext(animationVideoId, communicator) {
    _classCallCheck(this, AnimationVideoContext);
    if (typeof animationVideoId !== 'string') {
      console.error('createAnimationVideoContext Parameter error: ' + 'domId should be string instead of ' + "".concat(_typeof(animationVideoId)));
      return;
    }
    this.communicator = communicator;
    this.animationVideoId = animationVideoId;
    this.componentId = "animation-video-".concat(animationVideoId);
  }
  return _createClass(AnimationVideoContext, [{
    key: "play",
    value: function play() {
      this.invokeMethod('play');
    }
  }, {
    key: "pause",
    value: function pause() {
      this.invokeMethod('pause');
    }
  }, {
    key: "seek",
    value: function seek(position) {
      if (typeof position !== 'number') {
        console.error("seek parameter error: position should be number instead of ".concat(_typeof(position)));
        return;
      }
      this.invokeMethod('seek', {
        position: position
      });
    }
  }, {
    key: "invokeMethod",
    value: function invokeMethod(type, data) {
      this.communicator.sendMessage({
        type: "animation-video-".concat(this.animationVideoId),
        value: {
          api: type,
          params: data
        }
      });
    }
  }]);
}();
var createAnimationVideo = exports.createAnimationVideo = function createAnimationVideo(animationVideoId, communicator) {
  return new AnimationVideoContext(animationVideoId, communicator);
};
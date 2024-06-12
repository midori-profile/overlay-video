
/**
 * @file 透明视频 <animation-video>
 * @author tianyu05(tianyu05@baidu.com)
 */

import {privateKey} from '../utils';
import {internalDataComputedCreator, typesCast} from '../computedCreator';
import api from './api';

import {
    createVertexBuffer,
    createProgram,
    setVertexBuffer,
    createImageTexture
} from './webGlTool';

// webgl 着色器
const VSCODE = `
attribute vec2 position;
varying vec2 v_Texcoord;
void main() {
    // 纹理图片中拿像素用的范围坐标是 （0，1），所以要从 （-1， 1）映射到（0， 1）
    // 举例：postition 传进来是 -1,1，经过处理后变为： 0,1,可以映射到纹理坐标上
    v_Texcoord = (position + 1.0) * 0.5;

    // vertex shader 内建的输出变量，传递给 fragment shader，必须设置
    gl_Position = vec4(position, 0.0, 1.0);
}`;

// texture2D(sampler2D sampler, vec2 coord)
// 第一个参数代表图片纹理，第二个参数代表纹理坐标点，
// 通过GLSL的内建函数texture2D来获取对应位置纹理的颜色RGBA值

const FSCODE = `precision highp float;
uniform sampler2D tex;
// 顶点着色器的输出
varying vec2 v_Texcoord;
void main() {
    // 获取对应位置纹理的颜色RGBA值,vec2 是一个法向量， + vec2(0.5, 0.0) 代表取右边的像素点
    // 取右边画面像素
    vec3 rgb = texture2D(tex, v_Texcoord * vec2(0.5, 1.0) + vec2(0.5, 0.0)).rgb;
    // 取左边画面像素
    // 取左边像素的时候，只用取 r 值就行了，
    // 因为 灰度值的 rgb 参数值都一样，例如： #000  rgb(255, 255, 255)
    float a = texture2D(tex, v_Texcoord * vec2(0.5, 1.0)).r;
    // gl_FragColor是fragment shader唯一的内建输出变量，设置像素的颜色
    gl_FragColor = vec4(rgb, a);
}`;

export default Object.assign({

    behaviors: ['nativeEventEffect', 'nativeCover'],
    constructor(props) {
        this.video = null;
    },

    template: `
        <swan-animation-video
            data-sanid="{{provideData.componentId}}"
        >
            <canvas s-ref="canvas-{{id}}" style="{{__canvasStyle}}"></canvas>
        </swan-animation-video>
    `,

    initData() {
        return {
            id: this.id,
            // 动画资源地址
            path: '',
            // 动画资源的宽度
            resourceWidth: 800,
            // 动画资源的高度
            resourceHeight: 400,
            canvasStyle: 'width: 400px; height: 400px',
            // 动画是否循环播放
            loop: false,
            // 动画是否自动播放
            autoplay: false,
            [privateKey]: {
                componentId: this.id,
                videoIsPlay: false
            }
        };
    },

    computed: {
        ...internalDataComputedCreator([
            {name: 'path', caster: typesCast.stringCast},
            {name: 'resourceWidth', caster: typesCast.numCast},
            {name: 'resourceHeight', caster: typesCast.numCast},
            {name: 'canvasStyle', caster: typesCast.stringCast},
            {name: 'loop', caster: typesCast.boolCast},
            {name: 'autoplay', caster: typesCast.boolCast},
            {name: 'keepLastFrame', caster: typesCast.boolCast}
        ]),

        /**
         * 创建私有属性，供模板使用
         * @return {Object} provideData
         */
        provideData() {
            return this.data.get(privateKey);
        }

    },

    attached() {
        this.createVideoElement();
        let video = this.video;

        // 初始化 createAnimationVideoContext 导出的 API 注册
        this.initAPIRegister(video);

        // 监听 loop 和 autoplay属性
        this.loopChange(video);
        this.autoplayChange(video);

        // 监听 video 是否在播放中
        this.videoIsPlayChange();

        // 监听播放开始和结束事件
        this.videoEventListener(video, 'play', 'bindstarted');
        this.videoEventListener(video, 'ended', 'bindended');


        let canvas = this.ref(`canvas-${this.data.get('id')}`);

        // 这里是新内核升级之后存在的浏览内核原生的bug，节点被创建的时候，获取不到的
        // zeus 内核在 attach 的时候拿不到 canvas webgl 上下文，因此前端异步绕过
        // 开始播放后开始绘制canvas
        setTimeout(() => {
            video.addEventListener(
                'canplay',
                this.initAnimation(canvas),
                {once: true}
            );
        }, 0);
    },

    /**
     * 创建video结点，解析视频资源
    */

    createVideoElement() {
        const video = document.createElement('video');

        // video默认属性
        // muted 用来控制 ios 自动播放，
        // playsinline 控制移动端不全屏播放
        video.setAttribute('muted', true);
        video.setAttribute('crossorigin', 'anonymous');
        video.setAttribute('webkit-playsinline', true);
        video.setAttribute('playsinline', true);
        video.setAttribute('x-webkit-airplay', true);
        video.setAttribute('t7-video-player-type', 'h5');

        // 来自开发者设置的属性
        if (this.data.get('__loop')) {
            video.setAttribute('loop', '');
        }
        if (this.data.get('__autoplay')) {
            video.setAttribute('autoplay', '');
        }

        video.src = this.data.get('__path');
        this.video = video;
    },

    /**
     * 监听loop attribue 的变化
    */

    loopChange(video) {
        this.watch('__loop', __loop => {
            if (__loop) {
                video.setAttribute('loop', '');
            }
            else {
                video.removeAttribute('loop');
            }
        });
    },

    /**
     * 监听autoplay attribue 的变化
    */

    autoplayChange(video) {
        this.watch('__autoplay', __autoplay => {
            if (__autoplay) {
                video.setAttribute('autoplay', '');
            }
            else {
                video.removeAttribute('autoplay');
            }
        });
    },

    /**
     * 监听video播放和结束事件
    */

    videoEventListener(video, type, event) {
        video.addEventListener(type, () => {
            // 向开发者派发 play 和 end 事件
            this.dispatchEvent(event, {
                detail: {
                    animationVideoId: this.data.get('id')
                }
            });
            if (type === 'play') {
                this.data.set(`${privateKey}.videoIsPlay`, true);
            }
            else if (type === 'ended') {
                this.data.set(`${privateKey}.videoIsPlay`, false);
            }
        }, false);
    },

    /**
     * 监听video是否在播放中
    */

    videoIsPlayChange() {
        this.watch(`${privateKey}.videoIsPlay`, videoIsPlay => {
            if (videoIsPlay) {
                this.frameDrawHandler.startFrameUpdate();
            }
            else {
                this.frameDrawHandler.stopFrameUpdate();
            }
        });
    },

    disposed() {
        this.video = null;
    },

    /**
     * 动画环境初始化
     * @params
     * video video结点
     * canvas canvas结点
    */

    initAnimation(canvas) {
        const {
            __resourceWidth: resourceWidth,
            __resourceHeight: resourceHeight
        } = this.data.get();

        canvas.width = resourceWidth / 2;
        canvas.height = resourceHeight;


        //这将创建一个 WebGLRenderingContext 三维渲染上下文对象
        const gl = canvas.getContext('webgl');

        // 获得Canvas的 webgl 上下文后，我们就可以设置在哪块区域绘制WebGL了。
        // 在WebGL中，这被称为视口 viewport
        // 通过这个方法，我们告诉OpenGL渲染窗口的尺寸大小，
        // 这样OpenGL才只能知道怎样相对于窗口大小显示数据和坐标。
        // glViewport函数前两个参数控制窗口左下角的位置。
        // 第三个和第四个参数控制渲染窗口的宽度和高度（像素）
        gl.viewport(0, 0, canvas.width, canvas.height);

        //设置清空颜色缓冲时的颜色值。在每个新的渲染迭代开始的时候我们总是希望清屏，
        // 否则我们仍能看见上一次迭代的渲染结果
        gl.clearColor(0, 0, 0, 0);

        //清空颜色缓冲与深度缓冲(z-buffer)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // 创建顶点缓冲区,把顶点的位置直接写到显存里面,每一次绘制的时候直接从显存里拿
        const posBuffer = createVertexBuffer(gl, [
            -1, -1,
            1, -1,
            -1, 1,
            1, 1
        ]);

        // 创建一个 shader 实例
        const program = createProgram(gl, VSCODE, FSCODE);

        // 向 shader 实例中存储数据
        const texLoc = gl.getUniformLocation(program, 'tex');
        gl.useProgram(program);
        setVertexBuffer(gl, program, 'position', posBuffer, 2);
        gl.uniform1i(texLoc, 0);

        this.videoTexture = createImageTexture(gl);
        this.gl = gl;
        this.posBuffer = posBuffer;

        // 帧绘制初始化
        this.frameDrawHandler = this.prpareFrameDraw(this.gl, this.posBuffer, this.videoTexture, this.video);

    },

    /**
     * 帧绘制
     * @params
     * gl webgl 上下文
     * posBuffer 顶点缓冲区
     * videoTexture 视频纹理
     * video 视频
     * @return Object
     * startFrameUpdate 开始帧绘制方法
     * stopFrameUpdate 停止帧绘制方法
    */

    prpareFrameDraw(gl, posBuffer, videoTexture, video) {
        let currentFrameID = null;
        // 绘制
        function frameUpdate() {
            // 指定当前使用的缓冲区
            gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);

            gl.bindTexture(gl.TEXTURE_2D, videoTexture);

            // 图像数据在图片里，从图片里传到gpu里做预处理。要翻转，
            // 图像的坐标：上面是0，下面是1，webgl里的坐标： 上面是1
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

            // texImage2D 用于更新纹理
            // gl.TEXTURE_2D: 二维纹理贴图
            // level ,0 指的是基本图像等级
            // internalformat 指定纹理中的颜色组件,RGBA 指的是支持四个通道
            // type 指定texel数据的数据类型 每个通道8位
            // 下列对象之一可以用作纹理的像素源 Uint8Array 一个8位无符号整型 255
            // HTMLElement
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);

            // 用于从向量数组中绘制图元。
            // gl.TRIANGLE_STRIP 绘制一个三角带 指定从0点开始绘制，绘制需要用到4个点
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            currentFrameID = requestAnimationFrame(frameUpdate);
        }
        // 开始帧绘制
        function startFrameUpdate() {
            frameUpdate();
        }
        // 停止帧绘制
        function stopFrameUpdate() {
            cancelAnimationFrame(currentFrameID);
        }

        return {
            startFrameUpdate,
            stopFrameUpdate
        };
    }
}, api);

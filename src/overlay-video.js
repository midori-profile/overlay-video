import React, { useRef, useEffect } from 'react';
import {
    createVertexBuffer,
    createProgram,
    setVertexBuffer,
    createImageTexture
} from './utils';

const VSCODE = `
attribute vec2 position;
varying vec2 v_Texcoord;
void main() {
    v_Texcoord = (position + 1.0) * 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
}`;

const FSCODE = `precision highp float;
uniform sampler2D tex;
varying vec2 v_Texcoord;
void main() {
    vec3 rgb = texture2D(tex, v_Texcoord * vec2(0.5, 1.0) + vec2(0.5, 0.0)).rgb;
    float a = texture2D(tex, v_Texcoord * vec2(0.5, 1.0)).r;
    gl_FragColor = vec4(rgb, a);
}`;

const AnimationVideo = ({ id, path, resourceWidth, resourceHeight, loop, autoplay, canvasStyle }) => {
    const canvasRef = useRef(null);
    const videoRef = useRef(null);
    const glRef = useRef(null);
    const posBufferRef = useRef(null);
    const videoTextureRef = useRef(null);
    const frameDrawHandlerRef = useRef(null);

    useEffect(() => {
        console.log('Initializing video element');
        const video = document.createElement('video');
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

        video.addEventListener('error', (e) => {
            console.error('Video error', e);
        });

        const canvas = canvasRef.current;
        const gl = canvas.getContext('webgl');
        if (!gl) {
            console.error('Failed to get WebGL context');
            return;
        }

        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const posBuffer = createVertexBuffer(gl, [
            -1, -1,
            1, -1,
            -1, 1,
            1, 1
        ]);

        const program = createProgram(gl, VSCODE, FSCODE);
        if (!program) {
            console.error('Failed to create shader program');
            return;
        }

        const texLoc = gl.getUniformLocation(program, 'tex');
        if (texLoc === null) {
            console.error('Failed to get uniform location for tex');
            return;
        }

        gl.useProgram(program);
        setVertexBuffer(gl, program, 'position', posBuffer, 2);
        gl.uniform1i(texLoc, 0);

        const videoTexture = createImageTexture(gl);
        glRef.current = gl;
        posBufferRef.current = posBuffer;
        videoTextureRef.current = videoTexture;

        frameDrawHandlerRef.current = prepareFrameDraw(gl, posBuffer, videoTexture, video);

        video.addEventListener('play', frameDrawHandlerRef.current.startFrameUpdate);
        video.addEventListener('pause', frameDrawHandlerRef.current.stopFrameUpdate);
        video.addEventListener('ended', frameDrawHandlerRef.current.stopFrameUpdate);

        console.log('Video element initialized:', video);

        return () => {
            console.log('Cleaning up video event listeners');
            video.removeEventListener('play', frameDrawHandlerRef.current.startFrameUpdate);
            video.removeEventListener('pause', frameDrawHandlerRef.current.stopFrameUpdate);
            video.removeEventListener('ended', frameDrawHandlerRef.current.stopFrameUpdate);
        };
    }, [path, loop, autoplay]);

    const prepareFrameDraw = (gl, posBuffer, videoTexture, video) => {
        let currentFrameID = null;

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
            startFrameUpdate,
            stopFrameUpdate
        };
    };

    return (
        <div>
            <canvas ref={canvasRef} width={resourceWidth / 2} height={resourceHeight} style={canvasStyle}></canvas>
        </div>
    );
};

export default AnimationVideo;

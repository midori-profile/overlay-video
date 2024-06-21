import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import {
    createAndUpdateWebGLBuffer,
    createWebGLProgramFromShaders,
    bindBufferToShaderAttribute,
    createAndSetupWebGLTexture,
    VERTEX_SHADER_CODE,
    FRAGMENT_SHADER_CODE,
} from './utils';

interface OverlayVideoProps {
    id: string;
    path: string;
    resourceWidth: number;
    resourceHeight: number;
    loop: boolean;
    autoplay: boolean;
    canvasStyle?: React.CSSProperties;
    onerror?: (e: Event) => void;
}

const OverlayVideo = forwardRef(({
    id,
    path,
    resourceWidth,
    resourceHeight,
    loop,
    autoplay,
    canvasStyle,
    onerror
}: OverlayVideoProps, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const glRef = useRef<WebGLRenderingContext | null>(null);
    const posBufferRef = useRef<WebGLBuffer | null>(null);
    const videoTextureRef = useRef<WebGLTexture | null>(null);
    const frameDrawHandlerRef = useRef<{ startFrameUpdate: () => void, stopFrameUpdate: () => void } | null>(null);

    useImperativeHandle(ref, () => ({
        play() {
            videoRef.current?.play();
        },
        pause() {
            videoRef.current?.pause();
        }
    }));

    useEffect(() => {
        initializeVideoElement();

        const canvas = canvasRef.current;
        if (!canvas) {
            console.error('Canvas element not found');
            return;
        }

        const gl = canvas.getContext('webgl');
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
            const video = document.createElement('video');
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

        function initializeWebGL(gl: WebGLRenderingContext) {
            gl.viewport(0, 0, canvas!.width, canvas!.height);
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            const posBuffer = createAndUpdateWebGLBuffer(gl, [
                -1, -1,
                1, -1,
                -1, 1,
                1, 1
            ]);

            const program = createWebGLProgramFromShaders(gl, VERTEX_SHADER_CODE, FRAGMENT_SHADER_CODE);
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
            // @ts-ignore
            bindBufferToShaderAttribute(gl, program, 'position', posBuffer, 2);
            gl.uniform1i(texLoc, 0);

            const videoTexture = createAndSetupWebGLTexture(gl);
            glRef.current = gl;
            posBufferRef.current = posBuffer;
            videoTextureRef.current = videoTexture;
            // @ts-ignore
            frameDrawHandlerRef.current = prepareFrameDraw(gl, posBuffer, videoTexture, videoRef.current!);
        }

        function setupVideoEventHandlers() {
            const video = videoRef.current!;
            if (frameDrawHandlerRef.current) {
                video.addEventListener('play', frameDrawHandlerRef.current.startFrameUpdate);
                video.addEventListener('pause', frameDrawHandlerRef.current.stopFrameUpdate);
                video.addEventListener('ended', frameDrawHandlerRef.current.stopFrameUpdate);
            }
            console.log('Video element initialized:', video);
        }

        function handleVideoError(e: Event) {
            console.error('Video error', e);
            if (onerror) {
                onerror(e);
            }
        }

        function cleanup() {
            console.log('Cleaning up video and canvas event listeners');
            const video = videoRef.current!;
            if (frameDrawHandlerRef.current) {
                video.removeEventListener('play', frameDrawHandlerRef.current.startFrameUpdate);
                video.removeEventListener('pause', frameDrawHandlerRef.current.stopFrameUpdate);
                video.removeEventListener('ended', frameDrawHandlerRef.current.stopFrameUpdate);
            }
            video.src = ''; // Set video src to an empty string
            document.body.removeChild(video);
            const canvas = canvasRef.current;
            if (canvas && canvas.parentElement) {
                // completely remove canvas element and cashed context
                canvas.width = 0; // Set canvas width to 0
                canvas.height = 0; // Set canvas height to 0
                canvas.parentElement.removeChild(canvas);
            }
        }

        function prepareFrameDraw(gl: WebGLRenderingContext, posBuffer: WebGLBuffer, videoTexture: WebGLTexture, video: HTMLVideoElement) {
            let currentFrameID: number | null = null;

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
                startFrameUpdate,
                stopFrameUpdate
            };
        }
    }, [path, loop, autoplay]);

    return (
        <div>
            <canvas ref={canvasRef} width={resourceWidth / 2} height={resourceHeight} style={canvasStyle}></canvas>
        </div>
    );
});

export default OverlayVideo;

/**
 * @file 一些 WebGL 的辅助函数
 * @author tianyu05@baidu.com
 */

export function createVertexBuffer(gl, data) {
    const buffer = gl.createBuffer();

    if (data) {
        updateVertexBuffer(gl, buffer, data);
    }

    return buffer;
}

export function updateVertexBuffer(gl, buffer, data) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    if (data instanceof Array) {
        data = new Float32Array(data);
    }

    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
}

export function createProgram(gl, vsCode, fsCode) {
    // 创建shader
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, vsCode);
    gl.shaderSource(fragmentShader, fsCode);

    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);

    [vertexShader, fragmentShader].forEach(shader => {
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            return null;
        }
    });

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    return program;
}

export function setVertexBuffer(gl, program, symbol, buffer, itemSize) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    const posLoc = gl.getAttribLocation(program, symbol);

    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, itemSize, gl.FLOAT, false, 0, 0);
}

export function createImageTexture(gl) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    // No mipmap
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    gl.bindTexture(gl.TEXTURE_2D, null);

    return tex;
}


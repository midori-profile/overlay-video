export function createVertexBuffer(gl: WebGLRenderingContext, data?: Float32Array | number[]): WebGLBuffer | null {
    const buffer = gl.createBuffer();

    if (buffer && data) {
        updateVertexBuffer(gl, buffer, data);
    }

    return buffer;
}

export function updateVertexBuffer(gl: WebGLRenderingContext, buffer: WebGLBuffer, data: Float32Array | number[]): void {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    if (Array.isArray(data)) {
        data = new Float32Array(data);
    }

    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
}

export function createProgram(gl: WebGLRenderingContext, vsCode: string, fsCode: string): WebGLProgram | null {
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    if (!vertexShader || !fragmentShader) {
        console.error('Error creating shaders');
        return null;
    }

    gl.shaderSource(vertexShader, vsCode);
    gl.shaderSource(fragmentShader, fsCode);

    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);

    [vertexShader, fragmentShader].forEach(shader => {
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(shader));
            return null;
        }
    });

    const program = gl.createProgram();
    if (!program) {
        console.error('Error creating program');
        return null;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Error linking program: ', gl.getProgramInfoLog(program));
        return null;
    }

    return program;
}

export function setVertexBuffer(gl: WebGLRenderingContext, program: WebGLProgram, symbol: string, buffer: WebGLBuffer, itemSize: number): void {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    const posLoc = gl.getAttribLocation(program, symbol);

    if (posLoc === -1) {
        console.error(`Attribute ${symbol} not found in shader program`);
        return;
    }

    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, itemSize, gl.FLOAT, false, 0, 0);
}

export function createImageTexture(gl: WebGLRenderingContext): WebGLTexture | null {
    const tex = gl.createTexture();
    if (!tex) {
        console.error('Error creating texture');
        return null;
    }
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    gl.bindTexture(gl.TEXTURE_2D, null);

    return tex;
}

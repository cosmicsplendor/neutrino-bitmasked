import config from "@config";
import getContext from "./utils/getContext";
import createShader from "./utils/createShader";
import createProgram from "./utils/createProgram";
import vertexShaderSrc from "./shaders/vertexShader";
import fragShaderSrc from "./shaders/fragmentShader";
import MatrixUtil, { IMatrix } from "./utils/Matrix";
import createMatStackMixin from "./createMatStackMixin";
import { WEBGL } from "../apis";
const DEFAULT_OVERLAY =  [0, 0, 0]
const NO_OVERLAY = [2, 2, 2]
class Webgl2Renderer {
    api = WEBGL;
    BATCH_SIZE = 500; // this is a safe generic (minimum) value for a wide variety of devices including mobile
    _useOverlay = 0;
    overlayStack = [DEFAULT_OVERLAY];
    alphaStack = [1.0];  // Initialize alpha stack with default alpha of 1

    constructor({ image, cnvQry, viewport, scene, clearColor = [0, 0, 0, 0], background = "#000000" }) {
        this.canvas = document.querySelector(cnvQry);
        this.gl = getContext(cnvQry);
        this.program = this.initProgram();
        this.image = image;
        this.scene = scene;
        this.clearColor = clearColor;
        this.initBuffers();
        this.initUniforms();
        this.viewport = viewport;
        this.matrixUtil = new MatrixUtil();
        Object.assign(this, createMatStackMixin()); // Must be done before calling resize
        this.initViewport(viewport);
        this.changeBackground(background);

        // Setup blending for premultiplied alpha
        const gl = this.gl;
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

        this.tex32Array = new Float32Array(this.BATCH_SIZE * 9);
        this.mat32Array = new Float32Array(this.BATCH_SIZE * 9);
        this.alpha32Array = new Float32Array(this.BATCH_SIZE);
        this.overlay32Array = new Float32Array(this.BATCH_SIZE * 3);
    }
    texMatCache = {};
    invCache = {
        _: {},
        get(val) {
            if (!this._[val]) this._[val] = 1 / val;
            return this._[val];
        }
    };
    instanceData = {
        mat: [],
        texMat: [],
        alpha: [],
        overlay: [],
        count: 0
    };
    set clearColor(arr) {
        this.gl.clearColor(...arr);
    }
    set transform(mat3) {
        this.gl.uniformMatrix3fv(this.uMat, false, mat3);
        this._transform = mat3;
    }
    get() {
        return this._transform;
    }
    initViewport(viewport) {
        this.resize(viewport);
        viewport.on("change", this.resize.bind(this));
    }
    changeBackground(bgColor, imageUrl, size = "100px", pos = "50% 50%") {
        this.canvas.setAttribute("style", `background-image:url(${imageUrl}); background-color: ${bgColor} !important; width: ${config.viewport.width}px; height: ${config.viewport.height};background-size: ${size} !important; background-position: ${pos};`);
    }
    translate(x, y) {
        this.matrixUtil.translate(this.getCurMat(), x, y);
    }
    rotate(rad) {
        this.matrixUtil.rotate(this.getCurMat(), rad);
    }
    scale(x, y) {
        this.matrixUtil.scale(this.getCurMat(), x, y);
    }
    clear() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }
    resize({ width, height }) {
        const absWidth = Math.round(width * config.devicePixelRatio);
        const absHeight = Math.round(height * config.devicePixelRatio);

        this.canvas.setAttribute("width", absWidth);
        this.canvas.setAttribute("height", absHeight);
        this.gl.viewport(0, 0, absWidth, absHeight);

        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;

        this.matrixUtil.identity(this.firstMat);
        this.matrixUtil.translate(this.firstMat, -1, 1);
        this.matrixUtil.scale(this.firstMat, 2 / absWidth, -2 / absHeight);
    }
    initProgram() {
        const gl = this.gl;
        const program = createProgram(
            gl,
            createShader(gl, vertexShaderSrc, gl.VERTEX_SHADER),
            createShader(gl, fragShaderSrc, gl.FRAGMENT_SHADER)
        );
        gl.useProgram(program);
        return program;
    }
    initUniforms() {
        const gl = this.gl;
        this.uMat = gl.getUniformLocation(this.program, "u_mat");
        this.transform = IMatrix.create();
    }
    initBuffers() {
        const gl = this.gl;

        // Create and bind VAO
        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        // Vertex Positions
        const posBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0, 0,
            1, 0,
            0, 1,
            1, 0,
            1, 1,
            0, 1
        ]), gl.STATIC_DRAW);

        const aVertPos = gl.getAttribLocation(this.program, "vert_pos");
        gl.enableVertexAttribArray(aVertPos);
        gl.vertexAttribPointer(aVertPos, 2, gl.FLOAT, false, 0, 0);

        // Instance Transformation Matrices
        const instanceMatBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, instanceMatBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, 0, gl.DYNAMIC_DRAW);

        const aInstanceMat = [
            gl.getAttribLocation(this.program, "instance_mat"),
            gl.getAttribLocation(this.program, "instance_mat") + 1,
            gl.getAttribLocation(this.program, "instance_mat") + 2
        ];

        const matSize = 3; // 3x3 matrix

        for (let i = 0; i < matSize; i++) {
            gl.enableVertexAttribArray(aInstanceMat[i]);
            gl.vertexAttribPointer(aInstanceMat[i], 3, gl.FLOAT, false, 9 * 4, i * 3 * 4);
            gl.vertexAttribDivisor(aInstanceMat[i], 1); // Advance per instance
        }

        // Instance Texture Matrices
        const instanceTexMatBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, instanceTexMatBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, 0, gl.DYNAMIC_DRAW);

        const aInstanceTexMat = [
            gl.getAttribLocation(this.program, "instance_tex_mat"),
            gl.getAttribLocation(this.program, "instance_tex_mat") + 1,
            gl.getAttribLocation(this.program, "instance_tex_mat") + 2
        ];

        for (let i = 0; i < matSize; i++) {
            gl.enableVertexAttribArray(aInstanceTexMat[i]);
            gl.vertexAttribPointer(aInstanceTexMat[i], 3, gl.FLOAT, false, 9 * 4, i * 3 * 4);
            gl.vertexAttribDivisor(aInstanceTexMat[i], 1);
        }

        // Instance Alpha
        const instanceAlphaBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, instanceAlphaBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, 0, gl.DYNAMIC_DRAW);

        const aInstanceAlpha = gl.getAttribLocation(this.program, "instance_alpha");
        gl.enableVertexAttribArray(aInstanceAlpha);
        gl.vertexAttribPointer(aInstanceAlpha, 1, gl.FLOAT, false, 0, 0);
        gl.vertexAttribDivisor(aInstanceAlpha, 1);

        // Instance Overlay
        const instanceOverlayBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, instanceOverlayBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, 0, gl.DYNAMIC_DRAW);

        const aInstanceOverlay = gl.getAttribLocation(this.program, "instance_overlay");
        gl.enableVertexAttribArray(aInstanceOverlay);
        gl.vertexAttribPointer(aInstanceOverlay, 3, gl.FLOAT, false, 0, 0);
        gl.vertexAttribDivisor(aInstanceOverlay, 1);

        // Unbind VAO
        gl.bindVertexArray(null);

        // Store instance buffers for later use
        this.instanceBuffers = {
            instanceMatBuffer,
            instanceTexMatBuffer,
            instanceAlphaBuffer,
            instanceOverlayBuffer
        };
    }
    renderRecursively(node = this.scene) {
        if (!node._visible) { return; }
        if (node === this.scene) {
            this.invisibleCount = 0;
            this.clear();
            this.overlayStack = [DEFAULT_OVERLAY]; // Reset overlay stack
            this.alphaStack = [1.0];  // Reset alpha stack
        }

        this.save();

        // Push overlay and alpha to stacks
        if (node.overlay) {
            this.overlayStack.push(node.overlay);
        } else if (node.noOverlay) {
            this.overlayStack.push(NO_OVERLAY);
        }

        // Push *multiplied* alpha to the stack
        const currentAlpha = this.alphaStack[this.alphaStack.length - 1];
        this.alphaStack.push(currentAlpha * (node.alpha !== undefined ? node.alpha : 1.0));


        this.collectInstanceData(node);
        if (this.instanceData.count > this.BATCH_SIZE - 1) {
            this.flushBatch();
        }
        if (node.children) {
            for (const child of node.children) {
                this.renderRecursively(child);
            }
        }

        // Pop overlay and alpha
        if (node.overlay || node.noOverlay) {
            this.overlayStack.pop();
        }
        this.alphaStack.pop(); // Pop the alpha for this node

        this.restore();

        if (node !== this.scene) return;
        // After collecting all instance data, render each batch
        this.flushBatch();
    }
    collectInstanceData(node) {
        this.translate(node.smooth ? node.pos.x : Math.floor(node.pos.x), node.smooth ? node.pos.y : Math.floor(node.pos.y));

        if (node.initialRotation) {
            this.rotate(node.initialRotation);
            this.translate(node.initialPivotX, 0);
        }
        if (node.rotation) {
            node.anchor && this.translate(node.anchor.x, node.anchor.y);
            this.rotate(node.rotation);
            node.anchor && this.translate(-node.anchor.x, -node.anchor.y);
        }
        node.pivot && this.translate(node.pivot.x, node.pivot.y);
        if (node.scale) {
            this.scale(node.scale.x, node.scale.y);
        }
        if (!node.frame) {
            return; // if the node isn't renderable, just do transforms
        }

        const meta = this.meta[node.frame];
        const width = node.w;
        const height = node.h;

        if (!this.texMatCache[node.frame]) {
            const texMat = this.matrixUtil.create();
            const srcX = meta.x;
            const srcY = meta.y;

            this.matrixUtil.translate(texMat, srcX / this.image.width, srcY / this.image.height);
            this.matrixUtil.scale(texMat, width / this.image.width, height / this.image.height);

            this.texMatCache[node.frame] = texMat;
        }
        this.scale(width, height);
        this.instanceData.mat.push(...this.getCurMat());
        this.instanceData.texMat.push(...this.texMatCache[node.frame]);

        // Use the *current* alpha from the stack (which is the multiplied value)
        const currentAlpha = this.alphaStack[this.alphaStack.length - 1];
        this.instanceData.alpha.push(currentAlpha);


        // Use current overlay from stack
        this.instanceData.overlay.push(...this.overlayStack[this.overlayStack.length - 1]);
        this.instanceData.count += 1;
        if (node.children) this.scale(this.invCache.get(width), this.invCache.get(height));
    }
    setTexatlas(image, meta) {
        const gl = this.gl;
        const texture = gl.createTexture();
        const uTexUnit = gl.getUniformLocation(this.program, "tex_unit");
        const texUnit = 0;
        this.meta = meta;
        this.image = image;
        gl.activeTexture(gl.TEXTURE0 + texUnit);
        gl.uniform1i(uTexUnit, texUnit);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.generateMipmap(gl.TEXTURE_2D);
    }
    flushBatch() {
        if (this.instanceData.count === 0) return;
        this.uploadInstanceData();
        this.drawInstances(this.instanceData.count);
        // Clear instance data after rendering
        this.clearInstanceData();
    }
    uploadInstanceData() {
        const gl = this.gl;

        this.mat32Array.set(this.instanceData.mat);
        this.tex32Array.set(this.instanceData.texMat);
        this.alpha32Array.set(this.instanceData.alpha);  // alpha32Array is already correct
        this.overlay32Array.set(this.instanceData.overlay);

        // Upload transformation matrices
        gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffers.instanceMatBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.mat32Array, gl.DYNAMIC_DRAW);

        // Upload texture matrices
        gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffers.instanceTexMatBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.tex32Array, gl.DYNAMIC_DRAW);

        // Upload Alpha
        gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffers.instanceAlphaBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.alpha32Array, gl.DYNAMIC_DRAW); // Use alpha32Array

        // Upload overlay values
        gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffers.instanceOverlayBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.overlay32Array, gl.DYNAMIC_DRAW);

        gl.bindVertexArray(null);
    }
    drawInstances(count) {
        const gl = this.gl;
        gl.bindVertexArray(this.vao);
        gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, count);
        gl.bindVertexArray(null);
    }
    clearInstanceData() {
        this.instanceData.mat.length = 0;
        this.instanceData.texMat.length = 0;
        this.instanceData.alpha.length = 0;
        this.instanceData.overlay.length = 0;
        this.instanceData.count = 0;
    }
}

export default Webgl2Renderer
import { mat3, vec2 } from "gl-matrix";

export class IMatrix {
    static create() {
        return mat3.create();
    }

    static identity(mat) {
        mat3.identity(mat);
        return mat;
    }

    constructor() {
        this.tMat = IMatrix.create();
        this.sMat = IMatrix.create();
        this.rMat = IMatrix.create();
    }

    scaled(x, y = x) {
        const mat = IMatrix.identity(this.sMat);
        mat[0] = x;
        mat[4] = y;
        return mat;
    }

    rotated(rad) {
        const mat = IMatrix.identity(this.rMat);
        const s = Math.sin(rad);
        const c = Math.cos(rad);
        mat[0] = c;
        mat[1] = s;
        mat[3] = -s;
        mat[4] = c;
        return mat;
    }

    translated(x, y) {
        const mat = IMatrix.identity(this.tMat);
        mat[6] = x;
        mat[7] = y;
        return mat;
    }
}

class Matrix {
    constructor() {
        this.iMat = new IMatrix();
        this.temp = IMatrix.create();
        this.vec = vec2.create();
    }

    create() {
        return IMatrix.create();
    }

    identity(mat) {
        return IMatrix.identity(mat);
    }

    multiply(a, b) {
        const temp = this.temp;
        temp[0] = a[0] * b[0] + a[1] * b[3] + a[2] * b[6];
        temp[1] = a[0] * b[1] + a[1] * b[4] + a[2] * b[7];
        temp[2] = a[0] * b[2] + a[1] * b[5] + a[2] * b[8];
        temp[3] = a[3] * b[0] + a[4] * b[3] + a[5] * b[6];
        temp[4] = a[3] * b[1] + a[4] * b[4] + a[5] * b[7];
        temp[5] = a[3] * b[2] + a[4] * b[5] + a[5] * b[8];
        temp[6] = a[6] * b[0] + a[7] * b[3] + a[8] * b[6];
        temp[7] = a[6] * b[1] + a[7] * b[4] + a[8] * b[7];
        temp[8] = a[6] * b[2] + a[7] * b[5] + a[8] * b[8];
        for (let i = 0; i < 9; i++) {
            b[i] = temp[i];
        }
    }

    rotate(mat, rad) {
        mat3.rotate(mat, mat, rad);
    }

    scale(mat, x, y) {
        vec2.set(this.vec, x, y);
        mat3.scale(mat, mat, this.vec);
    }

    translate(mat, x, y) {
        vec2.set(this.vec, x, y);
        mat3.translate(mat, mat, this.vec);
    }
}

export default Matrix;
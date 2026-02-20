console.log("Matrix JS Loaded");

/* ========================
   解析矩阵
======================== */

function parseMatrix(input) {

    if (!input.trim()) {
        throw new Error("Matrix input cannot be empty.");
    }

    const rows = input.trim().split("\n");

    const matrix = rows.map(row => {
        const values = row.trim().split(/\s+/);

        if (values.some(v => isNaN(v))) {
            throw new Error("Matrix contains invalid numbers.");
        }

        return values.map(Number);
    });

    const columnCount = matrix[0].length;

    for (let i = 1; i < matrix.length; i++) {
        if (matrix[i].length !== columnCount) {
            throw new Error("All rows must have the same number of columns.");
        }
    }

    return matrix;
}

/* ========================
   获取形状
======================== */

function getShape(matrix) {
    return {
        rows: matrix.length,
        cols: matrix[0].length
    };
}

/* ========================
   显示矩阵
======================== */

function displayMatrix(matrix) {
    return matrix.map(row => row.join(" ")).join("\n");
}

/* ========================
   加法
======================== */

function addMatrices() {
    try {
        const A = parseMatrix(document.getElementById("matrixA").value);
        const B = parseMatrix(document.getElementById("matrixB").value);

        const shapeA = getShape(A);
        const shapeB = getShape(B);

        if (shapeA.rows !== shapeB.rows || shapeA.cols !== shapeB.cols) {
            throw new Error(
                `Addition requires same dimensions.
A is ${shapeA.rows}×${shapeA.cols}
B is ${shapeB.rows}×${shapeB.cols}`
            );
        }

        const result = A.map((row, i) =>
            row.map((val, j) => val + B[i][j])
        );

        document.getElementById("result").textContent = displayMatrix(result);

    } catch (error) {
        document.getElementById("result").textContent = "Error:\n" + error.message;
    }
}

/* ========================
   乘法
======================== */

function multiplyMatrices() {
    try {
        const A = parseMatrix(document.getElementById("matrixA").value);
        const B = parseMatrix(document.getElementById("matrixB").value);

        const shapeA = getShape(A);
        const shapeB = getShape(B);

        if (shapeA.cols !== shapeB.rows) {
            throw new Error(
`Multiplication condition not satisfied.
A is ${shapeA.rows}×${shapeA.cols}
B is ${shapeB.rows}×${shapeB.cols}
Columns of A must equal rows of B.`
);
        }

        const result = [];

        for (let i = 0; i < shapeA.rows; i++) {
            result[i] = [];

            for (let j = 0; j < shapeB.cols; j++) {
                let sum = 0;

                for (let k = 0; k < shapeA.cols; k++) {
                    sum += A[i][k] * B[k][j];
                }

                result[i][j] = sum;
            }
        }

        document.getElementById("result").textContent = displayMatrix(result);

    } catch (error) {
        document.getElementById("result").textContent = "Error:\n" + error.message;
    }
}

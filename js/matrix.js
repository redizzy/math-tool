console.log("Matrix JS Loaded");

/* ========================
   解析矩阵
======================== */

function parseMatrix(input) {

    if (!input.trim()) {
        throw new Error("Matrix input cannot be empty.");
    }

    const rows = input.trim().split("\n");

    function gcd(a, b) {
        a = Math.abs(a);
        b = Math.abs(b);
        while (b) {
            const t = a % b;
            a = b;
            b = t;
        }
        return a || 1;
    }

    function makeFrac(n, d) {
        if (d === 0) throw new Error("Division by zero in fraction.");
        if (d < 0) {
            n = -n;
            d = -d;
        }
        const g = gcd(n, d);
        return { n: Math.trunc(n / g), d: Math.trunc(d / g) };
    }

    function decimalToFrac(str) {
        let s = str.trim();
        let neg = false;
        if (s.startsWith("+")) s = s.slice(1);
        if (s.startsWith("-")) {
            neg = true;
            s = s.slice(1);
        }
        if (!s.includes(".")) {
            const n = parseInt(s, 10);
            if (isNaN(n)) throw new Error("Matrix contains invalid numbers.");
            return makeFrac(neg ? -n : n, 1);
        }
        const parts = s.split(".");
        if (parts.length !== 2) throw new Error("Matrix contains invalid numbers.");
        const intPart = parts[0] ? parseInt(parts[0], 10) : 0;
        const fracPart = parts[1];
        if (!/^\d+$/.test(fracPart)) throw new Error("Matrix contains invalid numbers.");
        const d = Math.pow(10, fracPart.length);
        const n = intPart * d + parseInt(fracPart, 10);
        return makeFrac(neg ? -n : n, d);
    }

    function parseToken(s) {
        const t = s.trim();
        if (!t) throw new Error("Matrix contains invalid numbers.");
        if (t.includes("/")) {
            const parts = t.split("/");
            if (parts.length !== 2) throw new Error("Matrix contains invalid numbers.");
            const n = parseInt(parts[0], 10);
            const d = parseInt(parts[1], 10);
            if (isNaN(n) || isNaN(d)) throw new Error("Matrix contains invalid numbers.");
            return makeFrac(n, d);
        }
        if (t.includes(".")) {
            return decimalToFrac(t);
        }
        const n = parseInt(t, 10);
        if (isNaN(n)) throw new Error("Matrix contains invalid numbers.");
        return makeFrac(n, 1);
    }

    const matrix = rows.map(row => {
        const values = row.trim().split(/\s+/);
        return values.map(parseToken);
    });

    const columnCount = matrix[0].length;

    for (let i = 1; i < matrix.length; i++) {
        if (matrix[i].length !== columnCount) {
            throw new Error("All rows must have the same number of columns.");
        }
    }

    return matrix;
}

function parseMatrixNumeric(input) {
    if (!input.trim()) {
        throw new Error("Matrix input cannot be empty.");
    }
    const rows = input.trim().split("\n");
    function parseNumToken(s) {
        const t = s.trim();
        if (!t) throw new Error("Matrix contains invalid numbers.");
        if (t.includes("/")) {
            const parts = t.split("/");
            if (parts.length !== 2) throw new Error("Matrix contains invalid numbers.");
            const n = parseFloat(parts[0]);
            const d = parseFloat(parts[1]);
            if (!isFinite(n) || !isFinite(d) || d === 0) throw new Error("Matrix contains invalid numbers.");
            return n / d;
        }
        const v = parseFloat(t);
        if (!isFinite(v)) throw new Error("Matrix contains invalid numbers.");
        return v;
    }
    const matrix = rows.map(row => row.trim().split(/\s+/).map(parseNumToken));
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
    function formatFrac(f) {
        if (f.d === 1) return String(f.n);
        return f.n + "/" + f.d;
    }
    return matrix.map(row => row.map(formatFrac).join(" ")).join("\n");
}

function displayMatrixNumeric(matrix) {
    return matrix.map(row => row.map(v => Number.isFinite(v) ? v.toFixed(6) : String(v)).join(" ")).join("\n");
}

function displayMatrixLatex(matrix) {
    function fmt(f) {
        if (f.d === 1) return String(f.n);
        return "\\frac{" + f.n + "}{" + f.d + "}";
    }
    const rows = matrix.map(row => row.map(fmt).join(" & ")).join(" \\\\ ");
    return "$$\\begin{bmatrix}" + rows + "\\end{bmatrix}$$";
}

/* ========================
   加法
======================== */

function addMatrices() {
    try {
        const modeEl = document.querySelector('input[name="matrixMode"]:checked');
        const mode = modeEl ? modeEl.value : "decimal";
        if (mode === "decimal") {
            const A = parseMatrixNumeric(document.getElementById("matrixA").value);
            const B = parseMatrixNumeric(document.getElementById("matrixB").value);
            const shapeA = getShape(A);
            const shapeB = getShape(B);
            if (shapeA.rows !== shapeB.rows || shapeA.cols !== shapeB.cols) {
                throw new Error(`Addition requires same dimensions.
A is ${shapeA.rows}×${shapeA.cols}
B is ${shapeB.rows}×${shapeB.cols}`);
            }
            const result = A.map((row, i) => row.map((val, j) => val + B[i][j]));
            document.getElementById("result").textContent = displayMatrixNumeric(result);
            return;
        }
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

        function addFrac(x, y) {
            return (function () {
                const n = x.n * y.d + y.n * x.d;
                const d = x.d * y.d;
                return (function () {
                    function gcd(a, b) {
                        a = Math.abs(a);
                        b = Math.abs(b);
                        while (b) {
                            const t = a % b;
                            a = b;
                            b = t;
                        }
                        return a || 1;
                    }
                    if (d === 0) throw new Error("Division by zero in fraction.");
                    let nn = n, dd = d;
                    if (dd < 0) { nn = -nn; dd = -dd; }
                    const g = gcd(nn, dd);
                    return { n: Math.trunc(nn / g), d: Math.trunc(dd / g) };
                })();
            })();
        }

        const result = A.map((row, i) => row.map((val, j) => addFrac(val, B[i][j])));
        const latex = displayMatrixLatex(result);
        const el = document.getElementById("result");
        el.innerHTML = latex;
        if (window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise();

    } catch (error) {
        document.getElementById("result").textContent = "Error:\n" + error.message;
    }
}

/* ========================
   乘法
======================== */

function multiplyMatrices() {
    try {
        const modeEl = document.querySelector('input[name="matrixMode"]:checked');
        const mode = modeEl ? modeEl.value : "decimal";
        if (mode === "decimal") {
            const A = parseMatrixNumeric(document.getElementById("matrixA").value);
            const B = parseMatrixNumeric(document.getElementById("matrixB").value);
            const shapeA = getShape(A);
            const shapeB = getShape(B);
            if (shapeA.cols !== shapeB.rows) {
                throw new Error(`Multiplication condition not satisfied.
A is ${shapeA.rows}×${shapeA.cols}
B is ${shapeB.rows}×${shapeB.cols}
Columns of A must equal rows of B.`);
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
            document.getElementById("result").textContent = displayMatrixNumeric(result);
            return;
        }
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
                let sum = { n: 0, d: 1 };

                for (let k = 0; k < shapeA.cols; k++) {
                    const prod = (function () {
                        const n = A[i][k].n * B[k][j].n;
                        const d = A[i][k].d * B[k][j].d;
                        function gcd(a, b) {
                            a = Math.abs(a);
                            b = Math.abs(b);
                            while (b) {
                                const t = a % b;
                                a = b;
                                b = t;
                            }
                            return a || 1;
                        }
                        if (d === 0) throw new Error("Division by zero in fraction.");
                        let nn = n, dd = d;
                        if (dd < 0) { nn = -nn; dd = -dd; }
                        const g = gcd(nn, dd);
                        return { n: Math.trunc(nn / g), d: Math.trunc(dd / g) };
                    })();
                    sum = (function () {
                        const n = sum.n * prod.d + prod.n * sum.d;
                        const d = sum.d * prod.d;
                        function gcd(a, b) {
                            a = Math.abs(a);
                            b = Math.abs(b);
                            while (b) {
                                const t = a % b;
                                a = b;
                                b = t;
                            }
                            return a || 1;
                        }
                        if (d === 0) throw new Error("Division by zero in fraction.");
                        let nn = n, dd = d;
                        if (dd < 0) { nn = -nn; dd = -dd; }
                        const g = gcd(nn, dd);
                        return { n: Math.trunc(nn / g), d: Math.trunc(dd / g) };
                    })();
                }

                result[i][j] = sum;
            }
        }

        const latex = displayMatrixLatex(result);
        const el = document.getElementById("result");
        el.innerHTML = latex;
        if (window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise();

    } catch (error) {
        document.getElementById("result").textContent = "Error:\n" + error.message;
    }
}

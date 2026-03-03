function parseMatrix(input) {
    let rows = input.trim().split("\n");
    return rows.map(row =>
        row.trim().split(/\s+/).map(Number)
    );
}

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

function addFrac(a, b) {
    return makeFrac(a.n * b.d + b.n * a.d, a.d * b.d);
}
function subFrac(a, b) {
    return makeFrac(a.n * b.d - b.n * a.d, a.d * b.d);
}
function mulFrac(a, b) {
    return makeFrac(a.n * b.n, a.d * b.d);
}
function divFrac(a, b) {
    return makeFrac(a.n * b.d, a.d * b.n);
}
function isZeroFrac(a) {
    return a.n === 0;
}

function parseFracToken(s) {
    const t = s.trim();
    if (!t) throw new Error("Invalid number.");
    if (t.includes("/")) {
        const parts = t.split("/");
        if (parts.length !== 2) throw new Error("Invalid number.");
        const n = parseInt(parts[0], 10);
        const d = parseInt(parts[1], 10);
        if (isNaN(n) || isNaN(d)) throw new Error("Invalid number.");
        return makeFrac(n, d);
    }
    if (t.includes(".")) {
        const parts = t.split(".");
        const intPart = parts[0] ? parseInt(parts[0], 10) : 0;
        const fracPart = parts[1];
        if (!/^\d+$/.test(fracPart)) throw new Error("Invalid number.");
        const d = Math.pow(10, fracPart.length);
        const n = intPart * d + parseInt(fracPart, 10);
        return makeFrac(n, d);
    }
    const n = parseInt(t, 10);
    if (isNaN(n)) throw new Error("Invalid number.");
    return makeFrac(n, 1);
}

function parseMatrixFrac(input) {
    let rows = input.trim().split("\n");
    let M = rows.map(row => row.trim().split(/\s+/).map(parseFracToken));
    const columnCount = M[0].length;
    for (let i = 1; i < M.length; i++) {
        if (M[i].length !== columnCount) {
            throw new Error("All rows must have the same number of columns.");
        }
    }
    return M;
}

function buildAugmentedMatrix(A, b) {
    let m = A.length;

    if (b.length !== m) {
        throw new Error("Dimension mismatch: A rows must equal b rows.");
    }

    let augmented = [];

    for (let i = 0; i < m; i++) {
        augmented.push([...A[i], b[i][0]]);
    }

    return augmented;
}

function buildAugmentedMatrixFrac(A, b) {
    let m = A.length;
    if (b.length !== m) {
        throw new Error("Dimension mismatch: A rows must equal b rows.");
    }
    let augmented = [];
    for (let i = 0; i < m; i++) {
        augmented.push([...A[i], b[i][0]]);
    }
    return augmented;
}

function gaussianElimination(matrix) {
    let m = matrix.length;
    let n = matrix[0].length;
    let rank = 0;

    for (let col = 0; col < n - 1 && rank < m; col++) {
        let pivot = rank;
        while (pivot < m && Math.abs(matrix[pivot][col]) < 1e-10) {
            pivot++;
        }

        if (pivot === m) continue;

        [matrix[rank], matrix[pivot]] = [matrix[pivot], matrix[rank]];

        let pivotVal = matrix[rank][col];
        for (let j = col; j < n; j++) {
            matrix[rank][j] /= pivotVal;
        }

        for (let i = 0; i < m; i++) {
            if (i !== rank) {
                let factor = matrix[i][col];
                for (let j = col; j < n; j++) {
                    matrix[i][j] -= factor * matrix[rank][j];
                }
            }
        }

        rank++;
    }

    return matrix;
}

function gaussianEliminationFrac(matrix) {
    let m = matrix.length;
    let n = matrix[0].length;
    let rank = 0;
    for (let col = 0; col < n - 1 && rank < m; col++) {
        let pivot = rank;
        while (pivot < m && isZeroFrac(matrix[pivot][col])) {
            pivot++;
        }
        if (pivot === m) continue;
        [matrix[rank], matrix[pivot]] = [matrix[pivot], matrix[rank]];
        let pivotVal = matrix[rank][col];
        for (let j = col; j < n; j++) {
            matrix[rank][j] = divFrac(matrix[rank][j], pivotVal);
        }
        for (let i = 0; i < m; i++) {
            if (i !== rank) {
                let factor = matrix[i][col];
                for (let j = col; j < n; j++) {
                    matrix[i][j] = subFrac(matrix[i][j], mulFrac(factor, matrix[rank][j]));
                }
            }
        }
        rank++;
    }
    return matrix;
}

function analyzeSolution(matrix) {
    let m = matrix.length;
    let n = matrix[0].length;

    let rank = 0;
    let inconsistent = false;

    for (let i = 0; i < m; i++) {
        let allZero = true;

        for (let j = 0; j < n - 1; j++) {
            if (Math.abs(matrix[i][j]) > 1e-10) {
                allZero = false;
                break;
            }
        }

        if (!allZero) rank++;
        else if (Math.abs(matrix[i][n - 1]) > 1e-10) {
            inconsistent = true;
        }
    }

    if (inconsistent) return "No solution";
    if (rank < n - 1) return "Infinite solutions";

    return "Unique solution";
}

function analyzeSolutionFrac(matrix) {
    let m = matrix.length;
    let n = matrix[0].length;
    let rank = 0;
    let inconsistent = false;
    for (let i = 0; i < m; i++) {
        let allZero = true;
        for (let j = 0; j < n - 1; j++) {
            if (!isZeroFrac(matrix[i][j])) {
                allZero = false;
                break;
            }
        }
        if (!allZero) rank++;
        else if (!isZeroFrac(matrix[i][n - 1])) {
            inconsistent = true;
        }
    }
    if (inconsistent) return "No solution";
    if (rank < n - 1) return "Infinite solutions";
    return "Unique solution";
}

function extractSolution(matrix) {
    let n = matrix[0].length - 1;
    let solution = [];

    for (let i = 0; i < n; i++) {
        solution.push(matrix[i][n]);
    }

    return solution;
}

function extractSolutionFrac(matrix) {
    let n = matrix[0].length - 1;
    let solution = [];
    for (let i = 0; i < n; i++) {
        solution.push(matrix[i][n]);
    }
    return solution;
}

function solveSystem() {
    try {
        let Ainput = document.getElementById("matrixA").value;
        let Binput = document.getElementById("vectorB").value;

        if (!Ainput.trim() || !Binput.trim()) {
            alert("Please enter both A and b.");
            return;
        }

        const modeEl = document.querySelector('input[name="solverMode"]:checked');
        const mode = modeEl ? modeEl.value : "decimal";
        if (mode === "decimal") {
            let A = parseMatrix(Ainput);
            let b = parseMatrix(Binput);
            let augmented = buildAugmentedMatrix(A, b);
            let reduced = gaussianElimination(augmented);
            let type = analyzeSolution(reduced);
            let resultDiv = document.getElementById("result");
            let html = "";
            if (type === "Unique solution") {
                let sol = extractSolution(reduced);
                html += "<p><strong>Unique Solution:</strong></p>";
                html += sol.map((val, i) => `x${i+1} = ${val.toFixed(6)}`).join("<br>");
            } else if (type === "Infinite solutions") {
                let solStruct = extractInfiniteSolution(reduced);
                html += "<p><strong>Infinite Solutions</strong></p>";
                html += "<p><u>One particular solution:</u></p>";
                html += solStruct.particular.map((v, i) => `x${i+1} = ${v.toFixed(6)}`).join("<br>");
                html += "<p><br><u>Basis of solution space:</u></p>";
                solStruct.basis.forEach((vec, idx) => {
                    html += `<p>v${idx+1} = ( ${vec.map(v => v.toFixed(6)).join(", ")} )</p>`;
                });
            } else {
                html += `<p><strong>${type}</strong></p>`;
            }
            resultDiv.innerHTML = html;
            return;
        }

        let A = parseMatrixFrac(Ainput);
        let b = parseMatrixFrac(Binput);
        let augmented = buildAugmentedMatrixFrac(A, b);
        let reduced = gaussianEliminationFrac(augmented);
        let type = analyzeSolutionFrac(reduced);

        let resultDiv = document.getElementById("result");
        let html = "";

        if (type === "Unique solution") {
            let sol = extractSolutionFrac(reduced);
            html += "<p><strong>Unique Solution:</strong></p>";
            html += sol.map((val, i) => {
                const s = val.d === 1 ? String(val.n) : `\\frac{${val.n}}{${val.d}}`;
                return `$$x_{${i+1}} = ${s}$$`;
            }).join("");

        }

        else if (type === "Infinite solutions") {
            let solStruct = extractInfiniteSolutionFrac(reduced);
            html += "<p><strong>Infinite Solutions</strong></p>";
            html += "<p><u>One particular solution:</u></p>";
            html += solStruct.particular.map((v, i) => {
                const s = v.d === 1 ? String(v.n) : `\\frac{${v.n}}{${v.d}}`;
                return `$$x_{${i+1}} = ${s}$$`;
            }).join("");
            html += "<p><br><u>Basis of solution space:</u></p>";
            solStruct.basis.forEach((vec, idx) => {
                const entries = vec.map(v => v.d === 1 ? String(v.n) : `\\frac{${v.n}}{${v.d}}`).join(", ");
                html += `$$v_{${idx+1}} = ( ${entries} )$$`;
            });

        }

        else {
            html += `<p><strong>${type}</strong></p>`;
        }

        resultDiv.innerHTML = html;
        if (window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise();

    } catch (error) {
        document.getElementById("result").innerHTML =
            `<p style="color:red;"><strong>Error:</strong> ${error.message}</p>`;
    }
}

function findPivotColumns(matrix) {
    let m = matrix.length;
    let n = matrix[0].length - 1;

    let pivotCols = [];

    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (Math.abs(matrix[i][j] - 1) < 1e-10) {
                let isPivot = true;
                for (let k = 0; k < m; k++) {
                    if (k !== i && Math.abs(matrix[k][j]) > 1e-10) {
                        isPivot = false;
                        break;
                    }
                }
                if (isPivot) {
                    pivotCols.push(j);
                    break;
                }
            }
        }
    }

    return pivotCols;
}

function extractInfiniteSolution(matrix) {
    let m = matrix.length;
    let n = matrix[0].length - 1;

    let pivotCols = findPivotColumns(matrix);

    let freeCols = [];
    for (let j = 0; j < n; j++) {
        if (!pivotCols.includes(j)) {
            freeCols.push(j);
        }
    }

    let particular = new Array(n).fill(0);

    for (let i = 0; i < pivotCols.length; i++) {
        let col = pivotCols[i];
        particular[col] = matrix[i][n];
    }

    let basis = [];

    for (let free of freeCols) {
        let vec = new Array(n).fill(0);
        vec[free] = 1;

        for (let i = 0; i < pivotCols.length; i++) {
            let pivotCol = pivotCols[i];
            vec[pivotCol] = -matrix[i][free];
        }

        basis.push(vec);
    }

    return {
        particular,
        basis
    };
}

function findPivotColumnsFrac(matrix) {
    let m = matrix.length;
    let n = matrix[0].length - 1;
    let pivotCols = [];
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (matrix[i][j].n === 1 && matrix[i][j].d === 1) {
                let isPivot = true;
                for (let k = 0; k < m; k++) {
                    if (k !== i && !isZeroFrac(matrix[k][j])) {
                        isPivot = false;
                        break;
                    }
                }
                if (isPivot) {
                    pivotCols.push(j);
                    break;
                }
            }
        }
    }
    return pivotCols;
}

function extractInfiniteSolutionFrac(matrix) {
    let m = matrix.length;
    let n = matrix[0].length - 1;
    let pivotCols = findPivotColumnsFrac(matrix);
    let freeCols = [];
    for (let j = 0; j < n; j++) {
        if (!pivotCols.includes(j)) {
            freeCols.push(j);
        }
    }
    let particular = new Array(n).fill(null);
    for (let i = 0; i < pivotCols.length; i++) {
        let col = pivotCols[i];
        particular[col] = matrix[i][n];
    }
    for (let j = 0; j < n; j++) {
        if (particular[j] === null) particular[j] = makeFrac(0, 1);
    }
    let basis = [];
    for (let free of freeCols) {
        let vec = new Array(n).fill(null);
        for (let j = 0; j < n; j++) {
            vec[j] = makeFrac(0, 1);
        }
        vec[free] = makeFrac(1, 1);
        for (let i = 0; i < pivotCols.length; i++) {
            let pivotCol = pivotCols[i];
            vec[pivotCol] = makeFrac(-matrix[i][free].n, matrix[i][free].d);
        }
        basis.push(vec);
    }
    return {
        particular,
        basis
    };
}

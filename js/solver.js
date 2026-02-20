function parseMatrix(input) {
    let rows = input.trim().split("\n");
    return rows.map(row =>
        row.trim().split(/\s+/).map(Number)
    );
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

function extractSolution(matrix) {
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

        let A = parseMatrix(Ainput);
        let b = parseMatrix(Binput);

        let augmented = buildAugmentedMatrix(A, b);
        let reduced = gaussianElimination(augmented);
        let type = analyzeSolution(reduced);

        let resultDiv = document.getElementById("result");
        let html = "";

        // =============================
        // 1️⃣ Unique Solution
        // =============================
        if (type === "Unique solution") {

            let sol = extractSolution(reduced);

            html += "<p><strong>Unique Solution:</strong></p>";
            html += sol.map((val, i) =>
                `x${i+1} = ${val.toFixed(6)}`
            ).join("<br>");

        }

        // =============================
        // 2️⃣ Infinite Solutions
        // =============================
        else if (type === "Infinite solutions") {

            let solStruct = extractInfiniteSolution(reduced);

            html += "<p><strong>Infinite Solutions</strong></p>";

            // ---- Particular solution ----
            html += "<p><u>One particular solution:</u></p>";
            html += solStruct.particular.map((v, i) =>
                `x${i+1} = ${v.toFixed(6)}`
            ).join("<br>");

            // ---- Basis of homogeneous solution ----
            html += "<p><br><u>Basis of solution space:</u></p>";

            solStruct.basis.forEach((vec, idx) => {
                html += `<p>v${idx+1} = ( ${vec.map(v => v.toFixed(6)).join(", ")} )</p>`;
            });

        }

        // =============================
        // 3️⃣ No Solution
        // =============================
        else {
            html += `<p><strong>${type}</strong></p>`;
        }

        resultDiv.innerHTML = html;

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
                // 确认该列是leading 1
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

    // ---- 特解 ----
    let particular = new Array(n).fill(0);

    for (let i = 0; i < pivotCols.length; i++) {
        let col = pivotCols[i];
        particular[col] = matrix[i][n];
    }

    // ---- 齐次解基 ----
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
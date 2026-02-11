let chart;

function calculateRegression() {
    const xInput = document.getElementById("xValues").value.split(",").map(Number);
    const yInput = document.getElementById("yValues").value.split(",").map(Number);

    if (xInput.length !== yInput.length || xInput.length === 0) {
        alert("Please enter equal number of X and Y values.");
        return;
    }

    const n = xInput.length;

    const meanX = xInput.reduce((a, b) => a + b) / n;
    const meanY = yInput.reduce((a, b) => a + b) / n;

    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
        numerator += (xInput[i] - meanX) * (yInput[i] - meanY);
        denominator += (xInput[i] - meanX) ** 2;
    }

    const slope = numerator / denominator;
    const intercept = meanY - slope * meanX;

    // Calculate R²
    let ssTot = 0;
    let ssRes = 0;

    for (let i = 0; i < n; i++) {
        const predicted = intercept + slope * xInput[i];
        ssTot += (yInput[i] - meanY) ** 2;
        ssRes += (yInput[i] - predicted) ** 2;
    }

    const r2 = 1 - (ssRes / ssTot);

    document.getElementById("slope").innerText = slope.toFixed(6);
    document.getElementById("intercept").innerText = intercept.toFixed(6);
    document.getElementById("r2").innerText = r2.toFixed(6);

    drawChart(xInput, yInput, slope, intercept);
}

function drawChart(xData, yData, slope, intercept) {
    const ctx = document.getElementById("regressionChart").getContext("2d");

    const regressionLine = xData.map(x => intercept + slope * x);

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Data Points',
                    data: xData.map((x, i) => ({ x: x, y: yData[i] })),
                },
                {
                    label: 'Regression Line',
                    type: 'line',
                    data: xData.map((x, i) => ({ x: x, y: regressionLine[i] })),
                    fill: false
                }
            ]
        },
        options: {
            scales: {
                x: { type: 'linear', position: 'bottom' }
            }
        }
    });
}

function initializeEmptyChart() {
    const ctx = document.getElementById("regressionChart").getContext("2d");

    chart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: []
        },
        options: {
            scales: {
                x: {
                    type: 'linear',
                    min: 0,
                    max: 10,
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    },
                    ticks: {
                        color: '#666'
                    }
                },
                y: {
                    min: 0,
                    max: 10,
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    },
                    ticks: {
                        color: '#666'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}


window.onload = function() {
    initializeEmptyChart();
};

document.addEventListener('DOMContentLoaded', function () {
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    var createChart = document.querySelector('.createChartBtn');
    var selectElement = document.querySelector('.form-select');

    const startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    startDateInput.valueAsDate = startDate;
    endDateInput.valueAsDate = endDate;

    checkInputs();
    createChartFunction();

    startDateInput.addEventListener('change', function () {
        endDateInput.min = this.value;
        if (new Date(endDateInput.value) < new Date(this.value)) {
            endDateInput.value = this.value;
        }
        checkInputs();
    });

    endDateInput.addEventListener('change', function () {
        if (new Date(startDateInput.value) > new Date(this.value)) {
            endDateInput.value = startDateInput.value;
        }
        checkInputs();
    });

    function checkInputs() {
        if (startDateInput.value && endDateInput.value) {
            createChart.style.cursor = 'pointer';
            createChart.style.opacity = '1';
            createChart.style['pointer-events'] = 'auto';
        } else {
            createChart.style.cursor = 'default';
            createChart.style.opacity = '0.5';
            createChart.style['pointer-events'] = 'none';
        }
    }

    createChart.addEventListener('click', createChartFunction);

    function createChartFunction() {
        var startDate = startDateInput.value;
        var endDate = endDateInput.value;
        var type = selectElement.value;
        let data = {
            startDate: startDate,
            endDate: endDate,
            type: type
        };
        var method = 'POST';
        const apiURL = new URL('/report/topProduct', window.location.href).href;
        fetch(apiURL, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
            .then((response) => response.json())
            .then((data) => {
                var labels = data.map(item => item.productName);
                drawLineChart(labels, data, type, startDate, endDate);
            })
            .catch((error) => console.error('Error:', error));
    }
});

function generateRandomColors(length) {
    var colors = new Set();
    while (colors.size < length) {
        var color = '#' + Math.floor(Math.random() * 16777215).toString(16);
        if (color != '#ffffff') {
            colors.add(color);
        }
    }
    return Array.from(colors);
}

var chartLine = null;
function drawLineChart(labels, data, type, startDate, endDate) {
    // Vẽ biểu đồ line
    if (chartLine != null) {
        chartLine.destroy();
    }
    var canvas = document.querySelector('canvas');
    var color = generateRandomColors(2);
    var datasets = [];

    if (type === '1') {
        datasets.push({
            label: 'Doanh thu',
            data: data.map(item => item.revenue), // Dữ liệu của doanh thu
            backgroundColor: color[0],
            borderColor: color[0],
            fill: false,
        });
    }

    if (type === '2') {
        datasets.push({
            label: 'Số lượng sản phẩm',
            data: data.map(item => item.totalQuantity), // Dữ liệu của số lượng sản phẩm
            backgroundColor: color[1],
            borderColor: color[1],
            fill: false,
        });
    }

    var config = {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets,
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Sản phẩm',
                    },
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: type === '1' ? `Doanh thu của sản phẩm trong giai đoạn từ ${startDate} đến ${endDate}` : `Số lượng sản phẩm bán được trong giai đoạn từ ${startDate} đến ${endDate}`,
                    },
                },
            },
        },
    };
    chartLine = new Chart(canvas.getContext('2d'), config);
}

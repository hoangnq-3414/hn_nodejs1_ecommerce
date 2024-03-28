document.addEventListener('DOMContentLoaded', function () {
  var inputTime = document.querySelector('#input-value');
  var createChart = document.querySelector('.createChartBtn');
  var selectElement = document.querySelector('.form-select');
    
  inputTime.addEventListener('change', function () {
    const selectedValue = this.value;
    if (selectedValue) {
      createChart.style.cursor = 'pointer';
      createChart.style.opacity = '1';
      createChart.style['pointer-events'] = 'auto';
    }
  });
  createChart.addEventListener('click', function () {
    let data = {
      date: inputTime.value,
      type: selectElement.value
    };
    var method = 'POST';
    const apiURL = new URL('/report/revenu', window.location.href).href;
    fetch(apiURL, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        const typeName = selectElement.value == '1' ? 'Doanh thu' : 'Số lượng sản phẩm bán được';
        drawChartDay(data.dailyRevenues, data.monthTime, data.year, typeName); 
      })
      .catch((error) => console.error('Error:', error));
  });
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
function drawChartDay(data, thang, nam, typeName) {
  var canvas = document.querySelector('canvas');
  if (chartLine != null) {
    chartLine.destroy();
  }
  var labels = [];
  for (var i = 1; i <= data.length; i++) {
    labels.push('Ngày ' + i);
  }
  var color = generateRandomColors(1);
  var config = {  
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: `${typeName}` , // Tên của đường
          data: data, // dữ liệu của đường tương ứng với nhãn trên trục hoành
          backgroundColor: color, // màu của đường
          borderColor: color,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Ngày trong tháng',
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: `${typeName} theo ngày trong tháng ${thang} năm ${nam} ($)`,
          },
        },
      },
    },
  };

  chartLine = new Chart(canvas.getContext('2d'), config);
}

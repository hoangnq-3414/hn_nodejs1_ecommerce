$(document).ready(function() {
    // Kiểm tra giá trị của status và hiển thị nút Cancel Order nếu cần
    var statusText = $("#statusElement").text().trim();
    if (statusText === "1") {
        $("#cancelOrderButton").show();
    }
});


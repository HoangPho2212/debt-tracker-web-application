/**
 * ==============================================================================
 * SỔ GHI NỢ QUÁN CƠM - GOOGLE APPS SCRIPT ĐỒNG BỘ 2 CHIỀU (BI-DIRECTIONAL SYNC)
 * ==============================================================================
 * 1. doPost(e): Web App gửi lên -> Cập nhật bảng tính "Sổ Ghi Nợ" & lưu raw JSON vào "DATA_STORE".
 * 2. doGet(e): Web App tải về -> Đọc TRỰC TIẾP toàn bộ các dòng trên bảng tính "Sổ Ghi Nợ"
 *    (Đảm bảo mọi khách nợ có trên Sheet đều được tải về Web App 100%).
 * ==============================================================================
 */

function doPost(e) {
  try {
    var rawData = e.postData ? e.postData.contents : null;
    if (!rawData) {
      return ContentService.createTextOutput(
        JSON.stringify({ status: "error", message: "Không có dữ liệu gửi lên." })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    var payload = JSON.parse(rawData);
    var records = payload.records || [];
    var restaurantName = payload.restaurantName || "Sổ Ghi Nợ Quán Cơm";
    var syncedAt = new Date().toISOString();

    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Lưu bản backup JSON vào sheet DATA_STORE
    var dataSheet = ss.getSheetByName("DATA_STORE");
    if (!dataSheet) {
      dataSheet = ss.insertSheet("DATA_STORE");
      dataSheet.hideSheet();
    }
    dataSheet.clear();
    var backupObject = {
      restaurantName: restaurantName,
      records: records,
      syncedAt: syncedAt
    };
    dataSheet.getRange(1, 1).setValue(JSON.stringify(backupObject));

    // 2. Tạo/Cập nhật sheet hiển thị "Sổ Ghi Nợ"
    var sheet = ss.getSheetByName("Sổ Ghi Nợ");
    if (!sheet) {
      sheet = ss.insertSheet("Sổ Ghi Nợ", 0);
    }

    var headers = [
      "Mã KH",
      "Tên Khách Hàng",
      "Số Điện Thoại",
      "Ngày Giờ Nợ",
      "Số Suất",
      "Đơn Giá (VNĐ)",
      "Thành Tiền (VNĐ)",
      "Tổng Nợ Hiện Tại (VNĐ)",
      "Trạng Thái",
      "Món Ăn / Ghi Chú",
      "Cập Nhật Lúc"
    ];

    sheet.clear();

    // Tiêu đề
    sheet.getRange(1, 1).setValue("🏪 " + restaurantName.toUpperCase() + " - DANH SÁCH CÔNG NỢ");
    sheet.getRange(1, 1, 1, headers.length).merge().setFontWeight("bold").setFontSize(13).setFontColor("#15803d");
    sheet.getRange(2, 1).setValue("🕒 Cập nhật lúc: " + new Date().toLocaleString("vi-VN") + " • Tự động đồng bộ 2 chiều");
    sheet.getRange(2, 1, 1, headers.length).merge().setFontStyle("italic").setFontSize(10).setFontColor("#64748b");

    // Header bảng
    var headerRow = 4;
    var headerRange = sheet.getRange(headerRow, 1, 1, headers.length);
    headerRange.setValues([headers]);
    headerRange.setBackground("#16a34a");
    headerRange.setFontColor("#ffffff");
    headerRange.setFontWeight("bold");
    headerRange.setHorizontalAlignment("center");
    headerRange.setVerticalAlignment("middle");

    var rows = [];
    var totalActiveDebtSum = 0;

    for (var i = 0; i < records.length; i++) {
      var record = records[i];
      var isSettled = record.status === "settled" || Number(record.totalDebt) === 0;
      var statusText = isSettled ? "Đã Thanh Toán" : "Đang Nợ";

      if (!isSettled) {
        totalActiveDebtSum += Number(record.totalDebt) || 0;
      }

      if (record.history && record.history.length > 0) {
        for (var j = 0; j < record.history.length; j++) {
          var entry = record.history[j];
          var noteText = entry.note || "";
          if (entry.shippingFee && Number(entry.shippingFee) > 0) {
            var shipNote = "Phí ship: " + Number(entry.shippingFee).toLocaleString("vi-VN") + "đ";
            noteText = noteText ? noteText + " | " + shipNote : shipNote;
          }

          rows.push([
            record.id,
            record.name,
            record.phone || "",
            entry.displayDate || entry.timestamp,
            Number(entry.quantity) || 1,
            Number(entry.pricePerMeal) || 0,
            Number(entry.amount) || 0,
            Number(record.totalDebt) || 0,
            statusText,
            noteText,
            record.updatedAt || new Date().toISOString()
          ]);
        }
      } else {
        rows.push([
          record.id,
          record.name,
          record.phone || "",
          "",
          0,
          0,
          0,
          Number(record.totalDebt) || 0,
          statusText,
          "",
          record.updatedAt || new Date().toISOString()
        ]);
      }
    }

    if (rows.length > 0) {
      var dataRange = sheet.getRange(headerRow + 1, 1, rows.length, headers.length);
      dataRange.setValues(rows);
      dataRange.setFontSize(10);
      dataRange.setVerticalAlignment("middle");

      // Căn lề & format tiền tệ
      sheet.getRange(headerRow + 1, 5, rows.length, 1).setHorizontalAlignment("center");
      sheet.getRange(headerRow + 1, 6, rows.length, 3).setNumberFormat("#,##0");
      sheet.getRange(headerRow + 1, 9, rows.length, 1).setHorizontalAlignment("center");

      // Đổi màu trạng thái
      for (var r = 0; r < rows.length; r++) {
        var rowNum = headerRow + 1 + r;
        var rowStatus = rows[r][8];
        if (rowStatus === "Đã Thanh Toán") {
          sheet.getRange(rowNum, 9).setFontColor("#16a34a").setFontWeight("bold");
        } else {
          sheet.getRange(rowNum, 9).setFontColor("#dc2626").setFontWeight("bold");
          sheet.getRange(rowNum, 8).setFontColor("#dc2626").setFontWeight("bold");
        }
      }

      // Dòng tổng cộng
      var sumRow = headerRow + 1 + rows.length;
      sheet.getRange(sumRow, 1, 1, 7).merge().setValue("TỔNG TIỀN NỢ CHƯA THU CỦA QUÁN:").setFontWeight("bold").setHorizontalAlignment("right");
      sheet.getRange(sumRow, 8).setValue(totalActiveDebtSum).setFontWeight("bold").setFontColor("#dc2626").setNumberFormat("#,##0");
      sheet.getRange(sumRow, 1, 1, headers.length).setBackground("#fef2f2").setFontSize(11);
    }

    sheet.autoResizeColumns(1, headers.length);

    return ContentService.createTextOutput(
      JSON.stringify({
        status: "success",
        message: "Đồng bộ lên Google Sheets thành công (" + records.length + " khách hàng).",
        totalActiveDebt: totalActiveDebtSum,
        syncedAt: syncedAt
      })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Sổ Ghi Nợ");
    if (!sheet) {
      sheet = ss.getSheets()[0];
    }

    var lastRow = sheet.getLastRow();
    if (lastRow <= 4) {
      return ContentService.createTextOutput(
        JSON.stringify({
          status: "success",
          restaurantName: "Sổ Ghi Nợ Quán Cơm",
          records: [],
          syncedAt: new Date().toISOString()
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    var numRows = lastRow - 4;
    var values = sheet.getRange(5, 1, numRows, 11).getValues();
    var recordsMap = {};
    var orderList = [];

    for (var i = 0; i < values.length; i++) {
      var row = values[i];
      var name = String(row[1] || "").trim();
      if (!name || name.indexOf("TỔNG TIỀN NỢ") >= 0) continue;

      var normKey = name.toLowerCase().trim();
      var id = String(row[0] || ("KH_" + (i + 1)));

      if (!recordsMap[normKey]) {
        recordsMap[normKey] = {
          id: id,
          name: name,
          normalizedName: normKey,
          phone: row[2] ? String(row[2]) : undefined,
          totalDebt: Number(row[7]) || 0,
          status: String(row[8]).toLowerCase().indexOf("đã thanh toán") >= 0 ? "settled" : "active",
          createdAt: String(row[10] || new Date().toISOString()),
          updatedAt: String(row[10] || new Date().toISOString()),
          history: []
        };
        orderList.push(normKey);
      }

      if (row[7] !== "" && !isNaN(Number(row[7]))) {
        recordsMap[normKey].totalDebt = Number(row[7]);
      }
      if (row[8]) {
        recordsMap[normKey].status = String(row[8]).toLowerCase().indexOf("đã thanh toán") >= 0 ? "settled" : "active";
      }

      if (row[3] || row[4] || row[6]) {
        recordsMap[normKey].history.push({
          entryId: "ENT_" + id + "_" + i,
          timestamp: String(row[10] || new Date().toISOString()),
          displayDate: String(row[3] || ""),
          quantity: Number(row[4]) || 1,
          pricePerMeal: Number(row[5]) || 0,
          amount: Number(row[6]) || 0,
          note: row[9] ? String(row[9]) : undefined
        });
      }
    }

    var resultRecords = [];
    for (var k = 0; k < orderList.length; k++) {
      resultRecords.push(recordsMap[orderList[k]]);
    }

    return ContentService.createTextOutput(
      JSON.stringify({
        status: "success",
        restaurantName: "Sổ Ghi Nợ Quán Cơm",
        records: resultRecords,
        syncedAt: new Date().toISOString()
      })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

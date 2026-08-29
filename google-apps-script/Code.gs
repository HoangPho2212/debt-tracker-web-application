/**
 * ==============================================================================
 * SỔ GHI NỢ QUÁN CƠM - GOOGLE APPS SCRIPT ĐỒNG BỘ 2 CHIỀU (BI-DIRECTIONAL SYNC)
 * ==============================================================================
 * Tính năng:
 * 1. doPost(e): Nhận dữ liệu từ điện thoại/máy tính đẩy lên (Push) -> Định dạng bảng tính & lưu trữ JSON.
 * 2. doGet(e): Trả về dữ liệu công nợ mới nhất cho các thiết bị khác tải về (Pull / Polling).
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

    // 1. LƯU RAW JSON ĐỂ doGet TRẢ VỀ NHANH NHẤT (<100ms)
    var dataSheet = ss.getSheetByName("DATA_STORE");
    if (!dataSheet) {
      dataSheet = ss.insertSheet("DATA_STORE");
      dataSheet.hideSheet(); // Ẩn sheet kỹ thuật để bảng tính gọn gàng
    }
    dataSheet.clear();
    var backupObject = {
      restaurantName: restaurantName,
      records: records,
      syncedAt: syncedAt
    };
    dataSheet.getRange(1, 1).setValue(JSON.stringify(backupObject));

    // 2. ĐỊNH DẠNG VÀ GHI DỮ LIỆU HIỂN THỊ TRÊN SHEET "Sổ Ghi Nợ"
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

    // Tiêu đề quán cơm
    sheet.getRange(1, 1).setValue("🏪 " + restaurantName.toUpperCase() + " - DANH SÁCH CÔNG NỢ ĐỒNG BỘ");
    sheet.getRange(1, 1, 1, headers.length).merge().setFontWeight("bold").setFontSize(13).setFontColor("#15803d");
    sheet.getRange(2, 1).setValue("🕒 Cập nhật lần cuối: " + new Date().toLocaleString("vi-VN") + " • Tự động đồng bộ 2 chiều");
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

    // Chuyển đổi dữ liệu records thành các dòng
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
            entry.note || "",
            record.updatedAt || ""
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
          record.updatedAt || ""
        ]);
      }
    }

    if (rows.length > 0) {
      var dataRange = sheet.getRange(headerRow + 1, 1, rows.length, headers.length);
      dataRange.setValues(rows);

      // Định dạng tiền tệ VNĐ
      sheet.getRange(headerRow + 1, 5, rows.length, 1).setNumberFormat("#,##0");
      sheet.getRange(headerRow + 1, 6, rows.length, 3).setNumberFormat("#,##0 \"đ\"");

      sheet.getRange(headerRow + 1, 1, rows.length, 1).setHorizontalAlignment("center");
      sheet.getRange(headerRow + 1, 4, rows.length, 1).setHorizontalAlignment("center");
      sheet.getRange(headerRow + 1, 9, rows.length, 1).setHorizontalAlignment("center");

      for (var r = 0; r < rows.length; r++) {
        var rowNum = headerRow + 1 + r;
        var st = rows[r][8];
        if (st === "Đang Nợ") {
          sheet.getRange(rowNum, 8).setFontColor("#dc2626").setFontWeight("bold");
          sheet.getRange(rowNum, 9).setFontColor("#dc2626").setFontWeight("bold");
        } else {
          sheet.getRange(rowNum, 8).setFontColor("#16a34a");
          sheet.getRange(rowNum, 9).setFontColor("#16a34a");
        }
      }
    }

    for (var c = 1; c <= headers.length; c++) {
      sheet.autoResizeColumn(c);
    }

    return ContentService.createTextOutput(
      JSON.stringify({
        status: "success",
        message: "Đồng bộ thành công " + records.length + " khách hàng.",
        totalRows: rows.length,
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
    var dataSheet = ss.getSheetByName("DATA_STORE");

    if (dataSheet) {
      var rawJson = dataSheet.getRange(1, 1).getValue();
      if (rawJson && typeof rawJson === "string" && rawJson.trim().startsWith("{")) {
        try {
          var parsed = JSON.parse(rawJson);
          if (parsed && Array.isArray(parsed.records)) {
            return ContentService.createTextOutput(
              JSON.stringify({
                status: "success",
                restaurantName: parsed.restaurantName || "Sổ Ghi Nợ Quán Cơm",
                records: parsed.records || [],
                syncedAt: parsed.syncedAt || new Date().toISOString()
              })
            ).setMimeType(ContentService.MimeType.JSON);
          }
        } catch (jsonErr) {
          // Fallback to reading the visible sheet
        }
      }
    }

    // Trường hợp chưa có DATA_STORE, đọc tạm từ sheet hiển thị
    var sheet = ss.getSheetByName("Sổ Ghi Nợ");
    if (!sheet) {
      return ContentService.createTextOutput(
        JSON.stringify({
          status: "success",
          restaurantName: "Sổ Ghi Nợ Quán Cơm",
          records: [],
          syncedAt: new Date().toISOString()
        })
      ).setMimeType(ContentService.MimeType.JSON);
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

    var values = sheet.getRange(5, 1, lastRow - 4, 11).getValues();
    var recordsMap = {};

    for (var i = 0; i < values.length; i++) {
      var row = values[i];
      var id = String(row[0] || ("KH_" + i));
      var name = String(row[1] || "").trim();
      if (!name) continue;

      if (!recordsMap[id]) {
        recordsMap[id] = {
          id: id,
          name: name,
          normalizedName: name.toLowerCase().trim(),
          phone: row[2] ? String(row[2]) : undefined,
          totalDebt: Number(row[7]) || 0,
          status: row[8] === "Đã Thanh Toán" ? "settled" : "active",
          createdAt: String(row[10] || new Date().toISOString()),
          updatedAt: String(row[10] || new Date().toISOString()),
          history: []
        };
      }

      if (row[3]) {
        recordsMap[id].history.push({
          entryId: "ENT_" + id + "_" + i,
          timestamp: String(row[10] || new Date().toISOString()),
          displayDate: String(row[3]),
          quantity: Number(row[4]) || 1,
          pricePerMeal: Number(row[5]) || 0,
          amount: Number(row[6]) || 0,
          note: row[9] ? String(row[9]) : undefined
        });
      }
    }

    var resultRecords = [];
    for (var key in recordsMap) {
      resultRecords.push(recordsMap[key]);
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

/**
 * 實驗室 SDS 效期與雲端硬碟管理系統 (GitHub 開源免改代碼完全版)
 * 💡 亮點：使用者無需修改本檔案任何代碼。
 * 系統兼具動態自訂標題與欄位名稱功能，並內建 Self-healing（自我修復/自動建立設定表）機制。
 */

function doGet() {
  // 檢查資料夾 ID 是否已初始化，若無則在日誌留下紀錄
  var folderId = PropertiesService.getScriptProperties().getProperty(
    "GOOGLE_DRIVE_FOLDER_ID",
  );
  if (!folderId) {
    Logger.log(
      "提示：資料夾 ID 尚未設定。使用者開啟網頁前，建議先在試算表點選自訂選單進行初始化。",
    );
  }

  return HtmlService.createHtmlOutputFromFile("Index")
    .setTitle("實驗室 SDS 效期管理系統")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * 核心升級：獲取並管理系統自訂標題與欄位名稱
 * 若 settings 工作表不存在，系統將自動建立並寫入初始預設值（Self-healing）
 */
function getSystemSettings() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("settings");

    // 🔥 防呆與自我修復機制：如果找不到 settings 工作表，就當場建立一個全新的！
    if (!sheet) {
      sheet = ss.insertSheet("settings");

      // 定義完美的預設自訂欄位與標題設定
      var defaultSettings = [
        ["sidebarTitle", "試劑品項防錯登錄"],
        ["dashboardTitle", "實驗室動態資產看板"],
        ["field1Name", "試劑/套組名稱"],
        ["field2Name", "原廠廠牌"],
        ["field3Name", "目前 SDS 版本日期"],
        ["field4Name", "上傳全新安全資料表 (PDF)"],
      ];

      // 將預設資料寫入新工作表
      sheet
        .getRange(1, 1, defaultSettings.length, 2)
        .setValues(defaultSettings);

      // 美化設定表排版
      sheet.getRange("A1:A6").setFontWeight("bold").setFontColor("#333333");
      sheet.setColumnWidth(1, 150);
      sheet.setColumnWidth(2, 250);

      // 由於是剛建立，直接回傳預設物件給前端，省去查表時間
      var settingsObj = {};
      defaultSettings.forEach(function (row) {
        settingsObj[row[0]] = row[1];
      });
      return settingsObj;
    }

    // 🎯 正常狀況：如果 settings 表存在，就正常讀取並打包回傳 JSON 物件
    var lastRow = sheet.getLastRow();
    if (lastRow === 0) return {};

    var data = sheet.getRange(1, 1, lastRow, 2).getValues();
    var settingsObj = {};
    data.forEach(function (row) {
      if (row[0]) settingsObj[row[0].trim()] = row[1];
    });

    return settingsObj;
  } catch (e) {
    Logger.log("讀取設定時發生錯誤: " + e.toString());
    // 發生未知錯誤時的極致防呆回傳，確保前端 UI 不會白屏掛掉
    return {
      sidebarTitle: "品項防錯登錄",
      dashboardTitle: "動態資產看板",
      field1Name: "品項名稱",
      field2Name: "廠牌",
      field3Name: "版本日期",
      field4Name: "上傳全新檔案 (PDF)",
    };
  }
}

/**
 * 動態獲取儲存的 Google Drive 資料夾 ID，若不存在則引導輸入或自動建立
 */
function getFolderId() {
  var scriptProperties = PropertiesService.getScriptProperties();
  var folderId = scriptProperties.getProperty("GOOGLE_DRIVE_FOLDER_ID");

  // 如果尚未設定過 ID，試著從使用者畫面上獲取
  if (!folderId) {
    try {
      var ui = SpreadsheetApp.getUi();
      var response = ui.prompt(
        "⚙️ 系統首次初始化設定",
        "請輸入您 Google Drive 中用來存放 PDF 檔案的【資料夾 ID】。\n\n💡 若您尚未建立資料夾，請直接輸入【create】或【留空直接按確定】，系統將自動在您的雲端硬碟根目錄建立新資料夾！",
        ui.ButtonSet.OK_CANCEL,
      );

      if (response.getSelectedButton() == ui.Button.OK) {
        var input = response.getResponseText().trim();

        // ✨ 自動建立資料夾機制：當使用者輸入 create 或留空時觸發
        if (input.toLowerCase() === "create" || input === "") {
          var newFolder = DriveApp.createFolder(
            "🧪 實驗室 SDS 檔案庫 (自動建立)",
          );
          folderId = newFolder.getId();
          scriptProperties.setProperty("GOOGLE_DRIVE_FOLDER_ID", folderId);
          ui.alert(
            "✅ 系統已自動在您的雲端硬碟根目錄建立資料夾：\n【🧪 實驗室 SDS 檔案庫 (自動建立)】\n\n未來上傳的 PDF 檔案都會安全存放在該處！",
          );
        } else {
          // 使用者輸入了自訂的資料夾 ID
          folderId = input;
          scriptProperties.setProperty("GOOGLE_DRIVE_FOLDER_ID", folderId);
          ui.alert("✅ 資料夾 ID 設定成功！已自動儲存於後端環境變數中。");
        }
      } else {
        ui.alert("⚠️ 您取消了設定。系統將無法正常執行上傳與替換 PDF 功能。");
      }
    } catch (e) {
      Logger.log("無法開啟 UI 輸入框：" + e.toString());
    }
  }
  return folderId;
}

// 自動檢查與動態計算 3 年效期
function checkSDSExpirations() {
  var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!activeSpreadsheet) return;
  var sheet = activeSpreadsheet.getSheets()[0];
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  var dataRange = sheet.getRange(2, 1, lastRow - 1, 7);
  var data = dataRange.getValues();
  var today = new Date();
  var alertWindow = new Date();
  alertWindow.setDate(today.getDate() + 90);

  for (var i = 0; i < data.length; i++) {
    var rowNum = i + 2;
    var lastReviewStr = data[i][3];
    if (!lastReviewStr) continue;

    var lastReview = new Date(lastReviewStr);
    if (isNaN(lastReview.getTime())) continue;

    var nextReview = new Date(lastReview);
    nextReview.setFullYear(nextReview.getFullYear() + 3);
    sheet
      .getRange(rowNum, 5)
      .setValue(
        Utilities.formatDate(
          nextReview,
          Session.getScriptTimeZone(),
          "yyyy-MM-dd",
        ),
      );

    var statusCell = sheet.getRange(rowNum, 6);
    if (nextReview <= today) {
      statusCell
        .setValue("🚨 已過期 (滿3年)")
        .setBackground("#FFD2D2")
        .setFontColor("#990000");
    } else if (nextReview > today && nextReview <= alertWindow) {
      statusCell
        .setValue("⚠️ 預警 (90天內)")
        .setBackground("#FFE4C4")
        .setFontColor("#B8860B");
    } else {
      statusCell
        .setValue("✅ 安全")
        .setBackground("#D4EDDA")
        .setFontColor("#155724");
    }
  }
}

// 讀取主要資料表資產資料
function getSDSDataFromSheet() {
  checkSDSExpirations();
  var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!activeSpreadsheet) return [];
  var sheet = activeSpreadsheet.getSheets()[0];
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  var data = sheet.getRange(2, 1, lastRow - 1, 7).getValues();
  var result = [];
  for (var i = 0; i < data.length; i++) {
    result.push({
      rowNum: i + 2,
      id: data[i][0],
      name: data[i][1],
      brand: data[i][2],
      lastReview: data[i][3]
        ? Utilities.formatDate(
            new Date(data[i][3]),
            Session.getScriptTimeZone(),
            "yyyy-MM-dd",
          )
        : "",
      nextReview: data[i][4]
        ? Utilities.formatDate(
            new Date(data[i][4]),
            Session.getScriptTimeZone(),
            "yyyy-MM-dd",
          )
        : "",
      status: data[i][5],
      fileUrl: data[i][6],
    });
  }
  return result;
}

// 在網頁 UI 上雙擊儲存格、即時修改欄位文字資料
function updateCellFromUI(rowNum, columnType, newValue) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    var colIdx = 2;
    if (columnType === "brand") colIdx = 3;
    if (columnType === "lastReview") colIdx = 4;
    sheet.getRange(rowNum, colIdx).setValue(newValue);
    if (columnType === "lastReview") checkSDSExpirations();
    return { success: true };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// 新增品項與檔案安全序列化上傳
function addNewSDSWithFile(formData) {
  try {
    var folderId = getFolderId();
    if (!folderId)
      throw new Error(
        "尚未設定 Google Drive 資料夾 ID，請先至試算表自訂選單設定。",
      );

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    var lastRow = sheet.getLastRow();
    var nextId =
      lastRow < 2 ? 1 : Number(sheet.getRange(lastRow, 1).getValue()) + 1;
    var targetRow = lastRow + 1;
    var fileUrl = "";

    if (formData.fileData && formData.fileName) {
      var folder = DriveApp.getFolderById(folderId);
      var contentType = formData.fileData.substring(
        5,
        formData.fileData.indexOf(";base64,"),
      );
      var bytes = Utilities.base64Decode(formData.fileData.split(",")[1]);
      var blob = Utilities.newBlob(
        bytes,
        contentType,
        "sds_" + formData.reagentName + "_" + formData.brandName + ".pdf",
      );
      var file = folder.createFile(blob);
      fileUrl = file.getUrl();
    }

    sheet.getRange(targetRow, 1).setValue(nextId);
    sheet.getRange(targetRow, 2).setValue(formData.reagentName);
    sheet.getRange(targetRow, 3).setValue(formData.brandName);
    sheet.getRange(targetRow, 4).setValue(formData.versionDate);
    sheet.getRange(targetRow, 7).setValue(fileUrl);
    checkSDSExpirations();
    return { success: true, message: "資料與檔案已成功同步上傳！" };
  } catch (error) {
    return { success: false, message: "上傳失敗錯誤資訊: " + error.toString() };
  }
}

// 直接在網頁 UI 點選按鈕、覆蓋替換指定項目的 PDF 檔案
function replaceSDSFileFromUI(
  rowNum,
  reagentName,
  brandName,
  fileData,
  fileName,
) {
  try {
    var folderId = getFolderId();
    if (!folderId) throw new Error("尚未設定 Google Drive 資料夾 ID。");

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    var folder = DriveApp.getFolderById(folderId);

    var contentType = fileData.substring(5, fileData.indexOf(";base64,"));
    var bytes = Utilities.base64Decode(fileData.split(",")[1]);
    var blob = Utilities.newBlob(
      bytes,
      contentType,
      "sds_" + reagentName + "_" + brandName + "_更新.pdf",
    );

    var file = folder.createFile(blob);
    var newFileUrl = file.getUrl();

    sheet.getRange(rowNum, 7).setValue(newFileUrl);
    return { success: true, message: "PDF 檔案已成功替換！" };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// 用於首次強制開通 Google 權限審查與驗證環境的測試函式
function forceAuthorize() {
  var folderId = getFolderId();
  if (folderId) {
    var folder = DriveApp.getFolderById(folderId);
    Logger.log("成功連結資料夾：" + folder.getName());
  }
}

// 當試算表開啟時，自動在上方選單建立「快捷功能選单」
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu("🧪 SDS 系統管理")
    .addItem("⚙️ 初始化試算表欄位", "initializeSDSSheet")
    .addItem("📁 設定/更換雲端硬碟資料夾 ID", "setupCustomFolderId")
    .addToUi();
}

/**
 * 供選單手動點擊使用的資料夾 ID 重設功能
 */
function setupCustomFolderId() {
  PropertiesService.getScriptProperties().deleteProperty(
    "GOOGLE_DRIVE_FOLDER_ID",
  );
  getFolderId();
}

/**
 * 自動初始化第一個分頁的欄位結構與排版美化
 */
function initializeSDSSheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

  var headers = [
    [
      "序號",
      "試劑/套組名稱",
      "廠牌",
      "目前 SDS 版本日期",
      "下次更新日期 (3年)",
      "狀態",
      "Google Drive 檔案連結",
    ],
  ];

  sheet.getRange(1, 1, 1, 7).setValues(headers);

  var headerRange = sheet.getRange("A1:G1");
  headerRange
    .setBackground("#343a40")
    .setFontColor("#ffffff")
    .setFontWeight("bold")
    .setHorizontalAlignment("center");

  sheet.autoResizeColumns(1, 7);

  // 初始化主要欄位時，順便在背景觸發檢查並建立 settings 分頁
  getSystemSettings();

  // 引導使用者輸入或自動建立雲端硬碟資料夾
  getFolderId();

  SpreadsheetApp.getUi().alert(
    "✅ 試算表欄位已初始化成功！自訂設定表（settings分頁）也已同步建置完畢。您現在可以開啟網頁 UI 體驗客製化面板了！",
  );
}

/**
 * 實驗室 SDS 效期與雲端硬碟管理系統 (使用者分發版)
 * 識別碼對接：SDS_management_core
 */

// 1. Web App 網頁進入點
function doGet() {
  return SDS_management_core.renderWebApplication();
}

// 2. 當試算表開啟時，自動建立上方「快捷功能選單」
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu("🧪 SDS 系統管理")
    .addItem("⚙️ 初始化試算表欄位", "initializeSDSSheet")
    .addItem("📁 設定/更換雲端硬碟資料夾 ID", "setupCustomFolderId")
    .addToUi();
}

// 3. 原生選單按鈕的跳板轉接
function initializeSDSSheet() {
  SDS_management_core.initializeSDSSheet();
}

function setupCustomFolderId() {
  SDS_management_core.setupCustomFolderId();
}

// =======================================================
// 4. 前端 google.script.run 專用跳板轉接區
// =======================================================

function getSystemSettings() {
  return SDS_management_core.getSystemSettings();
}

function getSDSDataFromSheet() {
  return SDS_management_core.getSDSDataFromSheet();
}

function updateCellFromUI(rowNum, columnType, newValue) {
  return SDS_management_core.updateCellFromUI(rowNum, columnType, newValue);
}

function addNewSDSWithFile(formData) {
  return SDS_management_core.addNewSDSWithFile(formData);
}

function replaceSDSFileFromUI(
  rowNum,
  reagentName,
  brandName,
  fileData,
  fileName,
) {
  return SDS_management_core.replaceSDSFileFromUI(
    rowNum,
    reagentName,
    brandName,
    fileData,
    fileName,
  );
}

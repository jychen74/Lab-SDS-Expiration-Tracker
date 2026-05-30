
# **[Lab-SDS-Expiration-Tracker](https://github.com/jychen74/Lab-SDS-Expiration-Tracker)**

### 實驗室 SDS 效期與雲端硬碟自動化管理系統

A serverless, zero-cost, and server-free Web Application designed specifically for research and medical laboratories to track Safety Data Sheets (SDS) compliance.

這是一個專為生物、化學與醫學實驗室設計的輕量化、零成本管理系統。利用 Google 試算表與雲端硬碟，解決實驗室安全資料表（SDS）每三年需定期更新版次的勞安與合規需求。

---

## Quick Start / 快速架設指南

> **No Coding Required! / 完全不需要懂程式碼！**
> You only need to click a few buttons to set up your own independent system.
> 您只需要點擊幾個按鈕，就能建立屬於您實驗室的獨立管理系統。

---

### 🌐 中文版架設教學

#### 步驟 1：建立系統複本

請點擊下方安全連結，將系統範本複製到您個人的 Google 帳號中：
👉 **[【點我立刻建立管理系統試算表複本】](https://docs.google.com/spreadsheets/d/1AZ8uN7qDuEBC6OBNbeNcrYt6IGBVJKlaJE3hgjCL_aw/copy)**

*注意：在複製完成並進入網頁後，請重新整理一次瀏覽器，工具列上方才會出現自訂選單「🧪 SDS 系統管理」。*

#### 步驟 2：一鍵自動初始化

1. 點選試算表上方工具列的自訂選單：**【🧪 SDS 系統管理】 -> 【⚙️ 初始化試算表欄位】**。
2. **帳號授權放行**：首次執行時 Google 會彈出隱私權警示畫面，請依序點選：
   * **「進階」** -> **「前往 shared_Lab_SDS (不安全)」** -> **「允許」**。
3. **自動建立雲端資料夾**：授權完成後畫面會跳出提示對話框，**請直接「留空」（不要輸入任何文字）並點擊「確定」**，系統即會自動在您的雲端硬碟根目錄建好專用 PDF 資料夾。

#### 步驟 3：發布您的管理網頁

1. 在試算表畫面上方工具列點選 **【擴充功能】 -> 【Apps Script】**。
2. 進入程式碼畫面後，點擊右上方藍色的 **【部署】 -> 【新增部署】**。
3. 點擊彈出視窗左上角的「齒輪圖示」，在選單中選取 **「網頁應用程式」**。
4. 畫面的參數維持預設，直接點擊右下角的 **【部署】** 按鈕。
5. **大功告成**：複製畫面最終產生的「網頁應用程式網址（URL）」，這就是您專屬的管理網頁了！將此網址提供給實驗室同仁即可開始使用。

---

### 🌐 English Deployment Guide

#### Step 1: Copy the Template

Click the link below to clone the system template directly into your personal Google account:
👉 **[【Click Here to Clone the System Template Spreadsheet】](https://docs.google.com/spreadsheets/d/1AZ8uN7qDuEBC6OBNbeNcrYt6IGBVJKlaJE3hgjCL_aw/copy)**

*Note: Please refresh the spreadsheet page after copying, and you will see a custom menu "🧪 SDS 系統管理" appear on the top toolbar.*

#### Step 2: One-Click System Initialization

1. Click the custom menu on the top toolbar: **【🧪 SDS 系統管理】 -> 【⚙️ 初始化試算表欄位】**.
2. **Grant Permission**: Google will pop up a security warning for the first run. Grant permissions by clicking:
   * **"Advanced"** -> **"Go to shared_Lab_SDS (unsafe)"** -> **"Allow"**.
3. **Auto Create Folder**: After authorization, a prompt window will appear. **Leave the text box completely BLANK and click "OK"**. The system will automatically create a dedicated PDF storage folder in your Google Drive root directory.

#### Step 3: Deploy the Web Application

1. In your spreadsheet toolbar, click **【Extensions】 -> 【Apps Script】**.
2. Inside the editor, click the blue button on the top right: **【Deploy】 -> 【New Deployment】**.
3. Click the gear icon next to "Select type" and choose **"Web App"**.
4. Leave all default settings as they are, and click the **【Deploy】** button at the bottom right.
5. **Success!**: Copy the generated **"Web app URL"**. This is your exclusive laboratory dashboard! Share this link with your lab colleagues to start tracking.

---

## License

This project is licensed under the MIT License - feel free to use and adapt it for your lab!
本專案採用 MIT 開源授權，歡迎自由複製、修改並部署於您的實驗室中！

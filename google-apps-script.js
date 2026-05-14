/**
 * =============================================
 *  Summer Tour 2026 — Google Apps Script
 *  接收报名表单提交（multipart/form-data），写入 Google Sheet
 * =============================================
 *
 *  部署步骤见 setup-guide.md
 *  1. 打开 script.google.com，新建项目，粘贴本文件内容
 *  2. 修改 SPREADSHEET_ID 为你的 Sheet ID
 *  3. 部署 → 新建部署 → 类型选「网页应用」
 *      - 执行身份：Me（你的账号）
 *      - 访问权限：Anyone（匿名用户也能提交表单）
 *  4. 复制部署 URL，填入 index.html 的 APPS_SCRIPT_URL
 *
 *  工作原理：
 *  前端网页用 iframe 提交表单（绕过 CORS），
 *  本脚本处理完后返回 HTML，其中 <script> 调用
 *  parent.postMessage() 通知父页面提交结果。
 */

// =============================================
// 配置区 —— 修改这两处
// =============================================

// 你的 Google Sheet ID（从 Sheet URL 里复制）
// 例如：https://docs.google.com/spreadsheets/d/ABC123xyz/edit#gid=0
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';

// 接收报名通知的邮箱（可选）
const NOTIFY_EMAIL = 'angell@magikidlab.com';

// =============================================
//  doPost —— 接收表单 POST 请求（multipart/form-data）
// =============================================
function doPost(e) {
  try {
    // e.parameters  包含普通表单字段（字符串）
    // e.files       包含上传的文件（Blob 对象）
    const p = e.parameters || {};

    const firstName   = p.firstName   ? p.firstName[0]   : '';
    const lastName    = p.lastName    ? p.lastName[0]    : '';
    const dob         = p.dob         ? p.dob[0]         : '';
    const grade       = p.grade       ? p.grade[0]       : '';
    const email       = p.email       ? p.email[0]       : '';
    const phone       = p.phone       ? p.phone[0]       : '';
    const gpa         = p.gpa         ? p.gpa[0]         : '';
    const country     = p.country     ? p.country[0]     : '';
    const motivation  = p.motivation  ? p.motivation[0]  : '';
    const submittedAt = p.submittedAt ? p.submittedAt[0] : new Date().toISOString();
    const lang        = p.lang        ? p.lang[0]        : 'en';

    // 处理文件上传（multipart/form-data 方式，文件在 e.files）
    let transcriptUrl = '';
    let resumeUrl     = '';

    if (e.files && e.files.transcript) {
      const blob = e.files.transcript[0] || e.files.transcript;
      transcriptUrl = saveBlobToDrive_(blob, `${firstName}_${lastName}_transcript`);
    }
    if (e.files && e.files.resume) {
      const blob = e.files.resume[0] || e.files.resume;
      resumeUrl = saveBlobToDrive_(blob, `${firstName}_${lastName}_resume`);
    }

    // 写入 Google Sheet
    const sheet = getSheet_();
    sheet.appendRow([
      submittedAt,
      firstName,
      lastName,
      dob,
      grade,
      email,
      phone,
      gpa,
      country,
      (motivation || '').substring(0, 500),
      transcriptUrl,
      resumeUrl,
      lang,
    ]);

    // 发送邮件通知（可选）
    if (NOTIFY_EMAIL) {
      const subject = '【新报名】' + firstName + ' ' + lastName + ' — Summer Tour 2026';
      const body =
        '新报名提交！\n\n' +
        '姓名：' + firstName + ' ' + lastName + '\n' +
        '出生日期：' + dob + '\n' +
        '年级：' + grade + '\n' +
        '邮箱：' + email + '\n' +
        '电话：' + phone + '\n' +
        'GPA：' + gpa + '\n' +
        '国家：' + country + '\n' +
        '提交时间：' + submittedAt + '\n\n' +
        '个人陈述：\n' + motivation + '\n\n' +
        '成绩单：' + (transcriptUrl || '未上传') + '\n' +
        '简历：' + (resumeUrl || '未上传') + '\n\n' +
        '👉 查看全部报名：https://docs.google.com/spreadsheets/d/' + SPREADSHEET_ID;
      MailApp.sendEmail(NOTIFY_EMAIL, subject, body);
    }

    // 返回 HTML，通过 postMessage 通知父页面「成功」
    return HtmlService.createHtmlOutput(
      '<!DOCTYPE html><html><body>' +
      '<script>parent.postMessage("FORM_SUBMIT_SUCCESS","*");</' + 'script>' +
      '</body></html>'
    );

  } catch (err) {
    console.error('doPost error:', err);
    // 返回 HTML，通过 postMessage 通知父页面「失败」
    return HtmlService.createHtmlOutput(
      '<!DOCTYPE html><html><body>' +
      '<script>parent.postMessage("FORM_SUBMIT_ERROR:' + escapeHtml_(err.message) + '","*");</' + 'script>' +
      '</body></html>'
    );
  }
}

// =============================================
//  辅助函数
// =============================================

/** 获取或创建 Sheet（含表头） */
function getSheet_() {
  const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet   = ss.getSheetByName('报名表');
  if (!sheet) {
    sheet = ss.insertSheet('报名表');
    sheet.getRange(1, 1, 1, 14).setValues([[
      '提交时间', '名', '姓', '出生日期', '年级',
      '邮箱', '电话', 'GPA', '国家',
      '个人陈述', '成绩单链接', '简历链接', '语言',
    ]]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 14).setBackground('#1a1a2e').setFontColor('#ffffff').setFontWeight('bold');
  }
  return sheet;
}

/** 将 Blob 保存到 Google Drive，返回可访问的链接 */
function saveBlobToDrive_(blob, filename) {
  try {
    if (!blob) return '';

    // 保存到 Drive 的「Summer Tour 2026 - Applications」文件夹
    let folder;
    const folders = DriveApp.getFoldersByName('Summer Tour 2026 - Applications');
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder('Summer Tour 2026 - Applications');
    }

    const file = folder.createFile(blob);
    file.setName(filename + '_' + new Date().getTime());
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getUrl();
  } catch (err) {
    console.error('saveBlobToDrive_ error:', err);
    return '';
  }
}

/** 转义 HTML 特殊字符，防止 XSS */
function escapeHtml_(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** 测试函数 —— 在 Apps Script 编辑器里运行此函数，验证 Sheet 连接正常 */
function testConnection() {
  const sheet = getSheet_();
  sheet.appendRow([
    new Date().toISOString(),
    'Test', 'User', '2008-01-01', '10',
    'test@example.com', '+1 310 000 0000', '4.0', 'US',
    'This is a test submission.', '', '', 'en',
  ]);
  console.log('✅ 测试行已写入 Sheet！');
}

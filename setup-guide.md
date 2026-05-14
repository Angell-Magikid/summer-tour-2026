# Summer Tour 2026 — 表单接收部署指南

## 你需要做什么（约 10 分钟）

---

## 第一步：创建 Google Sheet

1. 打开 [docs.google.com/spreadsheets](https://docs.google.com/spreadsheets)
2. 新建一个空白表格
3. 把表格名称改为：`Summer Tour 2026 - 报名表`
4. **复制表格 ID**（URL 中 `/d/` 和 `/edit` 之间的那串字符）

```
https://docs.google.com/spreadsheets/d/ABC123XYZ/edit#gid=0
                                      ^^^^^^^^
                                      这就是 Sheet ID
```

5. 把 Sheet ID 记下来，待会要用

---

## 第二步：创建 Google Apps Script

1. 打开 [script.google.com](https://script.google.com)
2. 点击「新建项目」
3. 将默认的 `Code.gs` 内容**全部删除**，粘贴 `google-apps-script.js` 里的代码
4. 找到这一行，把 Sheet ID 替换成你自己的：

```javascript
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
```

5. （可选）修改通知邮箱：

```javascript
const NOTIFY_EMAIL = 'angell@magikidlab.com';  // 改成你的邮箱
```

6. 点击顶部菜单「项目设置」（齿轮图标）→ 勾选「在编辑器中显示「appsscript.json」清单文件」
7. 打开 `appsscript.json`，确保内容包含：

```json
{
  "timeZone": "America/Chicago",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER_LOGGING",
  "runtimeVersion": "V8",
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/gmail"
  ]
}
```

8. 保存（Ctrl+S / Cmd+S）

---

## 第三步：测试连接

1. 在 Apps Script 编辑器中，点击 `testConnection` 函数
2. 点击「运行」▶️ 按钮
3. 首次运行需要授权，点击「查看权限」→ 选择你的 Google 账号 → 点击「高级」→「转到...（不安全）」→「允许」
4. 回到 Sheets，确认第一行（表头）和测试行已出现 ✅

---

## 第四步：部署为网页应用

1. 点击右上角「部署」→「新建部署」
2. 点击「选择类型」→ 选「网页应用」
3. 设置：
   - **说明**：`Summer Tour 2026 Form Handler`
   - **执行身份**：`以我的身份`（Me）
   - **谁可以访问**：`任何人`（Anyone，包括匿名用户）
4. 点击「部署」
5. **复制部署 URL**（类似 `https://script.google.com/macros/s/xxxxxxxxx/exec`）

---

## 第五步：更新网站代码

1. 打开 `index.html`
2. 找到这一行：

```javascript
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
```

3. 把 URL 替换成你刚才复制的部署 URL
4. 保存并提交到 GitHub

---

## 第七步（可选）：允许文件上传

如果表单需要上传文件（transcript / resume），Apps Script 需要额外权限：

1. 在 Apps Script 编辑器中，点击「项目设置」→ 勾选「Show "appsscript.json" in editor」
2. 确保 `appsscript.json` 包含 Drive 权限（已在上面配置）
3. 文件会自动保存到你的 Google Drive 的 `Summer Tour 2026 - Applications` 文件夹
4. Sheet 里会显示文件链接，只有你能访问

---

## 重要提示

- ⚠️ **部署 URL 是公开的**，但数据只写入你的私人 Sheet
- ⚠️ **不要分享 Sheet 链接给任何人**
- 每次修改 Apps Script 代码后，需要**重新部署**（点击「部署」→「管理部署」→ 编辑 → 版本选「新建版本」）
- 新部署后 URL 不变，但需要等 1-2 分钟生效

---

## 检查清单

- [ ] 创建了 Google Sheet，复制了 Sheet ID
- [ ] 创建了 Apps Script，粘贴了代码，替换了 Sheet ID
- [ ] 运行了 `testConnection`，确认 Sheet 里有测试数据
- [ ] 部署了网页应用，复制了部署 URL
- [ ] 把部署 URL 填入了 `index.html` 的 `APPS_SCRIPT_URL`
- [ ] 提交并推送了最新 `index.html` 到 GitHub
- [ ] 用测试数据提交一次表单，确认 Sheet 里有数据 ✅

# 出差助手（Travel Assistant）

一个纯前端、零后端的出差管理小应用。iOS 风格界面，数据存在浏览器本地（localStorage），天气使用 Open-Meteo 免费接口（无需密钥）。

## 功能

- **首页仪表盘**：即将到来的出差、家乡实时天气、本年统计
- **出差管理**：新建 / 查看出差，自动生成 iOS 风格行程方案
  - 每日行程时间线
  - 交通安排（高铁 / 飞机 / 打车）
  - 费用记录（按类别汇总）
  - 目的地实时天气
  - 备注
- **天气查询**：输入任意中文城市名，查看实时天气 + 未来 3 日预报
- **费用报销**：所有出差花销自动汇总，按类别统计
- **出行清单**：可勾选的打包清单，支持多清单
- **城市资料库**：常用出差城市的交通 / 美食 / 天气 / 贴士

## 文件结构

```
travel-assistant/
├── index.html              # 首页仪表盘
├── trips.html              # 出差管理 + 行程方案详情
├── weather.html            # 天气查询
├── expense.html            # 费用报销
├── checklist.html          # 出行清单
├── cities.html             # 城市资料库
├── assets/
│   ├── css/style.css      # iOS 风格样式
│   └── js/
│       ├── util.js        # 工具：天气码映射、格式化、真实天气接口
│       ├── store.js       # 本地数据层（localStorage）
│       └── nav.js         # 底部 Tab 导航
└── README.md
```

## 本地预览

直接用浏览器打开 `index.html` 即可（天气查询需要联网）。
或启动本地服务：

```bash
python -m http.server 8000
# 浏览器访问 http://localhost:8000
```

## 部署到 GitHub Pages

1. 在 GitHub 新建仓库（建议 Public）。
2. 把本目录下的**所有文件**（含 `assets` 文件夹）上传到仓库根目录。
3. 仓库 → **Settings** → **Pages** → Source 选 **Deploy from a branch** → Branch 选 **main** → 文件夹 **/root** → **Save**。
4. 等待 1–2 分钟，访问 `https://你的用户名.github.io/仓库名/` 即可。

> 注意：首页文件必须叫 `index.html` 且位于根目录。

## 关于数据

- 所有数据保存在**浏览器本地**，换设备 / 清缓存会丢失。
- 升级迭代：改完代码 → 重新上传（或在本地改完 push 到 GitHub）→ GitHub Pages 自动更新。
- 建议定期手动备份（可后续扩展「导出 / 导入」功能）。

## 迭代建议

- 接入 GitHub Actions 自动部署（改代码即上线）
- 增加「导出 Excel / PDF」报销单
- 用 GitHub Issues 或表单收集多人出差需求
- 天气增加出行建议（如「记得带伞」）

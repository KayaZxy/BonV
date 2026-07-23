/* ============================================================
 * util.js — 出差助手共享工具
 * 天气数据来源：Open-Meteo（免费、免密钥、支持 CORS）
 * 地理编码：Open-Meteo Geocoding API
 * ============================================================ */

/* WMO 天气代码 → 中文描述 + emoji 图标 */
const WEATHER_CODE = {
  0:  { t: "晴",        i: "☀️" },
  1:  { t: "大致晴朗",   i: "🌤️" },
  2:  { t: "部分多云",   i: "⛅" },
  3:  { t: "阴",        i: "☁️" },
  45: { t: "雾",        i: "🌫️" },
  48: { t: "雾凇",      i: "🌫️" },
  51: { t: "小毛毛雨",   i: "🌦️" },
  53: { t: "毛毛雨",     i: "🌦️" },
  55: { t: "大毛毛雨",   i: "🌧️" },
  56: { t: "冻毛毛雨",   i: "🌧️" },
  57: { t: "强冻毛毛雨", i: "🌧️" },
  61: { t: "小雨",       i: "🌧️" },
  63: { t: "中雨",       i: "🌧️" },
  65: { t: "大雨",       i: "🌧️" },
  66: { t: "冻雨",       i: "🌧️" },
  67: { t: "强冻雨",     i: "🌧️" },
  71: { t: "小雪",       i: "🌨️" },
  73: { t: "中雪",       i: "🌨️" },
  75: { t: "大雪",       i: "❄️" },
  77: { t: "雪粒",       i: "🌨️" },
  80: { t: "阵雨",       i: "🌦️" },
  81: { t: "强阵雨",     i: "🌧️" },
  82: { t: "暴雨",       i: "⛈️" },
  85: { t: "阵雪",       i: "🌨️" },
  86: { t: "强阵雪",     i: "❄️" },
  95: { t: "雷阵雨",     i: "⛈️" },
  96: { t: "雷阵雨伴冰雹", i: "⛈️" },
  99: { t: "强雷暴伴冰雹", i: "⛈️" }
};
function codeInfo(c) { return WEATHER_CODE[c] || { t: "未知", i: "🌡️" }; }

/* 日期格式化 */
function fmtDate(s) {
  if (!s) return "";
  const d = new Date(s);
  if (isNaN(d)) return s;
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}
function fmtDateFull(s) {
  if (!s) return "";
  const d = new Date(s);
  if (isNaN(d)) return s;
  const w = ["日", "一", "二", "三", "四", "五", "六"][d.getDay()];
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} 周${w}`;
}
function todayStr() { return new Date().toISOString().slice(0, 10); }
function daysBetween(a, b) {
  const d1 = new Date(a), d2 = new Date(b);
  return Math.round((d2 - d1) / 86400000);
}
function durDays(start, end) {
  if (!start || !end) return 0;
  return daysBetween(start, end) + 1;
}

/* HTML 转义，防止 XSS */
function esc(s) {
  if (s === null || s === undefined) return "";
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/* 生成唯一 ID */
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

/* 金额格式化 */
function yuan(n) { return "¥" + Number(n || 0).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

/* Toast 轻提示 */
let _toastTimer = null;
function toast(msg) {
  let el = document.querySelector(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove("show"), 1800);
}

/* 弹层（底部抽屉） */
function openSheet(title, bodyHtml, onMount) {
  closeSheet();
  const mask = document.createElement("div");
  mask.className = "sheet-mask";
  mask.innerHTML = `
    <div class="sheet" onclick="event.stopPropagation()">
      <div class="sheet-head">
        <h3>${esc(title)}</h3>
        <span class="x" onclick="closeSheet()">×</span>
      </div>
      <div class="sheet-body">${bodyHtml}</div>
    </div>`;
  mask.onclick = closeSheet;
  document.body.appendChild(mask);
  if (typeof onMount === "function") onMount(mask.querySelector(".sheet-body"));
}
function closeSheet() {
  const m = document.querySelector(".sheet-mask");
  if (m) m.remove();
}

/* ---------- 真实天气：地理编码 + 预报 ---------- */
const _geoCache = {};
async function geoCity(name) {
  if (_geoCache[name]) return _geoCache[name];
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=zh&format=json`;
  try {
    const r = await fetch(url);
    const j = await r.json();
    if (j && j.results && j.results[0]) {
      const c = j.results[0];
      const data = { lat: c.latitude, lon: c.longitude, name: c.name, country: c.country, admin: c.admin1 || "" };
      _geoCache[name] = data;
      return data;
    }
  } catch (e) { /* ignore */ }
  return null;
}

async function getWeather(cityName) {
  const geo = await geoCity(cityName);
  if (!geo) return null;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${geo.lat}&longitude=${geo.lon}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=3`;
  try {
    const r = await fetch(url);
    const j = await r.json();
    return { geo, current: j.current, daily: j.daily };
  } catch (e) { return null; }
}

/* 渲染天气卡（返回 HTML 字符串，需传入容器后填充） */
function weatherCardHTML(cityName, data) {
  if (!data) {
    return `<div class="weather-card"><div class="weather-city">${esc(cityName)}</div>
      <div class="weather-desc">天气获取失败，请检查网络或城市名</div></div>`;
  }
  const cur = data.current;
  const ci = codeInfo(cur.weather_code);
  const isDay = cur.is_day === 1;
  const days = data.daily.time.map((t, i) => ({
    date: t,
    code: data.daily.weather_code[i],
    max: Math.round(data.daily.temperature_2m_max[i]),
    min: Math.round(data.daily.temperature_2m_min[i])
  }));
  const wk = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  const d3 = days.slice(0, 3).map((d, i) => {
    const dt = new Date(d.date);
    const label = i === 0 ? "今天" : wk[dt.getDay()];
    const info = codeInfo(d.code);
    return `<div class="d"><div class="dt">${label}</div><div class="di">${info.i}</div>
      <div class="dtemp">${d.max}°/${d.min}°</div></div>`;
  }).join("");
  return `
    <div class="weather-card${isDay ? "" : " night"}">
      <div class="weather-city">${esc(cityName)}</div>
      <div class="weather-temp">${Math.round(cur.temperature_2m)}°</div>
      <div class="weather-desc">${ci.i} ${ci.t} · 体感 ${Math.round(cur.apparent_temperature)}°</div>
      <div class="weather-meta">
        <span>💧 湿度 ${cur.relative_humidity_2m}%</span>
        <span>🌬️ 风速 ${Math.round(cur.wind_speed_10m)} km/h</span>
        <span>🌧️ 降水 ${cur.precipitation} mm</span>
      </div>
      <div class="weather-3d">${d3}</div>
    </div>`;
}

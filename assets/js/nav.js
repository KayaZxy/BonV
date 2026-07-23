/* ============================================================
 * nav.js — 底部 Tab 导航
 * 用法：页面底部 <script> 里调用 renderTabbar('home')
 * 可选 key: home | trips | weather | expense | checklist
 * ============================================================ */

const TABS = [
  { key: "home",      icon: "🏠", label: "首页",   href: "index.html" },
  { key: "trips",     icon: "✈️", label: "出差",   href: "trips.html" },
  { key: "weather",   icon: "🌤️", label: "天气",   href: "weather.html" },
  { key: "expense",   icon: "💰", label: "费用",   href: "expense.html" },
  { key: "checklist", icon: "🎒", label: "清单",   href: "checklist.html" }
];

function renderTabbar(active) {
  if (document.querySelector(".tabbar")) return;
  const bar = document.createElement("nav");
  bar.className = "tabbar";
  bar.innerHTML = TABS.map(t =>
    `<a class="tab ${t.key === active ? "active" : ""}" href="${t.href}">
       <span class="ti">${t.icon}</span><span>${t.label}</span>
     </a>`
  ).join("");
  document.body.appendChild(bar);
}

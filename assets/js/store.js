/* ============================================================
 * store.js — 出差助手本地数据层（localStorage）
 * 所有数据存在浏览器本地，换设备不共享，但无需后端、免部署配置
 * ============================================================ */

const STORE_KEY = "travelAssistant.v1";

const SEED = {
  profile: {
    name: "daddy",
    homeCity: "长沙",
    homeStation: "湘潭北站",
    altStation: "长沙南站",
    airport: "长沙黄花机场"
  },
  trips: [
    {
      id: "seed-trip-1",
      title: "怀化出差",
      city: "怀化",
      start: "2026-07-23",
      end: "2026-07-24",
      purpose: "客户拜访 + 项目验收",
      days: [
        { day: 1, date: "2026-07-23", items: [
          { time: "08:20", title: "高铁前往怀化南", place: "湘潭北站 → 怀化南站", note: "G字头，约 1.5h" },
          { time: "12:00", title: "入住酒店", place: "怀化市区", note: "含早，携程已订" },
          { time: "14:00", title: "客户拜访", place: "客户公司", note: "准备演示材料" },
          { time: "18:30", title: "商务晚餐", place: "当地特色餐厅", note: "客户请" }
        ]},
        { day: 2, date: "2026-07-24", items: [
          { time: "09:30", title: "项目验收会", place: "客户会议室", note: "带签署文件" },
          { time: "15:00", title: "返程高铁", place: "怀化南站 → 湘潭北站", note: "" }
        ]}
      ],
      transport: [
        { type: "高铁", from: "湘潭北站", to: "怀化南站", time: "08:20", no: "G6162", note: "二等座 ¥152" },
        { type: "高铁", from: "怀化南站", to: "湘潭北站", time: "15:00", no: "G6165", note: "二等座 ¥152" }
      ],
      expenses: [
        { id: "e1", date: "2026-07-23", category: "交通", amount: 304, note: "往返高铁" },
        { id: "e2", date: "2026-07-23", category: "住宿", amount: 268, note: "酒店一晚" },
        { id: "e3", date: "2026-07-24", category: "餐饮", amount: 120, note: "午晚餐自理部分" }
      ],
      notes: "怀化南站离市区约 20 分钟车程，打车方便。"
    }
  ],
  checklists: [
    { id: "seed-cl-1", name: "通用出差清单", items: [
      { text: "身份证", checked: false },
      { text: "充电器 / 充电宝", checked: false },
      { text: "笔记本电脑 + 电源线", checked: false },
      { text: "名片", checked: false },
      { text: "换洗衣物", checked: false },
      { text: "常用药品", checked: false },
      { text: "洗漱包", checked: false },
      { text: "雨伞", checked: false }
    ]}
  ],
  cities: [
    { name: "怀化", loc: "湖南省西部", transport: "怀化南站（高铁）、怀化站（普速）", food: "芷江鸭、洪江血粑鸭、黔阳大碗菜", weather: "亚热带湿润气候，夏季多雨闷热，注意防潮", tip: "山区多，早晚温差略大；高铁站到市区打车约 20 分钟" },
    { name: "成都", loc: "四川省中部，成都平原", transport: "成都东站（高铁枢纽）、成都双流/天府机场", food: "火锅、串串香、担担面、夫妻肺片", weather: "盆地湿润，冬季阴冷少雪，夏季闷热多雨", tip: "地铁发达，市内通勤优先地铁；美食多，注意肠胃" },
    { name: "长沙", loc: "湖南省东部，湘江畔", transport: "长沙南站（高铁）、湘潭北站（近家）、黄花机场", food: "臭豆腐、茶颜悦色、口味虾、剁椒鱼头", weather: "亚热带季风，夏季炎热潮湿，冬季湿冷", tip: "家在岳麓区大王山，近湘潭北站；去程 9:30 前可走湘潭北，否则走长沙南更顺" }
  ]
};

let _db = null;

function loadDB() {
  if (_db) return _db;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) { _db = JSON.parse(raw); }
    else { _db = JSON.parse(JSON.stringify(SEED)); saveDB(); }
  } catch (e) {
    _db = JSON.parse(JSON.stringify(SEED)); saveDB();
  }
  return _db;
}
function saveDB() {
  if (!_db) return;
  localStorage.setItem(STORE_KEY, JSON.stringify(_db));
}
function resetDB() {
  _db = JSON.parse(JSON.stringify(SEED)); saveDB();
}

/* ---------- 资料读取 ---------- */
function getProfile() { return loadDB().profile; }
function getTrips() { return loadDB().trips; }
function getTrip(id) { return loadDB().trips.find(t => t.id === id) || null; }
function getChecklists() { return loadDB().checklists; }
function getCities() { return loadDB().cities; }

/* ---------- 出差 CRUD ---------- */
function addTrip(t) {
  const db = loadDB();
  t.id = t.id || uid();
  if (!t.days) t.days = [];
  if (!t.transport) t.transport = [];
  if (!t.expenses) t.expenses = [];
  if (!t.notes) t.notes = "";
  db.trips.unshift(t);
  saveDB();
  return t;
}
function updateTrip(id, patch) {
  const db = loadDB();
  const t = db.trips.find(x => x.id === id);
  if (t) { Object.assign(t, patch); saveDB(); }
  return t;
}
function deleteTrip(id) {
  const db = loadDB();
  db.trips = db.trips.filter(t => t.id !== id);
  saveDB();
}
function tripExpenseTotal(trip) {
  if (!trip || !trip.expenses) return 0;
  return trip.expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
}

/* ---------- 费用 ---------- */
function addExpense(e) {
  const db = loadDB();
  e.id = e.id || uid();
  db.trips.forEach(t => { if (t.id === e.tripId) { t.expenses = t.expenses || []; t.expenses.push(e); } });
  saveDB();
}
function allExpenses() {
  const db = loadDB();
  const list = [];
  db.trips.forEach(t => (t.expenses || []).forEach(e => list.push(Object.assign({ tripTitle: t.title }, e))));
  return list.sort((a, b) => (a.date < b.date ? 1 : -1));
}

/* ---------- 清单 ---------- */
function toggleChecklistItem(clId, itemIdx) {
  const db = loadDB();
  const cl = db.checklists.find(c => c.id === clId);
  if (cl && cl.items[itemIdx]) { cl.items[itemIdx].checked = !cl.items[itemIdx].checked; saveDB(); }
}

/* ---------- 城市 ---------- */
function addCity(c) {
  const db = loadDB();
  db.cities.unshift(c);
  saveDB();
}
function deleteCity(name) {
  const db = loadDB();
  db.cities = db.cities.filter(c => c.name !== name);
  saveDB();
}

/* 导出 / 导入（方便备份与换设备） */
function exportData() {
  return JSON.stringify(loadDB(), null, 2);
}
function importData(json) {
  try {
    const d = JSON.parse(json);
    if (!d.trips || !d.profile) throw new Error("格式不正确");
    _db = d; saveDB(); return true;
  } catch (e) { return false; }
}

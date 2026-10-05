// ==============================
// KAEDE OS
// 完成版 JavaScript(天気つき)
// ==============================

let clockTimer = null;
let touchStartY = 0;
let weatherCache = null;


// ==============================
// 共通の小さな関数
// ==============================

function getNow() {
  return new Date();
}

// ユーザーが入力した文字をHTMLに入れても壊れないようにする
function escapeHTML(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// "9:00" や "09:00" を分に直す(並び替え用)
function timeToMinutes(time) {
  const parts = String(time).split(":");
  return Number(parts[0]) * 60 + Number(parts[1] || 0);
}


// ==============================
// 現在時刻
// ==============================

function getCurrentTime() {
  const now = getNow();

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return hours + ":" + minutes + ":" + seconds;
}


// ==============================
// 日付
// ==============================

function getCurrentDate() {
  const now = getNow();

  const week = ["日", "月", "火", "水", "木", "金", "土"];

  return (
    now.getFullYear() + "年" +
    (now.getMonth() + 1) + "月" +
    now.getDate() + "日（" +
    week[now.getDay()] + "）"
  );
}


// ==============================
// アナログ時計
// ==============================

function updateAnalogClocks() {
  const now = getNow();

  const seconds = now.getSeconds();
  const minutes = now.getMinutes();
  const hours = now.getHours();

  const secondDegree = seconds * 6;
  const minuteDegree = minutes * 6 + seconds * 0.1;
  const hourDegree = (hours % 12) * 30 + minutes * 0.5;

  document.querySelectorAll(".secondHand").forEach(function (hand) {
    hand.style.transform = "rotate(" + secondDegree + "deg)";
  });

  document.querySelectorAll(".minuteHand").forEach(function (hand) {
    hand.style.transform = "rotate(" + minuteDegree + "deg)";
  });

  document.querySelectorAll(".hourHand").forEach(function (hand) {
    hand.style.transform = "rotate(" + hourDegree + "deg)";
  });
}


// ==============================
// 時計を更新
// ==============================

function updateAllClocks() {
  const time = getCurrentTime();
  const date = getCurrentDate();

  const lockClock = document.getElementById("lockClock");
  const lockDate = document.getElementById("lockDate");
  const homeClock = document.getElementById("homeClock");
  const homeDate = document.getElementById("homeDate");

  if (lockClock) lockClock.textContent = time;
  if (lockDate) lockDate.textContent = date;
  if (homeClock) homeClock.textContent = time;
  if (homeDate) homeDate.textContent = date;

  updateAnalogClocks();
}


// ==============================
// 時計開始
// ==============================

function startClock() {
  updateAllClocks();

  if (clockTimer) {
    clearInterval(clockTimer);
  }

  clockTimer = setInterval(updateAllClocks, 1000);
}


// ==============================
// 天気(現在地)
// ==============================

function getWeatherInfo(code) {
  if (code === 0) return { icon: "☀️", text: "快晴" };
  if (code <= 2) return { icon: "🌤️", text: "晴れ" };
  if (code === 3) return { icon: "☁️", text: "くもり" };
  if (code <= 48) return { icon: "🌫️", text: "霧" };
  if (code <= 57) return { icon: "🌦️", text: "霧雨" };
  if (code <= 67) return { icon: "🌧️", text: "雨" };
  if (code <= 77) return { icon: "❄️", text: "雪" };
  if (code <= 82) return { icon: "🌧️", text: "にわか雨" };
  if (code <= 86) return { icon: "🌨️", text: "にわか雪" };
  if (code >= 95) return { icon: "⛈️", text: "雷雨" };

  return { icon: "🌡️", text: "不明" };
}


function showWeather(data) {
  const icon = document.getElementById("weatherIcon");
  const temp = document.getElementById("weatherTemperature");
  const text = document.getElementById("weatherText");

  // ホーム画面にいないときは何もしない
  if (!icon || !temp || !text) {
    return;
  }

  icon.textContent = data.icon;
  temp.textContent = data.temp + "℃";
  text.textContent = data.text;
}


function showWeatherError(message) {
  const icon = document.getElementById("weatherIcon");
  const temp = document.getElementById("weatherTemperature");
  const text = document.getElementById("weatherText");

  if (!icon || !temp || !text) {
    return;
  }

  icon.textContent = "⚠️";
  temp.textContent = "--℃";
  text.textContent = message;
}


function loadWeather() {
  // 10分以内ならキャッシュを使う(通信を減らすため)
  if (weatherCache && Date.now() - weatherCache.time < 10 * 60 * 1000) {
    showWeather(weatherCache);
    return;
  }

  if (!navigator.geolocation) {
    showWeatherError("位置情報に対応していません");
    return;
  }

  navigator.geolocation.getCurrentPosition(

    async function (position) {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      const url =
        "https://api.open-meteo.com/v1/forecast" +
        "?latitude=" + lat +
        "&longitude=" + lon +
        "&current=temperature_2m,weather_code" +
        "&timezone=auto";

      try {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("HTTP " + response.status);
        }

        const json = await response.json();
        const info = getWeatherInfo(json.current.weather_code);

        weatherCache = {
          icon: info.icon,
          text: info.text,
          temp: Math.round(json.current.temperature_2m),
          time: Date.now()
        };

        showWeather(weatherCache);

      } catch (error) {
        showWeatherError("天気を取得できませんでした");
      }
    },

    function () {
      showWeatherError("位置情報が許可されていません");
    },

    {
      timeout: 10000
    }

  );
}


// ==============================
// iPhoneカレンダー同期(iCloud公開カレンダー)
// ==============================

// Cloudflare WorkersのURLをここに入れる(空のままだと同期しない)
const CALENDAR_PROXY_URL = "";

const SYNC_INTERVAL = 15 * 60 * 1000; // 15分ごと

let syncedEvents = [];


function parseICSDate(value) {
  const m = String(value).match(
    /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/
  );

  if (!m) return null;

  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);

  // 終日の予定
  if (!m[4]) {
    return { date: new Date(y, mo, d), allDay: true };
  }

  const h = Number(m[4]);
  const mi = Number(m[5]);
  const s = Number(m[6]);

  // UTC(末尾がZ)
  if (m[7]) {
    return { date: new Date(Date.UTC(y, mo, d, h, mi, s)), allDay: false };
  }

  // 端末の時間として扱う
  return { date: new Date(y, mo, d, h, mi, s), allDay: false };
}


function parseICS(text) {
  const lines = text.replace(/\r?\n[ \t]/g, "").split(/\r?\n/);

  const events = [];
  let ev = null;

  lines.forEach(function (line) {
    if (line === "BEGIN:VEVENT") {
      ev = { exdates: [] };
      return;
    }

    if (line === "END:VEVENT") {
      // 変更された繰り返しの1回分(RECURRENCE-ID)は対応外のため除く
      if (ev && ev.start && !ev.recurrenceId) {
        events.push(ev);
      }
      ev = null;
      return;
    }

    if (!ev) return;

    const idx = line.indexOf(":");
    if (idx < 0) return;

    const name = line.slice(0, idx).split(";")[0].toUpperCase();
    const value = line.slice(idx + 1);

    if (name === "SUMMARY") {
      ev.summary = value
        .replace(/\\n/gi, " ")
        .replace(/\\([,;\\])/g, "$1");
    }

    if (name === "DTSTART") ev.start = parseICSDate(value);
    if (name === "DTEND") ev.end = parseICSDate(value);
    if (name === "RRULE") ev.rrule = value;
    if (name === "RECURRENCE-ID") ev.recurrenceId = value;

    if (name === "EXDATE") {
      value.split(",").forEach(function (v) {
        ev.exdates.push(v.slice(0, 8));
      });
    }
  });

  return events;
}


function ymd(date) {
  return (
    date.getFullYear() +
    String(date.getMonth() + 1).padStart(2, "0") +
    String(date.getDate()).padStart(2, "0")
  );
}


// その日に予定があるか(繰り返しは基本的なものだけ対応)
function occursOnDay(ev, dayStart) {
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  const s = ev.start.date;
  const e = ev.end ? ev.end.date : s;

  if (ev.exdates.indexOf(ymd(dayStart)) >= 0) return false;

  if (!ev.rrule) {
    if (e <= s) return s >= dayStart && s < dayEnd;
    return s < dayEnd && e > dayStart;
  }

  const rule = {};
  ev.rrule.split(";").forEach(function (part) {
    const kv = part.split("=");
    rule[kv[0]] = kv[1];
  });

  const sDay = new Date(s.getFullYear(), s.getMonth(), s.getDate());

  if (dayStart < sDay) return false;

  if (rule.UNTIL) {
    const until = parseICSDate(rule.UNTIL);
    if (until && dayStart > until.date) return false;
  }

  const interval = Number(rule.INTERVAL || 1);
  const diffDays = Math.round((dayStart - sDay) / (24 * 60 * 60 * 1000));
  const names = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

  if (rule.FREQ === "DAILY") {
    return diffDays % interval === 0;
  }

  if (rule.FREQ === "WEEKLY") {
    const days = rule.BYDAY
      ? rule.BYDAY.split(",")
      : [names[s.getDay()]];

    return (
      days.indexOf(names[dayStart.getDay()]) >= 0 &&
      Math.floor(diffDays / 7) % interval === 0
    );
  }

  if (rule.FREQ === "MONTHLY") {
    const months =
      (dayStart.getFullYear() - s.getFullYear()) * 12 +
      dayStart.getMonth() - s.getMonth();

    return dayStart.getDate() === s.getDate() && months % interval === 0;
  }

  if (rule.FREQ === "YEARLY") {
    return (
      dayStart.getMonth() === s.getMonth() &&
      dayStart.getDate() === s.getDate()
    );
  }

  return false;
}


// 今日の同期済み予定を {time, text, sort} の形で返す
function getSyncedToday() {
  const now = getNow();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const items = [];

  syncedEvents.forEach(function (ev) {
    if (!occursOnDay(ev, dayStart)) return;

    let time = "終日";
    let sort = -1;

    if (!ev.start.allDay) {
      const hh = String(ev.start.date.getHours()).padStart(2, "0");
      const mm = String(ev.start.date.getMinutes()).padStart(2, "0");

      time = hh + ":" + mm;
      sort = ev.start.date.getHours() * 60 + ev.start.date.getMinutes();
    }

    items.push({
      time: time,
      text: ev.summary || "(タイトルなし)",
      sort: sort
    });
  });

  return items;
}


async function syncCalendar() {
  if (!CALENDAR_PROXY_URL) return;

  try {
    const response = await fetch(CALENDAR_PROXY_URL);

    if (!response.ok) {
      throw new Error("HTTP " + response.status);
    }

    const text = await response.text();

    syncedEvents = parseICS(text);

    // 電波がないときのために保存しておく
    localStorage.setItem("kaedeSyncedICS", text);

  } catch (error) {
    // 失敗したら前回の保存分を使う
    const cached = localStorage.getItem("kaedeSyncedICS");

    if (cached && syncedEvents.length === 0) {
      syncedEvents = parseICS(cached);
    }
  }

  // ホーム画面を見ていれば表示を更新
  loadHomeSchedule();
}


// ==============================
// ホーム画面
// ==============================

function showHomeScreen() {
  document.getElementById("app").innerHTML = `

    <section id="homeScreen">

      <div class="homeHeader">

        <div class="homeTitle">KAEDE OS</div>

        <div class="homeClockArea">

          <div class="analogClock homeAnalogClock">
            <div class="clockHand hourHand"></div>
            <div class="clockHand minuteHand"></div>
            <div class="clockHand secondHand"></div>
            <div class="clockCenter"></div>
          </div>

          <div id="homeClock">00:00:00</div>

          <div id="homeDate" class="homeDate">0000年00月00日</div>

        </div>

      </div>


      <!-- 天気 -->

      <div class="weatherCard">

        <div class="weatherIcon" id="weatherIcon">⏳</div>

        <div>
          <div class="weatherTemperature" id="weatherTemperature">--℃</div>
          <div class="weatherText" id="weatherText">天気を取得中...</div>
        </div>

      </div>


      <!-- 今日の予定 -->

      <div class="scheduleCard">

        <div class="scheduleTitle">📅 今日の予定</div>

        <div id="homeScheduleList"></div>

      </div>


      <!-- アプリ -->

      <div class="apps">

        <button class="appButton" data-app="line">
          <div class="appIcon lineIcon">LINE</div>
          <div>LINE</div>
        </button>

        <button class="appButton" data-app="clock">
          <div class="appIcon">🕐</div>
          <div>時計</div>
        </button>

        <button class="appButton" data-app="maps">
          <div class="appIcon">📍</div>
          <div>地図</div>
        </button>

        <button class="appButton" data-app="music">
          <div class="appIcon">🎵</div>
          <div>音楽</div>
        </button>

        <button class="appButton" data-app="notes">
          <div class="appIcon notesIcon">📝</div>
          <div>メモ</div>
        </button>

        <button class="appButton" data-app="calendar">
          <div class="appIcon">📅</div>
          <div>カレンダー</div>
        </button>

        <button class="appButton" data-app="settings">
          <div class="appIcon settingsIcon">⚙️</div>
          <div>設定</div>
        </button>

      </div>

    </section>

  `;

  updateAllClocks();
  loadHomeSchedule();
  loadWeather();
  addAppButtonEvents();
}


// ==============================
// アプリボタン
// ==============================

function addAppButtonEvents() {
  const buttons = document.querySelectorAll(".appButton");

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      const app = button.dataset.app;

      if (app === "line") openLINE();
      if (app === "clock") openClock();
      if (app === "maps") openMaps();
      if (app === "music") openMusic();
      if (app === "notes") openNotes();
      if (app === "calendar") openCalendar();
      if (app === "settings") openSettings();
    });
  });
}


// ==============================
// 戻る
// ==============================

function goHome() {
  showHomeScreen();
}


// ==============================
// LINE / 地図 / 音楽
// ==============================

function openLINE() {

  // LINEアプリを直接開く
  window.location.href = "line://";

  // 1.5秒たっても画面が切り替わっていなければ、
  // アプリが入っていないと判断してLINE公式ページを開く
  setTimeout(function () {

    if (!document.hidden) {
      window.location.href = "https://line.me/R/";
    }

  }, 1500);

}

function openMaps() {
  window.location.href = "https://maps.apple.com/";
}

function openMusic() {
  window.location.href = "https://music.apple.com/";
}


// ==============================
// 時計アプリ
// ==============================

function openClock() {
  document.getElementById("app").innerHTML = `

    <section class="appScreen">

      <div class="appHeader">
        <button class="backButton" id="clockBack">←</button>
        <div class="appScreenTitle">時計</div>
      </div>

      <div style="display:flex; justify-content:center; margin-top:40px;">

        <div class="analogClock">
          <div class="clockHand hourHand"></div>
          <div class="clockHand minuteHand"></div>
          <div class="clockHand secondHand"></div>
          <div class="clockCenter"></div>
        </div>

      </div>

      <div
        id="homeClock"
        style="text-align:center; font-size:52px; margin-top:25px;">
        00:00:00
      </div>

    </section>

  `;

  document.getElementById("clockBack").addEventListener("click", goHome);

  updateAllClocks();
}


// ==============================
// メモ
// ==============================

function openNotes() {
  const savedMemo = localStorage.getItem("kaedeMemo") || "";

  document.getElementById("app").innerHTML = `

    <section class="appScreen">

      <div class="appHeader">
        <button class="backButton" id="notesBack">←</button>
        <div class="appScreenTitle">📝 メモ</div>
      </div>

      <textarea
        id="memoInput"
        class="memoInput"
        placeholder="ここにメモを書いてください..."></textarea>

      <button class="saveButton" id="saveMemo">保存</button>

      <div class="memoStatus" id="memoStatus">
        この端末のKAEDE OSに保存されます
      </div>

    </section>

  `;

  // HTMLに直接埋め込まず、値として入れる(安全なため)
  document.getElementById("memoInput").value = savedMemo;

  document.getElementById("notesBack").addEventListener("click", goHome);
  document.getElementById("saveMemo").addEventListener("click", saveMemo);
}


function saveMemo() {
  const memo = document.getElementById("memoInput").value;

  localStorage.setItem("kaedeMemo", memo);

  document.getElementById("memoStatus").textContent = "✓ 保存しました";
}


// ==============================
// 予定データ
// ==============================

function getSchedules() {
  const data = localStorage.getItem("kaedeSchedules");

  if (!data) {
    return [
      { time: "08:00", text: "〜10:00 宿題" },
      { time: "10:30", text: "〜11:30 昼ごはん" },
      { time: "13:00", text: "〜17:00 合唱" }
    ];
  }

  try {
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}


function saveSchedules(schedules) {
  localStorage.setItem("kaedeSchedules", JSON.stringify(schedules));
}


// ==============================
// ホームの予定
// ==============================

function loadHomeSchedule() {
  const list = document.getElementById("homeScheduleList");

  if (!list) {
    return;
  }

  // 手入力の予定 + iPhoneから同期した予定 を時刻順に並べる
  const manual = getSchedules().map(function (item) {
    return {
      time: item.time,
      text: item.text,
      sort: timeToMinutes(item.time)
    };
  });

  const schedules = manual.concat(getSyncedToday());

  schedules.sort(function (a, b) {
    return a.sort - b.sort;
  });

  list.innerHTML = "";

  schedules.forEach(function (item) {
    list.innerHTML += `

      <div class="scheduleItem">
        <div class="scheduleTime">${escapeHTML(item.time)}</div>
        <div>${escapeHTML(item.text)}</div>
      </div>

    `;
  });
}


// ==============================
// カレンダー画面
// ==============================

function openCalendar() {
  document.getElementById("app").innerHTML = `

    <section class="appScreen">

      <div class="appHeader">
        <button class="backButton" id="calendarBack">←</button>
        <div class="appScreenTitle">📅 カレンダー</div>
      </div>

      <div class="addSchedule">

        <input
          id="scheduleTimeInput"
          class="scheduleInput"
          type="time">

        <input
          id="scheduleTextInput"
          class="scheduleInput"
          type="text"
          placeholder="予定を入力">

        <button class="saveButton" id="addScheduleButton">
          予定を追加
        </button>

      </div>

      <div id="calendarList"></div>

    </section>

  `;

  document.getElementById("calendarBack").addEventListener("click", goHome);
  document.getElementById("addScheduleButton").addEventListener("click", addSchedule);

  renderCalendar();
}


// ==============================
// カレンダー表示
// ==============================

function renderCalendar() {
  const list = document.getElementById("calendarList");

  const schedules = getSchedules();

  list.innerHTML = "";

  schedules.forEach(function (item, index) {
    const element = document.createElement("div");

    element.className = "calendarItem";

    element.innerHTML = `

      <div>
        <strong>${escapeHTML(item.time)}</strong>
        <br>
        ${escapeHTML(item.text)}
      </div>

      <button class="deleteButton">削除</button>

    `;

    element.querySelector(".deleteButton").addEventListener("click", function () {
      deleteSchedule(index);
    });

    list.appendChild(element);
  });
}


// ==============================
// 予定追加
// ==============================

function addSchedule() {
  const time = document.getElementById("scheduleTimeInput").value;
  const text = document.getElementById("scheduleTextInput").value;

  if (!time || !text) {
    alert("時間と予定を入力してください");
    return;
  }

  const schedules = getSchedules();

  schedules.push({
    time: time,
    text: text
  });

  // 時刻の早い順に並べる
  schedules.sort(function (a, b) {
    return timeToMinutes(a.time) - timeToMinutes(b.time);
  });

  saveSchedules(schedules);

  document.getElementById("scheduleTimeInput").value = "";
  document.getElementById("scheduleTextInput").value = "";

  renderCalendar();
}


// ==============================
// 予定削除
// ==============================

function deleteSchedule(index) {
  const schedules = getSchedules();

  schedules.splice(index, 1);

  saveSchedules(schedules);

  renderCalendar();
}


// ==============================
// 設定
// ==============================

function openSettings() {
  document.getElementById("app").innerHTML = `

    <section class="appScreen">

      <div class="appHeader">
        <button class="backButton" id="settingsBack">←</button>
        <div class="appScreenTitle">⚙️ 設定</div>
      </div>

      <div class="settingCard">
        <div class="settingRow">
          <div class="settingLabel">KAEDE OS</div>
          <div>Version 1.1</div>
        </div>
      </div>

      <div class="settingCard">
        <div class="settingRow">
          <div class="settingLabel">メモを削除</div>
          <button class="settingButton" id="deleteMemo">削除</button>
        </div>
      </div>

      <div class="settingCard">
        <div class="settingRow">
          <div class="settingLabel">予定を初期状態に戻す</div>
          <button class="settingButton" id="resetSchedule">リセット</button>
        </div>
      </div>

    </section>

  `;

  document.getElementById("settingsBack").addEventListener("click", goHome);

  document.getElementById("deleteMemo").addEventListener("click", function () {
    localStorage.removeItem("kaedeMemo");
    alert("メモを削除しました");
  });

  document.getElementById("resetSchedule").addEventListener("click", function () {
    localStorage.removeItem("kaedeSchedules");
    alert("予定を初期状態に戻しました");
  });
}


// ==============================
// スワイプ(ロック画面 → ホーム画面)
// ==============================

document.addEventListener(
  "touchstart",
  function (event) {
    if (document.getElementById("lockScreen")) {
      touchStartY = event.touches[0].clientY;
    }
  },
  { passive: true }
);


document.addEventListener(
  "touchend",
  function (event) {
    const lockScreen = document.getElementById("lockScreen");

    if (!lockScreen) {
      return;
    }

    const touchEndY = event.changedTouches[0].clientY;
    const distance = touchStartY - touchEndY;

    if (distance > 60) {
      showHomeScreen();
    }
  },
  { passive: true }
);


// ==============================
// 開始
// ==============================

startClock();

// 前回の同期データがあれば先に読み込む
const cachedICS = localStorage.getItem("kaedeSyncedICS");

if (cachedICS) {
  syncedEvents = parseICS(cachedICS);
}

// 起動時に同期し、その後は15分ごとに同期
syncCalendar();
setInterval(syncCalendar, SYNC_INTERVAL);

// ==============================
// KAEDE OS
// 完成版 JavaScript
// ==============================


let clockTimer = null;

let touchStartY = 0;


// ==============================
// 現在時刻
// ==============================

function getNow() {

  return new Date();

}


function getCurrentTime() {

  const now = getNow();

  const hours =
    String(
      now.getHours()
    ).padStart(2, "0");

  const minutes =
    String(
      now.getMinutes()
    ).padStart(2, "0");

  const seconds =
    String(
      now.getSeconds()
    ).padStart(2, "0");


  return (
    hours +
    ":" +
    minutes +
    ":" +
    seconds
  );

}


// ==============================
// 日付
// ==============================

function getCurrentDate() {

  const now = getNow();


  const week = [

    "日",
    "月",
    "火",
    "水",
    "木",
    "金",
    "土"

  ];


  return (

    now.getFullYear() +
    "年" +

    (now.getMonth() + 1) +
    "月" +

    now.getDate() +
    "日（" +

    week[now.getDay()] +

    "）"

  );

}


// ==============================
// アナログ時計
// ==============================

function updateAnalogClocks() {

  const now = getNow();


  const seconds =
    now.getSeconds();


  const minutes =
    now.getMinutes();


  const hours =
    now.getHours();


  const secondDegree =
    seconds * 6;


  const minuteDegree =
    minutes * 6 +
    seconds * 0.1;


  const hourDegree =
    (hours % 12) * 30 +
    minutes * 0.5;


  document
    .querySelectorAll(".secondHand")
    .forEach(function(hand) {

      hand.style.transform =
        "rotate(" +
        secondDegree +
        "deg)";

    });


  document
    .querySelectorAll(".minuteHand")
    .forEach(function(hand) {

      hand.style.transform =
        "rotate(" +
        minuteDegree +
        "deg)";

    });


  document
    .querySelectorAll(".hourHand")
    .forEach(function(hand) {

      hand.style.transform =
        "rotate(" +
        hourDegree +
        "deg)";

    });

}


// ==============================
// 時計を更新
// ==============================

function updateAllClocks() {

  const time =
    getCurrentTime();


  const date =
    getCurrentDate();


  const lockClock =
    document.getElementById(
      "lockClock"
    );


  const lockDate =
    document.getElementById(
      "lockDate"
    );


  const homeClock =
    document.getElementById(
      "homeClock"
    );


  const homeDate =
    document.getElementById(
      "homeDate"
    );


  if (lockClock) {

    lockClock.textContent =
      time;

  }


  if (lockDate) {

    lockDate.textContent =
      date;

  }


  if (homeClock) {

    homeClock.textContent =
      time;

  }


  if (homeDate) {

    homeDate.textContent =
      date;

  }


  updateAnalogClocks();

}


// ==============================
// 時計開始
// ==============================

function startClock() {

  updateAllClocks();


  if (clockTimer) {

    clearInterval(
      clockTimer
    );

  }


  clockTimer =
    setInterval(
      updateAllClocks,
      1000
    );

}


// ==============================
// ホーム画面
// ==============================

function showHomeScreen() {

  document
    .getElementById("app")
    .innerHTML = `

      <section id="homeScreen">

        <div class="homeHeader">


          <div class="homeTitle">

            KAEDE OS

          </div>


          <div class="homeClockArea">


            <div class="analogClock homeAnalogClock">

              <div
                class="clockHand hourHand">
              </div>

              <div
                class="clockHand minuteHand">
              </div>

              <div
                class="clockHand secondHand">
              </div>

              <div
                class="clockCenter">
              </div>

            </div>


            <div id="homeClock">

              00:00:00

            </div>


            <div
              id="homeDate"
              class="homeDate">

              0000年00月00日

            </div>


          </div>


        </div>


        <!-- 天気 -->

        <div class="weatherCard">

          <div class="weatherIcon">

            ☁️

          </div>


          <div class="weatherTemperature">

            30°

          </div>


          <div class="weatherText">

            くもり

          </div>


        </div>


        <!-- 今日の予定 -->

        <div class="scheduleCard">

          <div class="scheduleTitle">

            📅 今日の予定

          </div>


          <div id="homeScheduleList">

          </div>


        </div>


        <!-- アプリ -->

        <div class="apps">


          <button
            class="appButton"
            data-app="line">

            <div
              class="appIcon lineIcon">

              LINE

            </div>

            <div>
              LINE
            </div>

          </button>


          <button
            class="appButton"
            data-app="clock">

            <div
              class="appIcon">

              🕐

            </div>

            <div>
              時計
            </div>

          </button>


          <button
            class="appButton"
            data-app="maps">

            <div
              class="appIcon">

              📍

            </div>

            <div>
              地図
            </div>

          </button>


          <button
            class="appButton"
            data-app="music">

            <div
              class="appIcon">

              🎵

            </div>

            <div>
              音楽
            </div>

          </button>


          <button
            class="appButton"
            data-app="notes">

            <div
              class="appIcon notesIcon">

              📝

            </div>

            <div>
              メモ
            </div>

          </button>


          <button
            class="appButton"
            data-app="calendar">

            <div
              class="appIcon">

              📅

            </div>

            <div>
              カレンダー
            </div>

          </button>


          <button
            class="appButton"
            data-app="settings">

            <div
              class="appIcon settingsIcon">

              ⚙️

            </div>

            <div>
              設定
            </div>

          </button>


        </div>


      </section>

  `;


  updateAllClocks();


  loadHomeSchedule();


  addAppButtonEvents();

}


// ==============================
// アプリボタン
// ==============================

function addAppButtonEvents() {

  const buttons =
    document.querySelectorAll(
      ".appButton"
    );


  buttons.forEach(function(button) {

    button.addEventListener(
      "click",
      function() {

        const app =
          button.dataset.app;


        if (app === "line") {

          openLINE();

        }


        if (app === "clock") {

          openClock();

        }


        if (app === "maps") {

          openMaps();

        }


        if (app === "music") {

          openMusic();

        }


        if (app === "notes") {

          openNotes();

        }


        if (app === "calendar") {

          openCalendar();

        }


        if (app === "settings") {

          openSettings();

        }

      }
    );

  });

}


// ==============================
// 戻る
// ==============================

function goHome() {

  showHomeScreen();

}


// ==============================
// LINE
// ==============================

function openLINE() {

  window.location.href =
    "https://line.me/R/";

}


// ==============================
// 地図
// ==============================

function openMaps() {

  window.location.href =
    "https://maps.apple.com/";

}


// ==============================
// 音楽
// ==============================

function openMusic() {

  window.location.href =
    "https://music.apple.com/";

}


// ==============================
// 時計アプリ
// ==============================

function openClock() {

  document
    .getElementById("app")
    .innerHTML = `

      <section class="appScreen">


        <div class="appHeader">

          <button
            class="backButton"
            id="clockBack">

            ←

          </button>


          <div class="appScreenTitle">

            時計

          </div>


        </div>


        <div
          style="
            display:flex;
            justify-content:center;
            margin-top:40px;
          ">


          <div class="analogClock">

            <div
              class="clockHand hourHand">
            </div>

            <div
              class="clockHand minuteHand">
            </div>

            <div
              class="clockHand secondHand">
            </div>

            <div
              class="clockCenter">
            </div>

          </div>


        </div>


        <div
          id="homeClock"
          style="
            text-align:center;
            font-size:52px;
            margin-top:25px;
          ">

          00:00:00

        </div>


      </section>

  `;


  document
    .getElementById("clockBack")
    .addEventListener(
      "click",
      goHome
    );


  updateAllClocks();

}


// ==============================
// メモ
// ==============================

function openNotes() {

  const savedMemo =
    localStorage.getItem(
      "kaedeMemo"
    ) || "";


  document
    .getElementById("app")
    .innerHTML = `

      <section class="appScreen">


        <div class="appHeader">

          <button
            class="backButton"
            id="notesBack">

            ←

          </button>


          <div class="appScreenTitle">

            📝 メモ

          </div>


        </div>


        <textarea
          id="memoInput"
          class="memoInput"
          placeholder="ここにメモを書いてください..."
        >${savedMemo}</textarea>


        <button
          class="saveButton"
          id="saveMemo">

          保存

        </button>


        <div
          class="memoStatus"
          id="memoStatus">

          この端末のKAEDE OSに保存されます

        </div>


      </section>

  `;


  document
    .getElementById("notesBack")
    .addEventListener(
      "click",
      goHome
    );


  document
    .getElementById("saveMemo")
    .addEventListener(
      "click",
      saveMemo
    );

}


function saveMemo() {

  const memo =
    document
      .getElementById("memoInput")
      .value;


  localStorage.setItem(
    "kaedeMemo",
    memo
  );


  document
    .getElementById("memoStatus")
    .textContent =
    "✓ 保存しました";

}


// ==============================
// カレンダー
// ==============================

function getSchedules() {

  const data =
    localStorage.getItem(
      "kaedeSchedules"
    );


  if (!data) {

    return [

      {
        time: "9:00",
        text: "〜10:00 宿題"
      },

      {
        time: "10:30",
        text: "〜11:30 昼ごはん"
      },

      {
        time: "13:00",
        text: "〜17:00 合唱"
      }

      
    ];

  }


  return JSON.parse(data);

}


// ==============================
// ホームの予定
// ==============================

function loadHomeSchedule() {

  const list =
    document.getElementById(
      "homeScheduleList"
    );


  if (!list) {

    return;

  }


  const schedules =
    getSchedules();


  list.innerHTML = "";


  schedules.forEach(function(item) {

    list.innerHTML += `

      <div class="scheduleItem">

        <div class="scheduleTime">

          ${item.time}

        </div>


        <div>

          ${item.text}

        </div>


      </div>

    `;

  });

}


// ==============================
// カレンダー画面
// ==============================

function openCalendar() {

  document
    .getElementById("app")
    .innerHTML = `

      <section class="appScreen">


        <div class="appHeader">

          <button
            class="backButton"
            id="calendarBack">

            ←

          </button>


          <div class="appScreenTitle">

            📅 カレンダー

          </div>


        </div>


        <div class="addSchedule">


          <input
            id="scheduleTimeInput"
            class="scheduleInput"
            type="time"
          >


          <input
            id="scheduleTextInput"
            class="scheduleInput"
            type="text"
            placeholder="予定を入力"
          >


          <button
            class="saveButton"
            id="addScheduleButton">

            予定を追加

          </button>


        </div>


        <div
          id="calendarList">

        </div>


      </section>

  `;


  document
    .getElementById("calendarBack")
    .addEventListener(
      "click",
      goHome
    );


  document
    .getElementById("addScheduleButton")
    .addEventListener(
      "click",
      addSchedule
    );


  renderCalendar();

}


// ==============================
// カレンダー表示
// ==============================

function renderCalendar() {

  const list =
    document.getElementById(
      "calendarList"
    );


  const schedules =
    getSchedules();


  list.innerHTML = "";


  schedules.forEach(
    function(item, index) {

      const element =
        document.createElement(
          "div"
        );


      element.className =
        "calendarItem";


      element.innerHTML = `

        <div>

          <strong>

            ${item.time}

          </strong>

          <br>

          ${item.text}

        </div>


        <button
          class="deleteButton">

          削除

        </button>

      `;


      element
        .querySelector(
          ".deleteButton"
        )
        .addEventListener(
          "click",
          function() {

            deleteSchedule(
              index
            );

          }
        );


      list.appendChild(
        element
      );

    }
  );

}


// ==============================
// 予定追加
// ==============================

function addSchedule() {

  const time =
    document
      .getElementById(
        "scheduleTimeInput"
      )
      .value;


  const text =
    document
      .getElementById(
        "scheduleTextInput"
      )
      .value;


  if (!time || !text) {

    alert(
      "時間と予定を入力してください"
    );

    return;

  }


  const schedules =
    getSchedules();


  schedules.push({

    time: time,

    text: text

  });


  schedules.sort(
    function(a, b) {

      return (
        a.time > b.time
      );

    }
  );


  localStorage.setItem(
    "kaedeSchedules",
    JSON.stringify(
      schedules
    )
  );


  document
    .getElementById(
      "scheduleTimeInput"
    )
    .value = "";


  document
    .getElementById(
      "scheduleTextInput"
    )
    .value = "";


  renderCalendar();

}


// ==============================
// 予定削除
// ==============================

function deleteSchedule(index) {

  const schedules =
    getSchedules();


  schedules.splice(
    index,
    1
  );


  localStorage.setItem(
    "kaedeSchedules",
    JSON.stringify(
      schedules
    )
  );


  renderCalendar();

}


// ==============================
// 設定
// ==============================

function openSettings() {

  document
    .getElementById("app")
    .innerHTML = `

      <section class="appScreen">


        <div class="appHeader">

          <button
            class="backButton"
            id="settingsBack">

            ←

          </button>


          <div class="appScreenTitle">

            ⚙️ 設定

          </div>


        </div>


        <div class="settingCard">


          <div class="settingRow">

            <div class="settingLabel">

              KAEDE OS

            </div>


            <div>

              Version 1.0

            </div>


          </div>


        </div>


        <div class="settingCard">


          <div class="settingRow">

            <div class="settingLabel">

              メモを削除

            </div>


            <button
              class="settingButton"
              id="deleteMemo">

              削除

            </button>


          </div>


        </div>


        <div class="settingCard">


          <div class="settingRow">

            <div class="settingLabel">

              予定を初期状態に戻す

            </div>


            <button
              class="settingButton"
              id="resetSchedule">

              リセット

            </button>


          </div>


        </div>


      </section>

  `;


  document
    .getElementById("settingsBack")
    .addEventListener(
      "click",
      goHome
    );


  document
    .getElementById("deleteMemo")
    .addEventListener(
      "click",
      function() {

        localStorage.removeItem(
          "kaedeMemo"
        );


        alert(
          "メモを削除しました"
        );

      }
    );


  document
    .getElementById("resetSchedule")
    .addEventListener(
      "click",
      function() {

        localStorage.removeItem(
          "kaedeSchedules"
        );


        alert(
          "予定を初期状態に戻しました"
        );

      }
    );

}


// ==============================
// スワイプ開始
// ==============================

document.addEventListener(
  "touchstart",
  function(event) {

    if (
      document.getElementById(
        "lockScreen"
      )
    ) {

      touchStartY =
        event.touches[0]
        .clientY;

    }

  },
  {
    passive: true
  }
);


document.addEventListener(
  "touchend",
  function(event) {

    const lockScreen =
      document.getElementById(
        "lockScreen"
      );


    if (!lockScreen) {

      return;

    }


    const touchEndY =
      event.changedTouches[0]
      .clientY;


    const distance =
      touchStartY -
      touchEndY;


    if (distance > 60) {

      showHomeScreen();

    }

  },
  {
    passive: true
  }
);


// ==============================
// 開始
// ==============================

startClock();

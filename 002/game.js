"use strict";

(function () {
  const app = document.getElementById("app");
  const gameData = window.JADA_DATA;

  if (!app || !gameData) {
    document.body.innerHTML = '<div class="boot-message">ゲームデータを読み込めませんでした。</div>';
    return;
  }

  const LOGIN_PAGE_KEY = "TOP";
  const MANAGEMENT_PAGE_KEY = "1";
  const END_PAGE_KEYS = new Set(["35", "36"]);
  // ユーザー公開時は false に変更すると、本編確認用パスワードを無効化できます。
  const GAME_ACCESS_REQUIRED = true;
  const GAME_ACCESS_CODE = "1001";
  const GAME_ACCESS_SESSION_KEY = "jada.gameAccessUnlocked.v1";
  const INITIAL_DISCOVERED = gameData.initialPageNumbers.map(String);
  const audioRecords = gameData.audioRecords;
  const goodEndingNovel = gameData.goodEndingNovel ?? [];
  const GOOD_END_REPORT_PAGE = goodEndingNovel.length + 1;
  const credits = gameData.credits ?? [];
  const recordByPage = new Map(audioRecords.map((record) => [String(record.page), record]));
  const validRecordPages = new Set(recordByPage.keys());
  const SPOILER_ROLE_MASKS = Object.freeze({
    MORITAKA: "■■ ■",
    AKARI: "■■ ■■",
    NEMU: "■■■■",
  });
  // 音声だけを手掛かりに検索できるよう、全検索語の読みを登録する。
  // カタカナは normalizeTerm でひらがなへ統一されるため、両方の入力に対応する。
  const SEARCH_TERM_READINGS = Object.freeze({
    "タカヤ": "たかや",
    "誘拐": "ゆうかい",
    "南沖島": "みなみおきしま",
    "六池ジャンクション": "むついけじゃんくしょん",
    "藤崎ルミ": "ふじさきるみ",
    "ストルーガ": "すとるーが",
    "クーエル": "くーえる",
    "警察": "けいさつ",
    "高橋": "たかはし",
    "高橋亮": "たかはしりょう",
    "新東病院": "しんとうびょういん",
    "内藤": "ないとう",
    "青木": "あおき",
    "内藤美樹": "ないとうみき",
    "ドラゴン": "どらごん",
    "生贄": "いけにえ",
    "教授": "きょうじゅ",
    "リゾート": "りぞーと",
    "儀式": "ぎしき",
    "伊炬町": "いこちょう",
    "依り代": "よりしろ",
    "チラシ": "ちらし",
    "洞窟": "どうくつ",
    "北の洞窟": "きたのどうくつ",
    "ミドー": "みどー",
    "忌孤の民": "いこのたみ",
    "巫女": "みこ",
    "朱里": "あかり",
    "降狐の儀": "こうこのぎ",
    "明坂朱里": "あけさかあかり",
    "森高宵": "もりたかしょう",
  });
  const STORAGE = {
    discovered: "jada.discovered.v1",
    viewed: "jada.viewed.v1",
    current: "jada.current.v1",
    historySeen: "jada.historySeen.v1",
  };
  const memoryStorage = new Map();

  function storageGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return memoryStorage.get(key) ?? null;
    }
  }

  function storageSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      memoryStorage.set(key, value);
    }
  }

  function sessionStorageGet(key) {
    try {
      return window.sessionStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function sessionStorageSet(key, value) {
    try {
      window.sessionStorage.setItem(key, value);
    } catch {
      // file:// 環境などで保存できない場合も、解除後のゲーム表示は継続する。
    }
  }

  function readStoredList(key, fallback) {
    try {
      const value = JSON.parse(storageGet(key) ?? "null");
      return Array.isArray(value)
        ? value.filter((item) => typeof item === "string")
        : [...fallback];
    } catch {
      return [...fallback];
    }
  }

  function unique(items) {
    return [...new Set(items)];
  }

  function normalizeViewed(items) {
    return unique([
      LOGIN_PAGE_KEY,
      ...items.filter((item) => (
        item !== LOGIN_PAGE_KEY
        && (item === MANAGEMENT_PAGE_KEY || validRecordPages.has(item))
      )),
    ]);
  }

  function normalizeTerm(value) {
    return value
      .normalize("NFKC")
      .replace(/[\s　]+/g, "")
      .toLowerCase()
      .replace(/[ァ-ヶ]/g, (character) => (
        String.fromCharCode(character.charCodeAt(0) - 0x60)
      ));
  }

  function recordMatchesSearch(record, needle) {
    return record.searchTerms.some((term) => {
      if (normalizeTerm(term) === needle) return true;
      const reading = SEARCH_TERM_READINGS[term];
      return Boolean(reading && normalizeTerm(reading) === needle);
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function pageLabel(page) {
    return typeof page === "number" ? `NO.${String(page).padStart(3, "0")}` : page;
  }

  function isValidPageKey(page) {
    const key = String(page);
    return (
      key === LOGIN_PAGE_KEY
      || key === MANAGEMENT_PAGE_KEY
      || END_PAGE_KEYS.has(key)
      || validRecordPages.has(key)
    );
  }

  function clampGoodEndingPage(value) {
    const page = Number(value);
    if (!Number.isInteger(page)) return 1;
    return Math.min(Math.max(page, 1), Math.max(GOOD_END_REPORT_PAGE, 1));
  }

  function routeForPage(page) {
    const key = String(page);
    if (key === LOGIN_PAGE_KEY) return "#top";
    if (key === MANAGEMENT_PAGE_KEY) return "#management";
    if (key === "35") return "#end/good";
    if (key === "36") return "#end/bad";
    if (validRecordPages.has(key)) return `#record/${encodeURIComponent(key)}`;
    return "#top";
  }

  function pageFromRoute() {
    let route = window.location.hash.replace(/^#\/?/, "");
    try {
      route = decodeURIComponent(route);
    } catch {
      return { page: LOGIN_PAGE_KEY, goodEndingPage: 1 };
    }

    if (!route || route === "top") return { page: LOGIN_PAGE_KEY, goodEndingPage: 1 };
    if (route === "management") return { page: MANAGEMENT_PAGE_KEY, goodEndingPage: 1 };
    const goodEndingMatch = route.match(/^end\/good(?:\/\d+)?$/);
    if (goodEndingMatch) {
      if (route !== "end/good") {
        window.history.replaceState(null, "", "#end/good");
      }
      return {
        page: "35",
        goodEndingPage: 1,
      };
    }
    if (route === "end/bad") return { page: "36", goodEndingPage: 1 };

    const recordMatch = route.match(/^record\/(.+)$/);
    if (recordMatch && validRecordPages.has(recordMatch[1])) {
      return { page: recordMatch[1], goodEndingPage: 1 };
    }
    return { page: LOGIN_PAGE_KEY, goodEndingPage: 1 };
  }

  function threatStage(record) {
    const page = Number(record?.page);
    if (!Number.isInteger(page) || page < 23 || page > 34) return 0;
    if (page >= 32) return 3;
    if (page >= 28) return 2;
    return 1;
  }

  function historyPageOrder(page) {
    if (page === LOGIN_PAGE_KEY) return 0;
    if (page === MANAGEMENT_PAGE_KEY) return 1;
    if (/^\d+$/.test(page)) return Number(page);
    if (page === "EX1") return 1001;
    if (page === "EX2") return 1002;
    return 9999;
  }

  function historyNumber(page) {
    const key = String(page);
    if (key === LOGIN_PAGE_KEY) {
      return '<span class="history-number history-number-top"><i>PAGE</i><b>TOP</b></span>';
    }
    if (/^\d+$/.test(key)) {
      return `<span class="history-number"><i>NO.</i><b>${key.padStart(3, "0")}</b></span>`;
    }
    return `<span class="history-number"><i>PAGE</i><b>${escapeHtml(key)}</b></span>`;
  }

  function statusClass(status) {
    const classes = {
      "問題なし": "clear",
      "要観察": "watch",
      "通報済み": "reported",
      "未判定": "pending",
      "エラー": "error",
    };
    return `status status-${classes[status] ?? "pending"}`;
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "--:--";
    const minutes = Math.floor(seconds / 60);
    return `${String(minutes).padStart(2, "0")}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
  }

  function searchIcon() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4 4"></path></svg>';
  }

  function diskIcon() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h13l3 3v13H4Z"></path><path d="M8 4v6h8V4M8 20v-6h8v6"></path></svg>';
  }

  function playIcon(isPlaying) {
    if (isPlaying) {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.5 5v14"></path><path d="M16.5 5v14"></path></svg>';
    }
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7Z"></path></svg>';
  }

  const storedDiscovered = readStoredList(STORAGE.discovered, INITIAL_DISCOVERED);
  const storedViewed = normalizeViewed(readStoredList(STORAGE.viewed, [LOGIN_PAGE_KEY]));
  const storedHistorySeen = unique(
    readStoredList(STORAGE.historySeen, storedViewed)
      .filter((page) => storedViewed.includes(page)),
  );
  const initialRoute = pageFromRoute();
  const initialPage = initialRoute.page;
  const initialViewed = END_PAGE_KEYS.has(initialPage)
    ? storedViewed
    : unique([...storedViewed, initialPage]);

  const state = {
    discovered: unique([
      ...INITIAL_DISCOVERED,
      ...storedDiscovered.filter((page) => validRecordPages.has(page)),
    ]),
    viewed: initialViewed,
    historySeen: storedHistorySeen,
    current: initialPage,
    goodEndingPage: initialRoute.goodEndingPage,
    query: "",
    notice: "",
    historyOpen: false,
    creditsOpen: false,
    decision: null,
    justLoggedIn: false,
    transcriptOpen: false,
  };

  function persistState() {
    storageSet(STORAGE.discovered, JSON.stringify(state.discovered));
    storageSet(STORAGE.viewed, JSON.stringify(state.viewed));
    storageSet(STORAGE.current, state.current);
    storageSet(STORAGE.historySeen, JSON.stringify(state.historySeen));
  }

  function unreadHistoryCount() {
    return state.viewed.filter((page) => !state.historySeen.includes(page)).length;
  }

  function recordCard(record) {
    const stage = threatStage(record);
    const lateRecordClass = stage ? ` record-card-late record-card-late-${stage}` : "";
    return `
      <a class="record-card${lateRecordClass}" href="${escapeHtml(routeForPage(record.page))}" data-open-page="${escapeHtml(record.page)}">
        <span class="record-index">${escapeHtml(pageLabel(record.page))}</span>
        <span class="record-main">
          <span class="record-title">${escapeHtml(record.title)}</span>
          <span class="record-sub">${escapeHtml(record.date)} <i></i> ${escapeHtml(record.speaker)}</span>
        </span>
        <span class="${statusClass(record.status)}">${escapeHtml(record.status)}</span>
        <span class="record-arrow" aria-hidden="true">→</span>
      </a>`;
  }

  function loginPage() {
    return `
      <main class="login-page" id="login-page">
        <section class="login-card" aria-labelledby="login-title">
          <div class="login-brand">
            <span class="login-brand-mark">JADA</span>
            <div>
              <p>JAPAN AUDIO DATA ADMINISTRATION</p>
              <h1 id="login-title">日本音声データ管理システム</h1>
            </div>
          </div>

          <div class="login-divider"><span>SECURE ARCHIVE LOGIN</span></div>

          <form id="login-form" class="login-form">
            <label>
              <span>OPERATOR ID</span>
              <input value="M145781" readonly tabindex="-1" aria-readonly="true">
            </label>
            <label>
              <span>PASSWORD</span>
              <input value="************" readonly tabindex="-1" aria-readonly="true">
            </label>
            <button type="submit" id="login-button">ログイン</button>
          </form>

          <p class="login-footnote">AUTHORIZED PERSONNEL ONLY / ACCESS LOGGING ENABLED</p>
        </section>
      </main>`;
  }

  function gameAccessPage(message = "") {
    return `
      <main class="game-access-page" id="game-access-page">
        <section class="game-access-card" aria-labelledby="game-access-title">
          <div class="game-access-mark">JADA</div>
          <p class="eyebrow">GAME PREVIEW / RESTRICTED ACCESS</p>
          <h1 id="game-access-title">ゲーム本編 確認用</h1>
          <p class="game-access-copy">お伝えした4桁のパスワードを入力してください。</p>
          <form class="game-access-form" id="game-access-form">
            <label for="game-access-input">ACCESS CODE</label>
            <input
              id="game-access-input"
              type="password"
              inputmode="numeric"
              maxlength="4"
              autocomplete="off"
              required
            >
            <button type="submit" id="game-access-button">ゲーム本編を開く</button>
            <p class="game-access-message" id="game-access-message" role="alert" aria-live="polite">${escapeHtml(message)}</p>
          </form>
          <p class="game-access-footnote">PRE-RELEASE BUILD / AUTHORIZED REVIEW ONLY</p>
        </section>
      </main>`;
  }

  function renderGameAccess() {
    document.title = "本編アクセス確認｜日本音声データ管理システム";
    app.innerHTML = gameAccessPage();

    const accessPage = document.getElementById("game-access-page");
    const accessForm = document.getElementById("game-access-form");
    const accessInput = document.getElementById("game-access-input");
    const accessButton = document.getElementById("game-access-button");
    const accessMessage = document.getElementById("game-access-message");
    if (!accessPage || !accessForm || !accessInput || !accessButton || !accessMessage) return;

    accessForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (accessInput.value !== GAME_ACCESS_CODE) {
        accessMessage.textContent = "パスワードが違います。";
        accessInput.select();
        return;
      }

      sessionStorageSet(GAME_ACCESS_SESSION_KEY, "1");
      accessButton.disabled = true;
      accessMessage.textContent = "";
      accessPage.classList.add("is-leaving");
      const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      window.setTimeout(startGame, reducedMotion ? 0 : 420);
    });

    accessInput.focus();
  }

  function managementPage() {
    const records = state.discovered
      .map((page) => recordByPage.get(page))
      .filter(Boolean);

    return `
      <main class="page-shell management-page">
        <section class="section-heading">
          <div>
            <p class="eyebrow">AUDIO DATA CONTROL / DAILY QUEUE</p>
            <h1>音声データ管理ページ</h1>
          </div>
          <div class="management-heading-actions">
            <button class="credit-button" data-open-credits type="button">クレジット</button>
            <div class="queue-counter">
              <span>表示件数</span>
              <strong>${String(records.length).padStart(2, "0")}</strong>
            </div>
          </div>
        </section>

        <section class="briefing-panel">
          <span class="briefing-code">業務連絡 00-01</span>
          <div class="briefing-copy">
            <p>本日分の音声データは確認・報告済みです。内容を確認し、気になる語句があれば上部の検索欄から過去記録を照会してください。</p>
            <p>保存されている音声データは、可能な限りノイズを除去しています。</p>
          </div>
        </section>

        <section class="record-list" aria-label="取得済み音声データ">
          <div class="list-header">
            <span>管理番号</span>
            <span>データ名称 / 取得情報</span>
            <span>区分</span>
            <span></span>
          </div>
          ${records.map(recordCard).join("")}
        </section>
      </main>`;
  }

  function audioPage(record) {
    const stage = threatStage(record);
    const latePageClass = stage ? ` late-record late-record-${stage}` : "";
    const waveform = Array.from(
      { length: 48 },
      (_, index) => 18 + ((index * 17 + record.id.length * 11) % 72),
    );
    const transcriptLines = record.transcript
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);

    return `
      <main class="page-shell audio-page${latePageClass}">
        <div class="record-topline">
          <span>${escapeHtml(pageLabel(record.page))}</span>
          <span>RECORD ID: ${escapeHtml(record.id)}</span>
        </div>

        <section class="audio-heading">
          <div>
            <p class="eyebrow">ARCHIVED AUDIO RECORD</p>
            <h1>${escapeHtml(record.title)}</h1>
          </div>
          <span class="${statusClass(record.status)}">${escapeHtml(record.status)}</span>
        </section>

        <section class="metadata-grid" aria-label="音声データ情報">
          <div><span>日付</span><strong>${escapeHtml(record.date)}</strong></div>
          <div><span>話者</span><strong>${escapeHtml(record.speaker)}</strong></div>
          <div><span>データ形式</span><strong>${escapeHtml(record.kind)}</strong></div>
          <div><span>ファイル</span><strong>${escapeHtml(record.audioFile)}</strong></div>
        </section>

        <section class="player-panel">
          <audio id="audio-element" src="./audio/${escapeHtml(record.audioFile)}" preload="metadata"></audio>
          <button class="play-button" id="play-button" type="button" aria-label="音声を再生">
            ${playIcon(false)}
          </button>
          <div class="player-body">
            <div class="waveform" id="waveform" aria-hidden="true">
              ${waveform.map((height) => `<i style="height:${height}%"></i>`).join("")}
            </div>
            <div class="player-time">
              <span id="current-time">00:00</span>
              <span id="duration">--:--</span>
            </div>
          </div>
          <p class="audio-notice" id="audio-notice" role="status" hidden></p>
        </section>

        <section class="transcript-disclosure" aria-label="音声文字起こしの表示設定">
          <button
            class="transcript-toggle"
            id="transcript-toggle"
            type="button"
            aria-expanded="${state.transcriptOpen ? "true" : "false"}"
            aria-controls="transcript-panel"
          >
            <span class="transcript-toggle-mark" aria-hidden="true">${state.transcriptOpen ? "−" : "+"}</span>
            <span class="transcript-toggle-copy">
              <strong>${state.transcriptOpen ? "文字起こしを閉じる" : "文字起こしを表示"}</strong>
              <small>TRANSCRIPTION DATA / MANUAL ACCESS</small>
            </span>
            <span class="transcript-toggle-state">${state.transcriptOpen ? "OPEN" : "CLOSED"}</span>
          </button>
        </section>

        <section class="transcript-panel${state.transcriptOpen ? " is-visible" : ""}" id="transcript-panel"${state.transcriptOpen ? "" : " hidden"}>
          <div class="panel-label">
            <span>音声文字起こし</span>
            <span>TRANSCRIPTION DATA</span>
          </div>
          <div class="transcript-lines">
            ${transcriptLines.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
          </div>
        </section>

        ${record.page === 34 ? `
          <section class="judgement-panel">
            <div>
              <p class="eyebrow">FINAL CLASSIFICATION REQUIRED</p>
              <h2>この音声データを報告しますか？</h2>
              <p>記録内容を確認し、協会への最終報告区分を選択してください。</p>
            </div>
            <div class="judgement-actions">
              <button class="report-action" data-decision="report" type="button">通報する</button>
              <button class="watch-action" data-decision="watch" type="button">要観察とする</button>
            </div>
          </section>` : ""}
      </main>`;
  }

  function goodNovelSceneClass(background) {
    const classes = {
      "ほの暗い地下のオフィス": "scene-underground-office",
      "地下施設の廊下": "scene-underground-corridor",
      "黒背景（真っ黒にしてごまかす）": "scene-blackout",
      "夜明け前の路地": "scene-pre-dawn-alley",
      "警察署・早朝": "scene-police-early",
      "警察署・朝": "scene-police-morning",
    };
    return classes[background] ?? "scene-underground-office";
  }

  function goodEndPage() {
    if (state.goodEndingPage === GOOD_END_REPORT_PAGE) {
      return goodEndReportPage();
    }

    const record = goodEndingNovel[state.goodEndingPage - 1];
    if (!record) {
      return `<main class="good-novel-screen scene-blackout"><p class="good-novel-load-error">GOOD ENDデータを読み込めませんでした。</p></main>`;
    }

    const current = state.goodEndingPage;
    const nextPage = current + 1;
    const sceneClass = goodNovelSceneClass(record.background);

    return `
      <main
        class="good-novel-screen ${sceneClass}"
        data-good-advance="${nextPage}"
        role="button"
        tabindex="0"
        aria-label="次の文章へ"
      >
        <div class="good-novel-scene" data-scene="${escapeHtml(record.background)}" aria-label="背景：${escapeHtml(record.background)}"></div>
        <div class="good-novel-vignette" aria-hidden="true"></div>

        <audio id="good-novel-audio" src="./audio/${escapeHtml(record.audioFile)}" preload="auto" autoplay></audio>

        <div
          class="good-novel-textbox ${record.displayName === "-" ? "is-narration" : "is-dialogue"}"
        >
          <div class="good-novel-speaker">${escapeHtml(record.displayName === "-" ? "　" : (record.displayName || "　"))}</div>
          <p class="good-novel-line">${escapeHtml(record.transcript)}</p>
          <span class="good-novel-next-mark">▼</span>
        </div>
      </main>`;
  }

  function goodEndReportPage() {
    const title = "通報を受け付けました。";
    const shareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent("https://note.com/mei_takanashi/n/n3feac10f5e07")}&lang=ja`;

    return `
      <main class="page-shell end-page good-ending">
        <div class="record-topline"><span>NO.035</span><span>FINAL REPORT</span></div>
        <section class="end-document">
          <div class="end-stamp">REPORTED</div>
          <p class="eyebrow">JAPAN AUDIO DATA ADMINISTRATION</p>
          <h1>${title}</h1>
          <div class="ending-copy">
            <p>提出された記録は緊急案件として受理され、警察は南沖島・伊炬町へ向かった。</p>
            <p>村内では二名の生存者を保護。村民を含む二十名の死亡が確認された。</p>
            <p>音声記録は証拠として保全され、関係者への捜査が開始された。</p>
          </div>
          <div class="ending-actions">
            <a href="${shareUrl}" target="_blank" rel="noreferrer">Xで報告する</a>
            <a class="ending-return" href="${routeForPage(MANAGEMENT_PAGE_KEY)}" data-open-page="${MANAGEMENT_PAGE_KEY}">管理ページへ戻る</a>
            <button type="button" data-open-credits>クレジット</button>
          </div>
        </section>
      </main>`;
  }

  function badEndPage() {
    const title = "観察を続けます。";
    const shareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent("https://note.com/mei_takanashi/n/n3feac10f5e07")}&lang=ja`;

    return `
      <main class="page-shell end-page bad-ending">
        <div class="record-topline"><span>NO.036</span><span>FINAL REPORT</span></div>
        <section class="end-document">
          <div class="end-stamp">OBSERVE</div>
          <p class="eyebrow">JAPAN AUDIO DATA ADMINISTRATION</p>
          <h1>${title}</h1>
          <div class="ending-copy">
            <p>要観察として処理したはずの音声データは、翌朝、管理ページから消えていた。</p>
            <p>これまでに閲覧した記録も、検索履歴も残されていない。</p>
            <p>デスクトップには、見覚えのない録音アプリだけが起動している……。</p>
            <span class="recording-indicator"><i></i> RECORDING&nbsp;&nbsp;00:00:07</span>
          </div>
          <div class="ending-actions">
            <a href="${shareUrl}" target="_blank" rel="noreferrer">Xで報告する</a>
            <a class="ending-return" href="${routeForPage(MANAGEMENT_PAGE_KEY)}" data-open-page="${MANAGEMENT_PAGE_KEY}">管理ページへ戻る</a>
            <button type="button" data-open-credits>クレジット</button>
          </div>
        </section>
      </main>`;
  }

  function creditsModal(revealSpoilers = false) {
    if (!state.creditsOpen) return "";

    return `
      <div class="modal-layer credits-layer" data-credit-backdrop>
        <section class="credits-modal" role="dialog" aria-modal="true" aria-labelledby="credits-title">
          <div class="credits-header">
            <div>
              <p class="eyebrow">STAFF &amp; CAST</p>
              <h2 id="credits-title">クレジット</h2>
            </div>
            <button class="credits-close" type="button" data-close-credits aria-label="クレジットを閉じる">×</button>
          </div>
          <dl class="credits-list">
            ${credits.map((credit) => {
              const displayedRole = revealSpoilers
                ? credit.role
                : (SPOILER_ROLE_MASKS[credit.audioPrefix] ?? credit.role);
              return `
                <div>
                  <dt>${escapeHtml(displayedRole)}</dt>
                  <dd>${escapeHtml(credit.voiceActor)}</dd>
                </div>`;
            }).join("")}
          </dl>
          <dl class="credit-production">
            <div><dt>制作</dt><dd>久瀬</dd></div>
          </dl>
          <button class="credits-dismiss" type="button" data-close-credits>閉じる</button>
        </section>
      </div>`;
  }

  function confirmModal() {
    if (!state.decision) return "";
    const label = state.decision === "report" ? "通報" : "要観察";
    const confirmClass = state.decision === "report" ? "danger-confirm" : "watch-confirm";

    return `
      <div class="modal-layer" role="presentation">
        <section class="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="decision-title">
          <p class="eyebrow">CONFIRM CLASSIFICATION</p>
          <h2 id="decision-title">本当によろしいですか？</h2>
          <p>この記録を「${label}」として最終報告します。</p>
          <div>
            <button type="button" data-cancel-decision>戻る</button>
            <button class="${confirmClass}" type="button" data-confirm-decision>報告を確定</button>
          </div>
        </section>
      </div>`;
  }

  function historyItems() {
    return [...state.viewed]
      .sort((left, right) => historyPageOrder(left) - historyPageOrder(right))
      .map((page) => {
      if (page === LOGIN_PAGE_KEY) {
        return `
          <a href="${routeForPage(LOGIN_PAGE_KEY)}" data-open-page="${LOGIN_PAGE_KEY}">
            ${historyNumber(LOGIN_PAGE_KEY)}
            <strong>日本音声データ管理システム</strong>
            <small>ENTRY PAGE</small>
          </a>`;
      }
      if (page === MANAGEMENT_PAGE_KEY) {
        return `
          <a href="${routeForPage(MANAGEMENT_PAGE_KEY)}" data-open-page="${MANAGEMENT_PAGE_KEY}">
            ${historyNumber(MANAGEMENT_PAGE_KEY)}
            <strong>音声データ管理ページ</strong>
            <small>音声データ一覧</small>
          </a>`;
      }
      const record = recordByPage.get(page);
      if (!record) return "";
      return `
        <a href="${escapeHtml(routeForPage(record.page))}" data-open-page="${escapeHtml(record.page)}">
          ${historyNumber(record.page)}
          <strong>${escapeHtml(record.title)}</strong>
          <small>${escapeHtml(record.date)}</small>
        </a>`;
    }).join("");
  }

  function footerPage(activeRecord) {
    if (state.current === "35") {
      return "35 / 36";
    }
    if (state.current === "36") return "36 / 36";
    if (activeRecord && typeof activeRecord.page === "string") return activeRecord.page;
    return `${activeRecord ? activeRecord.page : 1} / 36`;
  }

  function render() {
    const outgoingNovelAudio = document.getElementById("good-novel-audio");
    if (outgoingNovelAudio) {
      outgoingNovelAudio.pause?.();
      outgoingNovelAudio.removeAttribute?.("src");
      outgoingNovelAudio.load?.();
    }

    if (state.current === LOGIN_PAGE_KEY) {
      document.title = "日本音声データ管理システム";
      app.innerHTML = loginPage();
      bindLogin();
      return;
    }

    const activeRecord = recordByPage.get(state.current);
    let main;

    if (state.current === "35") {
      document.title = "GOOD END｜日本音声データ管理システム";
      main = goodEndPage();
    } else if (state.current === "36") {
      document.title = "BAD END｜日本音声データ管理システム";
      main = badEndPage();
    } else if (state.current === MANAGEMENT_PAGE_KEY || !activeRecord) {
      document.title = "音声データ管理｜日本音声データ管理システム";
      main = managementPage();
    } else {
      document.title = `${pageLabel(activeRecord.page)}｜${activeRecord.title}`;
      main = audioPage(activeRecord);
    }

    const isGoodEnding = state.current === "35";
    const isGoodNovel = isGoodEnding && state.goodEndingPage <= goodEndingNovel.length;
    const isGoodReport = isGoodEnding && state.goodEndingPage === GOOD_END_REPORT_PAGE;
    const frameClasses = [
      "app-frame",
      isGoodEnding ? "good-mode" : "",
      isGoodNovel ? "good-novel-mode" : "",
      isGoodReport ? "good-report-mode" : "",
      activeRecord && threatStage(activeRecord) ? `threat-stage-${threatStage(activeRecord)}` : "",
      state.justLoggedIn ? "is-entering" : "",
    ].filter(Boolean).join(" ");
    const newHistoryCount = unreadHistoryCount();
    state.justLoggedIn = false;

    app.innerHTML = `
      <div class="${frameClasses}">
        ${isGoodNovel ? "" : `<header class="site-header">
          <a class="brand" href="${routeForPage(MANAGEMENT_PAGE_KEY)}" data-open-page="${MANAGEMENT_PAGE_KEY}" aria-label="管理ページへ戻る">
            <span class="brand-mark">JADA</span>
            <span><b>日本音声データ管理協会</b><small>JAPAN AUDIO DATA ADMINISTRATION</small></span>
          </a>
          <form class="search-form" id="search-form">
            <label for="archive-search" class="sr-only">音声データを検索</label>
            <input id="archive-search" value="${escapeHtml(state.query)}" placeholder="音声内の語句を入力" autocomplete="off">
              <button type="submit">${searchIcon()}<span>検索</span></button>
            </form>
        </header>`}

        ${!isGoodNovel && state.notice ? `
          <button class="search-notice" id="search-notice" type="button">
            <span>${escapeHtml(state.notice)}</span><span aria-hidden="true">×</span>
          </button>` : ""}

        ${main}
        ${confirmModal()}
        ${creditsModal(END_PAGE_KEYS.has(state.current))}

        ${isGoodNovel ? "" : `<button class="history-toggle" id="history-toggle" type="button" aria-label="${newHistoryCount ? `閲覧履歴を開く（新規${newHistoryCount}件）` : "閲覧履歴を開く"}">
          ${diskIcon()}${newHistoryCount ? `<span class="history-badge">${newHistoryCount}</span>` : ""}
        </button>

        <div class="drawer-scrim ${state.historyOpen ? "is-open" : ""}" id="drawer-scrim"></div>
        <aside class="history-drawer ${state.historyOpen ? "is-open" : ""}" aria-hidden="${state.historyOpen ? "false" : "true"}">
          <div class="drawer-header">
            <div><p class="eyebrow">LOCAL ACCESS LOG</p><h2>閲覧済みページ</h2></div>
            <button type="button" id="history-close" aria-label="閉じる">×</button>
          </div>
          <div class="history-list">${historyItems()}</div>
          <button class="reset-button" id="reset-button" type="button">検索・閲覧履歴をリセット</button>
        </aside>

        <footer class="site-footer">
          <span>本作はフィクションです。実在の人物・団体・事件とは関係ありません。</span>
          <strong>${escapeHtml(footerPage(activeRecord))}</strong>
        </footer>`}
      </div>`;

    bindEvents(activeRecord);
  }

  function activatePage(page, options = {}) {
    const key = String(page);
    if (!isValidPageKey(key)) return;
    state.current = key;
    if (key === "35") {
      state.goodEndingPage = clampGoodEndingPage(
        options.goodEndingPage ?? state.goodEndingPage,
      );
    }
    if (!END_PAGE_KEYS.has(key)) {
      state.viewed = unique([...state.viewed, key]);
    }
    state.historyOpen = false;
    state.creditsOpen = false;
    state.decision = null;
    state.transcriptOpen = false;
    persistState();
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openPage(page, options = {}) {
    const key = String(page);
    if (!isValidPageKey(key)) return;

    const goodEndingPage = key === "35"
      ? clampGoodEndingPage(options.goodEndingPage ?? 1)
      : 1;
    const route = routeForPage(key, goodEndingPage);
    const alreadyOnRoute = (
      window.location.hash === route
      || (!window.location.hash && key === LOGIN_PAGE_KEY)
    );

    if (alreadyOnRoute) {
      activatePage(key, { goodEndingPage });
      return;
    }

    if (key === "35") {
      window.history.pushState(null, "", route);
      activatePage(key, { goodEndingPage: 1 });
      return;
    }

    if (options.replace) {
      window.history.replaceState(null, "", route);
      activatePage(key, { goodEndingPage });
      return;
    }

    window.location.hash = route;
  }

  function syncPageFromRoute() {
    const nextRoute = pageFromRoute();
    activatePage(nextRoute.page, { goodEndingPage: nextRoute.goodEndingPage });
  }

  function handleSearch(event) {
    event.preventDefault();
    const needle = normalizeTerm(state.query);

    if (!needle) {
      state.notice = "検索語を入力してください。";
      render();
      return;
    }

    const matches = audioRecords.filter((record) => recordMatchesSearch(record, needle));

    if (!matches.length) {
      state.notice = `「${state.query.trim()}」に一致する音声データはありません。`;
      render();
      return;
    }

    state.discovered = unique([
      ...state.discovered,
      ...matches.map((record) => String(record.page)),
    ]);
    state.notice = `${String(matches.length).padStart(2, "0")}件の音声データを検出しました。`;
    state.query = "";
    openPage(matches[0].page);
  }

  function resetProgress() {
    if (!window.confirm("検索結果と閲覧履歴をリセットします。よろしいですか？")) return;
    state.discovered = [...INITIAL_DISCOVERED];
    state.viewed = [LOGIN_PAGE_KEY];
    state.historySeen = [LOGIN_PAGE_KEY];
    state.current = LOGIN_PAGE_KEY;
    state.historyOpen = false;
    state.creditsOpen = false;
    state.decision = null;
    state.transcriptOpen = false;
    state.goodEndingPage = 1;
    state.notice = "保存データをリセットしました。";
    openPage(LOGIN_PAGE_KEY, { replace: true });
  }

  function confirmDecision() {
    if (!state.decision) return;
    const endingPage = state.decision === "report" ? "35" : "36";
    state.decision = null;
    openPage(endingPage, { goodEndingPage: 1 });
  }

  function bindAudio() {
    const audio = document.getElementById("audio-element");
    const playButton = document.getElementById("play-button");
    const currentTime = document.getElementById("current-time");
    const duration = document.getElementById("duration");
    const notice = document.getElementById("audio-notice");
    const bars = [...document.querySelectorAll("#waveform i")];

    if (!audio || !playButton || !currentTime || !duration || !notice) return;

    function showAudioNotice(message) {
      notice.textContent = message;
      notice.hidden = !message;
    }

    function updateButton() {
      const isPlaying = !audio.paused && !audio.ended;
      const isNovelButton = playButton.classList.contains("good-novel-audio-button");
      playButton.innerHTML = isNovelButton
        ? `${playIcon(isPlaying)}<span>${isPlaying ? "一時停止" : "音声再生"}</span>`
        : playIcon(isPlaying);
      playButton.setAttribute("aria-label", isPlaying ? "一時停止" : "音声を再生");
    }

    function updateProgress() {
      const nextDuration = audio.duration;
      const progress = Number.isFinite(nextDuration) && nextDuration > 0
        ? (audio.currentTime / nextDuration) * 100
        : 0;
      currentTime.textContent = formatTime(audio.currentTime);
      duration.textContent = formatTime(nextDuration);
      bars.forEach((bar, index) => {
        bar.classList.toggle("passed", progress > (index / bars.length) * 100);
      });
    }

    playButton.addEventListener("click", async () => {
      if (!audio.paused) {
        audio.pause();
        return;
      }
      try {
        await audio.play();
        showAudioNotice("");
      } catch {
        showAudioNotice("音声データを読み込めませんでした。audioフォルダを確認してください。");
      }
    });

    audio.addEventListener("play", updateButton);
    audio.addEventListener("pause", updateButton);
    audio.addEventListener("ended", updateButton);
    audio.addEventListener("loadedmetadata", updateProgress);
    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("error", () => {
      updateButton();
      showAudioNotice("音声データを読み込めませんでした。audioフォルダを確認してください。");
    });
  }

  function bindGoodNovelAudio() {
    const audio = document.getElementById("good-novel-audio");
    if (!audio) return;

    const startPlayback = () => {
      const playback = audio.play();
      if (playback?.catch) playback.catch(() => {});
    };

    if (audio.readyState >= 2) {
      startPlayback();
    } else {
      audio.addEventListener("canplay", startPlayback, { once: true });
    }
  }

  function bindLogin() {
    const loginForm = document.getElementById("login-form");
    const loginPageElement = document.getElementById("login-page");
    const loginButton = document.getElementById("login-button");
    if (!loginForm || !loginPageElement || !loginButton) return;

    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (loginPageElement.classList.contains("is-leaving")) return;
      loginButton.disabled = true;
      loginPageElement.classList.add("is-leaving");
      const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      window.setTimeout(() => {
        state.justLoggedIn = true;
        openPage(MANAGEMENT_PAGE_KEY);
      }, reducedMotion ? 0 : 520);
    });
  }

  function bindTranscript() {
    const toggle = document.getElementById("transcript-toggle");
    const panel = document.getElementById("transcript-panel");
    if (!toggle || !panel) return;

    const mark = toggle.querySelector(".transcript-toggle-mark");
    const label = toggle.querySelector(".transcript-toggle-copy strong");
    const status = toggle.querySelector(".transcript-toggle-state");

    toggle.addEventListener("click", () => {
      state.transcriptOpen = !state.transcriptOpen;
      toggle.setAttribute("aria-expanded", String(state.transcriptOpen));
      panel.hidden = !state.transcriptOpen;
      panel.classList.toggle("is-visible", state.transcriptOpen);
      if (mark) mark.textContent = state.transcriptOpen ? "−" : "+";
      if (label) label.textContent = state.transcriptOpen ? "文字起こしを閉じる" : "文字起こしを表示";
      if (status) status.textContent = state.transcriptOpen ? "OPEN" : "CLOSED";
    });
  }

  function bindEvents(activeRecord) {
    app.querySelectorAll("a[data-open-page]").forEach((link) => {
      link.addEventListener("click", (event) => {
        if (
          event.defaultPrevented
          || event.button !== 0
          || event.metaKey
          || event.ctrlKey
          || event.shiftKey
          || event.altKey
        ) return;

        const key = String(link.dataset.openPage);
        const goodEndingPage = key === "35"
          ? clampGoodEndingPage(link.dataset.goodPage ?? 1)
          : 1;
        const alreadyOnRoute = (
          window.location.hash === routeForPage(key, goodEndingPage)
          || (!window.location.hash && key === LOGIN_PAGE_KEY)
        );
        if (!alreadyOnRoute) return;

        event.preventDefault();
        activatePage(key, { goodEndingPage });
      });
    });

    const searchForm = document.getElementById("search-form");
    const searchInput = document.getElementById("archive-search");
    searchForm?.addEventListener("submit", handleSearch);
    searchInput?.addEventListener("input", (event) => {
      state.query = event.target.value;
    });

    document.getElementById("search-notice")?.addEventListener("click", () => {
      state.notice = "";
      render();
    });

    document.getElementById("history-toggle")?.addEventListener("click", () => {
      state.historySeen = [...state.viewed];
      state.historyOpen = true;
      persistState();
      render();
    });

    document.getElementById("history-close")?.addEventListener("click", () => {
      state.historyOpen = false;
      render();
    });

    document.getElementById("drawer-scrim")?.addEventListener("click", () => {
      state.historyOpen = false;
      render();
    });

    document.getElementById("reset-button")?.addEventListener("click", resetProgress);

    app.querySelectorAll("[data-open-credits]").forEach((button) => {
      button.addEventListener("click", () => {
        state.creditsOpen = true;
        state.historyOpen = false;
        render();
      });
    });

    app.querySelectorAll("[data-close-credits]").forEach((button) => {
      button.addEventListener("click", () => {
        state.creditsOpen = false;
        render();
      });
    });

    const creditBackdrop = app.querySelector("[data-credit-backdrop]");
    creditBackdrop?.addEventListener("click", (event) => {
      if (event.target !== creditBackdrop) return;
      state.creditsOpen = false;
      render();
    });

    app.querySelectorAll("[data-decision]").forEach((button) => {
      button.addEventListener("click", () => {
        state.decision = button.dataset.decision;
        render();
      });
    });

    app.querySelector("[data-cancel-decision]")?.addEventListener("click", () => {
      state.decision = null;
      render();
    });

    app.querySelector("[data-confirm-decision]")?.addEventListener("click", confirmDecision);

    const goodAdvance = app.querySelector("[data-good-advance]");
    if (goodAdvance) {
      const advanceGoodNovel = () => {
        state.goodEndingPage = clampGoodEndingPage(goodAdvance.dataset.goodAdvance);
        state.creditsOpen = false;
        render();
      };
      goodAdvance.addEventListener("click", (event) => {
        if (event.target.closest("button, a, input, textarea, select, summary, details, [data-no-advance]")) return;
        advanceGoodNovel();
      });
      goodAdvance.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        advanceGoodNovel();
      });
    }

    if (activeRecord) {
      bindAudio();
    }
    if (state.current === "35" && state.goodEndingPage <= goodEndingNovel.length) {
      bindGoodNovelAudio();
    }
    if (activeRecord) {
      bindTranscript();
    }
  }

  let gameStarted = false;

  function startGame() {
    if (gameStarted) return;
    gameStarted = true;
    window.addEventListener("hashchange", syncPageFromRoute);
    persistState();
    render();
  }

  if (!GAME_ACCESS_REQUIRED || sessionStorageGet(GAME_ACCESS_SESSION_KEY) === "1") {
    startGame();
  } else {
    renderGameAccess();
  }
})();

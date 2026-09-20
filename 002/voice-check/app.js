"use strict";

(function () {
  const ACCESS_CODE = "0901";
  const SESSION_KEY = "jada.voiceReviewUnlocked.v1";
  const gameData = window.JADA_DATA;
  const passwordArea = document.getElementById("password-area");
  const lockedContent = document.getElementById("locked-content");
  const passwordForm = document.getElementById("password-form");
  const passwordInput = document.getElementById("password-input");
  const passwordMessage = document.getElementById("password-message");
  const roleNavigation = document.getElementById("role-navigation");
  const voiceList = document.getElementById("voice-list");
  const reviewCount = document.getElementById("review-count");
  const lockButton = document.getElementById("lock-button");

  if (!gameData || !passwordArea || !lockedContent || !passwordForm || !passwordInput) {
    document.body.innerHTML = '<p class="boot-error">確認用データを読み込めませんでした。</p>';
    return;
  }

  const records = [
    ...(gameData.audioRecords ?? []),
    ...(gameData.goodEndingNovel ?? []),
  ];
  const credits = gameData.credits ?? [];
  let activeRole = "ALL";

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function storageGet() {
    try {
      return window.sessionStorage.getItem(SESSION_KEY);
    } catch {
      return null;
    }
  }

  function storageSet(value) {
    try {
      if (value) window.sessionStorage.setItem(SESSION_KEY, value);
      else window.sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // file:// 環境などで保存できない場合も、その場の表示は継続する。
    }
  }

  function recordsForRole(credit) {
    return records.filter((record) => (
      record.id === credit.audioPrefix
      || record.id.startsWith(`${credit.audioPrefix}-`)
    ));
  }

  function transcriptHtml(transcript) {
    return String(transcript)
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => `<p>${escapeHtml(line)}</p>`)
      .join("");
  }

  function roleSection(credit) {
    const roleRecords = recordsForRole(credit);
    return `
      <section class="role-section" id="role-${escapeHtml(credit.audioPrefix)}">
        <header class="role-heading">
          <div>
            <span>ROLE</span>
            <h2>${escapeHtml(credit.role)}</h2>
          </div>
          <p>声優：${escapeHtml(credit.voiceActor)}</p>
          <strong>${String(roleRecords.length).padStart(2, "0")} FILES</strong>
        </header>
        <div class="recording-list">
          ${roleRecords.map((record, index) => `
            <article class="recording-card">
              <div class="recording-meta">
                <span>${String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>${escapeHtml(record.title)}</h3>
                  <p>${escapeHtml(record.audioFile)} / ${escapeHtml(record.id)}</p>
                </div>
              </div>
              <audio controls preload="metadata" src="../audio/${escapeHtml(record.audioFile)}"></audio>
              <p class="audio-state" aria-live="polite"></p>
              <details>
                <summary>台本を表示</summary>
                <div class="review-transcript">${transcriptHtml(record.transcript)}</div>
              </details>
            </article>`).join("")}
        </div>
      </section>`;
  }

  function setQuery(role) {
    try {
      const url = new URL(window.location.href);
      if (role === "ALL") url.searchParams.delete("role");
      else url.searchParams.set("role", role);
      window.history.replaceState(null, "", url);
    } catch {
      // ローカル起動時にURLを書き換えられなくても表示には影響しない。
    }
  }

  function bindAudioPlayers() {
    const players = [...document.querySelectorAll(".recording-card audio")];
    players.forEach((player) => {
      const state = player.parentElement?.querySelector(".audio-state");
      player.addEventListener("play", () => {
        players.forEach((other) => {
          if (other !== player && !other.paused) other.pause();
        });
        if (state) state.textContent = "再生中";
      });
      player.addEventListener("pause", () => {
        if (state && !player.ended) state.textContent = "";
      });
      player.addEventListener("ended", () => {
        if (state) state.textContent = "再生完了";
      });
      player.addEventListener("error", () => {
        if (state) state.textContent = "音声ファイルが未配置、または読み込めません。";
      });
    });
  }

  function renderReview() {
    const visibleCredits = activeRole === "ALL"
      ? credits
      : credits.filter((credit) => credit.audioPrefix === activeRole);
    const visibleFileCount = visibleCredits.reduce(
      (total, credit) => total + recordsForRole(credit).length,
      0,
    );

    roleNavigation.innerHTML = `
      <button type="button" data-role="ALL" class="${activeRole === "ALL" ? "is-active" : ""}">
        全役<span>${records.length}</span>
      </button>
      ${credits.map((credit) => `
        <button type="button" data-role="${escapeHtml(credit.audioPrefix)}" class="${activeRole === credit.audioPrefix ? "is-active" : ""}">
          ${escapeHtml(credit.role)}<span>${recordsForRole(credit).length}</span>
        </button>`).join("")}`;

    reviewCount.innerHTML = `<strong>${String(visibleFileCount).padStart(2, "0")}</strong><span>表示中の音声</span>`;
    voiceList.innerHTML = visibleCredits.map(roleSection).join("");

    roleNavigation.querySelectorAll("[data-role]").forEach((button) => {
      button.addEventListener("click", () => {
        activeRole = button.dataset.role;
        setQuery(activeRole);
        renderReview();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
    bindAudioPlayers();
  }

  function unlock() {
    passwordArea.hidden = true;
    lockedContent.hidden = false;
    storageSet("1");

    const requestedRole = new URLSearchParams(window.location.search).get("role");
    activeRole = credits.some((credit) => credit.audioPrefix === requestedRole)
      ? requestedRole
      : "ALL";
    renderReview();
  }

  function lock() {
    document.querySelectorAll("audio").forEach((audio) => audio.pause());
    storageSet("");
    lockedContent.hidden = true;
    passwordArea.hidden = false;
    passwordInput.value = "";
    passwordMessage.textContent = "";
    passwordInput.focus();
  }

  passwordForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (passwordInput.value === ACCESS_CODE) {
      passwordMessage.textContent = "";
      unlock();
      return;
    }
    passwordMessage.textContent = "パスワードが違います。";
    passwordInput.select();
  });

  lockButton?.addEventListener("click", lock);

  if (storageGet() === "1") unlock();
  else passwordInput.focus();
})();

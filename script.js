const chatLog = document.getElementById("chatLog");
const playerInput = document.getElementById("playerInput");
const sendButton = document.getElementById("sendButton");
const chatTab = document.getElementById("chatTab");
const searchTab = document.getElementById("searchTab");
const chatScreen = document.getElementById("chatScreen");
const searchScreen = document.getElementById("searchScreen");
const screenTitle = document.getElementById("screenTitle");
const screenStatus = document.getElementById("screenStatus");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const searchResults = document.getElementById("searchResults");
const modalOverlay = document.getElementById("modalOverlay");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");
const modalCloseButton = document.getElementById("modalCloseButton");
const endingOverlay = document.getElementById("endingOverlay");
const endingCard = document.getElementById("endingCard");
const endingTitle = document.getElementById("endingTitle");
const endingBody = document.getElementById("endingBody");
const endingImage = document.getElementById("endingImage");
const endingShareButton = document.getElementById("endingShareButton");
const endingLoadButton = document.getElementById("endingLoadButton");
const endingCloseButton = document.getElementById("endingCloseButton");
const menuButton = document.getElementById("menuButton");

const state = {
  currentId: 1,
  currentRoute: "common",
  waiting: false,
  chatLog: [],
  typingElement: null
};

const routeLabels = {
  common: "海辺",
  A: "ウサギの面",
  A1: "地下施設",
  A2: "船着き場",
  A3: "帰還",
  B: "キツネの面",
  B2: "館内",
  B3: "関係者船着き場",
  B4: "帰還"
};

const SAVE_KEY_PREFIX = "akari_save_slot_";

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function addMessage(speaker, text, shouldRecord = true, image = null) {
  const row = document.createElement("div");

  if (speaker === "system") {
    row.className = "system-message";
    if (text) {
      const label = document.createElement("div");
      label.textContent = text;
      row.appendChild(label);
    }
    if (image) {
      const img = document.createElement("img");
      img.className = "chat-image";
      img.src = `./assets/images/${image}`;
      img.alt = text || "画像";
      row.appendChild(img);
    }
  } else {
    row.className = `message-row ${speaker}`;
    if (speaker === "akari") {
      const icon = document.createElement("img");
      icon.className = "akari-icon";
      icon.src = "./assets/images/icon_akari_01.webp";
      icon.alt = "朱里";
      row.appendChild(icon);
    }
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = text;
    row.appendChild(bubble);
  }

  chatLog.appendChild(row);
  chatLog.scrollTop = chatLog.scrollHeight;
  if (shouldRecord) {
    state.chatLog.push({ speaker, text, image });
  }
}

function showTyping() {
  hideTyping();

  const row = document.createElement("div");
  row.className = "typing-row";
  row.innerHTML = `
    <div class="typing-bubble">
      朱里が入力中
      <span class="typing-dots"><span>●</span><span>●</span><span>●</span></span>
    </div>
  `;

  chatLog.appendChild(row);
  chatLog.scrollTop = chatLog.scrollHeight;
  state.typingElement = row;
}

function hideTyping() {
  if (state.typingElement) {
    state.typingElement.remove();
    state.typingElement = null;
  }
}

function setInputEnabled(enabled) {
  state.waiting = enabled;
  playerInput.disabled = !enabled;
  sendButton.disabled = !enabled;
  if (enabled) playerInput.focus();
}

async function playStory(id) {
  const node = storyData[id];
  if (!node) {
    addMessage("system", "ここまでが現在の試作範囲です。");
    setInputEnabled(false);
    return;
  }

  state.currentId = id;
  if (node.route) state.currentRoute = node.route;
  setInputEnabled(false);

  const typingMs = node.typingMs ?? DEFAULT_TYPING_MS;

  if (node.speaker === "akari" && typingMs > 0) {
    showTyping();
    await sleep(typingMs);
    hideTyping();
  } else if (typingMs > 0) {
    await sleep(typingMs);
  }

  addMessage(node.speaker, node.text, true, node.image ?? null);

  if (node.ending) {
    setInputEnabled(false);
    await sleep(900);
    showEnding(node.endingData);
    return;
  }

  if (node.waitInput) {
    setInputEnabled(true);
    return;
  }

  await sleep(node.afterMs ?? DEFAULT_AFTER_MS);

  if (node.next) {
    playStory(node.next);
  } else {
    addMessage("system", "ここまでが現在の試作範囲です。");
  }
}

function normalize(text) {
  return text.trim().replace(/\s+/g, "");
}

function includesAny(input, words = []) {
  const normalizedInput = normalize(input);
  return words.some(word => normalizedInput.includes(normalize(word)));
}

function getReactionRoutes() {
  if (state.currentRoute === "A1" || state.currentRoute === "A2") return ["A", "common"];
  if (state.currentRoute === "B2" || state.currentRoute === "B3") return ["B", "common"];
  return [state.currentRoute, "common"];
}

function findChatReaction(input) {
  for (const route of getReactionRoutes()) {
    const reactions = chatReactions[route] ?? [];
    const found = reactions.find(item => includesAny(input, item.words));
    if (found) return found;
  }
  return null;
}

async function replyFromAkari(text, typingMs = 900) {
  setInputEnabled(false);
  showTyping();
  await sleep(typingMs);
  hideTyping();
  addMessage("akari", text);
  setInputEnabled(true);
}

function handlePlayerInput() {
  if (!state.waiting) return;

  const text = playerInput.value.trim();
  if (!text) return;

  playerInput.value = "";
  addMessage("player", text);

  const node = storyData[state.currentId];

  if (node.answerType === "any") {
    playStory(node.next);
    return;
  }

  if (node.branches) {
    const branch = node.branches.find(item => includesAny(text, item.words));
    if (branch) {
      if (branch.route) state.currentRoute = branch.route;
      playStory(branch.next);
      return;
    }
  }

  if (includesAny(text, node.answerWords)) {
    playStory(node.next);
    return;
  }

  const reaction = findChatReaction(text);
  if (reaction) {
    replyFromAkari(reaction.reply, 900);
    return;
  }

  replyFromAkari(node.failText ?? "えっと…？ もう一回言ってくれる？", 1100);
}

sendButton.addEventListener("click", handlePlayerInput);
playerInput.addEventListener("keydown", event => {
  if (event.key === "Enter") handlePlayerInput();
});

playStory(state.currentId);


function switchScreen(screen) {
  const isChat = screen === "chat";

  chatScreen.classList.toggle("active-screen", isChat);
  searchScreen.classList.toggle("active-screen", !isChat);
  chatTab.classList.toggle("active", isChat);
  searchTab.classList.toggle("active", !isChat);

  screenTitle.textContent = isChat ? "朱里" : "Search";
  screenStatus.textContent = isChat ? "オンライン" : "調査中";

  if (!isChat) searchInput.focus();
}

function runSearch() {
  const query = searchInput.value.trim();
  if (!query) return;

  searchHistory.push(query);

  const results = searchPages.filter(page => includesAny(query, page.keywords));

  searchResults.innerHTML = "";

  if (results.length === 0) {
    const noResult = document.createElement("p");
    noResult.className = "no-result";
    noResult.textContent = `「${query}」に一致する検索結果はありません。`;
    searchResults.appendChild(noResult);
    return;
  }

  results.forEach(result => {
    const card = document.createElement("article");
    card.className = "result-card";
    card.addEventListener("click", () => openSearchDetail(result.id));

    const title = document.createElement("div");
    title.className = "result-title";
    title.textContent = result.title;

    const url = document.createElement("div");
    url.className = "result-url";
    url.textContent = result.url;

    const snippet = document.createElement("div");
    snippet.className = "result-snippet";
    snippet.textContent = result.snippet;

    card.appendChild(title);
    card.appendChild(url);
    card.appendChild(snippet);
    searchResults.appendChild(card);
  });
}

function decorateBlackout(text) {
  return text
    .replaceAll("■■■", '<span class="blackout">■■■</span>')
    .replaceAll("■■", '<span class="blackout">■■</span>')
    .replaceAll("■", '<span class="blackout">■</span>');
}

function openSearchDetail(pageId) {
  const page = searchPages.find(item => item.id === pageId);
  if (!page) return;

  searchResults.innerHTML = "";

  const detail = document.createElement("article");
  detail.className = "detail-page";
  detail.classList.toggle("dark-detail", page.theme === "dark");

  const back = document.createElement("button");
  back.className = "back-button";
  back.textContent = "← 検索結果に戻る";
  back.addEventListener("click", runSearch);

  const title = document.createElement("div");
  title.className = "detail-title";
  title.textContent = page.title;

  const url = document.createElement("div");
  url.className = "detail-url";
  url.textContent = page.url;

  const body = document.createElement("div");
  body.className = "detail-body";
  body.innerHTML = decorateBlackout(page.body);

  detail.appendChild(back);
  detail.appendChild(title);
  detail.appendChild(url);

  if (page.image) {
    const img = document.createElement("img");
    img.className = "search-detail-image";
    img.src = `./assets/images/${page.image}`;
    img.alt = page.title;
    detail.appendChild(img);
  }

  detail.appendChild(body);

  searchResults.appendChild(detail);
}



function showEnding(endingData) {
  if (!endingData) return;

  endingOverlay.className = `ending-overlay ${endingData.type}`;
  endingTitle.textContent = endingData.title;
  endingBody.textContent = endingData.body;
  if (endingData.image) {
    endingImage.src = `./assets/images/${endingData.image}`;
    endingImage.alt = endingData.title;
    endingImage.classList.remove("hidden");
  } else {
    endingImage.classList.add("hidden");
  }

  endingShareButton.onclick = () => {
    const shareUrl = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(endingData.shareText);
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  requestAnimationFrame(() => {
    endingOverlay.classList.add("show");
  });
}

function closeEnding() {
  endingOverlay.classList.remove("show");
  setTimeout(() => {
    endingOverlay.className = "ending-overlay hidden";
  }, 500);
}

function openModal(title, html = "") {
  modalTitle.textContent = title;
  modalBody.innerHTML = html;
  modalOverlay.classList.remove("hidden");
}

function closeModal() {
  modalOverlay.classList.add("hidden");
}

function getSlotKey(slotNumber) {
  return `${SAVE_KEY_PREFIX}${slotNumber}`;
}

function getSaveData(slotNumber) {
  const raw = localStorage.getItem(getSlotKey(slotNumber));
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getCurrentPlaceLabel() {
  return routeLabels[state.currentRoute] ?? routeLabels.common;
}

function createSavePayload(slotNumber) {
  return {
    slotNumber,
    savedAt: new Date().toLocaleString("ja-JP"),
    currentId: state.currentId,
    currentRoute: state.currentRoute,
    placeLabel: getCurrentPlaceLabel(),
    chatLog: state.chatLog,
    searchHistory: searchHistory
  };
}

function saveToSlot(slotNumber) {
  if (!state.waiting) {
    openModal("セーブ不可", `
      <div class="notice-box">
        今はセーブできません。

        朱里が返事を待っている時だけ
        セーブできます。
      </div>
    `);
    return;
  }

  const existing = getSaveData(slotNumber);

  if (existing) {
    openModal("上書き確認", `
      <div class="notice-box">
        SLOT ${slotNumber} に上書きしますか？

        現在のデータ：
        ${existing.placeLabel}
        ${existing.savedAt}
      </div>
      <div class="confirm-actions">
        <button class="confirm-button cancel" onclick="showSaveMenu()">いいえ</button>
        <button class="confirm-button primary" onclick="confirmSave(${slotNumber})">はい</button>
      </div>
    `);
    return;
  }

  confirmSave(slotNumber);
}

function confirmSave(slotNumber) {
  const payload = createSavePayload(slotNumber);
  localStorage.setItem(getSlotKey(slotNumber), JSON.stringify(payload));

  openModal("セーブ完了", `
    <div class="notice-box">
      SLOT ${slotNumber} にセーブしました。

      ${payload.placeLabel}
      ${payload.savedAt}
    </div>
  `);
}

function renderSlotButton(slotNumber, mode) {
  const data = getSaveData(slotNumber);

  if (!data) {
    if (mode === "load") {
      return `
        <button class="slot-button" disabled>
          <div class="slot-title">SLOT ${slotNumber}</div>
          <div class="slot-meta empty-slot">空き</div>
        </button>
      `;
    }

    return `
      <button class="slot-button" onclick="saveToSlot(${slotNumber})">
        <div class="slot-title">SLOT ${slotNumber}</div>
        <div class="slot-meta empty-slot">空き</div>
      </button>
    `;
  }

  const action = mode === "save" ? `saveToSlot(${slotNumber})` : `loadFromSlot(${slotNumber})`;

  return `
    <button class="slot-button" onclick="${action}">
      <div class="slot-title">SLOT ${slotNumber}</div>
      <div class="slot-meta">${data.placeLabel}
${data.currentRoute} / message ${data.currentId}
${data.savedAt}</div>
    </button>
  `;
}

function showMainMenu() {
  openModal("メニュー", `
    <div class="menu-list">
      <button class="menu-item" onclick="showSaveMenu()">セーブ</button>
      <button class="menu-item" onclick="showLoadMenu()">ロード</button>
      <button class="menu-item danger" onclick="showTitleNotice()">タイトルへ戻る</button>
    </div>
  `);
}

function showSaveMenu() {
  openModal("セーブ", `
    <div class="slot-list">
      ${renderSlotButton(1, "save")}
      ${renderSlotButton(2, "save")}
      ${renderSlotButton(3, "save")}
    </div>
  `);
}

function showLoadMenu() {
  openModal("ロード", `
    <div class="slot-list">
      ${renderSlotButton(1, "load")}
      ${renderSlotButton(2, "load")}
      ${renderSlotButton(3, "load")}
    </div>
  `);
}

function showTitleNotice() {
  if (!confirm("最初から始めますか？\n※セーブデータは残ります")) {
    return;
  }

  localStorage.removeItem(AUTOSAVE_KEY);

  state.currentId = 1;
  state.currentRoute = "common";
  state.waiting = false;
  state.chatLog = [];

  location.reload();
}

function loadFromSlot(slotNumber) {
  const data = getSaveData(slotNumber);
  if (!data) return;

  state.currentId = data.currentId;
  state.currentRoute = data.currentRoute;
  state.waiting = true;
  state.chatLog = data.chatLog ?? [];

  searchHistory.length = 0;
  (data.searchHistory ?? []).forEach(item => searchHistory.push(item));

  chatLog.innerHTML = "";
  state.chatLog.forEach(item => {
    addMessage(item.speaker, item.text, false, item.image ?? null);
  });

  closeModal();
  switchScreen("chat");
  setInputEnabled(true);
}

modalCloseButton.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", event => {
  if (event.target === modalOverlay) closeModal();
});
menuButton.addEventListener("click", showMainMenu);

chatTab.addEventListener("click", () => switchScreen("chat"));
searchTab.addEventListener("click", () => switchScreen("search"));
searchButton.addEventListener("click", runSearch);
searchInput.addEventListener("keydown", event => {
  if (event.key === "Enter") runSearch();
});

endingLoadButton.addEventListener("click", () => {
  closeEnding();
  showLoadMenu();
});

endingCloseButton.addEventListener("click", closeEnding);
document.addEventListener("click", (e) => {

  const img = e.target.closest(
    ".chat-image, .search-detail-image"
  );

  if (!img) return;

  const overlay = document.createElement("div");

  overlay.className = "image-modal";

  overlay.innerHTML = `
    <img src="${img.src}" alt="">
  `;

  overlay.addEventListener("click", () => {
    overlay.remove();
  });

  document.body.appendChild(overlay);

});

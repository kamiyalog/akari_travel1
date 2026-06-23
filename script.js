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

const state = {
  currentId: 1,
  currentRoute: "common",
  waiting: false,
  chatLog: [],
  typingElement: null
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function addMessage(speaker, text) {
  const row = document.createElement("div");

  if (speaker === "system") {
    row.className = "system-message";
    row.textContent = text;
  } else {
    row.className = `message-row ${speaker}`;
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = text;
    row.appendChild(bubble);
  }

  chatLog.appendChild(row);
  chatLog.scrollTop = chatLog.scrollHeight;
  state.chatLog.push({ speaker, text });
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
  setInputEnabled(false);

  const typingMs = node.typingMs ?? DEFAULT_TYPING_MS;

  if (node.speaker === "akari" && typingMs > 0) {
    showTyping();
    await sleep(typingMs);
    hideTyping();
  } else if (typingMs > 0) {
    await sleep(typingMs);
  }

  addMessage(node.speaker, node.text);

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

function findChatReaction(input) {
  const reactions = chatReactions[state.currentRoute] ?? [];
  return reactions.find(item => includesAny(input, item.words));
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

chatTab.addEventListener("click", () => switchScreen("chat"));
searchTab.addEventListener("click", () => switchScreen("search"));
searchButton.addEventListener("click", runSearch);
searchInput.addEventListener("keydown", event => {
  if (event.key === "Enter") runSearch();
});

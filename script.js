const chatLog = document.getElementById("chatLog");
const playerInput = document.getElementById("playerInput");
const sendButton = document.getElementById("sendButton");

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

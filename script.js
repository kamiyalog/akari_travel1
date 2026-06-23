const chatLog = document.getElementById("chatLog");
const playerInput = document.getElementById("playerInput");
const sendButton = document.getElementById("sendButton");

const state = {
  currentId: 1,
  currentRoute: "common",
  waiting: false,
  chatLog: []
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

  await sleep(node.delay ?? 650);
  addMessage(node.speaker, node.text);

  if (node.waitInput) {
    setInputEnabled(true);
    return;
  }

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
    addMessage("akari", reaction.reply);
    return;
  }

  addMessage("akari", node.failText ?? "えっと…？ もう一回言ってくれる？");
}

sendButton.addEventListener("click", handlePlayerInput);
playerInput.addEventListener("keydown", event => {
  if (event.key === "Enter") handlePlayerInput();
});

playStory(state.currentId);

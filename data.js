const DEFAULT_TYPING_MS = 900;
const DEFAULT_AFTER_MS = 450;

const storyData = {
  1: {
    speaker: "akari",
    text: "やっほー！　見えてるかな？？",
    waitInput: true,
    answerType: "any",
    typingMs: 900,
    next: 2
  },
  2: {
    speaker: "akari",
    text: "よかった！　最近スマホ調子悪くてさー…\nそろそろ買い替えようかなぁ",
    typingMs: 1300,
    next: 3
  },
  3: {
    speaker: "akari",
    text: "って、そうじゃなくて！\n今日はね、海の方に散歩しようともってさ！",
    typingMs: 1400,
    next: 4
  },
  4: {
    speaker: "akari",
    text: "朱里ちゃんの実況散歩！　始まるよー！",
    typingMs: 900,
    next: 5
  },
  5: {
    speaker: "akari",
    text: "あ、拒否権はないからね！\nぐふふ。付き合ってもらうからね？",
    waitInput: true,
    answerType: "any",
    typingMs: 1300,
    next: 6
  },
  6: {
    speaker: "akari",
    text: "よーし、じゃあしゅっぱーつ！",
    typingMs: 900,
    afterMs: 1200,
    next: 7
  },
  7: {
    speaker: "akari",
    text: "この辺も変わってないなー\n昔はよく来てたんだよねー",
    typingMs: 1400,
    next: 8
  },
  8: {
    speaker: "akari",
    text: "あれ、お店全部しまってる。ほら",
    typingMs: 1000,
    afterMs: 1000,
    next: 9
  },
  9: {
    speaker: "system",
    text: "写真送信：商店街の写真\n黄兎書店、いけいけ電気店の看板が見える",
    typingMs: 0,
    afterMs: 900,
    next: 10
  },
  10: {
    speaker: "akari",
    text: "なんか新しそうな店もあるのに。定休日なのかな。",
    typingMs: 1300,
    next: 11
  },
  11: {
    speaker: "akari",
    text: "というか、人もいなくない？　え、何かあるのかな。",
    waitInput: true,
    answerWords: ["祭", "お祭り", "祭り", "まつり"],
    failText: "んー本当にそうなの？　うーん？\nなーんか違う気がする",
    typingMs: 1400,
    next: 12
  },
  12: {
    speaker: "akari",
    text: "え、お祭り？　そうなんだ！　行ってみたい！\nどこでやってるとか書いてあった！？",
    waitInput: true,
    answerWords: ["島", "しま", "対岸の島"],
    failText: "そうなのかな…？\nあ、HPとかに書いてあったりしない？\nなんかネット重くて見れないんだけど…\n代わりに見てくれると朱里ちゃん嬉しい☆",
    typingMs: 1500,
    next: null
  }
};

const chatReactions = {
  common: [
    { words: ["かわいい"], reply: "えへへ～♪ もっと褒めてもいいんだよ？" },
    { words: ["可愛い"], reply: "朱里ちゃん、照れちゃう！" },
    { words: ["好き"], reply: "えっ！？ 急に！？" },
    { words: ["嫌い"], reply: "えぇ！？ なんで！？" },
    { words: ["バカ"], reply: "失礼なー！" },
    { words: ["アホ"], reply: "アホとはなんだアホとは！" },
    { words: ["怖い"], reply: "えー？ まだ全然怖くないよ！" },
    { words: ["帰れ"], reply: "まだ始まったばっかだよ！？" },
    { words: ["危ない"], reply: "心配性だなぁ笑" },
    { words: ["逃げろ"], reply: "なんでよ笑" },
    { words: ["彼氏"], reply: "いませーん！ 残念でした！" },
    { words: ["年齢"], reply: "レディに聞くことじゃありません！" },
    { words: ["チャッピー"], reply: "AI？ 私の方がかわいいよね？" }
  ]
};

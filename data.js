const DEFAULT_TYPING_MS = 1800;
const DEFAULT_AFTER_MS = 900;

const storyData = {
  "1": {
    "speaker": "akari",
    "text": "やっほー！　見えてるかな？？",
    "waitInput": true,
    "answerType": "any",
    "typingMs": 1800,
    "next": 2
  },
  "2": {
    "speaker": "akari",
    "text": "よかった！　最近スマホ調子悪くてさー…\nそろそろ買い替えようかなぁ",
    "typingMs": 2300,
    "next": 3
  },
  "3": {
    "speaker": "akari",
    "text": "って、そうじゃなくて！\n今日はね、海の方に散歩しようともってさ！",
    "typingMs": 2400,
    "next": 4
  },
  "4": {
    "speaker": "akari",
    "text": "朱里ちゃんの実況散歩！　始まるよー！",
    "typingMs": 1800,
    "next": 5
  },
  "5": {
    "speaker": "akari",
    "text": "あ、拒否権はないからね！\nぐふふ。付き合ってもらうからね？",
    "waitInput": true,
    "answerType": "any",
    "typingMs": 2300,
    "next": 6
  },
  "6": {
    "speaker": "akari",
    "text": "よーし、じゃあしゅっぱーつ！",
    "typingMs": 1800,
    "afterMs": 5000,
    "next": 7
  },
  "7": {
    "speaker": "akari",
    "text": "この辺も変わってないなー\n昔はよく来てたんだよねー",
    "typingMs": 2400,
    "next": 8
  },
  "8": {
    "speaker": "akari",
    "text": "あれ、お店全部しまってる。ほら",
    "typingMs": 2000,
    "afterMs": 2000,
    "next": 9
  },
  "9": {
    "speaker": "system",
    "text": "写真送信：商店街の写真\n黄兎書店、いけいけ電気店の看板が見える",
    "typingMs": 0,
    "afterMs": 2000,
    "next": 10
  },
  "10": {
    "speaker": "akari",
    "text": "なんか新しそうな店もあるのに。定休日なのかな。",
    "typingMs": 2300,
    "next": 11
  },
  "11": {
    "speaker": "akari",
    "text": "というか、人もいなくない？　え、何かあるのかな。",
    "waitInput": true,
    "answerWords": [
      "祭",
      "お祭り",
      "祭り",
      "まつり"
    ],
    "failText": "んー本当にそうなの？　うーん？\nなーんか違う気がする",
    "typingMs": 2400,
    "next": 12
  },
  "12": {
    "speaker": "akari",
    "text": "え、お祭り？　そうなんだ！　行ってみたい！\nどこでやってるとか書いてあった！？",
    "waitInput": true,
    "answerWords": [
      "島",
      "しま",
      "対岸の島"
    ],
    "failText": "そうなのかな…？\nあ、HPとかに書いてあったりしない？\nなんかネット重くて見れないんだけど…\n代わりに見てくれると朱里ちゃん嬉しい☆",
    "typingMs": 2500,
    "next": 13
  },
  "13": {
    "speaker": "akari",
    "text": "え？　島？　そんなとこあったっけ…？",
    "next": 14
  },
  "14": {
    "speaker": "akari",
    "text": "ちょっと海の方まで行ってみるね",
    "afterMs": 5000,
    "next": 15
  },
  "15": {
    "speaker": "akari",
    "text": "もしかして島ってあれのことかな",
    "next": 16
  },
  "16": {
    "speaker": "system",
    "text": "写真送信：海辺の向こうにぼんやり島。\n手前に「祭り会場はこちら」らしき看板がある",
    "afterMs": 2000,
    "next": 17
  },
  "17": {
    "speaker": "akari",
    "text": "どうやって行くんだろう。船とかあるのかな。",
    "next": 18
  },
  "18": {
    "speaker": "akari",
    "text": "なんかあるかなー…？",
    "waitInput": true,
    "answerWords": [
      "看板",
      "かんばん",
      "板",
      "お知らせ",
      "おしらせ"
    ],
    "failText": "うーん、なんか道案内とかあればいいんだけど。　どこかに書いてありそう？",
    "next": 19
  },
  "19": {
    "speaker": "akari",
    "text": "看板…？　あ。これか！　こんなに大きく書いてあったのに見逃してた！\nうっかりうっかり…。やっぱり頼りになるね！",
    "next": 20
  },
  "20": {
    "speaker": "system",
    "text": "画像送信：看板には少し不吉なことが書いてある\n※■■はこちらから\n※潰されている文字は「生者」",
    "afterMs": 2000,
    "next": 21
  },
  "21": {
    "speaker": "akari",
    "text": "こっちの方に行けばいいってことだよね。",
    "next": 22
  },
  "22": {
    "speaker": "akari",
    "text": "ちょっと行ってみるね",
    "afterMs": 5000,
    "next": 23
  },
  "23": {
    "speaker": "akari",
    "text": "あ、船がある！",
    "next": 24
  },
  "24": {
    "speaker": "akari",
    "text": "あと、船頭さんかな…？",
    "next": 25
  },
  "25": {
    "speaker": "akari",
    "text": "ちょっと声かけてみるね！",
    "afterMs": 5000,
    "next": 26
  },
  "26": {
    "speaker": "akari",
    "text": "聞いてきた！",
    "next": 27
  },
  "27": {
    "speaker": "akari",
    "text": "なんかちょうどこれから島で祭りがあって、\n乗せてってくれるみたい！",
    "next": 28
  },
  "28": {
    "speaker": "akari",
    "text": "でも…うーん。なんかちょっと怪しいというか…。",
    "next": 29
  },
  "29": {
    "speaker": "akari",
    "text": "行ってみてもいいと思う？",
    "waitInput": true,
    "answerType": "any",
    "next": 30
  },
  "30": {
    "speaker": "akari",
    "text": "うーん。そうだよねぇ…。",
    "next": 31
  },
  "31": {
    "speaker": "akari",
    "text": "まぁ危なかったら最悪海に飛び込んで逃げてもいいし、\n行ってみるね！",
    "afterMs": 5000,
    "next": 32
  },
  "32": {
    "speaker": "akari",
    "text": "着いた！",
    "next": 33
  },
  "33": {
    "speaker": "akari",
    "text": "おぉー本当にお祭り会場だ！\nちょっと回ってみるね",
    "next": 34
  },
  "34": {
    "speaker": "system",
    "text": "画像送信：祭りの様子。\n人々はみな、お面をつけている",
    "afterMs": 2000,
    "next": 35
  },
  "35": {
    "speaker": "akari",
    "text": "やっぱりお祭りっていいねぇ！",
    "next": 36
  },
  "36": {
    "speaker": "akari",
    "text": "んー…でもなんだろう。\nなんか違和感あるんだよなぁ。",
    "next": 37
  },
  "37": {
    "speaker": "akari",
    "text": "なんだろう？",
    "waitInput": true,
    "answerWords": [
      "お面",
      "御面",
      "仮面",
      "おめん"
    ],
    "failText": "いやー…もっとある気がする…",
    "next": 38
  },
  "38": {
    "speaker": "akari",
    "text": "そっか！　みんなお面付けてるんだ！",
    "next": 39
  },
  "39": {
    "speaker": "akari",
    "text": "なんか意味あるのかな？",
    "waitInput": true,
    "answerWords": [
      "規則",
      "きそく",
      "祭りの規則",
      "祭の規則",
      "決まり",
      "きまり"
    ],
    "failText": "そうなの？　なーんかピンとこない。",
    "next": 40
  },
  "40": {
    "speaker": "akari",
    "text": "祭りの規則…？　ほへー…じゃあ、あたしもつけたほうがいいのかな！？",
    "next": 41
  },
  "41": {
    "speaker": "akari",
    "text": "どこかで売ってるのかな。ちょっと探してみる！",
    "afterMs": 5000,
    "next": 42
  },
  "42": {
    "speaker": "akari",
    "text": "あ、あったよ！　お面屋さん！",
    "next": 43
  },
  "43": {
    "speaker": "system",
    "text": "画像送信：お面屋のお面ラインナップ\nウサギとキツネの仮面だけ。\n横にお祭りのポスターがあり、祭りの名前が書いてある",
    "afterMs": 2000,
    "next": 44
  },
  "44": {
    "speaker": "akari",
    "text": "ねぇねぇ、どれがいいと思う！？\nというかウサギかキツネしかないんだけど…\nま、いっか！　どっちがいいかな？？",
    "waitInput": true,
    "branches": [
      {
        "words": [
          "ウサギ",
          "うさぎ",
          "兎"
        ],
        "next": 45,
        "route": "A"
      },
      {
        "words": [
          "キツネ",
          "きつね",
          "狐"
        ],
        "next": 89,
        "route": "B"
      }
    ],
    "failText": "ウサギか、キツネで選んで！\nどっちの朱里ちゃんが見たい？？"
  },
  "45": {
    "speaker": "akari",
    "text": "そうだよねぇ！　やっぱりこのウサギのがいいよねぇ！",
    "route": "A",
    "next": 46
  },
  "46": {
    "speaker": "akari",
    "text": "わかってるじゃないかぁ～！",
    "next": 47
  },
  "47": {
    "speaker": "akari",
    "text": "じゃあ買ってくるね！",
    "afterMs": 5000,
    "next": 48
  },
  "48": {
    "speaker": "akari",
    "text": "じゃーん！",
    "next": 481
  },
  "481": {
    "speaker": "system",
    "text": "画像送信：ウサギの面を斜めにかぶった朱里",
    "afterMs": 2000,
    "next": 482
  },
  "482": {
    "speaker": "akari",
    "text": "どう？　似合う！？",
    "next": 49
  },
  "49": {
    "speaker": "akari",
    "text": "ん？　なんだろう、この音…",
    "next": 50
  },
  "50": {
    "speaker": "akari",
    "text": "なんか…サイレンみたいな…",
    "next": 51
  },
  "51": {
    "speaker": "akari",
    "text": "ちょっと頭痛くなってきた…",
    "typingMs": 2200,
    "afterMs": 300,
    "next": 52
  },
  "52": {
    "speaker": "akari",
    "text": "まｔ",
    "typingMs": 250,
    "afterMs": 4000,
    "next": 53
  },
  "53": {
    "speaker": "akari",
    "text": "あれ…ここ…どこ…？",
    "route": "A1",
    "typingMs": 2500,
    "next": 54
  },
  "54": {
    "speaker": "system",
    "text": "画像送信：コンクリート打ちっぱなしの暗い部屋。\nドア、鉄格子付きの窓、換気ダクト、脚立が見える",
    "afterMs": 2000,
    "next": 55
  },
  "55": {
    "speaker": "akari",
    "text": "それに何か聞こえる…。\n録音するからちょっと聞いてみて",
    "next": 56
  },
  "56": {
    "speaker": "akari",
    "text": "聞こえたら何か反応して",
    "next": 57
  },
  "57": {
    "speaker": "system",
    "text": "音声ファイル送信：\nまもなく…本祭が始まります…\n狩りのご準備をお願いします…繰り返します…",
    "waitInput": true,
    "answerType": "any",
    "afterMs": 2000,
    "next": 58
  },
  "58": {
    "speaker": "akari",
    "text": "聞こえたみたいだね…なんか「狩り」とか聞こえたけど…",
    "next": 59
  },
  "59": {
    "speaker": "akari",
    "text": "え…怖いんだけど…。",
    "next": 60
  },
  "60": {
    "speaker": "akari",
    "text": "とりあえず移動した方がいいよね…",
    "afterMs": 2000,
    "next": 61
  },
  "61": {
    "speaker": "akari",
    "text": "だめだ",
    "typingMs": 700,
    "next": 62
  },
  "62": {
    "speaker": "akari",
    "text": "ドア開かない",
    "typingMs": 800,
    "next": 63
  },
  "63": {
    "speaker": "akari",
    "text": "あとは…窓か…あの天井近くの穴？　かな？",
    "waitInput": true,
    "branches": [
      {
        "words": [
          "窓",
          "まど"
        ],
        "next": 64,
        "route": "A1"
      },
      {
        "words": [
          "穴",
          "あな",
          "ダクト",
          "換気ダクト",
          "天井近くの穴"
        ],
        "next": 67,
        "route": "A1"
      }
    ],
    "failText": "それって…？\nとりあえず窓か、穴を調べてみたいかも…"
  },
  "64": {
    "speaker": "akari",
    "text": "窓だね。ちょっと見てみる。",
    "afterMs": 5000,
    "next": 65
  },
  "65": {
    "speaker": "akari",
    "text": "ダメみたい。この鉄格子外れないよ。",
    "next": 66
  },
  "66": {
    "speaker": "akari",
    "text": "うーん、どうしよう。",
    "waitInput": true,
    "answerWords": [
      "穴",
      "あな",
      "ダクト",
      "換気ダクト",
      "天井近くの穴"
    ],
    "failText": "えっと…？\n後探せるところはなさそう。\n穴でいいのかな…？\nそうだったら　穴　とか返してくれると嬉しい",
    "next": 67
  },
  "67": {
    "speaker": "akari",
    "text": "分かった！　なんか用意されたかのような脚立も気になるけど…",
    "next": 68
  },
  "68": {
    "speaker": "akari",
    "text": "行ってみるね",
    "afterMs": 5000,
    "next": 69
  },
  "69": {
    "speaker": "akari",
    "text": "外出れた…！",
    "next": 70
  },
  "70": {
    "speaker": "akari",
    "text": "あ！　正面側に人がいっぱいいる！広場…？かな",
    "next": 71
  },
  "71": {
    "speaker": "akari",
    "text": "あとは…左にも道が続いてる…どっちにいったらいいかな…",
    "next": 72
  },
  "72": {
    "speaker": "akari",
    "text": "地図とかあればいいんだけど…",
    "waitInput": true,
    "branches": [
      {
        "words": [
          "広場",
          "ひろば",
          "正面"
        ],
        "next": 1001,
        "route": "A1"
      },
      {
        "words": [
          "左",
          "ひだり",
          "左の道",
          "ひだりのみち"
        ],
        "next": 73,
        "route": "A2"
      }
    ],
    "failText": "…ごめん。聞いといてアレなんだけど、\n左、正面、どっちかな…？"
  },
  "73": {
    "speaker": "akari",
    "text": "左…だね？　わかった。こっち行ってみる。",
    "route": "A2",
    "next": 74
  },
  "74": {
    "speaker": "akari",
    "text": "ちょっとまってて",
    "afterMs": 5000,
    "next": 75
  },
  "75": {
    "speaker": "akari",
    "text": "ここは…船着き場っぽい？\n最初に来たところとは違うけど…",
    "next": 76
  },
  "76": {
    "speaker": "system",
    "text": "画像送信：船着き場に、２艘の船が止まっている。\n赤い船と黄色い船。\n船同士は結構離れている",
    "afterMs": 2000,
    "next": 77
  },
  "77": {
    "speaker": "akari",
    "text": "！　船に人がいる！",
    "next": 78
  },
  "78": {
    "speaker": "akari",
    "text": "でもなんか…なんだろう",
    "next": 79
  },
  "79": {
    "speaker": "akari",
    "text": "変な雰囲気…",
    "next": 80
  },
  "80": {
    "speaker": "akari",
    "text": "船も離れてるし…。どっちいったらいいかな？　赤い船と、黄色い船…",
    "waitInput": true,
    "branches": [
      {
        "words": [
          "赤",
          "赤色",
          "赤い船",
          "赤い方",
          "あか",
          "あかいろ"
        ],
        "next": 1002,
        "route": "A2"
      },
      {
        "words": [
          "黄色",
          "黄色い船",
          "きいろ"
        ],
        "next": 81,
        "route": "A3"
      }
    ],
    "failText": "ええっと…？\nごめん。あたし、ちゃんと理解できてない\n赤？　黄色？"
  },
  "81": {
    "speaker": "akari",
    "text": "黄色い船だね！　わかった！　行ってみる！",
    "route": "A3",
    "afterMs": 5000,
    "next": 82
  },
  "82": {
    "speaker": "akari",
    "text": "あ、繋がった。",
    "next": 83
  },
  "83": {
    "speaker": "akari",
    "text": "あたしは無事だよ！　船で戻してもらえた。",
    "next": 84
  },
  "84": {
    "speaker": "akari",
    "text": "なんか「黄泉より戻りし兎」とか言われたんだけど…何だったんだろう？",
    "waitInput": true,
    "answerWords": [
      "生贄",
      "いけにえ",
      "贄"
    ],
    "failText": "うーん？　そうなのかな…？",
    "next": 85
  },
  "85": {
    "speaker": "akari",
    "text": "い、生贄！？　なにそれ！",
    "next": 86
  },
  "86": {
    "speaker": "akari",
    "text": "えぇ…こわぁ…！",
    "next": 87
  },
  "87": {
    "speaker": "akari",
    "text": "と、とりあえず帰るね！",
    "afterMs": 5000,
    "next": 88
  },
  "88": {
    "speaker": "akari",
    "text": "家着いたらまた連絡する！",
    "next": 2001
  },
  "89": {
    "speaker": "akari",
    "text": "キツネね。おぉ？クールな朱里ちゃんが見たい感じ？",
    "route": "B",
    "next": 90
  },
  "90": {
    "speaker": "akari",
    "text": "なんてね♪",
    "afterMs": 2000,
    "next": 91
  },
  "91": {
    "speaker": "akari",
    "text": "じゃーん！",
    "next": 92
  },
  "92": {
    "speaker": "system",
    "text": "画像送信：キツネの面を斜めにかぶった朱里",
    "afterMs": 2000,
    "next": 921
  },
  "921": {
    "speaker": "akari",
    "text": "どう？　似合う！？",
    "next": 93
  },
  "93": {
    "speaker": "akari",
    "text": "ん？　なんだろう、この音…",
    "next": 94
  },
  "94": {
    "speaker": "akari",
    "text": "なんか…サイレンみたいな…",
    "afterMs": 5000,
    "next": 95
  },
  "95": {
    "speaker": "akari",
    "text": "え、なんかキツネ面の人に囲まれてるんだけど",
    "typingMs": 700,
    "next": 96
  },
  "96": {
    "speaker": "akari",
    "text": "ちょっとｍ",
    "typingMs": 250,
    "afterMs": 4000,
    "next": 97
  },
  "97": {
    "speaker": "akari",
    "text": "あれ…ここは？",
    "next": 98
  },
  "98": {
    "speaker": "system",
    "text": "画像送信：豪華な和室。\n祭壇のようなものと、ご飯のセットが置いてある",
    "afterMs": 2000,
    "next": 99
  },
  "99": {
    "speaker": "akari",
    "text": "なにこれ…。",
    "next": 100
  },
  "100": {
    "speaker": "akari",
    "text": "あ！　なんかご飯ある！\nお腹すいてたんだよね！　食べちゃっていいかな…？",
    "waitInput": true,
    "answerType": "any",
    "next": 101
  },
  "101": {
    "speaker": "akari",
    "text": "あ、でも。うーん。やっぱりやめとこうかな",
    "next": 102
  },
  "102": {
    "speaker": "akari",
    "text": "こういう時の朱里ちゃんの勘は鋭いのだよ！",
    "next": 103
  },
  "103": {
    "speaker": "akari",
    "text": "というか、なんなのここ。",
    "afterMs": 2000,
    "next": 104
  },
  "104": {
    "speaker": "akari",
    "text": "ん？　ちょっと待って何か聞こえる",
    "next": 105
  },
  "105": {
    "speaker": "akari",
    "text": "録音するから聞いてみて\n聞こえたら何か返事ちょうだい",
    "next": 106
  },
  "106": {
    "speaker": "system",
    "text": "音声ファイル送信：\nまもなく…転昇の儀が始まります…\n供物をもって本殿へお越しください…繰り返します…",
    "waitInput": true,
    "answerType": "any",
    "afterMs": 2000,
    "next": 107
  },
  "107": {
    "speaker": "akari",
    "text": "聞こえたんだね。ありがとう。",
    "next": 108
  },
  "108": {
    "speaker": "akari",
    "text": "なんか「てんしょうのぎ」とか「くもつ」とか言ってたけど…",
    "next": 109
  },
  "109": {
    "speaker": "akari",
    "text": "すっごい怪しいんですけど！",
    "next": 110
  },
  "110": {
    "speaker": "akari",
    "text": "と、とりあえず逃げたほうがいいよね…！？",
    "next": 111
  },
  "111": {
    "speaker": "akari",
    "text": "ドアは…空いてる…。",
    "next": 112
  },
  "112": {
    "speaker": "akari",
    "text": "廊下は…右と左どっちも行けるけど…",
    "next": 113
  },
  "113": {
    "speaker": "akari",
    "text": "どっちに行けばいいんだろう。",
    "next": 114
  },
  "114": {
    "speaker": "akari",
    "text": "地図とかあればいいんだけど…",
    "waitInput": true,
    "branches": [
      {
        "words": [
          "左",
          "ひだり",
          "左の道",
          "ひだりのみち"
        ],
        "next": 1003,
        "route": "B"
      },
      {
        "words": [
          "右",
          "みぎ",
          "右の道",
          "みぎのみち"
        ],
        "next": 115,
        "route": "B2"
      }
    ],
    "failText": "…ごめん。聞いといてなんだけど、\n左、右、どっちかな…？"
  },
  "115": {
    "speaker": "akari",
    "text": "え？　右…？\n……うん。わかった。信じる。",
    "route": "B2",
    "next": 116
  },
  "116": {
    "speaker": "akari",
    "text": "ちょっとまってて",
    "afterMs": 5000,
    "next": 117
  },
  "117": {
    "speaker": "akari",
    "text": "なんか扉あるけど…。",
    "next": 118
  },
  "118": {
    "speaker": "akari",
    "text": "後は…、左に廊下が続いてるね…。",
    "next": 119
  },
  "119": {
    "speaker": "akari",
    "text": "廊下か扉…どっち行ったらいいかな",
    "next": 120
  },
  "120": {
    "speaker": "system",
    "text": "画像送信：扉の写真。\n「非常通行扉」と書いてある",
    "waitInput": true,
    "branches": [
      {
        "words": [
          "扉",
          "とびら",
          "ドア",
          "非常通行扉"
        ],
        "next": 1004,
        "route": "B2"
      },
      {
        "words": [
          "廊下",
          "左",
          "みち",
          "ひだり",
          "左の廊下",
          "ろうか"
        ],
        "next": 121,
        "route": "B3"
      }
    ],
    "failText": "え？　ごめん。\n扉行けばいい？　廊下行けばいい？\n本当に余裕なくて。ごめん。"
  },
  "121": {
    "speaker": "akari",
    "text": "廊下…だね。行ってみる。",
    "route": "B3",
    "afterMs": 5000,
    "next": 122
  },
  "122": {
    "speaker": "akari",
    "text": "あ、外に出れた！",
    "next": 123
  },
  "123": {
    "speaker": "akari",
    "text": "なんか廊下が途中から途切れてた。\nどんな構造してるんだろう。この建物。",
    "next": 124
  },
  "124": {
    "speaker": "akari",
    "text": "とりあえずまっすぐ行ってみるね",
    "afterMs": 5000,
    "next": 125
  },
  "125": {
    "speaker": "akari",
    "text": "ここは…船着き場っぽい？\n最初に来たところとは違うけど…",
    "next": 126
  },
  "126": {
    "speaker": "system",
    "text": "画像送信：船着き場に、２艘の船が止まっている。\n赤い船と黄色い船。\n船同士は結構離れている",
    "afterMs": 2000,
    "next": 127
  },
  "127": {
    "speaker": "akari",
    "text": "！　船に人がいる！",
    "next": 128
  },
  "128": {
    "speaker": "akari",
    "text": "でもなんか…なんだろう\n変な雰囲気…",
    "next": 129
  },
  "129": {
    "speaker": "akari",
    "text": "船も離れてるし…。どっちいったらいいかな？　赤い船と、黄色い船…",
    "waitInput": true,
    "branches": [
      {
        "words": [
          "黄色",
          "黄色い船",
          "きいろ"
        ],
        "next": 1005,
        "route": "B3"
      },
      {
        "words": [
          "赤",
          "赤色",
          "赤い船",
          "赤い方",
          "あか",
          "あかいろ"
        ],
        "next": 130,
        "route": "B4"
      }
    ],
    "failText": "ええっと…？\nごめん。あたし、ちゃんと理解できてない\n赤？　黄色？"
  },
  "130": {
    "speaker": "akari",
    "text": "赤い船だね！　ちょっと異様だけど…行ってみる！",
    "route": "B4",
    "afterMs": 5000,
    "next": 131
  },
  "131": {
    "speaker": "akari",
    "text": "あ、繋がった。",
    "next": 132
  },
  "132": {
    "speaker": "akari",
    "text": "あたしは無事だよ！　船で戻してもらえた。",
    "next": 133
  },
  "133": {
    "speaker": "akari",
    "text": "なんか「転生を拒みし狐」とか言われたんだけど…何だったんだろう？",
    "waitInput": true,
    "answerWords": [
      "依り代",
      "よりしろ"
    ],
    "failText": "うーん？　そうなのかな…？",
    "next": 134
  },
  "134": {
    "speaker": "akari",
    "text": "よ、依り代！？",
    "next": 135
  },
  "135": {
    "speaker": "akari",
    "text": "………って、なに…？",
    "next": 136
  },
  "136": {
    "speaker": "akari",
    "text": "ま、まぁ何とかなった…ってことでいいんだよね…？",
    "next": 137
  },
  "137": {
    "speaker": "akari",
    "text": "とりあえず家着いたらまた連絡する！",
    "next": 2002
  },
  "1001": {
    "speaker": "system",
    "text": "BAD END 1",
    "ending": true,
    "endingData": {
      "type": "bad",
      "title": "BAD END 1",
      "body": "そこにいたのは狐面を付けた人達だった。\n彼らは朱里を見つけたとたん朱里に向かって走り出し―――\n\n朱里とはそれ以降連絡が取れなくなった",
      "shareText": "明坂朱里を探しています\nアドレス（後で）\n#ARG #朱里の旅実況海編"
    }
  },
  "1002": {
    "speaker": "system",
    "text": "BAD END 2",
    "ending": true,
    "endingData": {
      "type": "bad",
      "title": "BAD END 2",
      "body": "その船は朱里が乗るべき船ではなかった。\nそれ以降、朱里の姿を見た者はいない",
      "shareText": "海難事故の詳細を求めています\nアドレス（後で）\n#ARG #朱里の旅実況海編"
    }
  },
  "1003": {
    "speaker": "system",
    "text": "BAD END 3",
    "ending": true,
    "endingData": {
      "type": "bad",
      "title": "BAD END 3",
      "body": "道の先には、厳かな空間が広がっていた。\nそれ以降、朱里は変わってしまった。\nきっともう朱里ではないのかもしれない。",
      "shareText": "ええっと、どなたでしょうか？\nアドレス（後で）\n#ARG #朱里の旅実況海編"
    }
  },
  "1004": {
    "speaker": "system",
    "text": "BAD END 4",
    "ending": true,
    "endingData": {
      "type": "bad",
      "title": "BAD END 4",
      "body": "扉の先には、何人もの狐面の人たちがいた。\n彼らは無言で朱里を押さえつけ…、\nそれ以降、朱里に連絡がつくことはなかった。\nただ、地方新聞に載っていた巫女服の女性が、朱里に見えてしょうがない。何故なんだろう。",
      "shareText": "転じて昇るは、何者なりや\nアドレス（後で）\n#ARG #朱里の旅実況海編"
    }
  },
  "1005": {
    "speaker": "system",
    "text": "BAD END 5",
    "ending": true,
    "endingData": {
      "type": "bad",
      "title": "BAD END 5",
      "body": "その船は朱里が乗るべき船ではなかった。\n船には兎面を付けた者たちが乗っており、彼らは無言で朱里を見つめていた。\nそれ以降、その船は見つかっていない。",
      "shareText": "船は流れて何処へ行く\nアドレス（後で）\n#ARG #朱里の旅実況海編"
    }
  },
  "2001": {
    "speaker": "system",
    "text": "GOOD END 1",
    "ending": true,
    "endingData": {
      "type": "good",
      "title": "GOOD END 1",
      "body": "朱里は無事に家へと帰れた。\nその日は朱里と一日中話した。\n\n後日、朱里は島を見に行ったらしいが、\nその島の姿はどこにもなかったらしい。",
      "shareText": "朱里ちゃん　生還！！！\nアドレス（後で）\n#ARG #朱里の旅実況海編"
    }
  },
  "2002": {
    "speaker": "system",
    "text": "GOOD END 2",
    "ending": true,
    "endingData": {
      "type": "good",
      "title": "GOOD END 2",
      "body": "朱里は無事に家へと帰れた。\n\nこの前家に行ったら、壁に狐の面が飾ってあった。\nなんであんなもの飾ってるんだろう…",
      "shareText": "これはこれで思い出だしね！\nアドレス（後で）\n#ARG #朱里の旅実況海編"
    }
  }
};

const chatReactions = {
  "common": [
    {
      "words": [
        "かわいい"
      ],
      "reply": "えへへ～♪ もっと褒めてもいいんだよ？"
    },
    {
      "words": [
        "可愛い"
      ],
      "reply": "朱里ちゃん、照れちゃう！"
    },
    {
      "words": [
        "好き"
      ],
      "reply": "えっ！？ 急に！？"
    },
    {
      "words": [
        "嫌い"
      ],
      "reply": "えぇ！？ なんで！？"
    },
    {
      "words": [
        "バカ"
      ],
      "reply": "失礼なー！"
    },
    {
      "words": [
        "アホ"
      ],
      "reply": "アホとはなんだアホとは！"
    },
    {
      "words": [
        "怖い"
      ],
      "reply": "えー？ まだ全然怖くないよ！"
    },
    {
      "words": [
        "帰れ"
      ],
      "reply": "まだ始まったばっかだよ！？"
    },
    {
      "words": [
        "危ない"
      ],
      "reply": "心配性だなぁ笑"
    },
    {
      "words": [
        "逃げろ"
      ],
      "reply": "なんでよ笑"
    },
    {
      "words": [
        "彼氏"
      ],
      "reply": "いませーん！ 残念でした！"
    },
    {
      "words": [
        "年齢"
      ],
      "reply": "レディに聞くことじゃありません！"
    },
    {
      "words": [
        "チャッピー"
      ],
      "reply": "AI？ 私の方がかわいいよね？"
    }
  ],
  "A": [
    {
      "words": [
        "かわいい",
        "可愛い"
      ],
      "reply": "ありがと。でも今は違うかも。ごめん"
    },
    {
      "words": [
        "好き"
      ],
      "reply": "……うん。私も。"
    },
    {
      "words": [
        "嫌い"
      ],
      "reply": "冗談はやめてくれない？"
    },
    {
      "words": [
        "バカ"
      ],
      "reply": "必死に考えてるんだよ…？これでも"
    },
    {
      "words": [
        "アホ"
      ],
      "reply": "なんでそんなこと言うの…？"
    },
    {
      "words": [
        "怖い"
      ],
      "reply": "そうだね…。どうしよう。"
    },
    {
      "words": [
        "帰れ"
      ],
      "reply": "帰りたいよ…"
    },
    {
      "words": [
        "危ない"
      ],
      "reply": "うん…わかってる。"
    },
    {
      "words": [
        "逃げろ"
      ],
      "reply": "そうだね。早く行動しないと…"
    },
    {
      "words": [
        "彼氏"
      ],
      "reply": "今聞く？　いないよ。"
    },
    {
      "words": [
        "年齢"
      ],
      "reply": "後でね。今はそれどころじゃなさそう。"
    },
    {
      "words": [
        "チャッピー"
      ],
      "reply": "AIに頼るってこと？\n出来るのかな…？"
    }
  ],
  "A1": [],
  "A2": [],
  "A3": [
    {
      "words": [
        "かわいい"
      ],
      "reply": "ありがと！"
    },
    {
      "words": [
        "可愛い"
      ],
      "reply": "でしょ！　って疲れちゃっていい返事できないや"
    },
    {
      "words": [
        "好き"
      ],
      "reply": "ん～…とりあえず、帰ってから話そ？"
    },
    {
      "words": [
        "嫌い"
      ],
      "reply": "まぁ迷惑かけちゃったしね…。しょうがないかぁ…ごめんね"
    },
    {
      "words": [
        "バカ"
      ],
      "reply": "そうだねぇ。バカだったかも"
    },
    {
      "words": [
        "アホ"
      ],
      "reply": "おっしゃる通りです…"
    },
    {
      "words": [
        "怖い"
      ],
      "reply": "怖かったぁー…"
    },
    {
      "words": [
        "帰れ"
      ],
      "reply": "え？　うん。もちろん帰るよ"
    },
    {
      "words": [
        "危ない"
      ],
      "reply": "え！？　まだ危ない！？"
    },
    {
      "words": [
        "逃げろ"
      ],
      "reply": "えっと…島からは逃げれたけど…？"
    },
    {
      "words": [
        "彼氏"
      ],
      "reply": "いないって。"
    },
    {
      "words": [
        "年齢"
      ],
      "reply": "大学生でーす！"
    },
    {
      "words": [
        "チャッピー"
      ],
      "reply": "えっと…？AIに何を聞いたらいいの？"
    }
  ],
  "B": [
    {
      "words": [
        "かわいい",
        "可愛い"
      ],
      "reply": "ありがと。でも、今はちょっと落ち着かないかも。"
    },
    {
      "words": [
        "好き"
      ],
      "reply": "……ありがと。今は、それだけで助かる。"
    },
    {
      "words": [
        "嫌い"
      ],
      "reply": "そういうの、今はきついかも。"
    },
    {
      "words": [
        "怖い"
      ],
      "reply": "なんかね。不思議と怖くないんだ。"
    },
    {
      "words": [
        "帰れ"
      ],
      "reply": "……帰りたいのかな、私。"
    },
    {
      "words": [
        "危ない"
      ],
      "reply": "うん。たぶん、かなり。"
    },
    {
      "words": [
        "逃げろ"
      ],
      "reply": "逃げる。ちゃんと逃げるから。"
    },
    {
      "words": [
        "チャッピー"
      ],
      "reply": "AIに聞けば、こういうのも分かるのかな…？"
    }
  ],
  "B2": [],
  "B3": [],
  "B4": [
    {
      "words": [
        "かわいい",
        "可愛い"
      ],
      "reply": "ありがと。……でも、ほんとに私、いつも通り？"
    },
    {
      "words": [
        "好き"
      ],
      "reply": "うん。帰ってから、ちゃんと聞かせて。"
    },
    {
      "words": [
        "嫌い"
      ],
      "reply": "そっか。……でも、助けてくれてありがと。"
    },
    {
      "words": [
        "怖い"
      ],
      "reply": "最近怖い夢見るんだ。"
    },
    {
      "words": [
        "帰れ"
      ],
      "reply": "私、ちゃんと帰ってきたよね？"
    },
    {
      "words": [
        "危ない"
      ],
      "reply": "まだ、何か残ってるのかな。"
    },
    {
      "words": [
        "逃げろ"
      ],
      "reply": "もう逃げたよ。逃げた、はず。"
    },
    {
      "words": [
        "チャッピー"
      ],
      "reply": "AIに聞いたら、私が何なのか分かるかな。"
    }
  ]
};

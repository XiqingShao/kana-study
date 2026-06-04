const columns = ["あ段", "い段", "う段", "え段", "お段"];

const rowData = [
  {
    label: "あ行",
    cells: [
      ["a", "あ", "ア", "清晰张口，类似中文“啊”的开口音。", "把嘴自然打开，声音短而干净。"],
      ["i", "い", "イ", "嘴角轻轻向两边拉，类似短促的“衣”。", "像在微笑时发一个轻短的 i。"],
      ["u", "う", "ウ", "嘴唇放松微收，不要读成中文很圆的“乌”。", "声音收小一点，保持轻。"],
      ["e", "え", "エ", "介于中文“诶”和“欸”之间，口型不要太大。", "像答应别人时短短的“欸”。"],
      ["o", "お", "オ", "嘴唇自然成圆，短促有力。", "像惊讶时轻声说“哦”。"],
    ],
  },
  {
    label: "か行",
    cells: [
      ["ka", "か", "カ", "清音 k + a 的组合，发音短促有力，类似“卡”的开头音。", "像“蚂蚁（かあり）”的“か”，小小的“か”，开口发“卡”。"],
      ["ki", "き", "キ", "清音「k」+「i」，类似“ki”，不要拖长。", "き 像一把钥匙 key，读音也接近 ki。"],
      ["ku", "く", "ク", "清音「k」+「u」，嘴型比中文“哭”更轻。", "く 像一个弯钩，轻轻读 ku。"],
      ["ke", "け", "ケ", "清音「k」+「e」，接近短促的“开”前半。", "け 像开口的一笔，记成 ke。"],
      ["ko", "こ", "コ", "清音「k」+「o」，短促地读 ko。", "こ 像两条横线，读 ko。"],
    ],
  },
  {
    label: "さ行",
    cells: [
      ["sa", "さ", "サ", "清音「s」+「a」，接近短促的“撒”。", "さ 像有人弯腰撒种子，读 sa。"],
      ["shi", "し", "シ", "读 shi，不读 si，舌位轻。", "し 像弯弯的吸管，吸气读 shi。"],
      ["su", "す", "ス", "读 su，嘴唇不要过度圆。", "す 像一个小漩涡，轻轻读 su。"],
      ["se", "せ", "セ", "读 se，接近短促的“塞”前半。", "せ 像十字路口，读 se。"],
      ["so", "そ", "ソ", "读 so，收尾干净。", "そ 像一条折线，读 so。"],
    ],
  },
  {
    label: "た行",
    cells: [
      ["ta", "た", "タ", "清音「t」+「a」，接近“他”的短音。", "た 像写了一半的“太”，读 ta。"],
      ["chi", "ち", "チ", "读 chi，不读 ti。", "ち 像数字 5 的弯，读 chi。"],
      ["tsu", "つ", "ツ", "读 tsu，先轻轻送出 ts 再接 u。", "つ 像一只弯月，读 tsu。"],
      ["te", "て", "テ", "读 te，短促清楚。", "て 像伸出的手，te 和“手”相近。"],
      ["to", "と", "ト", "读 to，类似短促的“托”。", "と 像一个钩子托住点，读 to。"],
    ],
  },
  {
    label: "な行",
    cells: [
      ["na", "な", "ナ", "鼻音「n」+「a」，读 na。", "な 像一个结，读 na。"],
      ["ni", "に", "ニ", "鼻音「n」+「i」，读 ni。", "に 像两条线，二的日语读音里有 ni。"],
      ["nu", "ぬ", "ヌ", "鼻音「n」+「u」，读 nu。", "ぬ 像打了一个结的线团，读 nu。"],
      ["ne", "ね", "ネ", "鼻音「n」+「e」，读 ne。", "ね 像猫的尾巴，日语猫是 neko。"],
      ["no", "の", "ノ", "鼻音「n」+「o」，读 no。", "の 像一个圆圈，读 no。"],
    ],
  },
  {
    label: "は行",
    cells: [
      ["ha", "は", "ハ", "轻送气「h」+「a」，读 ha。", "は 像一片叶子，读 ha。"],
      ["hi", "ひ", "ヒ", "轻送气「h」+「i」，读 hi。", "ひ 像笑起来的嘴角，读 hi。"],
      ["fu", "ふ", "フ", "读 fu，气流比中文“夫”更轻。", "ふ 像轻轻吹气，读 fu。"],
      ["he", "へ", "ヘ", "读 he，像一个小山坡。", "へ 本身像山坡，读 he。"],
      ["ho", "ほ", "ホ", "读 ho，短促清楚。", "ほ 像木牌旁加一点，读 ho。"],
    ],
  },
  {
    label: "ま行",
    cells: [
      ["ma", "ま", "マ", "双唇音「m」+「a」，读 ma。", "ま 像马的缰绳，读 ma。"],
      ["mi", "み", "ミ", "双唇音「m」+「i」，读 mi。", "み 像弯弯的鱼钩，读 mi。"],
      ["mu", "む", "ム", "双唇音「m」+「u」，读 mu。", "む 像打结的线，读 mu。"],
      ["me", "め", "メ", "双唇音「m」+「e」，读 me。", "め 像眼睛的形状，日语眼睛是 me。"],
      ["mo", "も", "モ", "双唇音「m」+「o」，读 mo。", "も 像毛线的弯，读 mo。"],
    ],
  },
  {
    label: "や行",
    cells: [
      ["ya", "や", "ヤ", "半元音「y」+「a」，读 ya。", "や 像叉开的树枝，读 ya。"],
      null,
      ["yu", "ゆ", "ユ", "半元音「y」+「u」，读 yu。", "ゆ 像温泉符号，ゆ 来自日语热水。"],
      null,
      ["yo", "よ", "ヨ", "半元音「y」+「o」，读 yo。", "よ 像一把钥匙，读 yo。"],
    ],
  },
  {
    label: "ら行",
    cells: [
      ["ra", "ら", "ラ", "舌尖轻弹，介于 l 和 r 之间，读 ra。", "ら 像拉开的线，读 ra。"],
      ["ri", "り", "リ", "舌尖轻弹，读 ri。", "り 像两根竖线，读 ri。"],
      ["ru", "る", "ル", "舌尖轻弹，读 ru。", "る 像一个小环，读 ru。"],
      ["re", "れ", "レ", "舌尖轻弹，读 re。", "れ 像弯出的枝条，读 re。"],
      ["ro", "ろ", "ロ", "舌尖轻弹，读 ro。", "ろ 像数字 3 的转弯，读 ro。"],
    ],
  },
  {
    label: "わ行",
    cells: [
      ["wa", "わ", "ワ", "半元音「w」+「a」，读 wa。", "わ 像一条绕开的线，读 wa。"],
      null,
      ["n", "ん", "ン", "鼻音 n，单独成拍，收在鼻腔。", "ん 像一个收尾符号，读 n。"],
      null,
      ["o", "を", "ヲ", "助词中常读 o，书写为 を。", "を 多用于助词，读音记成 o。"],
    ],
  },
];

function makeKana([romaji, hiragana, katakana, pronunciation, memory], rowLabel, columnLabel) {
  return {
    id: romaji,
    romaji,
    hiragana,
    katakana,
    pronunciation,
    memory,
    rowLabel,
    columnLabel,
  };
}

export const gojuonColumns = columns;

export const gojuonRows = rowData.map((row) => ({
  label: row.label,
  cells: row.cells.map((cell, index) => (
    cell ? makeKana(cell, row.label, columns[index]) : null
  )),
}));

export const allKana = gojuonRows.flatMap((row) => row.cells.filter(Boolean));

export function getKanaById(id) {
  const kana = allKana.find((item) => item.id === id);
  if (!kana) {
    throw new Error(`Unknown kana id: ${id}`);
  }
  return kana;
}

export function buildQuizChoices(target) {
  const targetIndex = allKana.findIndex((item) => item.id === target.id);
  const offsets = [7, 13, 23];
  const distractors = offsets.map((offset) => allKana[(targetIndex + offset) % allKana.length]);
  const choices = [target, ...distractors].map((item) => ({
    label: item.romaji,
    value: item.romaji,
  }));

  return [...choices].sort((a, b) => a.label.localeCompare(b.label));
}

export function gradeQuizAnswer(target, answer) {
  const correct = target.romaji === answer;

  return {
    correct,
    message: correct
      ? `答对了，是 ${target.romaji}。`
      : `再看一眼，${target.hiragana} 的读音是 ${target.romaji}。`,
  };
}

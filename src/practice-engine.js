import { allKana, getKanaById } from "./kana-data.js";

const allQuestionTypes = [
  "kana-to-romaji",
  "katakana-to-romaji",
  "romaji-to-kana",
  "romaji-to-katakana",
  "hiragana-to-katakana",
  "katakana-to-hiragana",
];

const romajiPromptTypes = new Set(["romaji-to-kana", "romaji-to-katakana"]);

export const practiceModes = [
  {
    id: "random50",
    title: "随机 50 题",
    eyebrow: "平假名 / 片假名混合",
    questionCount: 50,
    description: "覆盖全表并随机加练，混合认读、罗马音和假名互换。",
  },
  {
    id: "mastery",
    title: "全会挑战",
    eyebrow: "一轮清空全表",
    questionCount: allKana.length,
    description: "每个基础假名至少出现一次，错一题就继续回炉。",
  },
];

function getPracticeMode(modeId) {
  const mode = practiceModes.find((item) => item.id === modeId);
  if (!mode) {
    throw new Error(`Unknown practice mode: ${modeId}`);
  }
  return mode;
}

function hashSeed(seed) {
  const seedText = String(seed);
  let hash = 2166136261;

  for (let index = 0; index < seedText.length; index += 1) {
    hash ^= seedText.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function createRandom(seed) {
  let state = hashSeed(seed) || 0x9e3779b9;

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleItems(items, random) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function pickKanaForSession(sourceKana, count, random) {
  const pickedKana = [];

  while (pickedKana.length < count) {
    const nextRound = shuffleItems(sourceKana, random);
    pickedKana.push(...nextRound.slice(0, count - pickedKana.length));
  }

  return pickedKana;
}

function hasUniqueRomaji(kana) {
  return allKana.filter((item) => item.romaji === kana.romaji).length === 1;
}

function normalizeQuestionType(kana, type) {
  if (romajiPromptTypes.has(type) && !hasUniqueRomaji(kana)) {
    return type === "romaji-to-katakana" ? "hiragana-to-katakana" : "katakana-to-hiragana";
  }
  return type;
}

function choiceValue(kana, type) {
  switch (type) {
    case "kana-to-romaji":
    case "katakana-to-romaji":
      return kana.romaji;
    case "romaji-to-katakana":
    case "hiragana-to-katakana":
      return kana.katakana;
    case "romaji-to-kana":
    case "katakana-to-hiragana":
    default:
      return kana.hiragana;
  }
}

function choiceLabel(kana, type) {
  return choiceValue(kana, type);
}

function choiceSubLabel(kana, type) {
  switch (type) {
    case "kana-to-romaji":
      return kana.katakana;
    case "katakana-to-romaji":
      return kana.hiragana;
    case "romaji-to-kana":
      return kana.katakana;
    case "romaji-to-katakana":
      return kana.hiragana;
    case "hiragana-to-katakana":
    case "katakana-to-hiragana":
    default:
      return kana.romaji;
  }
}

function getQuestionCopy(kana, type) {
  switch (type) {
    case "katakana-to-romaji":
      return {
        typeLabel: "片假名认读",
        instruction: "看片假名，选择正确的罗马音",
        prompt: kana.katakana,
        promptSub: `平假名 ${kana.hiragana}`,
      };
    case "romaji-to-kana":
      return {
        typeLabel: "罗马音 -> 平假名",
        instruction: "看罗马音，选择对应的平假名",
        prompt: kana.romaji,
        promptSub: `片假名 ${kana.katakana}`,
      };
    case "romaji-to-katakana":
      return {
        typeLabel: "罗马音 -> 片假名",
        instruction: "看罗马音，选择对应的片假名",
        prompt: kana.romaji,
        promptSub: `平假名 ${kana.hiragana}`,
      };
    case "hiragana-to-katakana":
      return {
        typeLabel: "平假名 -> 片假名",
        instruction: "看平假名，选择对应的片假名",
        prompt: kana.hiragana,
        promptSub: kana.romaji,
      };
    case "katakana-to-hiragana":
      return {
        typeLabel: "片假名 -> 平假名",
        instruction: "看片假名，选择对应的平假名",
        prompt: kana.katakana,
        promptSub: kana.romaji,
      };
    case "kana-to-romaji":
    default:
      return {
        typeLabel: "平假名认读",
        instruction: "看平假名，选择正确的罗马音",
        prompt: kana.hiragana,
        promptSub: `片假名 ${kana.katakana}`,
      };
  }
}

function buildPracticeChoices(kana, type, questionIndex) {
  const targetIndex = allKana.findIndex((item) => item.id === kana.id);
  const offsets = [0, 7, 13, 23, 31, 39, 43, 5, 17];
  const choices = [];
  const usedValues = new Set();

  for (const offset of offsets) {
    const candidate = offset === 0
      ? kana
      : allKana[(targetIndex + offset + questionIndex) % allKana.length];
    const value = choiceValue(candidate, type);

    if (usedValues.has(value)) {
      continue;
    }

    usedValues.add(value);
    choices.push({
      label: choiceLabel(candidate, type),
      subLabel: choiceSubLabel(candidate, type),
      value,
    });

    if (choices.length === 4) {
      break;
    }
  }

  return choices.sort((a, b) => a.value.localeCompare(b.value, "ja"));
}

function buildPracticeQuestion(kana, index, requestedType) {
  const type = normalizeQuestionType(kana, requestedType);
  const copy = getQuestionCopy(kana, type);
  const correctValue = choiceValue(kana, type);

  return {
    id: `${kana.id}-${type}-${index}`,
    type,
    ...copy,
    choices: buildPracticeChoices(kana, type, index),
    correctValue,
    kana,
  };
}

function createQuestionTypeDeck(count, random) {
  const typeDeck = [];

  while (typeDeck.length < count) {
    typeDeck.push(...shuffleItems(allQuestionTypes, random));
  }

  return typeDeck.slice(0, count);
}

function createSession(mode, questionEntries, preferredTypes = allQuestionTypes) {
  return {
    status: "active",
    mode,
    currentIndex: 0,
    answers: [],
    questions: questionEntries.map((entry, index) => {
      const kana = entry.kana ?? entry;
      const questionType = entry.questionType ?? preferredTypes[index % preferredTypes.length];
      return buildPracticeQuestion(kana, index, questionType);
    }),
  };
}

export function createPracticeSession(modeId, options = {}) {
  const mode = getPracticeMode(modeId);
  const seed = options.seed ?? `${mode.id}-${Date.now()}-${Math.random()}`;
  const random = createRandom(seed);
  const kanaList = pickKanaForSession(allKana, mode.questionCount, random);
  const questionTypes = createQuestionTypeDeck(mode.questionCount, random);

  return createSession(mode, kanaList, questionTypes);
}

export function gradePracticeAnswer(question, selectedValue) {
  const isCorrect = question.correctValue === selectedValue;
  const selectedChoice = question.choices.find((choice) => choice.value === selectedValue);
  const correctLabel = question.choices.find((choice) => choice.value === question.correctValue)?.label ?? question.correctValue;
  const kanaLabel = `${question.kana.hiragana} / ${question.kana.katakana} / ${question.kana.romaji}`;

  return {
    questionId: question.id,
    questionType: question.type,
    kanaId: question.kana.id,
    selectedValue,
    selectedLabel: selectedChoice?.label ?? selectedValue,
    correctValue: question.correctValue,
    correctLabel,
    questionTypeLabel: question.typeLabel,
    isCorrect,
    kana: question.kana,
    message: isCorrect
      ? `答对了，是 ${correctLabel}。`
      : `再看一眼，正确答案是 ${correctLabel}（${kanaLabel}）。`,
  };
}

export function summarizePracticeSession(session, answers) {
  const correctCount = answers.filter((answer) => answer.isCorrect).length;
  const wrongAnswers = answers.filter((answer) => !answer.isCorrect);
  const total = session.questions.length;
  const isMastered = total > 0 && answers.length === total && wrongAnswers.length === 0;

  return {
    total,
    answered: answers.length,
    correctCount,
    wrongCount: wrongAnswers.length,
    accuracy: total > 0 ? Math.round((correctCount / total) * 100) : 0,
    isMastered,
    statusLabel: isMastered ? "全会" : "未完成",
    wrongAnswers,
  };
}

export function createMistakePracticeSession(wrongAnswers) {
  const wrongQuestionEntries = [];
  const seenQuestions = new Set();

  for (const answer of wrongAnswers.filter((item) => !item.isCorrect)) {
    const kanaId = answer.kanaId ?? answer.kana?.id;
    const questionType = allQuestionTypes.includes(answer.questionType)
      ? answer.questionType
      : "kana-to-romaji";
    const questionKey = `${kanaId}:${questionType}`;

    if (!kanaId || seenQuestions.has(questionKey)) {
      continue;
    }

    seenQuestions.add(questionKey);
    wrongQuestionEntries.push({
      kana: getKanaById(kanaId),
      questionType,
    });
  }

  return createSession(
    {
      id: "mistakes",
      title: "错题重练",
      eyebrow: "按题型回炉",
      questionCount: wrongQuestionEntries.length,
      description: "保留刚才答错的假名和题型，再快速过一遍。",
    },
    wrongQuestionEntries,
  );
}

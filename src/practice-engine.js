import { allKana, getKanaById } from "./kana-data.js";

const starterRows = new Set(["あ行", "か行", "さ行"]);
const questionTypes = ["kana-to-romaji", "romaji-to-kana"];

export const practiceModes = [
  {
    id: "starter",
    title: "入门 10 题",
    eyebrow: "先把前三行练熟",
    questionCount: 10,
    description: "从あ行、か行、さ行开始，适合第一次集中做题。",
  },
  {
    id: "full",
    title: "全表 20 题",
    eyebrow: "基础五十音混合",
    questionCount: 20,
    description: "覆盖基础五十音，混合考读音和假名识别。",
  },
];

function getPracticeMode(modeId) {
  const mode = practiceModes.find((item) => item.id === modeId);
  if (!mode) {
    throw new Error(`Unknown practice mode: ${modeId}`);
  }
  return mode;
}

function getModeKana(modeId) {
  if (modeId === "starter") {
    return allKana.filter((kana) => starterRows.has(kana.rowLabel));
  }
  return allKana;
}

function hasUniqueRomaji(kana) {
  return allKana.filter((item) => item.romaji === kana.romaji).length === 1;
}

function normalizeQuestionType(kana, type) {
  if (type === "romaji-to-kana" && !hasUniqueRomaji(kana)) {
    return "kana-to-romaji";
  }
  return type;
}

function choiceValue(kana, type) {
  return type === "kana-to-romaji" ? kana.romaji : kana.hiragana;
}

function choiceLabel(kana, type) {
  return type === "kana-to-romaji" ? kana.romaji : kana.hiragana;
}

function choiceSubLabel(kana, type) {
  return type === "kana-to-romaji" ? kana.hiragana : kana.romaji;
}

function buildPracticeChoices(kana, type, questionIndex) {
  const offsets = [0, 7, 13, 23, 31, 39, 43, 5, 17];
  const choices = [];
  const usedValues = new Set();

  for (const offset of offsets) {
    const candidate = offset === 0
      ? kana
      : allKana[(allKana.findIndex((item) => item.id === kana.id) + offset + questionIndex) % allKana.length];
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
  const correctValue = choiceValue(kana, type);
  const isKanaPrompt = type === "kana-to-romaji";

  return {
    id: `${kana.id}-${type}-${index}`,
    type,
    typeLabel: isKanaPrompt ? "假名认读" : "罗马音辨认",
    instruction: isKanaPrompt ? "选择正确的罗马音" : "选择对应的平假名",
    prompt: isKanaPrompt ? kana.hiragana : kana.romaji,
    promptSub: isKanaPrompt ? kana.katakana : `${kana.hiragana} / ${kana.katakana}`,
    choices: buildPracticeChoices(kana, type, index),
    correctValue,
    kana,
  };
}

function pickKanaForSession(sourceKana, count) {
  if (sourceKana.length <= count) {
    return sourceKana.slice(0, count);
  }

  return Array.from({ length: count }, (_, index) => sourceKana[(index * 3) % sourceKana.length]);
}

function createSession(mode, kanaList, preferredTypes = questionTypes) {
  return {
    status: "active",
    mode,
    currentIndex: 0,
    answers: [],
    questions: kanaList.map((kana, index) => (
      buildPracticeQuestion(kana, index, preferredTypes[index % preferredTypes.length])
    )),
  };
}

export function createPracticeSession(modeId) {
  const mode = getPracticeMode(modeId);
  const sourceKana = getModeKana(mode.id);
  const kanaList = pickKanaForSession(sourceKana, mode.questionCount);

  return createSession(mode, kanaList);
}

export function gradePracticeAnswer(question, selectedValue) {
  const isCorrect = question.correctValue === selectedValue;
  const selectedChoice = question.choices.find((choice) => choice.value === selectedValue);

  return {
    questionId: question.id,
    questionType: question.type,
    kanaId: question.kana.id,
    selectedValue,
    selectedLabel: selectedChoice?.label ?? selectedValue,
    correctValue: question.correctValue,
    correctLabel: question.choices.find((choice) => choice.value === question.correctValue)?.label ?? question.correctValue,
    isCorrect,
    kana: question.kana,
    message: isCorrect
      ? `答对了，是 ${question.correctValue}。`
      : `再看一眼，${question.kana.hiragana} 的答案是 ${question.correctValue}。`,
  };
}

export function summarizePracticeSession(session, answers) {
  const correctCount = answers.filter((answer) => answer.isCorrect).length;
  const wrongAnswers = answers.filter((answer) => !answer.isCorrect);
  const total = session.questions.length;

  return {
    total,
    answered: answers.length,
    correctCount,
    wrongCount: wrongAnswers.length,
    accuracy: total > 0 ? Math.round((correctCount / total) * 100) : 0,
    wrongAnswers,
  };
}

export function createMistakePracticeSession(wrongAnswers) {
  const wrongKana = [];
  const seenKana = new Set();

  for (const answer of wrongAnswers.filter((item) => !item.isCorrect)) {
    if (seenKana.has(answer.kanaId)) {
      continue;
    }

    seenKana.add(answer.kanaId);
    wrongKana.push(getKanaById(answer.kanaId));
  }

  return createSession(
    {
      id: "mistakes",
      title: "错题重练",
      eyebrow: "只练刚才答错的",
      questionCount: wrongKana.length,
      description: "把本轮错题单独拿出来，再快速过一遍。",
    },
    wrongKana,
  );
}

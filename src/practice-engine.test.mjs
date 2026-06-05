import test from "node:test";
import assert from "node:assert/strict";

import { allKana, getKanaById } from "./kana-data.js";
import {
  createMistakePracticeSession,
  createPracticeSession,
  gradePracticeAnswer,
  practiceModes,
  practiceScopes,
  summarizePracticeSession,
} from "./practice-engine.js";

test("practice modes define random quiz and mastery entry points", () => {
  assert.deepEqual(
    practiceModes.map((mode) => [mode.id, mode.questionCount]),
    [
      ["random50", 50],
      ["mastery", allKana.length],
    ],
  );
});

test("practice scopes separate mixed, hiragana, and katakana drills", () => {
  assert.deepEqual(
    practiceScopes.map((scope) => scope.id),
    ["all", "hiragana", "katakana"],
  );

  const hiraganaSession = createPracticeSession("random50", { seed: "hiragana-only", scope: "hiragana" });
  const katakanaSession = createPracticeSession("random50", { seed: "katakana-only", scope: "katakana" });

  assert.equal(hiraganaSession.scope.id, "hiragana");
  assert.equal(katakanaSession.scope.id, "katakana");
  assert.deepEqual(
    new Set(hiraganaSession.questions.map((question) => question.type)),
    new Set(["kana-to-romaji", "romaji-to-kana"]),
  );
  assert.deepEqual(
    new Set(katakanaSession.questions.map((question) => question.type)),
    new Set(["katakana-to-romaji", "romaji-to-katakana"]),
  );
});

test("random practice creates 50 seeded questions with separated kana question types", () => {
  const session = createPracticeSession("random50", { seed: "kana-50" });
  const sameSeedSession = createPracticeSession("random50", { seed: "kana-50" });
  const otherSeedSession = createPracticeSession("random50", { seed: "other-seed" });

  assert.equal(session.status, "active");
  assert.equal(session.mode.id, "random50");
  assert.equal(session.questions.length, 50);
  assert.equal(session.currentIndex, 0);

  assert.deepEqual(
    session.questions.map((question) => question.id),
    sameSeedSession.questions.map((question) => question.id),
  );
  assert.notDeepEqual(
    session.questions.map((question) => question.id),
    otherSeedSession.questions.map((question) => question.id),
  );
  assert.equal(new Set(session.questions.map((question) => question.kana.id)).size, allKana.length);

  const questionTypeSet = new Set(session.questions.map((question) => question.type));
  for (const expectedType of [
    "kana-to-romaji",
    "katakana-to-romaji",
    "romaji-to-kana",
    "romaji-to-katakana",
    "hiragana-to-katakana",
    "katakana-to-hiragana",
  ]) {
    assert.ok(questionTypeSet.has(expectedType), `missing ${expectedType}`);
  }

  for (const question of session.questions) {
    assert.equal(question.choices.length, 4);
    assert.ok(question.choices.some((choice) => choice.value === question.correctValue));
    assert.ok(question.kana.hiragana);
    assert.ok(question.kana.katakana);
    assert.ok(question.kana.romaji);
  }
});

test("practice grading records answers and summary collects wrong answers", () => {
  const session = createPracticeSession("random50", { seed: "grading" });
  const correctQuestion = session.questions[0];
  const wrongQuestion = session.questions[1];
  const wrongChoice = wrongQuestion.choices.find((choice) => choice.value !== wrongQuestion.correctValue);

  const answers = [
    gradePracticeAnswer(correctQuestion, correctQuestion.correctValue),
    gradePracticeAnswer(wrongQuestion, wrongChoice.value),
  ];
  const summary = summarizePracticeSession(session, answers);

  assert.equal(answers[0].isCorrect, true);
  assert.equal(answers[1].isCorrect, false);
  assert.equal(summary.total, 50);
  assert.equal(summary.answered, 2);
  assert.equal(summary.correctCount, 1);
  assert.equal(summary.isMastered, false);
  assert.equal(summary.statusLabel, "未完成");
  assert.equal(summary.wrongAnswers.length, 1);
  assert.equal(summary.wrongAnswers[0].kanaId, wrongQuestion.kana.id);
});

test("summary groups wrong answers by question type for review", () => {
  const session = createPracticeSession("random50", { seed: "review-groups" });
  const wrongQuestions = [
    session.questions.find((question) => question.type === "kana-to-romaji"),
    session.questions.find((question) => question.type === "kana-to-romaji" && question.kana.id !== session.questions.find((item) => item.type === "kana-to-romaji").kana.id),
    session.questions.find((question) => question.type === "katakana-to-romaji"),
  ];
  const answers = wrongQuestions.map((question) => {
    const wrongChoice = question.choices.find((choice) => choice.value !== question.correctValue);
    return gradePracticeAnswer(question, wrongChoice.value);
  });
  const summary = summarizePracticeSession(session, answers);

  assert.deepEqual(
    summary.wrongTypeGroups.map((group) => [group.type, group.label, group.count]),
    [
      ["kana-to-romaji", "平假名认读", 2],
      ["katakana-to-romaji", "片假名认读", 1],
    ],
  );
});

test("summary marks a fully correct completed session as mastered", () => {
  const session = createPracticeSession("mastery", { seed: "mastered" });
  const answers = session.questions.map((question) => gradePracticeAnswer(question, question.correctValue));
  const summary = summarizePracticeSession(session, answers);

  assert.equal(summary.total, allKana.length);
  assert.equal(summary.correctCount, allKana.length);
  assert.equal(summary.wrongCount, 0);
  assert.equal(summary.isMastered, true);
  assert.equal(summary.statusLabel, "全会");
});

test("mistake practice preserves kana and question type pairs", () => {
  const wrongAnswers = [
    {
      kanaId: "ka",
      questionType: "kana-to-romaji",
      isCorrect: false,
    },
    {
      kanaId: "ka",
      questionType: "katakana-to-hiragana",
      isCorrect: false,
    },
    {
      kanaId: "ka",
      questionType: "kana-to-romaji",
      isCorrect: false,
    },
    {
      kanaId: "su",
      questionType: "romaji-to-katakana",
      isCorrect: false,
    },
  ];
  const session = createMistakePracticeSession(wrongAnswers);

  assert.equal(session.mode.id, "mistakes");
  assert.equal(session.questions.length, 3);
  assert.deepEqual(
    session.questions.map((question) => [question.kana.id, question.type]),
    [
      ["ka", "kana-to-romaji"],
      ["ka", "katakana-to-hiragana"],
      ["su", "romaji-to-katakana"],
    ],
  );
  assert.deepEqual(
    session.questions.map((question) => question.kana.hiragana),
    [getKanaById("ka").hiragana, getKanaById("ka").hiragana, getKanaById("su").hiragana],
  );
});

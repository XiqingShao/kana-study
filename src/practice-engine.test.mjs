import test from "node:test";
import assert from "node:assert/strict";

import { getKanaById } from "./kana-data.js";
import {
  createMistakePracticeSession,
  createPracticeSession,
  gradePracticeAnswer,
  practiceModes,
  summarizePracticeSession,
} from "./practice-engine.js";

test("practice modes define starter and full quiz entry points", () => {
  assert.deepEqual(
    practiceModes.map((mode) => [mode.id, mode.questionCount]),
    [
      ["starter", 10],
      ["full", 20],
    ],
  );
});

test("starter practice creates a fixed group with mixed question types", () => {
  const session = createPracticeSession("starter");

  assert.equal(session.status, "active");
  assert.equal(session.mode.id, "starter");
  assert.equal(session.questions.length, 10);
  assert.equal(session.currentIndex, 0);
  assert.deepEqual(new Set(session.questions.map((question) => question.type)), new Set([
    "kana-to-romaji",
    "romaji-to-kana",
  ]));

  for (const question of session.questions) {
    assert.equal(question.choices.length, 4);
    assert.ok(question.choices.some((choice) => choice.value === question.correctValue));
    assert.ok(question.kana.hiragana);
    assert.ok(question.kana.romaji);
  }
});

test("practice grading records answers and summary collects wrong answers", () => {
  const session = createPracticeSession("starter");
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
  assert.equal(summary.total, 10);
  assert.equal(summary.answered, 2);
  assert.equal(summary.correctCount, 1);
  assert.equal(summary.wrongAnswers.length, 1);
  assert.equal(summary.wrongAnswers[0].kanaId, wrongQuestion.kana.id);
});

test("mistake practice rebuilds a session from wrong kana only", () => {
  const wrongAnswers = [
    {
      kanaId: "ka",
      questionType: "kana-to-romaji",
      isCorrect: false,
    },
    {
      kanaId: "su",
      questionType: "romaji-to-kana",
      isCorrect: false,
    },
  ];
  const session = createMistakePracticeSession(wrongAnswers);

  assert.equal(session.mode.id, "mistakes");
  assert.equal(session.questions.length, 2);
  assert.deepEqual(
    session.questions.map((question) => question.kana.id),
    ["ka", "su"],
  );
  assert.deepEqual(
    session.questions.map((question) => question.kana.hiragana),
    [getKanaById("ka").hiragana, getKanaById("su").hiragana],
  );
});

import test from "node:test";
import assert from "node:assert/strict";

import {
  correctAnswerAutoAdvanceDelayMs,
  nextButtonLabel,
  shouldAutoAdvanceAnswer,
} from "./practice-flow.js";

test("only correct answers auto advance", () => {
  assert.equal(shouldAutoAdvanceAnswer(null), false);
  assert.equal(shouldAutoAdvanceAnswer({ isCorrect: false }), false);
  assert.equal(shouldAutoAdvanceAnswer({ isCorrect: true }), true);
  assert.ok(correctAnswerAutoAdvanceDelayMs > 0);
});

test("next button explains auto advance only after correct answers", () => {
  assert.equal(nextButtonLabel({ answer: null, isLastQuestion: false }), "下一题");
  assert.equal(nextButtonLabel({ answer: { isCorrect: false }, isLastQuestion: false }), "下一题");
  assert.equal(nextButtonLabel({ answer: { isCorrect: true }, isLastQuestion: false }), "自动下一题");
  assert.equal(nextButtonLabel({ answer: { isCorrect: true }, isLastQuestion: true }), "自动查看结果");
});

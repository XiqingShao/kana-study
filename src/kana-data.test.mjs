import test from "node:test";
import assert from "node:assert/strict";

import {
  buildQuizChoices,
  getKanaById,
  gojuonRows,
  gradeQuizAnswer,
} from "./kana-data.js";

test("gojuon rows expose the base hiragana chart for study", () => {
  const visibleKana = gojuonRows.flatMap((row) => row.cells.filter(Boolean));
  const ids = visibleKana.map((kana) => kana.id);

  assert.equal(gojuonRows.length, 10);
  assert.ok(visibleKana.length >= 46);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(
    gojuonRows.find((row) => row.label === "か行").cells.slice(0, 5).map((cell) => cell.romaji),
    ["ka", "ki", "ku", "ke", "ko"],
  );
});

test("selected kana includes Chinese-native pronunciation and memory hints", () => {
  const ka = getKanaById("ka");

  assert.equal(ka.hiragana, "か");
  assert.equal(ka.katakana, "カ");
  assert.match(ka.pronunciation, /k \+ a/);
  assert.match(ka.memory, /蚂蚁/);
});

test("quiz choices include the correct answer and grading returns feedback", () => {
  const ka = getKanaById("ka");
  const choices = buildQuizChoices(ka);

  assert.equal(choices.length, 4);
  assert.ok(choices.some((choice) => choice.value === "ka"));
  assert.deepEqual(gradeQuizAnswer(ka, "ka"), {
    correct: true,
    message: "答对了，是 ka。",
  });
  assert.deepEqual(gradeQuizAnswer(ka, "su"), {
    correct: false,
    message: "再看一眼，か 的读音是 ka。",
  });
});

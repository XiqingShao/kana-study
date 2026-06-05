export const correctAnswerAutoAdvanceDelayMs = 650;

export function shouldAutoAdvanceAnswer(answer) {
  return Boolean(answer?.isCorrect);
}

export function nextButtonLabel({ answer, isLastQuestion }) {
  if (answer?.isCorrect) {
    return isLastQuestion ? "自动查看结果" : "自动下一题";
  }

  return isLastQuestion ? "查看结果" : "下一题";
}

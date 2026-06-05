import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Layers,
  Lightbulb,
  PencilLine,
  RotateCcw,
  Volume2,
  XCircle,
} from "lucide-react";

import {
  getKanaById,
  gojuonColumns,
  gojuonRows,
} from "./kana-data.js";
import {
  createMistakePracticeSession,
  createPracticeSession,
  gradePracticeAnswer,
  practiceModes,
  practiceScopes,
  summarizePracticeSession,
} from "./practice-engine.js";
import pronunciationDiagram from "./assets/pronunciation-ka-diagram.jpg";

const studyTabs = [
  { id: "hiragana", label: "平假名", icon: BookOpen },
  { id: "katakana", label: "片假名", icon: Layers },
  { id: "hint", label: "发音提示", icon: Lightbulb },
  { id: "cards", label: "卡片练习", icon: ClipboardList },
  { id: "quiz", label: "练习中心", icon: PencilLine },
];

function speakKana(kana) {
  if (!("speechSynthesis" in window)) {
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(kana.hiragana);
  utterance.lang = "ja-JP";
  utterance.rate = 0.82;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

function TabButton({ tab, active, onSelect }) {
  const Icon = tab.icon;

  return (
    <button
      className={`tab-button ${active ? "is-active" : ""}`}
      type="button"
      aria-pressed={active}
      onClick={() => onSelect(tab.id)}
    >
      <Icon size={19} aria-hidden="true" />
      <span>{tab.label}</span>
    </button>
  );
}

function KanaTable({ selectedKana, onSelectKana }) {
  return (
    <section className="chart-panel" aria-labelledby="chart-title">
      <div className="panel-label tape tape-green" id="chart-title">
        平假名五十音图
      </div>
      <div className="chart-scroll">
        <div className="kana-grid" role="grid" aria-label="平假名五十音图">
          <div className="grid-corner" />
          {gojuonColumns.map((column) => (
            <div className="grid-heading" role="columnheader" key={column}>
              {column}
            </div>
          ))}
          {gojuonRows.map((row) => (
            <div className="grid-row" role="row" key={row.label}>
              <div className="row-heading" role="rowheader">
                {row.label}
              </div>
              {row.cells.map((kana, index) => {
                if (!kana) {
                  return (
                    <div
                      className="kana-cell is-empty"
                      role="gridcell"
                      aria-hidden="true"
                      key={`${row.label}-${index}`}
                    >
                      （ ）
                    </div>
                  );
                }

                const isActive = kana.id === selectedKana.id;
                return (
                  <button
                    className={`kana-cell ${isActive ? "is-selected" : ""}`}
                    type="button"
                    role="gridcell"
                    aria-pressed={isActive}
                    key={kana.id}
                    onClick={() => onSelectKana(kana)}
                  >
                    <span className="kana-symbol">{kana.hiragana}</span>
                    <span className="kana-romaji">{kana.romaji}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <p className="chart-note">已选 {selectedKana.hiragana} / {selectedKana.katakana}</p>
    </section>
  );
}

function StudyCard({ kana, flipped, onFlip, onSpeak }) {
  return (
    <aside className="study-panel" aria-labelledby="study-title">
      <div className="panel-label tape tape-yellow" id="study-title">
        当前学习
      </div>
      <div className={`flash-card ${flipped ? "is-flipped" : ""}`}>
        <div className="kana-display" aria-live="polite">
          <span className="hiragana-large">{flipped ? kana.katakana : kana.hiragana}</span>
          <span className="katakana-large">{flipped ? kana.hiragana : kana.katakana}</span>
          <span className="romaji-large">{kana.romaji}</span>
        </div>
        <div className="divider" />
        <div className="hint-block">
          <div className="hint-title">
            <span>发音提示</span>
            <button className="icon-button" type="button" onClick={onSpeak} aria-label={`播放 ${kana.hiragana} 发音`}>
              <Volume2 size={19} aria-hidden="true" />
            </button>
          </div>
          <div className="hint-body">
            <p>{kana.pronunciation}</p>
            <img src={pronunciationDiagram} alt="" aria-hidden="true" />
          </div>
        </div>
        <div className="divider" />
        <div className="memory-note">
          <div className="memory-title">
            <span>记忆小贴士</span>
            <PencilLine size={18} aria-hidden="true" />
          </div>
          <p>{kana.memory}</p>
        </div>
        <button className="flip-button" type="button" onClick={onFlip}>
          <RotateCcw size={20} aria-hidden="true" />
          <span>{flipped ? "翻回平假名" : "翻转卡片"}</span>
        </button>
      </div>
    </aside>
  );
}

function ModeCard({ mode, onStart }) {
  return (
    <button className="mode-card" type="button" onClick={() => onStart(mode.id)}>
      <span>{mode.eyebrow}</span>
      <strong>{mode.title}</strong>
      <small>{mode.description}</small>
      <b>
        开始
        <ArrowRight size={17} aria-hidden="true" />
      </b>
    </button>
  );
}

function PracticeReady({ activeScope, onRetryMistakes, onScopeChange, onStart, wrongCount }) {
  return (
    <div className="practice-ready">
      <div className="practice-copy">
        <span>今日做题</span>
        <strong>随机 50 题，做完再回炉</strong>
        <p>每轮覆盖全表，混合平假名、片假名和罗马音。结果只看全会或未完成，不需要账号。</p>
      </div>
      <div className="practice-setup">
        <div className="scope-selector" role="group" aria-label="题型筛选">
          {practiceScopes.map((scope) => (
            <button
              className={`scope-button ${scope.id === activeScope ? "is-active" : ""}`}
              type="button"
              aria-pressed={scope.id === activeScope}
              key={scope.id}
              onClick={() => onScopeChange(scope.id)}
            >
              <strong>{scope.label}</strong>
              <span>{scope.description}</span>
            </button>
          ))}
        </div>
        <div className="mode-grid">
          {practiceModes.map((mode) => (
            <ModeCard key={mode.id} mode={mode} onStart={onStart} />
          ))}
          <button
            className={`mode-card mistake-card ${wrongCount === 0 ? "is-disabled" : ""}`}
            type="button"
            disabled={wrongCount === 0}
            onClick={onRetryMistakes}
          >
            <span>刚才错过的</span>
            <strong>错题重练</strong>
            <small>{wrongCount > 0 ? `${wrongCount} 个未完成题需要再看一眼` : "做完一组并答错后会出现"}</small>
            <b>
              重练
              <RotateCcw size={17} aria-hidden="true" />
            </b>
          </button>
        </div>
      </div>
    </div>
  );
}

function PracticeQuestion({ answer, modeTitle, question, questionIndex, total, onAnswer, onNext }) {
  const progress = Math.round(((questionIndex + 1) / total) * 100);

  return (
    <div className="practice-active">
      <div className="practice-progress">
        <em>{modeTitle}</em>
        <span>{question.typeLabel}</span>
        <strong>
          第 {questionIndex + 1} / {total} 题
        </strong>
        <div className="progress-track" aria-hidden="true">
          <i style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="practice-question-card">
        <div className="question-stem">
          <span>{question.instruction}</span>
          <strong>{question.prompt}</strong>
          <small>{question.promptSub}</small>
        </div>

        <div className="choice-row" role="group" aria-label={`${question.prompt} 的选项`}>
          {question.choices.map((choice, index) => {
            const isSelected = choice.value === answer?.selectedValue;
            const showCorrect = answer && choice.value === question.correctValue;
            const showWrong = answer && isSelected && choice.value !== question.correctValue;
            return (
              <button
                className={`choice-button ${isSelected ? "is-selected" : ""} ${showCorrect ? "is-correct" : ""} ${showWrong ? "is-wrong" : ""}`}
                type="button"
                key={choice.value}
                disabled={Boolean(answer)}
                onClick={() => onAnswer(choice.value)}
              >
                <span>{String.fromCharCode(65 + index)}</span>
                <b>{choice.label}</b>
                <small>{choice.subLabel}</small>
              </button>
            );
          })}
        </div>

        <div className={`quiz-feedback ${answer ? "has-answer" : ""}`} aria-live="polite">
          {answer ? (
            answer.isCorrect ? (
              <CheckCircle2 size={18} aria-hidden="true" />
            ) : (
              <XCircle size={18} aria-hidden="true" />
            )
          ) : null}
          <span>{answer?.message ?? "先选一个答案，答完会显示解析。"}</span>
        </div>

        {answer && !answer.isCorrect ? (
          <div className="answer-note">
            <strong>记忆提示</strong>
            <p>{question.kana.memory}</p>
            <small>{question.kana.pronunciation}</small>
          </div>
        ) : null}
      </div>

      <button className="next-button" type="button" disabled={!answer} onClick={onNext}>
        {questionIndex + 1 === total ? "查看结果" : "下一题"}
      </button>
    </div>
  );
}

function PracticeResult({ summary, onRestart, onRetryMistakes }) {
  return (
    <div className="practice-result">
      <div className={`result-score ${summary.isMastered ? "is-mastered" : "is-unfinished"}`}>
        <span>本轮状态</span>
        <strong>{summary.statusLabel}</strong>
        <small>{summary.isMastered ? "这一轮全部答对" : `答对 ${summary.correctCount} / ${summary.total} 题`}</small>
      </div>
      <div className="result-stats">
        <div>
          <span>答对</span>
          <strong>{summary.correctCount}</strong>
        </div>
        <div>
          <span>回炉题</span>
          <strong>{summary.wrongCount}</strong>
        </div>
      </div>
      <div className="result-review">
        <span>错题复盘</span>
        {summary.wrongTypeGroups.length > 0 ? (
          <div className="review-list">
            {summary.wrongTypeGroups.map((group) => (
              <div className="review-item" key={group.type}>
                <strong>{group.label}</strong>
                <small>{group.count} 题</small>
              </div>
            ))}
          </div>
        ) : (
          <p>没有薄弱题型。</p>
        )}
      </div>
      <div className="wrong-list">
        {summary.wrongAnswers.length > 0 ? (
          summary.wrongAnswers.map((item) => (
            <div className="wrong-item" key={item.questionId}>
              <strong>{item.kana.hiragana}</strong>
              <span>{item.kana.katakana}</span>
              <small>{item.kana.romaji}</small>
              <em>{item.questionTypeLabel}</em>
            </div>
          ))
        ) : (
          <p>这一组没有错题，状态就是全会。</p>
        )}
      </div>
      <div className="result-actions">
        <button className="next-button secondary" type="button" onClick={onRestart}>
          再来一组
        </button>
        <button
          className="next-button"
          type="button"
          disabled={summary.wrongAnswers.length === 0}
          onClick={onRetryMistakes}
        >
          {summary.wrongAnswers.length > 0 ? `重练 ${summary.wrongAnswers.length} 个未完成题` : "重练错题"}
        </button>
      </div>
    </div>
  );
}

function PracticePanel({
  activeScope,
  answer,
  lastWrongAnswers,
  question,
  questionIndex,
  session,
  summary,
  onAnswer,
  onNext,
  onRestart,
  onRetryMistakes,
  onScopeChange,
  onStart,
}) {
  return (
    <section className="quiz-panel" aria-labelledby="quiz-title">
      <div className="quiz-title-wrap">
        <div className="panel-label tape tape-blue" id="quiz-title">
          练习中心
        </div>
      </div>
      {!session ? (
        <PracticeReady
          wrongCount={lastWrongAnswers.length}
          onRetryMistakes={onRetryMistakes}
          activeScope={activeScope}
          onScopeChange={onScopeChange}
          onStart={onStart}
        />
      ) : session.status === "result" ? (
        <PracticeResult
          summary={summary}
          onRestart={onRestart}
          onRetryMistakes={onRetryMistakes}
        />
      ) : (
        <PracticeQuestion
          answer={answer}
          modeTitle={session.mode.title}
          question={question}
          questionIndex={questionIndex}
          total={session.questions.length}
          onAnswer={onAnswer}
          onNext={onNext}
        />
      )}
    </section>
  );
}

export function App() {
  const [activeTab, setActiveTab] = useState("hiragana");
  const [selectedKana, setSelectedKana] = useState(() => getKanaById("ka"));
  const [flipped, setFlipped] = useState(false);
  const [practiceSession, setPracticeSession] = useState(null);
  const [practiceAnswer, setPracticeAnswer] = useState(null);
  const [practiceSummary, setPracticeSummary] = useState(null);
  const [lastWrongAnswers, setLastWrongAnswers] = useState([]);
  const [practiceScope, setPracticeScope] = useState("all");

  const currentQuestion = practiceSession?.status === "active"
    ? practiceSession.questions[practiceSession.currentIndex]
    : null;
  const headerCorrect = practiceSession?.answers.filter((answer) => answer.isCorrect).length ?? practiceSummary?.correctCount ?? 0;
  const headerTotal = practiceSession?.questions.length ?? practiceSummary?.total ?? 50;

  function handleSelectKana(kana) {
    setSelectedKana(kana);
    setFlipped(false);
    setActiveTab("hiragana");
  }

  function handleStartPractice(modeId) {
    const nextSession = createPracticeSession(modeId, { scope: practiceScope });
    setPracticeSession(nextSession);
    setPracticeAnswer(null);
    setPracticeSummary(null);
    setSelectedKana(nextSession.questions[0].kana);
    setActiveTab("quiz");
  }

  function handleRetryMistakes() {
    if (lastWrongAnswers.length === 0) {
      return;
    }

    const nextSession = createMistakePracticeSession(lastWrongAnswers);
    if (nextSession.questions.length === 0) {
      return;
    }

    setPracticeSession(nextSession);
    setPracticeAnswer(null);
    setPracticeSummary(null);
    setSelectedKana(nextSession.questions[0].kana);
    setActiveTab("quiz");
  }

  function handlePracticeAnswer(selectedValue) {
    if (!currentQuestion || practiceAnswer) {
      return;
    }

    const answer = gradePracticeAnswer(currentQuestion, selectedValue);
    setPracticeAnswer(answer);
    setPracticeSession((session) => ({
      ...session,
      answers: [...session.answers, answer],
    }));
    setSelectedKana(currentQuestion.kana);
  }

  function handleNextPracticeQuestion() {
    if (!practiceSession || !practiceAnswer) {
      return;
    }

    const nextIndex = practiceSession.currentIndex + 1;
    if (nextIndex >= practiceSession.questions.length) {
      const summary = summarizePracticeSession(practiceSession, practiceSession.answers);
      setPracticeSummary(summary);
      setLastWrongAnswers(summary.wrongAnswers);
      setPracticeSession({
        ...practiceSession,
        status: "result",
      });
      setPracticeAnswer(null);
      return;
    }

    const nextQuestion = practiceSession.questions[nextIndex];
    setPracticeSession({
      ...practiceSession,
      currentIndex: nextIndex,
    });
    setPracticeAnswer(null);
    setSelectedKana(nextQuestion.kana);
  }

  return (
    <main className="notebook-shell">
      <div className="notebook">
        <div className="binding" aria-hidden="true">
          {Array.from({ length: 11 }).map((_, index) => (
            <span key={index} />
          ))}
        </div>
        <div className="paper-tabs" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
        <header className="app-header">
          <div className="brand-block">
            <BookOpen className="brand-icon" size={40} aria-hidden="true" />
            <div>
              <h1>五十音练习</h1>
              <div className="red-underline" />
            </div>
          </div>
          <nav className="study-tabs" aria-label="练习模式">
            {studyTabs.map((tab) => (
              <TabButton
                active={tab.id === activeTab}
                key={tab.id}
                tab={tab}
                onSelect={setActiveTab}
              />
            ))}
          </nav>
          <div className="header-score" aria-label={`本轮答对 ${headerCorrect} 题，共 ${headerTotal} 题`}>
            <span>本轮</span>
            <strong>{headerCorrect}</strong>
            <small>/ {headerTotal}</small>
          </div>
        </header>

        <PracticePanel
          answer={practiceAnswer}
          lastWrongAnswers={lastWrongAnswers}
          activeScope={practiceScope}
          question={currentQuestion}
          questionIndex={practiceSession?.currentIndex ?? 0}
          session={practiceSession}
          summary={practiceSummary}
          onAnswer={handlePracticeAnswer}
          onNext={handleNextPracticeQuestion}
          onRestart={() => handleStartPractice(practiceSession?.mode.id === "mistakes" ? "random50" : practiceSession?.mode.id ?? "random50")}
          onRetryMistakes={handleRetryMistakes}
          onScopeChange={setPracticeScope}
          onStart={handleStartPractice}
        />

        <section className="workspace">
          <KanaTable selectedKana={selectedKana} onSelectKana={handleSelectKana} />
          <StudyCard
            kana={selectedKana}
            flipped={flipped}
            onFlip={() => {
              setFlipped((value) => !value);
              setActiveTab("cards");
            }}
            onSpeak={() => {
              speakKana(selectedKana);
              setActiveTab("hint");
            }}
          />
        </section>
      </div>
    </main>
  );
}

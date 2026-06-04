import { useMemo, useState } from "react";
import {
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
  allKana,
  buildQuizChoices,
  getKanaById,
  gojuonColumns,
  gojuonRows,
  gradeQuizAnswer,
} from "./kana-data.js";
import pronunciationDiagram from "./assets/pronunciation-ka-diagram.jpg";

const studyTabs = [
  { id: "hiragana", label: "平假名", icon: BookOpen },
  { id: "katakana", label: "片假名", icon: Layers },
  { id: "hint", label: "发音提示", icon: Lightbulb },
  { id: "cards", label: "卡片练习", icon: ClipboardList },
  { id: "quiz", label: "小测验", icon: PencilLine },
];

function getNextQuestion(current, round) {
  const currentIndex = allKana.findIndex((kana) => kana.id === current.id);
  return allKana[(currentIndex + 5 + round * 3) % allKana.length];
}

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

function QuizPanel({
  question,
  choices,
  selectedAnswer,
  feedback,
  score,
  round,
  onAnswer,
  onNext,
}) {
  return (
    <section className="quiz-panel" aria-labelledby="quiz-title">
      <div className="quiz-title-wrap">
        <div className="panel-label tape tape-blue" id="quiz-title">
          小测验
        </div>
      </div>
      <div className="quiz-content">
        <div className="quiz-prompt">
          <span>选择正确的读音（平假名）</span>
          <strong>{question.hiragana}</strong>
          <small>{question.katakana}</small>
        </div>
        <div className="choice-row" role="group" aria-label={`${question.hiragana} 的读音选项`}>
          {choices.map((choice, index) => {
            const isSelected = choice.value === selectedAnswer;
            const showCorrect = selectedAnswer && choice.value === question.romaji;
            const showWrong = isSelected && choice.value !== question.romaji;
            return (
              <button
                className={`choice-button ${isSelected ? "is-selected" : ""} ${showCorrect ? "is-correct" : ""} ${showWrong ? "is-wrong" : ""}`}
                type="button"
                key={choice.value}
                onClick={() => onAnswer(choice.value)}
              >
                <span>{String.fromCharCode(65 + index)}</span>
                {choice.label}
              </button>
            );
          })}
        </div>
        <div className="quiz-feedback" aria-live="polite">
          {feedback ? (
            feedback.correct ? (
              <CheckCircle2 size={18} aria-hidden="true" />
            ) : (
              <XCircle size={18} aria-hidden="true" />
            )
          ) : null}
          <span>{feedback?.message ?? `本轮第 ${round + 1} 题`}</span>
        </div>
        <button className="next-button" type="button" onClick={onNext}>
          下一题
        </button>
      </div>
      <div className="quiz-dots" aria-label="本轮进度">
        {[0, 1, 2, 3, 4].map((dot) => (
          <span className={dot <= (round % 5) ? "is-on" : ""} key={dot} />
        ))}
      </div>
      <div className="daily-note">每天一点点，进步看得见！</div>
      <div className="score-chip">
        <span>得分</span>
        <strong>{score}</strong>
      </div>
    </section>
  );
}

export function App() {
  const [activeTab, setActiveTab] = useState("hiragana");
  const [selectedKana, setSelectedKana] = useState(() => getKanaById("ka"));
  const [flipped, setFlipped] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState(() => getKanaById("sa"));
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);

  const choices = useMemo(() => buildQuizChoices(quizQuestion), [quizQuestion]);

  function handleSelectKana(kana) {
    setSelectedKana(kana);
    setFlipped(false);
    setActiveTab("hiragana");
  }

  function handleAnswer(answer) {
    if (selectedAnswer) {
      return;
    }

    const result = gradeQuizAnswer(quizQuestion, answer);
    setSelectedAnswer(answer);
    setFeedback(result);
    if (result.correct) {
      setScore((current) => current + 1);
    }
  }

  function handleNextQuestion() {
    const nextRound = round + 1;
    const nextQuestion = getNextQuestion(quizQuestion, nextRound);
    setRound(nextRound);
    setQuizQuestion(nextQuestion);
    setSelectedAnswer("");
    setFeedback(null);
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
          <div className="header-score" aria-label={`当前得分 ${score} 分`}>
            <span>得分</span>
            <strong>{score + 86}</strong>
            <small>/100</small>
          </div>
        </header>

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

        <QuizPanel
          choices={choices}
          feedback={feedback}
          question={quizQuestion}
          round={round}
          score={score}
          selectedAnswer={selectedAnswer}
          onAnswer={handleAnswer}
          onNext={handleNextQuestion}
        />
      </div>
    </main>
  );
}

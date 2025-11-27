const startBtn = document.getElementById("start-btn");
const nextBtn = document.getElementById("next-btn");
const replayBtn = document.getElementById("replay-btn");
const setupScreen = document.getElementById("setup-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");
const questionElement = document.getElementById("question");
const optionsContainer = document.getElementById("options");
const progressBar = document.getElementById("progress");
const timerElement = document.getElementById("timer");
const scoreSummary = document.getElementById("score-summary");

let questions = [];
let currentQuestion = 0;
let score = 0;
let timer;
let timeLeft = 10;
let progressInterval;

startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", showNextQuestion);
replayBtn.addEventListener("click", resetQuiz);

function startQuiz() {
  const category = document.getElementById("category").value;
  const difficulty = document.getElementById("difficulty").value;

  fetch(`https://opentdb.com/api.php?amount=5&category=${category}&difficulty=${difficulty}&type=multiple`)
    .then(res => res.json())
    .then(data => {
      questions = data.results;
      setupScreen.classList.add("hidden");
      quizScreen.classList.remove("hidden");
      currentQuestion = 0;
      score = 0;
      showQuestion();
    });
}

function showQuestion() {
  resetState();
  const current = questions[currentQuestion];
  questionElement.innerHTML = decodeHTML(current.question);
  
  const answers = [...current.incorrect_answers, current.correct_answer].sort(() => Math.random() - 0.5);
  answers.forEach(answer => {
    const button = document.createElement("button");
    button.innerHTML = decodeHTML(answer);
    button.classList.add("option");
    button.addEventListener("click", () => selectAnswer(button, current.correct_answer));
    optionsContainer.appendChild(button);
  });

  startTimer();
}

function resetState() {
  nextBtn.classList.add("hidden");
  optionsContainer.innerHTML = "";
  clearInterval(timer);
  clearInterval(progressInterval);
  timeLeft = 10;
  timerElement.textContent = `${timeLeft}s`;
  progressBar.style.width = "100%";
}

function startTimer() {
  const totalTime = 10;
  progressBar.style.width = "100%";

  timer = setInterval(() => {
    timeLeft--;
    timerElement.textContent = `${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      selectAnswer(null, questions[currentQuestion].correct_answer);
    }
  }, 1000);

  progressInterval = setInterval(() => {
    const progressWidth = (timeLeft / totalTime) * 100;
    progressBar.style.width = `${progressWidth}%`;
  }, 100);
}

function selectAnswer(selectedButton, correctAnswer) {
  clearInterval(timer);
  clearInterval(progressInterval);
  const buttons = document.querySelectorAll(".option");
  buttons.forEach(button => {
    if (button.innerHTML === decodeHTML(correctAnswer)) {
      button.classList.add("correct");
    } else {
      button.classList.add("incorrect");
    }
    button.disabled = true;
  });

  if (selectedButton && selectedButton.innerHTML === decodeHTML(correctAnswer)) {
    score++;
  }

  nextBtn.classList.remove("hidden");
}

function showNextQuestion() {
  currentQuestion++;
  if (currentQuestion < questions.length) {
    showQuestion();
  } else {
    showResult();
  }
}

function showResult() {
  quizScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");

  const percentage = Math.round((score / questions.length) * 100);
  localStorage.setItem("quizScore", score);

  scoreSummary.innerHTML = `
    You answered <b>${score}</b> out of <b>${questions.length}</b> questions correctly.<br>
    Your Score: <b>${percentage}%</b>
  `;
}

function resetQuiz() {
  resultScreen.classList.add("hidden");
  setupScreen.classList.remove("hidden");
}

function decodeHTML(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

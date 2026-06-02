const WORDS = {
  Science: [
    { word: "PHOTOSYNTHESIS", hint: "How plants convert sunlight into food" },
    { word: "MITOCHONDRIA", hint: "The powerhouse of the cell" },
    { word: "CHROMOSOME", hint: "DNA-carrying structure in the cell nucleus" },
    { word: "ELECTROMAGNET", hint: "A magnet powered by electric current" },
    { word: "OSMOSIS", hint: "Movement of water across a semi-permeable membrane" },
    { word: "NEUTRON", hint: "Uncharged particle in the atomic nucleus" },
    { word: "CATALYST", hint: "Substance that speeds up a chemical reaction without being consumed" },
    { word: "HYPOTHESIS", hint: "A testable prediction in the scientific method" },
  ],
  "Web Development": [
    { word: "JAVASCRIPT", hint: "The scripting language of the web" },
    { word: "RESPONSIVE", hint: "Design that adapts to different screen sizes" },
    { word: "CALLBACK", hint: "A function passed as an argument to another function" },
    { word: "STYLESHEET", hint: "A file that describes how HTML elements are displayed" },
    { word: "LOCALHOST", hint: "Your own machine as a server (127.0.0.1)" },
    { word: "FRAMEWORK", hint: "A pre-built structure for building applications" },
    { word: "DEBUGGING", hint: "The process of finding and fixing code errors" },
    { word: "BANDWIDTH", hint: "The maximum rate of data transfer across a network" },
  ],
  Math: [
    { word: "POLYNOMIAL", hint: "An expression with multiple terms involving variables" },
    { word: "DERIVATIVE", hint: "Measures instantaneous rate of change in calculus" },
    { word: "PYTHAGOREAN", hint: "Famous theorem relating sides of a right triangle" },
    { word: "PERMUTATION", hint: "Ordered arrangement of a set of items" },
    { word: "LOGARITHM", hint: "The exponent to which a base must be raised" },
    { word: "ASYMPTOTE", hint: "A line a curve approaches but never touches" },
    { word: "QUADRATIC", hint: "A polynomial of degree two" },
    { word: "PROBABILITY", hint: "The likelihood of an event occurring" },
  ],
};

const PARTS = ["h-head", "h-body", "h-arm-l", "h-arm-r", "h-leg-l", "h-leg-r"];
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

let currentWord = "";
let currentHint = "";
let currentCategory = "";
let guessed = new Set();
let mistakes = 0;
const MAX_MISTAKES = 6;
let lastGuess = null;

function pickWord() {
  const cats = Object.keys(WORDS);
  currentCategory = cats[Math.floor(Math.random() * cats.length)];
  const list = WORDS[currentCategory];
  const entry = list[Math.floor(Math.random() * list.length)];
  currentWord = entry.word;
  currentHint = entry.hint;
}

function renderWord() {
  const display = document.getElementById("word-display");
  display.innerHTML = "";
  for (const ch of currentWord) {
    const box = document.createElement("div");
    box.className = "letter-box";
    if (guessed.has(ch)) {
      box.textContent = ch;
      box.classList.add("reveal");
    }
    display.appendChild(box);
  }
}

function renderKeyboard() {
  const kb = document.getElementById("keyboard");
  kb.innerHTML = "";
  for (const letter of ALPHABET) {
    const key = document.createElement("button");
    key.className = "key";
    key.textContent = letter;
    key.dataset.letter = letter;
    if (guessed.has(letter)) {
      key.disabled = true;
      key.classList.add(currentWord.includes(letter) ? "correct" : "wrong");
    }
    key.addEventListener("click", () => handleGuess(letter));
    kb.appendChild(key);
  }
}

function handleGuess(letter) {
  if (guessed.has(letter)) return;
  guessed.add(letter);

  const key = document.querySelector(`.key[data-letter="${letter}"]`);
  if (currentWord.includes(letter)) {
    key.classList.add("correct");
    const boxes = document.querySelectorAll(".letter-box");
    [...currentWord].forEach((ch, i) => {
      if (ch === letter) {
        boxes[i].textContent = ch;
        boxes[i].classList.add("reveal");
      }
    });
    lastGuess = { letter, wasWrong: false };
    checkWin();
  } else {
    key.classList.add("wrong");
    mistakes++;
    document.getElementById("mistake-count").textContent = mistakes;
    showBodyPart(mistakes - 1);
    lastGuess = { letter, wasWrong: true };
    checkLose();
  }
  key.disabled = true;
  updateUndoBtn();
}

function undoLastGuess() {
  if (!lastGuess) return;
  const { letter, wasWrong } = lastGuess;
  lastGuess = null;
  guessed.delete(letter);
  if (wasWrong) {
    mistakes--;
    document.getElementById("mistake-count").textContent = mistakes;
    document.getElementById(PARTS[mistakes]).setAttribute("display", "none");
  } else {
    const boxes = document.querySelectorAll(".letter-box");
    [...currentWord].forEach((ch, i) => {
      if (ch === letter) {
        boxes[i].textContent = "";
        boxes[i].classList.remove("reveal");
      }
    });
  }
  const key = document.querySelector(`.key[data-letter="${letter}"]`);
  if (key) {
    key.disabled = false;
    key.classList.remove("correct", "wrong");
  }
  updateUndoBtn();
}

function updateUndoBtn() {
  const btn = document.getElementById("btn-undo");
  const label = document.getElementById("undo-label");
  if (lastGuess) {
    btn.disabled = false;
    label.textContent = lastGuess.letter;
  } else {
    btn.disabled = true;
    label.textContent = "—";
  }
}

function showBodyPart(index) {
  if (index < PARTS.length) {
    document.getElementById(PARTS[index]).removeAttribute("display");
  }
}

function hideAllParts() {
  PARTS.forEach(id => document.getElementById(id).setAttribute("display", "none"));
}

function checkWin() {
  const allGuessed = [...currentWord].every(ch => guessed.has(ch));
  if (allGuessed) showModal(true);
}

function checkLose() {
  if (mistakes >= MAX_MISTAKES) showModal(false);
}

function showModal(won) {
  const overlay = document.getElementById("modal");
  document.getElementById("modal-icon").textContent = won ? "🏆" : "💀";
  const title = document.getElementById("modal-title");
  title.textContent = won ? "You won!" : "Game over";
  title.className = "modal-title " + (won ? "win" : "lose");
  document.getElementById("modal-msg").textContent = won
    ? "Excellent! You guessed the word correctly."
    : "The correct word was:";
  document.getElementById("modal-word").textContent = currentWord;
  overlay.classList.add("show");
}

function nextWord() {
  document.getElementById("modal").classList.remove("show");
  initGame();
}

function initGame() {
  guessed = new Set();
  mistakes = 0;
  lastGuess = null;
  pickWord();
  document.getElementById("mistake-count").textContent = "0";
  document.getElementById("category-tag").textContent = currentCategory;
  document.getElementById("hint-text").textContent = currentHint;
  hideAllParts();
  renderWord();
  renderKeyboard();
  updateUndoBtn();
}

document.addEventListener("keydown", e => {
  const letter = e.key.toUpperCase();
  if (ALPHABET.includes(letter) && !document.getElementById("modal").classList.contains("show")) {
    handleGuess(letter);
  }
});

initGame();

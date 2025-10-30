class MusicGame {
  constructor() {
    this.currentCard = 0;
    this.score = 0;
    this.chances = 2;
    this.currentSong = null;
    this.isPlaying = false;

    this.initializeGame();
  }

  initializeGame() {
    this.playBtn = document.getElementById("play-btn");
    this.musicPlayer = document.getElementById("music-player");
    this.scoreElement = document.getElementById("score");
    this.chancesElement = document.getElementById("chances");
    this.optionButtons = document.querySelectorAll(".option-btn");

    if (
      !this.playBtn ||
      !this.musicPlayer ||
      !this.scoreElement ||
      !this.chancesElement
    ) {
      console.error("Required DOM elements for MusicGame are missing.");
      return;
    }

    this.setupEventListeners();
    this.loadNewQuestion();
  }

  setupEventListeners() {
    this.playBtn.addEventListener("click", () => this.toggleMusic());
    this.optionButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => this.checkAnswer(e.currentTarget));
    });
  }

  async loadNewQuestion() {
    this.currentSong = {
      id: 1,
      audioUrl: "./assets/music/1.mp3",
      correctAnswer: "2",
      options: ["Godfather", "Game of Thrones", "The Pianist", "Sanditon"],
      correctAnswerText: " Game of Thrones",
    };

    if (this.musicPlayer) {
      this.musicPlayer.src = this.currentSong.audioUrl;
      try {
        this.musicPlayer.load();
      } catch (e) {
        console.warn("musicPlayer.load() failed:", e);
      }
    }

    this.updateOptions();
    this.resetCard();
  }

  updateOptions() {
    this.optionButtons.forEach((btn, index) => {
      btn.textContent = this.currentSong.options[index];
      btn.classList.remove("correct", "wrong");
      btn.disabled = false;
    });
  }

  resetCard() {
    this.chances = 2;
    this.updateUI();
    this.musicPlayer.pause();
    this.musicPlayer.currentTime = 0;
    this.playBtn.textContent = "▶ Play Music";
    this.isPlaying = false;

    const resultMessage = document.getElementById("result-message");
    if (resultMessage) {
      resultMessage.remove();
    }
  }

  toggleMusic() {
    if (!this.isPlaying) {
      const playPromise = this.musicPlayer.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.playBtn.textContent = "⏸ Pause";
            this.isPlaying = true;
          })
          .catch((err) => {
            console.warn("Audio play() was prevented:", err);
            this.showResultMessage("Press the play button again.", "warning");
          });
      } else {
        this.playBtn.textContent = "⏸ Pause";
        this.isPlaying = true;
      }
    } else {
      this.musicPlayer.pause();
      this.playBtn.textContent = "▶ Play Music";
      this.isPlaying = false;
    }
  }

  checkAnswer(selectedButton) {
    const selectedValue = selectedButton.dataset.value;
    const isCorrect = selectedValue === this.currentSong.correctAnswer;

    if (isCorrect) {
      this.handleCorrectAnswer(selectedButton);
    } else {
      this.handleWrongAnswer(selectedButton);
    }
  }

  handleCorrectAnswer(selectedButton) {
    selectedButton.classList.add("correct");
    this.score += 10;
    this.updateUI();

    this.showResultMessage("Correct ✅", "success");

    this.optionButtons.forEach((btn) => {
      btn.disabled = true;
    });

    this.scheduleReload(5);
  }

  handleWrongAnswer(selectedButton) {
    selectedButton.classList.add("wrong");
    this.chances--;
    this.updateUI();

    if (this.chances === 0) {
      this.showCorrectAnswer();
      this.showResultMessage(
        `Correct answer is: ${this.currentSong.correctAnswerText}`,
        "error"
      );

      this.scheduleReload(5);
    } else {
      this.showResultMessage(
        "Wrong answer! You have one more shot.",
        "warning"
      );
    }
  }

  showCorrectAnswer() {
    this.optionButtons.forEach((btn) => {
      btn.disabled = true;
      if (btn.dataset.value === this.currentSong.correctAnswer) {
        btn.classList.add("correct");
      }
    });
  }

  showResultMessage(message, type) {
    const existingMessage = document.getElementById("result-message");
    if (existingMessage) {
      existingMessage.remove();
    }

    const resultMessage = document.createElement("div");
    resultMessage.id = "result-message";
    resultMessage.className = `result-message ${type}`;
    resultMessage.textContent = message;

    const currentCard = document.querySelector(".card.active .card-content");
    currentCard.appendChild(resultMessage);

    return resultMessage;
  }

  scheduleReload(seconds = 5) {
    const existing = document.getElementById("result-message");
    let el = existing;
    if (!el) {
      el = this.showResultMessage("Page is refreshing....", "warning");
    }

    const baseText = el.textContent.split("(Reload")[0].trim();
    let remaining = seconds;
    el.textContent = `${baseText} (Reload in ${remaining} seconds)`;

    const intervalId = setInterval(() => {
      remaining -= 1;
      if (remaining > 0) {
        el.textContent = `${baseText} (Reload in ${remaining} seconds)`;
      } else {
        clearInterval(intervalId);
        window.location.reload();
      }
    }, 1000);
  }

  nextCard() {
    const currentCard = document.querySelector(".card.active");
    currentCard.classList.remove("active");

    this.currentCard = (this.currentCard + 1) % 3;

    const cards = document.querySelectorAll(".card");
    cards[this.currentCard].classList.add("active");

    this.loadNewQuestion();
  }

  updateUI() {
    this.scoreElement.textContent = this.score;
    this.chancesElement.textContent = this.chances;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new MusicGame();
});

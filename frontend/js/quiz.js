(async function () {
  const session = await TutorwiseAuth.requireSession();
  if (!session) return;

  const stored = JSON.parse(sessionStorage.getItem("tutorwise_active_quiz") || "null");
  if (!stored || !stored.questions?.length) {
    window.location.href = "quiz-setup.html";
    return;
  }

  const { questions, meta, startedAt } = stored;
  const SECONDS_PER_QUESTION = 60;
  const totalSeconds = questions.length * SECONDS_PER_QUESTION;
  let remaining = totalSeconds;
  let current = 0;
  const responses = new Array(questions.length).fill(null); // { selectedIndex, skipped }

  const quizCard = document.getElementById("quizCard");
  const counterLabel = document.getElementById("counterLabel");
  const progressBar = document.getElementById("progressBar");
  const timerBadge = document.getElementById("timerBadge");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const submitBtn = document.getElementById("submitBtn");

  function formatTime(s) {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  }

  const timerInterval = setInterval(() => {
    remaining--;
    timerBadge.innerHTML = `<i class="fa-regular fa-clock me-1"></i>${formatTime(Math.max(remaining, 0))}`;
    if (remaining <= 0) {
      clearInterval(timerInterval);
      submitTest(true);
    }
  }, 1000);

  function renderQuestion() {
    const q = questions[current];
    counterLabel.textContent = `Q ${current + 1} / ${questions.length}`;
    progressBar.style.width = `${((current + 1) / questions.length) * 100}%`;

    const selected = responses[current]?.selectedIndex;
    quizCard.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-3">
        <span class="badge bg-gradient-brand">${q.difficulty || meta.difficulty}</span>
        <span class="text-muted-soft small">${q.chapter || meta.chapter || meta.subject}</span>
      </div>
      <h5 class="mb-4">${q.question}</h5>
      <div id="optionsWrap">
        ${q.options.map((opt, i) => `
          <button type="button" class="option-tile ${selected === i ? "selected" : ""}" data-index="${i}">
            ${opt}
          </button>`).join("")}
      </div>
    `;

    quizCard.querySelectorAll(".option-tile").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.index);
        responses[current] = { selectedIndex: idx, skipped: false };
        renderQuestion();
      });
    });

    prevBtn.disabled = current === 0;
    const isLast = current === questions.length - 1;
    nextBtn.classList.toggle("d-none", isLast);
    submitBtn.classList.toggle("d-none", !isLast);
  }

  prevBtn.addEventListener("click", () => { current = Math.max(0, current - 1); renderQuestion(); });
  nextBtn.addEventListener("click", () => { current = Math.min(questions.length - 1, current + 1); renderQuestion(); });

  submitBtn.addEventListener("click", () => {
    const answeredCount = responses.filter((r) => r).length;
    document.getElementById("submitSummary").textContent =
      `You've answered ${answeredCount} of ${questions.length} questions. Unanswered questions will be marked skipped.`;
    new bootstrap.Modal(document.getElementById("submitModal")).show();
  });

  document.getElementById("confirmSubmitBtn").addEventListener("click", () => submitTest(false));

  async function submitTest(auto) {
    clearInterval(timerInterval);
    const timeTakenSeconds = Math.round((Date.now() - startedAt) / 1000);

    const answers = questions.map((q, i) => {
      const r = responses[i];
      const selectedIndex = r?.selectedIndex ?? null;
      return {
        question: q.question,
        chapter: q.chapter || meta.chapter || meta.subject,
        difficulty: q.difficulty || meta.difficulty,
        selectedIndex,
        correctIndex: q.correctIndex,
        correct: selectedIndex === q.correctIndex,
        skipped: selectedIndex === null,
        explanation: q.explanation,
      };
    });

    quizCard.innerHTML = `<div class="text-center py-5">
      <div class="spinner-border text-brand mb-3" style="color:var(--accent)"></div>
      <p class="text-muted-soft">Scoring your test and generating feedback...</p>
    </div>`;
    document.querySelector(".d-flex.justify-content-between.mt-4").classList.add("d-none");

    try {
      const { result, analysis } = await TutorwiseAPI.submitTest({
        classNum: meta.classNum,
        subject: meta.subject,
        chapter: meta.chapter,
        difficulty: meta.difficulty,
        answers,
        timeTakenSeconds,
      });
      sessionStorage.setItem("tutorwise_last_result", JSON.stringify({ result, analysis }));
      sessionStorage.removeItem("tutorwise_active_quiz");
      window.location.href = "result.html";
    } catch (err) {
      quizCard.innerHTML = `<div class="alert alert-danger">Couldn't submit your test: ${err.message}. <a href="quiz-setup.html">Start over</a></div>`;
    }
  }

  renderQuestion();
})();

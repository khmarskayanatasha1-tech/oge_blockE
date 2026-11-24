document.addEventListener("DOMContentLoaded", () => {
  // Безопасное сохранение данных в браузере
  function saveData(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn("Не удалось сохранить данные:", error);
    }
  }

  function loadData(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn("Не удалось загрузить данные:", error);
      return null;
    }
  }

  // ОСНОВНЫЕ РАЗДЕЛЫ
  const mainButtons = document.querySelectorAll("[data-page]");
  const pages = document.querySelectorAll(".page");

  function showPage(pageName) {
    const targetPage = document.getElementById(`page-${pageName}`);

    if (!targetPage) return;

    pages.forEach(page => {
      page.classList.toggle("active", page === targetPage);
    });

    mainButtons.forEach(button => {
      button.classList.toggle("active", button.dataset.page === pageName);
    });

    saveData("shoppingEditLastPage", pageName);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  mainButtons.forEach(button => {
    button.addEventListener("click", () => {
      showPage(button.dataset.page);
    });
  });

  // Переходы по ссылкам внутри сайта
  document.querySelectorAll("[data-page-link]").forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      showPage(link.dataset.pageLink);
    });
  });

  // ВНУТРЕННИЕ ВКЛАДКИ И ВЛОЖЕННЫЕ ПОДВКЛАДКИ
  document.querySelectorAll(".subnav").forEach(nav => {
    // Берём только кнопки непосредственно внутри этой панели.
    // Это важно для вложенных вкладок в разделе Speaking.
    const buttons = Array.from(nav.children).filter(element =>
      element.matches("[data-subpage]")
    );

    buttons.forEach(button => {
      button.addEventListener("click", () => {
        const targetId = `subpage-${button.dataset.subpage}`;
        const parent = nav.parentElement;

        buttons.forEach(item => {
          item.classList.toggle("active", item === button);
        });

        // Переключаем только непосредственные соседние страницы.
        const siblingPages = Array.from(parent.children).filter(element =>
          element.classList.contains("subpage")
        );

        siblingPages.forEach(page => {
          page.classList.toggle("active", page.id === targetId);
        });
      });
    });
  });

  // КАРТОЧКИ ЛЕКСИКИ
  const vocabularyCards = document.querySelectorAll(".vocab-card");

  vocabularyCards.forEach(card => {
    card.addEventListener("click", () => {
      card.classList.toggle("flipped");
    });
  });

  // ПОИСК И ФИЛЬТР ЛЕКСИКИ
  const vocabSearch = document.getElementById("vocab-search");
  const vocabCategory = document.getElementById("vocab-category");
  const vocabEmpty = document.getElementById("vocab-empty");

  function filterVocabulary() {
    if (!vocabSearch || !vocabCategory) return;

    const searchText = vocabSearch.value.trim().toLowerCase();
    const selectedCategory = vocabCategory.value;
    let visibleCount = 0;

    vocabularyCards.forEach(card => {
      const word = card.querySelector("span")?.textContent.toLowerCase() || "";
      const translation = card.querySelector("strong")?.textContent.toLowerCase() || "";
      const category = card.dataset.category;

      const matchesSearch =
        word.includes(searchText) || translation.includes(searchText);

      const matchesCategory =
        selectedCategory === "all" || category === selectedCategory;

      const isVisible = matchesSearch && matchesCategory;

      card.hidden = !isVisible;

      if (isVisible) visibleCount++;
    });

    if (vocabEmpty) {
      vocabEmpty.hidden = visibleCount !== 0;
    }
  }

  if (vocabSearch) {
    vocabSearch.addEventListener("input", filterVocabulary);
  }

  if (vocabCategory) {
    vocabCategory.addEventListener("change", filterVocabulary);
  }

  // ЧЕК-ЛИСТ И ПРОГРЕСС
  const checklist = document.querySelectorAll(".progress-check");
  const progressFill = document.getElementById("checklist-progress");
  const progressText = document.getElementById("checklist-progress-text");

  function updateChecklist() {
    const total = checklist.length;

    if (!total) return;

    const completed = Array.from(checklist).filter(item => item.checked).length;
    const percent = Math.round((completed / total) * 100);

    if (progressFill) {
      progressFill.style.width = `${percent}%`;
    }

    if (progressText) {
      progressText.textContent = `${percent}% completed · ${completed} of ${total}`;
    }
  }

  checklist.forEach(item => {
    const storageKey = `shoppingEditCheck_${item.dataset.check}`;

    item.checked = loadData(storageKey) === "true";

    item.addEventListener("change", () => {
      saveData(storageKey, String(item.checked));
      updateChecklist();
    });
  });

  updateChecklist();

  // ВОЗВРАЩЕНИЕ К ПОСЛЕДНЕМУ ОТКРЫТОМУ РАЗДЕЛУ
  const savedPage = loadData("shoppingEditLastPage");

  if (savedPage && document.getElementById(`page-${savedPage}`)) {
    showPage(savedPage);
  } else {
    showPage("home");
  }
    // СОХРАНЕНИЕ ОТВЕТОВ В РАЗДЕЛЕ LISTENING
  const listeningPage = document.getElementById("page-listening");

  if (listeningPage) {
    const listeningFields = listeningPage.querySelectorAll(
      "input, textarea, select"
    );

    listeningFields.forEach(field => {
      // Для обычных полей используем id,
      // для полей с data-save — указанное имя.
      const fieldKey = field.dataset.save || field.id || field.name;

      if (!fieldKey) return;

      const storageKey = `shoppingEditListening_${fieldKey}`;

      // Восстанавливаем ранее сохранённый ответ.
      const savedValue = loadData(storageKey);

      if (field.type === "radio") {
        if (savedValue !== null && field.value === savedValue) {
          field.checked = true;
        }
      } else if (field.type === "checkbox") {
        field.checked = savedValue === "true";
      } else if (savedValue !== null) {
        field.value = savedValue;
      }

      // Сохраняем изменения.
      field.addEventListener("input", () => {
        if (field.type === "radio") {
          if (field.checked) {
            saveData(storageKey, field.value);
          }
        } else if (field.type === "checkbox") {
          saveData(storageKey, String(field.checked));
        } else {
          saveData(storageKey, field.value);
        }
      });

      field.addEventListener("change", () => {
        if (field.type === "radio") {
          if (field.checked) {
            saveData(storageKey, field.value);
          }
        } else if (field.type === "checkbox") {
          saveData(storageKey, String(field.checked));
        } else {
          saveData(storageKey, field.value);
        }
      });
    });
  }
    // =========================================
  // READING: СОХРАНЕНИЕ ОТВЕТОВ
  // =========================================

  const readingPage = document.getElementById("page-reading");

  if (readingPage) {
    const readingFields = readingPage.querySelectorAll("input, textarea, select");

    readingFields.forEach(field => {
      const key = field.dataset.save || field.dataset.answer || field.id || field.name;
      if (!key) return;

      const storageKey = `shoppingEditReading_${key}`;
      const saved = loadData(storageKey);

      if (field.type === "radio" || field.type === "checkbox") {
        if (field.type === "radio") {
          field.checked = saved !== null && field.value === saved;
        } else {
          field.checked = saved === "true";
        }
      } else if (saved !== null) {
        field.value = saved;
      }

      const saveField = () => {
        if (field.type === "radio") {
          if (field.checked) saveData(storageKey, field.value);
        } else if (field.type === "checkbox") {
          saveData(storageKey, String(field.checked));
        } else {
          saveData(storageKey, field.value);
        }
      };

      field.addEventListener("input", saveField);
      field.addEventListener("change", saveField);
    });
  }

  // =========================================
  // READING: ВЫДЕЛЕНИЕ ЦВЕТОМ
  // =========================================

  const highlightButtons = document.querySelectorAll("[data-highlight]");
  const highlightUndo = document.getElementById("highlight-undo");
  const highlightHistory = [];

  function saveHighlightState(post) {
    highlightHistory.push({
      post: post,
      html: post.querySelector(".post-text").innerHTML
    });

    if (highlightHistory.length > 30) {
      highlightHistory.shift();
    }
  }

  highlightButtons.forEach(button => {
    button.addEventListener("click", () => {
      const selection = window.getSelection();

      if (!selection || selection.isCollapsed || !selection.rangeCount) {
        alert("Сначала выдели слово или фразу в одном из постов.");
        return;
      }

      const range = selection.getRangeAt(0);
      const selectedText = selection.toString().trim();

      if (!selectedText) return;

      const postText = range.commonAncestorContainer.nodeType === 1
        ? range.commonAncestorContainer.closest(".post-text")
        : range.commonAncestorContainer.parentElement?.closest(".post-text");

      if (!postText) {
        alert("Выделять слова можно внутри четырёх постов.");
        return;
      }

      const post = postText.closest(".social-post");
      if (!post) return;

      saveHighlightState(post);

      const span = document.createElement("span");
      span.className = `user-highlight highlight-${button.dataset.highlight}`;

      try {
        const fragment = range.extractContents();
        span.appendChild(fragment);
        range.insertNode(span);
        selection.removeAllRanges();

        saveData(
          `shoppingEditHighlights_${post.id}`,
          postText.innerHTML
        );
      } catch (error) {
        alert("Не удалось выделить этот фрагмент. Попробуй выделить слова внутри одного абзаца.");
      }
    });
  });

  if (highlightUndo) {
    highlightUndo.addEventListener("click", () => {
      const previous = highlightHistory.pop();

      if (!previous) {
        alert("Пока нечего отменять.");
        return;
      }

      const postText = previous.post.querySelector(".post-text");
      postText.innerHTML = previous.html;

      saveData(
        `shoppingEditHighlights_${previous.post.id}`,
        postText.innerHTML
      );
    });
  }

  // Восстанавливаем цветные выделения после перезагрузки.
  document.querySelectorAll(".social-post").forEach(post => {
    const saved = loadData(`shoppingEditHighlights_${post.id}`);

    if (saved) {
      post.querySelector(".post-text").innerHTML = saved;
    }
  });

  // =========================================
  // READING: ЛАЙКИ, КОММЕНТАРИИ И СОХРАНЕНИЕ
  // =========================================

  document.querySelectorAll(".social-post").forEach(post => {
    const postId = post.id;

    post.querySelectorAll("[data-social]").forEach(button => {
      const action = button.dataset.social;
      const storageKey = `shoppingEditSocial_${postId}_${action}`;

      if (action === "like" || action === "save") {
        const isActive = loadData(storageKey) === "true";

        button.classList.toggle("is-active", isActive);

        if (action === "like") {
          button.innerHTML = isActive
            ? '♥ <span>Liked</span>'
            : '♡ <span>Like</span>';
        }

        if (action === "save") {
          button.innerHTML = isActive
            ? '♧ <span>Saved</span>'
            : '♧ <span>Save</span>';
        }

        button.addEventListener("click", () => {
          const nextState = !button.classList.contains("is-active");

          button.classList.toggle("is-active", nextState);
          saveData(storageKey, String(nextState));

          if (action === "like") {
            button.innerHTML = nextState
              ? '♥ <span>Liked</span>'
              : '♡ <span>Like</span>';
          }

          if (action === "save") {
            button.innerHTML = nextState
              ? '♧ <span>Saved</span>'
              : '♧ <span>Save</span>';
          }
        });
      }

      if (action === "comment") {
        const commentBox = post.querySelector(".post-comment-box");
        const textarea = commentBox?.querySelector("textarea");

        if (!commentBox || !textarea) return;

        const commentKey = `shoppingEditComment_${postId}`;
        const savedComment = loadData(commentKey);

        if (savedComment !== null) {
          textarea.value = savedComment;
        }

        button.addEventListener("click", () => {
          commentBox.hidden = !commentBox.hidden;

          if (!commentBox.hidden) {
            textarea.focus();
          }
        });

        textarea.addEventListener("input", () => {
          saveData(commentKey, textarea.value);
        });
      }
    });
  });

  // =========================================
  // READING: SMART SHOPPING CHECKLIST
  // =========================================

  document.querySelectorAll(".smart-tip-check").forEach(checkbox => {
    const key = `shoppingEditSmartTip_${checkbox.dataset.tip}`;
    checkbox.checked = loadData(key) === "true";

    checkbox.addEventListener("change", () => {
      saveData(key, String(checkbox.checked));
    });
  });

  // =========================================
  // READING: SHOPPER QUESTIONNAIRE
  // =========================================

  const shopperQuiz = document.getElementById("shopper-quiz");
  const shopperResult = document.getElementById("shopper-result");
  const shopperScore = document.getElementById("shopper-score");
  const shopperResultTitle = document.getElementById("shopper-result-title");
  const shopperResultText = document.getElementById("shopper-result-text");
  const shopperQuizError = document.getElementById("shopper-quiz-error");

  function showShopperResult(score) {
    if (!shopperResult) return;

    shopperResult.hidden = false;
    shopperScore.textContent = `${score} / 24 points`;

    if (score >= 19) {
      shopperResultTitle.textContent = "Smart Shopping Star!";
      shopperResultText.textContent =
        "You are a thoughtful shopper! You know how to plan your budget, save money and make responsible choices. You understand that shopping is not only about buying fashionable things. Keep it up and inspire your friends!";
    } else if (score >= 12) {
      shopperResultTitle.textContent = "On the Right Track!";
      shopperResultText.textContent =
        "You already have some good shopping habits, but there is still room for improvement. Try to plan your purchases more carefully, compare prices and think about second-hand options. Small changes can make a difference!";
    } else {
      shopperResultTitle.textContent = "Time for a Shopping Rethink!";
      shopperResultText.textContent =
        "You may sometimes buy things you do not really need or spend your pocket money too quickly. Do not worry — you can start with one small change. Make a shopping list, set a budget or try repairing an old piece of clothing. Smart shopping is a habit you can develop!";
    }
  }

  if (shopperQuiz) {
    shopperQuiz.addEventListener("submit", event => {
      event.preventDefault();

      let score = 0;
      let answered = 0;

      for (let i = 1; i <= 6; i++) {
        const answer = shopperQuiz.querySelector(
          `input[name="shopper-${i}"]:checked`
        );

        if (answer) {
          score += Number(answer.value);
          answered++;
        }
      }

      if (answered !== 6) {
        shopperQuizError.textContent =
          "Please answer all six questions before calculating your result.";
        shopperResult.hidden = true;
        return;
      }

      shopperQuizError.textContent = "";
      saveData("shoppingEditShopperScore", String(score));
      showShopperResult(score);

      shopperResult.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    });

    const savedScore = loadData("shoppingEditShopperScore");

    if (savedScore !== null) {
      const allAnswered = [1, 2, 3, 4, 5, 6].every(number =>
        shopperQuiz.querySelector(`input[name="shopper-${number}"]:checked`)
      );

      if (allAnswered) {
        showShopperResult(Number(savedScore));
      }
    }
  }

  // =========================================
  // READING: АВТОПРОВЕРКА УПРАЖНЕНИЙ
  // =========================================

  const readingAnswerKeys = {
    1: {
      "ex1-1": "E",
      "ex1-2": "B",
      "ex1-3": "D",
      "ex1-4": "A"
    },
    2: {
      "ex2-1": "True",
      "ex2-2": "False",
      "ex2-3": "True",
      "ex2-4": "False",
      "ex2-5": "True"
    },
    3: {
      "ex3-1": "B",
      "ex3-2": "C",
      "ex3-3": "A",
      "ex3-4": "C"
    },
    4: {
      "ex4-1": "hauls",
      "ex4-2": "living",
      "ex4-3": "budget",
      "ex4-4": "unique",
      "ex4-5": "order"
    },
    5: {
      "ex5-1": "1",
      "ex5-2": "2",
      "ex5-3": "3",
      "ex5-4": "4",
      "ex5-5": "1",
      "ex5-6": "3"
    }
  };

  function normalizeAnswer(value) {
    return value.trim().toLowerCase().replace(/\s+/g, " ");
  }

  document.querySelectorAll("[data-check-exercise]").forEach(button => {
    button.addEventListener("click", () => {
      const exerciseNumber = button.dataset.checkExercise;
      const answerKey = readingAnswerKeys[exerciseNumber];

      if (!answerKey) return;

      let correct = 0;
      let answered = 0;
      const total = Object.keys(answerKey).length;

      Object.entries(answerKey).forEach(([key, expected]) => {
        const field = readingPage.querySelector(`[data-answer="${key}"]`);

        if (!field) return;

        field.classList.remove("answer-correct", "answer-incorrect");

        let userAnswer = "";

        if (field.type === "radio") {
          const selected = readingPage.querySelector(
            `input[name="${field.name}"]:checked`
          );

          userAnswer = selected ? selected.value : "";
        } else {
          userAnswer = field.value;
        }

        if (userAnswer.trim() !== "") {
          answered++;
        }

        const isCorrect =
          normalizeAnswer(userAnswer) === normalizeAnswer(expected);

        if (isCorrect) {
          correct++;
          field.classList.add("answer-correct");
        } else {
          field.classList.add("answer-incorrect");
        }
      });

      const feedback = document.getElementById(
        `feedback-ex${exerciseNumber}`
      );

      if (!feedback) return;

      if (answered < total) {
        feedback.textContent =
          `You have answered ${answered} of ${total} questions. Complete the remaining answers and check again.`;
      } else {
        feedback.textContent =
          `Your result: ${correct} / ${total} correct.`;
      }
    });
  });

  // =========================================
  // READING ALOUD: ТАЙМЕР
  // =========================================

  const timerDisplay = document.getElementById("reading-timer-display");
  const timerStart = document.getElementById("reading-timer-start");
  const timerReset = document.getElementById("reading-timer-reset");
  const timerStatus = document.getElementById("reading-timer-status");
  const timerChoices = document.querySelectorAll("[data-seconds]");

  if (timerDisplay && timerStart && timerReset) {
    let selectedDuration = 90;
    let remainingSeconds = selectedDuration;
    let timerInterval = null;

    function formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const rest = seconds % 60;

      return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
    }

    function updateTimerDisplay() {
      timerDisplay.textContent = formatTime(remainingSeconds);
    }

    function stopTimer() {
      if (timerInterval !== null) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    }

    timerChoices.forEach(choice => {
      choice.addEventListener("click", () => {
        stopTimer();

        selectedDuration = Number(choice.dataset.seconds);
        remainingSeconds = selectedDuration;

        timerChoices.forEach(item => {
          item.classList.toggle("active", item === choice);
        });

        updateTimerDisplay();

        if (timerStatus) {
          timerStatus.textContent = "Choose a text and press Start.";
        }

        timerStart.textContent = "Start";
      });
    });

    timerStart.addEventListener("click", () => {
      if (timerInterval !== null) {
        stopTimer();
        timerStart.textContent = "Continue";

        if (timerStatus) {
          timerStatus.textContent = "Timer paused.";
        }

        return;
      }

      if (remainingSeconds <= 0) {
        remainingSeconds = selectedDuration;
      }

      timerStart.textContent = "Pause";

      if (timerStatus) {
        timerStatus.textContent = "Reading time!";
      }

      timerInterval = setInterval(() => {
        remainingSeconds--;
        updateTimerDisplay();

        if (remainingSeconds <= 0) {
          stopTimer();
          timerStart.textContent = "Start";

          if (timerStatus) {
            timerStatus.textContent = "Time is up!";
          }
        }
      }, 1000);
    });

    timerReset.addEventListener("click", () => {
      stopTimer();
      remainingSeconds = selectedDuration;
      updateTimerDisplay();
      timerStart.textContent = "Start";

      if (timerStatus) {
        timerStatus.textContent = "Timer reset.";
      }
    });

    updateTimerDisplay();
  }
});
/* =========================================
   GRAMMAR 1 — PAST SIMPLE
   Проверка упражнений и обратная связь
========================================= */

document.addEventListener("DOMContentLoaded", () => {
  const pastSimpleAnswers = {
    "ps1": {
      "ps1-1": "b",
      "ps1-2": "a",
      "ps1-3": "a",
      "ps1-4": "c",
      "ps1-5": "a",
      "ps1-6": "b",
      "ps1-7": "a",
      "ps1-8": "a"
    },

    "ps2": {
      "ps2-1": ["bought"],
      "ps2-2": ["didn't save", "did not save"],
      "ps2-3": ["went"],
      "ps2-4": ["showed"],
      "ps2-5a": ["did"],
      "ps2-5b": ["pay"],
      "ps2-6": ["didn't find", "did not find"],
      "ps2-7": ["were"],
      "ps2-8": ["made"],
      "ps2-9a": ["did"],
      "ps2-9b": ["cost"],
      "ps2-10": ["chose"]
    },

    "ps3": {
      "ps3-1": ["i didn't buy anything at the shopping centre."],
      "ps3-2": ["did she visit the new clothes shop?"],
      "ps3-3": ["we were very happy with our purchases."],
      "ps3-4": ["the shoes didn't cost much."],
      "ps3-5": ["where did you buy that beautiful dress?"],
      "ps3-6": ["my parents weren't at home yesterday."],
      "ps3-7": ["he didn't pay for the food."],
      "ps3-8": ["was the shop assistant friendly?"]
    },

    "ps4": {
      "ps4-1": ["what did you buy yesterday?"],
      "ps4-2": ["when did you go shopping?"],
      "ps4-3": ["how much did the trainers cost?"],
      "ps4-4": ["how did she pay?"],
      "ps4-5": ["what did they visit?"],
      "ps4-6": ["what did your brother choose?"]
    },

    "ps5": {
      "ps5-1": ["i bought a new pair of shoes yesterday."],
      "ps5-2": ["she didn't like the dress."],
      "ps5-3": ["where did you buy this coat?"],
      "ps5-4": ["the products were very expensive."],
      "ps5-5": ["did they go shopping last weekend?"],
      "ps5-6": ["he spent all his pocket money."],
      "ps5-7": ["was the shop open yesterday?"],
      "ps5-8": ["we didn't find any discounts."]
    },

    "ps6": {
      "ps6-1": ["went"],
      "ps6-2a": ["did"],
      "ps6-2b": ["go"],
      "ps6-3": ["visited"],
      "ps6-4": ["looked"],
      "ps6-5": ["didn't buy", "did not buy"],
      "ps6-6": ["were"],
      "ps6-7": ["found"],
      "ps6-8": ["bought"],
      "ps6-9": ["chose"],
      "ps6-10a": ["did"],
      "ps6-10b": ["pay"],
      "ps6-11": ["paid"],
      "ps6-12": ["was"]
    },

    "ps7": {
      "ps7-1": [
        "i bought food at the supermarket yesterday.",
        "i bought the food at the supermarket yesterday."
      ],
      "ps7-2": [
        "we didn't spend all our pocket money.",
        "we did not spend all our pocket money."
      ],
      "ps7-3": ["where did you find these comfortable shoes?"],
      "ps7-4": ["how much did this coat cost?"],
      "ps7-5": ["the shop was closed on sunday."],
      "ps7-6": [
        "she didn't pay in cash.",
        "she did not pay in cash."
      ],
      "ps7-7": ["my friends went to a street market last week."],
      "ps7-8": ["why did you choose this dress?"]
    },

    "ps8": {
      "ps8-1": ["did"],
      "ps8-2": ["was"],
      "ps8-3": ["were"],
      "ps8-4": ["did"],
      "ps8-5": ["were"],
      "ps8-6": ["did"],
      "ps8-7": ["was"],
      "ps8-8": ["did"]
    },

    "ps9": {
      "ps9-1": ["shopped"],
      "ps9-2": ["liked"],
      "ps9-3": ["studied"],
      "ps9-4": ["enjoyed"],
      "ps9-5": ["stopped"],
      "ps9-6": ["ordered"],
      "ps9-7": ["carried"],
      "ps9-8": ["planned"],
      "ps9-9": ["decided"],
      "ps9-10": ["tried"]
    },

    "ps10": {
      "ps10-t": ["shopped, liked, watched"],
      "ps10-d": ["ordered, played, compared, enjoyed, repaired"],
      "ps10-id": ["wanted, visited, decided, needed"]
    },

    "ps11": {
      "ps11-1a": ["were"],
      "ps11-1b": ["was"],
      "ps11-2a": ["did"],
      "ps11-2b": ["do"],
      "ps11-3a": ["were"],
      "ps11-3b": ["weren't", "were not"],
      "ps11-4a": ["did"],
      "ps11-4b": ["did"],
      "ps11-5a": ["was"],
      "ps11-5b": ["was"]
    }
  };

  const pastSimpleComments = {
    "ps1": {
      "ps1-1": "Buy — неправильный глагол. В Past Simple используется bought.",
      "ps1-2": "В утвердительном предложении с правильным глаголом добавляется -ed.",
      "ps1-3": "После didn't используется начальная форма глагола spend.",
      "ps1-4": "Общий вопрос образуется с did и начальной формой go.",
      "ps1-5": "Cost имеет одинаковую форму в настоящем и прошедшем времени.",
      "ps1-6": "С подлежащим my parents (they) используется were.",
      "ps1-7": "После didn't используется начальная форма like.",
      "ps1-8": "С существительным в единственном числе the shop assistant используется was."
    },

    "ps2": {
      "ps2-1": "Buy — неправильный глагол: bought.",
      "ps2-2": "Отрицание: didn't + начальная форма глагола.",
      "ps2-3": "Go — неправильный глагол: went.",
      "ps2-4": "Show — правильный глагол: showed.",
      "ps2-5a": "В вопросе используется did.",
      "ps2-5b": "После did используется начальная форма pay.",
      "ps2-6": "После didn't используется find, а не found.",
      "ps2-7": "Prices — множественное число, поэтому were.",
      "ps2-8": "Make — неправильный глагол: made.",
      "ps2-9a": "В вопросе используется did.",
      "ps2-9b": "После did используется начальная форма cost.",
      "ps2-10": "Choose — неправильный глагол: chose."
    },

    "ps3": {
      "ps3-1": "После didn't нужна начальная форма buy.",
      "ps3-2": "После did нужна начальная форма visit.",
      "ps3-3": "С we используется were.",
      "ps3-4": "После didn't нужна начальная форма cost.",
      "ps3-5": "Специальный вопрос: вопросительное слово + did + подлежащее + начальная форма глагола.",
      "ps3-6": "С my parents используется were; отрицательная форма — weren't.",
      "ps3-7": "После didn't нужна начальная форма pay.",
      "ps3-8": "Shop assistant — единственное число, поэтому используется was."
    },

    "ps5": {
      "ps5-1": "В утвердительном предложении используется вторая форма глагола.",
      "ps5-2": "В отрицании используется didn't + начальная форма глагола.",
      "ps5-3": "В специальном вопросе используется where + did + subject + infinitive.",
      "ps5-4": "С существительным во множественном числе используется were.",
      "ps5-5": "Общий вопрос образуется с did + подлежащее + начальная форма глагола.",
      "ps5-6": "В утвердительном предложении используется форма spent.",
      "ps5-7": "С глаголом be используется was перед подлежащим в вопросе.",
      "ps5-8": "В отрицании используется didn't + начальная форма find."
    },

    "ps6": {
      "ps6-1": "Go — неправильный глагол: went.",
      "ps6-2a": "В вопросе используется did.",
      "ps6-2b": "После did используется начальная форма go.",
      "ps6-3": "Visit — правильный глагол: visited.",
      "ps6-4": "Look — правильный глагол: looked.",
      "ps6-5": "В отрицании используется didn't + начальная форма buy.",
      "ps6-6": "Dresses — множественное число, поэтому were.",
      "ps6-7": "Find — неправильный глагол: found.",
      "ps6-8": "Buy — неправильный глагол: bought.",
      "ps6-9": "Choose — неправильный глагол: chose.",
      "ps6-10a": "В вопросе используется did.",
      "ps6-10b": "После did используется начальная форма pay.",
      "ps6-11": "Pay — неправильный глагол: paid.",
      "ps6-12": "С it используется was."
    },

    "ps8": {
      "ps8-1": "Do the shopping — смысловой глагол. Для вопроса нужен did.",
      "ps8-2": "Shopping centre — единственное число, поэтому was.",
      "ps8-3": "Parents — множественное число, поэтому were.",
      "ps8-4": "Первый do — вспомогательный глагол did, второй — смысловой do.",
      "ps8-5": "Shoes — множественное число, поэтому were.",
      "ps8-6": "Смысловой глагол visit требует did в вопросе.",
      "ps8-7": "Food — неисчисляемое существительное, согласуется с was.",
      "ps8-8": "Do anything — смысловой глагол do, поэтому используется did."
    },

    "ps9": {
      "ps9-1": "В коротком глаголе shop конечная согласная удваивается: shopped.",
      "ps9-2": "Если глагол заканчивается на -e, добавляем только -d: liked.",
      "ps9-3": "Согласная + y меняется на -ied: studied.",
      "ps9-4": "Перед y стоит гласная, поэтому добавляем -ed: enjoyed.",
      "ps9-5": "В коротком глаголе stop конечная согласная удваивается: stopped.",
      "ps9-6": "Обычно к правильному глаголу добавляется -ed: ordered.",
      "ps9-7": "Согласная + y меняется на -ied: carried.",
      "ps9-8": "В коротком глаголе plan конечная согласная удваивается: planned.",
      "ps9-9": "Если глагол заканчивается на -e, добавляем только -d: decided.",
      "ps9-10": "Согласная + y меняется на -ied: tried."
    },

    "ps10": {
      "ps10-t": "Звук /t/ произносится после глухих согласных, кроме /t/.",
      "ps10-d": "Звук /d/ произносится после звонких звуков и гласных, кроме /d/.",
      "ps10-id": "Звук /ɪd/ произносится после звуков /t/ и /d/."
    },

    "ps11": {
      "ps11-1a": "С you используется were.",
      "ps11-1b": "С I используется was.",
      "ps11-2a": "Вопрос с смысловым глаголом do образуется с did.",
      "ps11-2b": "После did смысловой глагол do остаётся в начальной форме.",
      "ps11-3a": "Trainers — множественное число, поэтому were.",
      "ps11-3b": "Отрицательная форма were — weren't.",
      "ps11-4a": "Вопрос с глаголом do образуется с did.",
      "ps11-4b": "В кратком ответе используется did.",
      "ps11-5a": "Favourite shop — единственное число, поэтому was.",
      "ps11-5b": "Favourite shop — единственное число, поэтому was."
    }
  };

  function normalizeGrammarAnswer(value) {
    return value
      .trim()
      .toLowerCase()
      .replace(/[’‘]/g, "'")
      .replace(/\s+/g, " ")
      .replace(/[.!?]+$/g, "");
  }

  function getFieldValue(field) {
    return normalizeGrammarAnswer(field.value);
  }

  function isGrammarAnswerCorrect(value, acceptedAnswers) {
    const normalized = normalizeGrammarAnswer(value);

    return acceptedAnswers.some(answer =>
      normalizeGrammarAnswer(answer) === normalized
    );
  }

  function checkPastSimpleExercise(exerciseId) {
    const answers = pastSimpleAnswers[exerciseId];

    if (!answers) return;

    const feedback = document.getElementById(`feedback-${exerciseId}`);
    const exercise = document.querySelector(
      `[data-grammar-exercise="${exerciseId}"]`
    );

    if (!feedback || !exercise) return;

    let correctCount = 0;
    let totalCount = 0;
    const mistakes = [];

    Object.entries(answers).forEach(([fieldId, acceptedAnswers]) => {
      totalCount++;

      if (exerciseId === "ps1") {
        const selected = exercise.querySelector(
          `input[name="${fieldId}"]:checked`
        );

        if (selected && selected.value === acceptedAnswers) {
          correctCount++;
          return;
        }

        mistakes.push(fieldId);
        return;
      }

      const field = exercise.querySelector(
        `[data-answer="${fieldId}"]`
      );

      if (!field) return;

      const value = getFieldValue(field);

      if (exerciseId === "ps10") {
        const enteredWords = value
          .split(/[,;\n]+/)
          .map(normalizeGrammarAnswer)
          .filter(Boolean)
          .sort();

        const correctWords = acceptedAnswers[0]
          .split(",")
          .map(normalizeGrammarAnswer)
          .sort();

        const isCorrect =
          enteredWords.length === correctWords.length &&
          enteredWords.every((word, index) => word === correctWords[index]);

        field.classList.toggle("answer-correct", isCorrect);
        field.classList.toggle("answer-incorrect", !isCorrect);

        if (isCorrect) {
          correctCount++;
        } else {
          mistakes.push(fieldId);
        }

        return;
      }

      const isCorrect = isGrammarAnswerCorrect(value, acceptedAnswers);

      field.classList.toggle("answer-correct", isCorrect);
      field.classList.toggle("answer-incorrect", !isCorrect);

      if (isCorrect) {
        correctCount++;
      } else {
        mistakes.push(fieldId);
      }
    });

    if (exerciseId === "ps1") {
      Object.keys(answers).forEach(fieldId => {
        const selected = exercise.querySelector(
          `input[name="${fieldId}"]:checked`
        );

        exercise.querySelectorAll(
          `input[name="${fieldId}"]`
        ).forEach(input => {
          input.closest(".grammar-question")?.classList.remove(
            "answer-correct",
            "answer-incorrect"
          );
        });

        if (selected) {
          selected.closest(".grammar-question")?.classList.add(
            selected.value === answers[fieldId]
              ? "answer-correct"
              : "answer-incorrect"
          );
        }
      });
    }

    let resultHTML = `Результат: ${correctCount} из ${totalCount}.`;

    if (mistakes.length > 0) {
      resultHTML += "<br><br><strong>Обрати внимание:</strong><ul>";

      mistakes.forEach(fieldId => {
        const comment = pastSimpleComments[exerciseId]?.[fieldId];

        if (comment) {
          resultHTML += `<li>${comment}</li>`;
        }
      });

      resultHTML += "</ul>";
      feedback.style.background = "#fff1f2";
      feedback.style.color = "#963f4f";
    } else {
      resultHTML += "<br>Отличная работа! Все ответы верны.";
      feedback.style.background = "#effaf2";
      feedback.style.color = "#28633d";
    }

    feedback.innerHTML = resultHTML;
  }

  document.querySelectorAll("[data-check-grammar]").forEach(button => {
    button.addEventListener("click", () => {
      checkPastSimpleExercise(button.dataset.checkGrammar);
    });
  });
});
/* =========================================
   GRAMMAR 2 — PAST CONTINUOUS
   Проверка упражнений 1–3 по ключам
========================================= */

document.addEventListener("DOMContentLoaded", () => {
  const pastContinuousKeys = {
    pc1: {
      "pc1-1": "b",
      "pc1-2": "b",
      "pc1-3": "a",
      "pc1-4": "c",
      "pc1-5": "b",
      "pc1-6": "a",
      "pc1-7": "c",
      "pc1-8": "a"
    },

    pc2: {
      "pc2-1": ["was looking"],
      "pc2-2": ["were shopping"],
      "pc2-3": ["wasn't trying on", "was not trying on"],
      "pc2-4": ["were"],
      "pc2-5": ["waiting"],
      "pc2-6": ["was helping"],
      "pc2-7": ["were choosing"],
      "pc2-8": ["wasn't wearing", "was not wearing"],
      "pc2-9": ["was"],
      "pc2-10": ["doing"],
      "pc2-11": ["were sitting"],
      "pc2-12": ["weren't buying", "were not buying"]
    },

    pc3: {
      "pc3-1": ["i was looking for a new coat yesterday evening."],
      "pc3-2": ["she was trying on a pair of boots."],
      "pc3-3": ["they weren't shopping at the supermarket.", "they were not shopping at the supermarket."],
      "pc3-4": ["was he waiting for the shop assistant?"],
      "pc3-5": ["what were you buying at the market?"],
      "pc3-6": ["my friends were sitting in the café.", "my friends were sitting in the cafe."],
      "pc3-7": ["he wasn't wearing his new jacket.", "he was not wearing his new jacket."],
      "pc3-8": ["we were choosing some presents."]
    }
  };

  const pastContinuousComments = {
    pc1: {
      "pc1-1": "С I используется was + V-ing.",
      "pc1-2": "My friends — множественное число, поэтому were + V-ing.",
      "pc1-3": "С she используется was + V-ing.",
      "pc1-4": "С we используется were + V-ing.",
      "pc1-5": "В вопросе с you используется Were.",
      "pc1-6": "С he отрицательная форма — wasn't.",
      "pc1-7": "С they используется were.",
      "pc1-8": "С my sister используется was + V-ing; make → making."
    },
    pc2: {
      "pc2-1": "I + was + V-ing.",
      "pc2-2": "My parents = they, поэтому were.",
      "pc2-3": "Отрицание: wasn't + V-ing.",
      "pc2-4": "В вопросе were ставится перед подлежащим.",
      "pc2-5": "После were используется форма waiting.",
      "pc2-6": "The shop assistant = he/she/it.",
      "pc2-7": "С we используется were.",
      "pc2-8": "С he отрицание образуется с wasn't.",
      "pc2-9": "В вопросе с what используется was перед подлежащим your brother.",
      "pc2-10": "После was используется doing.",
      "pc2-11": "The children = they; sit → sitting.",
      "pc2-12": "С they отрицание образуется с weren't."
    },
    pc3: {
      "pc3-1": "С I используется was.",
      "pc3-2": "После was нужен глагол с -ing.",
      "pc3-3": "С they используется weren't.",
      "pc3-4": "С he используется was.",
      "pc3-5": "С you используется were.",
      "pc3-6": "После were нужен V-ing; sit → sitting.",
      "pc3-7": "После wasn't нужен V-ing.",
      "pc3-8": "С we используется were."
    }
  };

  function normalizePC(value) {
    return value
      .trim()
      .toLowerCase()
      .replace(/[’‘]/g, "'")
      .replace(/\s+/g, " ")
      .replace(/[.!?]+$/g, "");
  }

  function checkPastContinuous(exerciseId) {
    const exercise = document.querySelector(
      `[data-grammar-exercise="${exerciseId}"]`
    );

    const feedback = document.getElementById(
      `feedback-${exerciseId}`
    );

    const keys = pastContinuousKeys[exerciseId];

    if (!exercise || !feedback || !keys) return;

    let correct = 0;
    let total = 0;
    const mistakes = [];

    Object.entries(keys).forEach(([fieldId, accepted]) => {
      total++;

      if (exerciseId === "pc1") {
        const selected = exercise.querySelector(
          `input[name="${fieldId}"]:checked`
        );

        const question = selected?.closest(".grammar-question");

        exercise.querySelectorAll(
          `input[name="${fieldId}"]`
        ).forEach(input => {
          input.closest(".grammar-question")?.classList.remove(
            "answer-correct",
            "answer-incorrect"
          );
        });

        if (selected && selected.value === accepted) {
          correct++;
          question?.classList.add("answer-correct");
        } else {
          mistakes.push(fieldId);
          question?.classList.add("answer-incorrect");
        }

        return;
      }

      const field = exercise.querySelector(
        `[data-answer="${fieldId}"]`
      );

      if (!field) return;

      const value = normalizePC(field.value);
      const isCorrect = accepted.some(
        answer => normalizePC(answer) === value
      );

      field.classList.toggle("answer-correct", isCorrect);
      field.classList.toggle("answer-incorrect", !isCorrect);

      if (isCorrect) {
        correct++;
      } else {
        mistakes.push(fieldId);
      }
    });

    let message = `Результат: ${correct} из ${total}.`;

    if (mistakes.length) {
      message += "<br><br><strong>Разберём ошибки:</strong><ul>";

      mistakes.forEach(fieldId => {
        const comment = pastContinuousComments[exerciseId]?.[fieldId];
        if (comment) message += `<li>${comment}</li>`;
      });

      message += "</ul>";
      feedback.style.background = "#fff1f2";
      feedback.style.color = "#963f4f";
    } else {
      message += "<br>Отличная работа! Все ответы верны.";
      feedback.style.background = "#effaf2";
      feedback.style.color = "#28633d";
    }

    feedback.innerHTML = message;
  }

  document.querySelectorAll("[data-check-grammar]").forEach(button => {
    if (!["pc1", "pc2", "pc3"].includes(button.dataset.checkGrammar)) {
      return;
    }

    button.addEventListener("click", () => {
      checkPastContinuous(button.dataset.checkGrammar);
    });
  });
});
/* =========================================
   GRAMMAR 3 — PAST SIMPLE VS PAST CONTINUOUS
========================================= */

document.addEventListener("DOMContentLoaded", () => {

  const pspcKeys = {
    pspc1: {
      "pspc1-1": "b",
      "pspc1-2": "b",
      "pspc1-3": "b",
      "pspc1-4": "a",
      "pspc1-5": "c",
      "pspc1-6": "b",
      "pspc1-7": "b",
      "pspc1-8": "c",
      "pspc1-9": "b",
      "pspc1-10": "b"
    },

    pspc2: {
      "pspc2-1": ["was looking"],
      "pspc2-2": ["saw"],
      "pspc2-3": ["bought"],
      "pspc2-4": ["were having"],
      "pspc2-5": ["was trying on"],
      "pspc2-6": ["was looking"],
      "pspc2-7": ["was helping"],
      "pspc2-8": ["came"],
      "pspc2-9": ["spent"],
      "pspc2-10": ["didn't know", "did not know"],
      "pspc2-11": ["were walking"],
      "pspc2-12": ["started"],
      "pspc2-13": ["was making"],
      "pspc2-14": ["was preparing"],
      "pspc2-15": ["entered"],
      "pspc2-16": ["chose"],
      "pspc2-17": ["paid"]
    },

    pspc8: {
      "pspc8-1": "b",
      "pspc8-2": "a",
      "pspc8-3": "a",
      "pspc8-4": "b",
      "pspc8-5": "a"
    }
  };

  const pspcComments = {
    pspc1: {
      "pspc1-1": "Yesterday указывает на завершённое действие в прошлом — Past Simple.",
      "pspc1-2": "At 7 p.m. yesterday указывает на действие в процессе в конкретный момент.",
      "pspc1-3": "Рассматривание витрин происходило в процессе, когда я увидела учителя.",
      "pspc1-4": "Last week — завершённое действие в прошлом.",
      "pspc1-5": "Ожидание происходило, когда вошёл менеджер.",
      "pspc1-6": "Every day when he was younger описывает повторяющуюся привычку в прошлом.",
      "pspc1-7": "Оплата происходила в тот момент, когда зазвонил телефон.",
      "pspc1-8": "Покупка фруктов и овощей происходила в момент нашего прихода.",
      "pspc1-9": "Know обычно не используется в Continuous.",
      "pspc1-10": "Здесь перечислена последовательность завершённых событий."
    },
    pspc2: {
      "pspc2-1": "Поиск был в процессе, когда я увидела друга.",
      "pspc2-2": "Завершённое действие в прошлом.",
      "pspc2-3": "Yesterday указывает на завершённое действие.",
      "pspc2-4": "Действие происходило в конкретный момент.",
      "pspc2-5": "Два действия происходили одновременно.",
      "pspc2-6": "Два действия происходили одновременно.",
      "pspc2-7": "Помощь происходила в момент прихода другого покупателя.",
      "pspc2-8": "Короткое событие, которое произошло во время действия.",
      "pspc2-9": "Last weekend указывает на завершённое действие.",
      "pspc2-10": "Know обычно не употребляется в Continuous.",
      "pspc2-11": "Прогулка была в процессе, когда начался дождь.",
      "pspc2-12": "Начало дождя — короткое событие в прошлом.",
      "pspc2-13": "Два действия происходили одновременно.",
      "pspc2-14": "Два действия происходили одновременно.",
      "pspc2-15": "Последовательность завершённых событий.",
      "pspc2-16": "Последовательность завершённых событий.",
      "pspc2-17": "Последовательность завершённых событий."
    },
    pspc8: {
      "pspc8-1": "Подруга уже примеряла платье в момент прихода — действие в процессе.",
      "pspc8-2": "Сначала купили продукты, затем пошли домой — последовательность событий.",
      "pspc8-3": "Телефон зазвонил во время оплаты.",
      "pspc8-4": "В 5 часов выбор подарков ещё продолжался.",
      "pspc8-5": "Частая привычка в прошлом описывается Past Simple."
    }
  };

  function normalizePSPC(value) {
    return value
      .trim()
      .toLowerCase()
      .replace(/[’‘]/g, "'")
      .replace(/\s+/g, " ")
      .replace(/[.!?]+$/g, "");
  }

  function checkPSPC(exerciseId) {
    const exercise = document.querySelector(
      `[data-grammar-exercise="${exerciseId}"]`
    );

    const feedback = document.getElementById(
      `feedback-${exerciseId}`
    );

    const keys = pspcKeys[exerciseId];

    if (!exercise || !feedback || !keys) return;

    let correct = 0;
    let total = 0;
    const mistakes = [];

    Object.entries(keys).forEach(([fieldId, accepted]) => {
      total++;

      if (exerciseId === "pspc1" || exerciseId === "pspc8") {
        const selected = exercise.querySelector(
          `input[name="${fieldId}"]:checked`
        );

        exercise.querySelectorAll(
          `input[name="${fieldId}"]`
        ).forEach(input => {
          input.closest(".grammar-question")?.classList.remove(
            "answer-correct",
            "answer-incorrect"
          );
        });

        const question = selected?.closest(".grammar-question");

        if (selected && selected.value === accepted) {
          correct++;
          question?.classList.add("answer-correct");
        } else {
          mistakes.push(fieldId);
          question?.classList.add("answer-incorrect");
        }

        return;
      }

      const field = exercise.querySelector(
        `[data-answer="${fieldId}"]`
      );

      if (!field) return;

      const value = normalizePSPC(field.value);
      const isCorrect = accepted.some(
        answer => normalizePSPC(answer) === value
      );

      field.classList.toggle("answer-correct", isCorrect);
      field.classList.toggle("answer-incorrect", !isCorrect);

      if (isCorrect) {
        correct++;
      } else {
        mistakes.push(fieldId);
      }
    });

    let message = `Результат: ${correct} из ${total}.`;

    if (mistakes.length) {
      message += "<br><br><strong>Разберём ошибки:</strong><ul>";

      mistakes.forEach(fieldId => {
        const comment = pspcComments[exerciseId]?.[fieldId];

        if (comment) {
          message += `<li>${comment}</li>`;
        }
      });

      message += "</ul>";
      feedback.style.background = "#fff1f2";
      feedback.style.color = "#963f4f";
    } else {
      message += "<br>Отличная работа! Все ответы верны.";
      feedback.style.background = "#effaf2";
      feedback.style.color = "#28633d";
    }

    feedback.innerHTML = message;
  }

  document.querySelectorAll("[data-check-grammar]").forEach(button => {
    const exerciseId = button.dataset.checkGrammar;

    if (!["pspc1", "pspc2", "pspc8"].includes(exerciseId)) {
      return;
    }

    button.addEventListener("click", () => {
      checkPSPC(exerciseId);
    });
  });

});
/* =========================================
   GRAMMAR 4 — PRESENT PERFECT: BEEN / GONE
========================================= */

document.addEventListener("DOMContentLoaded", () => {

  const ppbgKeys = {
    ppbg1: {
      "ppbg1-1": "b",
      "ppbg1-2": "a",
      "ppbg1-3": "c",
      "ppbg1-4": "a",
      "ppbg1-5": "b",
      "ppbg1-6": "c",
      "ppbg1-7": "a",
      "ppbg1-8": "b",
      "ppbg1-9": "b",
      "ppbg1-10": "b"
    },

    ppbg2: {
      "ppbg2-1": ["have bought"],
      "ppbg2-2": ["hasn't found", "has not found"],
      "ppbg2-3": ["have"],
      "ppbg2-4": ["visited"],
      "ppbg2-5": ["has spent"],
      "ppbg2-6": ["haven't ordered", "have not ordered"],
      "ppbg2-7": ["has"],
      "ppbg2-8": ["come"],
      "ppbg2-9": ["have"],
      "ppbg2-10": ["been"],
      "ppbg2-11": ["has"],
      "ppbg2-12": ["tried"],
      "ppbg2-13": ["have gone up"],
      "ppbg2-14": ["have lost"]
    },

    ppbg3: {
      "ppbg3-1": ["gone"],
      "ppbg3-2": ["been"],
      "ppbg3-3": ["gone"],
      "ppbg3-4": ["been"],
      "ppbg3-5": ["gone"],
      "ppbg3-6": ["been"],
      "ppbg3-7": ["gone"],
      "ppbg3-8": ["been"]
    },

    ppbg4: {
      "ppbg4-1": ["just"],
      "ppbg4-2": ["yet"],
      "ppbg4-3": ["just"],
      "ppbg4-4": ["yet"],
      "ppbg4-5": ["already"],
      "ppbg4-6": ["yet"],
      "ppbg4-7": ["just"],
      "ppbg4-8": ["yet"]
    },

    ppbg5: {
      "ppbg5-1": ["I've never bought clothes from a charity shop.", "I have never bought clothes from a charity shop."],
      "ppbg5-2": ["She has already paid for the tickets."],
      "ppbg5-3": ["Have you ever tried Chinese food?"],
      "ppbg5-4": ["My brother has just come back from the market."],
      "ppbg5-5": ["We haven't finished shopping yet.", "We have not finished shopping yet."],
      "ppbg5-6": ["They have been to London twice."],
      "ppbg5-7": ["The shop assistant has gone to the stockroom."],
      "ppbg5-8": ["He has lost his credit card."]
    },

    ppbg6: {
      "ppbg6-1": ["has gone"],
      "ppbg6-2": ["bought"],
      "ppbg6-3": ["have"],
      "ppbg6-4": ["bought"],
      "ppbg6-5": ["haven't found", "have not found"],
      "ppbg6-6": ["have"],
      "ppbg6-7": ["looked"],
      "ppbg6-8": ["have been"],
      "ppbg6-9": ["have"],
      "ppbg6-10": ["put"]
    },

    ppbg7: {
      "ppbg7-1": ["d"],
      "ppbg7-2": ["c"],
      "ppbg7-3": ["a"],
      "ppbg7-4": ["b"],
      "ppbg7-5": ["e"]
    },

    ppbg8: {
      "ppbg8-1": ["have visited"],
      "ppbg8-2": ["haven't visited", "have not visited"],
      "ppbg8-3": ["has already been"],
      "ppbg8-4": ["have never bought"],
      "ppbg8-5": ["has bought"],
      "ppbg8-6": ["has"],
      "ppbg8-7": ["come"],
      "ppbg8-8": ["has bought"],
      "ppbg8-9": ["have gone"],
      "ppbg8-10": ["haven't returned", "have not returned"]
    }
  };

  const ppbgComments = {
    ppbg1: {
      "ppbg1-1": "С My sister используется has.",
      "ppbg1-2": "С We используется have.",
      "ppbg1-3": "Вопрос с you начинается с Have.",
      "ppbg1-4": "Отрицание с he: has not + V3.",
      "ppbg1-5": "Have gone показывает, что родители ушли и сейчас отсутствуют.",
      "ppbg1-6": "Present Perfect: have + V3.",
      "ppbg1-7": "С she используется has; третья форма — tried.",
      "ppbg1-8": "С the shop assistant (единственное число) используется Has.",
      "ppbg1-9": "С they используется have.",
      "ppbg1-10": "Been означает, что Том уже вернулся домой."
    },
    ppbg2: {
      "ppbg2-1": "В утверждении используется have + V3.",
      "ppbg2-2": "С she используется has; отрицание — hasn't + V3.",
      "ppbg2-3": "В вопросе с you используется Have.",
      "ppbg2-4": "После have используется третья форма visited.",
      "ppbg2-5": "С my brother используется has.",
      "ppbg2-6": "Отрицание с we: haven't + V3.",
      "ppbg2-7": "С the shop assistant используется has.",
      "ppbg2-8": "Третья форма глагола come — come.",
      "ppbg2-9": "Вопрос с your parents начинается с Have.",
      "ppbg2-10": "Третья форма be — been.",
      "ppbg2-11": "С he используется has.",
      "ppbg2-12": "Третья форма try — tried.",
      "ppbg2-13": "Используется have + gone up.",
      "ppbg2-14": "Используется have + lost."
    },
    ppbg3: {
      "ppbg3-1": "Gone: мама ушла и ещё не вернулась.",
      "ppbg3-2": "Been: говорящий уже сходил на рынок и вернулся.",
      "ppbg3-3": "Gone: Том сейчас в Лондоне или едет туда.",
      "ppbg3-4": "Been: вопрос о посещении места.",
      "ppbg3-5": "Gone: продавец ушёл в подсобное помещение и ещё не вернулся.",
      "ppbg3-6": "Been: родители посещали Италию и вернулись.",
      "ppbg3-7": "Gone: Анна сейчас в кафе.",
      "ppbg3-8": "Been: мы уже посещали ресторан."
    },
    ppbg4: {
      "ppbg4-1": "Just — действие произошло только что.",
      "ppbg4-2": "Yet — вопрос о том, произошло ли действие к настоящему моменту.",
      "ppbg4-3": "Just — папа ушёл минуту назад.",
      "ppbg4-4": "Yet — действие ещё не выполнено.",
      "ppbg4-5": "Already — действие уже произошло.",
      "ppbg4-6": "Yet — вопрос о том, принёс ли официант меню.",
      "ppbg4-7": "Just — говорящий только что пообедал.",
      "ppbg4-8": "Yet — люди ещё не прибыли."
    },
    ppbg5: {
      "ppbg5-1": "В утверждении используется have + V3; never стоит перед смысловым глаголом.",
      "ppbg5-2": "С she используется has; already стоит между has и V3.",
      "ppbg5-3": "В вопросе have ставится перед подлежащим.",
      "ppbg5-4": "Just стоит после have / has и перед V3.",
      "ppbg5-5": "Yet обычно ставится в конце отрицательного предложения.",
      "ppbg5-6": "Been to означает, что человек посетил место и вернулся.",
      "ppbg5-7": "Gone to означает, что человек ушёл и ещё не вернулся.",
      "ppbg5-8": "Lost — третья форма глагола lose."
    },
    ppbg6: {
      "ppbg6-1": "Has gone — мама ушла и отсутствует.",
      "ppbg6-2": "В вопросе используется have + V3.",
      "ppbg6-3": "С I используется have.",
      "ppbg6-4": "Bought — третья форма buy.",
      "ppbg6-5": "Haven't found — отрицание с результатом в настоящем.",
      "ppbg6-6": "Вопрос о жизненном опыте начинается с Have.",
      "ppbg6-7": "После have используется looked.",
      "ppbg6-8": "Have been — посещение места с возвращением.",
      "ppbg6-9": "С they используется have.",
      "ppbg6-10": "Put — третья форма put."
    },
    ppbg7: {
      "ppbg7-1": "Have you ever been to London? — No, I've never been there.",
      "ppbg7-2": "Has Mum gone to the supermarket? — Yes, she has. She'll be back soon.",
      "ppbg7-3": "Have you finished your shopping? — No, I haven't finished it yet.",
      "ppbg7-4": "Have you paid for the tickets? — Yes, I've just paid for them.",
      "ppbg7-5": "Has he already bought a new coat? — Yes, he has. He bought it yesterday."
    },
    ppbg8: {
      "ppbg8-1": "В утверждении используется have + V3.",
      "ppbg8-2": "Отрицание: haven't + V3; yet стоит в конце предложения.",
      "ppbg8-3": "С Emma используется has; already стоит перед V3.",
      "ppbg8-4": "Never стоит перед смысловым глаголом.",
      "ppbg8-5": "С Emma используется has + bought.",
      "ppbg8-6": "С my brother используется has.",
      "ppbg8-7": "Третья форма come — come.",
      "ppbg8-8": "С he используется has + bought.",
      "ppbg8-9": "Have gone показывает, что родители сейчас на рынке.",
      "ppbg8-10": "Отрицание с they: haven't + V3."
    }
  };

  function normalizePPBG(value) {
    return value
      .trim()
      .toLowerCase()
      .replace(/[’‘]/g, "'")
      .replace(/\s+/g, " ")
      .replace(/[.!?]+$/g, "");
  }

  function checkPPBG(exerciseId) {
    const exercise = document.querySelector(
      `[data-grammar-exercise="${exerciseId}"]`
    );

    const feedback = document.getElementById(
      `feedback-${exerciseId}`
    );

    const keys = ppbgKeys[exerciseId];

    if (!exercise || !feedback || !keys) return;

    let correct = 0;
    let total = 0;
    const mistakes = [];

    Object.entries(keys).forEach(([fieldId, accepted]) => {
      total++;

      if (exerciseId === "ppbg1") {
        const selected = exercise.querySelector(
          `input[name="${fieldId}"]:checked`
        );

        exercise.querySelectorAll(
          `input[name="${fieldId}"]`
        ).forEach(input => {
          input.closest(".grammar-question")?.classList.remove(
            "answer-correct",
            "answer-incorrect"
          );
        });

        const question = selected?.closest(".grammar-question");

        if (selected && selected.value === accepted) {
          correct++;
          question?.classList.add("answer-correct");
        } else {
          mistakes.push(fieldId);
          question?.classList.add("answer-incorrect");
        }

        return;
      }

      const fields = exercise.querySelectorAll(
        `[data-answer="${fieldId}"]`
      );

      const value = Array.from(fields)
        .map(field => normalizePPBG(field.value))
        .join(" ");

      const isCorrect = accepted.some(
        answer => normalizePPBG(answer) === value
      );

      fields.forEach(field => {
        field.classList.toggle("answer-correct", isCorrect);
        field.classList.toggle("answer-incorrect", !isCorrect);
      });

      if (isCorrect) {
        correct++;
      } else {
        mistakes.push(fieldId);
      }
    });

    let message = `Результат: ${correct} из ${total}.`;

    if (mistakes.length) {
      message += "<br><br><strong>Разберём ошибки:</strong><ul>";

      mistakes.forEach(fieldId => {
        const comment = ppbgComments[exerciseId]?.[fieldId];

        if (comment) {
          message += `<li>${comment}</li>`;
        }
      });

      message += "</ul>";
      feedback.style.background = "#fff1f2";
      feedback.style.color = "#963f4f";
    } else {
      message += "<br>Отличная работа! Все ответы верны.";
      feedback.style.background = "#effaf2";
      feedback.style.color = "#28633d";
    }

    feedback.innerHTML = message;
  }

  document.querySelectorAll("[data-check-grammar]").forEach(button => {
    const exerciseId = button.dataset.checkGrammar;

    if (!ppbgKeys[exerciseId]) return;

    button.addEventListener("click", () => {
      checkPPBG(exerciseId);
    });
  });

});
/* =========================================
   BLOCK Д — GRAMMAR 5
   PRESENT PERFECT VS PAST SIMPLE
========================================= */

(() => {
  function initGrammar5() {
    const root = document.getElementById("grammar-topic-5");
    if (!root || root.dataset.initialized === "true") return;
    root.dataset.initialized = "true";

    const $ = id => document.getElementById(`g5-ex${id}-content`);

    const normalize = value => value
      .toLowerCase()
      .trim()
      .replace(/[’‘]/g, "'")
      .replace(/[.!?]/g, "")
      .replace(/\s+/g, " ");

    function input(id, placeholder = "Your answer") {
      return `<input type="text" id="g5-${id}" placeholder="${placeholder}" autocomplete="off">`;
    }

    function field(id, label, placeholder = "Your answer") {
      return `
        <div class="g5-question">
          <label for="g5-${id}">${label}</label>
          ${input(id, placeholder)}
        </div>`;
    }

    function textField(id, label) {
      return `
        <div class="g5-question">
          <label for="g5-${id}">${label}</label>
          <textarea id="g5-${id}" placeholder="Write your answer"></textarea>
        </div>`;
    }

    function setQuestions(container, questions) {
      container.innerHTML = questions.map((q, i) =>
        field(`${container.id}-${i + 1}`, `${i + 1}. ${q}`)
      ).join("");
    }

    // EXERCISE 1
    const ex1 = [
      ["I (have bought / bought) these trainers yesterday.", "bought", "have bought"],
      ["My sister (has just found / just found) a beautiful dress. Look!", "has just found", "just found"],
      ["We (haven't spent / didn't spend) much money this week. It's only Wednesday.", "haven't spent", "didn't spend"],
      ["When (have you ordered / did you order) this meal?", "did you order", "have you ordered"],
      ["They (have opened / opened) a new shopping centre in our town last year.", "opened", "have opened"],
      ["I (have never tried / never tried) online shopping before.", "have never tried", "never tried"],
      ["Mum (has gone / went) to the supermarket. She isn't at home now.", "has gone", "went"],
      ["We (have visited / visited) that street market last Sunday.", "visited", "have visited"],
      ["(Have you seen / Did you see) any good special offers recently?", "Have you seen", "Did you see"],
      ["I (have lost / lost) my pocketbook, so I can't pay for these products.", "have lost", "lost"]
    ];

    $("1").innerHTML = ex1.map((q, i) => `
      <div class="g5-question">
        <label>${i + 1}. ${q[0]}</label>
        <div class="g5-options">
          <label class="g5-option">
            <input type="radio" name="g5-ex1-${i}" value="${q[1]}">
            ${q[1]}
          </label>
          <label class="g5-option">
            <input type="radio" name="g5-ex1-${i}" value="${q[2]}">
            ${q[2]}
          </label>
        </div>
      </div>
    `).join("");

    // EXERCISE 2
    const ex2 = [
      ["I __________ (buy) a warm jacket two days ago.", "bought"],
      ["My parents __________ (already / pay) for the tickets.", "have already paid"],
      ["We __________ (not / go) shopping last weekend.", "didn't go"],
      ["__________ you ever __________ (visit) Portobello Road?", "have", "visited"],
      ["The shop __________ (close) ten minutes ago.", "closed"],
      ["I __________ (not / spend) all my pocket money this month.", "haven't spent"],
      ["When __________ your brother __________ (get) his first summer job?", "did", "get"],
      ["She __________ (just / find) a beautiful jewellery box.", "has just found"],
      ["They __________ (sell) all the tickets yesterday.", "sold"],
      ["__________ you __________ (see) the new collection this week?", "have", "seen"]
    ];

    $("2").innerHTML = ex2.map((q, i) => `
      <div class="g5-question">
        <label>${i + 1}. ${q[0]}</label>
        ${input(`ex2-${i}-a`)}
        ${q[2] ? input(`ex2-${i}-b`) : ""}
      </div>
    `).join("");

    // EXERCISE 3
    const ex3 = [
      ["I've saved £50 __________.", ["so far", "this month", "today"]],
      ["We visited that charity shop __________.", ["yesterday", "last year", "in 2022"]],
      ["My brother bought his first smartphone __________.", ["last year", "in 2022"]],
      ["Have you seen any good discounts __________?", ["recently", "so far"]],
      ["The supermarket opened __________.", ["two hours ago", "yesterday", "in 2022"]],
      ["I haven't bought any clothes __________.", ["this month", "today"]],
      ["The shop assistant called me __________.", ["two hours ago", "yesterday"]],
      ["I've spent only £15 __________.", ["today", "this month"]]
    ];

    $("3").innerHTML = ex3.map((q, i) => `
      <div class="g5-question">
        <label>${i + 1}. ${q[0]}</label>
        ${input(`ex3-${i}`)}
        <span class="g5-hint">Возможные варианты: ${q[1].join(" / ")}</span>
      </div>
    `).join("");

    // EXERCISE 4
    const ex4 = [
      ["I've bought a new pair of boots yesterday.", "I bought a new pair of boots yesterday."],
      ["Did you ever try shopping at an open-air market?", "Have you ever tried shopping at an open-air market?"],
      ["My parents have just ordered a new fridge.", "Correct"],
      ["When have you paid for the tickets?", "When did you pay for the tickets?"],
      ["I didn't spend much money this week. It's only Tuesday.", "I haven't spent much money this week."],
      ["We have visited this café last month.", "We visited this café last month."],
      ["Have you seen the new shop recently?", "Correct"],
      ["She has lost her receipt, so she can't return the product.", "Correct"],
      ["I have met the shop assistant two days ago.", "I met the shop assistant two days ago."],
      ["What time has the market opened?", "What time did the market open?"]
    ];

    $("4").innerHTML = ex4.map((q, i) => `
      <div class="g5-question">
        <label>${i + 1}. ${q[0]}</label>
        ${input(`ex4-${i}`, "Correct / corrected sentence")}
      </div>
    `).join("");

    // EXERCISE 5
    $("5").innerHTML = `
      <div class="grammar-dialogue">
        <p><strong>Emma:</strong> Hi, Kate! I ${input("ex5-1")} (not / see) you for ages!</p>
        <p><strong>Kate:</strong> Hi! I ${input("ex5-2")} (be) very busy recently. I ${input("ex5-3")} (start) a part-time job two weeks ago.</p>
        <p><strong>Emma:</strong> Really? Where ${input("ex5-4")} you ${input("ex5-5")} (find) it?</p>
        <p><strong>Kate:</strong> I ${input("ex5-6")} (see) an advert in a local shop. I ${input("ex5-7")} (already / earn) some money.</p>
        <p><strong>Emma:</strong> That's great! ${input("ex5-8")} you ${input("ex5-9")} (buy) anything with your first salary?</p>
        <p><strong>Kate:</strong> Yes! I ${input("ex5-10")} (buy) a new pair of shoes yesterday. And I ${input("ex5-11")} (save) some money, too.</p>
        <p><strong>Emma:</strong> Good idea! I ${input("ex5-12")} (not / get) my pocket money yet this month.</p>
      </div>
    `;

    // EXERCISE 6
    const ex6 = [
      ["you / ever / buy / clothes online?", "Have you ever bought clothes online?"],
      ["when / you / last / go / shopping?", "When did you last go shopping?"],
      ["your parents / visit / a street market / recently?", "Have your parents visited a street market recently?"],
      ["what time / the shop / close / yesterday?", "What time did the shop close yesterday?"],
      ["you / spend / all your pocket money / this week?", "Have you spent all your pocket money this week?"],
      ["where / your friend / buy / her new coat?", "Where did your friend buy her new coat?"],
      ["you / ever / eat / at a fish'n'chip shop?", "Have you ever eaten at a fish'n'chip shop?"],
      ["how much / you / pay / for these shoes?", "How much did you pay for these shoes?"]
    ];

    $("6").innerHTML = ex6.map((q, i) => `
      <div class="g5-question">
        <label>${i + 1}. ${q[0]}</label>
        ${input(`ex6-${i}`, "Write the complete question")}
      </div>
    `).join("");

    // EXERCISE 7
    const ex7 = [
      ["I bought this T-shirt yesterday. (SINCE)", "I __________ this T-shirt since yesterday.", ["have had", "have owned"]],
      ["She has just paid for the order. (AGO)", "She __________ for the order a few minutes ago.", ["paid"]],
      ["We visited this market last summer. (BEEN)", "We __________ to this market.", ["have been"]],
      ["He hasn't bought any new clothes this month. (LAST)", "He __________ any new clothes last month.", ["didn't buy"]],
      ["I have never tried this dish before. (FIRST)", "This is the first time I __________ this dish.", ["have tried"]]
    ];

    $("7").innerHTML = ex7.map((q, i) => `
      <div class="g5-question">
        <label>${i + 1}. ${q[0]}</label>
        <p>${q[1]}</p>
        ${input(`ex7-${i}`)}
      </div>
    `).join("");

    // EXERCISE 8
    const ex8 = [
      ["Я купила это платье в прошлом месяце.", ["I bought this dress last month."]],
      ["Ты когда-нибудь покупал одежду в благотворительном магазине?", ["Have you ever bought clothes at a charity shop?"]],
      ["Мы ещё не оплатили заказ.", ["We haven't paid for the order yet."]],
      ["Когда они открыли этот супермаркет?", ["When did they open this supermarket?"]],
      ["В этом году я накопил довольно много денег.", ["I've saved quite a lot of money this year.", "I have saved quite a lot of money this year."]],
      ["Мой брат только что вернулся с рынка.", ["My brother has just come back from the market."]],
      ["Я не видел(а) новых специальных предложений на этой неделе.", ["I haven't seen any new special offers this week."]],
      ["Где ты купил эти удобные ботинки?", ["Where did you buy these comfortable boots?"]],
      ["Она потеряла чек, поэтому не может вернуть товар.", ["She has lost the receipt, so she can't return the product."]],
      ["Вчера мы потратили все карманные деньги.", ["We spent all our pocket money yesterday."]]
    ];

    $("8").innerHTML = ex8.map((q, i) => `
      <div class="g5-question">
        <label>${i + 1}. ${q[0]}</label>
        ${input(`ex8-${i}`, "Translate into English")}
      </div>
    `).join("");

    // EXERCISE 9
    const ex9 = [
      "Last Saturday, my friends and I",
      "shopping in the city centre. We",
      "that shopping street for a long time, so we were excited. First, we",
      "around a few shops. My friend Anna",
      "a beautiful jacket, but she",
      "it because it was too expensive.",
      "Today, Anna",
      "me that she",
      "the same jacket online at a lower price. She",
      "it. I",
      "anything this week, but I",
      "some money so far. I think I",
      "that website soon!"
    ];

    $("9").innerHTML = `
      <div class="g5-story">
        <p>${ex9[0]} ${input("ex9-1")} (go) ${ex9[1]} ${input("ex9-2")} (not / visit) ${ex9[2]} ${input("ex9-3")} (look) ${ex9[3]} ${input("ex9-4")} (find) ${ex9[4]} ${input("ex9-5")} (not / buy) ${ex9[5]}</p>
        <p>${ex9[6]} ${input("ex9-6")} (tell) ${ex9[7]} ${input("ex9-7")} (find) ${ex9[8]} ${input("ex9-8")} (already / order) ${ex9[9]} ${input("ex9-9")} (not / buy) ${ex9[10]} ${input("ex9-10")} (save) ${ex9[11]} ${input("ex9-11")} (visit) ${ex9[12]}</p>
      </div>
    `;

    // ANSWER KEYS
    const keys = {
      1: ex1.map(q => q[1]),
      2: [
        ["bought"], ["have already paid"], ["didn't go"],
        ["have", "visited"], ["closed"], ["haven't spent"],
        ["did", "get"], ["has just found"], ["sold"], ["have", "seen"]
      ],
      3: ex3.map(q => q[1]),
      4: ex4.map(q => [q[1]]),
      5: [
        ["haven't seen"], ["have been"], ["started"],
        ["did"], ["find"], ["saw"], ["have already earned"],
        ["have"], ["bought"], ["bought"], ["have saved"], ["haven't got"]
      ],
      6: ex6.map(q => [q[1]]),
      7: ex7.map(q => q[2]),
      8: ex8.map(q => q[1]),
      9: [
        ["went"], ["didn't visit"], ["looked"], ["found"], ["didn't buy"],
        ["has told"], ["has found"], ["has already ordered"],
        ["haven't bought"], ["have saved"], ["will visit"]
      ]
    };

    function getValue(id) {
      const element = document.getElementById(id);
      return element ? element.value : "";
    }

    function mark(element, correct) {
      if (!element) return;
      element.classList.remove("g5-correct", "g5-incorrect");
      element.classList.add(correct ? "g5-correct" : "g5-incorrect");
    }

    function checkExercise(number) {
      let correctCount = 0;
      let total = 0;
      const feedback = document.getElementById(`g5-ex${number}-feedback`);
      const results = [];

      function evaluate(id, accepted, label) {
        const element = document.getElementById(id);
        const value = normalize(element?.value || "");
        const variants = accepted.map(normalize);
        const isCorrect = variants.includes(value);

        mark(element, isCorrect);
        total++;
        if (isCorrect) correctCount++;

        results.push(`
          <div class="g5-result-line">
            ${isCorrect ? "✓" : "✗"} <strong>${label}</strong>
            ${isCorrect ? "— верно" : `— ответ: <strong>${accepted[0]}</strong>`}
          </div>
        `);
      }

      if (number === 1) {
        ex1.forEach((q, i) => {
          const selected = document.querySelector(`input[name="g5-ex1-${i}"]:checked`);
          const isCorrect = selected && normalize(selected.value) === normalize(q[1]);
          total++;
          if (isCorrect) correctCount++;
          results.push(`<div class="g5-result-line">${isCorrect ? "✓" : "✗"} ${i + 1}. ${isCorrect ? "Верно" : `Ответ: ${q[1]}`}</div>`);
        });
      }

      if (number === 2) {
        keys[2].forEach((answers, i) => {
          answers.forEach((answer, part) =>
            evaluate(`g5-ex2-${i}-${part === 0 ? "a" : "b"}`, [answer], `${i + 1}${answers.length > 1 ? ` (${part + 1})` : ""}`)
          );
        });
      }

      if (number === 3) {
        keys[3].forEach((answers, i) =>
          evaluate(`g5-ex3-${i}`, answers, `${i + 1}`)
        );
      }

      if (number === 4) {
        keys[4].forEach((answers, i) =>
          evaluate(`g5-ex4-${i}`, answers, `${i + 1}`)
        );
      }

      if (number === 5) {
        keys[5].forEach((answers, i) =>
          evaluate(`g5-ex5-${i + 1}`, answers, `${i + 1}`)
        );
      }

      if (number === 6) {
        keys[6].forEach((answers, i) =>
          evaluate(`g5-ex6-${i}`, answers, `${i + 1}`)
        );
      }

      if (number === 7) {
        keys[7].forEach((answers, i) =>
          evaluate(`g5-ex7-${i}`, answers, `${i + 1}`)
        );
      }

      if (number === 8) {
        keys[8].forEach((answers, i) =>
          evaluate(`g5-ex8-${i}`, answers, `${i + 1}`)
        );
      }

      if (number === 9) {
        keys[9].forEach((answers, i) =>
          evaluate(`g5-ex9-${i + 1}`, answers, `${i + 1}`)
        );
      }

      const percentage = total ? Math.round(correctCount / total * 100) : 0;

      feedback.innerHTML = `
        <p><strong>Результат: ${correctCount} из ${total} (${percentage}%)</strong></p>
        ${results.join("")}
      `;
    }

    root.querySelectorAll("[data-check]").forEach(button => {
      button.addEventListener("click", () => {
        checkExercise(Number(button.dataset.check));
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGrammar5);
  } else {
    initGrammar5();
  }
})();

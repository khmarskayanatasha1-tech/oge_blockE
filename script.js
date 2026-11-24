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

/* =========================================
   GRAMMAR 7 — PREPOSITIONS OF PLACE
========================================= */

(() => {
  function initGrammar7() {
    const root = document.getElementById("grammar-topic-7");
    if (!root || root.dataset.g7Ready === "true") return;
    root.dataset.g7Ready = "true";

    const normalize = value => String(value || "")
      .toLowerCase()
      .trim()
      .replace(/[’‘]/g, "'")
      .replace(/[.!?]/g, "")
      .replace(/\s+/g, " ");

    // Переключение между теорией и практикой
    root.querySelectorAll("[data-g7-tab]").forEach(button => {
      button.addEventListener("click", () => {
        const target = button.dataset.g7Tab;

        root.querySelectorAll("[data-g7-tab]").forEach(tab => {
          tab.classList.toggle("active", tab === button);
        });

        root.querySelectorAll("[data-g7-panel]").forEach(panel => {
          panel.classList.toggle(
            "active",
            panel.dataset.g7Panel === target
          );
        });
      });
    });

    const ex1 = [
      ["There are many fashionable clothes ___ this shop.", "in"],
      ["Your receipt is ___ the table.", "on"],
      ["I'll meet you ___ the entrance to the shopping centre.", "at"],
      ["My mum lives ___ London.", "in"],
      ["There is some juice ___ the bottle.", "in"],
      ["The price is written ___ the label.", "on"],
      ["There is a long queue ___ the checkout.", "at"],
      ["I left my wallet ___ my bag.", "in"],
      ["My brother is waiting ___ the bus stop.", "at"],
      ["The new café is ___ the city centre.", "in"],
      ["There is a beautiful dress ___ the shop window.", "in"],
      ["We usually buy groceries ___ this supermarket.", "at"]
    ];

    const ex2 = [
      ["I found some coins ___ my pocket.", "in"],
      ["There is a special offer ___ the notice board.", "on"],
      ["My parents are ___ the shopping centre.", "in"],
      ["The shop assistant is standing ___ the door.", "at"],
      ["We bought some souvenirs ___ Covent Garden.", "in"],
      ["Your shopping list is ___ the fridge.", "on"],
      ["There are many products ___ this box.", "in"],
      ["Let's meet ___ the bus stop.", "at"],
      ["The new supermarket is ___ Oxford Street.", "on"],
      ["I saw this advertisement ___ a magazine.", "in"],
      ["There is a stain ___ your T-shirt.", "on"],
      ["My sister is waiting for me ___ the café.", "at"]
    ];

    const ex3 = [
      ["The milk is in", "e"],
      ["The price tag is on", "g"],
      ["We are waiting at", "d"],
      ["There are many customers in", "a"],
      ["My dad works in", "h"],
      ["I left my phone on", "b"],
      ["The shop is in", "c"],
      ["Let's meet at", "f"]
    ];

    const endings = [
      ["a", "the supermarket."],
      ["b", "the table."],
      ["c", "the city centre."],
      ["d", "the entrance."],
      ["e", "the bottle."],
      ["f", "the shopping centre."],
      ["g", "the jacket."],
      ["h", "the sales department."]
    ];

    const ex4 = [
      ["There are some apples on the bag.", "There are some apples in the bag."],
      ["My dad is at work now.", "Correct."],
      ["I saw this dress at a magazine.", "I saw this dress in a magazine."],
      ["There is a long queue in the checkout.", "There is a long queue at the checkout."],
      ["We live at London.", "We live in London."],
      ["Your keys are on the table.", "Correct."],
      ["I left my phone in the car.", "Correct."],
      ["The shop assistant is standing in the door.", "The shop assistant is standing at the door."],
      ["There is a label in the bottle.", "There is a label on the bottle."],
      ["I found a nice souvenir in the market.", "Correct."],
      ["The café is at the city centre.", "The café is in the city centre."],
      ["There are many products in the shop.", "Correct."]
    ];

    const ex5 = [
      "at", "in", "in", "in", "on", "in", "at", "at"
    ];

    const ex6 = [
      ["My mum is in the supermarket now."],
      ["Your receipt is on the table."],
      ["Let's meet at the entrance to the shopping centre."],
      ["I left the money in the pocket of my jacket."],
      ["There are many shops in the city centre."],
      ["There is a label on the bottle."],
      ["The shop assistant is standing at the door."],
      ["I saw this advertisement in a magazine."]
    ];

    function renderTextExercise(containerId, questions, prefix) {
      const container = document.getElementById(containerId);
      container.innerHTML = questions.map((item, index) => `
        <div class="g7-question">
          <label for="${prefix}-${index + 1}">
            ${index + 1}. ${item[0]}
          </label>
          <input type="text" id="${prefix}-${index + 1}" autocomplete="off">
        </div>
      `).join("");
    }

    renderTextExercise("g7-ex1", ex1, "g7a");
    renderTextExercise("g7-ex2", ex2, "g7b");

    document.getElementById("g7-ex3").innerHTML =
      ex3.map((item, index) => `
        <div class="g7-question">
          <label for="g7c-${index + 1}">
            ${index + 1}. ${item[0]}
          </label>
          <select id="g7c-${index + 1}">
            <option value="">Choose an ending</option>
            ${endings.map(end => `
              <option value="${end[0]}">${end[0]}. ${end[1]}</option>
            `).join("")}
          </select>
        </div>
      `).join("");

    document.getElementById("g7-ex4").innerHTML =
      ex4.map((item, index) => `
        <div class="g7-question">
          <label for="g7d-${index + 1}">
            ${index + 1}. ${item[0]}
          </label>
          <input type="text" id="g7d-${index + 1}"
            placeholder="Correct / rewrite the sentence">
        </div>
      `).join("");

    document.getElementById("g7-ex6").innerHTML =
      ex6.map((item, index) => `
        <div class="g7-question">
          <label for="g7f-${index + 1}">
            ${index + 1}. ${[
              "Моя мама сейчас в супермаркете.",
              "Твой чек лежит на столе.",
              "Давай встретимся у входа в торговый центр.",
              "Я оставил(а) деньги в кармане куртки.",
              "В центре города много магазинов.",
              "На бутылке есть этикетка.",
              "Продавец-консультант стоит у двери.",
              "Я увидел(а) эту рекламу в журнале."
            ][index]}
          </label>
          <textarea id="g7f-${index + 1}" rows="2"
            placeholder="Translate into English"></textarea>
        </div>
      `).join("");

    function mark(element, correct) {
      if (!element) return;
      element.classList.remove("g7-correct", "g7-incorrect");
      element.classList.add(correct ? "g7-correct" : "g7-incorrect");
    }

    function showFeedback(number, results, score, total) {
      const feedback = document.getElementById(`g7-feedback-${number}`);
      feedback.innerHTML = `
        <p><strong>Result: ${score} / ${total}</strong></p>
        ${results.map(result => `
          <div class="g7-result ${result.correct ? "correct" : "incorrect"}">
            ${result.correct ? "✓" : "✗"} ${result.text}
          </div>
        `).join("")}
      `;
    }

    function checkSimple(number, prefix, answers, prompts) {
      let score = 0;
      const results = [];

      answers.forEach((answer, index) => {
        const element = document.getElementById(`${prefix}-${index + 1}`);
        const correct = normalize(element.value) === normalize(answer);
        mark(element, correct);
        if (correct) score++;

        results.push({
          correct,
          text: correct
            ? `${index + 1}. Correct`
            : `${index + 1}. Correct answer: ${answer}`
        });
      });

      showFeedback(number, results, score, answers.length);
    }

    function checkExercise3() {
      let score = 0;
      const results = [];

      ex3.forEach((item, index) => {
        const element = document.getElementById(`g7c-${index + 1}`);
        const correct = element.value === item[1];
        mark(element, correct);
        if (correct) score++;

        results.push({
          correct,
          text: correct
            ? `${index + 1}. Correct`
            : `${index + 1}. Correct match: ${item[1]}`
        });
      });

      showFeedback(3, results, score, ex3.length);
    }

    function checkExercise4() {
      let score = 0;
      const results = [];

      ex4.forEach((item, index) => {
        const element = document.getElementById(`g7d-${index + 1}`);
        const answer = normalize(item[1]);
        const value = normalize(element.value);
        const correct = value === answer ||
          (answer === "correct" && value === "correct");

        mark(element, correct);
        if (correct) score++;

        results.push({
          correct,
          text: correct
            ? `${index + 1}. Correct`
            : `${index + 1}. Correct answer: ${item[1]}`
        });
      });

      showFeedback(4, results, score, ex4.length);
    }

    function checkExercise6() {
      let score = 0;
      const results = [];

      ex6.forEach((answers, index) => {
        const element = document.getElementById(`g7f-${index + 1}`);
        const value = normalize(element.value);
        const correct = answers.some(answer => normalize(answer) === value);

        mark(element, correct);
        if (correct) score++;

        results.push({
          correct,
          text: correct
            ? `${index + 1}. Correct`
            : `${index + 1}. Possible answer: ${answers[0]}`
        });
      });

      showFeedback(6, results, score, ex6.length);
    }

    root.querySelectorAll("[data-g7-check]").forEach(button => {
      button.addEventListener("click", () => {
        const number = Number(button.dataset.g7Check);

        if (number === 1) {
          checkSimple(1, "g7a", ex1.map(item => item[1]));
        } else if (number === 2) {
          checkSimple(2, "g7b", ex2.map(item => item[1]));
        } else if (number === 3) {
          checkExercise3();
        } else if (number === 4) {
          checkExercise4();
        } else if (number === 5) {
          const results = [];
          let score = 0;

          ex5.forEach((answer, index) => {
            const element = document.getElementById(`g7-ex5-${index + 1}`);
            const correct = normalize(element.value) === answer;
            mark(element, correct);
            if (correct) score++;

            results.push({
              correct,
              text: correct
                ? `${index + 1}. Correct`
                : `${index + 1}. Correct answer: ${answer}`
            });
          });

          showFeedback(5, results, score, ex5.length);
        } else if (number === 6) {
          checkExercise6();
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGrammar7);
  } else {
    initGrammar7();
  }
})();

/* =========================================
   GRAMMAR 7 — ADDITIONAL EXERCISES 7–12
========================================= */

(() => {
  function initGrammar7Additional() {
    const root = document.getElementById("grammar-topic-7");
    if (!root || root.dataset.g7AdditionalReady === "true") return;
    root.dataset.g7AdditionalReady = "true";

    const normalize = value => String(value || "")
      .toLowerCase()
      .trim()
      .replace(/[’‘]/g, "'")
      .replace(/[.!?]/g, "")
      .replace(/\s+/g, " ");

    const exercise7 = [
      ["______ a queue", "in"],
      ["______ the left", "on"],
      ["______ the top of the page", "at"],
      ["______ the back of the car", "in"],
      ["______ the front of the cinema", "at"],
      ["______ the corner of the room", "in"],
      ["______ a magazine", "in"],
      ["______ the first floor", "on"],
      ["______ the end of the street", "at"],
      ["______ a shopping list", "on"],
      ["______ the sales department", "in"],
      ["______ the right-hand side", "on"]
    ];

    const exercise8 = [
      {
        text: "My brother was sitting ______ of the car.",
        options: ["in the back", "at the back"],
        answer: "in the back"
      },
      {
        text: "The garden is ______ of the house.",
        options: ["in the back", "at the back"],
        answer: "at the back"
      },
      {
        text: "There is a price tag ______ of the box.",
        options: ["on the back", "at the back"],
        answer: "on the back"
      },
      {
        text: "The shop is ______ the corner of the street.",
        options: ["in", "at"],
        answer: "at"
      },
      {
        text: "There is a small table ______ the corner of the room.",
        options: ["in", "at"],
        answer: "in"
      },
      {
        text: "The supermarket is ______ the end of the street.",
        options: ["at", "in"],
        answer: "at"
      },
      {
        text: "The café is ______ the left.",
        options: ["on", "in"],
        answer: "on"
      },
      {
        text: "The clothes department is ______ the second floor.",
        options: ["on", "at"],
        answer: "on"
      },
      {
        text: "I saw this offer ______ a magazine.",
        options: ["in", "on"],
        answer: "in"
      },
      {
        text: "Write your name ______ the top of the page.",
        options: ["at", "on"],
        answer: "at"
      }
    ];

    const exercise9 = [
      ["We had dinner ______ the restaurant.", "at"],
      ["There were many customers ______ the restaurant.", "in"],
      ["My dad is ______ work until six.", "at"],
      ["My sister is ______ home now.", "at"],
      ["I met my friend ______ the station.", "at"],
      ["There are many shops ______ London.", "in"],
      ["The shop is ______ the city centre.", "in"],
      ["The meeting took place ______ the supermarket's head office.", "at"],
      ["We bought some groceries ______ the supermarket.", "at"],
      ["There was a robbery ______ the supermarket.", "at"],
      ["My grandparents live ______ a small village.", "in"],
      ["Does this train stop ______ Oxford?", "at"]
    ];

    const exercise10 = [
      ["I usually travel to school ______ bus.", "on"],
      ["We arrived ______ a taxi.", "in"],
      ["There were many people ______ the train.", "on"],
      ["My brother goes to the market ______ his bike.", "on"],
      ["I left my shopping bags ______ the car.", "in"],
      ["She was sitting ______ the front of the car.", "in"],
      ["We travelled to London ______ a plane.", "on"],
      ["He was riding ______ a horse.", "on"],
      ["There are too many people ______ this bus.", "on"],
      ["My mum usually goes to work ______ her car.", "in"]
    ];

    const exercise11 = [
      {
        text: "I was sitting at the back of the car.",
        answers: ["I was sitting in the back of the car."]
      },
      {
        text: "There is a small shop in the corner of the street.",
        answers: [
          "There is a small shop at the corner of the street.",
          "There is a small shop on the corner of the street."
        ]
      },
      {
        text: "The price is at the back of the box.",
        answers: ["The price is on the back of the box."]
      },
      {
        text: "My sister works at the sales department.",
        answers: ["My sister works in the sales department."]
      },
      {
        text: "I saw this dress on a magazine.",
        answers: ["I saw this dress in a magazine."]
      },
      {
        text: "We met at the airport.",
        answers: ["Correct"]
      },
      {
        text: "My dad is in work now.",
        answers: ["My dad is at work now."]
      },
      {
        text: "There were many people on the bus.",
        answers: ["Correct"]
      },
      {
        text: "I left my phone at the car.",
        answers: ["I left my phone in the car."]
      },
      {
        text: "The café is at the end of the street.",
        answers: ["Correct"]
      },
      {
        text: "She lives at a small village.",
        answers: ["She lives in a small village."]
      },
      {
        text: "There is a notice on the door.",
        answers: ["Correct"]
      }
    ];

    const exercise12 = [
      {
        prompt: "Я увидел(а) это предложение в журнале.",
        answers: ["I saw this offer in a magazine."]
      },
      {
        prompt: "Наш магазин находится в конце улицы.",
        answers: ["Our shop is at the end of the street."]
      },
      {
        prompt: "Мой брат сидел на заднем сиденье машины.",
        answers: ["My brother was sitting in the back of the car."]
      },
      {
        prompt: "В углу комнаты стоит коробка с обувью.",
        answers: ["There is a box of shoes in the corner of the room."]
      },
      {
        prompt: "Мы встретились у входа в супермаркет.",
        answers: ["We met at the entrance to the supermarket."]
      },
      {
        prompt: "В автобусе было много людей.",
        answers: ["There were many people on the bus."]
      },
      {
        prompt: "Я оставил(а) кошелёк в такси.",
        answers: ["I left my wallet in the taxi."]
      },
      {
        prompt: "Этот магазин находится на втором этаже торгового центра.",
        answers: ["This shop is on the second floor of the shopping centre."]
      }
    ];

    function renderTextInputs(containerId, questions, prefix) {
      const container = document.getElementById(containerId);
      if (!container) return;

      container.innerHTML = questions.map((item, index) => `
        <div class="g7-question">
          <label for="${prefix}-${index + 1}">
            ${index + 1}. ${item[0]}
          </label>
          <input
            type="text"
            id="${prefix}-${index + 1}"
            autocomplete="off"
            placeholder="Your answer"
          >
        </div>
      `).join("");
    }

    function renderSelects(containerId, questions, prefix) {
      const container = document.getElementById(containerId);
      if (!container) return;

      container.innerHTML = questions.map((item, index) => `
        <div class="g7-question">
          <label for="${prefix}-${index + 1}">
            ${index + 1}. ${item.text}
          </label>
          <select id="${prefix}-${index + 1}">
            <option value="">Choose an option</option>
            ${item.options.map(option => `
              <option value="${option}">${option}</option>
            `).join("")}
          </select>
        </div>
      `).join("");
    }

    function renderTranslations(containerId, questions, prefix) {
      const container = document.getElementById(containerId);
      if (!container) return;

      container.innerHTML = questions.map((item, index) => `
        <div class="g7-question">
          <label for="${prefix}-${index + 1}">
            ${index + 1}. ${item.prompt}
          </label>
          <textarea
            id="${prefix}-${index + 1}"
            rows="2"
            placeholder="Translate into English"
          ></textarea>
        </div>
      `).join("");
    }

    renderTextInputs(
      "g7-ex7",
      exercise7,
      "g7-extra-7"
    );

    renderSelects(
      "g7-ex8",
      exercise8,
      "g7-extra-8"
    );

    renderTextInputs(
      "g7-ex9",
      exercise9,
      "g7-extra-9"
    );

    renderTextInputs(
      "g7-ex10",
      exercise10,
      "g7-extra-10"
    );

    renderTextInputs(
      "g7-ex11",
      exercise11.map(item => [item.text]),
      "g7-extra-11"
    );

    renderTranslations(
      "g7-ex12",
      exercise12,
      "g7-extra-12"
    );

    function mark(element, correct) {
      if (!element) return;

      element.classList.remove("g7-correct", "g7-incorrect");
      element.classList.add(
        correct ? "g7-correct" : "g7-incorrect"
      );
    }

    function showFeedback(number, results, score, total) {
      const feedback = document.getElementById(
        `g7-feedback-${number}`
      );

      if (!feedback) return;

      feedback.innerHTML = `
        <p><strong>Result: ${score} / ${total}</strong></p>
        ${results.map(result => `
          <div class="g7-result ${result.correct ? "correct" : "incorrect"}">
            ${result.correct ? "✓" : "✗"} ${result.text}
          </div>
        `).join("")}
      `;
    }

    function checkFillExercise(number, prefix, questions) {
      let score = 0;
      const results = [];

      questions.forEach((item, index) => {
        const element = document.getElementById(
          `${prefix}-${index + 1}`
        );

        const correct = normalize(element.value) === normalize(item[1]);
        mark(element, correct);

        if (correct) score++;

        results.push({
          correct,
          text: correct
            ? `${index + 1}. Correct`
            : `${index + 1}. Correct answer: ${item[1]}`
        });
      });

      showFeedback(number, results, score, questions.length);
    }

    function checkExercise8() {
      let score = 0;
      const results = [];

      exercise8.forEach((item, index) => {
        const element = document.getElementById(
          `g7-extra-8-${index + 1}`
        );

        const correct = element.value === item.answer;
        mark(element, correct);

        if (correct) score++;

        results.push({
          correct,
          text: correct
            ? `${index + 1}. Correct`
            : `${index + 1}. Correct answer: ${item.answer}`
        });
      });

      showFeedback(8, results, score, exercise8.length);
    }

    function checkExercise11() {
      let score = 0;
      const results = [];

      exercise11.forEach((item, index) => {
        const element = document.getElementById(
          `g7-extra-11-${index + 1}`
        );

        const value = normalize(element.value);
        const correct = item.answers.some(
          answer => normalize(answer) === value
        );

        mark(element, correct);

        if (correct) score++;

        results.push({
          correct,
          text: correct
            ? `${index + 1}. Correct`
            : `${index + 1}. Possible answer: ${item.answers.join(" / ")}`
        });
      });

      showFeedback(11, results, score, exercise11.length);
    }

    function checkExercise12() {
      let score = 0;
      const results = [];

      exercise12.forEach((item, index) => {
        const element = document.getElementById(
          `g7-extra-12-${index + 1}`
        );

        const value = normalize(element.value);
        const correct = item.answers.some(
          answer => normalize(answer) === value
        );

        mark(element, correct);

        if (correct) score++;

        results.push({
          correct,
          text: correct
            ? `${index + 1}. Correct`
            : `${index + 1}. Possible answer: ${item.answers[0]}`
        });
      });

      showFeedback(12, results, score, exercise12.length);
    }

    root.querySelectorAll("[data-g7-check]").forEach(button => {
      button.addEventListener("click", () => {
        const number = Number(button.dataset.g7Check);

        if (number === 7) {
          checkFillExercise(7, "g7-extra-7", exercise7);
        } else if (number === 8) {
          checkExercise8();
        } else if (number === 9) {
          checkFillExercise(9, "g7-extra-9", exercise9);
        } else if (number === 10) {
          checkFillExercise(10, "g7-extra-10", exercise10);
        } else if (number === 11) {
          checkExercise11();
        } else if (number === 12) {
          checkExercise12();
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initGrammar7Additional
    );
  } else {
    initGrammar7Additional();
  }
})();

/* =========================================
   GRAMMAR 8 — CARDINAL & ORDINAL NUMBERS
========================================= */

(() => {
  function initGrammar8() {
    const root = document.getElementById("grammar-topic-8");
    if (!root || root.dataset.g8Ready === "true") return;

    root.dataset.g8Ready = "true";

    const normalize = value => String(value || "")
      .toLowerCase()
      .trim()
      .replace(/[’‘]/g, "'")
      .replace(/[.!?]/g, "")
      .replace(/\s+/g, " ");

    const exercise1 = [
      ["five", "fifth"],
      ["three", "third"],
      ["eight", "eighth"],
      ["twelve", "twelfth"],
      ["nine", "ninth"],
      ["twenty", "twentieth"],
      ["two", "second"],
      ["one", "first"]
    ];

    const exercise2 = [
      {
        text: "This is my (three / third) visit to this shop.",
        options: ["three", "third"],
        answer: "third"
      },
      {
        text: "She bought (twenty-one / twenty-first) pairs of socks for the charity shop.",
        options: ["twenty-one", "twenty-first"],
        answer: "twenty-one"
      },
      {
        text: "My brother is (twelve / twelfth) years old.",
        options: ["twelve", "twelfth"],
        answer: "twelve"
      },
      {
        text: "We were the (two / second) people in the queue.",
        options: ["two", "second"],
        answer: "second"
      },
      {
        text: "The shop is on the (five / fifth) floor.",
        options: ["five", "fifth"],
        answer: "fifth"
      },
      {
        text: "He spent (forty / fortieth) pounds on a new jacket.",
        options: ["forty", "fortieth"],
        answer: "forty"
      },
      {
        text: "This is the (nine / ninth) time I have tried this recipe.",
        options: ["nine", "ninth"],
        answer: "ninth"
      },
      {
        text: "There are (thirty-two / thirty-second) students in my class.",
        options: ["thirty-two", "thirty-second"],
        answer: "thirty-two"
      }
    ];

    const exercise3 = [
      ["1st", "first"],
      ["2nd", "second"],
      ["3rd", "third"],
      ["5th", "fifth"],
      ["8th", "eighth"],
      ["9th", "ninth"],
      ["12th", "twelfth"],
      ["20th", "twentieth"],
      ["30th", "thirtieth"],
      ["45th", "forty-fifth"],
      ["81st", "eighty-first"],
      ["100th", "one hundredth"]
    ];

    const exercise4 = [
      ["I bought __________ (3) T-shirts at the sale.", "three"],
      ["This is the __________ (2) time I have visited this shopping centre.", "second"],
      ["My sister is __________ (15) years old.", "fifteen"],
      ["He was the __________ (1) customer in the shop that morning.", "first"],
      ["We need __________ (20) minutes to prepare dinner.", "twenty"],
      ["The __________ (4) lesson starts at ten o’clock.", "fourth"],
      ["There are __________ (12) students in our sports club.", "twelve"],
      ["She finished in __________ (3) place in the competition.", "third"],
      ["I spent __________ (50) pounds on winter clothes.", "fifty"],
      ["This is the __________ (21) century.", "twenty-first"]
    ];

    const exercise5 = [
      {
        text: "She bought five pair of shoes.",
        answer: "She bought five pairs of shoes."
      },
      {
        text: "This is my three visit to London.",
        answer: "This is my third visit to London."
      },
      {
        text: "He lives on the twenty floor.",
        answer: "He lives on the twentieth floor."
      },
      {
        text: "There are two hundreds people at the market.",
        answer: "There are two hundred people at the market."
      },
      {
        text: "My birthday is on the twenty-one of May.",
        answer: "My birthday is on the twenty-first of May."
      },
      {
        text: "We need a four tickets for the concert.",
        answer: "We need four tickets for the concert."
      },
      {
        text: "The shop is on the nineth floor.",
        answer: "The shop is on the ninth floor."
      },
      {
        text: "She is the one person in the queue.",
        answer: "She is the first person in the queue."
      }
    ];

    const exercise6 = [
      {
        prompt: "Pairs of socks",
        answer: "Two pairs of socks — four pounds."
      },
      {
        prompt: "Apples",
        answer: "Six apples — three pounds."
      },
      {
        prompt: "Chocolate bars",
        answer: "Four chocolate bars — eight pounds."
      },
      {
        prompt: "Notebooks",
        answer: "Five notebooks — ten pounds."
      }
    ];

    const exercise7 = [
      ["125", "one hundred and twenty-five"],
      ["340", "three hundred and forty"],
      ["2,500", "two thousand five hundred"],
      ["1,000", "one thousand"],
      ["21st", "twenty-first"],
      ["32nd", "thirty-second"],
      ["113th", "one hundred and thirteenth"],
      ["99th", "ninety-ninth"]
    ];

    const exercise8 = [
      {
        text: "There are hundreds / hundred of shops in this city.",
        options: ["hundreds", "hundred"],
        answer: "hundreds"
      },
      {
        text: "The supermarket sells two hundred / two hundreds different products.",
        options: ["two hundred", "two hundreds"],
        answer: "two hundred"
      },
      {
        text: "My cousin is twenty-one years / twenty-one-year old.",
        options: ["twenty-one years", "twenty-one-year"],
        answer: "twenty-one years"
      },
      {
        text: "The sale starts on the five / fifth of January.",
        options: ["five", "fifth"],
        answer: "fifth"
      },
      {
        text: "We bought one half / one second of the cake.",
        options: ["one half", "one second"],
        answer: "one half"
      },
      {
        text: "She lives on the third / three floor.",
        options: ["third", "three"],
        answer: "third"
      },
      {
        text: "There are thousands / thousand of people at the festival.",
        options: ["thousands", "thousand"],
        answer: "thousands"
      },
      {
        text: "I paid twenty-five pounds and fifty / fiftieth pence.",
        options: ["fifty", "fiftieth"],
        answer: "fifty"
      }
    ];

    const exercise9 = [
      ["1 January", "the first of January"],
      ["14 February", "the fourteenth of February"],
      ["3 March", "the third of March"],
      ["21 June", "the twenty-first of June"],
      ["12 August", "the twelfth of August"],
      ["31 December", "the thirty-first of December"]
    ];

    const exercise10 = [
      "first",
      "ten",
      "first",
      "two",
      "three",
      "two",
      "two",
      "twelve",
      "six",
      "three"
    ];

    function renderInputs(containerId, questions, prefix) {
      const container = document.getElementById(containerId);
      if (!container) return;

      container.innerHTML = questions.map((item, index) => `
        <div class="g8-question">
          <label for="${prefix}-${index + 1}">
            ${index + 1}. ${item[0]}
          </label>
          <input
            type="text"
            id="${prefix}-${index + 1}"
            autocomplete="off"
            placeholder="Write your answer"
          >
        </div>
      `).join("");
    }

    function renderSelects(containerId, questions, prefix) {
      const container = document.getElementById(containerId);
      if (!container) return;

      container.innerHTML = questions.map((item, index) => `
        <div class="g8-question">
          <label for="${prefix}-${index + 1}">
            ${index + 1}. ${item.text}
          </label>
          <select id="${prefix}-${index + 1}">
            <option value="">Choose an answer</option>
            ${item.options.map(option => `
              <option value="${option}">${option}</option>
            `).join("")}
          </select>
        </div>
      `).join("");
    }

    function renderExercise1() {
      const container = document.getElementById("g8-ex1");
      if (!container) return;

      container.innerHTML = exercise1.map((item, index) => `
        <div class="g8-question">
          <label for="g8-ex1-${index + 1}">
            ${index + 1}. ${item[0]}
          </label>
          <select id="g8-ex1-${index + 1}">
            <option value="">Choose the ordinal form</option>
            ${[
              "eighth",
              "twelfth",
              "fifth",
              "third",
              "ninth",
              "twentieth",
              "second",
              "first"
            ].map(option => `
              <option value="${option}">${option}</option>
            `).join("")}
          </select>
        </div>
      `).join("");
    }

    function renderExercise6() {
      const container = document.getElementById("g8-ex6");
      if (!container) return;

      container.innerHTML = exercise6.map((item, index) => `
        <div class="g8-question">
          <label for="g8-ex6-${index + 1}">
            ${index + 1}. ${item.prompt}
          </label>
          <input
            type="text"
            id="g8-ex6-${index + 1}"
            placeholder="Write the full phrase"
          >
        </div>
      `).join("");
    }

    renderExercise1();
    renderSelects("g8-ex2", exercise2, "g8-ex2");
    renderInputs("g8-ex3", exercise3, "g8-ex3");
    renderInputs("g8-ex4", exercise4, "g8-ex4");
    renderInputs(
      "g8-ex5",
      exercise5.map(item => [item.text]),
      "g8-ex5"
    );
    renderExercise6();
    renderInputs("g8-ex7", exercise7, "g8-ex7");
    renderSelects("g8-ex8", exercise8, "g8-ex8");
    renderInputs("g8-ex9", exercise9, "g8-ex9");

    // Вкладки Theory / Practice
    root.querySelectorAll("[data-g8-tab]").forEach(button => {
      button.addEventListener("click", () => {
        const target = button.dataset.g8Tab;

        root.querySelectorAll("[data-g8-tab]").forEach(tab => {
          tab.classList.toggle("active", tab === button);
        });

        root.querySelectorAll("[data-g8-panel]").forEach(panel => {
          panel.classList.toggle(
            "active",
            panel.dataset.g8Panel === target
          );
        });
      });
    });

    function mark(element, correct) {
      if (!element) return;

      element.classList.remove("g8-correct", "g8-incorrect");
      element.classList.add(
        correct ? "g8-correct" : "g8-incorrect"
      );
    }

    function showFeedback(number, results, score, total) {
      const feedback = document.getElementById(
        `g8-feedback-${number}`
      );

      if (!feedback) return;

      feedback.innerHTML = `
        <p><strong>Result: ${score} / ${total}</strong></p>
        ${results.map(result => `
          <div class="g8-result ${result.correct ? "correct" : "incorrect"}">
            ${result.correct ? "✓" : "✗"} ${result.text}
          </div>
        `).join("")}
      `;
    }

    function checkTextExercise(number, prefix, questions) {
      let score = 0;
      const results = [];

      questions.forEach((item, index) => {
        const element = document.getElementById(
          `${prefix}-${index + 1}`
        );

        const correct = normalize(element.value) === normalize(item[1]);
        mark(element, correct);

        if (correct) score++;

        results.push({
          correct,
          text: correct
            ? `${index + 1}. Correct`
            : `${index + 1}. Correct answer: ${item[1]}`
        });
      });

      showFeedback(number, results, score, questions.length);
    }

    function checkSelectExercise(number, prefix, questions) {
      let score = 0;
      const results = [];

      questions.forEach((item, index) => {
        const element = document.getElementById(
          `${prefix}-${index + 1}`
        );

        const correct = normalize(element.value) === normalize(item.answer);
        mark(element, correct);

        if (correct) score++;

        results.push({
          correct,
          text: correct
            ? `${index + 1}. Correct`
            : `${index + 1}. Correct answer: ${item.answer}`
        });
      });

      showFeedback(number, results, score, questions.length);
    }

    function checkExercise5() {
      let score = 0;
      const results = [];

      exercise5.forEach((item, index) => {
        const element = document.getElementById(
          `g8-ex5-${index + 1}`
        );

        const correct = normalize(element.value) === normalize(item.answer);
        mark(element, correct);

        if (correct) score++;

        results.push({
          correct,
          text: correct
            ? `${index + 1}. Correct`
            : `${index + 1}. Correct answer: ${item.answer}`
        });
      });

      showFeedback(5, results, score, exercise5.length);
    }

    function checkExercise6() {
      let score = 0;
      const results = [];

      exercise6.forEach((item, index) => {
        const element = document.getElementById(
          `g8-ex6-${index + 1}`
        );

        const correct = normalize(element.value) === normalize(item.answer);
        mark(element, correct);

        if (correct) score++;

        results.push({
          correct,
          text: correct
            ? `${index + 1}. Correct`
            : `${index + 1}. Possible answer: ${item.answer}`
        });
      });

      showFeedback(6, results, score, exercise6.length);
    }

    function checkExercise10() {
      let score = 0;
      const results = [];

      exercise10.forEach((answer, index) => {
        const element = document.getElementById(
          `g8-ex10-${index + 1}`
        );

        const correct = normalize(element.value) === normalize(answer);
        mark(element, correct);

        if (correct) score++;

        results.push({
          correct,
          text: correct
            ? `${index + 1}. Correct`
            : `${index + 1}. Possible answer: ${answer}`
        });
      });

      showFeedback(10, results, score, exercise10.length);
    }

    root.querySelectorAll("[data-g8-check]").forEach(button => {
      button.addEventListener("click", () => {
        const number = Number(button.dataset.g8Check);

        if (number === 1) {
          checkSelectExercise(1, "g8-ex1", exercise1.map(item => ({
            answer: item[1]
          })));
        } else if (number === 2) {
          checkSelectExercise(2, "g8-ex2", exercise2);
        } else if (number === 3) {
          checkTextExercise(3, "g8-ex3", exercise3);
        } else if (number === 4) {
          checkTextExercise(4, "g8-ex4", exercise4);
        } else if (number === 5) {
          checkExercise5();
        } else if (number === 6) {
          checkExercise6();
        } else if (number === 7) {
          checkTextExercise(7, "g8-ex7", exercise7);
        } else if (number === 8) {
          checkSelectExercise(8, "g8-ex8", exercise8);
        } else if (number === 9) {
          checkTextExercise(9, "g8-ex9", exercise9);
        } else if (number === 10) {
          checkExercise10();
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGrammar8);
  } else {
    initGrammar8();
  }
})();

/* ==================================
   WORD FORMATION — INTERACTIONS
================================== */

(() => {
  function initWordFormation() {
    const root = document.getElementById("page-word-formation");
    if (!root || root.dataset.wfReady === "true") return;

    root.dataset.wfReady = "true";

    const normalize = value => String(value || "")
      .toLowerCase()
      .trim()
      .replace(/[.!?]/g, "")
      .replace(/\s+/g, " ");

    // Вкладки: теория / практика
    root.querySelectorAll("[data-wf-tab]").forEach(button => {
      button.addEventListener("click", () => {
        const target = button.dataset.wfTab;

        root.querySelectorAll("[data-wf-tab]").forEach(tab => {
          tab.classList.toggle("active", tab === button);
        });

        root.querySelectorAll("[data-wf-panel]").forEach(panel => {
          panel.classList.toggle(
            "active",
            panel.dataset.wfPanel === target
          );
        });
      });
    });

    // Подтверждённые ответы из ключа к заданию FE9325
    const answersTask1 = [
      "popularity",
      "healthy",
      "mainly",
      "tasty",
      "traditional",
      "waiter"
    ];

    function checkTask1() {
      let score = 0;
      const results = [];

      answersTask1.forEach((answer, index) => {
        const input = document.getElementById(`wf1-${index + 1}`);
        if (!input) return;

        const correct = normalize(input.value) === answer;

        input.classList.remove("wf-correct", "wf-incorrect");
        input.classList.add(correct ? "wf-correct" : "wf-incorrect");

        if (correct) score++;

        results.push(`
          <div class="wf-result ${correct ? "correct" : "incorrect"}">
            ${correct ? "✓" : "✗"} ${index + 1}.
            ${correct ? "Correct!" : `Correct answer: ${answer}`}
          </div>
        `);
      });

      const feedback = document.getElementById("wf-feedback-1");
      feedback.innerHTML = `
        <strong>Result: ${score} / ${answersTask1.length}</strong>
        ${results.join("")}
      `;
    }

    root.querySelector('[data-wf-check="1"]')
      ?.addEventListener("click", checkTask1);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWordFormation);
  } else {
    initWordFormation();
  }
})();

/* ==================================
   WRITING — TABS, WORD COUNT, AUTOSAVE
================================== */

(() => {
  function initWriting() {
    const root = document.getElementById("page-writing");
    if (!root || root.dataset.writingReady === "true") return;

    root.dataset.writingReady = "true";

    // Основные вкладки справочника
    root.querySelectorAll("[data-writing-tab]").forEach(button => {
      button.addEventListener("click", () => {
        const target = button.dataset.writingTab;

        root.querySelectorAll("[data-writing-tab]").forEach(tab => {
          tab.classList.toggle("active", tab === button);
        });

        root.querySelectorAll("[data-writing-panel]").forEach(panel => {
          panel.classList.toggle(
            "active",
            panel.dataset.writingPanel === target
          );
        });
      });
    });

    // Переключение трёх писем
    root.querySelectorAll("[data-writing-task]").forEach(button => {
      button.addEventListener("click", () => {
        const target = button.dataset.writingTask;

        root.querySelectorAll("[data-writing-task]").forEach(tab => {
          tab.classList.toggle("active", tab === button);
        });

        root.querySelectorAll("[data-writing-task-panel]").forEach(panel => {
          panel.classList.toggle(
            "active",
            panel.dataset.writingTaskPanel === target
          );
        });
      });
    });

    // Подсчёт слов
    function countWords(text) {
      const trimmed = text.trim();
      if (!trimmed) return 0;
      return trimmed.split(/\s+/).length;
    }

    function updateWordCount(key, textarea) {
      const count = countWords(textarea.value);
      const countElement = root.querySelector(
        `[data-word-count="${key}"]`
      );
      const statusElement = root.querySelector(
        `[data-word-status="${key}"]`
      );

      if (countElement) countElement.textContent = count;

      if (statusElement) {
        if (count === 0) {
          statusElement.textContent = "Target: 100–120 words";
        } else if (count < 90) {
          statusElement.textContent = "Меньше 90 слов — недостаточный объём";
        } else if (count < 100) {
          statusElement.textContent = "Нужно добавить ещё немного слов";
        } else if (count <= 120) {
          statusElement.textContent = "✓ Объём соответствует заданию";
        } else if (count <= 132) {
          statusElement.textContent = "Больше 120 слов — проверь объём";
        } else {
          statusElement.textContent = "Больше 132 слов — превышен допустимый объём";
        }
      }
    }

    // Автосохранение черновиков
    root.querySelectorAll("[data-writing-answer]").forEach(textarea => {
      const key = textarea.dataset.writingAnswer;
      const storageKey = `shoppingEditWriting_${key}`;

      try {
        const savedText = localStorage.getItem(storageKey);
        if (savedText !== null) textarea.value = savedText;
      } catch (error) {
        // Если localStorage недоступен, поле продолжает работать.
      }

      updateWordCount(key, textarea);

      textarea.addEventListener("input", () => {
        updateWordCount(key, textarea);

        try {
          localStorage.setItem(storageKey, textarea.value);
        } catch (error) {
          // Черновик останется в поле до закрытия страницы.
        }
      });
    });

    // Очистка отдельного черновика
    root.querySelectorAll("[data-writing-clear]").forEach(button => {
      button.addEventListener("click", () => {
        const key = button.dataset.writingClear;
        const textarea = root.querySelector(
          `[data-writing-answer="${key}"]`
        );

        if (!textarea) return;

        const confirmed = window.confirm(
          "Ты уверена, что хочешь удалить этот черновик?"
        );

        if (!confirmed) return;

        textarea.value = "";
        updateWordCount(key, textarea);

        try {
          localStorage.removeItem(`shoppingEditWriting_${key}`);
        } catch (error) {
          // Поле очищается и без доступа к localStorage.
        }
      });
    });

    // Копирование шаблона
    const copyButton = root.querySelector("[data-copy-template]");
    const copyStatus = root.querySelector("#writing-copy-status");

    if (copyButton) {
      copyButton.addEventListener("click", async () => {
        const template = [
          "Dear [Имя],",
          "",
          "Thanks for your recent email. I was very glad to hear from you again!",
          "",
          "In your email you asked me about [тема]. Well, [ответ на 1-й вопрос].",
          "",
          "As for [2-й вопрос], [ответ]. Personally, [ответ на 3-й вопрос].",
          "",
          "That's all for now. Write back soon!",
          "",
          "Best wishes,",
          "",
          "[Твоё имя]"
        ].join("\n");

        try {
          await navigator.clipboard.writeText(template);
          if (copyStatus) copyStatus.textContent = "Шаблон скопирован!";
        } catch (error) {
          if (copyStatus) {
            copyStatus.textContent =
              "Не удалось скопировать автоматически. Выдели текст шаблона вручную.";
          }
        }
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWriting);
  } else {
    initWriting();
  }
})();

/* =========================================
   SPEAKING — COMPLETE INTERACTION SCRIPT
========================================= */

(() => {
  function initSpeakingSection() {
    const root = document.getElementById("page-speaking");

    if (!root || root.dataset.speakingInitialized === "true") {
      return;
    }

    root.dataset.speakingInitialized = "true";

    // 1. MAIN SPEAKING TABS
    root.querySelectorAll("[data-speaking-tab]").forEach(button => {
      button.addEventListener("click", () => {
        const target = button.dataset.speakingTab;

        root.querySelectorAll("[data-speaking-tab]").forEach(tab => {
          tab.classList.toggle("active", tab === button);
        });

        root.querySelectorAll("[data-speaking-panel]").forEach(panel => {
          panel.classList.toggle(
            "active",
            panel.dataset.speakingPanel === target
          );
        });
      });
    });

    // 2. TRENDS SUBTABS
    root.querySelectorAll("[data-trends-tab]").forEach(button => {
      button.addEventListener("click", () => {
        const target = button.dataset.trendsTab;

        root.querySelectorAll("[data-trends-tab]").forEach(tab => {
          tab.classList.toggle("active", tab === button);
        });

        root.querySelectorAll("[data-trends-panel]").forEach(panel => {
          panel.classList.toggle(
            "active",
            panel.dataset.trendsPanel === target
          );
        });
      });
    });

    // 3. MONOLOGUE SUBTABS
    root.querySelectorAll("[data-monologue-tab]").forEach(button => {
      button.addEventListener("click", () => {
        const target = button.dataset.monologueTab;

        root.querySelectorAll("[data-monologue-tab]").forEach(tab => {
          tab.classList.toggle("active", tab === button);
        });

        root.querySelectorAll("[data-monologue-panel]").forEach(panel => {
          panel.classList.toggle(
            "active",
            panel.dataset.monologuePanel === target
          );
        });
      });
    });

    // 4. AUTOSAVE FOR STUDENT ANSWERS
    root.querySelectorAll("[data-speaking-save]").forEach(field => {
      const key = `shoppingEditSpeaking_${field.dataset.speakingSave}`;

      try {
        const savedValue = localStorage.getItem(key);
        if (savedValue !== null) {
          field.value = savedValue;
        }
      } catch (error) {
        console.warn("Speaking autosave is unavailable.", error);
      }

      field.addEventListener("input", () => {
        try {
          localStorage.setItem(key, field.value);
        } catch (error) {
          console.warn("Speaking answer could not be saved.", error);
        }
      });
    });

    // 5. INTERVIEW QUESTION WHEEL
    const interviewQuestions = [
      "Who usually does the shopping in your family?",
      "What can you buy in your nearest shopping centre?",
      "How often do you usually go shopping?",
      "Why are shopping centres so popular nowadays?",
      "Why do some people hate shopping?",
      "What time would you recommend that busy people should go shopping?",

      "What colour of clothes do you prefer wearing?",
      "What clothes do you usually wear?",
      "How often do you go shopping for clothes?",
      "Who do you usually go shopping with?",
      "Do you have to wear a school uniform? If so, what is it like?",
      "Does a career as a fashion designer attract you or not? Why?",

      "What is your favourite fruit?",
      "What do you usually have for breakfast?",
      "Where do you usually have lunch on weekdays?",
      "Is there any food you do not like?",
      "What dishes can you cook?",
      "What food would you recommend to a teenager who wants to be healthy?",
      "How many meals a day do you usually have?",
      "What is your favorite food?",
      "What do you usually have for lunch at school?",
      "Do you prefer fast food or home-made food? Why?",
      "Would you like to take part in a TV cookery show, for example, cooking your favorite dish in a TV studio? Why?",
      "What would you recommend to a teenager who wants to keep fit?",

      "What is the best present you have ever had?",
      "What other holidays and special days are celebrated in your family?",
      "What from your point of view is the best present for a teenager?",
      "What would you recommend to a person who has got a present she or he doesn't need?"
    ];

    const questionElement = root.querySelector("#interview-question");
    const progressElement = root.querySelector("#interview-progress");
    const nextButton = root.querySelector("#interview-next");
    const resetButton = root.querySelector("#interview-reset");

    let remainingQuestions = [...interviewQuestions];
    let answeredQuestions = 0;

    function updateInterviewProgress() {
      if (progressElement) {
        progressElement.textContent =
          `Questions answered: ${answeredQuestions} / ${interviewQuestions.length}`;
      }
    }

    function showRandomQuestion() {
      if (!questionElement || remainingQuestions.length === 0) {
        return;
      }

      const randomIndex = Math.floor(
        Math.random() * remainingQuestions.length
      );

      const selectedQuestion = remainingQuestions.splice(randomIndex, 1)[0];

      questionElement.textContent = selectedQuestion;
      answeredQuestions++;

      updateInterviewProgress();

      if (remainingQuestions.length === 0 && nextButton) {
        nextButton.textContent = "All questions completed";
        nextButton.disabled = true;
      }
    }

    if (nextButton) {
      nextButton.addEventListener("click", showRandomQuestion);
    }

    if (resetButton) {
      resetButton.addEventListener("click", () => {
        remainingQuestions = [...interviewQuestions];
        answeredQuestions = 0;

        if (questionElement) {
          questionElement.textContent =
            "Нажми «Get a question», чтобы начать интервью.";
        }

        if (nextButton) {
          nextButton.disabled = false;
          nextButton.textContent = "🎡 Get a question";
        }

        updateInterviewProgress();
      });
    }

    updateInterviewProgress();

    // 6. 40-SECOND INTERVIEW TIMER
    const timerDisplay = root.querySelector("#interview-time");
    const timerFill = root.querySelector("#interview-timer-fill");
    const startTimerButton = root.querySelector("#interview-start");
    const stopTimerButton = root.querySelector("#interview-stop");
    const restartTimerButton = root.querySelector("#interview-restart");

    const timerDuration = 40;
    let secondsLeft = timerDuration;
    let timerInterval = null;

    function renderTimer() {
      if (timerDisplay) {
        const seconds = String(secondsLeft).padStart(2, "0");
        timerDisplay.textContent = `00:${seconds}`;
      }

      if (timerFill) {
        timerFill.style.width =
          `${(secondsLeft / timerDuration) * 100}%`;
      }
    }

    function stopTimer() {
      if (timerInterval !== null) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    }

    function startTimer() {
      if (timerInterval !== null) {
        return;
      }

      if (secondsLeft <= 0) {
        secondsLeft = timerDuration;
        renderTimer();
      }

      timerInterval = setInterval(() => {
        secondsLeft--;
        renderTimer();

        if (secondsLeft <= 0) {
          stopTimer();
        }
      }, 1000);
    }

    function resetTimer() {
      stopTimer();
      secondsLeft = timerDuration;
      renderTimer();
    }

    if (startTimerButton) {
      startTimerButton.addEventListener("click", startTimer);
    }

    if (stopTimerButton) {
      stopTimerButton.addEventListener("click", stopTimer);
    }

    if (restartTimerButton) {
      restartTimerButton.addEventListener("click", resetTimer);
    }

    renderTimer();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSpeakingSection);
  } else {
    initSpeakingSection();
  }
})();


/* =========================================
   REVIEW — BLOCK Д · SHOPPING
   Auto-check, feedback and local saving
========================================= */

(() => {
  const reviewPrefix = "shoppingEdit_review_";

  const reviewAnswers = {
    vocabulary: {
      "vocab-1": ["receipt"],
      "vocab-2": ["affordable"],
      "vocab-3": ["shop assistant"],
      "vocab-4": ["pocket money"],
      "vocab-5": ["discount"],
      "vocab-6a": ["try"],
      "vocab-6b": ["on"],
      "vocab-7": ["queue"],
      "vocab-8": ["save"],
      "vocab-9": ["ingredients"],
      "vocab-10": ["waste"]
    },

    grammar: {
      "grammar-1": "a",
      "grammar-2": "b",
      "grammar-3": "b",
      "grammar-4": "b",
      "grammar-5": "a",
      "grammar-6": "b",
      "grammar-7": "b",
      "grammar-8": "c",
      "grammar-9": "b",
      "grammar-10": "a"
    },

    wordFormation: {
      "word-1": "choice",
      "word-2": "friendly",
      "word-3": "afford",
      "word-4": "designer",
      "word-5": "carefully",
      "word-6": "popularity",
      "word-7": "comfortable",
      "word-8": "cook",
      "word-9": "traditional",
      "word-10": "convenient"
    },

    reading: {
      "reading-1": "T",
      "reading-2": "F",
      "reading-3": "T",
      "reading-4": "T",
      "reading-5": "F"
    }
  };

  const grammarFeedback = {
    "grammar-1": "Present Simple: a regular action; the marker is usually.",
    "grammar-2": "Present Continuous: the action is happening now; the marker is Look!",
    "grammar-3": "Past Continuous: an action in progress when another event happened.",
    "grammar-4": "Past Simple: yesterday indicates a finished past time.",
    "grammar-5": "Present Perfect: life experience. Has been to means 'visited and returned'.",
    "grammar-6": "Present Perfect: the action is complete and its result is important now; the marker is already.",
    "grammar-7": "Use an before apple because the word begins with a vowel sound.",
    "grammar-8": "Use on with floors: on the second floor.",
    "grammar-9": "Use the ordinal number third.",
    "grammar-10": "Shouldn't is used to give advice."
  };

  const wordFormationFeedback = {
    "word-1": "A noun is needed after a great.",
    "word-2": "An adjective describing the shop assistant is needed.",
    "word-3": "Use the verb after the modal verb can't.",
    "word-4": "A noun naming a profession is needed.",
    "word-5": "An adverb describing how we should think is needed.",
    "word-6": "A noun is needed after the article the.",
    "word-7": "An adjective describing the shoes is needed.",
    "word-8": "A noun naming a person who cooks is needed.",
    "word-9": "An adjective describing the food is needed.",
    "word-10": "An adjective is needed after is very."
  };

  const readingFeedback = {
    "reading-1": "True — the first paragraph says Emma is fifteen years old.",
    "reading-2": "False — the text says she used to buy clothes every month, not every week.",
    "reading-3": "True — Emma changed her habits last year and began visiting charity shops.",
    "reading-4": "True — her family plans meals for the week.",
    "reading-5": "False — Emma is saving money for hiking boots, not trainers."
  };

  function normalizeReviewAnswer(value) {
    return value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  }

  function saveReviewValue(key, value) {
    try {
      localStorage.setItem(reviewPrefix + key, value);
    } catch (error) {
      console.warn("Review saving is unavailable.", error);
    }
  }

  function getSavedReviewValue(key) {
    try {
      return localStorage.getItem(reviewPrefix + key);
    } catch (error) {
      return null;
    }
  }

  function restoreReviewAnswers(review) {
    review.querySelectorAll("[data-review-save]").forEach(field => {
      const key = field.dataset.reviewSave;
      const saved = getSavedReviewValue(key);

      if (saved === null) return;

      if (field.type === "radio") {
        field.checked = field.value === saved;
      } else {
        field.value = saved;
      }
    });

    ["vocabulary", "grammar", "word-formation", "reading"].forEach(task => {
      const savedScore = getSavedReviewValue("score-" + task);
      const result = document.getElementById(
        "review-" + task + "-result"
      );

      if (savedScore !== null && result) {
        result.dataset.score = savedScore;
        result.textContent =
          "Previously checked result: " + savedScore +
          " points. You can check again after changing your answers.";
      }
    });

    updateReviewTotal();
  }

  function clearReviewFeedback(container) {
    container.querySelectorAll(
      ".review-correct, .review-wrong"
    ).forEach(element => {
      element.classList.remove("review-correct", "review-wrong");
    });

    container.querySelectorAll(".review-answer-comment").forEach(element => {
      element.remove();
    });
  }

  function addReviewComment(container, message) {
    const comment = document.createElement("p");
    comment.className = "review-answer-comment";
    comment.textContent = message;
    container.appendChild(comment);
  }

  function showReviewResult(task, score, maximum, answered, total) {
    const result = document.getElementById(
      "review-" + task + "-result"
    );

    if (!result) return;

    result.dataset.score = String(score);
    saveReviewValue("score-" + task, String(score));

    if (answered < total) {
      result.textContent =
        "Answered: " + answered + "/" + total +
        ". Current score: " + score + "/" + maximum +
        ". Complete the remaining questions and check again.";
    } else {
      result.textContent =
        "Your result: " + score + "/" + maximum + " points.";
    }

    updateReviewTotal();
  }

  function updateReviewTotal() {
    const tasks = [
      "vocabulary",
      "grammar",
      "word-formation",
      "reading"
    ];

    let totalScore = 0;

    tasks.forEach(task => {
      const result = document.getElementById(
        "review-" + task + "-result"
      );

      if (result && result.dataset.score !== undefined) {
        totalScore += Number(result.dataset.score) || 0;
      }
    });

    const scoreElement = document.getElementById("review-total-score");
    const progressElement = document.getElementById("review-progress-fill");

    if (scoreElement) {
      scoreElement.textContent = totalScore + " / 35";
    }

    if (progressElement) {
      progressElement.style.width = (totalScore / 35 * 100) + "%";
    }
  }

  /* TASK 1 — VOCABULARY */

  function checkReviewVocabulary() {
    const section = document.getElementById("review-vocabulary");
    if (!section) return;

    clearReviewFeedback(section);

    let score = 0;
    let answered = 0;

    Object.entries(reviewAnswers.vocabulary).forEach(([key, accepted]) => {
      const input = section.querySelector(
        '[data-review-answer="' + key + '"]'
      );

      if (!input) return;

      const value = normalizeReviewAnswer(input.value);
      const wrapper = input.closest(".review-fill-question");

      if (!value) return;

      answered++;

      if (accepted.includes(value)) {
        score++;
        wrapper.classList.add("review-correct");
      } else {
        wrapper.classList.add("review-wrong");
        addReviewComment(
          wrapper,
          "Correct answer: " + accepted[0] + "."
        );
      }
    });

    showReviewResult("vocabulary", score, 10, answered, 10);
  }

  /* TASK 2 — GRAMMAR */

  function checkReviewGrammar() {
    const section = document.getElementById("review-grammar");
    if (!section) return;

    clearReviewFeedback(section);

    let score = 0;
    let answered = 0;

    Object.entries(reviewAnswers.grammar).forEach(([key, correct]) => {
      const question = section.querySelector(
        '[data-review-question="' + key + '"]'
      );

      const selected = section.querySelector(
        'input[name="' + key + '"]:checked'
      );

      if (!question || !selected) return;

      answered++;

      if (selected.value === correct) {
        score++;
        question.classList.add("review-correct");
      } else {
        question.classList.add("review-wrong");

        const correctInput = section.querySelector(
          'input[name="' + key + '"][value="' + correct + '"]'
        );

        const correctLabel = correctInput
          ? correctInput.parentElement.textContent.trim()
          : correct;

        addReviewComment(
          question,
          "Correct answer: " + correctLabel + ". " +
          grammarFeedback[key]
        );
      }
    });

    showReviewResult("grammar", score, 10, answered, 10);
  }

  /* TASK 3 — WORD FORMATION */

  function checkReviewWordFormation() {
    const section = document.getElementById("review-word-formation");
    if (!section) return;

    clearReviewFeedback(section);

    let score = 0;
    let answered = 0;

    Object.entries(reviewAnswers.wordFormation).forEach(([key, correct]) => {
      const input = section.querySelector(
        '[data-review-answer="' + key + '"]'
      );

      if (!input) return;

      const value = normalizeReviewAnswer(input.value);
      const wrapper = input.closest(".review-fill-question");

      if (!value) return;

      answered++;

      if (value === correct) {
        score++;
        wrapper.classList.add("review-correct");
      } else {
        wrapper.classList.add("review-wrong");

        addReviewComment(
          wrapper,
          "Correct answer: " + correct + ". " +
          wordFormationFeedback[key]
        );
      }
    });

    showReviewResult("word-formation", score, 10, answered, 10);
  }

  /* TASK 4 — READING */

  function checkReviewReading() {
    const section = document.getElementById("review-reading");
    if (!section) return;

    clearReviewFeedback(section);

    let score = 0;
    let answered = 0;

    Object.entries(reviewAnswers.reading).forEach(([key, correct]) => {
      const question = section.querySelector(
        '[data-review-question="' + key + '"]'
      );

      const selected = section.querySelector(
        'input[name="' + key + '"]:checked'
      );

      if (!question || !selected) return;

      answered++;

      if (selected.value === correct) {
        score++;
        question.classList.add("review-correct");
      } else {
        question.classList.add("review-wrong");

        addReviewComment(
          question,
          "Correct answer: " + correct + ". " +
          readingFeedback[key]
        );
      }
    });

    showReviewResult("reading", score, 5, answered, 5);
  }

  /* INITIALIZATION */

  function initReviewSection() {
    const review = document.getElementById("page-review");

    if (!review || review.dataset.reviewInitialized === "true") return;

    review.dataset.reviewInitialized = "true";

    restoreReviewAnswers(review);

    review.addEventListener("input", event => {
      const field = event.target;

      if (field.matches("[data-review-save]") && field.type !== "radio") {
        saveReviewValue(field.dataset.reviewSave, field.value);
      }
    });

    review.addEventListener("change", event => {
      const field = event.target;

      if (field.matches('input[type="radio"][data-review-save]')) {
        if (field.checked) {
          saveReviewValue(field.dataset.reviewSave, field.value);
        }
      }
    });

    review.querySelectorAll("[data-review-check]").forEach(button => {
      button.addEventListener("click", () => {
        const task = button.dataset.reviewCheck;

        if (task === "vocabulary") checkReviewVocabulary();
        if (task === "grammar") checkReviewGrammar();
        if (task === "word-formation") checkReviewWordFormation();
        if (task === "reading") checkReviewReading();
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initReviewSection);
  } else {
    initReviewSection();
  }
})();


/* =========================================
   CHECKLIST — SAVING AND PROGRESS
========================================= */

(() => {
  function initChecklist() {
    const root = document.getElementById("page-checklist");

    if (!root || root.dataset.checklistInitialized === "true") {
      return;
    }

    root.dataset.checklistInitialized = "true";

    const checkboxes = Array.from(
      root.querySelectorAll(".course-check")
    );

    const completedDisplay = root.querySelector("#checklist-completed");
    const progressFill = root.querySelector("#checklist-progress-fill");
    const progressMessage = root.querySelector("#checklist-progress-message");
    const resetButton = root.querySelector("#checklist-reset");

    const storagePrefix = "shoppingEditChecklist_";

    function updateChecklistProgress() {
      const completed = checkboxes.filter(
        checkbox => checkbox.checked
      ).length;

      const total = checkboxes.length;
      const percentage = total ? (completed / total) * 100 : 0;

      if (completedDisplay) {
        completedDisplay.textContent = completed;
      }

      if (progressFill) {
        progressFill.style.width = `${percentage}%`;
      }

      if (progressMessage) {
        if (completed === total) {
          progressMessage.textContent =
            "Великолепно! Ты завершил(а) весь план блока Shopping! 👑";
        } else if (completed >= 7) {
          progressMessage.textContent =
            "Ты уже почти у цели! Осталось совсем немного! 💗";
        } else if (completed >= 4) {
          progressMessage.textContent =
            "Отличный прогресс! Продолжай в том же духе! ✨";
        } else if (completed > 0) {
          progressMessage.textContent =
            "Хорошее начало! Каждый пройденный раздел приближает тебя к цели! 🌸";
        } else {
          progressMessage.textContent =
            "Твоё путешествие по теме Shopping начинается! 💗";
        }
      }
    }

    // Восстанавливаем сохранённые отметки.
    checkboxes.forEach(checkbox => {
      const id = checkbox.dataset.checkId;
      const storageKey = storagePrefix + id;

      try {
        checkbox.checked = localStorage.getItem(storageKey) === "true";
      } catch (error) {
        console.warn("Не удалось восстановить отметку чек-листа.", error);
      }

      // Сохраняем каждое изменение автоматически.
      checkbox.addEventListener("change", () => {
        try {
          localStorage.setItem(storageKey, String(checkbox.checked));
        } catch (error) {
          console.warn("Не удалось сохранить отметку чек-листа.", error);
        }

        updateChecklistProgress();
      });
    });

    // Сброс всех отметок.
    if (resetButton) {
      resetButton.addEventListener("click", () => {
        const confirmed = window.confirm(
          "Ты действительно хочешь сбросить все отметки чек-листа?"
        );

        if (!confirmed) return;

        checkboxes.forEach(checkbox => {
          checkbox.checked = false;

          try {
            localStorage.removeItem(
              storagePrefix + checkbox.dataset.checkId
            );
          } catch (error) {
            console.warn("Не удалось сбросить отметку.", error);
          }
        });

        updateChecklistProgress();
      });
    }

    updateChecklistProgress();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initChecklist);
  } else {
    initChecklist();
  }
})();

/* =========================================
   HOMEWORK — BLOCK Д · LISTENING
   Saving answers and automatic checking
========================================= */

(() => {
  const homeworkStoragePrefix = "shoppingEdit_homework_";

  /*
    ANSWER KEYS
    Source: "для раздела домашшка.docx"
  */

  const homeworkListeningKeys = {
    "listen1-mc": {
      "listen1-1": "2",
      "listen1-2": "2",
      "listen1-3": "1",
      "listen1-4": "3"
    },

    "listen1-match": {
      "A": "5",
      "B": "1",
      "C": "6",
      "D": "3",
      "E": "2"
    },

    "listen1-table": {
      "listen1-table-1": "twenty",
      "listen1-table-2": "canada",
      "listen1-table-3": "pizza",
      "listen1-table-4": "dentist",
      "listen1-table-5": "cooking",
      "listen1-table-6": "train"
    },

    "listen2-mc": {
      "listen2-1": "1",
      "listen2-2": "3",
      "listen2-3": "3",
      "listen2-4": "2"
    },

    "listen2-match": {
      "A": "1",
      "B": "5",
      "C": "3",
      "D": "6",
      "E": "2"
    },

    "listen2-table": {
      "listen2-table-1": "geography",
      "listen2-table-2": "photography",
      "listen2-table-3": "eighteen",
      "listen2-table-4": "spanish",
      "listen2-table-5": "volleyball",
      "listen2-table-6": "horse"
    }
  };

  function normalizeHomeworkValue(value) {
    return String(value)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  }

  function saveHomeworkValue(key, value) {
    try {
      localStorage.setItem(
        homeworkStoragePrefix + key,
        value
      );
    } catch (error) {
      console.warn("Homework answer could not be saved.", error);
    }
  }

  function getHomeworkValue(key) {
    try {
      return localStorage.getItem(
        homeworkStoragePrefix + key
      );
    } catch (error) {
      return null;
    }
  }

  function restoreHomeworkAnswers(section) {
    section.querySelectorAll("[data-homework-save]").forEach(field => {
      const key = field.dataset.homeworkSave;
      const savedValue = getHomeworkValue(key);

      if (savedValue === null) return;

      if (field.type === "radio") {
        field.checked = field.value === savedValue;
      } else {
        field.value = savedValue;
      }
    });

    section.querySelectorAll(
      'input[type="radio"][name]'
    ).forEach(field => {
      const savedValue = getHomeworkValue(field.name);

      if (savedValue !== null) {
        field.checked = field.value === savedValue;
      }
    });
  }

  function clearHomeworkFeedback(task) {
    task.querySelectorAll(
      ".homework-correct, .homework-wrong, .homework-unanswered"
    ).forEach(element => {
      element.classList.remove(
        "homework-correct",
        "homework-wrong",
        "homework-unanswered"
      );
    });

    task.querySelectorAll(".homework-feedback").forEach(element => {
      element.remove();
    });
  }

  function addHomeworkFeedback(container, text) {
    const feedback = document.createElement("p");
    feedback.className = "homework-feedback";
    feedback.textContent = text;
    container.appendChild(feedback);
  }

  function showHomeworkResult(resultId, score, total, answered) {
    const result = document.getElementById(resultId);
    if (!result) return;

    if (answered < total) {
      result.textContent =
        "Проверено: " + answered + " из " + total +
        ". Правильных ответов: " + score +
        ". Заполни оставшиеся поля и проверь ещё раз.";
    } else {
      result.textContent =
        "Результат: " + score + " из " + total + " правильных ответов.";
    }
  }

  /* MULTIPLE CHOICE — TASKS 1–4 */

  function checkHomeworkMultipleChoice(taskId) {
    const task = document.querySelector(
      '[data-homework-check="' + taskId + '"]'
    )?.closest(".homework-task");

    if (!task) return;

    clearHomeworkFeedback(task);

    const keys = homeworkListeningKeys[taskId];
    let score = 0;
    let answered = 0;

    Object.entries(keys).forEach(([questionName, correctAnswer]) => {
      const question = task.querySelector(
        '[data-homework-question="' + questionName + '"]'
      );

      const selected = task.querySelector(
        'input[name="' + questionName + '"]:checked'
      );

      if (!question) return;

      if (!selected) {
        question.classList.add("homework-unanswered");
        addHomeworkFeedback(question, "Ответ пока не выбран.");
        return;
      }

      answered++;

      if (selected.value === correctAnswer) {
        score++;
        question.classList.add("homework-correct");
        addHomeworkFeedback(question, "✓ Правильно!");
      } else {
        question.classList.add("homework-wrong");
        addHomeworkFeedback(
          question,
          "Правильный ответ: " + correctAnswer + "."
        );
      }
    });

    showHomeworkResult(
      "result-" + taskId,
      score,
      Object.keys(keys).length,
      answered
    );
  }

  /* MATCHING — TASK 5 */

  function checkHomeworkMatching(taskId) {
    const button = document.querySelector(
      '[data-homework-check="' + taskId + '"]'
    );

    const task = button?.closest(".homework-subtask");
    if (!task) return;

    clearHomeworkFeedback(task);

    const keys = homeworkListeningKeys[taskId];
    let score = 0;
    let answered = 0;

    Object.entries(keys).forEach(([letter, correctAnswer]) => {
      const select = task.querySelector(
        '[data-homework-save="' +
        taskId.replace("-match", "-match-" + letter) +
        '"]'
      );

      if (!select) return;

      const wrapper = select.closest("label");

      if (!select.value) {
        wrapper.classList.add("homework-unanswered");
        addHomeworkFeedback(wrapper, "Выбери номер.");
        return;
      }

      answered++;

      if (select.value === correctAnswer) {
        score++;
        wrapper.classList.add("homework-correct");
        addHomeworkFeedback(wrapper, "✓");
      } else {
        wrapper.classList.add("homework-wrong");
        addHomeworkFeedback(
          wrapper,
          "Правильный ответ: " + correctAnswer + "."
        );
      }
    });

    showHomeworkResult(
      "result-" + taskId,
      score,
      Object.keys(keys).length,
      answered
    );
  }

  /* TABLE — TASK 6 */

  function checkHomeworkTable(taskId) {
    const button = document.querySelector(
      '[data-homework-check="' + taskId + '"]'
    );

    const task = button?.closest(".homework-subtask");
    if (!task) return;

    clearHomeworkFeedback(task);

    const keys = homeworkListeningKeys[taskId];
    let score = 0;
    let answered = 0;

    Object.entries(keys).forEach(([fieldKey, correctAnswer]) => {
      const input = task.querySelector(
        '[data-homework-save="' + fieldKey + '"]'
      );

      if (!input) return;

      const wrapper = input.closest("label");
      const value = normalizeHomeworkValue(input.value);

      if (!value) {
        wrapper.classList.add("homework-unanswered");
        addHomeworkFeedback(wrapper, "Впиши ответ.");
        return;
      }

      answered++;

      if (value === correctAnswer) {
        score++;
        wrapper.classList.add("homework-correct");
        addHomeworkFeedback(wrapper, "✓ Правильно!");
      } else {
        wrapper.classList.add("homework-wrong");
        addHomeworkFeedback(
          wrapper,
          "Правильный ответ: " + correctAnswer + "."
        );
      }
    });

    showHomeworkResult(
      "result-" + taskId,
      score,
      Object.keys(keys).length,
      answered
    );
  }

  /* INITIALIZATION */

  function initHomeworkListening() {
    const section = document.getElementById("page-homework");

    if (!section || section.dataset.homeworkListeningReady === "true") {
      return;
    }

    section.dataset.homeworkListeningReady = "true";

    restoreHomeworkAnswers(section);

    section.addEventListener("input", event => {
      const field = event.target;

      if (field.matches("[data-homework-save]")) {
        saveHomeworkValue(
          field.dataset.homeworkSave,
          field.value
        );
      }
    });

    section.addEventListener("change", event => {
      const field = event.target;

      if (field.matches("[data-homework-save]")) {
        saveHomeworkValue(
          field.dataset.homeworkSave,
          field.value
        );
      }

      if (field.matches('input[type="radio"][name]')) {
        if (field.checked) {
          saveHomeworkValue(field.name, field.value);
        }
      }
    });

    section.querySelectorAll("[data-homework-check]").forEach(button => {
      button.addEventListener("click", () => {
        const taskId = button.dataset.homeworkCheck;

        if (taskId.endsWith("-mc")) {
          checkHomeworkMultipleChoice(taskId);
        } else if (taskId.endsWith("-match")) {
          checkHomeworkMatching(taskId);
        } else if (taskId.endsWith("-table")) {
          checkHomeworkTable(taskId);
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initHomeworkListening
    );
  } else {
    initHomeworkListening();
  }
})();

/* =========================================
   HOMEWORK — READING: AUTO CHECK
========================================= */

document.addEventListener("DOMContentLoaded", () => {
  const readingAnswers = {
    task1: {
      1: "F",
      2: "A",
      3: "",
      4: "B",
      5: "C",
      6: "E",
      7: "D"
    },

    task2: {
      1: "F",
      2: "A",
      3: "",
      4: "B",
      5: "C",
      6: "E",
      7: "D"
    },

    task3: {
      1: "True",
      2: "Not Stated",
      3: "True",
      4: "False",
      5: "False",
      6: "True",
      7: "Not Stated"
    },

    task4: {
      1: "True",
      2: "False",
      3: "Not Stated",
      4: "False",
      5: "True",
      6: "False",
      7: "Not Stated"
    }
  };

  document.querySelectorAll("[data-check-reading]").forEach(button => {
    button.addEventListener("click", () => {
      const task = button.dataset.checkReading;
      const answers = readingAnswers[task];

      if (!answers) return;

      const fields = document.querySelectorAll(
        `[data-hw-reading="${task}"]`
      );

      const result = document.getElementById(
        `hw-reading-result-${task}`
      );

      if (!result || fields.length === 0) return;

      let correct = 0;
      let total = 0;
      let unanswered = 0;

      fields.forEach(field => {
        const number = Number(field.id.match(/-(\d+)$/)?.[1]);

        if (!number || !(number in answers)) return;

        const expected = String(answers[number]).trim().toLowerCase();
        const actual = String(field.value).trim().toLowerCase();

        field.classList.remove("hw-correct", "hw-incorrect");

        // В заданиях 1 и 2 третий вопрос лишний:
        // его нужно оставить без ответа.
        if (expected === "") {
          total++;

          if (actual === "") {
            correct++;
            field.classList.add("hw-correct");
          } else {
            field.classList.add("hw-incorrect");
          }

          return;
        }

        total++;

        if (actual === "") {
          unanswered++;
          field.classList.add("hw-incorrect");
        } else if (actual === expected) {
          correct++;
          field.classList.add("hw-correct");
        } else {
          field.classList.add("hw-incorrect");
        }
      });

      const percentage = Math.round((correct / total) * 100);

      result.classList.remove(
        "hw-result-success",
        "hw-result-error"
      );

      if (correct === total) {
        result.classList.add("hw-result-success");
        result.textContent =
          `🎉 Отлично! Правильных ответов: ${correct} из ${total}.`;
      } else {
        result.classList.add("hw-result-error");

        let message =
          `Правильных ответов: ${correct} из ${total} (${percentage}%).`;

        if (unanswered > 0) {
          message += ` Не заполнено ответов: ${unanswered}.`;
        }

        message += " Проверь выделенные поля и попробуй ещё раз.";
        result.textContent = message;
      }
    });
  });
});

/* =========================================
   HOMEWORK — GRAMMAR: ANSWER CHECK
========================================= */

document.addEventListener("DOMContentLoaded", () => {
  const grammarHomework = {
    1: {
      answers: {
        1: ["leaves"],
        2: ["were"],
        3: ["the best"],
        4: ["her"],
        5: ["bought"],
        6: ["did not hear", "didn't hear"],
        7: ["is making"],
        8: ["was decorated"],
        9: ["liked"]
      },
      comments: {
        1: "Множественное число от leaf образуется заменой -f на -ves.",
        2: "Past Simple глагола to be: речь идёт о множестве вещей, которые были характерны для осени.",
        3: "Превосходная степень прилагательного good — the best.",
        4: "Притяжательное местоимение перед существительным mother.",
        5: "Past Simple: действие произошло однажды в прошлом (one day).",
        6: "Past Simple в отрицательной форме.",
        7: "Present Continuous: мать чувствует запах пирога и спрашивает, кто готовит его сейчас.",
        8: "Past Simple Passive: пирог был украшен орехами и цветным сахаром.",
        9: "Past Simple: передаётся реакция матери после того, как она попробовала пирог."
      }
    },

    2: {
      answers: {
        1: ["did not like", "didn't like"],
        2: ["will lose"],
        3: ["went"],
        4: ["best"],
        5: ["was"],
        6: ["policemen"],
        7: ["him"],
        8: ["knew"],
        9: ["had been bought"]
      },
      comments: {
        1: "Past Simple: привычка или отношение начальника в прошлом.",
        2: "First Conditional: If + Present Simple, will + infinitive.",
        3: "Past Simple: регулярное действие в прошлом (sometimes).",
        4: "Превосходная степень good — best. Конструкция: the best job he had ever had.",
        5: "Past Simple: описывается звук после столкновения.",
        6: "Множественное число: policeman → policemen.",
        7: "Объектное местоимение после глагола take: It took him 20 minutes.",
        8: "После I wish для выражения сожаления о настоящем используется Past Simple.",
        9: "Past Perfect Passive: покупка автомобиля произошла раньше момента, о котором говорит начальник."
      }
    },

    3: {
      answers: {
        1: ["do not want", "don't want"],
        2: ["their"],
        3: ["gave"],
        4: ["are"],
        5: ["could"],
        6: ["fifth"],
        7: ["children"],
        8: ["better"],
        9: ["liked"]
      },
      comments: {
        1: "Present Simple: Tracey говорит о своём нежелании идти в школу сегодня.",
        2: "Притяжательное местоимение перед существительным family.",
        3: "Past Simple: отец обнял дочь в прошлом.",
        4: "Present Simple в придаточном времени с when: When your classes are over.",
        5: "После I wish для выражения желания изменить настоящую ситуацию используется Past Simple; форма can — could.",
        6: "Порядковое числительное: fifth grade.",
        7: "Неправильная форма множественного числа: child → children.",
        8: "Сравнительная степень good — better: Tracey почувствовала себя немного лучше.",
        9: "Past Simple: передаётся ответ Tracey о прошедшем школьном дне."
      }
    },

    4: {
      answers: {
        1: ["first"],
        2: ["gets"],
        3: ["cannot", "can't"],
        4: ["babies"],
        5: ["had"],
        6: ["better"],
        7: ["haven't found", "have not found"],
        8: ["could"],
        9: ["was raining"]
      },
      comments: {
        1: "One → first — порядковое числительное: «первое прозвище».",
        2: "Present Simple: общее описание реакции кожи на солнце.",
        3: "Отрицательная форма модального глагола can: «я не могу узнать себя».",
        4: "Множественное число от baby: babies.",
        5: "Past Simple: в детстве маме приходилось наносить защитный крем.",
        6: "Сравнительная степень от good: better.",
        7: "Present Perfect: до настоящего момента лекарство не найдено.",
        8: "I wish + Past Simple — желание, которое невозможно или маловероятно осуществить сейчас.",
        9: "Past Continuous: дождь шёл в момент рождения рассказчицы."
      }
    },

    5: {
      answers: {
        1: ["haven't heard", "have not heard"],
        2: ["knew"],
        3: ["centuries"],
        4: ["left"],
        5: ["was spoken"],
        6: ["twentieth"],
        7: ["is offered"],
        8: ["most difficult"],
        9: ["will survive"]
      },
      comments: {
        1: "Present Perfect с of: «вы, наверное, не слышали о корнском языке».",
        2: "I wish + Past Simple — сожаление о том, что сейчас не знаешь язык.",
        3: "Множественное число: centuries ago — «столетия назад».",
        4: "Past Simple от leave: историческое событие в прошлом.",
        5: "Past Simple Passive: язык использовался / на нём говорили до конца XVIII века.",
        6: "Порядковое числительное: the twentieth century.",
        7: "Present Simple Passive: язык предлагается как предмет изучения в университетах.",
        8: "Превосходная степень: the most difficult language.",
        9: "Future Simple: прогноз о будущем языка."
      }
    },

    6: {
      answers: {
        1: ["her"],
        2: ["parties"],
        3: ["were written"],
        4: ["agreed"],
        5: ["will help"],
        6: ["were"],
        7: ["couldn't", "could not"],
        8: ["knew"],
        9: ["kinder"]
      },
      comments: {
        1: "Притяжательное местоимение: her unusual gift — её необычный талант.",
        2: "Множественное число от party: parties and events.",
        3: "Past Simple Passive: сценарии и программы были написаны Джейн. Подлежащее во множественном числе.",
        4: "Past Simple: Джейн сразу согласилась.",
        5: "Future Simple: обещание / готовность помочь.",
        6: "Согласование времён в косвенном вопросе: what her favourite films, colours, and flowers were.",
        7: "Прошедшая форма can't: рассказчик не мог ответить на большинство вопросов.",
        8: "Second Conditional: If + Past Simple, would + infinitive.",
        9: "Сравнительная степень от kind: «добрее к ним»."
      }
    }
  };

  function normalizeGrammarAnswer(value) {
    return String(value)
      .trim()
      .toLowerCase()
      .replace(/[’‘]/g, "'")
      .replace(/\s+/g, " ");
  }

  document.querySelectorAll("[data-hg-check]").forEach(button => {
    button.addEventListener("click", () => {
      const taskNumber = button.dataset.hgCheck;
      const task = grammarHomework[taskNumber];

      if (!task) return;

      const fields = document.querySelectorAll(
        `[data-hg-task="${taskNumber}"]`
      );

      const result = document.getElementById(
        `hg-result-${taskNumber}`
      );

      if (!result || fields.length === 0) return;

      let correct = 0;
      let total = 0;
      let feedback = [];

      fields.forEach(field => {
        const number = field.dataset.hgN;
        const possibleAnswers = task.answers[number];

        if (!possibleAnswers) return;

        total++;

        const userAnswer = normalizeGrammarAnswer(field.value);
        const isCorrect = possibleAnswers.some(answer =>
          normalizeGrammarAnswer(answer) === userAnswer
        );

        field.classList.remove("hg-correct", "hg-incorrect");

        if (isCorrect) {
          correct++;
          field.classList.add("hg-correct");
        } else {
          field.classList.add("hg-incorrect");

          const correctAnswer = possibleAnswers[0];
          const explanation = task.comments[number];

          feedback.push(
            `<div class="hg-feedback-item">
              <strong>№ ${number}.</strong>
              Правильный ответ: <strong>${correctAnswer}</strong>.
              ${explanation || ""}
            </div>`
          );
        }
      });

      const percentage = Math.round((correct / total) * 100);

      result.classList.add("visible");
      result.classList.remove("success", "has-errors");

      if (correct === total) {
        result.classList.add("success");
        result.innerHTML =
          `🎉 Отлично! Все ответы правильные: ${correct} из ${total}.`;
      } else {
        result.classList.add("has-errors");
        result.innerHTML =
          `<strong>Результат: ${correct} из ${total} (${percentage}%).</strong>
           <p>Посмотри пояснения к ошибкам:</p>
           ${feedback.join("")}`;
      }
    });
  });
});

/* =========================================
   HOMEWORK — WORD FORMATION: AUTO CHECK
========================================= */

document.addEventListener("DOMContentLoaded", () => {
  const wordFormationAnswers = {
    3: {
      answers: {
        1: ["unusual"],
        2: ["population"],
        3: ["traditional"],
        4: ["recently"],
        5: ["effective"],
        6: ["disappear"]
      },
      comments: {
        1: "К слову usual добавляется отрицательная приставка un-: unusual — необычный.",
        2: "Нужно существительное population — население.",
        3: "Перед существительным treatment требуется прилагательное traditional — традиционный.",
        4: "Наречие времени recently — недавно.",
        5: "После very требуется прилагательное effective — эффективный.",
        6: "Нужен глагол disappear — исчезать. Приставка dis- меняет значение слова."
      }
    },

    4: {
      answers: {
        1: ["traditional"],
        2: ["geographical", "geographic"],
        3: ["famous"],
        4: ["tasty"],
        5: ["fishing"],
        6: ["imagination"]
      },
      comments: {
        1: "Перед существительным dishes требуется прилагательное traditional — традиционные блюда.",
        2: "Перед существительным position требуется прилагательное geographical или geographic — географическое положение.",
        3: "Конструкция is famous for означает «известна благодаря чему-либо».",
        4: "Перед существительным meat dishes требуется прилагательное tasty — вкусные блюда.",
        5: "Fishing culture — рыболовная культура. Fishing используется как определение.",
        6: "После притяжательного местоимения your требуется существительное imagination — воображение."
      }
    },

    5: {
      answers: {
        1: ["scientist"],
        2: ["drinking"],
        3: ["exciting"],
        4: ["explanation"],
        5: ["healthy"],
        6: ["probably"]
      },
      comments: {
        1: "Нужно существительное, обозначающее профессию: scientist — учёный.",
        2: "Drinking water — питьевая вода. Drinking используется как определение.",
        3: "Перед существительным book требуется прилагательное exciting — захватывающий.",
        4: "После артикля an требуется существительное explanation — объяснение.",
        5: "После stay требуется прилагательное healthy — здоровый.",
        6: "Вводное слово probably — вероятно. Здесь требуется наречие."
      }
    },

    6: {
      answers: {
        1: ["amazing"],
        2: ["healthy"],
        3: ["swimming"],
        4: ["friendly"],
        5: ["wonderful"],
        6: ["peaceful"]
      },
      comments: {
        1: "Перед существительным life требуется прилагательное amazing — удивительная жизнь.",
        2: "После stay требуется прилагательное healthy — здоровыми.",
        3: "Swimming pools — плавательные бассейны. Swimming используется как определение.",
        4: "После are требуется прилагательное friendly — дружелюбные.",
        5: "После is требуется прилагательное wonderful — прекрасная.",
        6: "После most требуется прилагательное peaceful — мирная."
      }
    }
  };

  function normalizeWordFormation(value) {
    return String(value)
      .trim()
      .toLowerCase()
      .replace(/[’‘]/g, "'")
      .replace(/\s+/g, " ");
  }

  document.querySelectorAll("[data-word-check]").forEach(button => {
    button.addEventListener("click", () => {
      const taskNumber = button.dataset.wordCheck;
      const task = wordFormationAnswers[taskNumber];

      if (!task) return;

      const fields = document.querySelectorAll(
        `[data-word-task="${taskNumber}"]`
      );

      const result = document.getElementById(
        `hw-word-result-${taskNumber}`
      );

      if (!result || fields.length === 0) return;

      let correct = 0;
      let total = 0;
      const feedback = [];

      fields.forEach(field => {
        const number = field.dataset.wordN;
        const possibleAnswers = task.answers[number];

        if (!possibleAnswers) return;

        total++;

        const userAnswer = normalizeWordFormation(field.value);

        const isCorrect = possibleAnswers.some(answer =>
          normalizeWordFormation(answer) === userAnswer
        );

        field.classList.remove(
          "hw-word-correct",
          "hw-word-incorrect"
        );

        if (isCorrect) {
          correct++;
          field.classList.add("hw-word-correct");
        } else {
          field.classList.add("hw-word-incorrect");

          feedback.push(
            `<div class="hw-word-feedback">
              <strong>№ ${number}.</strong>
              Правильный ответ:
              <strong>${possibleAnswers[0]}</strong>.
              ${task.comments[number]}
            </div>`
          );
        }
      });

      const percentage = Math.round((correct / total) * 100);

      result.classList.add("visible");
      result.classList.remove("success", "has-errors");

      if (correct === total) {
        result.classList.add("success");
        result.textContent =
          `🎉 Прекрасно! Все ответы правильные: ${correct} из ${total}.`;
      } else {
        result.classList.add("has-errors");
        result.innerHTML =
          `<strong>Результат: ${correct} из ${total} (${percentage}%).</strong>
           <p>Разбери ошибки и попробуй ещё раз:</p>
           ${feedback.join("")}`;
      }
    });
  });
});

/* =========================================
   GRAMMAR REVISION BANK — ANSWERS & CHECKING
========================================= */

document.addEventListener("DOMContentLoaded", () => {
  const grammarBank = {
    1: {
      answers: {
        1: ["buys"],
        2: ["is helping"],
        3: ["went"],
        4: ["was looking"],
        5: ["was cooking"],
        6: ["have never bought"],
        7: ["visited"],
        8: ["has gone"],
        9: ["have already paid"],
        10: ["did you do"]
      },
      comments: {
        1: "Present Simple: a regular habit (usually).",
        2: "Present Continuous: an action happening now (Look!).",
        3: "Past Simple: a completed action at a definite time (last Saturday).",
        4: "Past Continuous: an action in progress when another action happened.",
        5: "Past Continuous: the longer background action; went is the shorter action.",
        6: "Present Perfect: life experience up to now; no definite past time is given.",
        7: "Past Simple: yesterday indicates a finished past time.",
        8: "He went to the shopping centre and is still there or on his way.",
        9: "Present Perfect: the action is completed and its result is important now.",
        10: "Past Simple: last month is a finished period."
      }
    },

    2: {
      answers: {
        1: ["a"],
        2: ["the"],
        3: ["—", "-", "no article"],
        4: ["the"],
        5: ["a"],
        6: ["the"],
        7: ["—", "-", "no article"],
        8: ["a"],
        9: ["the"],
        10: ["a"]
      },
      comments: {
        1: "First mention of a singular countable noun.",
        2: "The jacket has already been mentioned.",
        3: "Money is an uncountable noun used in a general meaning.",
        4: "A particular supermarket, identified by near our house.",
        5: "A profession; one of many shop assistants.",
        6: "A particular café's food.",
        7: "Music is an uncountable noun used generally.",
        8: "First mention of a market.",
        9: "The established expression the city centre.",
        10: "A profession; fashion designer begins with a consonant sound."
      }
    },

    3: {
      answers: {
        1: ["in"],
        2: ["on"],
        3: ["at"],
        4: ["in"],
        5: ["in"],
        6: ["on", "at"],
        7: ["at"],
        8: ["on"],
        9: ["at"],
        10: ["on"]
      },
      comments: {
        1: "In — inside the shopping centre.",
        2: "On — floors of a building: on the second floor.",
        3: "At — a specific point or place: at the entrance.",
        4: "In — something displayed inside a shop window.",
        5: "In — we say in the car.",
        6: "Both on and at are possible in this context: on the corner or at the corner of a street.",
        7: "At the back of the shop refers to a position in the shop.",
        8: "On — we say on a bus.",
        9: "At — fixed expression: at home.",
        10: "On — information appears on a page."
      }
    },

    4: {
      answers: {
        1: ["fifteen"],
        2: ["thirty-two", "thirty two"],
        3: ["one hundred", "a hundred"],
        4: ["twenty-first", "twenty first"],
        5: ["third"],
        6: ["twelfth"],
        7: ["fifty per cent", "fifty percent"],
        8: ["one thousand", "a thousand"],
        9: ["second"],
        10: ["fifth"]
      },
      comments: {
        1: "15 — fifteen.",
        2: "32 — thirty-two.",
        3: "100 — one hundred.",
        4: "21st — twenty-first.",
        5: "3rd — third.",
        6: "12th — twelfth.",
        7: "50% — fifty per cent.",
        8: "1,000 — one thousand.",
        9: "Second — the second time.",
        10: "Fifth — the fifth floor."
      }
    },

    5: {
      answers: {
        1: ["should"],
        2: ["much"],
        3: ["many"],
        4: ["mustn't", "mustnt"],
        5: ["don't have to", "dont have to"],
        6: ["a little"],
        7: ["a few"],
        8: ["don't compare", "dont compare"],
        9: ["reaches"],
        10: ["should"]
      },
      comments: {
        1: "Should — advice: you shouldn't spend all your pocket money on sweets.",
        2: "Much — money is an uncountable noun.",
        3: "Many — people is a countable noun in the plural.",
        4: "Mustn't — prohibition: you are not allowed to touch the products.",
        5: "Don't have to — there is no necessity to buy a new jacket.",
        6: "A little — a small amount of the uncountable noun milk.",
        7: "A few — a small number of the countable noun coins.",
        8: "Don't compare — First Conditional uses Present Simple in the if-clause.",
        9: "Reaches — Zero Conditional: a general fact; Present Simple in both clauses.",
        10: "Should — advice to wear comfortable shoes."
      }
    },

    6: {
      answers: {
        1: ["going"],
        2: ["to buy"],
        3: ["to save"],
        4: ["wearing"],
        5: ["to try on"],
        6: ["shopping"],
        7: ["to find"],
        8: ["buying"],
        9: ["stay"],
        10: ["designing"]
      },
      comments: {
        1: "Enjoy + -ing.",
        2: "Want + to-infinitive.",
        3: "Decide + to-infinitive.",
        4: "Don't mind + -ing.",
        5: "Would like + to-infinitive.",
        6: "Prefer + -ing + to + -ing.",
        7: "Hope + to-infinitive.",
        8: "Avoid + -ing.",
        9: "Would rather + infinitive without to.",
        10: "After the preposition in, use the -ing form: interested in designing."
      }
    },

    7: {
      answers: {
        1: ["i usually buy food at this supermarket"],
        2: ["we bought these shoes last week"],
        3: ["while i was trying on a jacket my phone rang"],
        4: ["she has been to london twice"],
        5: ["i bought a dress and the dress was very beautiful"],
        6: ["there are many shops in this street"],
        7: ["you must save some money"],
        8: ["if you spend all your money you won't be able to buy a present"],
        9: ["he enjoys looking at fashion magazines"],
        10: ["the shop is on the second floor"]
      },
      comments: {
        1: "Present Simple is used for habits; usually does not require Present Continuous.",
        2: "Last week is a finished period in the past, so use Past Simple.",
        3: "The longer action in the past takes Past Continuous; the shorter event takes Past Simple.",
        4: "Has been to means that the person visited the place and returned. Has gone to means that the person is there now or is still on the way.",
        5: "Use the when mentioning the same specific object again.",
        6: "Shops is a countable plural noun; use many.",
        7: "After must, use the infinitive without to.",
        8: "In the First Conditional, use Present Simple after if, not Future Simple.",
        9: "After enjoy, use the gerund with -ing.",
        10: "Use the preposition on with floors of a building."
      }
    },

    8: {
      answers: {
        1: ["have saved"],
        2: ["have never been"],
        3: ["haven't bought", "have not bought"],
        4: ["don't have to buy", "do not have to buy"],
        5: ["more expensive than"],
        6: ["entered"],
        7: ["prefer"],
        8: ["aren't", "are not"]
      },
      comments: {
        1: "Present Perfect shows an action that started in the past and continues up to the present.",
        2: "Present Perfect describes life experience; never comes before the main verb.",
        3: "Since May indicates a period from a point in the past until now.",
        4: "Don't have to means there is no necessity.",
        5: "The comparative form of the long adjective expensive is formed with more.",
        6: "Both actions happened in the past; Past Simple is sufficient here.",
        7: "Use the structure prefer doing something to doing something.",
        8: "The if-clause uses Present Simple; the second clause uses the imperative."
      }
    },

    9: {
      answers: {
        1: ["am looking"],
        2: ["have never bought"],
        3: ["have"],
        4: ["does this jacket cost"],
        5: ["on"],
        6: ["at"],
        7: ["was trying"]
      },
      comments: {
        1: "The action is happening at the moment of speaking.",
        2: "Present Perfect describes experience up to the present moment.",
        3: "Present Simple: the shop has a special offer today. Have means 'to have'.",
        4: "Present Simple question: auxiliary does + subject + infinitive.",
        5: "Fixed expression: try on.",
        6: "Fixed expression: at the back of the shop.",
        7: "Past Continuous describes an action in progress in the past when another event happened (called)."
      }
    }
  };

  function normalizeBankAnswer(value) {
    return String(value)
      .trim()
      .toLowerCase()
      .replace(/[’‘]/g, "'")
      .replace(/[.!?,;]/g, "")
      .replace(/\s+/g, " ");
  }

  document.querySelectorAll("[data-bank-check]").forEach(button => {
    button.addEventListener("click", () => {
      const taskNumber = button.dataset.bankCheck;
      const task = grammarBank[taskNumber];

      if (!task) return;

      const result = document.getElementById(
        `bank-result-${taskNumber}`
      );

      const fields = document.querySelectorAll(
        `[data-bank-answer^="${taskNumber}-"]`
      );

      if (!result || fields.length === 0) return;

      let correct = 0;
      let total = 0;
      const feedback = [];

      fields.forEach(field => {
        const questionNumber = field.dataset.bankAnswer.split("-")[1];
        const acceptedAnswers = task.answers[questionNumber];

        if (!acceptedAnswers) return;

        total++;

        const userAnswer = normalizeBankAnswer(field.value);

        const isCorrect = acceptedAnswers.some(answer =>
          normalizeBankAnswer(answer) === userAnswer
        );

        field.classList.remove("bank-correct", "bank-incorrect");

        if (isCorrect) {
          correct++;
          field.classList.add("bank-correct");
        } else {
          field.classList.add("bank-incorrect");

          feedback.push(
            `<div class="bank-feedback-item">
              <strong>№ ${questionNumber}.</strong>
              Correct answer:
              <strong>${acceptedAnswers[0]}</strong>.
              ${task.comments[questionNumber]}
            </div>`
          );
        }
      });

      const percentage = Math.round((correct / total) * 100);

      result.classList.add("visible");
      result.classList.remove("success", "has-errors");

      if (correct === total) {
        result.classList.add("success");
        result.innerHTML =
          `🎉 Excellent! All answers are correct: <strong>${correct}/${total}</strong>.`;
      } else {
        result.classList.add("has-errors");
        result.innerHTML =
          `<strong>Your result: ${correct}/${total} (${percentage}%).</strong>
           <p>Check the incorrect answers and try again:</p>
           ${feedback.join("")}`;
      }
    });
  });
});

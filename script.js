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
  
});

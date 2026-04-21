(function () {
  var storageKey = "ue-books-theme-mode";
  var root = document.documentElement;
  var buttons = Array.prototype.slice.call(
    document.querySelectorAll("[data-theme-option]")
  );
  var media = window.matchMedia("(prefers-color-scheme: dark)");

  function getStoredMode() {
    try {
      return localStorage.getItem(storageKey) || "dark";
    } catch (error) {
      return "dark";
    }
  }

  function resolveTheme(mode) {
    if (mode === "auto") {
      return media.matches ? "dark" : "light";
    }
    return mode === "light" ? "light" : "dark";
  }

  function setTheme(mode, persist) {
    var resolved = resolveTheme(mode);
    root.setAttribute("data-theme", resolved);
    root.setAttribute("data-theme-mode", mode);

    buttons.forEach(function (button) {
      var active = button.getAttribute("data-theme-option") === mode;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });

    if (persist) {
      try {
        localStorage.setItem(storageKey, mode);
      } catch (error) {}
    }
  }

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      setTheme(button.getAttribute("data-theme-option"), true);
    });
  });

  if (typeof media.addEventListener === "function") {
    media.addEventListener("change", function () {
      if (getStoredMode() === "auto") {
        setTheme("auto", false);
      }
    });
  } else if (typeof media.addListener === "function") {
    media.addListener(function () {
      if (getStoredMode() === "auto") {
        setTheme("auto", false);
      }
    });
  }

  setTheme(getStoredMode(), false);
})();

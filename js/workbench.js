(function () {
  const THEME_KEY = "construct.theme";
  const MONACO_VS = "https://cdn.jsdelivr.net/npm/monaco-editor@0.57.0/min/vs";

  const themeBtn = document.getElementById("theme-toggle");
  const runBtn = document.getElementById("run");
  const sideLabel = document.getElementById("side-label");
  const sideBody = document.getElementById("side-body");
  const tabs = document.getElementById("tabs");
  const editorEl = document.getElementById("editor");
  const editorEmpty = document.getElementById("editor-empty");
  const consoleLog = document.getElementById("console-log");
  const replForm = document.getElementById("repl-form");
  const replInput = document.getElementById("repl-input");
  const problemsView = document.getElementById("problems-view");
  const tabOutput = document.getElementById("tab-output");
  const tabProblems = document.getElementById("tab-problems");
  const outputView = document.getElementById("output-view");
  const graphPane = document.getElementById("graph-pane");
  const graphBody = document.getElementById("graph-body");
  const graphClose = document.getElementById("graph-close");
  const statusMode = document.getElementById("status-mode");
  const statusPos = document.getElementById("status-pos");
  const bottom = document.getElementById("bottom");
  const resizer = document.getElementById("panel-resizer");
  const libraryBtn = document.getElementById("activity-library");
  const searchBtn = document.getElementById("activity-search");

  const originals = new Map();
  const models = new Map();
  let files = [];
  let current = null;
  let editor = null;
  let folderOpen = true;
  let activity = "library";
  let searchQuery = "";
  let running = false;
  let history = [];
  let historyAt = -1;
  let lineCount = 0;

  function savedTheme() {
    try {
      const value = localStorage.getItem(THEME_KEY);
      if (value === "dark" || value === "light") return value;
    } catch (err) {}
    return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem(THEME_KEY, theme); } catch (err) {}
    const dark = theme === "dark";
    themeBtn.textContent = dark ? "Light" : "Dark";
    themeBtn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    if (editor && window.monaco) {
      monaco.editor.setTheme(dark ? "construct-dark" : "construct-light");
    }
  }

  function appendLine(level, text) {
    const line = document.createElement("div");
    line.className = "console-line " + level;
    line.textContent = text;
    consoleLog.appendChild(line);
    lineCount += 1;
    while (lineCount > 300 && consoleLog.firstChild) {
      consoleLog.removeChild(consoleLog.firstChild);
      lineCount -= 1;
    }
    consoleLog.scrollTop = consoleLog.scrollHeight;
  }

  function writeStream(level, text) {
    const parts = String(text).split("\n");
    if (parts.length && parts[parts.length - 1] === "") parts.pop();
    if (!parts.length) parts.push("");
    parts.forEach(function (part) { appendLine(level, part); });
  }

  function clearConsole() {
    consoleLog.replaceChildren();
    lineCount = 0;
  }

  function errorText(err) {
    let text = "Error";
    if (err && typeof err.message === "string" && err.message.trim()) text = err.message.trim();
    else if (err) text = String(err);
    const lines = text.split("\n");
    const start = lines.findIndex(function (line) {
      return /File "(<console>|<construct>|library\/)/.test(line);
    });
    if (start > 1) {
      return "Traceback (most recent call last):\n" + lines.slice(start).join("\n");
    }
    return text;
  }

  function clearGraph() {
    graphBody.replaceChildren();
    graphPane.hidden = true;
  }

  function showFigures(figures) {
    if (!figures || !figures.length) return;
    figures.forEach(function (b64, index) {
      const img = document.createElement("img");
      img.alt = "Matplotlib figure " + (graphBody.children.length + 1);
      img.src = "data:image/png;base64," + b64;
      graphBody.appendChild(img);
      void index;
    });
    graphPane.hidden = false;
  }

  function renderProblems(message) {
    problemsView.replaceChildren();
    tabProblems.classList.toggle("has-error", !!message);
    if (!message) {
      const empty = document.createElement("div");
      empty.className = "problem-empty";
      empty.textContent = "No problems.";
      problemsView.appendChild(empty);
      return;
    }
    const button = document.createElement("button");
    button.type = "button";
    button.className = "problem";
    button.textContent = message;
    const match = /File "([^"]+)", line (\d+)/.exec(message);
    if (match && editor) {
      const path = match[1];
      const line = Number(match[2]);
      button.addEventListener("click", function () {
        if (files.indexOf(path) !== -1) showFile(path);
        editor.setPosition({ lineNumber: line, column: 1 });
        editor.revealLineInCenter(line);
        editor.focus();
      });
    }
    problemsView.appendChild(button);
  }

  function showPane(name) {
    const output = name === "output";
    outputView.hidden = !output;
    problemsView.hidden = output;
    tabOutput.setAttribute("aria-selected", output ? "true" : "false");
    tabProblems.setAttribute("aria-selected", output ? "false" : "true");
  }

  function renderTabs() {
    tabs.replaceChildren();
    if (!current) return;
    const tab = document.createElement("div");
    tab.className = "tab";
    const name = current.split("/").pop();
    if (editor && models.get(current) && models.get(current).getValue() !== originals.get(current)) {
      const dot = document.createElement("span");
      dot.className = "dirty-dot";
      dot.title = "Unsaved in this browser";
      tab.appendChild(dot);
    }
    const label = document.createElement("span");
    label.textContent = name;
    const close = document.createElement("button");
    close.type = "button";
    close.className = "tab-close";
    close.setAttribute("aria-label", "Close " + name);
    close.textContent = "×";
    close.addEventListener("click", function () {
      current = null;
      if (editor) editor.setModel(null);
      editorEl.hidden = true;
      editorEmpty.hidden = false;
      renderTabs();
      renderSidebar();
      statusPos.textContent = "Ln 1, Col 1";
    });
    tab.appendChild(label);
    tab.appendChild(close);
    tabs.appendChild(tab);
  }

  function showFile(path) {
    if (!editor || !models.has(path)) return;
    current = path;
    editorEmpty.hidden = true;
    editorEl.hidden = false;
    editor.setModel(models.get(path));
    editor.layout();
    const pos = editor.getPosition();
    if (pos) statusPos.textContent = "Ln " + pos.lineNumber + ", Col " + pos.column;
    renderTabs();
    renderSidebar();
  }

  function fileButton(path) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "file";
    button.dataset.path = path;
    button.textContent = path.split("/").pop();
    if (path === current) button.setAttribute("aria-current", "true");
    button.addEventListener("click", function () { showFile(path); });
    return button;
  }

  function renderSidebar() {
    sideBody.replaceChildren();
    if (activity === "search") {
      sideLabel.textContent = "Search";
      const wrap = document.createElement("div");
      wrap.className = "search-wrap";
      const input = document.createElement("input");
      input.type = "search";
      input.placeholder = "Filter files";
      input.setAttribute("aria-label", "Filter files");
      input.spellcheck = false;
      input.value = searchQuery;
      input.addEventListener("input", function () {
        searchQuery = input.value;
        renderSidebar();
        const next = sideBody.querySelector("input");
        if (next) {
          next.focus();
          const end = next.value.length;
          next.setSelectionRange(end, end);
        }
      });
      wrap.appendChild(input);
      sideBody.appendChild(wrap);
      const query = searchQuery.trim().toLowerCase();
      const matches = files.filter(function (path) {
        if (!query) return true;
        const name = path.split("/").pop().toLowerCase();
        const text = (originals.get(path) || "").toLowerCase();
        return name.indexOf(query) !== -1 || text.indexOf(query) !== -1;
      });
      if (!matches.length) {
        const empty = document.createElement("div");
        empty.className = "side-empty";
        empty.textContent = "No matching files.";
        sideBody.appendChild(empty);
        return;
      }
      const tree = document.createElement("div");
      tree.className = "tree";
      matches.forEach(function (path) { tree.appendChild(fileButton(path)); });
      sideBody.appendChild(tree);
      return;
    }

    sideLabel.textContent = "Library";
    const tree = document.createElement("div");
    tree.className = "tree";
    const folder = document.createElement("button");
    folder.type = "button";
    folder.className = "folder";
    folder.setAttribute("aria-expanded", folderOpen ? "true" : "false");
    const chev = document.createElement("span");
    chev.className = "chev" + (folderOpen ? " open" : "");
    chev.textContent = "›";
    const folderName = document.createElement("span");
    folderName.textContent = "library";
    folder.appendChild(chev);
    folder.appendChild(folderName);
    folder.addEventListener("click", function () {
      folderOpen = !folderOpen;
      renderSidebar();
    });
    tree.appendChild(folder);
    if (folderOpen) {
      files.forEach(function (path) { tree.appendChild(fileButton(path)); });
    }
    sideBody.appendChild(tree);
  }

  function setActivity(next) {
    activity = next;
    libraryBtn.setAttribute("aria-pressed", next === "library" ? "true" : "false");
    searchBtn.setAttribute("aria-pressed", next === "search" ? "true" : "false");
    renderSidebar();
  }

  async function onRun() {
    if (running) return;
    if (!editor || !current) {
      appendLine("meta", "Open a file to run.");
      showPane("output");
      return;
    }
    running = true;
    runBtn.disabled = true;
    try {
      if (!ConstructRuntime.isReady()) {
        appendLine("meta", "Loading Python runtime (Pyodide " + ConstructRuntime.version + ").");
        showPane("output");
      }
      const code = editor.getValue();
      const path = current;
      await ConstructRuntime.ensure();
      clearConsole();
      clearGraph();
      const outcome = await ConstructRuntime.runFile(code, path);
      if (outcome.figures.length) showFigures(outcome.figures);
      if (outcome.error) {
        const message = errorText(outcome.error);
        appendLine("error", message);
        renderProblems(message);
      } else {
        renderProblems(null);
      }
      showPane("output");
    } catch (err) {
      const message = errorText(err);
      appendLine("error", message);
      renderProblems(message);
      showPane("output");
    } finally {
      running = false;
      runBtn.disabled = false;
      replInput.disabled = !ConstructRuntime.isReady();
      if (ConstructRuntime.isReady()) replInput.focus();
    }
  }

  async function onEval(event) {
    if (event) event.preventDefault();
    const code = replInput.value;
    if (!code.trim() || running) return;
    running = true;
    replInput.disabled = true;
    history.push(code);
    historyAt = history.length;
    replInput.value = "";
    appendLine("input", "> " + code);
    try {
      const outcome = await ConstructRuntime.evalLine(code);
      if (outcome.resultText !== null) appendLine("result", outcome.resultText);
      if (outcome.figures.length) showFigures(outcome.figures);
      if (outcome.error) {
        const message = errorText(outcome.error);
        appendLine("error", message);
        renderProblems(message);
      } else {
        renderProblems(null);
      }
    } catch (err) {
      appendLine("error", errorText(err));
    } finally {
      running = false;
      replInput.disabled = !ConstructRuntime.isReady();
      replInput.focus();
    }
  }

  function bindChrome() {
    applyTheme(savedTheme());
    themeBtn.addEventListener("click", function () {
      applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
    });
    runBtn.addEventListener("click", onRun);
    replForm.addEventListener("submit", onEval);
    replInput.addEventListener("keydown", function (event) {
      if (event.key === "ArrowUp") {
        if (!history.length) return;
        event.preventDefault();
        historyAt = Math.max(0, historyAt - 1);
        replInput.value = history[historyAt] || "";
      } else if (event.key === "ArrowDown") {
        if (!history.length) return;
        event.preventDefault();
        historyAt = Math.min(history.length, historyAt + 1);
        replInput.value = history[historyAt] || "";
      }
    });
    tabOutput.addEventListener("click", function () { showPane("output"); });
    tabProblems.addEventListener("click", function () { showPane("problems"); });
    graphClose.addEventListener("click", function () { graphPane.hidden = true; });
    libraryBtn.addEventListener("click", function () { setActivity("library"); });
    searchBtn.addEventListener("click", function () { setActivity("search"); });
    renderProblems(null);

    resizer.addEventListener("mousedown", function (event) {
      event.preventDefault();
      const startY = event.clientY;
      const startH = bottom.offsetHeight;
      function move(ev) {
        const next = startH - (ev.clientY - startY);
        const limit = Math.max(120, Math.min(next, window.innerHeight * 0.7));
        bottom.style.height = limit + "px";
        if (editor) editor.layout();
      }
      function up() {
        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseup", up);
      }
      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", up);
    });
  }

  function defineThemes() {
    monaco.editor.defineTheme("construct-light", {
      base: "vs",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#ffffff",
        "editor.foreground": "#1f1f1f",
        "editorLineNumber.foreground": "#9a9a9a",
        "editorLineNumber.activeForeground": "#333333",
        "editor.lineHighlightBackground": "#f6f6f6",
        "editorGutter.background": "#ffffff",
      },
    });
    monaco.editor.defineTheme("construct-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#1e1e1e",
        "editor.foreground": "#d4d4d4",
        "editorLineNumber.foreground": "#6e6e6e",
        "editorLineNumber.activeForeground": "#c6c6c6",
        "editor.lineHighlightBackground": "#262626",
        "editorGutter.background": "#1e1e1e",
      },
    });
  }

  function startEditor() {
    self.MonacoEnvironment = {
      getWorker: function (_id, label) {
        const file = label === "typescript" || label === "javascript"
          ? "language/typescript/ts.worker.js"
          : "editor/editor.worker.js";
        const blob = new Blob(
          ["importScripts('" + MONACO_VS + "/" + file + "');"],
          { type: "text/javascript" }
        );
        return new Worker(URL.createObjectURL(blob));
      },
    };
    require.config({ paths: { vs: MONACO_VS } });
    require(["vs/editor/editor.main"], function () {
      defineThemes();
      const dark = document.documentElement.dataset.theme === "dark";
      files.forEach(function (path) {
        const model = monaco.editor.createModel(
          originals.get(path) || "",
          "python",
          monaco.Uri.parse("inmemory:///" + path)
        );
        model.onDidChangeContent(function () { renderTabs(); });
        models.set(path, model);
      });
      editor = monaco.editor.create(editorEl, {
        model: null,
        theme: dark ? "construct-dark" : "construct-light",
        fontFamily: '"Cascadia Mono", ui-monospace, monospace',
        fontSize: 14,
        lineHeight: 22,
        fontLigatures: false,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        padding: { top: 8, bottom: 8 },
        renderLineHighlight: "line",
        overviewRulerLanes: 0,
        hideCursorInOverviewRuler: true,
        overviewRulerBorder: false,
        scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
        folding: false,
        glyphMargin: false,
        lineNumbersMinChars: 3,
        tabSize: 4,
        wordWrap: "off",
        fixedOverflowWidgets: true,
      });
      editor.onDidChangeCursorPosition(function (event) {
        statusPos.textContent = "Ln " + event.position.lineNumber + ", Col " + event.position.column;
      });
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, onRun);
      document.fonts.load('14px "Cascadia Mono"').then(function () {
        monaco.editor.remeasureFonts();
      }).catch(function () {});
      const first = files.indexOf("library/welcome.py") !== -1 ? "library/welcome.py" : files[0];
      if (first) showFile(first);
    }, function (err) {
      editorEmpty.hidden = false;
      editorEmpty.textContent = "The editor failed to load. " + errorText(err);
    });
  }

  async function loadLibrary() {
    const response = await fetch("library/manifest.json");
    if (!response.ok) throw new Error("Could not read library/manifest.json");
    const manifest = await response.json();
    const folder = manifest.folder || "library";
    const loaded = await Promise.all(manifest.files.map(async function (name) {
      const path = folder + "/" + name;
      const file = await fetch(path);
      if (!file.ok) throw new Error("Missing " + path);
      return [path, await file.text()];
    }));
    files = loaded.map(function (pair) { return pair[0]; });
    loaded.forEach(function (pair) { originals.set(pair[0], pair[1]); });
    renderSidebar();
  }

  bindChrome();
  ConstructRuntime.setHandlers({
    stdout: function (text) { writeStream("log", text); },
    stderr: function (text) { writeStream("error", text); },
    status: function (text) { statusMode.textContent = text; },
  });

  loadLibrary().then(startEditor).catch(function (err) {
    const note = document.createElement("div");
    note.className = "side-empty";
    note.textContent = errorText(err);
    sideBody.appendChild(note);
    appendLine("error", errorText(err));
  });

  ConstructRuntime.ensure().then(function () {
    replInput.disabled = false;
    replInput.placeholder = "Evaluate in this run";
    if (!consoleLog.childElementCount) {
      appendLine("meta", "Python is ready. Run the open file, then try p or E.");
    }
  }).catch(function (err) {
    statusMode.textContent = "Python · failed";
    appendLine("error", errorText(err));
    replInput.placeholder = "Python runtime failed to load";
  });
})();

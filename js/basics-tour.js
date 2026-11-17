(function () {
  if (window.__constructBasicsTourLoaded) return;
  window.__constructBasicsTourLoaded = true;

  var storageKey = "construct-library.jupyter-basics-tour";
  var sessionSeen = false;
  var running = false;
  var index = 0;
  var card;
  var ring;
  var kicker;
  var titleEl;
  var bodyEl;
  var backButton;
  var nextButton;
  var placedFor = -1;

  function notebookPath() {
    var path = "";
    try {
      path = new URLSearchParams(window.location.search).get("path") || "";
    } catch (err) {
      return "";
    }
    if (path.indexOf("..") !== -1) return "";
    return path.replace(/^\/+/, "");
  }

  if (notebookPath() !== "getting-started/01-jupyter-basics.ipynb") return;

  function seen() {
    if (sessionSeen) return true;
    try {
      var value = localStorage.getItem(storageKey);
      return value === "skipped" || value === "finished";
    } catch (err) {
      return false;
    }
  }

  function remember(value) {
    sessionSeen = true;
    try {
      localStorage.setItem(storageKey, value);
    } catch (err) {}
  }

  function query(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector));
  }

  function boxOf(el) {
    if (!el || !el.getBoundingClientRect) return null;
    var rect = el.getBoundingClientRect();
    var top = Math.max(0, rect.top);
    var left = Math.max(0, rect.left);
    var right = Math.min(window.innerWidth, rect.right);
    var bottom = Math.min(window.innerHeight, rect.bottom);
    if (right - left < 8 || bottom - top < 8) return null;
    return {
      top: top,
      left: left,
      width: right - left,
      height: bottom - top
    };
  }

  function firstBoxed(nodes) {
    var i;
    for (i = 0; i < nodes.length; i++) {
      if (boxOf(nodes[i])) return nodes[i];
    }
    return nodes[0] || null;
  }

  var revealedFiles = false;

  function fileBrowser() {
    return document.getElementById("filebrowser");
  }

  function menuBar() {
    return document.getElementById("jp-MainMenu");
  }

  function revealFileBrowser() {
    if (window.innerWidth < 1280) return;
    if (boxOf(fileBrowser()) || revealedFiles) return;
    var tab = document.querySelector('.lm-TabBar-tab[data-id="filebrowser"]');
    if (!tab) return;
    revealedFiles = true;
    tab.click();
  }

  var steps = [
    {
      title: "Files",
      body: "This panel on the left lists the notebooks in the library.",
      prefer: "side",
      find: function () {
        revealFileBrowser();
        return fileBrowser();
      }
    },
    {
      title: "Menu bar",
      body: "File, Edit, View, Run, Kernel, and the other menus are in this bar.",
      prefer: "below-end",
      find: function () {
        return menuBar();
      }
    },
    {
      title: "Run",
      body: "This runs the selected cell and moves to the next one.",
      find: function () {
        var scoped = query('.jp-NotebookPanel-toolbar [data-jp-item-name="run"]');
        if (scoped.length) return firstBoxed(scoped);
        return firstBoxed(query('[data-command="notebook:run-cell-and-select-next"]'));
      }
    },
    {
      title: "Active cell",
      body: "The blue bar marks the selected cell. Click a cell to select it.",
      scroll: "center",
      find: function () {
        return firstBoxed(query(".jp-Notebook .jp-Cell.jp-mod-active"));
      }
    },
    {
      title: "Shift+Enter",
      body: "Press Shift+Enter to run the selected cell. That does the same thing as Run.",
      scroll: "center",
      find: function () {
        var cell = firstBoxed(query(".jp-Notebook .jp-Cell.jp-mod-active"));
        if (!cell) return null;
        var inner = firstBoxed(
          Array.prototype.slice.call(
            cell.querySelectorAll(
              ".jp-MarkdownOutput, .jp-RenderedMarkdown, .jp-InputArea-editor, .cm-editor"
            )
          )
        );
        return inner || cell;
      }
    },
    {
      title: "Output",
      body: "Printed text and plots appear under the cell that produced them.",
      scroll: "center",
      band: true,
      find: function () {
        var code = document.querySelector(".jp-Notebook .jp-CodeCell");
        if (!code) return null;
        return (
          code.querySelector(".jp-Cell-outputWrapper") ||
          code.querySelector(".jp-OutputArea") ||
          code
        );
      }
    },
    {
      title: "Kernel",
      body: "The name on the right is the kernel. If a kernel picker appears, choose Python (Pyodide).",
      prefer: "side",
      find: function () {
        var scoped = query('.jp-NotebookPanel-toolbar [data-jp-item-name="kernelName"]');
        if (scoped.length) return firstBoxed(scoped);
        return firstBoxed(query(".jp-NotebookPanel-toolbar .jp-KernelName, .jp-KernelName"));
      }
    }
  ];

  var allSteps = steps.slice();

  function labReady() {
    if (!boxOf(document.querySelector('.jp-NotebookPanel-toolbar [data-jp-item-name="run"]'))) return false;
    if (!boxOf(menuBar())) return false;
    if (window.innerWidth >= 1280 && !boxOf(fileBrowser())) return false;
    var cells = document.querySelectorAll(".jp-Notebook .jp-Cell");
    var i;
    var settled = false;
    for (i = 0; i < cells.length; i++) {
      var rect = cells[i].getBoundingClientRect();
      if (rect.height > 80 && (cells[i].innerText || "").replace(/\s/g, "").length > 20) settled = true;
    }
    if (!settled) return false;
    var loader = document.getElementById("jupyterlite-loading-indicator");
    if (loader && !loader.classList.contains("hidden")) return false;
    return true;
  }

  function requestOpen() {
    if (requestOpen.pending) return;
    requestOpen.pending = true;
    var started = Date.now();
    (function tick() {
      revealFileBrowser();
      if (labReady()) {
        requestOpen.pending = false;
        openTour();
        return;
      }
      if (Date.now() - started > 120000) {
        requestOpen.pending = false;
        return;
      }
      window.setTimeout(tick, 250);
    })();
  }

  function ensureUi() {
    if (card) return;
    var style = document.createElement("style");
    style.textContent = [
      ".basics-tour-ring{position:fixed;z-index:20000;pointer-events:none;box-sizing:border-box;border:2px solid #1a73e8;border-radius:6px;box-shadow:0 0 0 4px rgba(26,115,232,.2);display:none}",
      ".basics-tour-ring.is-on{display:block}",
      ".basics-tour{position:fixed;z-index:20001;box-sizing:border-box;width:280px;max-width:calc(100vw - 24px);padding:12px 14px 10px;background:#fff;color:#1c1c1c;border:1px solid #e4e4e4;border-radius:8px;box-shadow:0 10px 28px rgba(28,28,28,.16);font-family:system-ui,-apple-system,'Segoe UI','Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;line-height:1.45}",
      ".basics-tour-kicker{margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:#6d6d6d}",
      ".basics-tour-title{margin:0 0 4px;font-size:14px;font-weight:600;line-height:1.3}",
      ".basics-tour-body{margin:0}",
      ".basics-tour-actions{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:10px}",
      ".basics-tour-nav{display:flex;align-items:center;gap:8px}",
      ".basics-tour button{appearance:none;font:inherit;font-size:13px;line-height:1.3;cursor:pointer;border-radius:4px}",
      ".basics-tour [data-act='skip'],.basics-tour [data-act='back']{border:0;background:transparent;padding:4px 2px;color:#5c5c5c}",
      ".basics-tour [data-act='skip']:hover,.basics-tour [data-act='back']:hover{color:#1c1c1c}",
      ".basics-tour [data-act='back']:disabled{opacity:.4;cursor:default}",
      ".basics-tour [data-act='next']{border:0;background:#1c1c1c;color:#fff;padding:5px 10px}",
      ".basics-tour [data-act='next']:focus-visible,.basics-tour [data-act='skip']:focus-visible,.basics-tour [data-act='back']:focus-visible{outline:2px solid #1c1c1c;outline-offset:2px}"
    ].join("");
    document.head.appendChild(style);

    ring = document.createElement("div");
    ring.className = "basics-tour-ring";
    ring.setAttribute("aria-hidden", "true");

    card = document.createElement("div");
    card.className = "basics-tour";
    card.setAttribute("role", "dialog");
    card.setAttribute("aria-modal", "false");
    card.setAttribute("aria-label", "Notebook tour");
    card.hidden = true;

    kicker = document.createElement("p");
    kicker.className = "basics-tour-kicker";
    titleEl = document.createElement("p");
    titleEl.className = "basics-tour-title";
    bodyEl = document.createElement("p");
    bodyEl.className = "basics-tour-body";

    var actions = document.createElement("div");
    actions.className = "basics-tour-actions";
    var skip = document.createElement("button");
    skip.type = "button";
    skip.setAttribute("data-act", "skip");
    skip.textContent = "Skip tour";
    var nav = document.createElement("span");
    nav.className = "basics-tour-nav";
    backButton = document.createElement("button");
    backButton.type = "button";
    backButton.setAttribute("data-act", "back");
    backButton.textContent = "Back";
    nextButton = document.createElement("button");
    nextButton.type = "button";
    nextButton.setAttribute("data-act", "next");
    nextButton.textContent = "Next";
    nav.appendChild(backButton);
    nav.appendChild(nextButton);
    actions.appendChild(skip);
    actions.appendChild(nav);
    card.appendChild(kicker);
    card.appendChild(titleEl);
    card.appendChild(bodyEl);
    card.appendChild(actions);

    card.addEventListener("click", function (event) {
      var button = event.target.closest ? event.target.closest("button") : null;
      if (!button || !running) return;
      var act = button.getAttribute("data-act");
      if (act === "skip") closeTour("skipped");
      else if (act === "back" && index > 0) {
        index -= 1;
        showStep();
      } else if (act === "next") {
        if (index >= steps.length - 1) closeTour("finished");
        else {
          index += 1;
          showStep();
        }
      }
    });

    document.body.appendChild(ring);
    document.body.appendChild(card);

    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    window.setInterval(function () {
      if (running) place();
    }, 400);
    document.addEventListener(
      "keydown",
      function (event) {
        if (!running || event.key !== "Escape") return;
        event.preventDefault();
        event.stopPropagation();
        closeTour("skipped");
      },
      true
    );
  }

  function targetBox(step, el) {
    if (!el) return null;
    if (step.band) {
      var direct = boxOf(el);
      if (direct && direct.height >= 24) return direct;
      var cell = el.closest ? el.closest(".jp-Cell") : null;
      var cellBox = boxOf(cell);
      if (!cellBox) return direct;
      var next = cell && cell.nextElementSibling;
      var nextTop = next ? next.getBoundingClientRect().top : cellBox.top + cellBox.height;
      var limit = Math.min(nextTop - 2, cellBox.top + cellBox.height);
      var height = Math.min(28, cellBox.height);
      var top = limit - height;
      if (top < cellBox.top) top = cellBox.top;
      height = Math.max(16, limit - top);
      return { top: top, left: cellBox.left, width: cellBox.width, height: height };
    }
    return boxOf(el);
  }

  function positionCard(rect, step) {
    var margin = 12;
    var width = card.offsetWidth;
    var height = card.offsetHeight;
    var viewW = window.innerWidth;
    var viewH = window.innerHeight;
    var top = 64;
    var left = Math.max(margin, viewW - width - margin);
    if (rect && width && height) {
      var below = { top: rect.top + rect.height + margin, left: rect.left };
      var above = { top: rect.top - height - margin, left: rect.left };
      var right = { top: rect.top, left: rect.left + rect.width + margin };
      var leftOf = { top: rect.top, left: rect.left - width - margin };
      var belowEnd = {
        top: rect.top + rect.height + margin,
        left: Math.max(margin, viewW - width - margin)
      };
      var options = [below, above, right, leftOf];
      if (step && step.prefer === "side") options = [right, leftOf, below, above];
      if (step && step.prefer === "below-end") options = [belowEnd, below, right, above];
      var i;
      var placed = false;
      for (i = 0; i < options.length; i++) {
        var opt = options[i];
        if (
          opt.top >= margin &&
          opt.left >= margin &&
          opt.top + height <= viewH - margin &&
          opt.left + width <= viewW - margin
        ) {
          top = opt.top;
          left = opt.left;
          placed = true;
          break;
        }
      }
      if (!placed) {
        left = Math.min(Math.max(margin, rect.left), Math.max(margin, viewW - width - margin));
        top = Math.min(
          Math.max(margin, rect.top + rect.height + margin),
          Math.max(margin, viewH - height - margin)
        );
      }
    }
    card.style.top = top + "px";
    card.style.left = left + "px";
  }

  function place() {
    if (!running || !card) return;
    var step = steps[index];
    var el = step.find();
    var rect = targetBox(step, el);
    if (rect) {
      var pad = 4;
      ring.classList.add("is-on");
      ring.style.top = rect.top - pad + "px";
      ring.style.left = rect.left - pad + "px";
      ring.style.width = rect.width + pad * 2 + "px";
      ring.style.height = rect.height + pad * 2 + "px";
    } else {
      ring.classList.remove("is-on");
    }
    positionCard(rect, step);
  }

  function showStep() {
    var step = steps[index];
    card.hidden = false;
    card.setAttribute("data-tour-step", String(index));
    kicker.textContent = index + 1 + " of " + steps.length;
    titleEl.textContent = step.title;
    bodyEl.textContent = step.body;
    backButton.disabled = index === 0;
    nextButton.textContent = index === steps.length - 1 ? "Done" : "Next";
    if (placedFor !== index && step.scroll) {
      var el = step.find();
      var anchor = (el && el.closest && el.closest(".jp-Cell")) || el;
      if (anchor && anchor.scrollIntoView) {
        anchor.scrollIntoView({ block: step.scroll, inline: "nearest" });
      }
    }
    placedFor = index;
    place();
  }

  function closeTour(reason) {
    if (!running) return;
    running = false;
    if (reason) remember(reason);
    if (ring) ring.classList.remove("is-on");
    if (card) card.hidden = true;
  }

  function openTour() {
    ensureUi();
    steps = allSteps.filter(function (step) {
      return step.title !== "Files" || boxOf(fileBrowser());
    });
    index = 0;
    placedFor = -1;
    running = true;
    showStep();
  }

  window.addEventListener("message", function (event) {
    if (event.origin !== window.location.origin) return;
    var data = event.data;
    if (!data || data.source !== "construct-library" || data.action !== "replay-tour") return;
    window.__constructBasicsTourReplay = false;
    requestOpen();
  });

  if (window.__constructBasicsTourReplay || !seen()) {
    window.__constructBasicsTourReplay = false;
    requestOpen();
  }
})();

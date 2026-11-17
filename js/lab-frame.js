/*
 * Runs inside the JupyterLite Lab iframe.
 *
 * From 641px to 1279px the file list should start closed, and the folder
 * icon in the left rail should open and close it. Closing it here is a
 * real JupyterLab collapse, so the panel takes no width. The matching
 * save is put back to "open" so a later visit on a wide screen still
 * starts with the file list open. A click or the file-browser shortcut
 * belongs to the reader and is stored as usual.
 */
(function () {
  if (window.__constructLabFrame) return;
  window.__constructLabFrame = true;

  var PHONE_MAX = 640;
  var DESKTOP_MIN = 1280;
  var FILE_ID = "filebrowser";
  var userChose = false;
  var holdWorkspace = false;
  var adjusting = false;
  var lastPress = 0;
  var rememberedCurrent = FILE_ID;
  var stableTicks = 0;
  var started = 0;
  var phoneHold = false;
  var reopenAfterPhone = false;

  function width() {
    return window.innerWidth;
  }

  function band() {
    var w = width();
    if (w <= PHONE_MAX) return "phone";
    if (w >= DESKTOP_MIN) return "desktop";
    return "tablet";
  }

  function leftArea() {
    return document.querySelector('#jp-main-split-panel > .jp-SideArea[data-side="left"]');
  }

  function filesTab() {
    return document.querySelector('.jp-SideBar.jp-mod-left .lm-TabBar-tab[data-id="' + FILE_ID + '"]');
  }

  function currentLeftTab() {
    return document.querySelector(".jp-SideBar.jp-mod-left .lm-TabBar-tab.lm-mod-current");
  }

  function areaOpen() {
    var area = leftArea();
    return !!(area && !area.classList.contains("lm-mod-hidden"));
  }

  function railReady() {
    var tab = filesTab();
    return !!(tab && tab.getBoundingClientRect().width >= 8);
  }

  function markLive(on) {
    document.documentElement.classList.toggle("construct-file-panel-live", !!on);
  }

  function press(tab, force) {
    if (!tab || (userChose && !force)) return false;
    var now = Date.now();
    if (now - lastPress < 300) return false;
    lastPress = now;
    var rect = tab.getBoundingClientRect();
    var opts = {
      bubbles: true,
      cancelable: true,
      view: window,
      button: 0,
      buttons: 1,
      pointerId: 1,
      pointerType: "mouse",
      isPrimary: true,
      clientX: rect.left + Math.max(rect.width, 1) / 2,
      clientY: rect.top + Math.max(rect.height, 1) / 2
    };
    adjusting = true;
    var down = new PointerEvent("pointerdown", opts);
    var up = new PointerEvent("pointerup", Object.assign({}, opts, { buttons: 0 }));
    tab.dispatchEvent(down);
    document.dispatchEvent(up);
    window.setTimeout(function () {
      adjusting = false;
    }, 0);
    return true;
  }

  /*
   * At phone width the activity bar is not clickable. If the file list
   * was left open, Lab still reserves its width and the notebook can
   * shrink to nothing. Reveal the rail for one hit-test, collapse, and
   * hide the rail again.
   */
  function collapseFromPhone() {
    var current = currentLeftTab() || filesTab();
    if (!current) return;
    var style = document.createElement("style");
    style.textContent = "#jp-main-content-panel > .jp-SideBar.jp-mod-left { display: block !important; width: 33px !important; min-width: 33px !important; max-width: none !important; }";
    document.head.appendChild(style);
    try {
      press(current, true);
    } finally {
      style.remove();
    }
  }

  function notebookSqueezed() {
    var notebook = document.querySelector(".jp-Notebook");
    var dock = document.getElementById("jp-main-dock-panel");
    if (!notebook || !dock) return false;
    return dock.getBoundingClientRect().width - notebook.getBoundingClientRect().width > 40;
  }

  function patchLayout(value) {
    if ((!holdWorkspace && !phoneHold) || (userChose && !phoneHold)) return value;
    if (!value || typeof value !== "object" || !value.data) return value;
    var layout = value.data["layout-restorer:data"];
    if (!layout || !layout.left || layout.left.collapsed !== true) return value;
    var copy;
    try {
      copy = JSON.parse(JSON.stringify(value));
    } catch (err) {
      return value;
    }
    layout = copy.data["layout-restorer:data"];
    layout.left.collapsed = false;
    if (!layout.left.current) layout.left.current = rememberedCurrent || FILE_ID;
    return copy;
  }

  var originalPut = IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put = function (value) {
    var next = value;
    try {
      if (!this.name || this.name === "statedb") next = patchLayout(value);
    } catch (err) {
      next = value;
    }
    var args = [next];
    var i;
    for (i = 1; i < arguments.length; i++) args.push(arguments[i]);
    return originalPut.apply(this, args);
  };

  function choose() {
    userChose = true;
    holdWorkspace = false;
    if (band() === "tablet") markLive(true);
  }

  document.addEventListener(
    "pointerdown",
    function (event) {
      if (!event.isTrusted || adjusting || event.button !== 0) return;
      var target = event.target;
      if (!target || !target.closest) return;
      if (!target.closest(".jp-SideBar.jp-mod-left")) return;
      choose();
    },
    true
  );

  document.addEventListener(
    "keydown",
    function (event) {
      if (!event.isTrusted || userChose) return;
      var key = (event.key || "").toLowerCase();
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && key === "f") choose();
    },
    true
  );

  function tick() {
    var mode = band();
    if (!started && (railReady() || (mode === "phone" && document.getElementById("jp-main-dock-panel")))) {
      started = Date.now();
    }

    if (mode === "phone") {
      markLive(false);
      stableTicks = 0;
      if (areaOpen() && notebookSqueezed()) {
        reopenAfterPhone = true;
        phoneHold = true;
        collapseFromPhone();
      }
      return;
    }

    if (reopenAfterPhone && !areaOpen()) {
      if (mode === "tablet") markLive(true);
      press(filesTab(), true);
      if (areaOpen()) {
        reopenAfterPhone = false;
        phoneHold = false;
      }
      return;
    }

    if (mode === "desktop") {
      if (holdWorkspace && !userChose && !areaOpen() && railReady()) press(filesTab());
      markLive(false);
      stableTicks = 0;
      return;
    }

    if (userChose) {
      markLive(true);
      return;
    }

    if (!railReady()) {
      stableTicks = 0;
      return;
    }

    if (areaOpen()) {
      stableTicks = 0;
      markLive(false);
      var current = currentLeftTab();
      if (current && current.getAttribute("data-id") === FILE_ID) rememberedCurrent = FILE_ID;
      holdWorkspace = true;
      press(current || filesTab());
      return;
    }

    stableTicks += 1;
    if (stableTicks >= 3) markLive(true);
  }

  var timer = window.setInterval(function () {
    tick();
    if (band() === "phone") {
      if (started && Date.now() - started > 10000 && !notebookSqueezed()) window.clearInterval(timer);
      return;
    }
    if (userChose) {
      window.clearInterval(timer);
      return;
    }
    if (!started || Date.now() - started < 10000) return;
    if (band() === "tablet" && areaOpen()) return;
    window.clearInterval(timer);
  }, 200);

  function kick() {
    tick();
    window.setTimeout(tick, 250);
    window.setTimeout(tick, 550);
    window.setTimeout(tick, 900);
  }

  window.addEventListener("resize", kick);
  if (document.readyState === "complete") kick();
  else window.addEventListener("load", kick);
})();

// In-browser Python for the workbench. Not Jupyter and not JupyterLite.
// One Pyodide interpreter stays alive for the page. Run and the REPL share it.
//
// Pinned to Pyodide 314.0.8 (Python 3.14.2):
// https://cdn.jsdelivr.net/pyodide/v314.0.8/full/
// matplotlib 3.10.8 is loaded from that release's lockfile, which also
// brings its own builds (numpy 2.4.6, pillow 12.2.0, and the other
// matplotlib dependencies in pyodide-lock.json). Nothing is installed
// from an unpinned PyPI "latest".
(function () {
  const PYODIDE_VERSION = "314.0.8";
  const INDEX_URL = "https://cdn.jsdelivr.net/pyodide/v" + PYODIDE_VERSION + "/full/";

  const handlers = {
    stdout: function () {},
    stderr: function () {},
    status: function () {},
  };

  const session = { figures: [] };
  let pyodide = null;
  let booting = null;
  let acceptOutput = false;
  let reprFn = null;

  const HOOK_SOURCE = [
    "import matplotlib",
    'matplotlib.use("Agg", force=True)',
    "import matplotlib.pyplot as plt",
    "import io",
    "import warnings",
    "# Agg text drawing warns on every figure in this Matplotlib build",
    "# (pybind passes ints as floats). It is not a lesson error.",
    "warnings.filterwarnings(",
    "    'ignore',",
    "    message=r'The [xy] parameter as float was deprecated',",
    ")",
    "matplotlib.rcParams['figure.facecolor'] = 'white'",
    "matplotlib.rcParams['axes.facecolor'] = 'white'",
    "matplotlib.rcParams['savefig.facecolor'] = 'white'",
    "matplotlib.interactive(False)",
    "def _construct_show(*args, **kwargs):",
    "    from js import _constructEmitPng",
    "    import matplotlib.pyplot as plt",
    "    import io, base64",
    "    for num in list(plt.get_fignums()):",
    "        fig = plt.figure(num)",
    "        buf = io.BytesIO()",
        "        fig.savefig(buf, format='png', facecolor='white')",
    "        _constructEmitPng(base64.b64encode(buf.getvalue()).decode('ascii'))",
    "        plt.close(fig)",
    "plt.show = _construct_show",
    "_warm = io.BytesIO()",
    "_fig = plt.figure(figsize=(1, 1))",
    "_fig.savefig(_warm, format='png')",
    "plt.close('all')",
    "if plt.get_fignums():",
    "    raise RuntimeError('plot warmup left a figure open')",
    "del _construct_show, _warm, _fig, plt, matplotlib, io, warnings",
  ].join("\n");

  const FLUSH_SOURCE = [
    "import matplotlib.pyplot as _plt",
    "try:",
    "    if _plt.get_fignums():",
    "        _plt.show()",
    "finally:",
    "    del _plt",
  ].join("\n");

  function setHandlers(next) {
    if (next.stdout) handlers.stdout = next.stdout;
    if (next.stderr) handlers.stderr = next.stderr;
    if (next.status) handlers.status = next.status;
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = function () { resolve(); };
      script.onerror = function () {
        reject(new Error("Could not load " + src));
      };
      document.head.appendChild(script);
    });
  }

  function discard(value) {
    if (value && typeof value.destroy === "function") value.destroy();
  }

  function installHooks() {
    globalThis._constructEmitPng = function (payload) {
      let text = payload;
      if (typeof text !== "string") {
        text = text == null ? "" : String(text);
        if (payload && typeof payload.destroy === "function") payload.destroy();
      }
      text = text.replace(/\s+/g, "");
      if (!text || text.length > 12000000) return;
      if (!/^[A-Za-z0-9+/=]+$/.test(text)) return;
      session.figures.push(text);
    };
    pyodide.runPython(HOOK_SOURCE, { filename: "<construct>", dedent: false });
    session.figures = [];
    reprFn = pyodide.globals.get("repr");
  }

  function flushFigures() {
    pyodide.runPython(FLUSH_SOURCE, { filename: "<construct>", dedent: false });
  }

  function formatResult(value) {
    if (value === undefined || value === null) return null;
    try {
      const shown = reprFn ? reprFn(value) : String(value);
      let text;
      if (typeof shown === "string") {
        text = shown;
      } else if (shown && typeof shown.toString === "function") {
        text = shown.toString();
        if (typeof shown.destroy === "function") shown.destroy();
      } else {
        text = String(shown);
      }
      if (text === "None") return null;
      return text;
    } catch (err) {
      return String(value);
    } finally {
      discard(value);
    }
  }

  async function boot() {
    handlers.status("Python · loading");
    await loadScript(INDEX_URL + "pyodide.js");
    if (typeof loadPyodide !== "function") {
      throw new Error("Pyodide " + PYODIDE_VERSION + " did not load.");
    }
    pyodide = await loadPyodide({
      indexURL: INDEX_URL,
      stdin: function () { return ""; },
      env: { HOME: "/home/pyodide", MPLBACKEND: "Agg" },
      stdout: function (text) {
        if (acceptOutput) handlers.stdout(text);
      },
      stderr: function (text) {
        if (acceptOutput) handlers.stderr(text);
      },
    });
    handlers.status("Python · loading matplotlib");
    await pyodide.loadPackage("matplotlib");
    installHooks();
    handlers.status("Python · Pyodide");
    return pyodide;
  }

  function ensure() {
    if (pyodide) return Promise.resolve(pyodide);
    if (!booting) {
      booting = boot().catch(function (err) {
        booting = null;
        pyodide = null;
        throw err;
      });
    }
    return booting;
  }

  async function runFile(code, filename) {
    await ensure();
    session.figures = [];
    acceptOutput = true;
    let error = null;
    try {
      discard(pyodide.runPython(code, {
        filename: filename || "lesson.py",
        dedent: false,
      }));
    } catch (err) {
      error = err;
    } finally {
      try {
        flushFigures();
      } catch (err) {
        error = error || err;
      }
      acceptOutput = false;
    }
    return { figures: session.figures.slice(), error: error };
  }

  async function evalLine(code) {
    await ensure();
    session.figures = [];
    acceptOutput = true;
    let error = null;
    let resultText = null;
    try {
      const value = pyodide.runPython(code, {
        filename: "<console>",
        dedent: false,
      });
      resultText = formatResult(value);
    } catch (err) {
      error = err;
    } finally {
      try {
        flushFigures();
      } catch (err) {
        error = error || err;
      }
      acceptOutput = false;
    }
    return {
      figures: session.figures.slice(),
      error: error,
      resultText: resultText,
    };
  }

  window.ConstructRuntime = {
    version: PYODIDE_VERSION,
    ensure: ensure,
    runFile: runFile,
    evalLine: evalLine,
    setHandlers: setHandlers,
    isReady: function () { return !!pyodide; },
  };
})();

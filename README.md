# Project Construct

![Project Construct](assets/project-construct-wordmark.svg)

Project Construct is an independent lesson library for mathematical and computational psychology and neuroscience. Lessons are Jupyter notebooks that run in the browser.

The site is published with GitHub Pages at https://yiuhong.github.io/construct-library/.

The mark above is the light lockup, [`assets/project-construct-wordmark.svg`](assets/project-construct-wordmark.svg). Yiu Hong Ko is a psychology and cognitive neuroscience researcher in Hong Kong and a registered social worker (RSW).

## Try it locally

JupyterLite needs a local static server. Opening the files with `file://` will not start the notebooks.

```bash
python3 -m http.server 8080
```

Open the printed local URL (for example `http://127.0.0.1:8080/`).

The library page lists the starter lessons. Open one and the Python (Pyodide) kernel starts on its own. If a kernel picker appears, choose Python (Pyodide). Wait for the Python runtime to finish downloading, click the code cell, and press Shift+Enter. Printed output and plots appear under the cell that produced them.

The first visit downloads pinned [Pyodide 314.0.6](https://cdn.jsdelivr.net/pyodide/v314.0.6/full/pyodide.mjs) (Python 3.14.2) from that release’s CDN. A cell that imports matplotlib also downloads matplotlib 3.10.8 and numpy 2.4.6 from the same release. Later visits reuse the browser cache.

## What is in the repository

- `index.html` is the library front door.
- `notebook.html` keeps the Project Construct title bar around JupyterLite.
- `content/` holds `jupyter-basics.ipynb`. Python only.
- `library.json` lists those lessons in groups. Its `materials` array is empty. Notes, readings, and explainers can be added later under `materials/` and listed from that array. The library page shows a Materials section only when the array has entries.
- `lite/` is the built JupyterLite site (jupyterlite-core 0.8.7 and jupyterlite-pyodide-kernel 0.8.7), with the Lab application only.

There is no login and no install for a reader. JupyterHub and any hosted kernel are out of scope.

## Rebuild the notebooks

The files under `content/` are the source notebooks. `lite/` is what the static server serves. After changing a notebook, rebuild:

```bash
bash scripts/build_lite.sh
```

That script creates a local `.venv` and installs the pinned build tools in `requirements-lite.txt`. Readers do not need it.

## Known limits

- The Pyodide kernel runs on the main thread. A tight loop can freeze the tab.
- Edits in a notebook stay in this browser (IndexedDB). They are not written back to the repository. Notebooks removed from the library are dropped from the file browser on the next visit. Edits to a notebook that is still published, including jupyter-basics.ipynb, are kept. Clearing site data for the origin restores the published notebooks.
- The runtime is not vendored in the repository. The first notebook needs a network connection to the pinned Pyodide CDN.

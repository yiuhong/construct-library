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

The library page lists the lessons in three categories: Getting started, Python basics, and Basic mathematics. Open one and the Python (Pyodide) kernel starts on its own. If a kernel picker appears, choose Python (Pyodide). Wait for the Python runtime to finish downloading, click the code cell, and press Shift+Enter. Printed output and plots appear under the cell that produced them.

The first visit downloads pinned [Pyodide 314.0.6](https://cdn.jsdelivr.net/pyodide/v314.0.6/full/pyodide.mjs) (Python 3.14.2) from that release’s CDN. A cell that imports matplotlib also downloads matplotlib 3.10.8 and numpy 2.4.6 from the same release. Later visits reuse the browser cache.

## What is in the repository

- `index.html` is the library front door.
- `notebook.html` keeps the Project Construct title bar around JupyterLite.
- `content/` holds one folder per category. Each folder numbers its notebooks from `01`, so the JupyterLite file browser lists them in lesson order. The numbers start again in the next folder. Catalog titles stay unnumbered. Python only.
  - `content/getting-started/` has `01-jupyter-basics.ipynb` through `06-imports-and-plots.ipynb`.
  - `content/python-basics/` has `01-python-as-a-calculator.ipynb` through `06-modules-and-help.ipynb`.
  - `content/basic-mathematics/` has `01-numbers-and-notation.ipynb` through `18-distributions.ipynb`. On the library page those lessons sit under headings inside the Basic mathematics tab: Foundations, Chance and summary, Arrays, Calculus, and Fitting.
- `content/check.py` is a small helper. The Python basics and Basic mathematics lessons import it for the short task at the end of each notebook. A match prints a confirmation. The first miss prints a hint. Calling it again, or passing `show=True`, prints the expected result.
- `library.json` lists the lessons in those groups. A group can include `sections`, and the library page shows each section title as a heading inside that category tab. Its `materials` array is empty. Notes, readings, and explainers can be added later under `materials/` and listed from that array. The library page shows a Materials section only when the array has entries.
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
- Edits in a notebook stay in this browser (IndexedDB). They are not written back to the repository. Notebooks removed from the library are dropped from the file browser on the next visit. That includes the earlier unnumbered Getting started filenames and numbered copies that sat at the file-browser root. Edits to a notebook that is still published, including getting-started/01-jupyter-basics.ipynb, are kept. Clearing site data for the origin restores the published notebooks.
- The runtime is not vendored in the repository. The first notebook needs a network connection to the pinned Pyodide CDN.

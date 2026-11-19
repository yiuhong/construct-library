# Project Construct

![Project Construct](assets/project-construct-wordmark.svg)

Project Construct is an independent lesson library for mathematical and computational psychology and neuroscience. Lessons are Jupyter notebooks that run in the browser.

The site is published with GitHub Pages at https://yiuhong.github.io/construct-library/.

The mark above is the light lockup, [`assets/project-construct-wordmark.svg`](assets/project-construct-wordmark.svg). Yiu Hong Ko is a psychology and cognitive neuroscience researcher in Hong Kong and a registered social worker (RSW).

## Cite, license, and contributing

Teaching text, explanations, and figures are [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The legal text is [LICENSE](LICENSE). HTML, CSS, JavaScript, and Python that run the site and the notebooks are [MIT](LICENSE-CODE). [license.html](license.html) says which part is which. A page can mix both. JupyterLite and Pyodide keep their own licenses.

To cite the library, use [cite.html](https://yiuhong.github.io/construct-library/cite.html) (APA 7, BibTeX, and a credit line). A machine-readable citation is [`CITATION.cff`](CITATION.cff) (Citation File Format 1.2.0). It names this library, Yiu Hong Ko, the ORCID iD, version 0.1.0, and https://yiuhong.github.io/construct-library/. The file records the teaching material as CC BY 4.0 and notes that source code is MIT.

Yiu Hong Ko · [ORCID 0000-0003-4436-0166](https://orcid.org/0000-0003-4436-0166) · [yiuhong.ko@gmail.com](mailto:yiuhong.ko@gmail.com) · [yiuhong.github.io](https://yiuhong.github.io/)

Mistakes and ideas go to [GitHub Issues](https://github.com/yiuhong/construct-library/issues). Notes for contributors are in [CONTRIBUTING.md](CONTRIBUTING.md). What changed is in [CHANGELOG.md](CHANGELOG.md).

This is version **0.1.0**, dated 17 November 2026. It is the first versioned release: the repository had no version before it. The version and date live in [`js/site-meta.js`](js/site-meta.js). The footer, the cite page, and the license page repeat the same version and date for visitors without JavaScript.

## Try it locally

JupyterLite needs a local static server. Opening the files with `file://` will not start the notebooks.

```bash
python3 -m http.server 8080
```

Open the printed local URL (for example `http://127.0.0.1:8080/`).

The library page lists the lessons by course. Foundation, Statistics, and Modelling are menu headings only: they group the courses and are not a new content level. On a wide page the grouped list sits on the left of the catalogue and the selected course opens on the right. Below 640px a switcher shows the current course and opens the same list. The courses, in order, are Getting started, Python basics, Plotting and packages, Matplotlib, and Basic mathematics (Foundation); Descriptive statistics, Introductory statistics, Non-parametric tests, Mixed models / GLMM, and Factor analysis and SEM (Statistics); Computational modelling and Machine learning (Modelling). Descriptive statistics is a flat list. Introductory statistics uses headings inside that course: Probability and sampling, Estimation, Comparing groups, and Linear models and GLM. Non-parametric tests uses Ranks and related scores, Comparing groups, and Association and limits. Mixed models / GLMM uses Clustered data, Linear mixed models, and Generalised mixed models. Factor analysis and SEM uses Principal component analysis, Factor analysis, and Structural equation models. Computational modelling uses headings inside that course: Foundations, Model fitting in practice, Model comparison and selection, Choice and response time, Learning and updating, Neural and psychometric links, and Building your own model. Machine learning, the last course, uses Learning from data, Supervised learning, and Unsupervised learning and limits. The formal name in the lessons is Introduction to machine learning. Open one and the Python (Pyodide) kernel starts on its own. If a kernel picker appears, choose Python (Pyodide). Wait for the Python runtime to finish downloading, click the code cell, and press Shift+Enter. Printed output and plots appear under the cell that produced them. Some lessons also draw a short animation: run the cell, then press play on the player under the figure, or drag its slider.

The first visit downloads pinned [Pyodide 314.0.6](https://cdn.jsdelivr.net/pyodide/v314.0.6/full/pyodide.mjs) (Python 3.14.2) from that release’s CDN. A cell that imports matplotlib also downloads matplotlib 3.10.8 and numpy 2.4.6 from the same release. A cell that imports pandas, scipy, or scikit-learn downloads that library from the same release. Later visits reuse the browser cache.

## What is in the repository

- `index.html` is the library front door.
- `notebook.html` keeps the Project Construct title bar around JupyterLite, with the site footer under the notebook.
- `content/` holds the lesson notebooks. Each folder numbers its notebooks from `01`, so the JupyterLite file browser lists them in lesson order. The numbers start again in the next folder. Catalog titles stay unnumbered. Python only.
  - `content/getting-started/` has `01-jupyter-basics.ipynb` through `06-imports-and-plots.ipynb`.
  - `content/python-basics/` has `01-python-as-a-calculator.ipynb` through `06-modules-and-help.ipynb`.
  - `content/python-plotting/` has `01-matplotlib-figures-and-labels.ipynb` through `03-straight-line-fit.ipynb`. The matplotlib lesson plays a short animation in the page.
  - `content/matplotlib/` has `01-figures-and-axes.ipynb` through `13-saving-a-figure.ipynb`. On the library page this is the Matplotlib course, after Plotting and packages and before Basic mathematics. The formal name in the lessons is Matplotlib. The lessons sit under Figures and axes, Common plots, and Polish and export. Plotting and packages stays the short introduction. The examples are small questionnaire and test-score tables. Scatterplots add colour, size, and a second group. KDE plots run `scipy.stats.gaussian_kde` on ten scores and say how that curve differs from a fuller density estimate: the sample is very small, the bandwidth is the library default, and the normal bumps can spill past a bounded score.
  - `content/basic-mathematics/` has `01-numbers-and-notation.ipynb` through `18-distributions.ipynb`. On the library page those lessons sit under headings inside the Basic mathematics course: Foundations, Chance and summary, Arrays, Calculus, and Fitting.
  - `content/descriptive-statistics/` has `01-a-table-of-counts.ipynb` through `07-choosing-a-display.ipynb`. On the library page this is the Descriptive statistics course, a flat list. The formal name in the lessons is Descriptive statistics and data visualisation.
  - `content/introductory-statistics/` has `01-an-event-and-its-complement.ipynb` through `14-a-count-outcome.ipynb`. On the library page those lessons sit under Probability and sampling, Estimation, Comparing groups, and Linear models and GLM.
  - `content/non-parametric-tests/` has `01-when-a-mean-is-a-poor-summary.ipynb` through `12-what-these-tests-do-not-claim.ipynb`. On the library page this is the Non-parametric tests course, after Introductory statistics and before Mixed models / GLMM. The formal name in the lessons is Non-parametric tests. The lessons sit under Ranks and related scores, Comparing groups, and Association and limits. The examples are small questionnaire, rating, and test-score tables. They use rank sums, a sign count, the Wilcoxon signed-rank test, the Mann–Whitney test, the Kruskal–Wallis test, the Friedman test, an uncorrected sketch of pairs, Spearman's rank correlation, a chi-square and Fisher's exact test on counts, and a small permutation sketch. The lessons say how those examples differ from a full analysis.
  - `content/glmm/` has `01-rows-that-share-a-cluster.ipynb` through `10-reading-an-estimate-with-care.ipynb`. On the library page this is the Mixed models / GLMM course. The formal name in the lessons is Advanced modelling with GLMM. The lessons sit under Clustered data, Linear mixed models, and Generalised mixed models.
  - `content/factor-analysis-sem/` has `01-many-correlated-variables.ipynb` through `12-what-fit-means-and-when-not-to-use-it.ipynb`. On the library page this is the Factor analysis and SEM course, after Mixed models / GLMM and before Computational modelling. The formal name in the lessons is Principal components, factor analysis, and structural equation models. The lessons sit under Principal component analysis, Factor analysis, and Structural equation models. The examples are small. Principal components use a singular value decomposition. Factor analysis and the structural equation sketches use chosen numbers, and a short search where that makes the algebra visible. New axes for a cloud of points plays a short animation.
  - `content/computational-modelling/` has `01-what-a-model-is.ipynb` through `09-what-a-good-fit-does-not-prove.ipynb`. On the library page those nine lessons sit under Foundations, the first heading in the Computational modelling course. This is Module 1. The process model, the simulation lesson, and parameter recovery each play a short animation in the cell output. Drag the slider under the figure, or press Play.
  - `content/model-fitting/` has four lessons, from numerical optimisation through a fit that fails.
  - `content/model-comparison/` has four lessons, from nested models through evidence and prediction.
  - `content/choice-and-response-time/` has three lessons, from signal detection through accuracy and response time.
  - `content/learning-and-updating/` has three lessons, from an incremental update through learning curves.
  - `content/neural-and-psychometric-links/` has three lessons, from a psychometric curve through a simulated neural summary.
  - `content/building-your-own-model/` has three lessons, from a hypothesis through the limits of a report. On the library page this folder, and the five modelling folders above it, are headings after Foundations in the Computational modelling course.
  - `content/machine-learning/` has `01-prediction-and-explanation.ipynb` through `12-what-these-examples-leave-out.ipynb`. On the library page this is the Machine learning course, after Computational modelling. The formal name in the lessons is Introduction to machine learning. The lessons sit under Learning from data, Supervised learning, and Unsupervised learning and limits. The examples are small test-score and questionnaire tables. They include scaling a numeric column, encoding a category, and a short cross-validation beside a train/test error. Neighbours and trees fit k-nearest neighbours and one decision tree. Principal components, briefly, points to Factor analysis and SEM and does not repeat that course.
- `content/check.py` is a small helper. The Python basics, Plotting and packages, Matplotlib, Basic mathematics, statistics, non-parametric tests, computational modelling, and machine learning lessons import it for the short task at the end of each notebook. Getting started does not. The cell starts with a blank and passes a short check id plus the value the learner computed. The expected results live in `check.py`. A match prints a confirmation. The first miss prints a hint. Calling the same check again, or passing `show=True`, prints the expected result. Module 1 uses ids `cm01-1` through `cm09-2`. Later modelling lessons use the prefixes `mf`, `mc`, `crt`, `lu`, `np`, and `byo`. Plotting and packages uses `pp`. Descriptive statistics uses `ds`, Introductory statistics uses `is`, and Mixed models / GLMM uses `glmm`. Factor analysis and SEM uses `pca`, `fa`, and `sem`. Machine learning uses `ml`. Non-parametric tests uses `npt`. Matplotlib uses `mpl`.
- `library.json` lists the lessons in those groups. A group is a course. Each course has an `area` (`foundation`, `statistics`, or `modelling`). The `areas` array names those menu headings, in order, so a later course can join a heading without a layout change. A group can include `sections`, and the library page shows each section title as a module heading inside that course. Its `materials` array is empty. Notes, readings, and explainers can be added later under `materials/` and listed from that array. The library page shows a Materials section only when the array has entries.
- `lite/` is the built JupyterLite site (jupyterlite-core 0.8.7 and jupyterlite-pyodide-kernel 0.8.7), with the Lab application only.
- `cite.html` is the citation, the credit line, and how to reuse a lesson. `license.html` says which license covers teaching material and which covers source code.
- `CITATION.cff` is the machine-readable citation. `LICENSE` is the CC BY 4.0 legal text. `LICENSE-CODE` is the MIT license for source code.
- `CHANGELOG.md` records versions, starting at 0.1.0. `CONTRIBUTING.md` is how to report a bug or open a pull request.
- `js/site-meta.js` holds the version, the date, and the citation strings. `js/cite-page.js` fills the citation blocks on `cite.html`.

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

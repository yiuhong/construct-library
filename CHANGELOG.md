# Changelog

All notable changes to Project Construct are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Added

- Previous and Next in the notebook title bar, outside the notebook itself. They follow the lesson order on the library page, including from the last lesson of one tab to the first lesson of the next. Previous is hidden on the first lesson. On the last lesson, Next is hidden and Back to library is shown. A notebook that is not in the library hides both. Desktop says Previous lesson and Next lesson. Tablet says Previous and Next. Phone shows chevrons, with those full names for screen readers. The public version stays 0.1.0.
- Plotting and packages, after Python basics and before Basic mathematics: three lessons. Matplotlib figures and labels, including a short animation that plays in the notebook page. A pandas table and a plot. A straight-line fit with scipy. Each notebook ends with a short self-check. The public version stays 0.1.0.
- Computational modelling, Module 1: nine short lessons in `content/computational-modelling/`, on a Computational modelling tab after Basic mathematics. The lessons run from what a model is through a caution on identifiability and overfitting. Each ends with a short self-check. Expected results live in `content/check.py` under ids `cm01-1` and `cm01-2`, and the same pattern through `cm09-2`. The public version stays 0.1.0.
- Three of those lessons play a short animation in the cell output, from Matplotlib's JavaScript player. The process model fills the two counters. Simulating data adds one score at a time. Parameter recovery shows recovered slopes tightening as the sample grows. Drag the slider under the figure, or press Play. The caution lesson has no animation.
- Computational modelling lessons for model fitting, model comparison, choice and response time, learning and updating, neural and psychometric links, and building your own model. Catalog titles are unnumbered. Each lesson ends with a Check yourself task. Expected results are in `content/check.py` under the ids `mf`, `mc`, `crt`, `lu`, `np`, and `byo`. The public version stays 0.1.0.
- Four of those lessons play a short animation in the notebook, from Matplotlib's HTML player: Numerical optimisation, An accumulator model, Learning curves, and A psychometric curve. Run the cell, then press play or drag the slider.

### Changed

- Each lesson opens with one short question, placed after the title, and closes with two or three lines on what was just practised. Parameter recovery already asked its question in the opening paragraph, so that opening was left as it was and only the closing lines were added. Lessons, their order, their titles, and the self-checks are unchanged. The public version stays 0.1.0.
- Previous and Next show the adjacent lesson's title on hover and on keyboard focus. The title comes from the library, and the note sits under the control so the title bar stays the same height. The accessible name includes it, for example Next lesson: A straight-line fit. On a phone the control is still a chevron; a long-press shows the title, and the accessible name still includes it. The public version stays 0.1.0.
- The Jupyter basics tour is unchanged on a desktop window. On a narrower window it still skips Files, because that panel is hidden, and it skips any other step whose target is not on the screen. On a phone the kernel name sits under the More commands button in the toolbar, and that step points there. The public version stays 0.1.0.
- Check yourself cells in Python basics and Basic mathematics start from a blank. The expected result is stored in `content/check.py` under a short id. A match prints `That matches.` A first miss prints `Not yet.` and the hint. Run that check again, or pass `show=True`, to print the expected result.
- Screens narrower than 1280px use a shorter title bar and a tighter footer. On the notebook page the JupyterLite file panel is hidden at those widths so the cells can use the space. From 641px to 1279px, Lab's left activity bar stays as a slim rail. Below 640px both activity bars are hidden. At 1280px and above, the frame and the open file panel are unchanged. The public version stays 0.1.0.

## 0.1.0 — 17 November 2026

First versioned release. The repository had no version before 0.1.0.

### The library

- Getting started: 6 lessons, from Jupyter Notebook basics through imports and plots.
- Python basics: 6 lessons, from Python as a calculator through modules and help. Each notebook ends with a short self-check.
- Basic mathematics: 18 lessons, from numbers and notation through distributions. On the library page they sit under Foundations, Chance and summary, Arrays, Calculus, and Fitting. Each notebook ends with a short self-check.

### Added

- Cite & reuse (`cite.html`), with an APA 7 citation, BibTeX, a lesson citation, a credit line, and notes on reuse.
- A machine-readable citation (`CITATION.cff`, Citation File Format 1.2.0).
- The CC BY 4.0 legal text (`LICENSE`) for teaching text, explanations, and figures, and the MIT license (`LICENSE-CODE`) for the HTML, CSS, JavaScript, and Python that run the site and the notebooks.
- A license page (`license.html`) that says which license covers which part.
- A site footer on the public pages: the JupyterLite note, the author, both licenses, and links to cite, licenses, this changelog, and contributing notes.
- Contributing notes (`CONTRIBUTING.md`).

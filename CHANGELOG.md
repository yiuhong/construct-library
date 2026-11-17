# Changelog

All notable changes to Project Construct are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Added

- Computational modelling, Module 1: nine short lessons in `content/computational-modelling/`, on a Computational modelling tab after Basic mathematics. The lessons run from what a model is through a caution on identifiability and overfitting. Each ends with a short self-check. Expected results live in `content/check.py` under ids `cm01-1` and `cm01-2`, and the same pattern through `cm09-2`. The public version stays 0.1.0.

### Changed

- Check yourself cells in Python basics and Basic mathematics start from a blank. The expected result is stored in `content/check.py` under a short id. A match prints `That matches.` A first miss prints `Not yet.` and the hint. Run that check again, or pass `show=True`, to print the expected result.

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

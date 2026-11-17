/*
 * Site-wide facts for Project Construct.
 *
 * Version and the updated date live here. index.html, notebook.html,
 * cite.html, and license.html repeat the same version and date in the
 * HTML so the pages still read correctly without JavaScript. When you
 * bump this file, update that fallback, CITATION.cff, and CHANGELOG.md.
 */
(function (global) {
  var meta = {
    title: "Project Construct: A hands-on library for mathematical and computational psychology and neuroscience",
    titleApa: "Project Construct: A hands-on library for mathematical and computational psychology and neuroscience",
    author: "Yiu Hong Ko",
    authorApa: "Ko, Y. H.",
    authorBibtex: "Ko, Yiu Hong",
    email: "yiuhong.ko@gmail.com",
    orcid: "https://orcid.org/0000-0003-4436-0166",
    orcidId: "0000-0003-4436-0166",
    personalSite: "https://yiuhong.github.io/",
    url: "https://yiuhong.github.io/construct-library/",
    repo: "https://github.com/yiuhong/construct-library",
    issues: "https://github.com/yiuhong/construct-library/issues",
    version: "0.1.0",
    updated: "2026-11-17",
    updatedDisplay: "17 November 2026",
    year: "2026",
    contentLicense: "CC BY 4.0",
    codeLicense: "MIT",
    bibtexKey: "ko2026projectconstruct",
    lessonExampleTitle: "Jupyter Notebook basics",
    lessonExamplePath: "notebook.html?path=getting-started/01-jupyter-basics.ipynb"
  };

  meta.bibtex = [
    "@misc{" + meta.bibtexKey + ",",
    "  author  = {" + meta.authorBibtex + "},",
    "  title   = {{" + meta.title + "}},",
    "  year    = {" + meta.year + "},",
    "  version = {" + meta.version + "},",
    "  url     = {" + meta.url + "},",
    "  note    = {Version " + meta.version + ", last updated " + meta.updatedDisplay + "}",
    "}"
  ].join("\n");

  meta.credit = "From " + meta.title + " by " + meta.author + " (" + meta.url + "). Content licensed under " + meta.contentLicense + ".";

  meta.lessonCitation = meta.lessonExampleTitle + ". " + meta.title + " (Version " + meta.version + "). " + meta.url + meta.lessonExamplePath;

  meta.lessonFrame = '<iframe src="' + meta.url + meta.lessonExamplePath + '" title="' + meta.lessonExampleTitle.replace(/"/g, "") + '" width="100%" height="720" style="border:0"></iframe>';

  global.CONSTRUCT_LIBRARY = meta;

  function apply() {
    if (!document || !document.querySelectorAll) return;
    var nodes = document.querySelectorAll("[data-site-field]");
    Array.prototype.forEach.call(nodes, function (node) {
      var key = node.getAttribute("data-site-field");
      if (!key || meta[key] == null) return;
      node.textContent = String(meta[key]);
      var datetimeKey = node.getAttribute("data-site-datetime");
      if (datetimeKey && meta[datetimeKey] != null) {
        node.setAttribute("datetime", String(meta[datetimeKey]));
      }
    });
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply);
    else apply();
  }
})(typeof window !== "undefined" ? window : globalThis);

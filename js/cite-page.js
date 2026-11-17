/*
 * Fills the citation blocks on cite.html from js/site-meta.js
 * and wires the copy buttons. The HTML already contains the same text
 * for visitors without JavaScript.
 */
(function () {
  var meta = window.CONSTRUCT_LIBRARY;
  if (!meta) return;

  var apa = document.getElementById("apa-citation");
  if (apa) {
    apa.textContent = "";
    apa.appendChild(document.createTextNode(meta.authorApa + " (" + meta.year + "). "));
    var title = document.createElement("em");
    title.textContent = meta.titleApa;
    apa.appendChild(title);
    apa.appendChild(document.createTextNode(" (Version " + meta.version + "). " + meta.url));
  }

  var bibtex = document.getElementById("bibtex-citation");
  if (bibtex) bibtex.textContent = meta.bibtex;

  var lesson = document.getElementById("lesson-citation");
  if (lesson) lesson.textContent = meta.lessonCitation;

  var credit = document.getElementById("credit-line");
  if (credit) credit.textContent = meta.credit;

  var frame = document.getElementById("lesson-frame");
  if (frame) frame.textContent = meta.lessonFrame;

  function textFor(id, mode) {
    var node = document.getElementById(id);
    if (!node) return "";
    if (mode === "pre") return node.textContent.replace(/\s+$/, "");
    return node.textContent.replace(/\s+/g, " ").trim();
  }

  function selectNode(node) {
    var range = document.createRange();
    range.selectNodeContents(node);
    var selection = window.getSelection();
    if (!selection) return;
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function flash(button) {
    var label = button.getAttribute("data-label") || button.textContent;
    button.textContent = "Copied";
    window.setTimeout(function () {
      button.textContent = label;
    }, 1600);
  }

  var buttons = document.querySelectorAll(".copy-button");
  Array.prototype.forEach.call(buttons, function (button) {
    button.setAttribute("data-label", button.textContent);
    button.addEventListener("click", function () {
      var id = button.getAttribute("data-copy");
      var mode = button.getAttribute("data-copy-mode") || "inline";
      var text = textFor(id, mode);
      var node = document.getElementById(id);
      function fallback() {
        if (node) selectNode(node);
      }
      if (!text || !navigator.clipboard || !navigator.clipboard.writeText) {
        fallback();
        return;
      }
      navigator.clipboard.writeText(text).then(function () {
        flash(button);
      }).catch(function () {
        fallback();
      });
    });
  });
})();

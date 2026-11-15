(function () {
  var lessonsRoot = document.querySelector("[data-lessons]");
  var materialsRoot = document.querySelector("[data-materials]");
  if (!lessonsRoot) return;

  function notebookIcon() {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "lesson-icon");
    svg.setAttribute("viewBox", "0 0 16 16");
    svg.setAttribute("width", "16");
    svg.setAttribute("height", "16");
    svg.setAttribute("aria-hidden", "true");
    var page = document.createElementNS("http://www.w3.org/2000/svg", "path");
    page.setAttribute("fill", "#f37626");
    page.setAttribute("d", "M3 1.2h6.1L13 5.1v9.7H3z");
    var fold = document.createElementNS("http://www.w3.org/2000/svg", "path");
    fold.setAttribute("fill", "#fff");
    fold.setAttribute("d", "M9.1 1.4V5h3.6");
    var lines = document.createElementNS("http://www.w3.org/2000/svg", "path");
    lines.setAttribute("fill", "none");
    lines.setAttribute("stroke", "#fff");
    lines.setAttribute("stroke-width", "1");
    lines.setAttribute("stroke-linecap", "round");
    lines.setAttribute("d", "M5 8.1h6M5 10.2h6M5 12.3h3.6");
    svg.appendChild(page);
    svg.appendChild(fold);
    svg.appendChild(lines);
    return svg;
  }

  function lessonLink(item) {
    var path = String(item.path || "");
    var link = document.createElement("a");
    link.className = "lesson";
    link.href = "notebook.html?path=" + path.split("/").map(encodeURIComponent).join("/");
    link.appendChild(notebookIcon());
    var text = document.createElement("span");
    var name = document.createElement("span");
    name.className = "lesson-name";
    name.textContent = item.title || path;
    var summary = document.createElement("span");
    summary.className = "lesson-summary";
    summary.textContent = item.summary || "";
    text.appendChild(name);
    text.appendChild(summary);
    link.appendChild(text);
    var open = document.createElement("span");
    open.className = "lesson-open";
    open.textContent = "Open notebook";
    link.appendChild(open);
    return link;
  }

  function safeHref(href) {
    if (typeof href !== "string") return "";
    if (href.indexOf("..") !== -1 || href.indexOf("://") !== -1 || href.charAt(0) === "/") return "";
    return href;
  }

  fetch("library.json")
    .then(function (response) {
      if (!response.ok) throw new Error("library.json");
      return response.json();
    })
    .then(function (data) {
      lessonsRoot.textContent = "";
      (data.lessons || []).forEach(function (item) {
        if (!item || !item.path) return;
        lessonsRoot.appendChild(lessonLink(item));
      });

      var materials = data.materials || [];
      if (!materialsRoot || !materials.length) return;
      var heading = document.createElement("h2");
      heading.className = "kicker";
      heading.textContent = "Materials";
      var list = document.createElement("div");
      list.className = "lessons";
      materials.forEach(function (item) {
        var href = safeHref(item.href);
        if (!href) return;
        var link = document.createElement("a");
        link.className = "lesson";
        link.href = href;
        var text = document.createElement("span");
        var name = document.createElement("span");
        name.className = "lesson-name";
        name.textContent = item.title || href;
        var summary = document.createElement("span");
        summary.className = "lesson-summary";
        summary.textContent = item.summary || "";
        text.appendChild(name);
        text.appendChild(summary);
        link.appendChild(text);
        list.appendChild(link);
      });
      materialsRoot.appendChild(heading);
      materialsRoot.appendChild(list);
    })
    .catch(function () {
      if (!lessonsRoot.children.length) {
        lessonsRoot.textContent = "The lesson list could not be loaded. Serve this folder with a local web server.";
      }
    });
})();

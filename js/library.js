(function () {
  var catalog = document.querySelector("[data-catalog]");
  var nav = document.querySelector("[data-cat-tabs]");
  var materialsRoot = document.querySelector("[data-materials]");

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

  function chevronIcon(className) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", className);
    svg.setAttribute("viewBox", "0 0 16 16");
    svg.setAttribute("width", "14");
    svg.setAttribute("height", "14");
    svg.setAttribute("aria-hidden", "true");
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "1.5");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    path.setAttribute("d", "M5.8 3.2 10.6 8l-4.8 4.8");
    svg.appendChild(path);
    return svg;
  }

  function lessonLink(item) {
    var path = String(item.path || "");
    var link = document.createElement("a");
    link.className = "lesson";
    link.href = "notebook.html?path=" + path.split("/").map(encodeURIComponent).join("/");
    link.appendChild(notebookIcon());
    var text = document.createElement("span");
    text.className = "lesson-text";
    var name = document.createElement("span");
    name.className = "lesson-name";
    name.textContent = item.title || path;
    var summary = document.createElement("span");
    summary.className = "lesson-summary";
    summary.textContent = item.summary || "";
    text.appendChild(name);
    text.appendChild(summary);
    link.appendChild(text);
    link.appendChild(chevronIcon("lesson-chevron"));
    return link;
  }

  function notebookCount(count) {
    return count === 1 ? "1 notebook" : count + " notebooks";
  }

  function setModuleOpen(button, panel, open) {
    button.setAttribute("aria-expanded", open ? "true" : "false");
    panel.hidden = !open;
  }

  function moduleBlock(group, section, index) {
    var open = index === 0;
    var panelId = "module-panel-" + group.id + "-" + index;
    var block = document.createElement("div");
    block.className = "lesson-section";
    var heading = document.createElement("h3");
    heading.className = "subgroup";
    var button = document.createElement("button");
    button.type = "button";
    button.className = "module-toggle";
    button.setAttribute("aria-expanded", open ? "true" : "false");
    button.setAttribute("aria-controls", panelId);
    var title = document.createElement("span");
    title.className = "module-title";
    title.textContent = section.title;
    var count = document.createElement("span");
    count.className = "module-count";
    count.textContent = notebookCount(section.lessons.length);
    button.appendChild(title);
    button.appendChild(count);
    button.appendChild(chevronIcon("module-chevron"));
    heading.appendChild(button);
    var panel = document.createElement("div");
    panel.className = "module-lessons";
    panel.id = panelId;
    panel.hidden = !open;
    section.lessons.forEach(function (item) {
      panel.appendChild(lessonLink(item));
    });
    button.addEventListener("click", function () {
      setModuleOpen(button, panel, button.getAttribute("aria-expanded") !== "true");
    });
    block.appendChild(heading);
    block.appendChild(panel);
    return block;
  }

  function slug(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function lessonList(list) {
    return (list || []).filter(function (item) {
      return item && item.path;
    });
  }

  function groupsFrom(data) {
    var source = Array.isArray(data.groups) ? data.groups : [];
    var groups = [];
    source.forEach(function (group) {
      if (!group) return;
      var lessons = lessonList(group.lessons);
      var sections = [];
      (group.sections || []).forEach(function (section) {
        if (!section) return;
        var items = lessonList(section.lessons);
        if (!items.length) return;
        sections.push({ title: section.title || "", lessons: items });
      });
      if (!lessons.length && !sections.length) return;
      var title = group.title || "Lessons";
      var id = slug(group.id || title);
      if (!id) return;
      groups.push({ id: id, title: title, lessons: lessons, sections: sections });
    });
    return groups;
  }

  function panels() {
    if (!catalog) return [];
    return Array.prototype.slice.call(catalog.querySelectorAll("[data-group-panel]"));
  }

  function tabs() {
    if (!nav) return [];
    return Array.prototype.slice.call(nav.querySelectorAll(".cat-tab"));
  }

  function hasArt(groupId) {
    var root = document.querySelector("[data-course-art]");
    if (!root || !groupId) return false;
    var imgs = root.querySelectorAll("[data-course-art-id]");
    for (var i = 0; i < imgs.length; i++) {
      if (imgs[i].getAttribute("data-course-art-id") === groupId) return true;
    }
    return false;
  }

  function showCourseArt(groupId) {
    var root = document.querySelector("[data-course-art]");
    if (!root) return;
    Array.prototype.forEach.call(root.querySelectorAll("[data-course-art-id]"), function (img) {
      img.classList.toggle("is-shown", img.getAttribute("data-course-art-id") === groupId);
    });
  }

  function activate() {
    var tabList = tabs();
    var panelList = panels();
    if (!tabList.length || !panelList.length) return;
    var hash = location.hash.replace(/^#/, "");
    var known = panelList.some(function (panel) {
      return panel.getAttribute("data-group-panel") === hash;
    });
    var current = known ? hash : tabList[0].getAttribute("data-group");
    tabList.forEach(function (tab) {
      var on = tab.getAttribute("data-group") === current;
      tab.classList.toggle("is-selected", on);
      if (on) tab.setAttribute("aria-current", "page");
      else tab.removeAttribute("aria-current");
    });
    panelList.forEach(function (panel) {
      panel.hidden = panel.getAttribute("data-group-panel") !== current;
    });
    showCourseArt(!known && hasArt(hash) ? hash : current);
  }

  function renderGroups(groups) {
    if (!catalog || !nav || !groups.length) return;
    nav.textContent = "";
    panels().forEach(function (panel) {
      panel.remove();
    });
    var anchor = nav;
    groups.forEach(function (group) {
      var tab = document.createElement("a");
      tab.className = "cat-tab";
      tab.href = "#" + group.id;
      tab.setAttribute("data-group", group.id);
      tab.textContent = group.title;
      nav.appendChild(tab);

      var panel = document.createElement("div");
      panel.className = "lessons";
      panel.id = "panel-" + group.id;
      panel.setAttribute("data-group-panel", group.id);
      panel.setAttribute("aria-label", group.title);
      tab.setAttribute("aria-controls", panel.id);
      if (group.sections.length) {
        group.sections.forEach(function (section, index) {
          if (!section.title) {
            section.lessons.forEach(function (item) {
              panel.appendChild(lessonLink(item));
            });
            return;
          }
          panel.appendChild(moduleBlock(group, section, index));
        });
      } else {
        group.lessons.forEach(function (item) {
          panel.appendChild(lessonLink(item));
        });
      }
      anchor.insertAdjacentElement("afterend", panel);
      anchor = panel;
    });
    activate();
  }

  function safeHref(href) {
    if (typeof href !== "string") return "";
    if (href.indexOf("..") !== -1 || href.indexOf("://") !== -1 || href.charAt(0) === "/") return "";
    return href;
  }

  window.addEventListener("hashchange", activate);
  activate();

  if (!catalog) return;

  fetch("library.json")
    .then(function (response) {
      if (!response.ok) throw new Error("library.json");
      return response.json();
    })
    .then(function (data) {
      renderGroups(groupsFrom(data));

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
      if (!list.children.length) return;
      materialsRoot.appendChild(heading);
      materialsRoot.appendChild(list);
    })
    .catch(function () {
      if (panels().length) return;
      var note = document.createElement("p");
      note.className = "lede";
      note.textContent = "The lesson list could not be loaded. Serve this folder with a local web server.";
      catalog.appendChild(note);
    });
})();

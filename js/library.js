(function () {
  var catalog = document.querySelector("[data-catalog]");
  var menu = document.querySelector("[data-course-menu]");
  var detail = document.querySelector("[data-course-detail]");
  var switcherButton = document.querySelector("[data-course-switcher]");
  var switcherName = document.querySelector("[data-course-switcher-name]");
  var courseTitle = document.querySelector("[data-course-title]");
  var materialsRoot = document.querySelector("[data-materials]");
  var menuOpen = false;
  var coursesById = {};
  var notesLive = false;

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
      placeCourseArt();
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

  function titleFromId(id) {
    return String(id || "")
      .split("-")
      .map(function (word) {
        if (!word) return "";
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ")
      .trim();
  }

  function lessonList(list) {
    return (list || []).filter(function (item) {
      return item && item.path;
    });
  }

  function areasFrom(data) {
    var source = Array.isArray(data.areas) ? data.areas : [];
    var areas = [];
    var seen = {};
    source.forEach(function (area) {
      if (!area) return;
      var title = String(area.title || "").trim();
      var id = slug(area.id || title);
      if (!id || !title || seen[id]) return;
      seen[id] = true;
      areas.push({ id: id, title: title });
    });
    return areas;
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
      var level = String(group.level || "").trim();
      groups.push({
        id: id,
        title: title,
        area: slug(group.area || ""),
        level: level,
        lessons: lessons,
        sections: sections
      });
    });
    return groups;
  }

  // Menu headings organise the course list only. They are not a content
  // type and not a URL level. A course joins a heading through its area.
  function coursesByArea(areas, groups) {
    var buckets = [];
    var byId = {};
    areas.forEach(function (area) {
      var bucket = { id: area.id, title: area.title, courses: [] };
      buckets.push(bucket);
      byId[area.id] = bucket;
    });
    var unknown = {};
    var unknownOrder = [];
    var loose = [];
    groups.forEach(function (group) {
      if (group.area && byId[group.area]) {
        byId[group.area].courses.push(group);
        return;
      }
      if (group.area) {
        if (!unknown[group.area]) {
          unknown[group.area] = {
            id: group.area,
            title: titleFromId(group.area),
            courses: []
          };
          unknownOrder.push(unknown[group.area]);
        }
        unknown[group.area].courses.push(group);
        return;
      }
      loose.push(group);
    });
    var result = buckets.filter(function (bucket) {
      return bucket.courses.length;
    });
    unknownOrder.forEach(function (bucket) {
      result.push(bucket);
    });
    if (loose.length) result.push({ id: "courses", title: "", courses: loose });
    return result;
  }

  function panels() {
    if (!catalog) return [];
    return Array.prototype.slice.call(catalog.querySelectorAll("[data-group-panel]"));
  }

  function courseLinks() {
    if (!menu) return [];
    return Array.prototype.slice.call(menu.querySelectorAll(".course-link"));
  }

  function isPhone() {
    return window.matchMedia("(max-width: 640px)").matches;
  }

  function syncSwitcher() {
    if (!switcherButton) return;
    var expanded = !isPhone() || menuOpen;
    switcherButton.setAttribute("aria-expanded", expanded ? "true" : "false");
  }

  function setSwitcherOpen(open) {
    menuOpen = !!open;
    if (menu) menu.classList.toggle("is-collapsed", !menuOpen);
    syncSwitcher();
  }

  function focusSelectedCourse() {
    var links = courseLinks();
    var current = null;
    links.forEach(function (link) {
      if (!current && link.classList.contains("is-selected")) current = link;
    });
    if (!current && links.length) current = links[0];
    if (current) current.focus();
  }

  function onCourseChosen(event) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (event.button && event.button !== 0) return;
    if (!isPhone()) return;
    setSwitcherOpen(false);
    if (switcherButton) switcherButton.focus();
  }

  // The difficulty line is the course's level word from library.json.
  function compactLabel(group) {
    if (!group) return "";
    return group.level || "";
  }

  function linkTitle(link) {
    return link.textContent;
  }

  function showCourseNote(label) {
    var notes = document.querySelectorAll("[data-course-note]");
    Array.prototype.forEach.call(notes, function (note) {
      note.textContent = label;
      note.hidden = !label;
      if (notesLive) note.setAttribute("aria-live", "polite");
    });
    if (!switcherButton) return;
    if (label) switcherButton.setAttribute("aria-describedby", "course-note-switcher");
    else switcherButton.removeAttribute("aria-describedby");
  }

  function courseLink(group) {
    var link = document.createElement("a");
    link.className = "course-link";
    link.href = "#" + group.id;
    link.setAttribute("data-group", group.id);
    link.textContent = group.title;
    link.addEventListener("click", onCourseChosen);
    return link;
  }

  function areaBlock(area) {
    var block = document.createElement("div");
    block.className = "course-group";
    var list = document.createElement("div");
    if (area.title) {
      var label = document.createElement("p");
      label.className = "kicker";
      label.id = "course-area-" + area.id;
      label.textContent = area.title;
      list.setAttribute("role", "group");
      list.setAttribute("aria-labelledby", label.id);
      block.appendChild(label);
    }
    area.courses.forEach(function (group) {
      list.appendChild(courseLink(group));
    });
    block.appendChild(list);
    return block;
  }

  function coursePanel(group) {
    var panel = document.createElement("div");
    panel.className = "lessons";
    panel.id = "panel-" + group.id;
    panel.setAttribute("data-group-panel", group.id);
    panel.setAttribute("aria-label", group.title);
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
    return panel;
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

  function placeCourseArt() {
    var root = document.querySelector("[data-course-art]");
    var heading = document.querySelector(".library-main h1");
    var panel = document.querySelector("[data-group-panel]:not([hidden])");
    if (!root || !heading || !panel) return;
    // Hidden below 1600px, where the 400px drawing fits beside the catalogue.
    if (window.matchMedia("(max-width: 1599px)").matches) {
      root.style.top = "";
      return;
    }
    var artHeight = root.offsetHeight;
    if (!artHeight) return;
    var origin = root.offsetParent || document.documentElement;
    var originTop = origin.getBoundingClientRect().top;
    var headingTop = heading.getBoundingClientRect().top - originTop;
    var listBottom = panel.getBoundingClientRect().bottom - originTop;
    var span = listBottom - headingTop;
    var top = artHeight >= span ? headingTop : headingTop + (span - artHeight) / 2;
    var footer = document.querySelector(".site-footer");
    if (footer) {
      var footerTop = footer.getBoundingClientRect().top - originTop;
      if (top + artHeight > footerTop) top = Math.min(headingTop, footerTop - artHeight);
    }
    if (top < 0) top = 0;
    root.style.top = top + "px";
  }

  function activate() {
    var linkList = courseLinks();
    var panelList = panels();
    if (!linkList.length || !panelList.length) return;
    var hash = location.hash.replace(/^#/, "");
    var known = panelList.some(function (panel) {
      return panel.getAttribute("data-group-panel") === hash;
    });
    var current = known ? hash : linkList[0].getAttribute("data-group");
    var currentTitle = "";
    linkList.forEach(function (link) {
      var on = link.getAttribute("data-group") === current;
      link.classList.toggle("is-selected", on);
      if (on) {
        link.setAttribute("aria-current", "page");
        currentTitle = linkTitle(link);
      } else {
        link.removeAttribute("aria-current");
      }
    });
    panelList.forEach(function (panel) {
      var on = panel.getAttribute("data-group-panel") === current;
      panel.hidden = !on;
      if (on && currentTitle) panel.setAttribute("aria-label", currentTitle);
    });
    if (currentTitle) {
      if (courseTitle) courseTitle.textContent = currentTitle;
      if (switcherName) switcherName.textContent = currentTitle;
      if (switcherButton) switcherButton.setAttribute("aria-label", "Course: " + currentTitle);
    }
    if (coursesById[current]) showCourseNote(compactLabel(coursesById[current]));
    showCourseArt(!known && hasArt(hash) ? hash : current);
    placeCourseArt();
  }

  function renderGroups(groups, areas) {
    if (!catalog || !menu || !detail || !groups.length) return;
    coursesById = {};
    groups.forEach(function (group) {
      coursesById[group.id] = group;
    });
    menu.textContent = "";
    panels().forEach(function (panel) {
      panel.remove();
    });
    coursesByArea(areas, groups).forEach(function (area) {
      menu.appendChild(areaBlock(area));
    });
    groups.forEach(function (group) {
      detail.appendChild(coursePanel(group));
    });
    activate();
    notesLive = true;
  }

  function safeHref(href) {
    if (typeof href !== "string") return "";
    if (href.indexOf("..") !== -1 || href.indexOf("://") !== -1 || href.charAt(0) === "/") return "";
    return href;
  }

  if (switcherButton) {
    switcherButton.addEventListener("click", function () {
      if (!isPhone()) return;
      setSwitcherOpen(!menuOpen);
    });
    switcherButton.addEventListener("keydown", function (event) {
      if (event.key !== "ArrowDown" || !isPhone()) return;
      event.preventDefault();
      setSwitcherOpen(true);
      focusSelectedCourse();
    });
  }

  if (menu) {
    menu.addEventListener("keydown", function (event) {
      var links = courseLinks();
      if (!links.length) return;
      var index = links.indexOf(document.activeElement);
      if (index === -1) return;
      var next = -1;
      if (event.key === "ArrowDown") next = (index + 1) % links.length;
      else if (event.key === "ArrowUp") next = (index - 1 + links.length) % links.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = links.length - 1;
      else return;
      event.preventDefault();
      links[next].focus();
    });
  }

  document.addEventListener("click", function (event) {
    if (!isPhone() || !menuOpen) return;
    var target = event.target;
    if (!target) return;
    if (switcherButton && (target === switcherButton || switcherButton.contains(target))) return;
    if (menu && (target === menu || menu.contains(target))) return;
    setSwitcherOpen(false);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape" || !isPhone() || !menuOpen) return;
    setSwitcherOpen(false);
    if (switcherButton) switcherButton.focus();
  });

  window.addEventListener("hashchange", function () {
    activate();
    if (isPhone()) setSwitcherOpen(false);
  });
  window.addEventListener("resize", function () {
    syncSwitcher();
    placeCourseArt();
  });
  if (window.ResizeObserver && catalog) {
    var artObserver = new ResizeObserver(function () {
      placeCourseArt();
    });
    artObserver.observe(catalog);
  }
  syncSwitcher();
  activate();

  if (!catalog) return;

  fetch("library.json")
    .then(function (response) {
      if (!response.ok) throw new Error("library.json");
      return response.json();
    })
    .then(function (data) {
      renderGroups(groupsFrom(data), areasFrom(data));

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

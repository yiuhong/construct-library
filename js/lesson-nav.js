/*
 * Lesson order for the notebook title bar.
 * The sequence matches the library page: groups in catalogue order, and,
 * where a group has sections, the lessons inside those sections. Top-level
 * lessons are used only when the group has no sections, which is how the
 * front door renders a tab. Each entry keeps the catalogue title, so the
 * title bar can name the previous or next lesson.
 */
(function (root) {
  function normalise(path) {
    return String(path || "").replace(/^\/+/, "");
  }

  function slug(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function lessonEntries(list) {
    var entries = [];
    (list || []).forEach(function (item) {
      if (item && item.path) {
        entries.push({
          path: normalise(item.path),
          title: item.title ? String(item.title) : ""
        });
      }
    });
    return entries;
  }

  function lessonsFromCatalog(data) {
    var lessons = [];
    var groups = data && Array.isArray(data.groups) ? data.groups : [];
    groups.forEach(function (group) {
      if (!group) return;
      var title = group.title || "Lessons";
      if (!slug(group.id || title)) return;
      var sections = [];
      (group.sections || []).forEach(function (section) {
        if (!section) return;
        var items = lessonEntries(section.lessons);
        if (items.length) sections.push(items);
      });
      var groupLessons = lessonEntries(group.lessons);
      if (!groupLessons.length && !sections.length) return;
      if (group.sections && group.sections.length) {
        sections.forEach(function (items) {
          items.forEach(function (lesson) {
            lessons.push(lesson);
          });
        });
        return;
      }
      groupLessons.forEach(function (lesson) {
        lessons.push(lesson);
      });
    });
    return lessons;
  }

  function pathsFromCatalog(data) {
    return lessonsFromCatalog(data).map(function (lesson) {
      return lesson.path;
    });
  }

  function neighbours(paths, current) {
    var path = normalise(current);
    var index = (paths || []).indexOf(path);
    if (index === -1) return null;
    return {
      index: index,
      count: paths.length,
      previous: index > 0 ? paths[index - 1] : null,
      next: index < paths.length - 1 ? paths[index + 1] : null
    };
  }

  function notebookHref(path) {
    var encoded = normalise(path)
      .split("/")
      .map(function (part) {
        return encodeURIComponent(part);
      })
      .join("/");
    return "notebook.html?path=" + encoded;
  }

  var api = {
    lessonsFromCatalog: lessonsFromCatalog,
    pathsFromCatalog: pathsFromCatalog,
    neighbours: neighbours,
    notebookHref: notebookHref
  };

  root.constructLessonNav = api;
  if (typeof module === "object" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

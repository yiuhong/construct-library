/*
 * Lesson order for the notebook title bar.
 * The sequence matches the library page: groups in catalog order, and,
 * where a group has sections, the lessons inside those sections. Top-level
 * lessons are used only when the group has no sections, which is how the
 * front door renders a tab.
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

  function lessonPaths(list) {
    var paths = [];
    (list || []).forEach(function (item) {
      if (item && item.path) paths.push(normalise(item.path));
    });
    return paths;
  }

  function pathsFromCatalog(data) {
    var paths = [];
    var groups = data && Array.isArray(data.groups) ? data.groups : [];
    groups.forEach(function (group) {
      if (!group) return;
      var title = group.title || "Lessons";
      if (!slug(group.id || title)) return;
      var sections = [];
      (group.sections || []).forEach(function (section) {
        if (!section) return;
        var items = lessonPaths(section.lessons);
        if (items.length) sections.push(items);
      });
      var lessons = lessonPaths(group.lessons);
      if (!lessons.length && !sections.length) return;
      if (group.sections && group.sections.length) {
        sections.forEach(function (items) {
          items.forEach(function (path) {
            paths.push(path);
          });
        });
        return;
      }
      lessons.forEach(function (path) {
        paths.push(path);
      });
    });
    return paths;
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
    pathsFromCatalog: pathsFromCatalog,
    neighbours: neighbours,
    notebookHref: notebookHref
  };

  root.constructLessonNav = api;
  if (typeof module === "object" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

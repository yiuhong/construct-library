(function (root) {
  // JupyterLite keeps a browser copy of each opened notebook in IndexedDB
  // (localforage, database "JupyterLite Storage - <baseUrl>", stores "files"
  // and "checkpoints"). Copies stay after a notebook is removed from the
  // published site, so the file browser still lists them.
  // welcome.ipynb, expectation.ipynb, and variance.ipynb are dropped wherever
  // they appear. The earlier Getting started names are dropped only at the
  // file-browser root: the unnumbered filenames, and numbered copies from
  // before they moved into getting-started/. A path inside getting-started/
  // is a published lesson and is kept, as is any notebook a reader created.
  var removedAnywhere = ["welcome.ipynb", "expectation.ipynb", "variance.ipynb"];
  var removedAtRoot = [
    "jupyter-basics.ipynb",
    "markdown-and-equations.ipynb",
    "cell-order-and-kernel.ipynb",
    "errors-and-interrupting.ipynb",
    "saving-a-copy.ipynb",
    "imports-and-plots.ipynb",
    "01-jupyter-basics.ipynb",
    "02-markdown-and-equations.ipynb",
    "03-cell-order-and-kernel.ipynb",
    "04-errors-and-interrupting.ipynb",
    "05-saving-a-copy.ipynb",
    "06-imports-and-plots.ipynb"
  ];

  function isRemovedKey(key) {
    if (typeof key !== "string" || !key) return false;
    var path = key.replace(/^\/+/, "");
    var base = path.split("/").pop();
    if (removedAnywhere.indexOf(base) !== -1) return true;
    if (path.indexOf("/") !== -1) return false;
    return removedAtRoot.indexOf(path) !== -1;
  }

  function listDatabases() {
    if (!root.indexedDB || !root.indexedDB.databases) return Promise.resolve([]);
    return root.indexedDB.databases().then(
      function (dbs) {
        var names = [];
        (dbs || []).forEach(function (db) {
          if (!db || !db.name || db.name.indexOf("JupyterLite Storage") !== 0) return;
          if (names.indexOf(db.name) === -1) names.push(db.name);
        });
        return names;
      },
      function () {
        return [];
      }
    );
  }

  function openExisting(name) {
    return new Promise(function (resolve) {
      var request;
      var created = false;
      try {
        request = root.indexedDB.open(name);
      } catch (err) {
        resolve(null);
        return;
      }
      request.onupgradeneeded = function (event) {
        created = true;
        try {
          event.target.transaction.abort();
        } catch (err) {}
      };
      request.onerror = function () {
        resolve(null);
      };
      request.onsuccess = function () {
        var db = request.result;
        if (created) {
          try {
            db.close();
          } catch (err) {}
          try {
            root.indexedDB.deleteDatabase(name);
          } catch (err) {}
          resolve(null);
          return;
        }
        resolve(db);
      };
    });
  }

  function purgeDatabase(db) {
    var names = [];
    ["files", "checkpoints"].forEach(function (name) {
      if (db.objectStoreNames.contains(name)) names.push(name);
    });
    if (!names.length) {
      db.close();
      return Promise.resolve();
    }
    return new Promise(function (resolve) {
      var tx;
      try {
        tx = db.transaction(names, "readwrite");
      } catch (err) {
        db.close();
        resolve();
        return;
      }
      names.forEach(function (name) {
        var request = tx.objectStore(name).openCursor();
        request.onsuccess = function () {
          var cursor = request.result;
          if (!cursor) return;
          if (isRemovedKey(cursor.key)) cursor.delete();
          cursor.continue();
        };
      });
      function finish() {
        try {
          db.close();
        } catch (err) {}
        resolve();
      }
      tx.oncomplete = finish;
      tx.onerror = finish;
      tx.onabort = finish;
    });
  }

  function purge() {
    if (!root.indexedDB) return Promise.resolve();
    return listDatabases().then(function (names) {
      var chain = Promise.resolve();
      names.forEach(function (name) {
        chain = chain.then(function () {
          return openExisting(name).then(function (db) {
            if (!db) return;
            return purgeDatabase(db);
          });
        });
      });
      return chain;
    });
  }

  root.constructPurgeRemovedNotebooks = purge;
})(window);

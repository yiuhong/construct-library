# Materials

Notes, readings, and explainers can live in this folder. They are not notebooks, and this folder starts empty of those files.

To list one on the library page, add an object to the `materials` array in [`library.json`](../library.json):

```json
{
  "title": "A short note",
  "summary": "One line about it",
  "href": "materials/note.html"
}
```

`href` is a path inside this site. The library page shows a Materials section only when that array has entries.

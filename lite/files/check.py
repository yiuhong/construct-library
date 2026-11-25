"""Mark the short task at the end of a lesson.

A notebook calls ``check(check_id, answer, hint=...)``. The expected result
for that id lives in ``_EXPECTED`` below, not in the notebook. A match prints
``That matches.`` The first miss prints ``Not yet.`` and the hint, when one
was given. Call the same check again, or pass show=True, to print the
expected result.
"""

import math


# Expected results for Check yourself. Keys are stable ids: pb for Python
# basics, pp for Plotting and packages, bm for Basic mathematics, cm for
# Computational modelling, then the lesson number and the check.
# Later computational modelling modules: mf model fitting, mc model comparison,
# crt choice and response time, lu learning and updating, np neural and
# psychometric links, byo building your own model.
# Statistics courses: ds descriptive statistics, is introductory statistics,
# glmm mixed models.
# Factor analysis and SEM: pca principal component analysis, fa factor
# analysis, sem structural equation models.
# Machine learning: ml.
# Non-parametric tests: npt.
# Matplotlib: mpl.
_EXPECTED = {
    "pb01-1": 60,
    "pb01-2": 32,
    "pb02-1": 0.4,
    "pb02-2": "float",
    "pb03-1": 4,
    "pb03-2": 12,
    "pb04-1": 10,
    "pb04-2": 2,
    "pb05-1": 9,
    "pb05-2": 4,
    "pb06-1": 9,
    "pb06-2": 3.142,
    "pp01-1": 4,
    "pp01-2": 8,
    "pp02-1": 36,
    "pp02-2": 6,
    "pp03-1": 1,
    "pp03-2": 3,
    "bm01-1": 0.75,
    "bm01-2": 8,
    "bm02-1": 20,
    "bm02-2": 9,
    "bm03-1": 10,
    "bm03-2": 25,
    "bm04-1": 3,
    "bm04-2": 10,
    "bm05-1": 15,
    "bm05-2": 5,
    "bm06-1": 1 / 3,
    "bm06-2": 0.8,
    "bm07-1": 2,
    "bm07-2": 2,
    "bm08-1": 1,
    "bm08-2": 0,
    "bm09-1": [1.0, 1.0],
    "bm09-2": 11,
    "bm10-1": [2, 3],
    "bm10-2": 6,
    "bm11-1": [[3, 2], [7, 4]],
    "bm11-2": [[1, 4], [2, 5], [3, 6]],
    "bm12-1": [1.0, 4.0],
    "bm12-2": [4.0, 0.0],
    "bm13-1": 2.001,
    "bm13-2": 2,
    "bm14-1": 6,
    "bm14-2": 5,
    "bm15-1": 6,
    "bm15-2": 2,
    "bm16-1": 3,
    "bm16-2": 1,
    "bm17-1": 0.75,
    "bm17-2": 2.214,
    "bm18-1": 0.375,
    "bm18-2": 0.8,
    "cm01-1": 8,
    "cm01-2": 1,
    "cm02-1": 9,
    "cm02-2": 5,
    "cm03-1": 1.2,
    "cm03-2": 2.2,
    "cm04-1": 7.5,
    "cm04-2": "A",
    "cm05-1": 2,
    "cm05-2": 1,
    "cm06-1": 0.75,
    "cm06-2": 3,
    "cm07-1": 4,
    "cm07-2": "slope",
    "cm08-1": 0.8,
    "cm08-2": 0.2,
    "cm09-1": 1.2,
    "cm09-2": 3,
    "mf01-1": 1.786,
    "mf01-2": 0.357,
    "mf02-1": 4,
    "mf02-2": 1.082,
    "mf03-1": 4,
    "mf03-2": 6,
    "mf04-1": 12,
    "mf04-2": 0.4,
    "mc01-1": 8,
    "mc01-2": 0,
    "mc02-1": 6,
    "mc02-2": 4.159,
    "mc03-1": 4.5,
    "mc03-2": 1,
    "mc04-1": 8,
    "mc04-2": 9,
    "crt01-1": 0.115,
    "crt01-2": 0.788,
    "crt02-1": 2,
    "crt02-2": 1.2,
    "crt03-1": 6,
    "crt03-2": 3,
    "lu01-1": 0.4375,
    "lu01-2": 0.75,
    "lu02-1": 0.8,
    "lu02-2": 0.941,
    "lu03-1": 0.784,
    "lu03-2": 3,
    "np01-1": 0.5,
    "np01-2": 0.731,
    "np02-1": 8,
    "np02-2": 2.5,
    "np03-1": 2,
    "np03-2": 1,
    "byo01-1": 0.6,
    "byo01-2": 1,
    "byo02-1": 2.983,
    "byo02-2": 0.017,
    "byo03-1": 1.4,
    "byo03-2": 1,
    "ds01-1": 9,
    "ds01-2": 0.75,
    "ds02-1": 6,
    "ds02-2": 14,
    "ds03-1": 4,
    "ds03-2": 2,
    "ds04-1": 3,
    "ds04-2": 10,
    "is01-1": 2 / 3,
    "is01-2": 1 / 3,
    "is02-1": 9,
    "is02-2": 15,
    "is03-1": 3,
    "is03-2": 13,
    "is04-1": 2,
    "is04-2": 36,
    "is05-1": 8,
    "is05-2": 7,
    "is06-1": 2 / 3,
    "is06-2": 4,
    "glmm01-1": 4,
    "glmm01-2": 5,
    "glmm02-1": 2,
    "glmm02-2": -1,
    "glmm03-1": 9,
    "glmm03-2": 0.5,
    "glmm04-1": 12,
    "glmm04-2": 3,
    "glmm05-1": 2,
    "glmm05-2": 4,
    "pca01-1": 20,
    "pca01-2": 3,
    "pca02-1": 20,
    "pca02-2": 40,
    "pca03-1": 0.9,
    "pca03-2": 8,
    "pca04-1": 8,
    "pca04-2": 4,
    "fa05-1": 8,
    "fa05-2": 4,
    "fa06-1": 0.48,
    "fa06-2": 0.3,
    "fa07-1": 0,
    "fa07-2": 0.48,
    "fa08-1": 0.16,
    "fa08-2": 0,
    "sem09-1": 6,
    "sem09-2": 7,
    "sem10-1": 2,
    "sem10-2": 5,
    "sem11-1": 2,
    "sem11-2": 0.5,
    "sem12-1": 1,
    "sem12-2": 17,
    "ml01-1": 9,
    "ml01-2": 2,
    "ml02-1": 3,
    "ml02-2": 2,
    "ml03-1": 7,
    "ml03-2": 2,
    "ml04-1": 0,
    "ml04-2": 1,
    "ml05-1": 5,
    "ml05-2": 1,
    "ml06-1": "pass",
    "ml06-2": "revise",
    "ml07-1": "revise",
    "ml07-2": "pass",
    "ml08-1": 2,
    "ml08-2": 5,
    "ml09-1": 2,
    "ml09-2": 3,
    "ml10-1": 2,
    "ml10-2": 1,
    "ml11-1": 4,
    "ml11-2": 2,
    "ml12-1": 6,
    "ml12-2": 4,
    "npt01-1": 6,
    "npt01-2": 3,
    "npt02-1": 1,
    "npt02-2": 2.5,
    "npt03-1": 4,
    "npt03-2": 6,
    "npt04-1": 13,
    "npt04-2": 2,
    "npt05-1": 13,
    "npt05-2": 3,
    "npt06-1": 24,
    "npt06-2": 3,
    "npt07-1": 3,
    "npt07-2": 4,
    "npt08-1": 3,
    "npt08-2": 0,
    "npt09-1": 0.8,
    "npt09-2": 4,
    "npt10-1": 20,
    "npt10-2": 5.5,
    "npt11-1": 4,
    "npt11-2": 20,
    "npt12-1": 6,
    "npt12-2": 4,
    "mpl01-1": 1,
    "mpl01-2": 8,
    "mpl02-1": 2,
    "mpl02-2": 5,
    "mpl03-1": 8,
    "mpl03-2": 4,
    "mpl04-1": 5,
    "mpl04-2": 12,
    "mpl05-1": 4,
    "mpl05-2": 12 ** (-1 / 5),
    "mpl06-1": 6,
    "mpl06-2": 18,
    "mpl07-1": 6,
    "mpl07-2": 6,
    "mpl08-1": 4,
    "mpl08-2": 5,
    "mpl09-1": 18,
    "mpl09-2": 600,
}


def _plain(value):
    if isinstance(value, (str, bool, int, float)):
        return value
    tolist = getattr(value, "tolist", None)
    if callable(tolist):
        try:
            return tolist()
        except Exception:
            return value
    return value


def _matches(got, expected):
    got = _plain(got)
    expected = _plain(expected)
    if isinstance(got, bool) or isinstance(expected, bool):
        return type(got) is bool and type(expected) is bool and got == expected
    if isinstance(got, (int, float)) and isinstance(expected, (int, float)):
        return math.isclose(float(got), float(expected), rel_tol=1e-6, abs_tol=1e-6)
    if isinstance(got, str) and isinstance(expected, str):
        return got.strip() == expected.strip()
    if isinstance(got, (list, tuple)) and isinstance(expected, (list, tuple)):
        if len(got) != len(expected):
            return False
        return all(_matches(item, target) for item, target in zip(got, expected))
    return got == expected


def _text(value):
    value = _plain(value)
    if isinstance(value, float):
        return format(value, ".6g")
    if isinstance(value, (list, tuple)):
        return "[" + ", ".join(_text(item) for item in value) + "]"
    return repr(value)


def check(check_id, got, hint="", show=False):
    """Print whether got matches the stored result for check_id.

    On a match, print a confirmation. On the first miss, print hint when
    one was given. Pass show=True, or call the same check again after a
    miss, to print the expected result.
    """
    if check_id not in _EXPECTED:
        raise KeyError("Unknown check id: " + repr(check_id))
    expected = _EXPECTED[check_id]
    if _matches(got, expected):
        print("That matches.")
        return
    check._tries[check_id] = check._tries.get(check_id, 0) + 1
    print("Not yet.")
    if show or check._tries[check_id] > 1:
        print("Expected result:", _text(expected))
    elif hint:
        print("Hint:", hint)
    else:
        print("Call check again to see the expected result.")


check._tries = {}

"""Mark the short task at the end of a lesson.

A notebook calls ``check(check_id, answer, hint=...)``. The expected result
for that id lives in ``_EXPECTED`` below, not in the notebook. A match prints
``That matches.`` The first miss prints ``Not yet.`` and the hint, when one
was given. Call the same check again, or pass show=True, to print the
expected result.
"""

import math


# Expected results for Check yourself. Keys are stable ids: pb for Python
# basics, pp for Plotting and packages, bm for Basic mathematics, then the
# lesson number and the check.
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
    "pp01-1": 6,
    "pp01-2": 7,
    "pp02-1": 15,
    "pp02-2": 5,
    "pp03-1": 2,
    "pp03-2": 9,
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

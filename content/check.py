"""Mark the short task at the end of a lesson.

A match prints ``That matches.`` The first miss prints the hint, when one
was given. Call check again, or pass show=True, to print the expected result.
"""

import math


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


def check(got, expected, hint="", show=False):
    """Print whether got matches expected.

    On a match, print a confirmation. On the first miss, print hint when
    one was given. Pass show=True, or call check again after a miss, to
    print the expected result.
    """
    if _matches(got, expected):
        print("That matches.")
        return
    key = _text(expected) + "\0" + hint
    check._tries[key] = check._tries.get(key, 0) + 1
    print("Not yet.")
    if show or check._tries[key] > 1:
        print("Expected result:", _text(expected))
    elif hint:
        print("Hint:", hint)
    else:
        print("Call check again to see the expected result.")


check._tries = {}

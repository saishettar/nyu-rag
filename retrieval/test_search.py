"""Unit tests for the pure logic in search.py -- no DB, no embeddings.

The two retrieval regressions in README's "Retrieval history" both lived in
this pure logic (name-matching and list-combination), not in the SQL. These
tests exist to catch the next version of that bug at the unit-test level
instead of only at eval-run level.
"""
from search import _combine, _match_referenced_codes


def _course(code: str, **extra) -> dict:
    return {"course_code": code, **extra}


class TestMatchReferencedCodes:
    def test_matches_by_literal_course_code(self):
        all_courses = [("MATH-UA 121", "Calculus I"), ("MATH-UA 122", "Calculus II")]
        assert _match_referenced_codes(
            "what's a good course after MATH-UA 121?", all_courses
        ) == {"MATH-UA 121"}

    def test_matches_by_exact_title(self):
        all_courses = [("MATH-UA 121", "Calculus I")]
        assert _match_referenced_codes(
            "what's a good course after calculus i?", all_courses
        ) == {"MATH-UA 121"}

    def test_no_match_when_course_not_named(self):
        all_courses = [("MATH-UA 121", "Calculus I")]
        assert _match_referenced_codes("tell me about linear algebra", all_courses) == set()

    def test_short_titles_are_not_matched_to_avoid_false_positives(self):
        # "Intro" is 5 chars, under _MIN_TITLE_MATCH_LEN -- a title this
        # short and generic would otherwise match almost any query.
        all_courses = [("CSCI-UA 2", "Intro")]
        assert _match_referenced_codes("intro to anything you like", all_courses) == set()

    def test_unknown_course_code_pattern_in_query_is_ignored(self):
        all_courses = [("MATH-UA 121", "Calculus I")]
        assert _match_referenced_codes("what about FAKE-UA 999?", all_courses) == set()

    def test_multiple_named_courses_all_matched(self):
        all_courses = [("MATH-UA 121", "Calculus I"), ("CSCI-UA 102", "Data Structures")]
        result = _match_referenced_codes(
            "compare MATH-UA 121 and CSCI-UA 102", all_courses
        )
        assert result == {"MATH-UA 121", "CSCI-UA 102"}


class TestCombine:
    def test_self_matches_are_always_first(self):
        result = _combine(
            self_matches=[_course("X")],
            structural=[_course("A")],
            semantic=[_course("B")],
            top_k=5,
        )
        assert [c["course_code"] for c in result] == ["X", "A", "B"]

    def test_self_matches_consume_budget_before_structural(self):
        # This is exactly the shape of the ECON-UA regression: a self-match
        # took a slot that the SQL-side LIMIT on structural didn't account
        # for, silently dropping the last (and correct) structural result.
        result = _combine(
            self_matches=[_course("X")],
            structural=[_course("A"), _course("B")],
            semantic=[],
            top_k=2,
        )
        assert [c["course_code"] for c in result] == ["X", "A"]

    def test_does_not_reorder_inputs(self):
        # _combine only dedupes and truncates -- it does not re-rank. Callers
        # (the SQL queries) are responsible for passing each list in
        # best-first order already.
        result = _combine(
            self_matches=[],
            structural=[_course("C"), _course("A"), _course("B")],
            semantic=[],
            top_k=3,
        )
        assert [c["course_code"] for c in result] == ["C", "A", "B"]

    def test_dedupes_across_lists_keeping_first_occurrence(self):
        result = _combine(
            self_matches=[],
            structural=[_course("A", source="structural")],
            semantic=[_course("A", source="semantic"), _course("B", source="semantic")],
            top_k=5,
        )
        codes = [c["course_code"] for c in result]
        assert codes == ["A", "B"]
        assert result[0]["source"] == "structural"

    def test_truncates_to_top_k(self):
        result = _combine(
            self_matches=[],
            structural=[],
            semantic=[_course(str(i)) for i in range(10)],
            top_k=3,
        )
        assert len(result) == 3

    def test_empty_inputs_return_empty(self):
        assert _combine([], [], [], top_k=5) == []

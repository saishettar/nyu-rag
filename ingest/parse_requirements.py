"""Parse an NYU Bulletin program-requirements page into a flattened requirement
summary.

Requirement pages live at a different URL pattern than course listing pages
(bulletins.nyu.edu/undergraduate/<school>/programs/<slug>/, not
/courses/<dept>/) and use a different CourseLeaf structure: grouped
<table class="sc_courselist"> rows with area headers, "select one of the
following" alternatives, and separately, inline "or" alternative rows
(class "orclass"). A single program page can hold multiple such tables:
a standalone major-only worksheet (Computer Science), a single table that
mixes General Education with Major Requirements (Math, Data Science,
Physics, Economics), and/or decorative sidebar lists with no totals row at
all (an honors-track elective list, skipped since it has no listsum row).
"""
import re
from typing import Optional

from bs4 import BeautifulSoup, Tag

_CODE_RE = re.compile(r"[A-Z]{2,6}-[A-Z]{2,4}\s?\d{1,4}[A-Z]?")
_CREDITS_RE = re.compile(r"[\d.]+")


def _as_credits(text: Optional[str]) -> Optional[float]:
    if not text:
        return None
    match = _CREDITS_RE.search(text)
    return float(match.group(0)) if match else None


def _cell_text(tag: Tag) -> str:
    return tag.get_text(" ", strip=True).replace("\xa0", " ")


def _row_heading(row: Tag) -> str:
    cells = row.find_all("td")
    return _cell_text(cells[0]) if cells else ""


def _row_credits(row: Tag) -> Optional[str]:
    hours = row.find("td", class_=lambda c: c and "hourscol" in c.split())
    text = _cell_text(hours) if hours else ""
    return text or None


def _row_course(row: Tag) -> Optional[tuple[str, str]]:
    """(code, title) if this row (or "or" row) names a single course."""
    code_cell = row.find("td", class_=lambda c: c and "codecol" in c.split())
    if code_cell is None:
        return None
    link = code_cell.find("a")
    raw_code = _cell_text(link) if link else _cell_text(code_cell)
    match = _CODE_RE.search(raw_code)
    if not match:
        return None
    cells = row.find_all("td")
    title = _cell_text(cells[1]) if len(cells) > 1 else ""
    return match.group(0), title


def find_requirement_table(soup: BeautifulSoup) -> Optional[Tag]:
    """The first sc_courselist table with a totals row -- decorative sidebar
    lists (e.g. a department's honors-track electives) have no listsum row
    and are not real requirement worksheets."""
    for table in soup.find_all("table", class_=lambda c: c and "sc_courselist" in c):
        if table.find("tr", class_="listsum"):
            return table
    return None


def parse_requirement_table(table: Tag) -> dict:
    """Walk the table's rows into (heading, items) sections, keeping only the
    major-specific content: the whole table if it has no "General Education
    Requirements" header (a standalone major worksheet, e.g. Computer
    Science), otherwise just the "Major Requirements" top-level section
    (itself plus any nested area-subheader rows), stopping at the next
    top-level area header -- General Education and generic Electives are
    dropped either way. This is a lightly-cleaned transcription, not a
    strict structured/validated degree-audit model -- the same fidelity
    embed/embed_and_store.py already uses for course descriptions."""
    rows = table.find_all("tr")
    top_headers = [
        _row_heading(r)
        for r in rows
        if "areaheader" in (r.get("class") or []) and "areasubheader" not in (r.get("class") or [])
    ]
    whole_table = not top_headers or "general education" not in top_headers[0].lower()

    sections: list[dict] = []
    current: Optional[dict] = None
    pending_choice: Optional[dict] = None
    capturing = whole_table
    total_credits: Optional[float] = None

    if whole_table:
        # A standalone worksheet doesn't need an area header to be valid
        # content (e.g. Economics' base track has no headers at all) --
        # seed a default bucket so rows before/without one still land
        # somewhere; a later header still starts its own new section.
        current = {"heading": "", "items": []}
        sections.append(current)

    for row in rows:
        classes = row.get("class") or []

        if "listsum" in classes:
            total_credits = _as_credits(_row_credits(row))
            break

        if "areaheader" in classes or "areasubheader" in classes:
            heading = _row_heading(row)
            is_top = "areasubheader" not in classes
            if not whole_table and is_top:
                capturing = "major requirements" in heading.lower()
                if not capturing:
                    current = None
                    pending_choice = None
                    continue
            if capturing:
                current = {"heading": heading, "items": []}
                sections.append(current)
                pending_choice = None
            continue

        if not capturing or current is None:
            continue

        if "orclass" in classes:
            course = _row_course(row)
            if course and pending_choice is not None:
                pending_choice.setdefault("options", []).append(course)
            continue

        course = _row_course(row)
        credits = _row_credits(row)
        if course:
            code, title = course
            if credits:
                item = {"type": "course", "code": code, "title": title, "credits": credits}
                current["items"].append(item)
                pending_choice = item
            elif pending_choice is not None:
                pending_choice.setdefault("options", []).append(course)
            else:
                current["items"].append(
                    {"type": "course", "code": code, "title": title, "credits": None}
                )
        else:
            heading_text = _row_heading(row)
            if heading_text and credits:
                item = {
                    "type": "select",
                    "instruction": heading_text,
                    "credits": credits,
                    "options": [],
                }
                current["items"].append(item)
                pending_choice = item

    # The table's own listsum total only means "credits for what we kept"
    # when the whole table was kept (a standalone worksheet). When only the
    # "Major Requirements" section was extracted from a combined table, the
    # listsum instead reflects the full degree (major + General Education),
    # so recompute a subtotal from just the captured items -- each item's
    # own credit weight, not its alternatives' (those share the same slot).
    if not whole_table:
        total_credits = sum(
            _as_credits(item["credits"]) or 0
            for section in sections
            for item in section["items"]
        ) or None

    return {"sections": sections, "total_credits": total_credits}


def render_requirement_text(parsed: dict, program_name: str) -> tuple[str, list[str]]:
    lines = [program_name]
    codes: list[str] = []

    for section in parsed["sections"]:
        if not section["items"]:
            continue
        if section["heading"]:
            lines.append(section["heading"])
        for item in section["items"]:
            credits_str = f" ({item['credits']} cr)" if item.get("credits") else ""
            if item["type"] == "course":
                codes.append(item["code"])
                line = f"- {item['code']} {item['title']}{credits_str}"
                for opt_code, opt_title in item.get("options", []):
                    codes.append(opt_code)
                    line += f" or {opt_code} {opt_title}"
                lines.append(line)
            else:
                options = item.get("options", [])
                if options:
                    codes.extend(code for code, _ in options)
                    opt_text = "; ".join(f"{code} {title}" for code, title in options)
                    lines.append(f"- {item['instruction']}{credits_str}: {opt_text}")
                else:
                    lines.append(f"- {item['instruction']}{credits_str}")

    return "\n".join(lines), codes


def parse_program(
    html: str, program_name: str, department: str, source_url: str
) -> Optional[dict]:
    soup = BeautifulSoup(html, "html.parser")
    table = find_requirement_table(soup)
    if table is None:
        return None

    parsed = parse_requirement_table(table)
    text, codes = render_requirement_text(parsed, program_name)
    if not codes:
        return None

    return {
        "program_name": program_name,
        "department": department,
        "total_credits": parsed["total_credits"],
        "source_url": source_url,
        "course_codes": sorted(set(codes)),
        "text": text,
    }

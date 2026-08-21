"""Parse individual course entries out of a CourseLeaf-style bulletin page.

bulletins.nyu.edu renders each course as a <div class="courseblock"> holding
only the code/title/credits, followed by a run of sibling
<div class="noindent"> elements (typically_offered, courseblockextra
description, grading, repeatability, prerequisites, antirequisites) that
belong to that course and end at the next <div class="courseblock">.
"""
import re
from typing import Optional

from bs4 import BeautifulSoup, Tag

CREDITS_RE = re.compile(r"([\d.]+)")


def _field_text(scope: list[Tag], detail_class: str) -> Optional[str]:
    for tag in scope:
        span = tag.find("span", class_=lambda c: c and detail_class in c.split())
        if span is not None:
            label = span.find("span", class_="label")
            if label is not None:
                label.extract()
            return span.get_text(" ", strip=True).replace("\xa0", " ")
    return None


def _parse_credits(hours_text: Optional[str]) -> Optional[float]:
    if not hours_text:
        return None
    match = CREDITS_RE.search(hours_text)
    return float(match.group(1)) if match else None


def _course_segment(block: Tag) -> list[Tag]:
    """The courseblock div plus its trailing detail divs, up to the next courseblock."""
    segment = [block]
    for sibling in block.find_next_siblings():
        if "courseblock" in (sibling.get("class") or []):
            break
        segment.append(sibling)
    return segment


def parse_course_block(block: Tag, department: str, source_url: str) -> dict:
    segment = _course_segment(block)

    code = _field_text([block], "detail-code")
    title = _field_text([block], "detail-title")
    hours_text = _field_text([block], "detail-hours_html")

    description = ""
    for tag in segment:
        desc_div = tag.find("div", class_="courseblockextra")
        if desc_div is not None:
            description = desc_div.get_text(" ", strip=True).replace("\xa0", " ")
            break

    prerequisites = _field_text(segment, "detail-prerequisites") or ""
    prerequisites = re.sub(r"^Prerequisites:\s*", "", prerequisites).strip()

    return {
        "course_code": (code or "").replace("\xa0", " ").strip(),
        "title": (title or "").strip(),
        "department": department,
        "credits": _parse_credits(hours_text),
        "prerequisites": prerequisites,
        "description": description,
        "source_url": source_url,
    }


def parse_courses(html: str, department: str, source_url: str) -> list[dict]:
    soup = BeautifulSoup(html, "html.parser")
    blocks = soup.find_all("div", class_="courseblock")
    courses = [parse_course_block(b, department, source_url) for b in blocks]
    return [c for c in courses if c["course_code"] and c["description"]]

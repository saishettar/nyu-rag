"""Fetch NYU Bulletin department pages and parse them into course records.

Polite by default: caches each fetched page to disk so re-runs don't re-hit
the site, and sleeps between live requests.
"""
import json
import time
from pathlib import Path

import requests

from parse_course import parse_courses

CACHE_DIR = Path(__file__).parent / "cache"
DATA_DIR = Path(__file__).parent / "data"
REQUEST_DELAY_SECONDS = 2
USER_AGENT = "nyu-course-rag research project (contact: sai.r.shettar@gmail.com)"

# department slug -> bulletin URL. CAS has 51 "_ua" department pages total;
# these are the ones CS students actually cross-reference (Math and Physics
# back CS prerequisites, Data Science shares faculty and cross-lists courses).
DEPARTMENTS = {
    "csci_ua": "https://bulletins.nyu.edu/courses/csci_ua/",
    "math_ua": "https://bulletins.nyu.edu/courses/math_ua/",
    "ds_ua": "https://bulletins.nyu.edu/courses/ds_ua/",
    "phys_ua": "https://bulletins.nyu.edu/courses/phys_ua/",
}


def fetch_page(department: str, url: str) -> str:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cache_path = CACHE_DIR / f"{department}.html"
    if cache_path.exists():
        return cache_path.read_text(encoding="utf-8")

    response = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=30)
    response.raise_for_status()
    response.encoding = "utf-8"
    cache_path.write_text(response.text, encoding="utf-8")
    time.sleep(REQUEST_DELAY_SECONDS)
    return response.text


def scrape_department(department: str, url: str) -> list[dict]:
    html = fetch_page(department, url)
    return parse_courses(html, department, url)


def main() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    for department, url in DEPARTMENTS.items():
        courses = scrape_department(department, url)
        out_path = DATA_DIR / f"{department}.json"
        out_path.write_text(json.dumps(courses, indent=2), encoding="utf-8")
        print(f"{department}: {len(courses)} courses -> {out_path}")


if __name__ == "__main__":
    main()

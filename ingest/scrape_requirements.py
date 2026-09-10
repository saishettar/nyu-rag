"""Fetch NYU Bulletin program-requirements pages and parse them into
flattened requirement summaries.

Requirement pages live at a different URL pattern than course listing pages
(bulletins.nyu.edu/undergraduate/<school>/programs/<slug>/, not
/courses/<dept>/) and use a different CourseLeaf table structure -- see
parse_requirements.py. Polite by default, same as scrape_catalog.py: caches
each fetched page to disk so re-runs don't re-hit the site, and sleeps
between live requests.
"""
import json
import time
from pathlib import Path

import requests

from parse_requirements import parse_program

CACHE_DIR = Path(__file__).parent / "cache" / "programs"
DATA_DIR = Path(__file__).parent / "data_programs"
REQUEST_DELAY_SECONDS = 2
USER_AGENT = "nyu-course-rag research project (contact: sai.r.shettar@gmail.com)"

# program slug -> (display name, department, bulletin URL). Pilot batch: the
# same five CS-adjacent departments the very first course-scope batch
# covered, chosen to validate the parser against both a standalone
# major-only worksheet (Computer Science) and combined General Education +
# Major Requirements tables (Math, Data Science, Physics, Economics) before
# expanding requirement coverage to more programs.
PROGRAMS = {
    "csci_ua": (
        "Computer Science (B.A.)",
        "csci_ua",
        "https://bulletins.nyu.edu/undergraduate/arts-science/programs/computer-science-ba/",
    ),
    "math_ua": (
        "Mathematics (B.A.)",
        "math_ua",
        "https://bulletins.nyu.edu/undergraduate/arts-science/programs/mathematics-ba/",
    ),
    "ds_ua": (
        "Data Science (B.A.)",
        "ds_ua",
        "https://bulletins.nyu.edu/undergraduate/arts-science/programs/data-science-ba/",
    ),
    "phys_ua": (
        "Physics (B.A.)",
        "phys_ua",
        "https://bulletins.nyu.edu/undergraduate/arts-science/programs/physics-ba/",
    ),
    "econ_ua": (
        "Economics (B.A.)",
        "econ_ua",
        "https://bulletins.nyu.edu/undergraduate/arts-science/programs/economics-ba/",
    ),
}


def fetch_page(slug: str, url: str) -> str:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cache_path = CACHE_DIR / f"{slug}.html"
    if cache_path.exists():
        return cache_path.read_text(encoding="utf-8")

    response = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=30)
    response.raise_for_status()
    response.encoding = "utf-8"
    cache_path.write_text(response.text, encoding="utf-8")
    time.sleep(REQUEST_DELAY_SECONDS)
    return response.text


def main() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    for slug, (program_name, department, url) in PROGRAMS.items():
        html = fetch_page(slug, url)
        program = parse_program(html, program_name, department, url)
        if program is None:
            print(f"{slug}: could not find a requirement table -- skipped")
            continue
        out_path = DATA_DIR / f"{slug}.json"
        out_path.write_text(json.dumps(program, indent=2), encoding="utf-8")
        print(
            f"{slug}: {len(program['course_codes'])} referenced courses, "
            f"{program['total_credits']} credits -> {out_path}"
        )


if __name__ == "__main__":
    main()

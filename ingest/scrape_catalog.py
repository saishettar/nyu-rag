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
# scope is being rolled out batch by batch toward full CAS coverage. Batches
# 1-2 prioritized departments CS students actually cross-reference
# (Math/Physics/Data-Science/Economics/Philosophy/Psychology/Politics/
# Neural-Science/Chemistry/Biology/Linguistics/Public Policy/Urban Studies/
# Environmental Studies); batches 3-4 (History, English, Anthropology, Art
# History, Journalism, International Relations, Classics, Creative Writing,
# Music, Religious Studies, Comparative Literature, East Asian Studies, Law
# and Society, Middle Eastern and Islamic Studies, Dramatic Literature,
# European and Mediterranean Studies) round out general coverage with no
# specific CS-overlap story. This batch is the remaining real academic
# departments -- mostly foreign languages and area studies (French, German,
# Italian, Portuguese, Russian and Slavic Studies, Hebrew and Judaic
# Studies, Hellenic Studies, Irish Studies, Latin American-Caribbean
# Studies, Medieval and Renaissance Studies, Animal Studies, Child/
# Adolescent Mental Health Studies, Expository Writing). The remaining ~7
# slugs not in this map are administrative/curriculum categories (College
# Core Curriculum, First-Year Seminars, Non-Departmental, etc.), deferred
# for individual review rather than scraped by default.
DEPARTMENTS = {
    "csci_ua": "https://bulletins.nyu.edu/courses/csci_ua/",
    "math_ua": "https://bulletins.nyu.edu/courses/math_ua/",
    "ds_ua": "https://bulletins.nyu.edu/courses/ds_ua/",
    "phys_ua": "https://bulletins.nyu.edu/courses/phys_ua/",
    "econ_ua": "https://bulletins.nyu.edu/courses/econ_ua/",
    "phil_ua": "https://bulletins.nyu.edu/courses/phil_ua/",
    "psych_ua": "https://bulletins.nyu.edu/courses/psych_ua/",
    "pol_ua": "https://bulletins.nyu.edu/courses/pol_ua/",
    "neurl_ua": "https://bulletins.nyu.edu/courses/neurl_ua/",
    "chem_ua": "https://bulletins.nyu.edu/courses/chem_ua/",
    "biol_ua": "https://bulletins.nyu.edu/courses/biol_ua/",
    "ling_ua": "https://bulletins.nyu.edu/courses/ling_ua/",
    "pubpl_ua": "https://bulletins.nyu.edu/courses/pubpl_ua/",
    "urbs_ua": "https://bulletins.nyu.edu/courses/urbs_ua/",
    "envst_ua": "https://bulletins.nyu.edu/courses/envst_ua/",
    "hist_ua": "https://bulletins.nyu.edu/courses/hist_ua/",
    "engl_ua": "https://bulletins.nyu.edu/courses/engl_ua/",
    "anth_ua": "https://bulletins.nyu.edu/courses/anth_ua/",
    "arth_ua": "https://bulletins.nyu.edu/courses/arth_ua/",
    "jour_ua": "https://bulletins.nyu.edu/courses/jour_ua/",
    "intrl_ua": "https://bulletins.nyu.edu/courses/intrl_ua/",
    "class_ua": "https://bulletins.nyu.edu/courses/class_ua/",
    "crwri_ua": "https://bulletins.nyu.edu/courses/crwri_ua/",
    "music_ua": "https://bulletins.nyu.edu/courses/music_ua/",
    "relst_ua": "https://bulletins.nyu.edu/courses/relst_ua/",
    "colit_ua": "https://bulletins.nyu.edu/courses/colit_ua/",
    "east_ua": "https://bulletins.nyu.edu/courses/east_ua/",
    "lwsoc_ua": "https://bulletins.nyu.edu/courses/lwsoc_ua/",
    "meis_ua": "https://bulletins.nyu.edu/courses/meis_ua/",
    "drlit_ua": "https://bulletins.nyu.edu/courses/drlit_ua/",
    "euro_ua": "https://bulletins.nyu.edu/courses/euro_ua/",
    "fren_ua": "https://bulletins.nyu.edu/courses/fren_ua/",
    "germ_ua": "https://bulletins.nyu.edu/courses/germ_ua/",
    "ital_ua": "https://bulletins.nyu.edu/courses/ital_ua/",
    "port_ua": "https://bulletins.nyu.edu/courses/port_ua/",
    "russn_ua": "https://bulletins.nyu.edu/courses/russn_ua/",
    "hbrjd_ua": "https://bulletins.nyu.edu/courses/hbrjd_ua/",
    "hel_ua": "https://bulletins.nyu.edu/courses/hel_ua/",
    "irish_ua": "https://bulletins.nyu.edu/courses/irish_ua/",
    "latc_ua": "https://bulletins.nyu.edu/courses/latc_ua/",
    "medi_ua": "https://bulletins.nyu.edu/courses/medi_ua/",
    "anst_ua": "https://bulletins.nyu.edu/courses/anst_ua/",
    "cams_ua": "https://bulletins.nyu.edu/courses/cams_ua/",
    "expos_ua": "https://bulletins.nyu.edu/courses/expos_ua/",
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

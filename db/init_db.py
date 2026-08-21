"""Apply schema.sql to the database at DATABASE_URL."""
import os
from pathlib import Path

import psycopg2
from dotenv import load_dotenv

load_dotenv()


def main() -> None:
    database_url = os.environ["DATABASE_URL"]
    schema_sql = (Path(__file__).parent / "schema.sql").read_text(encoding="utf-8")

    conn = psycopg2.connect(database_url)
    try:
        with conn.cursor() as cur:
            cur.execute(schema_sql)
        conn.commit()
        print("Schema applied.")
    finally:
        conn.close()


if __name__ == "__main__":
    main()

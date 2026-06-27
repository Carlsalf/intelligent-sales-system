import sqlite3
from pathlib import Path

BASE = Path(__file__).resolve().parents[1]
DB = BASE / "src" / "db" / "database.sqlite"

conn = sqlite3.connect(DB)
cur = conn.cursor()

seed_sales = [
    ("2026-01-10 10:15:00", 18.50, 1, 1, 1),
    ("2026-01-22 17:30:00", 21.00, 1, 1, 1),
    ("2026-02-05 11:20:00", 28.00, 1, 1, 1),
    ("2026-02-18 16:45:00", 24.50, 2, 1, 1),
    ("2026-03-08 12:10:00", 19.90, 1, 1, 1),
    ("2026-03-21 18:05:00", 23.40, 2, 1, 1),
    ("2026-04-09 09:50:00", 26.80, 1, 1, 1),
    ("2026-04-26 15:25:00", 31.20, 2, 1, 1),
    ("2026-05-07 10:40:00", 29.90, 1, 1, 1),
    ("2026-05-20 19:10:00", 35.60, 2, 1, 1),
]

for fecha, total, id_cliente, id_usuario, estado in seed_sales:
    cur.execute(
        """
        INSERT INTO venta(fecha, total, id_cliente, id_usuario, estado)
        SELECT ?, ?, ?, ?, ?
        WHERE NOT EXISTS (
            SELECT 1 FROM venta WHERE fecha = ? AND total = ?
        )
        """,
        (fecha, total, id_cliente, id_usuario, estado, fecha, total)
    )

conn.commit()
conn.close()

print("✅ Historial semilla Ene-May 2026 insertado/validado")

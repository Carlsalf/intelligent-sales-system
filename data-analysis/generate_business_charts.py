import json
import sqlite3
from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd

BASE_DIR = Path(__file__).resolve().parents[1]
DB_PATH = BASE_DIR / "src" / "db" / "database.sqlite"
OUT_DIR = BASE_DIR / "data-analysis"
OUT_DIR.mkdir(exist_ok=True)

conn = sqlite3.connect(DB_PATH)

ventas = pd.read_sql_query("""
SELECT
    v.id_venta,
    v.fecha,
    v.total,
    COALESCE(c.nombre, 'Venta de mostrador') AS cliente
FROM venta v
LEFT JOIN cliente c ON c.id_cliente = v.id_cliente
WHERE v.estado = 1
ORDER BY v.fecha
""", conn)

detalle = pd.read_sql_query("""
SELECT
    dv.id_venta,
    p.nombre AS producto,
    cat.nombre AS categoria,
    dv.cantidad,
    COALESCE(dv.subtotal, dv.cantidad * COALESCE(dv.precio_unitario, p.precio)) AS subtotal
FROM detalle_venta dv
JOIN producto p ON p.id_producto = dv.id_producto
LEFT JOIN categoria cat ON cat.id_categoria = p.id_categoria
""", conn)

conn.close()

if ventas.empty:
    raise SystemExit("No hay ventas registradas.")

ventas["fecha"] = pd.to_datetime(ventas["fecha"])
ventas["mes"] = ventas["fecha"].dt.strftime("%Y-%m")

ventas_mes = (
    ventas.groupby("mes", as_index=False)
    .agg(ventas=("id_venta", "count"), facturacion=("total", "sum"))
    .sort_values("mes")
)

top_productos = (
    detalle.groupby("producto", as_index=False)
    .agg(unidades=("cantidad", "sum"), facturacion=("subtotal", "sum"))
    .sort_values(["unidades", "facturacion"], ascending=False)
)

top_categorias = (
    detalle.groupby("categoria", as_index=False)
    .agg(unidades=("cantidad", "sum"), facturacion=("subtotal", "sum"))
    .sort_values("facturacion", ascending=False)
)

ventas_analizadas = int(len(ventas))
facturacion = float(ventas["total"].sum())
ticket_medio = facturacion / ventas_analizadas if ventas_analizadas else 0

producto_lider = str(top_productos.iloc[0]["producto"])
producto_lider_unidades = int(top_productos.iloc[0]["unidades"])
total_unidades = int(detalle["cantidad"].sum())
participacion = producto_lider_unidades / total_unidades * 100 if total_unidades else 0

mejor_mes_row = ventas_mes.sort_values("facturacion", ascending=False).iloc[0]
mejor_mes = str(mejor_mes_row["mes"])
mejor_mes_facturacion = float(mejor_mes_row["facturacion"])

mes_anterior = ventas_mes.iloc[-2] if len(ventas_mes) >= 2 else ventas_mes.iloc[-1]
mes_actual = ventas_mes.iloc[-1]

fact_ant = float(mes_anterior["facturacion"])
fact_act = float(mes_actual["facturacion"])
diferencia = fact_act - fact_ant
variacion = diferencia / fact_ant * 100 if fact_ant else 0

media = ventas_mes["facturacion"].mean()
coef_var = ventas_mes["facturacion"].std() / media * 100 if len(ventas_mes) > 1 and media else 0

if coef_var < 15:
    estabilidad = "Alta"
elif coef_var < 35:
    estabilidad = "Media"
else:
    estabilidad = "Baja"

confianza = "Alta" if len(ventas_mes) >= 6 else "Media" if len(ventas_mes) >= 4 else "Baja"
pendiente = float(ventas_mes["facturacion"].diff().mean()) if len(ventas_mes) >= 2 else 0

score_variacion = 35 if variacion > 0 else 20
score_estabilidad = 18 if estabilidad == "Alta" else 14 if estabilidad == "Media" else 8
score_producto = 12 if participacion <= 45 else 8
score_historico = 15 if confianza == "Alta" else 11 if confianza == "Media" else 6
score_pendiente = 10 if pendiente >= 0 else 4

indice = max(0, min(100, int(score_variacion + score_estabilidad + score_producto + score_historico + score_pendiente)))

if indice >= 90:
    salud = "Excelente"
elif indice >= 70:
    salud = "Buena"
elif indice >= 50:
    salud = "Aceptable"
else:
    salud = "Crítica"

summary = {
    "ventas_analizadas": ventas_analizadas,
    "facturacion_acumulada": round(facturacion, 2),
    "ticket_medio": round(ticket_medio, 2),
    "variacion_mensual": round(variacion, 1),
    "estado_comercial": indice,
    "indice_comercial": indice,
    "salud_comercial": salud,
    "tendencia": "ascendente" if pendiente > 0 else "estable" if pendiente == 0 else "descendente",

    "producto_lider": producto_lider,
    "producto_lider_unidades": producto_lider_unidades,
    "participacion_producto_lider": round(participacion, 1),

    "mejor_mes": mejor_mes,
    "mejor_mes_facturacion": round(mejor_mes_facturacion, 2),

    "estabilidad_comercial": estabilidad,
    "coeficiente_variacion": round(coef_var, 1),
    "confianza_analitica": confianza,
    "pendiente_mensual": round(pendiente, 2),

    "mes_anterior": str(mes_anterior["mes"]),
    "facturacion_mes_anterior": round(fact_ant, 2),
    "mes_actual": str(mes_actual["mes"]),
    "facturacion_mes_actual": round(fact_act, 2),
    "diferencia_mensual": round(diferencia, 2),

    "componentes_indice": {
        "variacion_mensual": {"puntos": score_variacion, "peso": "40%", "valor": round(variacion, 1)},
        "estabilidad_comercial": {"puntos": score_estabilidad, "peso": "20%", "valor": estabilidad},
        "producto_lider": {"puntos": score_producto, "peso": "15%", "valor": f"{producto_lider} ({round(participacion, 1)}%)"},
        "calidad_historico": {"puntos": score_historico, "peso": "15%", "valor": confianza},
        "pendiente_mensual": {"puntos": score_pendiente, "peso": "10%", "valor": round(pendiente, 2)}
    },

    "ventas_mes": ventas_mes.round(2).to_dict(orient="records"),
    "top_productos": top_productos.round(2).to_dict(orient="records"),
    "top_categorias": top_categorias.round(2).to_dict(orient="records"),

    "trazabilidad": [
        "SQLite",
        "Python/Pandas",
        "Cálculo de KPIs",
        "Motor de reglas",
        "JSON analítico",
        "Dashboard React"
    ],

    "limitacion": "La línea de tendencia se utiliza como referencia visual descriptiva. No representa un modelo predictivo robusto ni una estimación futura definitiva."
}

with open(OUT_DIR / "analytics-summary.json", "w", encoding="utf-8") as f:
    json.dump(summary, f, ensure_ascii=False, indent=2)

plt.figure(figsize=(9, 5))
plt.plot(ventas_mes["mes"], ventas_mes["facturacion"], marker="o")
plt.title("Evolución mensual de ventas")
plt.xlabel("Mes")
plt.ylabel("Facturación (€)")
plt.tight_layout()
plt.savefig(OUT_DIR / "ventas_mes.png", dpi=160)
plt.close()

plt.figure(figsize=(9, 5))
plt.bar(top_productos.head(8)["producto"], top_productos.head(8)["unidades"])
plt.title("Productos más vendidos")
plt.xlabel("Producto")
plt.ylabel("Unidades")
plt.xticks(rotation=35, ha="right")
plt.tight_layout()
plt.savefig(OUT_DIR / "top_productos.png", dpi=160)
plt.close()

plt.figure(figsize=(9, 5))
plt.plot(ventas_mes["mes"], ventas_mes["facturacion"], marker="o")
plt.title("Tendencia descriptiva de ventas")
plt.xlabel("Mes")
plt.ylabel("Facturación (€)")
plt.tight_layout()
plt.savefig(OUT_DIR / "prediccion_ventas.png", dpi=160)
plt.close()

print("OK: analytics-summary.json regenerado.")
print(json.dumps({
    "ventas_analizadas": summary["ventas_analizadas"],
    "producto_lider": summary["producto_lider"],
    "mejor_mes": summary["mejor_mes"],
    "facturacion_acumulada": summary["facturacion_acumulada"],
    "estado_comercial": summary["estado_comercial"]
}, ensure_ascii=False, indent=2))

# Copia automática al frontend para evitar JSON antiguo en React
FRONT_PUBLIC = BASE_DIR / "intelligent-sales-frontend" / "public"
FRONT_PUBLIC.mkdir(parents=True, exist_ok=True)

for filename in [
    "analytics-summary.json",
    "ventas_mes.png",
    "top_productos.png",
    "prediccion_ventas.png",
]:
    src = OUT_DIR / filename
    dst = FRONT_PUBLIC / filename
    if src.exists():
        dst.write_bytes(src.read_bytes())

print("OK: archivos analíticos copiados a intelligent-sales-frontend/public")

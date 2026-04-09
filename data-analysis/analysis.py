import sqlite3
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from sklearn.linear_model import LinearRegression

DB_PATH = "../src/db/database.sqlite"

conn = sqlite3.connect(DB_PATH)

# =========================
# 1. VENTAS POR MES
# =========================
query = """
SELECT fecha, total
FROM venta
WHERE estado = 1
"""
df = pd.read_sql_query(query, conn)

df['fecha'] = pd.to_datetime(df['fecha'])
df['mes'] = df['fecha'].dt.to_period('M')

ventas_mes = df.groupby('mes')['total'].sum().reset_index()
ventas_mes['mes_str'] = ventas_mes['mes'].astype(str)

print("\n=== VENTAS POR MES ===")
print(ventas_mes[['mes_str', 'total']])

plt.figure()
plt.plot(ventas_mes['mes_str'], ventas_mes['total'])
plt.title('Ventas por mes')
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig("ventas_mes.png")

# =========================
# 2. PRODUCTOS MÁS VENDIDOS
# =========================
query_productos = """
SELECT p.nombre, SUM(d.cantidad) as total_vendido
FROM detalle_venta d
JOIN producto p ON d.id_producto = p.id_producto
GROUP BY p.nombre
ORDER BY total_vendido DESC
LIMIT 5
"""
df_prod = pd.read_sql_query(query_productos, conn)

print("\n=== TOP PRODUCTOS ===")
print(df_prod)

plt.figure()
plt.bar(df_prod['nombre'], df_prod['total_vendido'])
plt.title('Top productos')
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig("top_productos.png")

# =========================
# 3. CLIENTES MÁS ACTIVOS
# =========================
query_clientes = """
SELECT c.nombre, COUNT(v.id_venta) as compras
FROM venta v
JOIN cliente c ON v.id_cliente = c.id_cliente
GROUP BY c.nombre
ORDER BY compras DESC
LIMIT 5
"""
df_cli = pd.read_sql_query(query_clientes, conn)

print("\n=== CLIENTES MÁS ACTIVOS ===")
print(df_cli)

# =========================
# 4. PREDICCIÓN SIMPLE DE VENTAS
# =========================
if len(ventas_mes) >= 2:
    ventas_mes['mes_num'] = np.arange(len(ventas_mes))

    X = ventas_mes[['mes_num']]
    y = ventas_mes['total']

    model = LinearRegression()
    model.fit(X, y)

    next_month_num = len(ventas_mes)
    prediccion = model.predict([[next_month_num]])[0]

    print("\n=== PREDICCIÓN PRÓXIMO MES ===")
    print(f"Predicción estimada: {prediccion:.2f}")

    # línea histórica + predicción
    pred_x = list(ventas_mes['mes_num']) + [next_month_num]
    pred_y = list(ventas_mes['total']) + [prediccion]
    pred_labels = list(ventas_mes['mes_str']) + ['Próximo mes']

    plt.figure()
    plt.plot(pred_labels[:-1], pred_y[:-1])
    plt.plot(pred_labels, pred_y)
    plt.title('Histórico + predicción de ventas')
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig("prediccion_ventas.png")
else:
    print("\n=== PREDICCIÓN PRÓXIMO MES ===")
    print("No hay suficientes datos mensuales para entrenar el modelo.")

conn.close()

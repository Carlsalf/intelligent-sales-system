import sqlite3
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression

DB_PATH = "../src/db/database.sqlite"

conn = sqlite3.connect(DB_PATH)

query = """
SELECT fecha, total
FROM venta
WHERE estado = 1
"""
df = pd.read_sql_query(query, conn)

df['fecha'] = pd.to_datetime(df['fecha'])
df['mes'] = df['fecha'].dt.to_period('M')

ventas_mes = df.groupby('mes')['total'].sum().reset_index()

print("\n=== DATOS PARA PREDICCIÓN ===")
print(ventas_mes)

# 🔥 CONTROL PROFESIONAL
if len(ventas_mes) < 3:
    promedio = ventas_mes['total'].mean()
    print("\n=== PREDICCIÓN (MÉTODO PROMEDIO) ===")
    print(f"Predicción estimada: {promedio:.2f}")
else:
    ventas_mes['mes_num'] = np.arange(len(ventas_mes))

    X = ventas_mes[['mes_num']]
    y = ventas_mes['total']

    model = LinearRegression()
    model.fit(X, y)

    next_month = pd.DataFrame({'mes_num': [len(ventas_mes)]})
    pred = model.predict(next_month)[0]

    # evitar negativos
    pred = max(pred, 0)

    print("\n=== PREDICCIÓN (REGRESIÓN LINEAL) ===")
    print(f"Predicción estimada: {pred:.2f}")

conn.close()

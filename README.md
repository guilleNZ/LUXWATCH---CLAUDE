# ⌚ LuxWatch — Tienda de Relojes de Lujo

Aplicación full-stack de e-commerce para relojes de lujo construida con **React + Flask**.

---

## 🏗️ Arquitectura

```
luxwatch/
├── backend/            ← Flask API (Python)
│   ├── app.py          ← Servidor, modelos, rutas REST
│   └── requirements.txt
└── frontend/           ← React SPA
    └── src/
        └── App.jsx     ← App completa con carrito y checkout
```

---

## 🔧 Backend (Flask)

### Instalación

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Servidor disponible en **http://localhost:5000**

### Endpoints REST

| Método | Ruta                    | Descripción                         |
|--------|-------------------------|-------------------------------------|
| GET    | `/api/health`           | Estado del servidor                 |
| GET    | `/api/watches`          | Lista de relojes (con filtros)      |
| GET    | `/api/watches/:id`      | Detalle de un reloj                 |
| GET    | `/api/brands`           | Lista de marcas                     |
| GET    | `/api/categories`       | Lista de categorías                 |
| POST   | `/api/orders`           | Crear nuevo pedido                  |
| GET    | `/api/orders/:id`       | Detalle de un pedido                |

### Query params para `/api/watches`
- `brand` — filtrar por marca
- `category` — filtrar por slug de categoría
- `min_price` / `max_price` — rango de precio
- `featured=true` — solo destacados
- `sort` — `name`, `price_asc`, `price_desc`, `brand`
- `search` — búsqueda por nombre o marca

### Ejemplo de pedido (POST /api/orders)
```json
{
  "customer": "Juan García",
  "email": "juan@ejemplo.com",
  "address": "Calle Mayor 1, Madrid, España",
  "items": [
    { "watch_id": 1, "qty": 1 }
  ]
}
```

---

## 🎨 Frontend (React)

### Instalación

```bash
cd frontend
npm install
npm run dev
```

App disponible en **http://localhost:5173**

### Funcionalidades

- **Hero cinematográfico** con animaciones CSS
- **Catálogo** con filtros por marca, categoría, precio y búsqueda
- **Tarjetas de producto** con relojes SVG animados y detalles
- **Modal de detalle** con especificaciones técnicas completas
- **Carrito lateral** con gestión de cantidades
- **Checkout** con formulario y confirmación de pedido
- **Datos mock** incluidos (funciona sin el backend)

### Tecnologías
- React 18 + Hooks (useState, useEffect, useContext, useCallback)
- Context API para gestión del carrito
- localStorage para persistencia del carrito
- Fuentes Google: Cormorant Garamond + Raleway
- CSS-in-JS con estilos inline

---

## 🗄️ Base de datos

SQLite por defecto (`luxwatch.db`). Para usar PostgreSQL:

```bash
export DATABASE_URL="postgresql://user:pass@localhost/luxwatch"
```

El servidor puebla automáticamente la BD con 10 relojes y 4 categorías al arrancar.

---

## 🚀 Relojes en colección

| Marca               | Modelo                    | Precio    |
|---------------------|---------------------------|-----------|
| Rolex               | Submariner Date           | $10,550   |
| Patek Philippe      | Nautilus 5711             | $112,000  |
| Audemars Piguet     | Royal Oak 15500ST         | $32,000   |
| Omega               | Speedmaster Moonwatch     | $6,900    |
| IWC                 | Portugieser Chronograph   | $8,100    |
| A. Lange & Söhne    | Lange 1                   | $27,000   |
| IWC                 | Pilot's Watch Mark XX     | $5,200    |
| Rolex               | Sea-Dweller Deepsea       | $14,600   |
| Breitling           | Chronomat B01 42          | $8,450    |
| Jaeger-LeCoultre    | Master Ultra Thin Perpetual| $22,000  |

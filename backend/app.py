from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, ForeignKey, Text
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
import os
from datetime import datetime

# Configuración de la aplicación
app = Flask(__name__)
CORS(app)

# Configuración de la base de datos
DATABASE_URL = os.environ.get('DATABASE_URL', 'sqlite:///luxwatch.db')
engine = create_engine(DATABASE_URL, echo=False, future=True)
Base = declarative_base()
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

# Modelos
class Brand(Base):
    __tablename__ = 'brands'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    watches = relationship('Watch', back_populates='brand')

class Category(Base):
    __tablename__ = 'categories'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    watches = relationship('Watch', back_populates='category')

class Watch(Base):
    __tablename__ = 'watches'
    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False)
    brand_id = Column(Integer, ForeignKey('brands.id'), nullable=False)
    category_id = Column(Integer, ForeignKey('categories.id'), nullable=False)
    price = Column(Float, nullable=False)
    description = Column(Text)
    image_url = Column(String(500))
    featured = Column(Boolean, default=False)
    movement = Column(String(100))
    case_material = Column(String(100))
    case_diameter = Column(String(50))
    water_resistance = Column(String(50))
    brand = relationship('Brand', back_populates='watches')
    category = relationship('Category', back_populates='watches')

class Order(Base):
    __tablename__ = 'orders'
    id = Column(Integer, primary_key=True)
    customer_name = Column(String(200), nullable=False)
    email = Column(String(200), nullable=False)
    address = Column(Text, nullable=False)
    total_amount = Column(Float, nullable=False)
    status = Column(String(50), default='pending')
    created_at = Column(DateTime, default=datetime.utcnow)
    items = relationship('OrderItem', back_populates='order')

class OrderItem(Base):
    __tablename__ = 'order_items'
    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey('orders.id'), nullable=False)
    watch_id = Column(Integer, ForeignKey('watches.id'), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    price_at_purchase = Column(Float, nullable=False)
    order = relationship('Order', back_populates='items')
    watch = relationship('Watch')

# Helper para obtener sesión de DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Inicializar DB con datos seed
def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Verificar si ya hay datos
        if db.query(Watch).count() > 0:
            return
        
        # Crear marcas
        brands_data = ['Rolex', 'Patek Philippe', 'Audemars Piguet', 'Omega', 
                       'IWC', 'A. Lange & Söhne', 'Breitling', 'Jaeger-LeCoultre']
        brands = {}
        for brand_name in brands_data:
            brand = Brand(name=brand_name)
            db.add(brand)
            brands[brand_name] = brand
        db.commit()
        
        # Crear categorías
        categories_data = [
            ('Diving', 'diving'),
            ('Dress', 'dress'),
            ('Sport', 'sport'),
            ('Pilot', 'pilot')
        ]
        categories = {}
        for cat_name, cat_slug in categories_data:
            category = Category(name=cat_name, slug=cat_slug)
            db.add(category)
            categories[cat_slug] = category
        db.commit()
        
        # Crear relojes
        watches_data = [
            ('Submariner Date', 'Rolex', 'diving', 10550, True, 'Automatic', 'Oystersteel', '41mm', '300m'),
            ('Nautilus 5711', 'Patek Philippe', 'sport', 112000, True, 'Automatic', 'Stainless Steel', '40mm', '120m'),
            ('Royal Oak 15500ST', 'Audemars Piguet', 'sport', 32000, True, 'Automatic', 'Stainless Steel', '41mm', '50m'),
            ('Speedmaster Moonwatch', 'Omega', 'sport', 6900, True, 'Manual', 'Stainless Steel', '42mm', '50m'),
            ('Portugieser Chronograph', 'IWC', 'dress', 8100, False, 'Automatic', 'Stainless Steel', '41mm', '30m'),
            ('Lange 1', 'A. Lange & Söhne', 'dress', 27000, True, 'Manual', 'White Gold', '38.5mm', '30m'),
            ("Pilot's Watch Mark XX", 'IWC', 'pilot', 5200, False, 'Automatic', 'Stainless Steel', '40mm', '100m'),
            ('Sea-Dweller Deepsea', 'Rolex', 'diving', 14600, False, 'Automatic', 'Oystersteel', '43mm', '3900m'),
            ('Chronomat B01 42', 'Breitling', 'sport', 8450, False, 'Automatic', 'Stainless Steel', '42mm', '200m'),
            ('Master Ultra Thin Perpetual', 'Jaeger-LeCoultre', 'dress', 22000, True, 'Automatic', 'Stainless Steel', '39mm', '50m')
        ]
        
        for name, brand_name, cat_slug, price, featured, movement, case_mat, diameter, water_res in watches_data:
            watch = Watch(
                name=name,
                brand_id=brands[brand_name].id,
                category_id=categories[cat_slug].id,
                price=price,
                description=f"El {name} de {brand_name} es un reloj excepcional.",
                image_url=f"/images/{brand_name.lower().replace(' ', '_')}_{name.lower().replace(' ', '_')}.jpg",
                featured=featured,
                movement=movement,
                case_material=case_mat,
                case_diameter=diameter,
                water_resistance=water_res
            )
            db.add(watch)
        
        db.commit()
        print("Base de datos inicializada con datos seed.")
    except Exception as e:
        db.rollback()
        print(f"Error inicializando DB: {e}")
    finally:
        db.close()

# Rutas API
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'message': 'LuxWatch API is running'})

@app.route('/api/watches', methods=['GET'])
def get_watches():
    db = SessionLocal()
    try:
        query = db.query(Watch)
        
        # Filtros
        brand = request.args.get('brand')
        category = request.args.get('category')
        min_price = request.args.get('min_price', type=float)
        max_price = request.args.get('max_price', type=float)
        featured = request.args.get('featured')
        sort = request.args.get('sort')
        search = request.args.get('search')
        
        if brand:
            brand_obj = db.query(Brand).filter(Brand.name.ilike(f'%{brand}%')).first()
            if brand_obj:
                query = query.filter(Watch.brand_id == brand_obj.id)
        
        if category:
            cat_obj = db.query(Category).filter(Category.slug == category).first()
            if cat_obj:
                query = query.filter(Watch.category_id == cat_obj.id)
        
        if min_price is not None:
            query = query.filter(Watch.price >= min_price)
        
        if max_price is not None:
            query = query.filter(Watch.price <= max_price)
        
        if featured == 'true':
            query = query.filter(Watch.featured == True)
        
        if search:
            query = query.filter(
                (Watch.name.ilike(f'%{search}%')) | 
                (Brand.name.ilike(f'%{search}%'))
            )
        
        # Ordenamiento
        if sort == 'name':
            query = query.order_by(Watch.name)
        elif sort == 'price_asc':
            query = query.order_by(Watch.price.asc())
        elif sort == 'price_desc':
            query = query.order_by(Watch.price.desc())
        elif sort == 'brand':
            query = query.join(Brand).order_by(Brand.name)
        
        watches = query.all()
        
        result = []
        for w in watches:
            result.append({
                'id': w.id,
                'name': w.name,
                'brand': w.brand.name,
                'category': w.category.name,
                'category_slug': w.category.slug,
                'price': w.price,
                'description': w.description,
                'image_url': w.image_url,
                'featured': w.featured,
                'movement': w.movement,
                'case_material': w.case_material,
                'case_diameter': w.case_diameter,
                'water_resistance': w.water_resistance
            })
        
        return jsonify(result)
    finally:
        db.close()

@app.route('/api/watches/<int:id>', methods=['GET'])
def get_watch(id):
    db = SessionLocal()
    try:
        watch = db.query(Watch).filter(Watch.id == id).first()
        if not watch:
            return jsonify({'error': 'Watch not found'}), 404
        
        return jsonify({
            'id': watch.id,
            'name': watch.name,
            'brand': watch.brand.name,
            'category': watch.category.name,
            'category_slug': watch.category.slug,
            'price': watch.price,
            'description': watch.description,
            'image_url': watch.image_url,
            'featured': watch.featured,
            'movement': watch.movement,
            'case_material': watch.case_material,
            'case_diameter': watch.case_diameter,
            'water_resistance': watch.water_resistance
        })
    finally:
        db.close()

@app.route('/api/brands', methods=['GET'])
def get_brands():
    db = SessionLocal()
    try:
        brands = db.query(Brand).all()
        return jsonify([{'id': b.id, 'name': b.name} for b in brands])
    finally:
        db.close()

@app.route('/api/categories', methods=['GET'])
def get_categories():
    db = SessionLocal()
    try:
        categories = db.query(Category).all()
        return jsonify([{'id': c.id, 'name': c.name, 'slug': c.slug} for c in categories])
    finally:
        db.close()

@app.route('/api/orders', methods=['POST'])
def create_order():
    db = SessionLocal()
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ['customer', 'email', 'address', 'items']):
            return jsonify({'error': 'Missing required fields'}), 400
        
        items = data['items']
        total = 0
        order_items = []
        
        for item in items:
            watch = db.query(Watch).filter(Watch.id == item['watch_id']).first()
            if not watch:
                return jsonify({'error': f"Watch {item['watch_id']} not found"}), 404
            
            qty = item.get('qty', 1)
            total += watch.price * qty
            order_items.append({
                'watch': watch,
                'quantity': qty,
                'price': watch.price
            })
        
        order = Order(
            customer_name=data['customer'],
            email=data['email'],
            address=data['address'],
            total_amount=total
        )
        db.add(order)
        db.commit()
        
        for oi in order_items:
            order_item = OrderItem(
                order_id=order.id,
                watch_id=oi['watch'].id,
                quantity=oi['quantity'],
                price_at_purchase=oi['price']
            )
            db.add(order_item)
        
        db.commit()
        
        return jsonify({
            'id': order.id,
            'customer': order.customer_name,
            'email': order.email,
            'total': order.total_amount,
            'status': order.status,
            'created_at': order.created_at.isoformat()
        }), 201
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@app.route('/api/orders/<int:id>', methods=['GET'])
def get_order(id):
    db = SessionLocal()
    try:
        order = db.query(Order).filter(Order.id == id).first()
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        
        items = []
        for item in order.items:
            items.append({
                'watch_id': item.watch_id,
                'watch_name': item.watch.name,
                'quantity': item.quantity,
                'price': item.price_at_purchase
            })
        
        return jsonify({
            'id': order.id,
            'customer': order.customer_name,
            'email': order.email,
            'address': order.address,
            'total': order.total_amount,
            'status': order.status,
            'created_at': order.created_at.isoformat(),
            'items': items
        })
    finally:
        db.close()

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)

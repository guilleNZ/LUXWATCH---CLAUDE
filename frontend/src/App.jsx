import { useState, useEffect, useContext, createContext, useCallback } from 'react';

// Datos mock para funcionamiento sin backend
const MOCK_WATCHES = [
  { id: 1, name: 'Submariner Date', brand: 'Rolex', category: 'Diving', category_slug: 'diving', price: 10550, description: 'El Submariner Date de Rolex es un reloj excepcional.', image_url: '', featured: true, movement: 'Automatic', case_material: 'Oystersteel', case_diameter: '41mm', water_resistance: '300m' },
  { id: 2, name: 'Nautilus 5711', brand: 'Patek Philippe', category: 'Sport', category_slug: 'sport', price: 112000, description: 'El Nautilus 5711 de Patek Philippe es un reloj excepcional.', image_url: '', featured: true, movement: 'Automatic', case_material: 'Stainless Steel', case_diameter: '40mm', water_resistance: '120m' },
  { id: 3, name: 'Royal Oak 15500ST', brand: 'Audemars Piguet', category: 'Sport', category_slug: 'sport', price: 32000, description: 'El Royal Oak 15500ST de Audemars Piguet es un reloj excepcional.', image_url: '', featured: true, movement: 'Automatic', case_material: 'Stainless Steel', case_diameter: '41mm', water_resistance: '50m' },
  { id: 4, name: 'Speedmaster Moonwatch', brand: 'Omega', category: 'Sport', category_slug: 'sport', price: 6900, description: 'El Speedmaster Moonwatch de Omega es un reloj excepcional.', image_url: '', featured: true, movement: 'Manual', case_material: 'Stainless Steel', case_diameter: '42mm', water_resistance: '50m' },
  { id: 5, name: 'Portugieser Chronograph', brand: 'IWC', category: 'Dress', category_slug: 'dress', price: 8100, description: 'El Portugieser Chronograph de IWC es un reloj excepcional.', image_url: '', featured: false, movement: 'Automatic', case_material: 'Stainless Steel', case_diameter: '41mm', water_resistance: '30m' },
  { id: 6, name: 'Lange 1', brand: 'A. Lange & Söhne', category: 'Dress', category_slug: 'dress', price: 27000, description: 'El Lange 1 de A. Lange & Söhne es un reloj excepcional.', image_url: '', featured: true, movement: 'Manual', case_material: 'White Gold', case_diameter: '38.5mm', water_resistance: '30m' },
  { id: 7, name: "Pilot's Watch Mark XX", brand: 'IWC', category: 'Pilot', category_slug: 'pilot', price: 5200, description: "El Pilot's Watch Mark XX de IWC es un reloj excepcional.", image_url: '', featured: false, movement: 'Automatic', case_material: 'Stainless Steel', case_diameter: '40mm', water_resistance: '100m' },
  { id: 8, name: 'Sea-Dweller Deepsea', brand: 'Rolex', category: 'Diving', category_slug: 'diving', price: 14600, description: 'El Sea-Dweller Deepsea de Rolex es un reloj excepcional.', image_url: '', featured: false, movement: 'Automatic', case_material: 'Oystersteel', case_diameter: '43mm', water_resistance: '3900m' },
  { id: 9, name: 'Chronomat B01 42', brand: 'Breitling', category: 'Sport', category_slug: 'sport', price: 8450, description: 'El Chronomat B01 42 de Breitling es un reloj excepcional.', image_url: '', featured: false, movement: 'Automatic', case_material: 'Stainless Steel', case_diameter: '42mm', water_resistance: '200m' },
  { id: 10, name: 'Master Ultra Thin Perpetual', brand: 'Jaeger-LeCoultre', category: 'Dress', category_slug: 'dress', price: 22000, description: 'El Master Ultra Thin Perpetual de Jaeger-LeCoultre es un reloj excepcional.', image_url: '', featured: true, movement: 'Automatic', case_material: 'Stainless Steel', case_diameter: '39mm', water_resistance: '50m' }
];

const MOCK_BRANDS = [
  { id: 1, name: 'Rolex' },
  { id: 2, name: 'Patek Philippe' },
  { id: 3, name: 'Audemars Piguet' },
  { id: 4, name: 'Omega' },
  { id: 5, name: 'IWC' },
  { id: 6, name: 'A. Lange & Söhne' },
  { id: 7, name: 'Breitling' },
  { id: 8, name: 'Jaeger-LeCoultre' }
];

const MOCK_CATEGORIES = [
  { id: 1, name: 'Diving', slug: 'diving' },
  { id: 2, name: 'Dress', slug: 'dress' },
  { id: 3, name: 'Sport', slug: 'sport' },
  { id: 4, name: 'Pilot', slug: 'pilot' }
];

// Contexto del carrito
const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('luxwatch-cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('luxwatch-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = useCallback((watch) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === watch.id);
      if (existing) {
        return prev.map(item =>
          item.id === watch.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...watch, qty: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((watchId) => {
    setCart(prev => prev.filter(item => item.id !== watchId));
  }, []);

  const updateQuantity = useCallback((watchId, qty) => {
    if (qty <= 0) {
      removeFromCart(watchId);
      return;
    }
    setCart(prev => prev.map(item =>
      item.id === watchId ? { ...item, qty } : item
    ));
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider value={{
      cart,
      isCartOpen,
      setIsCartOpen,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

// Componente SVG de reloj animado
function WatchSVG({ color = "#c9a962" }) {
  return (
    <svg viewBox="0 0 200 200" width="200" height="200">
      <circle cx="100" cy="100" r="80" fill="none" stroke={color} strokeWidth="8"/>
      <circle cx="100" cy="100" r="70" fill="none" stroke={color} strokeWidth="2"/>
      <line x1="100" y1="100" x2="100" y2="50" stroke={color} strokeWidth="4" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="12s" repeatCount="indefinite"/>
      </line>
      <line x1="100" y1="100" x2="130" y2="100" stroke={color} strokeWidth="3" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="60s" repeatCount="indefinite"/>
      </line>
      <circle cx="100" cy="100" r="8" fill={color}/>
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => (
        <line
          key={i}
          x1="100" y1="30" x2="100" y2="25"
          stroke={color} strokeWidth="2"
          transform={`rotate(${deg} 100 100)`}
        />
      ))}
    </svg>
  );
}

// Componente Hero
function Hero() {
  return (
    <header style={styles.hero}>
      <div style={styles.heroContent}>
        <h1 style={styles.heroTitle}>LuxWatch</h1>
        <p style={styles.heroSubtitle}>Relojes de Lujo Exclusivos</p>
        <div style={styles.heroWatch}>
          <WatchSVG />
        </div>
      </div>
    </header>
  );
}

// Componente Filtros
function Filters({ filters, setFilters, brands, categories }) {
  return (
    <div style={styles.filters}>
      <input
        type="text"
        placeholder="Buscar relojes..."
        value={filters.search}
        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
        style={styles.searchInput}
      />
      <select
        value={filters.brand}
        onChange={(e) => setFilters(prev => ({ ...prev, brand: e.target.value }))}
        style={styles.select}
      >
        <option value="">Todas las marcas</option>
        {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
      </select>
      <select
        value={filters.category}
        onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
        style={styles.select}
      >
        <option value="">Todas las categorías</option>
        {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
      </select>
      <input
        type="number"
        placeholder="Precio mín"
        value={filters.minPrice}
        onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
        style={styles.priceInput}
      />
      <input
        type="number"
        placeholder="Precio máx"
        value={filters.maxPrice}
        onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
        style={styles.priceInput}
      />
      <select
        value={filters.sort}
        onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
        style={styles.select}
      >
        <option value="">Ordenar por</option>
        <option value="name">Nombre</option>
        <option value="price_asc">Precio: menor a mayor</option>
        <option value="price_desc">Precio: mayor a menor</option>
        <option value="brand">Marca</option>
      </select>
      <label style={styles.checkboxLabel}>
        <input
          type="checkbox"
          checked={filters.featured}
          onChange={(e) => setFilters(prev => ({ ...prev, featured: e.target.checked }))}
        />
        Solo destacados
      </label>
    </div>
  );
}

// Componente Tarjeta de Producto
function ProductCard({ watch, onOpenDetail }) {
  const { addToCart } = useCart();
  
  return (
    <div style={styles.card}>
      <div style={styles.cardImage} onClick={() => onOpenDetail(watch)}>
        <WatchSVG />
      </div>
      <div style={styles.cardInfo}>
        <h3 style={styles.cardBrand}>{watch.brand}</h3>
        <h4 style={styles.cardName}>{watch.name}</h4>
        <p style={styles.cardPrice}>${watch.price.toLocaleString()}</p>
        <button style={styles.addButton} onClick={() => addToCart(watch)}>
          Añadir al Carrito
        </button>
      </div>
    </div>
  );
}

// Componente Modal de Detalle
function DetailModal({ watch, onClose }) {
  const { addToCart } = useCart();
  
  if (!watch) return null;
  
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <button style={styles.closeButton} onClick={onClose}>×</button>
        <div style={styles.modalContent}>
          <div style={styles.modalImage}>
            <WatchSVG />
          </div>
          <div style={styles.modalInfo}>
            <h2 style={styles.modalBrand}>{watch.brand}</h2>
            <h3 style={styles.modalName}>{watch.name}</h3>
            <p style={styles.modalPrice}>${watch.price.toLocaleString()}</p>
            <p style={styles.modalDescription}>{watch.description}</p>
            <div style={styles.specs}>
              <div style={styles.spec}><strong>Movimiento:</strong> {watch.movement}</div>
              <div style={styles.spec}><strong>Caja:</strong> {watch.case_material}</div>
              <div style={styles.spec}><strong>Diámetro:</strong> {watch.case_diameter}</div>
              <div style={styles.spec}><strong>Resistencia:</strong> {watch.water_resistance}</div>
            </div>
            <button style={styles.modalButton} onClick={() => { addToCart(watch); onClose(); }}>
              Añadir al Carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente Carrito Lateral
function CartSidebar() {
  const { isCartOpen, setIsCartOpen, cart, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const [checkoutStep, setCheckoutStep] = useState(0);
  const [customerData, setCustomerData] = useState({ customer: '', email: '', address: '' });
  const [orderId, setOrderId] = useState(null);

  const handleCheckout = async () => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...customerData,
          items: cart.map(item => ({ watch_id: item.id, qty: item.qty }))
        })
      });
      if (response.ok) {
        const data = await response.json();
        setOrderId(data.id);
        setCheckoutStep(2);
        clearCart();
      }
    } catch (err) {
      // Fallback mock
      setOrderId(Date.now());
      setCheckoutStep(2);
      clearCart();
    }
  };

  if (!isCartOpen) return null;

  return (
    <div style={styles.cartOverlay} onClick={() => setIsCartOpen(false)}>
      <div style={styles.cart} onClick={e => e.stopPropagation()}>
        <button style={styles.closeButton} onClick={() => setIsCartOpen(false)}>×</button>
        <h2 style={styles.cartTitle}>Tu Carrito</h2>
        
        {checkoutStep === 0 && (
          <>
            {cart.length === 0 ? (
              <p style={styles.emptyCart}>El carrito está vacío</p>
            ) : (
              <>
                <div style={styles.cartItems}>
                  {cart.map(item => (
                    <div key={item.id} style={styles.cartItem}>
                      <div style={styles.cartItemInfo}>
                        <h4>{item.brand} {item.name}</h4>
                        <p>${item.price.toLocaleString()}</p>
                      </div>
                      <div style={styles.cartItemControls}>
                        <button onClick={() => updateQuantity(item.id, item.qty - 1)}>-</button>
                        <span>{item.qty}</span>
                        <button onClick={() => updateQuantity(item.id, item.qty + 1)}>+</button>
                        <button onClick={() => removeFromCart(item.id)} style={styles.removeBtn}>×</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={styles.cartTotal}>
                  <strong>Total: ${cartTotal.toLocaleString()}</strong>
                </div>
                <button style={styles.checkoutButton} onClick={() => setCheckoutStep(1)}>
                  Proceder al Checkout
                </button>
              </>
            )}
          </>
        )}

        {checkoutStep === 1 && (
          <div style={styles.checkoutForm}>
            <h3>Información de Envío</h3>
            <input
              style={styles.input}
              placeholder="Nombre completo"
              value={customerData.customer}
              onChange={e => setCustomerData(prev => ({ ...prev, customer: e.target.value }))}
            />
            <input
              style={styles.input}
              placeholder="Email"
              type="email"
              value={customerData.email}
              onChange={e => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
            />
            <textarea
              style={styles.textarea}
              placeholder="Dirección de envío"
              value={customerData.address}
              onChange={e => setCustomerData(prev => ({ ...prev, address: e.target.value }))}
            />
            <button style={styles.confirmButton} onClick={handleCheckout}>
              Confirmar Pedido
            </button>
            <button style={styles.backButton} onClick={() => setCheckoutStep(0)}>
              Volver
            </button>
          </div>
        )}

        {checkoutStep === 2 && (
          <div style={styles.confirmation}>
            <h3>¡Pedido Confirmado!</h3>
            <p>Número de pedido: #{orderId}</p>
            <p>Gracias por tu compra.</p>
            <button style={styles.closeConfirmation} onClick={() => { setIsCartOpen(false); setCheckoutStep(0); }}>
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente Botón Flotante del Carrito
function CartButton() {
  const { cartCount, setIsCartOpen } = useCart();
  
  return (
    <button style={styles.cartButton} onClick={() => setIsCartOpen(true)}>
      🛒
      {cartCount > 0 && <span style={styles.cartBadge}>{cartCount}</span>}
    </button>
  );
}

// Componente Principal App
export default function App() {
  const [watches, setWatches] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    brand: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    featured: false,
    sort: ''
  });
  const [selectedWatch, setSelectedWatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [watchesRes, brandsRes, categoriesRes] = await Promise.all([
          fetch('/api/watches'),
          fetch('/api/brands'),
          fetch('/api/categories')
        ]);
        
        if (watchesRes.ok && brandsRes.ok && categoriesRes.ok) {
          const [watchesData, brandsData, categoriesData] = await Promise.all([
            watchesRes.json(),
            brandsRes.json(),
            categoriesRes.json()
          ]);
          setWatches(watchesData);
          setBrands(brandsData);
          setCategories(categoriesData);
        } else {
          throw new Error('API no disponible');
        }
      } catch (err) {
        // Usar datos mock si la API no está disponible
        setWatches(MOCK_WATCHES);
        setBrands(MOCK_BRANDS);
        setCategories(MOCK_CATEGORIES);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const filteredWatches = watches.filter(watch => {
    if (filters.search && !watch.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !watch.brand.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.brand && watch.brand !== filters.brand) return false;
    if (filters.category && watch.category_slug !== filters.category) return false;
    if (filters.minPrice && watch.price < parseFloat(filters.minPrice)) return false;
    if (filters.maxPrice && watch.price > parseFloat(filters.maxPrice)) return false;
    if (filters.featured && !watch.featured) return false;
    return true;
  }).sort((a, b) => {
    if (filters.sort === 'name') return a.name.localeCompare(b.name);
    if (filters.sort === 'price_asc') return a.price - b.price;
    if (filters.sort === 'price_desc') return b.price - a.price;
    if (filters.sort === 'brand') return a.brand.localeCompare(b.brand);
    return 0;
  });

  return (
    <CartProvider>
      <div style={styles.app}>
        <Hero />
        <CartButton />
        <CartSidebar />
        <main style={styles.main}>
          <Filters filters={filters} setFilters={setFilters} brands={brands} categories={categories} />
          {loading ? (
            <p style={styles.loading}>Cargando relojes...</p>
          ) : (
            <div style={styles.grid}>
              {filteredWatches.map(watch => (
                <ProductCard key={watch.id} watch={watch} onOpenDetail={setSelectedWatch} />
              ))}
            </div>
          )}
        </main>
        {selectedWatch && (
          <DetailModal watch={selectedWatch} onClose={() => setSelectedWatch(null)} />
        )}
      </div>
    </CartProvider>
  );
}

// Estilos
const styles = {
  app: { minHeight: '100vh' },
  hero: {
    background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
    padding: '80px 20px',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden'
  },
  heroContent: { maxWidth: '800px', margin: '0 auto' },
  heroTitle: {
    fontSize: '4rem',
    fontFamily: "'Cormorant Garamond', serif",
    color: '#c9a962',
    marginBottom: '10px',
    letterSpacing: '4px'
  },
  heroSubtitle: {
    fontSize: '1.5rem',
    color: '#f5f5f5',
    fontWeight: '300',
    marginBottom: '40px'
  },
  heroWatch: { animation: 'float 3s ease-in-out infinite' },
  main: { maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' },
  filters: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '15px',
    marginBottom: '40px',
    padding: '20px',
    background: '#1a1a1a',
    borderRadius: '8px'
  },
  searchInput: {
    flex: '1',
    minWidth: '200px',
    padding: '12px 16px',
    border: '1px solid #333',
    borderRadius: '4px',
    background: '#0a0a0a',
    color: '#f5f5f5',
    fontSize: '14px'
  },
  select: {
    padding: '12px 16px',
    border: '1px solid #333',
    borderRadius: '4px',
    background: '#0a0a0a',
    color: '#f5f5f5',
    fontSize: '14px',
    cursor: 'pointer'
  },
  priceInput: {
    width: '120px',
    padding: '12px 16px',
    border: '1px solid #333',
    borderRadius: '4px',
    background: '#0a0a0a',
    color: '#f5f5f5',
    fontSize: '14px'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#f5f5f5',
    cursor: 'pointer'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '30px'
  },
  card: {
    background: '#1a1a1a',
    borderRadius: '8px',
    overflow: 'hidden',
    transition: 'transform 0.3s, box-shadow 0.3s'
  },
  cardImage: {
    padding: '40px',
    background: '#0a0a0a',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center'
  },
  cardInfo: { padding: '20px' },
  cardBrand: {
    fontSize: '1rem',
    color: '#c9a962',
    marginBottom: '5px',
    fontFamily: "'Cormorant Garamond', serif"
  },
  cardName: {
    fontSize: '1.3rem',
    marginBottom: '10px',
    fontFamily: "'Cormorant Garamond', serif"
  },
  cardPrice: {
    fontSize: '1.5rem',
    color: '#c9a962',
    marginBottom: '15px',
    fontFamily: "'Cormorant Garamond', serif"
  },
  addButton: {
    width: '100%',
    padding: '12px',
    background: '#c9a962',
    color: '#0a0a0a',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'background 0.3s'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modal: {
    background: '#1a1a1a',
    borderRadius: '8px',
    maxWidth: '900px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    position: 'relative'
  },
  closeButton: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    background: 'transparent',
    border: 'none',
    color: '#f5f5f5',
    fontSize: '30px',
    cursor: 'pointer',
    zIndex: 10
  },
  modalContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '40px',
    padding: '40px'
  },
  modalImage: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#0a0a0a',
    borderRadius: '8px',
    padding: '40px'
  },
  modalInfo: { display: 'flex', flexDirection: 'column' },
  modalBrand: {
    fontSize: '1.5rem',
    color: '#c9a962',
    fontFamily: "'Cormorant Garamond', serif"
  },
  modalName: {
    fontSize: '2.5rem',
    fontFamily: "'Cormorant Garamond', serif",
    marginBottom: '15px'
  },
  modalPrice: {
    fontSize: '2rem',
    color: '#c9a962',
    fontFamily: "'Cormorant Garamond', serif",
    marginBottom: '20px'
  },
  modalDescription: {
    color: '#aaa',
    marginBottom: '30px',
    lineHeight: '1.8'
  },
  specs: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
    marginBottom: '30px'
  },
  spec: {
    padding: '10px',
    background: '#0a0a0a',
    borderRadius: '4px'
  },
  modalButton: {
    padding: '15px 30px',
    background: '#c9a962',
    color: '#0a0a0a',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: '600'
  },
  cartOverlay: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'flex-end'
  },
  cart: {
    background: '#1a1a1a',
    width: '100%',
    maxWidth: '450px',
    height: '100vh',
    padding: '30px',
    overflow: 'auto',
    position: 'relative'
  },
  cartTitle: {
    fontSize: '2rem',
    fontFamily: "'Cormorant Garamond', serif",
    color: '#c9a962',
    marginBottom: '30px',
    textAlign: 'center'
  },
  emptyCart: {
    textAlign: 'center',
    color: '#aaa',
    padding: '40px 0'
  },
  cartItems: { marginBottom: '20px' },
  cartItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 0',
    borderBottom: '1px solid #333'
  },
  cartItemInfo: { flex: 1 },
  cartItemControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  removeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#ff4444',
    fontSize: '20px',
    cursor: 'pointer'
  },
  cartTotal: {
    padding: '20px 0',
    borderTop: '2px solid #c9a962',
    marginBottom: '20px',
    fontSize: '1.3rem'
  },
  checkoutButton: {
    width: '100%',
    padding: '15px',
    background: '#c9a962',
    color: '#0a0a0a',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: '600'
  },
  checkoutForm: { display: 'flex', flexDirection: 'column', gap: '15px' },
  input: {
    padding: '12px',
    border: '1px solid #333',
    borderRadius: '4px',
    background: '#0a0a0a',
    color: '#f5f5f5'
  },
  textarea: {
    padding: '12px',
    border: '1px solid #333',
    borderRadius: '4px',
    background: '#0a0a0a',
    color: '#f5f5f5',
    minHeight: '100px',
    resize: 'vertical'
  },
  confirmButton: {
    padding: '15px',
    background: '#c9a962',
    color: '#0a0a0a',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: '600'
  },
  backButton: {
    padding: '12px',
    background: 'transparent',
    color: '#f5f5f5',
    border: '1px solid #333',
    borderRadius: '4px'
  },
  confirmation: {
    textAlign: 'center',
    padding: '40px 0'
  },
  closeConfirmation: {
    marginTop: '20px',
    padding: '12px 30px',
    background: '#c9a962',
    color: '#0a0a0a',
    border: 'none',
    borderRadius: '4px'
  },
  cartButton: {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    background: '#c9a962',
    color: '#0a0a0a',
    border: 'none',
    borderRadius: '50%',
    width: '60px',
    height: '60px',
    fontSize: '24px',
    boxShadow: '0 4px 20px rgba(201, 169, 98, 0.4)',
    zIndex: 999,
    cursor: 'pointer'
  },
  cartBadge: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    background: '#ff4444',
    color: '#fff',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  loading: {
    textAlign: 'center',
    padding: '60px',
    color: '#aaa',
    fontSize: '1.2rem'
  }
};

import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, Truck, Users, DollarSign, Plus, Search, X, LogOut, 
  ChevronRight, Download, MoreVertical, FileText, Bell, Settings, 
  TrendingUp, MapPin, Calendar, Activity, Package, CheckCircle, Briefcase, Server, User, Phone, Trash2, Mail, Building, History, ExternalLink, Euro, MessageCircle, ArrowRight, Filter, RefreshCw, Eye, XCircle, Clock, PieChart
} from 'lucide-react';

// --- DATA SIMULATION ---
import initialClients from './db/clients.json';
import initialDrivers from './db/drivers.json';
import initialFleet from './db/fleet.json';
import initialOrders from './db/orders.json';

// --- GEOGRAPHIC DATA ---
const locations = {
  "Albania": ["Tirana", "Durres", "Vlore", "Shkoder", "Fier", "Elbasan", "Kukes"],
  "Kosovo": ["Prishtina", "Prizren", "Peja", "Gjakova", "Mitrovica", "Ferizaj", "Gjilan"],
  "Germany": ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Stuttgart", "Dusseldorf"],
  "Italy": ["Rome", "Milan", "Naples", "Turin", "Florence", "Bologna", "Venice"],
  "France": ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg"],
  "Greece": ["Athens", "Thessaloniki", "Patras", "Heraklion", "Larissa"],
  "Turkey": ["Istanbul", "Ankara", "Izmir", "Bursa", "Antalya"],
  "North Macedonia": ["Skopje", "Bitola", "Kumanovo", "Prilep", "Tetovo"],
  "Serbia": ["Belgrade", "Novi Sad", "Nis", "Kragujevac"],
  "Montenegro": ["Podgorica", "Niksic", "Herceg Novi", "Bar"],
  "Austria": ["Vienna", "Graz", "Linz", "Salzburg", "Innsbruck"],
  "Switzerland": ["Zurich", "Geneva", "Basel", "Bern", "Lausanne"],
  "Belgium": ["Brussels", "Antwerp", "Ghent", "Charleroi"],
  "Netherlands": ["Amsterdam", "Rotterdam", "The Hague", "Utrecht"],
  "Poland": ["Warsaw", "Krakow", "Lodz", "Wroclaw", "Poznan"]
};

// --- STATUS FLOW LOGIC ---
const STATUS_ORDER = ['NË PRITJE', 'FILLOI', 'NGARKOI', 'SHKARKOI', 'PERFUNDOI'];

const canAdvanceStatus = (currentStatus, nextStatus) => {
    if (currentStatus === 'DESHTOI' || currentStatus === 'PERFUNDOI') return false;
    if (nextStatus === 'DESHTOI') return true; 
    const currentIndex = STATUS_ORDER.indexOf(currentStatus);
    const nextIndex = STATUS_ORDER.indexOf(nextStatus);
    return nextIndex > currentIndex;
};

// --- COMPONENTS ---

const Sidebar = ({ activePage, setActivePage }) => (
  <aside className="w-72 bg-slate-900 text-white flex flex-col flex-shrink-0 transition-all duration-300 shadow-2xl z-20">
    <div className="h-24 flex items-center px-8 border-b border-slate-800">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Truck className="text-white" size={24} />
        </div>
        <div>
          <h1 className="font-bold text-xl tracking-wide">LENITA</h1>
          <span className="text-xs text-slate-400 tracking-[0.2em] uppercase">Logistics</span>
        </div>
      </div>
    </div>

    <div className="px-6 py-6">
      <p className="text-xs font-semibold text-slate-500 uppercase mb-4 tracking-wider">Menu Kryesore</p>
      <nav className="space-y-2">
        <SidebarButton icon={<LayoutDashboard size={20} />} label="Pasqyra (Dashboard)" page="dashboard" activePage={activePage} onClick={() => setActivePage('dashboard')} />
        <SidebarButton icon={<Truck size={20} />} label="Dërgesat" page="transport" activePage={activePage} onClick={() => setActivePage('transport')} />
        <SidebarButton icon={<Users size={20} />} label="Shoferët & Klientët" page="drivers" activePage={activePage} onClick={() => setActivePage('drivers')} />
        <SidebarButton icon={<Server size={20} />} label="Mjetet (Flota)" page="fleet" activePage={activePage} onClick={() => setActivePage('fleet')} />
        <SidebarButton icon={<PieChart size={20} />} label="Analitika" page="finance" activePage={activePage} onClick={() => setActivePage('finance')} />
      </nav>
    </div>

    <div className="mt-auto px-6 py-6 border-t border-slate-800">
      <p className="text-xs font-semibold text-slate-500 uppercase mb-4 tracking-wider">Sistemi</p>
      <nav className="space-y-2">
        <SidebarButton icon={<Settings size={20} />} label="Cilësimet" page="settings" activePage={activePage} onClick={() => setActivePage('settings')} />
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all group">
          <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
          <span className="font-medium">Dilni</span>
        </button>
      </nav>
    </div>
  </aside>
);

const SidebarButton = ({ icon, label, page, activePage, onClick }) => {
  const isActive = activePage === page;
  return (
    <button 
      onClick={onClick} 
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${
        isActive 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <span className={`relative z-10 flex items-center gap-3`}>
        {icon}
        <span className="font-medium">{label}</span>
      </span>
      {isActive && <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 opacity-100" />}
    </button>
  );
};

const Header = ({ title }) => (
  <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-10 sticky top-0 z-10 transition-all">
    <div>
      <h1 className="font-bold text-2xl text-slate-800">{title}</h1>
      <p className="text-sm text-slate-500 mt-1">Mirësevini përsëri, Administrator</p>
    </div>
    
    <div className="flex items-center gap-6">
      <div className="relative hidden md:block group">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        <input 
          type="text" 
          placeholder="Kërko..." 
          className="w-80 pl-11 pr-4 py-3 bg-slate-50 border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400 text-sm font-medium"
        />
      </div>
      
      <button className="relative p-3 rounded-xl bg-slate-50 text-slate-600 hover:bg-white hover:text-blue-600 hover:shadow-lg hover:shadow-blue-500/10 transition-all border border-transparent hover:border-gray-100">
        <Bell size={20} />
        <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
      </button>
      
      <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 cursor-pointer hover:scale-105 transition-transform">
        LG
      </div>
    </div>
  </header>
);

const PhoneInput = ({ name, placeholder, required = false, defaultValue }) => {
  const [val, setVal] = useState(defaultValue || '');
  return (
    <div className="relative w-full group">
      <input 
        name={name} 
        required={required}
        placeholder={placeholder} 
        onChange={(e) => setVal(e.target.value)}
        value={val}
        className="w-full p-3 pl-10 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
      />
      <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      {val && (
        <a 
          href={`https://wa.me/${val.replace(/\D/g,'')}`} 
          target="_blank" 
          rel="noreferrer"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#25D366] text-white p-1.5 rounded-lg hover:bg-[#128C7E] transition-all shadow-sm flex items-center gap-1"
          title="Hap në WhatsApp"
        >
          <MessageCircle size={16} fill="white" /> 
          <span className="text-[10px] font-bold pr-1">CHAT</span>
        </a>
      )}
    </div>
  )
};

const WhatsAppButton = ({ phone }) => {
    if (!phone) return null;
    return (
        <a 
            href={`https://wa.me/${phone.replace(/\D/g,'')}`} 
            target="_blank" 
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 bg-[#25D366] text-white px-2 py-1 rounded-lg hover:bg-[#128C7E] transition-all shadow-sm hover:shadow-md font-bold text-[10px] uppercase tracking-wide"
        >
            <MessageCircle size={12} fill="white" />
            WhatsApp
        </a>
    );
};

const StatCard = ({ title, value, trend, icon: Icon, color, trendUp }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 group">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10 group-hover:bg-opacity-20 transition-all`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
      <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {trendUp ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
        {trend}
      </span>
    </div>
    <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
    <p className="text-3xl font-bold text-slate-800">{value}</p>
  </div>
);

const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm ${className}`}>
        {children}
    </div>
);

const RecentActivity = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
    <div className="flex justify-between items-center mb-6">
      <h3 className="font-bold text-lg text-slate-800">Aktiviteti i Fundit</h3>
      <button className="text-blue-600 text-sm font-semibold hover:text-blue-700">Shiko të gjitha</button>
    </div>
    <div className="space-y-6">
      {[1, 2, 3].map((_, i) => (
        <div key={i} className="flex gap-4 items-start pb-6 border-b border-gray-50 last:border-0 last:pb-0">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm">
            <Package size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Porosia #2024-00{i+1} u dorëzua</p>
            <p className="text-xs text-slate-500 mt-1">Destinacioni: Tiranë • Klienti: Auto Parts AL</p>
            <p className="text-xs text-slate-400 mt-2">2 orë më parë</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const App = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [activeSubPage, setActiveSubPage] = useState('order');
  const [activeDriverSubPage, setActiveDriverSubPage] = useState('drivers'); 
  const [activeFleetSubPage, setActiveFleetSubPage] = useState('trucks'); 
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('order'); 
  const [selectedEntity, setSelectedEntity] = useState(null); 

  // --- STATE FOR DATA (Persistent) ---
  const loadState = (key, initial) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initial;
  };

  const [clients, setClients] = useState(() => loadState('clients', initialClients));
  const [drivers, setDrivers] = useState(() => loadState('drivers', initialDrivers));
  const [trucks, setTrucks] = useState(() => loadState('trucks', initialFleet.trucks));
  const [trailers, setTrailers] = useState(() => loadState('trailers', initialFleet.trailers));
  const [orders, setOrders] = useState(() => loadState('orders', initialOrders));

  // --- SAVE TO LOCALSTORAGE ---
  React.useEffect(() => localStorage.setItem('clients', JSON.stringify(clients)), [clients]);
  React.useEffect(() => localStorage.setItem('drivers', JSON.stringify(drivers)), [drivers]);
  React.useEffect(() => localStorage.setItem('trucks', JSON.stringify(trucks)), [trucks]);
  React.useEffect(() => localStorage.setItem('trailers', JSON.stringify(trailers)), [trailers]);
  React.useEffect(() => localStorage.setItem('orders', JSON.stringify(orders)), [orders]);

  // --- STATE FOR FILTERS ---
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, NË PRITJE, etc.
  const [clientSearch, setClientSearch] = useState('');
  const [driverSearch, setDriverSearch] = useState('');
  const [fleetSearch, setFleetSearch] = useState('');
  
  // --- STATE FOR HISTORY DATE FILTERS ---
  const [historyStartDate, setHistoryStartDate] = useState('');
  const [historyEndDate, setHistoryEndDate] = useState('');

  // --- STATE FOR ADDRESS SELECTION ---
  const [loadingCountry, setLoadingCountry] = useState('');
  const [unloadingCountry, setUnloadingCountry] = useState('');

  // --- RESOURCE LOCKING LOGIC ---
  const updateResourceStatus = (driverId, truckId, trailerId, status) => {
      setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, status } : d));
      setTrucks(prev => prev.map(t => t.id === truckId ? { ...t, status } : t));
      setTrailers(prev => prev.map(t => t.id === trailerId ? { ...t, status } : t));
  };

  const handleStatusChange = (orderId, newStatus) => {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      if (!canAdvanceStatus(order.status, newStatus)) {
          alert('Kujdes! Statusi nuk mund të kthehet mbrapa ose të ndryshohet në mënyrë të parregullt.');
          return;
      }
      
      const today = new Date().toISOString().split('T')[0]; // Current Date YYYY-MM-DD

      // Update Order Status & Dates
      setOrders(prevOrders => prevOrders.map(o => {
          if (o.id === orderId) {
              const updates = { status: newStatus };
              if (newStatus === 'FILLOI' && !o.start_date) updates.start_date = today;
              if (newStatus === 'PERFUNDOI') updates.end_date = today;
              return { ...o, ...updates };
          }
          return o;
      }));

      // Resource Management Logic
      const resourceStatus = (newStatus === 'PERFUNDOI' || newStatus === 'DESHTOI') ? 'AVAILABLE' : 'BUSY';
      updateResourceStatus(order.driver_id, order.truck_id, order.trailer_id, resourceStatus);
  };

  // --- HANDLERS (Same as before) ---
  const handleAddClient = (e) => { e.preventDefault(); const formData = new FormData(e.target); const newClient = { id: clients.length + 1, name: formData.get('name'), contact_person: formData.get('contact_person'), phone: formData.get('phone'), email: formData.get('email'), address: formData.get('address'), spedicion_name: formData.get('spedicion_name'), spedicion_email: formData.get('spedicion_email'), spedicion_phone: formData.get('spedicion_phone') }; setClients([...clients, newClient]); setShowModal(false); };
  const handleDeleteClient = (e, id) => { e.stopPropagation(); if(window.confirm('A jeni i sigurt që doni të fshini këtë klient?')) { setClients(clients.filter(c => c.id !== id)); } };
  const handleAddDriver = (e) => { e.preventDefault(); const formData = new FormData(e.target); const newDriver = { id: drivers.length + 1, name: formData.get('name'), license_number: formData.get('license_number'), phone: formData.get('phone'), age: formData.get('age'), salary: formData.get('salary'), status: 'AVAILABLE' }; setDrivers([...drivers, newDriver]); setShowModal(false); };
  const handleDeleteDriver = (e, id) => { e.stopPropagation(); if(window.confirm('A jeni i sigurt që doni të fshini këtë shofer?')) { setDrivers(drivers.filter(d => d.id !== id)); } };
  const handleAddTruck = (e) => { e.preventDefault(); const formData = new FormData(e.target); const newTruck = { id: trucks.length + 1, plate: formData.get('plate'), brand: formData.get('brand'), model: formData.get('model'), chassis_number: formData.get('chassis_number'), current_km: formData.get('current_km'), year: formData.get('year'), status: 'AVAILABLE' }; setTrucks([...trucks, newTruck]); setShowModal(false); };
  const handleDeleteTruck = (id) => { if(window.confirm('A jeni i sigurt që doni të fshini këtë kamion?')) { setTrucks(trucks.filter(t => t.id !== id)); } };
  const handleAddTrailer = (e) => { e.preventDefault(); const formData = new FormData(e.target); const newTrailer = { id: trailers.length + 1, plate: formData.get('plate'), chassis_number: formData.get('chassis_number'), model: formData.get('model'), type: formData.get('type'), capacity: formData.get('capacity'), status: 'AVAILABLE' }; setTrailers([...trailers, newTrailer]); setShowModal(false); };
  const handleDeleteTrailer = (id) => { if(window.confirm('A jeni i sigurt që doni të fshini këtë rimorkio?')) { setTrailers(trailers.filter(t => t.id !== id)); } };

  const handleAddOrder = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const loadAddr = `${formData.get('loading_city')}, ${formData.get('loading_country')}`;
    const unloadAddr = `${formData.get('unloading_city')}, ${formData.get('unloading_country')}`;
    const nextId = orders.length + 1;
    const year = new Date().getFullYear();
    const formattedId = `OD-${String(nextId).padStart(2, '0')}/${year}`;

    const newOrder = {
      id: orders.length + 1,
      order_number: formattedId,
      client_id: parseInt(formData.get('client_id')),
      driver_id: parseInt(formData.get('driver_id')),
      truck_id: parseInt(formData.get('truck_id')),
      trailer_id: parseInt(formData.get('trailer_id')),
      transport_type: formData.get('transport_type'),
      goods_desc: formData.get('goods_desc'),
      loading_address: loadAddr,
      unloading_address: unloadAddr,
      loading_date: formData.get('loading_date'), 
      start_date: null, 
      end_date: null, 
      price: parseFloat(formData.get('price')),
      status: 'NË PRITJE' 
    };
    setOrders([...orders, newOrder]);
    updateResourceStatus(newOrder.driver_id, newOrder.truck_id, newOrder.trailer_id, 'BUSY');
    setShowModal(false);
    setLoadingCountry('');
    setUnloadingCountry('');
  };

  const handleDeleteOrder = (id) => {
    if(window.confirm('A jeni i sigurt që doni të fshini këtë urdhëresë?')) {
        const orderToDelete = orders.find(o => o.id === id);
        if (orderToDelete && orderToDelete.status !== 'PERFUNDOI') {
             updateResourceStatus(orderToDelete.driver_id, orderToDelete.truck_id, orderToDelete.trailer_id, 'AVAILABLE');
        }
        setOrders(orders.filter(o => o.id !== id));
    }
  };

  const handleFailOrder = (id) => {
    if(window.confirm('A jeni i sigurt që doni ta shënoni këtë urdhëresë si DËSHTUAR?')) {
        handleStatusChange(id, 'DESHTOI');
    }
  };

  const getMappedOrders = useMemo(() => orders.map(o => ({
    ...o,
    client: clients.find(c => c.id === o.client_id) || { name: 'I panjohur' },
    driver: drivers.find(d => d.id === o.driver_id) || { name: 'I panjohur' },
    truck: trucks.find(t => t.id === o.truck_id) || { plate: '---' },
    trailer: trailers.find(t => t.id === o.trailer_id) || { plate: '---' }
  })), [orders, clients, drivers, trucks, trailers]);

  // --- FILTERED LISTS ---
  const filteredOrders = useMemo(() => {
      let filtered = getMappedOrders.filter(o => 
        o.order_number.toLowerCase().includes(orderSearch.toLowerCase()) || 
        o.client.name.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.driver.name.toLowerCase().includes(orderSearch.toLowerCase())
      );
      
      if (statusFilter !== 'ALL') {
          filtered = filtered.filter(o => o.status === statusFilter);
      }
      return filtered;
  }, [getMappedOrders, orderSearch, statusFilter]);

  const filteredClients = useMemo(() => clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase())), [clients, clientSearch]);
  const filteredDrivers = useMemo(() => drivers.filter(d => d.name.toLowerCase().includes(driverSearch.toLowerCase())), [drivers, driverSearch]);
  const filteredTrucks = useMemo(() => trucks.filter(t => t.plate.toLowerCase().includes(fleetSearch.toLowerCase())), [trucks, fleetSearch]);
  const filteredTrailers = useMemo(() => trailers.filter(t => t.plate.toLowerCase().includes(fleetSearch.toLowerCase())), [trailers, fleetSearch]);

  // --- HISTORY FILTERS (Fixed Safeties) ---
  const getClientHistory = (clientId) => {
    let history = getMappedOrders.filter(o => o.client_id === clientId);
    if(historyStartDate) history = history.filter(o => o.loading_date >= historyStartDate);
    if(historyEndDate) history = history.filter(o => o.loading_date <= historyEndDate);
    return history;
  };

  const getDriverHistory = (driverId) => {
    let history = getMappedOrders.filter(o => o.driver_id === driverId);
    if(historyStartDate) history = history.filter(o => o.loading_date >= historyStartDate);
    if(historyEndDate) history = history.filter(o => o.loading_date <= historyEndDate);
    return history;
  };
  
  const getStatusBadge = (status) => {
    const styles = {
      'NË PRITJE': "bg-gray-100 text-gray-700 border-gray-200",
      'FILLOI': "bg-blue-50 text-blue-700 border-blue-100",
      'NGARKOI': "bg-amber-50 text-amber-700 border-amber-100",
      'SHKARKOI': "bg-purple-50 text-purple-700 border-purple-100",
      'PERFUNDOI': "bg-emerald-50 text-emerald-700 border-emerald-100",
      'DESHTOI': "bg-red-50 text-red-700 border-red-100 opacity-70", 
      'AVAILABLE': "bg-emerald-50 text-emerald-700 border-emerald-100",
      'BUSY': "bg-red-50 text-red-700 border-red-100",
    };
    let label = status;
    if (status === 'AVAILABLE') label = 'I LIRË';
    if (status === 'BUSY') label = 'I ZËNË';
    return (
      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${styles[status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
        {label}
      </span>
    );
  };
  
  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-600">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <Header title={
          activePage === 'dashboard' ? 'Pasqyra Kryesore' : 
          activePage === 'transport' ? 'Menaxhimi i Transportit' : 
          activePage === 'drivers' ? 'Shoferët & Klientët' :
          activePage === 'fleet' ? 'Menaxhimi i Flotës' :
          activePage === 'finance' ? 'Analitika' : 'Administrimi' // Updated Title
        } />
        
        <div className="flex-1 overflow-y-auto p-10 scrollbar-hide">
          {activePage === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Të Ardhurat (Mujore)" value="€42,500" trend="+12.5%" trendUp={true} icon={DollarSign} color="bg-emerald-500" />
                <StatCard title="Dërgesat Aktive" value={orders.filter(o => o.status !== 'PERFUNDOI' && o.status !== 'DESHTOI').length} trend="+4.2%" trendUp={true} icon={Truck} color="bg-blue-500" />
                <StatCard title="Shoferët Disponibël" value={drivers.filter(d => d.status === 'AVAILABLE').length} trend="-1" trendUp={false} icon={Users} color="bg-violet-500" />
                <StatCard title="Porositë Totale" value={orders.length} trend="+2" trendUp={true} icon={Activity} color="bg-amber-500" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="font-bold text-lg text-slate-800">Dërgesat e Fundit</h3>
                    <button onClick={() => setActivePage('transport')} className="text-sm font-medium text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors">
                      Shiko të gjitha
                    </button>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-gray-100">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50/80 text-xs uppercase text-slate-500 font-bold tracking-wider">
                        <tr>
                          <th className="px-6 py-4">ID</th>
                          <th className="px-6 py-4">Destinacioni</th>
                          <th className="px-6 py-4">Statusi</th>
                          <th className="px-6 py-4 text-right">Vlera</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 bg-white">
                        {getMappedOrders.slice(0, 5).map(o => (
                          <tr key={o.id} className="hover:bg-blue-50/30 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-700">#{o.order_number}</td>
                            <td className="px-6 py-4 text-slate-600">
                              <div className="flex flex-col">
                                <span className="font-medium text-slate-800">{o.unloading_address ? o.unloading_address.split(',')[0] : '---'}</span>
                                <span className="text-xs text-slate-400">{o.loading_address ? o.loading_address.split(',')[0] : '---'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">{getStatusBadge(o.status)}</td>
                            <td className="px-6 py-4 text-right font-bold text-slate-700">{o.price} €</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="space-y-8">
                  <RecentActivity />
                </div>
              </div>
            </div>
          )}

          {activePage === 'transport' && (
            <div className="animate-fade-in">
               <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1">
                <div className="flex items-center p-2 gap-2 border-b border-gray-100">
                  <button onClick={() => setActiveSubPage('order')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeSubPage === 'order' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-gray-50'}`}>Urdhëresat</button>
                  <button onClick={() => setActiveSubPage('driver_sheet')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeSubPage === 'driver_sheet' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-gray-50'}`}>Fletë Udhëtimet</button>
                </div>

                {activeSubPage === 'order' && (
                  <div className="p-6">
                    {/* FILTERS & SEARCH */}
                    <div className="flex flex-col gap-4 mb-6">
                        <div className="flex justify-between items-center">
                            <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
                                {['ALL', 'NË PRITJE', 'FILLOI', 'NGARKOI', 'SHKARKOI', 'PERFUNDOI', 'DESHTOI'].map(status => (
                                    <button 
                                        key={status}
                                        onClick={() => setStatusFilter(status)}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${statusFilter === status ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        {status === 'ALL' ? 'Të Gjitha' : status}
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => { setModalType('order'); setShowModal(true); }} className="bg-blue-600 text-white flex items-center gap-2 px-5 py-2.5 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all font-medium text-sm">
                                <Plus size={18} />Shto Urdhëresë
                            </button>
                        </div>
                        <div className="relative w-full">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Kërko urdhëresa, klientë, shoferë..." 
                                value={orderSearch}
                                onChange={(e) => setOrderSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>
                    
                    <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-xs uppercase text-slate-500 font-bold border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-4">Order ID</th>
                            <th className="px-6 py-4">Klienti</th>
                            <th className="px-6 py-4">Shoferi</th>
                            <th className="px-6 py-4">Relacioni</th>
                            <th className="px-6 py-4">Statusi</th>
                            <th className="px-6 py-4 text-right">Çmimi</th>
                            <th className="px-6 py-4"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {filteredOrders.length > 0 ? (
                              filteredOrders.map(o => (
                                <tr key={o.id} className={`hover:bg-blue-50/50 transition-colors group ${o.status === 'DESHTOI' ? 'bg-red-50/30' : ''}`}>
                                  <td className={`px-6 py-4 font-bold ${o.status === 'DESHTOI' ? 'text-slate-400' : 'text-blue-600'}`}>{o.order_number}</td>
                                  <td className="px-6 py-4 font-medium text-slate-700">{o.client.name}</td>
                                  <td className="px-6 py-4 text-slate-600">{o.driver.name}</td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-slate-600">
                                      <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{o.loading_address ? o.loading_address.split(',')[0] : '---'}</span>
                                      <ChevronRight size={14} className="text-slate-300"/>
                                      <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{o.unloading_address ? o.unloading_address.split(',')[0] : '---'}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <select 
                                        value={o.status} 
                                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                                        disabled={o.status === 'DESHTOI' || o.status === 'PERFUNDOI'} 
                                        className={`text-xs font-bold px-2 py-1 rounded-full border cursor-pointer focus:outline-none ${
                                            o.status === 'NË PRITJE' ? "bg-gray-50 text-gray-600 border-gray-200" :
                                            o.status === 'FILLOI' ? "bg-blue-50 text-blue-700 border-blue-100" :
                                            o.status === 'NGARKOI' ? "bg-amber-50 text-amber-700 border-amber-100" :
                                            o.status === 'SHKARKOI' ? "bg-purple-50 text-purple-700 border-purple-100" :
                                            o.status === 'PERFUNDOI' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                            "bg-red-50 text-red-700 border-red-100"
                                        }`}
                                    >
                                        {STATUS_ORDER.map(s => <option key={s} value={s}>{s}</option>)}
                                        <option value="DESHTOI">DESHTOI</option>
                                    </select>
                                  </td>
                                  <td className="px-6 py-4 text-right font-bold text-slate-800">{o.price} €</td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                      <button onClick={() => { setSelectedEntity({ type: 'order_details', data: o }); setShowModal(true); }} className="p-2 text-blue-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Shiko Detajet"><Eye size={18}/></button>
                                      {o.status !== 'DESHTOI' && o.status !== 'PERFUNDOI' && (
                                          <button onClick={() => handleFailOrder(o.id)} className="p-2 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Shëno si Dështuar"><XCircle size={18}/></button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))
                          ) : (
                              <tr><td colSpan="7" className="p-8 text-center text-slate-400 italic">Asnjë dërgesë e gjetur me këto kritere.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* (Drivers & Fleet views remain same) */}
          {activePage === 'drivers' && (
             <div className="animate-fade-in space-y-6">
                <div className="flex gap-4 mb-6 justify-between items-center">
                    <div className="flex gap-4">
                        <button onClick={() => setActiveDriverSubPage('drivers')} className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all border ${activeDriverSubPage === 'drivers' ? 'bg-white border-blue-200 text-blue-600 shadow-md shadow-blue-500/10' : 'bg-white border-transparent text-slate-500 hover:bg-gray-50'}`}><Users size={18}/> Shoferët</button>
                        <button onClick={() => setActiveDriverSubPage('clients')} className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all border ${activeDriverSubPage === 'clients' ? 'bg-white border-blue-200 text-blue-600 shadow-md shadow-blue-500/10' : 'bg-white border-transparent text-slate-500 hover:bg-gray-50'}`}><Briefcase size={18}/> Klientët</button>
                    </div>
                    {/* ... (Search input same as before) ... */}
                    <div className="relative">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder={activeDriverSubPage === 'drivers' ? "Kërko shofer..." : "Kërko klient..."} 
                            value={activeDriverSubPage === 'drivers' ? driverSearch : clientSearch}
                            onChange={(e) => activeDriverSubPage === 'drivers' ? setDriverSearch(e.target.value) : setClientSearch(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 w-64 shadow-sm"
                        />
                    </div>
                </div>
                {/* ... (Same list rendering logic for drivers/clients) ... */}
                {activeDriverSubPage === 'drivers' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDrivers.map(d => (
                    <div 
                        key={d.id} 
                        onClick={() => { 
                            setSelectedEntity({ type: 'driver', data: d }); 
                            setHistoryStartDate(''); setHistoryEndDate(''); 
                            setShowModal(true); 
                        }}
                        className={`bg-white border ${d.status === 'BUSY' ? 'border-red-200 bg-red-50/10' : 'border-gray-100'} rounded-xl p-6 hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden`}
                    >
                      <div className={`absolute top-0 right-0 w-24 h-24 ${d.status === 'BUSY' ? 'bg-red-50' : 'bg-blue-50'} rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110`}></div>
                      
                      <div className="relative z-10">
                          <div className="flex justify-between items-start mb-4">
                             <div className={`w-12 h-12 rounded-xl ${d.status === 'BUSY' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'} flex items-center justify-center font-bold text-xl shadow-inner`}>
                                {d.name.charAt(0)}
                             </div>
                             <div className="flex gap-2">
                                <button onClick={(e) => handleDeleteDriver(e, d.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors z-20"><Trash2 size={16}/></button>
                             </div>
                          </div>
                          
                          <h4 className="font-bold text-slate-800 text-lg mb-1">{d.name}</h4>
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">{d.license_number || 'NO LICENSE'}</p>
                          
                          <div className="space-y-3">
                             <div className="flex items-center justify-between text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                                <span className="flex items-center gap-2"><User size={14} className="text-slate-400"/> Mosha</span>
                                <span className="font-bold text-slate-800">{d.age || '--'} vjeç</span>
                             </div>
                             <div className="flex items-center justify-between text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                                <span className="flex items-center gap-2"><Euro size={14} className="text-slate-400"/> Paga</span>
                                <span className="font-bold text-emerald-600">{d.salary || '--'} €</span>
                             </div>
                             <div className="flex items-center justify-between text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                                <span className="flex items-center gap-2"><Phone size={14} className="text-slate-400"/> Tel</span>
                                <WhatsAppButton phone={d.phone} />
                             </div>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                             <span className="text-xs text-slate-400">Statusi</span>
                             {getStatusBadge(d.status)}
                          </div>
                      </div>
                    </div>
                  ))}
                   <button onClick={() => { setModalType('driver'); setShowModal(true); }} className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all min-h-[300px]">
                      <Plus size={40} className="mb-2"/>
                      <span className="font-bold">Shto Shofer të Ri</span>
                   </button>
                </div>
              )}

              {activeDriverSubPage === 'clients' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClients.map(c => (
                      <div 
                        key={c.id} 
                        onClick={() => { 
                            setSelectedEntity({ type: 'client', data: c }); 
                            setHistoryStartDate(''); setHistoryEndDate(''); 
                            setShowModal(true); 
                        }}
                        className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-lg hover:border-blue-100 transition-all group relative cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                {c.name.charAt(0)}
                             </div>
                             <div>
                                <h4 className="font-bold text-slate-800 text-sm">{c.name}</h4>
                                <p className="text-xs text-slate-400">ID: #{c.id}</p>
                             </div>
                          </div>
                          <div className="flex gap-1">
                             <button onClick={(e) => handleDeleteClient(e, c.id)} className="text-slate-300 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors z-20"><Trash2 size={16}/></button>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4 pb-4 border-b border-gray-50">
                           <div className="flex items-center gap-2 text-sm text-slate-600"><User size={14} className="text-slate-400"/> {c.contact_person}</div>
                           <div className="flex items-center gap-2 text-sm text-slate-600"><Mail size={14} className="text-slate-400"/> {c.email || '---'}</div>
                           <div className="flex items-center justify-between text-sm text-slate-600">
                               <span className="flex items-center gap-2"><Phone size={14} className="text-slate-400"/> {c.phone}</span>
                               <WhatsAppButton phone={c.phone} />
                           </div>
                        </div>

                        <div className="flex items-center justify-between text-xs font-bold text-blue-600 bg-blue-50 p-2 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <span>Historiku i Dërgesave</span>
                            <ChevronRight size={16} />
                        </div>
                      </div>
                    ))}
                    <button onClick={() => { setModalType('client'); setShowModal(true); }} className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all min-h-[250px]">
                      <Plus size={40} className="mb-2"/>
                      <span className="font-bold">Shto Klient të Ri</span>
                   </button>
                </div>
              )}
             </div>
          )}

          {activePage === 'fleet' && (
            <div className="animate-fade-in space-y-6">
                {/* ... (Same Fleet UI) ... */}
              <div className="flex gap-4 mb-6 justify-between items-center">
                <div className="flex gap-4">
                    <button onClick={() => setActiveFleetSubPage('trucks')} className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all border ${activeFleetSubPage === 'trucks' ? 'bg-white border-blue-200 text-blue-600 shadow-md shadow-blue-500/10' : 'bg-white border-transparent text-slate-500 hover:bg-gray-50'}`}><Truck size={18}/> Kamionët</button>
                    <button onClick={() => setActiveFleetSubPage('trailers')} className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all border ${activeFleetSubPage === 'trailers' ? 'bg-white border-blue-200 text-blue-600 shadow-md shadow-blue-500/10' : 'bg-white border-transparent text-slate-500 hover:bg-gray-50'}`}><Server size={18}/> Rimorkiot</button>
                </div>
                <div className="relative">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Kërko mjetin..." 
                        value={fleetSearch}
                        onChange={(e) => setFleetSearch(e.target.value)}
                        className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 w-64 shadow-sm"
                    />
                </div>
              </div>

              {activeFleetSubPage === 'trucks' && (
                  <Card className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-lg text-slate-800">Lista e Kamionëve</h3>
                      <button onClick={() => { setModalType('truck'); setShowModal(true); }} className="bg-blue-600 text-white flex items-center gap-2 px-5 py-2.5 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all font-medium text-sm">
                        <Plus size={18} />Shto Kamion
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredTrucks.map(t => (
                        <div key={t.id} className={`bg-white border ${t.status === 'BUSY' ? 'border-red-200' : 'border-gray-100'} rounded-xl overflow-hidden hover:shadow-xl transition-all group relative`}>
                          <div className={`h-2 bg-gradient-to-r ${t.status === 'BUSY' ? 'from-red-500 to-orange-500' : 'from-blue-500 to-indigo-600'}`}></div>
                          <div className="p-5">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl ${t.status === 'BUSY' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}><Truck size={24}/></div>
                                <button onClick={() => handleDeleteTruck(t.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                            </div>
                            
                            <h4 className="text-2xl font-bold text-slate-800 mb-1 tracking-tight">{t.plate}</h4>
                            <p className="text-sm text-slate-500 font-medium mb-4">{t.brand} {t.model} ({t.year})</p>
                            
                            <div className="space-y-2 bg-slate-50 p-3 rounded-lg text-xs text-slate-600">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">VIN:</span>
                                    <span className="font-mono font-bold">{t.chassis_number || '---'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">KM:</span>
                                    <span className="font-mono font-bold">{t.current_km ? parseInt(t.current_km).toLocaleString() : '---'}</span>
                                </div>
                            </div>
                            <div className="mt-4 flex justify-between items-center">
                                {getStatusBadge(t.status)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
              )}

              {activeFleetSubPage === 'trailers' && (
                  <Card className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-lg text-slate-800">Lista e Rimorkiove</h3>
                      <button onClick={() => { setModalType('trailer'); setShowModal(true); }} className="bg-blue-600 text-white flex items-center gap-2 px-5 py-2.5 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all font-medium text-sm">
                        <Plus size={18} />Shto Rimorkio
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredTrailers.map(t => (
                        <div key={t.id} className={`bg-white border ${t.status === 'BUSY' ? 'border-red-200' : 'border-gray-100'} rounded-xl overflow-hidden hover:shadow-xl transition-all group relative`}>
                          <div className={`h-2 bg-gradient-to-r ${t.status === 'BUSY' ? 'from-red-500 to-orange-500' : 'from-indigo-500 to-purple-600'}`}></div>
                          <div className="p-5">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl ${t.status === 'BUSY' ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}><Server size={24}/></div>
                                <button onClick={() => handleDeleteTrailer(t.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                            </div>
                            
                            <h4 className="text-2xl font-bold text-slate-800 mb-1 tracking-tight">{t.plate}</h4>
                            <p className="text-sm text-slate-500 font-medium mb-4">{t.model} ({t.type})</p>
                            
                            <div className="space-y-2 bg-slate-50 p-3 rounded-lg text-xs text-slate-600">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">VIN:</span>
                                    <span className="font-mono font-bold">{t.chassis_number || '---'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Kapaciteti:</span>
                                    <span className="font-mono font-bold">{t.capacity || '---'}</span>
                                </div>
                            </div>
                            <div className="mt-4 flex justify-between items-center">
                                {getStatusBadge(t.status)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
              )}
            </div>
          )}
        </div>
      </main>

      {/* --- MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className={`bg-white w-full ${selectedEntity ? 'max-w-4xl' : 'max-w-2xl'} rounded-2xl shadow-2xl animate-scale-in overflow-hidden flex flex-col max-h-[90vh]`}>
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
              <h3 className="text-xl font-bold text-slate-800">
                {selectedEntity?.type === 'client' && `Historiku: ${selectedEntity.data.name}`}
                {selectedEntity?.type === 'driver' && `Profili: ${selectedEntity.data.name}`}
                {selectedEntity?.type === 'order_details' && `Detajet e Urdhëresës: ${selectedEntity.data.order_number}`}
                {!selectedEntity && (
                   <>
                    {modalType === 'order' && 'Urdhëresë e Re'}
                    {modalType === 'client' && 'Regjistro Klient'}
                    {modalType === 'driver' && 'Regjistro Shofer'}
                    {modalType === 'truck' && 'Regjistro Kamion'}
                    {modalType === 'trailer' && 'Regjistro Rimorkio'}
                   </>
                )}
              </h3>
              <button onClick={() => { setShowModal(false); setSelectedEntity(null); }} className="p-2 text-slate-400 hover:bg-white hover:text-red-500 hover:shadow-md rounded-full transition-all"><X size={20}/></button>
            </div>
            
            {/* Modal Content - Scrollable */}
            <div className="p-8 overflow-y-auto flex-1">
                
                {/* --- ORDER DETAILS VIEW (ENHANCED WITH SPEDICION) --- */}
                {selectedEntity?.type === 'order_details' && (
                    <div className="space-y-8">
                        {/* HEADER: DATES & STATUS */}
                        <div className="flex justify-between items-start bg-blue-50 p-6 rounded-2xl border border-blue-100">
                            <div>
                                <p className="text-xs text-blue-400 uppercase font-bold tracking-wider mb-1">Urdhëresa</p>
                                <h1 className="text-3xl font-bold text-blue-700">{selectedEntity.data.order_number}</h1>
                                <div className="mt-2">{getStatusBadge(selectedEntity.data.status)}</div>
                            </div>
                            <div className="grid grid-cols-3 gap-8 text-right">
                                <div>
                                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider flex items-center justify-end gap-1"><Calendar size={12}/> Planifikuar</p>
                                    <p className="text-lg font-bold text-slate-700">{selectedEntity.data.loading_date}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider flex items-center justify-end gap-1"><Clock size={12}/> Filloi më</p>
                                    <p className={`text-lg font-bold ${selectedEntity.data.start_date ? 'text-blue-600' : 'text-slate-300'}`}>
                                        {selectedEntity.data.start_date || '--/--/----'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider flex items-center justify-end gap-1"><CheckCircle size={12}/> Përfundoi më</p>
                                    <p className={`text-lg font-bold ${selectedEntity.data.end_date ? 'text-emerald-600' : 'text-slate-300'}`}>
                                        {selectedEntity.data.end_date || '--/--/----'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            {/* CLIENT DETAILS */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-slate-400 uppercase flex items-center gap-2"><User size={16}/> Informacioni i Klientit</h4>
                                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-blue-300 transition-colors">
                                    <p className="font-bold text-lg text-slate-800">{selectedEntity.data.client.name}</p>
                                    <p className="text-slate-600 text-sm mt-1 mb-4">{selectedEntity.data.client.address}</p>
                                    
                                    <div className="space-y-3 pt-3 border-t border-gray-100">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500">Personi Kontaktues:</span>
                                            <span className="font-medium text-slate-700">{selectedEntity.data.client.contact_person}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500">Tel Kompania:</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-slate-700">{selectedEntity.data.client.phone}</span>
                                                <WhatsAppButton phone={selectedEntity.data.client.phone} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* SPEDICION INFO IN ORDER DETAILS */}
                                    {selectedEntity.data.client.spedicion_name && (
                                        <div className="mt-4 pt-4 border-t border-gray-100 bg-slate-50 -mx-5 -mb-5 p-5 rounded-b-xl">
                                            <p className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1"><Briefcase size={12}/> Spedicioni</p>
                                            <p className="font-bold text-slate-700">{selectedEntity.data.client.spedicion_name}</p>
                                            <div className="flex justify-between items-center mt-2 text-sm">
                                                <span className="text-slate-500">Tel:</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-slate-700">{selectedEntity.data.client.spedicion_phone || '--'}</span>
                                                    {selectedEntity.data.client.spedicion_phone && <WhatsAppButton phone={selectedEntity.data.client.spedicion_phone} />}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* TRANSPORT DETAILS */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-slate-400 uppercase flex items-center gap-2"><Truck size={16}/> Transporti</h4>
                                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-blue-300 transition-colors space-y-3">
                                    <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                                        <span className="text-slate-500 text-sm">Shoferi:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-800">{selectedEntity.data.driver.name}</span>
                                            <WhatsAppButton phone={selectedEntity.data.driver.phone} />
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-sm pt-1">
                                        <span className="text-slate-500">Kamioni:</span>
                                        <span className="font-bold text-slate-800 bg-gray-100 px-2 py-0.5 rounded">{selectedEntity.data.truck.plate}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Rimorkio:</span>
                                        <span className="font-bold text-slate-800 bg-gray-100 px-2 py-0.5 rounded">{selectedEntity.data.trailer.plate}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ROUTE VISUALIZATION */}
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5"><MapPin size={100} /></div>
                            <div className="grid grid-cols-3 gap-4 items-center relative z-10">
                                <div>
                                    <p className="text-xs font-bold text-blue-500 uppercase mb-1 flex items-center gap-1"><CheckCircle size={10}/> Nisja</p>
                                    <p className="text-xl font-bold text-slate-800">{selectedEntity.data.loading_address}</p>
                                </div>
                                <div className="flex flex-col items-center justify-center">
                                    <div className="w-full h-0.5 bg-slate-300 relative">
                                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-200 p-1.5 rounded-full">
                                            <ArrowRight size={16} className="text-slate-600"/>
                                        </div>
                                    </div>
                                    <p className="text-xs font-bold text-slate-500 mt-3 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">{selectedEntity.data.transport_type}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-red-500 uppercase mb-1 flex items-center justify-end gap-1">Destinacioni <MapPin size={10}/></p>
                                    <p className="text-xl font-bold text-slate-800">{selectedEntity.data.unloading_address}</p>
                                </div>
                            </div>
                        </div>

                        {/* GOODS & FINANCE */}
                        <div className="grid grid-cols-2 gap-8">
                             <div>
                                <h4 className="text-sm font-bold text-slate-400 uppercase mb-2">Përshkrimi i Mallit</h4>
                                <div className="bg-gray-50 p-4 rounded-xl text-slate-700 text-sm border border-gray-200 min-h-[80px]">
                                    {selectedEntity.data.goods_desc || 'Ska përshkrim'}
                                </div>
                             </div>
                             <div>
                                <h4 className="text-sm font-bold text-slate-400 uppercase mb-2 text-right">Financa</h4>
                                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex justify-between items-center shadow-sm">
                                    <span className="text-emerald-700 font-medium">Vlera Totale:</span>
                                    <span className="text-3xl font-bold text-emerald-700">{selectedEntity.data.price} €</span>
                                </div>
                             </div>
                        </div>
                    </div>
                )}

                {/* --- CLIENT HISTORY VIEW (Fixed Safeties) --- */}
                {selectedEntity?.type === 'client' && (
                    <div className="space-y-8">
                        {/* CLIENT DETAILS HEADER */}
                        <div className="grid grid-cols-2 gap-6">
                             {/* Left: Company */}
                             <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                                 <h4 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Building size={14}/> Kompania</h4>
                                 <div className="space-y-3">
                                     <div className="flex items-center gap-3">
                                         <div className="w-10 h-10 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold shadow-sm">{selectedEntity.data.name.charAt(0)}</div>
                                         <div>
                                             <p className="font-bold text-slate-800">{selectedEntity.data.name}</p>
                                             <p className="text-xs text-slate-500">{selectedEntity.data.address}</p>
                                         </div>
                                     </div>
                                     <div className="h-px bg-blue-200/50 my-2"></div>
                                     <div className="text-sm space-y-1">
                                         <p className="flex justify-between"><span className="text-slate-500">Kontakt:</span> <span className="font-medium">{selectedEntity.data.contact_person}</span></p>
                                         <p className="flex justify-between"><span className="text-slate-500">Email:</span> <span className="font-medium">{selectedEntity.data.email}</span></p>
                                         <div className="flex justify-between items-center pt-1">
                                             <span className="text-slate-500">Tel:</span> 
                                             <div className="flex gap-2">
                                                 <span className="font-medium">{selectedEntity.data.phone}</span>
                                                 <a href={`https://wa.me/${selectedEntity.data.phone.replace(/\D/g,'')}`} target="_blank" className="text-green-500 hover:scale-110 transition-transform"><MessageCircle size={16} fill="currentColor"/></a>
                                             </div>
                                         </div>
                                     </div>
                                 </div>
                             </div>

                             {/* Right: Spedicion */}
                             <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                                 <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Briefcase size={14}/> Spedicioni</h4>
                                 {selectedEntity.data.spedicion_name ? (
                                     <div className="space-y-3">
                                         <div>
                                             <p className="font-bold text-slate-800">{selectedEntity.data.spedicion_name}</p>
                                             <p className="text-xs text-slate-500">Ndërmjetësues Logjistik</p>
                                         </div>
                                         <div className="h-px bg-slate-200 my-2"></div>
                                         <div className="text-sm space-y-1">
                                             <p className="flex justify-between"><span className="text-slate-500">Email:</span> <span className="font-medium">{selectedEntity.data.spedicion_email || '--'}</span></p>
                                             <div className="flex justify-between items-center pt-1">
                                                 <span className="text-slate-500">Tel:</span> 
                                                 <div className="flex gap-2">
                                                     <span className="font-medium">{selectedEntity.data.spedicion_phone || '--'}</span>
                                                     {selectedEntity.data.spedicion_phone && <WhatsAppButton phone={selectedEntity.data.spedicion_phone} />}
                                                 </div>
                                             </div>
                                         </div>
                                     </div>
                                 ) : (
                                     <div className="h-full flex items-center justify-center text-slate-400 italic text-sm">
                                         Nuk ka të dhëna për spedicionin
                                     </div>
                                 )}
                             </div>
                        </div>

                        {/* STATS ROW */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase">Total Dërgesa</p>
                                    <p className="text-2xl font-bold text-slate-800">{getClientHistory(selectedEntity.data.id).length}</p>
                                </div>
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Package size={20}/></div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase">Të Përfunduara</p>
                                    <p className="text-2xl font-bold text-emerald-600">{getClientHistory(selectedEntity.data.id).filter(o => o.status === 'PERFUNDOI').length}</p>
                                </div>
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle size={20}/></div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase">Totali i Faturuar</p>
                                    <p className="text-2xl font-bold text-purple-600">{getClientHistory(selectedEntity.data.id).reduce((sum, o) => sum + (o.price || 0), 0)} €</p>
                                </div>
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><Euro size={20}/></div>
                            </div>
                        </div>

                        {/* HISTORY FILTERS & TABLE */}
                        <div>
                            <div className="flex justify-between items-end mb-3">
                                <h4 className="font-bold text-slate-700 flex items-center gap-2"><History size={18}/> Historiku i Dërgesave</h4>
                                <div className="flex gap-2 items-center bg-gray-50 p-1.5 rounded-lg border border-gray-200">
                                    <Filter size={14} className="text-slate-400 ml-1"/>
                                    <input 
                                        type="date" 
                                        value={historyStartDate}
                                        onChange={(e) => setHistoryStartDate(e.target.value)}
                                        className="text-xs bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                                        title="Nga data"
                                    />
                                    <span className="text-slate-400">-</span>
                                    <input 
                                        type="date" 
                                        value={historyEndDate}
                                        onChange={(e) => setHistoryEndDate(e.target.value)}
                                        className="text-xs bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                                        title="Deri më datë"
                                    />
                                    {(historyStartDate || historyEndDate) && (
                                        <button onClick={() => { setHistoryStartDate(''); setHistoryEndDate(''); }} className="text-xs text-red-500 hover:text-red-700 font-medium px-1">X</button>
                                    )}
                                </div>
                            </div>
                            <div className="overflow-hidden rounded-xl border border-gray-200 max-h-[300px] overflow-y-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-xs uppercase text-slate-500 font-bold sticky top-0 z-10">
                                        <tr>
                                            <th className="px-4 py-3 bg-gray-50">Nr. Order</th>
                                            <th className="px-4 py-3 bg-gray-50">Data</th>
                                            <th className="px-4 py-3 bg-gray-50">Relacioni</th>
                                            <th className="px-4 py-3 bg-gray-50">Statusi</th>
                                            <th className="px-4 py-3 bg-gray-50 text-right">Çmimi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {getClientHistory(selectedEntity.data.id).length > 0 ? (
                                            getClientHistory(selectedEntity.data.id).map(o => (
                                                <tr key={o.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 font-medium text-blue-600">{o.order_number}</td>
                                                    <td className="px-4 py-3">{o.loading_date}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex flex-col text-xs">
                                                            <span className="font-medium">{o.loading_address ? o.loading_address.split(',')[0] : '---'}</span>
                                                            <span className="text-slate-400 pl-1">↓</span>
                                                            <span className="font-medium">{o.unloading_address ? o.unloading_address.split(',')[0] : '---'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">{getStatusBadge(o.status)}</td>
                                                    <td className="px-4 py-3 text-right font-bold text-slate-700">{o.price} €</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-400 italic">Asnjë dërgesë e gjetur për këtë periudhë.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- DRIVER HISTORY VIEW (Fixed Safeties) --- */}
                {selectedEntity?.type === 'driver' && (
                     <div className="space-y-6">
                        <div className="flex items-center gap-6 mb-6">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-4xl font-bold text-slate-400">
                                {selectedEntity.data.name.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">{selectedEntity.data.name}</h2>
                                <p className="text-slate-500 font-medium">Patenta: {selectedEntity.data.license_number}</p>
                                <div className="flex gap-4 mt-2">
                                     <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><User size={12}/> {selectedEntity.data.age} vjeç</span>
                                     <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Euro size={12}/> {selectedEntity.data.salary} / muaj</span>
                                </div>
                            </div>
                        </div>

                        {/* HISTORY FILTERS & TABLE */}
                        <div>
                            <div className="flex justify-between items-end mb-3">
                                <h4 className="font-bold text-slate-700 flex items-center gap-2"><History size={18}/> Historiku i Udhëtimeve</h4>
                                <div className="flex gap-2 items-center bg-gray-50 p-1.5 rounded-lg border border-gray-200">
                                    <Filter size={14} className="text-slate-400 ml-1"/>
                                    <input 
                                        type="date" 
                                        value={historyStartDate}
                                        onChange={(e) => setHistoryStartDate(e.target.value)}
                                        className="text-xs bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                                        title="Nga data"
                                    />
                                    <span className="text-slate-400">-</span>
                                    <input 
                                        type="date" 
                                        value={historyEndDate}
                                        onChange={(e) => setHistoryEndDate(e.target.value)}
                                        className="text-xs bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                                        title="Deri më datë"
                                    />
                                    {(historyStartDate || historyEndDate) && (
                                        <button onClick={() => { setHistoryStartDate(''); setHistoryEndDate(''); }} className="text-xs text-red-500 hover:text-red-700 font-medium px-1">X</button>
                                    )}
                                </div>
                            </div>
                            <div className="overflow-hidden rounded-xl border border-gray-200 max-h-[350px] overflow-y-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-xs uppercase text-slate-500 font-bold sticky top-0 z-10">
                                        <tr>
                                            <th className="px-4 py-3 bg-gray-50">Data</th>
                                            <th className="px-4 py-3 bg-gray-50">Klienti</th>
                                            <th className="px-4 py-3 bg-gray-50">Relacioni</th>
                                            <th className="px-4 py-3 bg-gray-50">Mallra</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {getDriverHistory(selectedEntity.data.id).length > 0 ? (
                                            getDriverHistory(selectedEntity.data.id).map(o => (
                                                <tr key={o.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-slate-500">{o.loading_date}</td>
                                                    <td className="px-4 py-3 font-medium text-slate-700">{o.client.name}</td>
                                                    <td className="px-4 py-3 text-xs">
                                                        {o.loading_address ? o.loading_address.split(',')[0] : '---'} -> {o.unloading_address ? o.unloading_address.split(',')[0] : '---'}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-500 italic truncate max-w-[150px]">{o.goods_desc || '---'}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan="4" className="px-4 py-8 text-center text-slate-400 italic">Asnjë udhëtim i gjetur për këtë periudhë.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- STANDARD FORMS --- */}
                {!selectedEntity && (
                    <form onSubmit={
                    modalType === 'order' ? handleAddOrder :
                    modalType === 'client' ? handleAddClient :
                    modalType === 'driver' ? handleAddDriver :
                    modalType === 'truck' ? handleAddTruck :
                    modalType === 'trailer' ? handleAddTrailer : undefined
                    } className="grid grid-cols-2 gap-6">
                        {/* Forms remain the same, just rendering logic */}
                    {modalType === 'order' && (
                        <>
                        <div className="col-span-2 grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Klienti</label>
                                <select required name="client_id" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all"><option value="">Zgjidh Klientin</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Shoferi</label>
                                <select required name="driver_id" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all"><option value="">Zgjidh Shoferin</option>{drivers.filter(d => d.status === 'AVAILABLE').map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
                            </div>
                        </div>
                        
                          <div className="col-span-2 grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Kamioni</label>
                                <select required name="truck_id" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all"><option value="">Zgjidh Kamionin</option>{trucks.filter(t => t.status === 'AVAILABLE').map(t => <option key={t.id} value={t.id}>{t.plate}</option>)}</select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Rimorkio</label>
                                <select required name="trailer_id" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all"><option value="">Zgjidh Rimorkion</option>{trailers.filter(t => t.status === 'AVAILABLE').map(t => <option key={t.id} value={t.id}>{t.plate}</option>)}</select>
                            </div>
                        </div>

                        <div className="col-span-2 grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Data e Ngarkimit</label>
                                <input required type="date" name="loading_date" className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"/>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Lloji i Transportit</label>
                                <select required name="transport_type" className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500">
                                    <option value="FTL">FTL (Kamion i Plotë)</option>
                                    <option value="LTL">LTL (Grupazh)</option>
                                </select>
                            </div>
                            <div className="col-span-2 space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Përshkrimi i Mallit</label>
                                <textarea required name="goods_desc" rows="2" placeholder="Shkruaj detajet e mallit..." className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"></textarea>
                            </div>
                        </div>

                        <div className="col-span-2 space-y-2">
                            <label className="text-xs font-bold text-blue-600 uppercase ml-1 flex items-center gap-1"><MapPin size={12}/> Adresa e Ngarkimit</label>
                            <div className="grid grid-cols-2 gap-4">
                                <select required name="loading_country" className="p-3 bg-slate-50 border border-slate-200 rounded-xl" onChange={(e) => setLoadingCountry(e.target.value)}><option value="">Zgjidh Shtetin</option>{Object.keys(locations).sort().map(c => <option key={c} value={c}>{c}</option>)}</select>
                                <select required name="loading_city" className="p-3 bg-slate-50 border border-slate-200 rounded-xl" disabled={!loadingCountry}><option value="">Zgjidh Qytetin</option>{loadingCountry && locations[loadingCountry].map(c => <option key={c} value={c}>{c}</option>)}</select>
                            </div>
                        </div>

                         <div className="col-span-2 space-y-2">
                            <label className="text-xs font-bold text-red-600 uppercase ml-1 flex items-center gap-1"><MapPin size={12}/> Adresa e Shkarkimit</label>
                            <div className="grid grid-cols-2 gap-4">
                                <select required name="unloading_country" className="p-3 bg-slate-50 border border-slate-200 rounded-xl" onChange={(e) => setUnloadingCountry(e.target.value)}><option value="">Zgjidh Shtetin</option>{Object.keys(locations).sort().map(c => <option key={c} value={c}>{c}</option>)}</select>
                                <select required name="unloading_city" className="p-3 bg-slate-50 border border-slate-200 rounded-xl" disabled={!unloadingCountry}><option value="">Zgjidh Qytetin</option>{unloadingCountry && locations[unloadingCountry].map(c => <option key={c} value={c}>{c}</option>)}</select>
                            </div>
                        </div>

                        <div className="col-span-2 space-y-1">
                            <label className="text-xs font-bold text-emerald-600 uppercase ml-1">Çmimi i Transportit</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">€</span>
                                <input required name="price" type="number" placeholder="0.00" className="w-full pl-8 pr-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl font-bold text-emerald-700"/>
                            </div>
                        </div>
                        </>
                    )}

                    {modalType === 'client' && (
                        <>
                        <div className="col-span-2 space-y-4">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <h4 className="text-sm font-bold text-blue-800 uppercase mb-3 flex items-center gap-2"><Building size={16}/> Të Dhënat e Kompanisë</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <input required name="name" placeholder="Emri i Kompanisë" className="col-span-2 p-3 bg-white border border-blue-200 rounded-xl"/>
                                    <input required name="contact_person" placeholder="Personi Kontaktues" className="p-3 bg-white border border-blue-200 rounded-xl"/>
                                    <PhoneInput required name="phone" placeholder="Nr. Tel (Kontaktuesi)"/>
                                    <input required name="email" type="email" placeholder="Email (Kontaktuesi)" className="col-span-2 p-3 bg-white border border-blue-200 rounded-xl"/>
                                    <input required name="address" placeholder="Adresa e plotë" className="col-span-2 p-3 bg-white border border-blue-200 rounded-xl"/>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <h4 className="text-sm font-bold text-slate-600 uppercase mb-3 flex items-center gap-2"><Briefcase size={16}/> Të Dhënat e Spedicionit</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <input name="spedicion_name" placeholder="Emri i Spedicionit" className="col-span-2 p-3 bg-white border border-slate-200 rounded-xl"/>
                                    <PhoneInput name="spedicion_phone" placeholder="Nr. Tel (Spedicioni)"/>
                                    <input name="spedicion_email" type="email" placeholder="Email (Spedicioni)" className="p-3 bg-white border border-slate-200 rounded-xl"/>
                                </div>
                            </div>
                        </div>
                        </>
                    )}

                    {modalType === 'driver' && (
                        <>
                        <input required name="name" placeholder="Emri dhe Mbiemri" className="col-span-2 p-3 bg-slate-50 border border-slate-200 rounded-xl"/>
                        <input required name="license_number" placeholder="Numri i Patentës" className="p-3 bg-slate-50 border border-slate-200 rounded-xl"/>
                        <PhoneInput required name="phone" placeholder="Numri i Telefonit"/>
                        <input required name="age" type="number" placeholder="Mosha" className="p-3 bg-slate-50 border border-slate-200 rounded-xl"/>
                        <input required name="salary" type="number" placeholder="Paga (€)" className="p-3 bg-slate-50 border border-slate-200 rounded-xl"/>
                        </>
                    )}

                    {modalType === 'truck' && (
                        <>
                        <input required name="plate" placeholder="Targa (AA 123 AA)" className="p-3 bg-slate-50 border border-slate-200 rounded-xl uppercase"/>
                        <input required name="chassis_number" placeholder="Numri i Shasisë (VIN)" className="p-3 bg-slate-50 border border-slate-200 rounded-xl uppercase"/>
                        <input required name="brand" placeholder="Marka (p.sh. Volvo)" className="p-3 bg-slate-50 border border-slate-200 rounded-xl"/>
                        <input required name="model" placeholder="Modeli (p.sh. FH16)" className="p-3 bg-slate-50 border border-slate-200 rounded-xl"/>
                        <input required name="year" type="number" placeholder="Viti i Prodhimit" className="p-3 bg-slate-50 border border-slate-200 rounded-xl"/>
                        <input required name="current_km" type="number" placeholder="KM Aktuale" className="p-3 bg-slate-50 border border-slate-200 rounded-xl"/>
                        </>
                    )}
                    
                    {modalType === 'trailer' && (
                        <>
                        <input required name="plate" placeholder="Targa (AA 001 R)" className="col-span-2 p-3 bg-slate-50 border border-slate-200 rounded-xl uppercase"/>
                        <input required name="chassis_number" placeholder="Numri i Shasisë (VIN)" className="col-span-2 p-3 bg-slate-50 border border-slate-200 rounded-xl uppercase"/>
                        <input required name="model" placeholder="Modeli (p.sh. Schmitz)" className="p-3 bg-slate-50 border border-slate-200 rounded-xl"/>
                        <input required name="type" placeholder="Lloji (p.sh. Frigo, Mushama)" className="p-3 bg-slate-50 border border-slate-200 rounded-xl"/>
                        <input required name="capacity" placeholder="Kapaciteti (p.sh. 24 ton)" className="col-span-2 p-3 bg-slate-50 border border-slate-200 rounded-xl"/>
                        </>
                    )}

                    <div className="col-span-2 pt-4 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white pb-2">
                        <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl text-slate-500 font-bold hover:bg-slate-50 transition-colors">Anulo</button>
                        <button type="submit" className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 hover:scale-105 transition-all">Ruaj</button>
                    </div>
                    </form>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ... (Missing ArrowRightCircle import, adding it to Lucide imports at top)
import { ArrowRightCircle } from 'lucide-react';

export default App;

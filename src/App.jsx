import React, { useState, useMemo } from 'react';
import { supabase } from './supabaseClient.js';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { 
  LayoutDashboard, Truck, Users, DollarSign, Plus, Search, X, LogOut, 
  ChevronRight, ChevronLeft, Download, MoreVertical, FileText, Bell, Settings, 
  TrendingUp, MapPin, Calendar, Activity, Package, CheckCircle, Briefcase, Server, User, Phone, Trash2, Mail, Building, History, ExternalLink, Euro, MessageCircle, ArrowRight, Filter, RefreshCw, Eye, XCircle, Clock, PieChart, Fuel, FileSpreadsheet, Pencil, Star, Ban
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

const Pagination = ({ totalItems, itemsPerPage, currentPage, setCurrentPage, setItemsPerPage }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (totalItems === 0) return null;

    const handlePrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);
    const handleNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

    // Generate page numbers logic (show around current page)
    const getPageNumbers = () => {
        const delta = 2;
        const range = [];
        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i);
        }

        if (currentPage - delta > 2) range.unshift("...");
        if (currentPage + delta < totalPages - 1) range.push("...");

        range.unshift(1);
        if (totalPages !== 1) range.push(totalPages);

        return range;
    };

    return (
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-6 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-slate-500">Totali: <span className="text-slate-800">{totalItems}</span> rreshta</span>
                <span className="text-sm font-bold text-slate-400">|</span>
                <span className="text-sm font-bold text-slate-500">Faqja: <span className="text-slate-800">{currentPage}</span> / {totalPages}</span>
            </div>
            
            <div className="flex items-center gap-2">
                 <button 
                    onClick={handlePrev} 
                    disabled={currentPage === 1}
                    className={`p-2 rounded-xl transition-all ${currentPage === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'}`}
                >
                    <ChevronLeft size={20} />
                </button>

                <div className="flex gap-1">
                    {getPageNumbers().map((page, index) => (
                        page === "..." ? (
                            <span key={index} className="px-3 py-2 text-slate-400 text-xs">...</span>
                        ) : (
                            <button
                                key={index}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currentPage === page ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                {page}
                            </button>
                        )
                    ))}
                </div>

                <button 
                    onClick={handleNext} 
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-xl transition-all ${currentPage === totalPages ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'}`}
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Shfaq:</span>
                <select 
                    value={itemsPerPage} 
                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-2"
                >
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>
            </div>
        </div>
    );
};


const Sidebar = ({ activePage, setActivePage }) => (
  <aside className="w-72 bg-[#0F172A] text-white flex flex-col flex-shrink-0 transition-all duration-300 shadow-2xl z-20">
    <div className="h-28 flex items-center px-8 border-b border-slate-800/50">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Truck className="text-white" size={28} />
        </div>
        <div>
          <h1 className="font-bold text-xl tracking-wide text-white">LENITA</h1>
          <span className="text-[10px] text-slate-400 tracking-[0.3em] uppercase font-bold">Logistics</span>
        </div>
      </div>
    </div>
    <div className="px-6 py-8">
      <p className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-widest px-2">Menu Kryesore</p>
      <nav className="space-y-3">
        <SidebarButton icon={<LayoutDashboard size={20} />} label="Pasqyra" page="dashboard" activePage={activePage} onClick={() => setActivePage('dashboard')} />
        <SidebarButton icon={<Truck size={20} />} label="Dërgesat" page="transport" activePage={activePage} onClick={() => setActivePage('transport')} />
        <SidebarButton icon={<Users size={20} />} label="Shoferët & Klientët" page="drivers" activePage={activePage} onClick={() => setActivePage('drivers')} />
        <SidebarButton icon={<Server size={20} />} label="Mjetet (Flota)" page="fleet" activePage={activePage} onClick={() => setActivePage('fleet')} />
        <SidebarButton icon={<PieChart size={20} />} label="Analitika" page="finance" activePage={activePage} onClick={() => setActivePage('finance')} />
        <SidebarButton icon={<RefreshCw size={20} />} label="Arkiva" page="archive" activePage={activePage} onClick={() => setActivePage('archive')} />
      </nav>
    </div>
    <div className="mt-auto px-6 py-8 border-t border-slate-800/50">
      <p className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-widest px-2">Sistemi</p>
      <nav className="space-y-3">
        <SidebarButton icon={<Settings size={20} />} label="Cilësimet" page="settings" activePage={activePage} onClick={() => setActivePage('settings')} />
        <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all group font-medium">
          <LogOut size={20} className="group-hover:translate-x-1 transition-transform" /><span>Dilni</span>
        </button>
      </nav>
    </div>
  </aside>
);

const SidebarButton = ({ icon, label, page, activePage, onClick }) => {
  const isActive = activePage === page;
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden font-medium ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}>
      <span className={`relative z-10 flex items-center gap-3`}>{icon}{label}</span>
      {isActive && <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-100" />}
    </button>
  );
};

const Header = ({ title }) => (
  <header className="h-24 bg-white/90 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-10 sticky top-0 z-10 transition-all">
    <div><h1 className="font-bold text-3xl text-slate-800 tracking-tight">{title}</h1><p className="text-sm text-slate-500 mt-1 font-medium">Mirësevini përsëri, Administrator</p></div>
    <div className="flex items-center gap-6">
      <div className="relative hidden md:block group"><Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" /><input type="text" placeholder="Kërko..." className="w-80 pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all placeholder:text-slate-400 text-sm font-medium shadow-sm"/></div>
      <button className="relative p-3.5 rounded-2xl bg-white text-slate-600 hover:text-blue-600 hover:shadow-lg hover:shadow-blue-100 transition-all border border-gray-100"><Bell size={22} /><span className="absolute top-3 right-3.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span></button>
      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white font-bold shadow-xl cursor-pointer hover:scale-105 transition-transform text-sm border-2 border-white ring-2 ring-gray-100">LG</div>
    </div>
  </header>
);

const PhoneInput = ({ name, placeholder, required = false, defaultValue }) => {
  const [val, setVal] = useState(defaultValue || '');
  return (
    <div className="relative w-full group"><input name={name} required={required} placeholder={placeholder} onChange={(e) => setVal(e.target.value)} value={val} className="w-full p-3 pl-10 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"/><Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />{val && (<a href={`https://wa.me/${val.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#25D366] text-white p-1.5 rounded-lg hover:bg-[#128C7E] transition-all shadow-sm flex items-center gap-1" title="Hap në WhatsApp"><MessageCircle size={16} fill="white" /> <span className="text-[10px] font-bold pr-1">CHAT</span></a>)}</div>
  )
};

const WhatsAppButton = ({ phone }) => {
    if (!phone) return null;
    return (
        <a href={`https://wa.me/${phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5 bg-[#25D366]/10 text-[#25D366] px-3 py-1.5 rounded-lg hover:bg-[#25D366] hover:text-white transition-all font-bold text-xs border border-[#25D366]/20"><MessageCircle size={14} fill="currentColor" />WhatsApp</a>
    );
};

const StatCard = ({ title, value, trend, icon: Icon, color, trendUp, subtitle }) => (
  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-lg shadow-gray-100/50 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300 group">
    <div className="flex justify-between items-start mb-6">
      <div className={`p-4 rounded-2xl ${color} bg-opacity-10 group-hover:bg-opacity-20 transition-all`}><Icon size={26} className={color.replace('bg-', 'text-')} /></div>
      {trend && <span className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{trendUp ? <TrendingUp size={14} /> : <TrendingUp size={14} className="rotate-180" />}{trend}</span>}
    </div>
    <h3 className="text-slate-400 text-sm font-semibold mb-1 uppercase tracking-wide">{title}</h3>
    <p className="text-4xl font-bold text-slate-800">{value}</p>
    {subtitle && <p className="text-xs text-slate-400 mt-2 font-medium">{subtitle}</p>}
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
  const [finishingOrder, setFinishingOrder] = useState(null); 
  const [isEditing, setIsEditing] = useState(false); 

  // --- PAGINATION STATES ---
  const [itemsPerPage, setItemsPerPage] = useState(20); // Global or individual per tab
  const [orderPage, setOrderPage] = useState(1);
  const [clientPage, setClientPage] = useState(1);
  const [driverPage, setDriverPage] = useState(1);
  const [truckPage, setTruckPage] = useState(1);
  const [trailerPage, setTrailerPage] = useState(1);
  const [analyticsPage, setAnalyticsPage] = useState(1);

  // --- DATA ---
  const [clients, setClients] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [trailers, setTrailers] = useState([]);
  const [orders, setOrders] = useState([]);

  // Fetch all data from Supabase on initial load
  React.useEffect(() => {
    const fetchData = async () => {
      const { data: clientsData } = await supabase.from('clients').select('*').order('name', { ascending: true });
      const { data: driversData } = await supabase.from('drivers').select('*').order('name', { ascending: true });
      const { data: trucksData } = await supabase.from('trucks').select('*').order('plate', { ascending: true });
      const { data: trailersData } = await supabase.from('trailers').select('*').order('plate', { ascending: true });
      const { data: ordersData } = await supabase.from('orders').select('*').order('id', { ascending: false });

      if (clientsData) setClients(clientsData);
      if (driversData) setDrivers(driversData);
      if (trucksData) setTrucks(trucksData);
      if (trailersData) setTrailers(trailersData);
      if (ordersData) setOrders(ordersData);
    };

    fetchData();
  }, []);

  // --- FILTERS & ANALYTICS ---
  const [orderSearch, setOrderSearch] = useState('');
  const [analyticsSearch, setAnalyticsSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); 
  const [clientSearch, setClientSearch] = useState('');
  const [driverSearch, setDriverSearch] = useState('');
  const [fleetSearch, setFleetSearch] = useState('');
  const [archiveSearch, setArchiveSearch] = useState(''); // New state for archive search
  const [activeArchiveTab, setActiveArchiveTab] = useState('drivers'); // New state for archive tabs
  
  const [analyticsStartDate, setAnalyticsStartDate] = useState('');
  const [analyticsEndDate, setAnalyticsEndDate] = useState('');
  const [historyStartDate, setHistoryStartDate] = useState('');
  const [historyEndDate, setHistoryEndDate] = useState('');
  const [loadingCountry, setLoadingCountry] = useState('');
  const [unloadingCountry, setUnloadingCountry] = useState('');

  // --- HELPERS ---
  const updateResourceStatus = (driverId, truckId, trailerId, status) => {
      setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, status } : d));
      setTrucks(prev => prev.map(t => t.id === truckId ? { ...t, status } : t));
      setTrailers(prev => prev.map(t => t.id === trailerId ? { ...t, status } : t));
  };
  
  // ... (Mapping/Filtering Logic Same as Before) ...
  // FILTER ONLY ACTIVE ITEMS FOR MAIN LISTS
  const getMappedOrders = useMemo(() => orders.map(o => ({ ...o, client: clients.find(c => c.id === o.client_id) || { name: 'I panjohur (Arkivuar)', is_active: false }, driver: drivers.find(d => d.id === o.driver_id) || { name: 'I panjohur (Arkivuar)', is_active: false }, truck: trucks.find(t => t.id === o.truck_id) || { plate: '---', is_active: false }, trailer: trailers.find(t => t.id === o.trailer_id) || { plate: '---', is_active: false } })), [orders, clients, drivers, trucks, trailers]);
  const filteredOrders = useMemo(() => { let f = getMappedOrders.filter(o => o.order_number.toLowerCase().includes(orderSearch.toLowerCase()) || o.client.name.toLowerCase().includes(orderSearch.toLowerCase()) || o.driver.name.toLowerCase().includes(orderSearch.toLowerCase())); if (statusFilter !== 'ALL') f = f.filter(o => o.status === statusFilter); return f.sort((a, b) => b.id - a.id); }, [getMappedOrders, orderSearch, statusFilter]);
  
  const filteredClients = useMemo(() => clients.filter(c => c.is_active && c.name.toLowerCase().includes(clientSearch.toLowerCase())).sort((a, b) => a.name.localeCompare(b.name)), [clients, clientSearch]);
  const filteredDrivers = useMemo(() => drivers.filter(d => d.is_active && d.name.toLowerCase().includes(driverSearch.toLowerCase())).sort((a, b) => a.name.localeCompare(b.name)), [drivers, driverSearch]);
  const filteredTrucks = useMemo(() => trucks.filter(t => t.is_active && t.plate.toLowerCase().includes(fleetSearch.toLowerCase())).sort((a, b) => a.id - b.id), [trucks, fleetSearch]);
  const filteredTrailers = useMemo(() => trailers.filter(t => t.is_active && t.plate.toLowerCase().includes(fleetSearch.toLowerCase())).sort((a, b) => a.id - b.id), [trailers, fleetSearch]);

  // ARCHIVED LISTS
  const archivedClients = useMemo(() => clients.filter(c => !c.is_active && c.name.toLowerCase().includes(archiveSearch.toLowerCase())), [clients, archiveSearch]);
  const archivedDrivers = useMemo(() => drivers.filter(d => !d.is_active && d.name.toLowerCase().includes(archiveSearch.toLowerCase())), [drivers, archiveSearch]);
  const archivedTrucks = useMemo(() => trucks.filter(t => !t.is_active && t.plate.toLowerCase().includes(archiveSearch.toLowerCase())), [trucks, archiveSearch]);
  const archivedTrailers = useMemo(() => trailers.filter(t => !t.is_active && t.plate.toLowerCase().includes(archiveSearch.toLowerCase())), [trailers, archiveSearch]);

  // ANALYTICS DATA (Sorted by Newest)
  const analyticsData = useMemo(() => getMappedOrders.filter(o => 
      o.status === 'PERFUNDOI' && 
      (!analyticsStartDate || o.end_date >= analyticsStartDate) && 
      (!analyticsEndDate || o.end_date <= analyticsEndDate) &&
      (
        o.order_number.toLowerCase().includes(analyticsSearch.toLowerCase()) ||
        o.client.name.toLowerCase().includes(analyticsSearch.toLowerCase()) ||
        o.driver.name.toLowerCase().includes(analyticsSearch.toLowerCase()) ||
        (o.truck && o.truck.plate.toLowerCase().includes(analyticsSearch.toLowerCase()))
      )
  ).sort((a, b) => b.id - a.id), [getMappedOrders, analyticsStartDate, analyticsEndDate, analyticsSearch]);

  // FIXED HISTORY FUNCTIONS (Uses Mapped Orders + Date Filters)
  // Moved AFTER getMappedOrders to fix ReferenceError
  const getClientHistory = (clientId) => getMappedOrders.filter(o => String(o.client_id) === String(clientId) && (!historyStartDate || o.loading_date >= historyStartDate) && (!historyEndDate || o.loading_date <= historyEndDate));
  const getDriverHistory = (driverId) => getMappedOrders.filter(o => String(o.driver_id) === String(driverId) && (!historyStartDate || o.loading_date >= historyStartDate) && (!historyEndDate || o.loading_date <= historyEndDate));
  const getTruckHistory = (truckId) => getMappedOrders.filter(o => String(o.truck_id) === String(truckId) && (!historyStartDate || o.loading_date >= historyStartDate) && (!historyEndDate || o.loading_date <= historyEndDate));
  const getTrailerHistory = (trailerId) => getMappedOrders.filter(o => String(o.trailer_id) === String(trailerId) && (!historyStartDate || o.loading_date >= historyStartDate) && (!historyEndDate || o.loading_date <= historyEndDate));

  // --- TOP CALCULATIONS ---
  // Moved here because it depends on getClientHistory/getDriverHistory
  const topClients = useMemo(() => {
      return [...clients].sort((a, b) => getClientHistory(b.id).length - getClientHistory(a.id).length).slice(0, 3);
  }, [clients, orders, getMappedOrders]); // Added getMappedOrders dependency
  const topDrivers = useMemo(() => {
      return [...drivers].sort((a, b) => getDriverHistory(b.id).length - getDriverHistory(a.id).length).slice(0, 3);
  }, [drivers, orders, getMappedOrders]);

  // --- EXPORT TO EXCEL ---
  const handleExportExcel = () => {
    const dataToExport = analyticsData.map(o => ({
      "Nr. Order": o.order_number,
      "Klienti": o.client.name,
      "Shoferi": o.driver.name,
      "Kamioni": o.truck?.plate || '-',
      "Rimorkio": o.trailer?.plate || '-',
      "Data Nisjes": o.start_date,
      "Data Perfundimit": o.end_date,
      "Nisja": o.loading_address,
      "Destinacioni": o.unloading_address,
      "KM Kosove": o.km_kosovo || 0,
      "KM Jashte": o.km_international || 0,
      "Total KM": o.total_km || 0,
      "Nafta (L)": o.skip_fuel ? "Nuk aplikohet" : (o.fuel_cost || 0).toFixed(2),
      "Vlera (€)": o.price
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Raporti");
    XLSX.writeFile(wb, "Lenita_Logistics_Raport.xlsx");
  };

  // --- CRUD/ACTION HANDLERS ---
  const handleStatusChange = async (orderId, newStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    if (!canAdvanceStatus(order.status, newStatus)) { alert('Kujdes! Statusi nuk mund të kthehet mbrapa ose të ndryshohet në mënyrë të parregullt.'); return; }
    
    if (newStatus === 'PERFUNDOI') {
      setFinishingOrder(order);
      setShowModal(true);
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const updates = { status: newStatus };
    if (newStatus === 'FILLOI' && !order.start_date) updates.start_date = today;

    const { data, error } = await supabase.from('orders').update(updates).eq('id', orderId).select();
    if (!error && data) {
      setOrders(prev => prev.map(o => o.id === data[0].id ? data[0] : o));
      // Update resource statuses in parallel
      const resourceUpdates = { status: newStatus === 'DESHTOI' ? 'AVAILABLE' : 'BUSY' };
      Promise.all([
        supabase.from('drivers').update(resourceUpdates).eq('id', order.driver_id),
        supabase.from('trucks').update(resourceUpdates).eq('id', order.truck_id),
        supabase.from('trailers').update(resourceUpdates).eq('id', order.trailer_id)
      ]).then(() => {
        // Optionally refetch or update local state for resources
      });
    }
  };
  
  const completeOrder = async (e) => {
    e.preventDefault();
    if (!finishingOrder) return;
    const formData = new FormData(e.target);
    const kmKosovo = parseFloat(formData.get('km_kosovo') || 0);
    const kmInternational = parseFloat(formData.get('km_international') || 0);
    const skipFuel = formData.get('skip_fuel') === 'on';
    const totalKm = kmKosovo + kmInternational;
    const fuelCost = skipFuel ? 0 : (totalKm * 0.38);
    const today = new Date().toISOString().split('T')[0];

    const orderUpdates = {
      status: 'PERFUNDOI',
      end_date: today,
      km_kosovo: kmKosovo,
      km_international: kmInternational,
      total_km: totalKm,
      fuel_cost: fuelCost,
      skip_fuel: skipFuel
    };

    const { data: updatedOrder, error } = await supabase.from('orders').update(orderUpdates).eq('id', finishingOrder.id).select();

    if (!error && updatedOrder) {
      setOrders(prev => prev.map(o => o.id === updatedOrder[0].id ? updatedOrder[0] : o));
      
      const resourceUpdates = { status: 'AVAILABLE' };
      if (finishingOrder.truck_id) {
          const truck = trucks.find(t => t.id === finishingOrder.truck_id);
          if (truck) {
            resourceUpdates.current_km = (parseFloat(truck.current_km) || 0) + totalKm;
          }
      }

      Promise.all([
        supabase.from('drivers').update({ status: 'AVAILABLE' }).eq('id', finishingOrder.driver_id),
        supabase.from('trucks').update(resourceUpdates).eq('id', finishingOrder.truck_id),
        supabase.from('trailers').update({ status: 'AVAILABLE' }).eq('id', finishingOrder.trailer_id)
      ]).then(() => {
        // Refetch trucks to get updated KM
         supabase.from('trucks').select('*').then(({data}) => setTrucks(data));
      });
    }
    setFinishingOrder(null);
    setShowModal(false);
  };

  const handleSubmitClient = async (e) => { e.preventDefault(); const formData = new FormData(e.target); const d = { name: formData.get('name'), contact_person: formData.get('contact_person'), phone: formData.get('phone'), email: formData.get('email'), address: formData.get('address'), spedicion_name: formData.get('spedicion_name'), spedicion_email: formData.get('spedicion_email'), spedicion_phone: formData.get('spedicion_phone') }; if (isEditing) { const { data } = await supabase.from('clients').update(d).eq('id', selectedEntity.data.id).select(); setClients(clients.map(c => c.id === data[0].id ? data[0] : c)); } else { const { data } = await supabase.from('clients').insert(d).select(); setClients([...clients, data[0]]); } setShowModal(false); };
  const handleSubmitDriver = async (e) => { e.preventDefault(); const formData = new FormData(e.target); const d = { name: formData.get('name'), license_number: formData.get('license_number'), phone: formData.get('phone'), age: formData.get('age'), salary: formData.get('salary') }; if (isEditing) { const { data } = await supabase.from('drivers').update(d).eq('id', selectedEntity.data.id).select(); setDrivers(drivers.map(x => x.id === data[0].id ? data[0] : x)); } else { const { data } = await supabase.from('drivers').insert(d).select(); setDrivers([...drivers, data[0]]); } setShowModal(false); };
  const handleSubmitTruck = async (e) => { e.preventDefault(); const formData = new FormData(e.target); const d = { plate: formData.get('plate'), brand: formData.get('brand'), model: formData.get('model'), chassis_number: formData.get('chassis_number'), current_km: formData.get('current_km'), year: formData.get('year') }; if (isEditing) { const { data } = await supabase.from('trucks').update(d).eq('id', selectedEntity.data.id).select(); setTrucks(trucks.map(x => x.id === data[0].id ? data[0] : x)); } else { const { data } = await supabase.from('trucks').insert(d).select(); setTrucks([...trucks, data[0]]); } setShowModal(false); };
  const handleSubmitTrailer = async (e) => { e.preventDefault(); const formData = new FormData(e.target); const d = { plate: formData.get('plate'), chassis_number: formData.get('chassis_number'), model: formData.get('model'), type: formData.get('type'), capacity: formData.get('capacity') }; if (isEditing) { const { data } = await supabase.from('trailers').update(d).eq('id', selectedEntity.data.id).select(); setTrailers(trailers.map(x => x.id === data[0].id ? data[0] : x)); } else { const { data } = await supabase.from('trailers').insert(d).select(); setTrailers([...trailers, data[0]]); } setShowModal(false); };
  const handleSubmitOrder = async (e) => { e.preventDefault(); const formData = new FormData(e.target); const loadAddr = `${formData.get('loading_city')}, ${formData.get('loading_country')}`; const unloadAddr = `${formData.get('unloading_city')}, ${formData.get('unloading_country')}`; const d = { client_id: parseInt(formData.get('client_id')), driver_id: parseInt(formData.get('driver_id')), truck_id: parseInt(formData.get('truck_id')), trailer_id: parseInt(formData.get('trailer_id')), transport_type: formData.get('transport_type'), goods_desc: formData.get('goods_desc'), loading_address: loadAddr, unloading_address: unloadAddr, loading_date: formData.get('loading_date'), price: parseFloat(formData.get('price')) }; if (isEditing) { const { data } = await supabase.from('orders').update(d).eq('id', selectedEntity.data.id).select(); setOrders(orders.map(o => o.id === data[0].id ? data[0] : o)); } else { const { data: allOrders } = await supabase.from('orders').select('id'); const nextId = allOrders.length + 1; const year = new Date().getFullYear(); d.order_number = `OD-${String(nextId).padStart(2, '0')}/${year}`; const { data } = await supabase.from('orders').insert(d).select(); setOrders([...orders, data[0]]); const resourceUpdates = { status: 'BUSY' }; Promise.all([ supabase.from('drivers').update(resourceUpdates).eq('id', d.driver_id), supabase.from('trucks').update(resourceUpdates).eq('id', d.truck_id), supabase.from('trailers').update(resourceUpdates).eq('id', d.trailer_id) ]); } setShowModal(false); };

  const handleArchiveClient = async (e, id) => { e.stopPropagation(); if (window.confirm('A jeni i sigurt?')) { const { data } = await supabase.from('clients').update({ is_active: false }).eq('id', id).select(); setClients(clients.map(c => c.id === data[0].id ? data[0] : c)); } };
  const handleArchiveDriver = async (e, id) => { e.stopPropagation(); if (window.confirm('A jeni i sigurt?')) { const { data } = await supabase.from('drivers').update({ is_active: false }).eq('id', id).select(); setDrivers(drivers.map(d => d.id === data[0].id ? data[0] : d)); } };
  const handleArchiveTruck = async (id) => { if (window.confirm('A jeni i sigurt?')) { const { data } = await supabase.from('trucks').update({ is_active: false }).eq('id', id).select(); setTrucks(trucks.map(t => t.id === data[0].id ? data[0] : t)); } };
  const handleArchiveTrailer = async (id) => { if (window.confirm('A jeni i sigurt?')) { const { data } = await supabase.from('trailers').update({ is_active: false }).eq('id', id).select(); setTrailers(trailers.map(t => t.id === data[0].id ? data[0] : t)); } };
  
  const handleRestore = async (id, type) => {
    if (window.confirm('A jeni i sigurt?')) {
      const tableName = `${type}s`;
      const { data } = await supabase.from(tableName).update({ is_active: true }).eq('id', id).select();
      if (data) {
        const setter = { clients: setClients, drivers: setDrivers, trucks: setTrucks, trailers: setTrailers }[type];
        const state = { clients, drivers, trucks, trailers }[type];
        setter(state.map(item => item.id === data[0].id ? data[0] : item));
      }
    }
  };

  const handleDeleteOrder = async (id) => { if(window.confirm('A jeni i sigurt?')) { const o = orders.find(x => x.id === id); if (o && o.status !== 'PERFUNDOI') { Promise.all([ supabase.from('drivers').update({status: 'AVAILABLE'}).eq('id', o.driver_id), supabase.from('trucks').update({status: 'AVAILABLE'}).eq('id', o.truck_id), supabase.from('trailers').update({status: 'AVAILABLE'}).eq('id', o.trailer_id) ]); } await supabase.from('orders').delete().eq('id', id); setOrders(orders.filter(x => x.id !== id)); } };
  const handleFailOrder = (id) => { if(window.confirm('Shëno si Dështuar?')) { handleStatusChange(id, 'DESHTOI'); } };

  // --- NEW UI HELPERS ---
  const getStatusBadge = (status) => {
    const s = { 'NË PRITJE': "bg-slate-100 text-slate-600", 'FILLOI': "bg-blue-100 text-blue-700", 'NGARKOI': "bg-amber-100 text-amber-700", 'SHKARKOI': "bg-purple-100 text-purple-700", 'PERFUNDOI': "bg-emerald-100 text-emerald-700", 'DESHTOI': "bg-red-100 text-red-700", 'AVAILABLE': "bg-emerald-100 text-emerald-700", 'BUSY': "bg-red-100 text-red-700" };
    return (<span className={`px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wide ${s[status]}`}>{status}</span>);
  };

  return (
    <div className="flex min-h-screen bg-[#F1F5F9] font-sans text-slate-600">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Header title={activePage === 'dashboard' ? 'Qendra e Kontrollit' : activePage === 'transport' ? 'Menaxhimi i Transportit' : activePage === 'drivers' ? 'Burimet Njerëzore & Klientët' : activePage === 'fleet' ? 'Menaxhimi i Flotës' : activePage === 'archive' ? 'Arkiva e Të Dhënave' : 'Analitika Financiare'} />
        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          
          {/* --- DASHBOARD REDESIGN --- */}
          {activePage === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <div className="col-span-2 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Truck size={150}/></div>
                    <h3 className="text-blue-100 text-sm font-bold uppercase tracking-widest mb-1">Statusi i Flotës</h3>
                    <div className="flex items-end gap-2 mb-6"><span className="text-5xl font-bold">{trucks.filter(t => t.status === 'BUSY').length}</span><span className="text-xl font-medium text-blue-200 mb-1">/ {trucks.length} në rrugë</span></div>
                    <div className="flex gap-4">
                        <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm"><p className="text-xs text-blue-100 mb-1">Kamionë të Lirë</p><p className="font-bold text-lg">{trucks.filter(t => t.status === 'AVAILABLE').length}</p></div>
                        <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm"><p className="text-xs text-blue-100 mb-1">Shoferë të Lirë</p><p className="font-bold text-lg">{drivers.filter(d => d.status === 'AVAILABLE').length}</p></div>
                    </div>
                 </div>
                 <StatCard title="Të Ardhurat (Muaj)" value="€42,500" trend="+12%" trendUp={true} icon={DollarSign} color="bg-emerald-500" />
                 <StatCard title="Porositë Totale" value={orders.length} trend="+5" trendUp={true} icon={Activity} color="bg-amber-500" />
              </div>

              {/* Status Breakdown Bar */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-lg shadow-gray-100/50 flex flex-wrap justify-between items-center gap-4">
                  <div className="flex items-center gap-3 pr-6 border-r border-gray-100"><div className="p-3 bg-slate-100 text-slate-600 rounded-xl"><Package size={20}/></div><div><p className="text-xs font-bold text-slate-400 uppercase">Në Pritje</p><p className="text-xl font-bold text-slate-800">{orders.filter(o => o.status === 'NË PRITJE').length}</p></div></div>
                  <div className="flex items-center gap-3 pr-6 border-r border-gray-100"><div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Truck size={20}/></div><div><p className="text-xs font-bold text-slate-400 uppercase">Filloi</p><p className="text-xl font-bold text-slate-800">{orders.filter(o => o.status === 'FILLOI').length}</p></div></div>
                  <div className="flex items-center gap-3 pr-6 border-r border-gray-100"><div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Package size={20}/></div><div><p className="text-xs font-bold text-slate-400 uppercase">Ngarkoi</p><p className="text-xl font-bold text-slate-800">{orders.filter(o => o.status === 'NGARKOI').length}</p></div></div>
                  <div className="flex items-center gap-3 pr-6 border-r border-gray-100"><div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><CheckCircle size={20}/></div><div><p className="text-xs font-bold text-slate-400 uppercase">Shkarkoi</p><p className="text-xl font-bold text-slate-800">{orders.filter(o => o.status === 'SHKARKOI').length}</p></div></div>
                  <div className="flex items-center gap-3"><div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle size={20}/></div><div><p className="text-xs font-bold text-slate-400 uppercase">Përfundoi</p><p className="text-xl font-bold text-slate-800">{orders.filter(o => o.status === 'PERFUNDOI').length}</p></div></div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 {/* Top Performers */}
                 <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 p-6">
                    <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2"><Star className="text-yellow-500" fill="currentColor"/> Top Klientët</h3>
                    <div className="space-y-4">
                        {topClients.map((c, i) => (
                            <div key={c.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                                <div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${i===0 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-200 text-slate-600'}`}>{i+1}</div><p className="font-bold text-slate-700 text-sm">{c.name}</p></div>
                                <span className="text-xs font-bold bg-white px-2 py-1 rounded-lg border border-slate-100">{getClientHistory(c.id).length} dërgesa</span>
                            </div>
                        ))}
                    </div>
                 </div>
                 <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 p-6">
                    <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2"><Star className="text-yellow-500" fill="currentColor"/> Top Shoferët</h3>
                    <div className="space-y-4">
                        {topDrivers.map((d, i) => (
                            <div key={d.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                                <div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${i===0 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-200 text-slate-600'}`}>{i+1}</div><p className="font-bold text-slate-700 text-sm">{d.name}</p></div>
                                <span className="text-xs font-bold bg-white px-2 py-1 rounded-lg border border-slate-100">{getDriverHistory(d.id).length} rrugë</span>
                            </div>
                        ))}
                    </div>
                 </div>
                 {/* Quick Actions */}
                 <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-900/20">
                     <h3 className="font-bold text-lg mb-6">Veprime të Shpejta</h3>
                     <div className="space-y-3">
                         <button onClick={() => { setModalType('order'); setIsEditing(false); setSelectedEntity(null); setShowModal(true); }} className="w-full flex items-center justify-between bg-slate-800 p-4 rounded-2xl hover:bg-slate-700 transition-colors group"><span>Shto Urdhëresë</span><div className="bg-blue-600 p-1 rounded-lg group-hover:scale-110 transition-transform"><Plus size={16}/></div></button>
                         <button onClick={() => { setModalType('driver'); setIsEditing(false); setSelectedEntity(null); setShowModal(true); }} className="w-full flex items-center justify-between bg-slate-800 p-4 rounded-2xl hover:bg-slate-700 transition-colors group"><span>Shto Shofer</span><div className="bg-blue-600 p-1 rounded-lg group-hover:scale-110 transition-transform"><Plus size={16}/></div></button>
                         <button onClick={() => { setModalType('client'); setIsEditing(false); setSelectedEntity(null); setShowModal(true); }} className="w-full flex items-center justify-between bg-slate-800 p-4 rounded-2xl hover:bg-slate-700 transition-colors group"><span>Shto Klient</span><div className="bg-blue-600 p-1 rounded-lg group-hover:scale-110 transition-transform"><Plus size={16}/></div></button>
                     </div>
                 </div>
              </div>
            </div>
          )}

          {/* --- ORDERS REDESIGN (Clean Table) --- */}
          {activePage === 'transport' && (
            <div className="animate-fade-in space-y-6">
                {/* ... (Tabs & Search) ... */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-2 mb-4 inline-flex"><button onClick={() => setActiveSubPage('order')} className={`px-8 py-3 rounded-2xl text-sm font-bold transition-all ${activeSubPage === 'order' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-gray-50'}`}>Urdhëresat</button><button onClick={() => setActiveSubPage('driver_sheet')} className={`px-8 py-3 rounded-2xl text-sm font-bold transition-all ${activeSubPage === 'driver_sheet' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-gray-50'}`}>Fletë Udhëtimet</button></div>
                {activeSubPage === 'order' && (
                  <>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between"><div className="text-xs font-bold text-slate-400 uppercase">Në Pritje</div><div className="text-xl font-bold text-slate-700">{orders.filter(o => o.status === 'NË PRITJE').length}</div></div>
                      <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm flex items-center justify-between"><div className="text-xs font-bold text-blue-400 uppercase">Filloi</div><div className="text-xl font-bold text-blue-600">{orders.filter(o => o.status === 'FILLOI').length}</div></div>
                      <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm flex items-center justify-between"><div className="text-xs font-bold text-amber-400 uppercase">Ngarkoi</div><div className="text-xl font-bold text-amber-600">{orders.filter(o => o.status === 'NGARKOI').length}</div></div>
                      <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-sm flex items-center justify-between"><div className="text-xs font-bold text-purple-400 uppercase">Shkarkoi</div><div className="text-xl font-bold text-purple-600">{orders.filter(o => o.status === 'SHKARKOI').length}</div></div>
                      <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm flex items-center justify-between"><div className="text-xs font-bold text-emerald-400 uppercase">Përfundoi</div><div className="text-xl font-bold text-emerald-600">{orders.filter(o => o.status === 'PERFUNDOI').length}</div></div>
                  </div>
                  <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-6"><div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto max-w-full">{['ALL', 'NË PRITJE', 'FILLOI', 'NGARKOI', 'SHKARKOI', 'PERFUNDOI', 'DESHTOI'].map(s => (<button key={s} onClick={() => setStatusFilter(s)} className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${statusFilter === s ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>{s === 'ALL' ? 'Të Gjitha' : s}</button>))}</div><div className="flex gap-4 w-full md:w-auto"><div className="relative flex-1 md:w-80"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="Kërko..." value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-blue-500 shadow-sm"/></div><button onClick={() => { setModalType('order'); setIsEditing(false); setSelectedEntity(null); setShowModal(true); }} className="bg-blue-600 text-white flex items-center gap-2 px-6 py-3 rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all font-bold text-sm"><Plus size={20} />Shto</button></div></div>
                  
                  {/* MODERN TABLE */}
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
                      <table className="w-full text-sm text-left">
                          <thead className="bg-slate-50/80 text-xs uppercase text-slate-500 font-bold border-b border-gray-100">
                              <tr><th className="px-6 py-4">ID</th><th className="px-6 py-4">Klienti</th><th className="px-6 py-4">Shoferi</th><th className="px-6 py-4">Relacioni</th><th className="px-6 py-4 text-center">Statusi</th><th className="px-6 py-4 text-right">Vlera</th><th className="px-6 py-4 text-center">Veprime</th></tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                              {filteredOrders.length > 0 ? filteredOrders.slice((orderPage - 1) * itemsPerPage, orderPage * itemsPerPage).map(o => (
                                  <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                                      <td className="px-6 py-4 font-bold text-blue-600">{o.order_number}</td>
                                      <td className="px-6 py-4 font-medium text-slate-700">{o.client.name}</td>
                                      <td className="px-6 py-4 text-slate-500">{o.driver.name}</td>
                                      <td className="px-6 py-4 text-xs text-slate-500">{(o.loading_address || '').split(',')[0]} <ArrowRight size={10} className="inline"/> {(o.unloading_address || '').split(',')[0]}</td>
                                      <td className="px-6 py-4 text-center">
                                          {o.status === 'PERFUNDOI' || o.status === 'DESHTOI' ? (
                                              getStatusBadge(o.status)
                                          ) : (
                                              <div className="flex items-center justify-center gap-2">
                                                  <div className="flex flex-col gap-1">
                                                      {getStatusBadge(o.status)}
                                                      <div className="flex gap-1 mt-1 justify-center">
                                                          {/* Butoni i Hapit Tjeter */}
                                                          <button 
                                                              onClick={() => handleStatusChange(o.id, STATUS_ORDER[STATUS_ORDER.indexOf(o.status) + 1])}
                                                              className="bg-blue-500 text-white p-1.5 rounded-lg hover:bg-blue-600 transition-colors text-[10px] font-bold flex items-center gap-1 shadow-sm"
                                                              title={`Kalo në: ${STATUS_ORDER[STATUS_ORDER.indexOf(o.status) + 1]}`}
                                                          >
                                                              <span>{STATUS_ORDER[STATUS_ORDER.indexOf(o.status) + 1]}</span>
                                                              <ChevronRight size={12} />
                                                          </button>
                                                          {/* Butoni Deshtoi */}
                                                          <button 
                                                              onClick={() => handleStatusChange(o.id, 'DESHTOI')}
                                                              className="bg-red-100 text-red-600 p-1.5 rounded-lg hover:bg-red-200 transition-colors border border-red-200"
                                                              title="Shëno si Dështuar"
                                                          >
                                                              <X size={12} />
                                                          </button>
                                                      </div>
                                                  </div>
                                              </div>
                                          )}
                                      </td>
                                      <td className="px-6 py-4 text-right font-bold text-slate-800">{o.price} €</td>
                                      <td className="px-6 py-4 text-center">
                                          <div className="flex items-center justify-center gap-2">
                                              <button onClick={() => { setSelectedEntity({ type: 'order_details', data: o }); setShowModal(true); }} className="text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 p-2 rounded-lg transition-colors"><Eye size={16}/></button>
                                              <button onClick={() => { setSelectedEntity({ type: 'order', data: o }); setModalType('order'); setIsEditing(true); setShowModal(true); }} className="text-slate-400 hover:text-amber-600 bg-slate-50 hover:bg-amber-50 p-2 rounded-lg transition-colors"><Pencil size={16}/></button>
                                              {o.status !== 'PERFUNDOI' && <button onClick={() => handleDeleteOrder(o.id)} className="text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2 size={16}/></button>}
                                          </div>
                                      </td>
                                  </tr>
                              )) : <tr><td colSpan="7" className="p-8 text-center text-slate-400">Asnjë dërgesë.</td></tr>}
                          </tbody>
                      </table>
                  </div>
                  <Pagination 
                      totalItems={filteredOrders.length}
                      itemsPerPage={itemsPerPage}
                      currentPage={orderPage}
                      setCurrentPage={setOrderPage}
                      setItemsPerPage={setItemsPerPage}
                  />
                  </>
                )}
            </div>
          )}

          {/* ... (Drivers & Fleet remain similar but ensure Fleet cards are clickable again) ... */}
          {activePage === 'fleet' && (
             <div className="animate-fade-in space-y-6">
                 {/* ... (Search Tabs - same) ... */}
                <div className="flex gap-4 justify-between items-center bg-white p-2 rounded-3xl border border-gray-100 shadow-sm"><div className="flex gap-2"><button onClick={() => setActiveFleetSubPage('trucks')} className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all ${activeFleetSubPage === 'trucks' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}><Truck size={18}/> Kamionët</button><button onClick={() => setActiveFleetSubPage('trailers')} className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all ${activeFleetSubPage === 'trailers' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}><Server size={18}/> Rimorkiot</button></div><div className="relative mr-2"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="Kërko mjetin..." value={fleetSearch} onChange={(e) => setFleetSearch(e.target.value)} className="pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 w-72 transition-all"/></div></div>
                 
                 {/* CLICKABLE FLEET CARDS */}
                 {activeFleetSubPage === 'trucks' && (
                  <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {filteredTrucks.slice((truckPage - 1) * itemsPerPage, truckPage * itemsPerPage).map(t => (
                        <div key={t.id} onClick={() => { setSelectedEntity({ type: 'truck', data: t }); setHistoryStartDate(''); setHistoryEndDate(''); setShowModal(true); }} className={`bg-white border rounded-3xl overflow-hidden shadow-xl shadow-gray-100/50 hover:-translate-y-2 transition-all duration-300 group relative ${t.status === 'BUSY' ? 'border-red-100' : 'border-gray-100'}`}>
                          <div className={`h-3 bg-gradient-to-r ${t.status === 'BUSY' ? 'from-red-500 to-orange-500' : 'from-blue-500 to-cyan-500'}`}></div>
                          <div className="p-6">
                            <div className="flex justify-between items-start mb-6"><div className={`p-4 rounded-2xl ${t.status === 'BUSY' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}><Truck size={28}/></div><div className="flex gap-2"><button onClick={(e) => { e.stopPropagation(); setSelectedEntity({ type: 'truck', data: t }); setIsEditing(true); setModalType('truck'); setShowModal(true); }} className="p-2 text-amber-300 hover:text-amber-600 transition-colors"><Pencil size={18}/></button><button onClick={(e) => { e.stopPropagation(); handleArchiveTruck(t.id); }} className="text-slate-300 hover:text-red-500 transition-colors"><XCircle size={18}/></button></div></div>
                            <h4 className="text-3xl font-bold text-slate-800 mb-1 tracking-tight">{t.plate}</h4><p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-6">{t.brand} {t.model} • {t.year}</p>
                            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl text-xs text-slate-600 mb-6 border border-slate-100"><div className="flex justify-between items-center"><span className="text-slate-400 font-bold uppercase">VIN</span><span className="font-mono font-bold bg-white px-2 py-1 rounded border border-slate-200">{t.chassis_number || '---'}</span></div><div className="flex justify-between items-center"><span className="text-slate-400 font-bold uppercase">KM</span><span className="font-mono font-bold text-slate-800">{t.current_km ? parseInt(t.current_km).toLocaleString() : '---'}</span></div></div>
                            <div className="flex justify-between items-center">{getStatusBadge(t.status)}</div>
                          </div>
                        </div>
                      ))}
                      <button onClick={() => { setModalType('truck'); setIsEditing(false); setSelectedEntity(null); setShowModal(true); }} className="border-3 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all min-h-[300px] gap-4 group"><div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors"><Plus size={32}/></div><span className="font-bold text-lg">Shto Kamion</span></button>
                  </div>
                  <Pagination 
                      totalItems={filteredTrucks.length}
                      itemsPerPage={itemsPerPage}
                      currentPage={truckPage}
                      setCurrentPage={setTruckPage}
                      setItemsPerPage={setItemsPerPage}
                  />
                  </>
                )}
                {/* ... (Trailers same pattern) ... */}
                {activeFleetSubPage === 'trailers' && (
                  <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {filteredTrailers.slice((trailerPage - 1) * itemsPerPage, trailerPage * itemsPerPage).map(t => (
                        <div key={t.id} onClick={() => { setSelectedEntity({ type: 'trailer', data: t }); setHistoryStartDate(''); setHistoryEndDate(''); setShowModal(true); }} className={`bg-white border rounded-3xl overflow-hidden shadow-xl shadow-gray-100/50 hover:-translate-y-2 transition-all duration-300 group relative ${t.status === 'BUSY' ? 'border-red-100' : 'border-gray-100'}`}>
                          <div className={`h-3 bg-gradient-to-r ${t.status === 'BUSY' ? 'from-red-500 to-orange-500' : 'from-indigo-500 to-purple-500'}`}></div>
                          <div className="p-6">
                            <div className="flex justify-between items-start mb-6"><div className={`p-4 rounded-2xl ${t.status === 'BUSY' ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}><Server size={28}/></div><div className="flex gap-2"><button onClick={(e) => { e.stopPropagation(); setSelectedEntity({ type: 'trailer', data: t }); setIsEditing(true); setModalType('trailer'); setShowModal(true); }} className="p-2 text-amber-300 hover:text-amber-600 transition-colors"><Pencil size={18}/></button><button onClick={(e) => { e.stopPropagation(); handleArchiveTrailer(t.id); }} className="text-slate-300 hover:text-red-500 transition-colors"><XCircle size={18}/></button></div></div>
                            <h4 className="text-3xl font-bold text-slate-800 mb-1 tracking-tight">{t.plate}</h4><p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-6">{t.model} ({t.type})</p>
                            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl text-xs text-slate-600 mb-6 border border-slate-100"><div className="flex justify-between items-center"><span className="text-slate-400 font-bold uppercase">VIN</span><span className="font-mono font-bold bg-white px-2 py-1 rounded border border-slate-200">{t.chassis_number || '---'}</span></div><div className="flex justify-between items-center"><span className="text-slate-400 font-bold uppercase">Kapaciteti:</span><span className="font-mono font-bold">{t.capacity || '---'}</span></div></div>
                            <div className="flex justify-between items-center">{getStatusBadge(t.status)}</div>
                          </div>
                        </div>
                      ))}
                      <button onClick={() => { setModalType('trailer'); setIsEditing(false); setSelectedEntity(null); setShowModal(true); }} className="border-3 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all min-h-[300px] gap-4 group"><div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-indigo-100 transition-colors"><Plus size={32}/></div><span className="font-bold text-lg">Shto Rimorkio</span></button>
                  </div>
                  <Pagination 
                      totalItems={filteredTrailers.length}
                      itemsPerPage={itemsPerPage}
                      currentPage={trailerPage}
                      setCurrentPage={setTrailerPage}
                      setItemsPerPage={setItemsPerPage}
                  />
                  </>
                )}
             </div>
          )}

          {/* DRIVERS & CLIENTS - Keeping same new design logic */}
           {activePage === 'drivers' && (<div className="animate-fade-in space-y-8"><div className="flex gap-4 justify-between items-center bg-white p-2 rounded-3xl border border-gray-100 shadow-sm"><div className="flex gap-2"><button onClick={() => setActiveDriverSubPage('drivers')} className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all ${activeDriverSubPage === 'drivers' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}><Users size={18}/> Shoferët</button><button onClick={() => setActiveDriverSubPage('clients')} className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all ${activeDriverSubPage === 'clients' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}><Briefcase size={18}/> Klientët</button></div><div className="relative mr-2"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder={activeDriverSubPage === 'drivers' ? "Kërko shofer..." : "Kërko klient..."} value={activeDriverSubPage === 'drivers' ? driverSearch : clientSearch} onChange={(e) => activeDriverSubPage === 'drivers' ? setDriverSearch(e.target.value) : setClientSearch(e.target.value)} className="pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 w-72 transition-all"/></div></div>{activeDriverSubPage === 'drivers' && (<><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{filteredDrivers.slice((driverPage - 1) * itemsPerPage, driverPage * itemsPerPage).map(d => (<div key={d.id} onClick={() => { setSelectedEntity({ type: 'driver', data: d }); setHistoryStartDate(''); setHistoryEndDate(''); setShowModal(true); }} className={`bg-white rounded-3xl p-6 shadow-xl shadow-gray-100/50 hover:-translate-y-2 transition-all duration-300 cursor-pointer group relative overflow-hidden border ${d.status === 'BUSY' ? 'border-red-100' : 'border-gray-100'}`}><div className={`absolute top-0 right-0 w-32 h-32 ${d.status === 'BUSY' ? 'bg-red-50' : 'bg-blue-50'} rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110`}></div><div className="relative z-10"><div className="flex justify-between items-start mb-6"><div className={`w-16 h-16 rounded-2xl ${d.status === 'BUSY' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'} flex items-center justify-center font-bold text-2xl shadow-inner`}>{d.name.charAt(0)}</div><div className="flex gap-2"><button onClick={(e) => { e.stopPropagation(); setSelectedEntity({ type: 'driver', data: d }); setIsEditing(true); setModalType('driver'); setShowModal(true); }} className="p-2.5 bg-amber-50 text-amber-500 rounded-xl hover:bg-amber-100 transition-colors"><Pencil size={18}/></button><button onClick={(e) => handleArchiveDriver(e, d.id)} className="p-2.5 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors"><XCircle size={18}/></button></div></div><h4 className="font-bold text-slate-800 text-xl mb-1">{d.name}</h4><p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">{d.license_number || 'NO LICENSE'}</p><div className="space-y-3"><div className="flex items-center justify-between text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100"><span className="flex items-center gap-2 font-medium"><User size={16} className="text-slate-400"/> Mosha</span><span className="font-bold text-slate-800">{d.age || '--'}</span></div><div className="flex items-center justify-between text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100"><span className="flex items-center gap-2 font-medium"><Euro size={16} className="text-slate-400"/> Paga</span><span className="font-bold text-emerald-600">{d.salary || '--'} €</span></div><div className="flex items-center justify-between text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100"><span className="flex items-center gap-2 font-medium"><Phone size={16} className="text-slate-400"/> Tel</span><WhatsAppButton phone={d.phone} /></div></div><div className="mt-6 pt-6 border-t border-gray-50 flex justify-between items-center"><span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Statusi Aktual</span>{getStatusBadge(d.status)}</div></div></div>))} <button onClick={() => { setModalType('driver'); setIsEditing(false); setShowModal(true); }} className="border-3 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all min-h-[350px] gap-4 group"><div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors"><Plus size={32}/></div><span className="font-bold text-lg">Shto Shofer të Ri</span></button></div><Pagination totalItems={filteredDrivers.length} itemsPerPage={itemsPerPage} currentPage={driverPage} setCurrentPage={setDriverPage} setItemsPerPage={setItemsPerPage}/></>)} {activeDriverSubPage === 'clients' && (<><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{filteredClients.slice((clientPage - 1) * itemsPerPage, clientPage * itemsPerPage).map(c => (<div key={c.id} onClick={() => { setSelectedEntity({ type: 'client', data: c }); setHistoryStartDate(''); setHistoryEndDate(''); setShowModal(true); }} className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-100/50 hover:-translate-y-2 transition-all duration-300 cursor-pointer group relative border border-gray-100"><div className="flex items-start justify-between mb-6"><div className="flex items-center gap-4"><div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl shadow-sm">{c.name.charAt(0)}</div><div><h4 className="font-bold text-slate-800 text-lg leading-tight">{c.name}</h4><p className="text-xs font-bold text-slate-400 mt-1">ID: #{c.id}</p></div></div><div className="flex gap-2"><button onClick={(e) => { e.stopPropagation(); setSelectedEntity({ type: 'client', data: c }); setIsEditing(true); setModalType('client'); setShowModal(true); }} className="p-2 bg-amber-50 text-amber-500 rounded-xl hover:bg-amber-100 transition-colors"><Pencil size={16}/></button><button onClick={(e) => handleArchiveClient(e, c.id)} className="p-2 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors"><XCircle size={16}/></button></div></div><div className="space-y-3 mb-6"><div className="flex items-center gap-3 text-sm text-slate-600 p-3 bg-slate-50 rounded-xl border border-slate-100"><User size={18} className="text-slate-400"/> <span className="font-medium">{c.contact_person}</span></div><div className="flex items-center gap-3 text-sm text-slate-600 p-3 bg-slate-50 rounded-xl border border-slate-100"><Mail size={18} className="text-slate-400"/> <span className="font-medium truncate">{c.email || '---'}</span></div><div className="flex items-center justify-between text-sm text-slate-600 p-3 bg-slate-50 rounded-xl border border-slate-100"><div className="flex items-center gap-3"><Phone size={18} className="text-slate-400"/> <span className="font-medium">{c.phone}</span></div><WhatsAppButton phone={c.phone} /></div></div><div className="flex items-center justify-between text-xs font-bold text-white bg-slate-800 p-3 rounded-xl group-hover:bg-blue-600 transition-colors shadow-lg shadow-slate-200"><span>Shiko Historikun</span><ChevronRight size={16} /></div></div>))} <button onClick={() => { setModalType('client'); setIsEditing(false); setShowModal(true); }} className="border-3 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all min-h-[300px] gap-4 group"><div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-indigo-100 transition-colors"><Plus size={32}/></div><span className="font-bold text-lg">Shto Klient të Ri</span></button></div><Pagination totalItems={filteredClients.length} itemsPerPage={itemsPerPage} currentPage={clientPage} setCurrentPage={setClientPage} setItemsPerPage={setItemsPerPage}/></>)}</div>)}

          {/* ... (Finance logic is good, same as dashboard logic) ... */}
          {activePage === 'finance' && (<div className="animate-fade-in space-y-6"><div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50"><div className="flex items-center gap-4"><div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><FileSpreadsheet size={28}/></div><div><h3 className="text-xl font-bold text-slate-800">Raporti i Analitikës</h3><p className="text-sm text-slate-500 font-medium">Shikoni performancën dhe kostot e transportit</p></div></div><div className="flex gap-2 items-center bg-slate-50 p-2 rounded-2xl border border-slate-200"><div className="relative mr-2"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="Kërko..." value={analyticsSearch} onChange={(e) => setAnalyticsSearch(e.target.value)} className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 w-48 transition-all"/></div><Filter size={18} className="text-slate-400 ml-2"/><input type="date" value={analyticsStartDate} onChange={(e) => setAnalyticsStartDate(e.target.value)} className="text-sm bg-transparent border-none focus:ring-0 text-slate-600 font-medium" title="Nga data"/><span className="text-slate-300 font-bold mx-2">|</span><input type="date" value={analyticsEndDate} onChange={(e) => setAnalyticsEndDate(e.target.value)} className="text-sm bg-transparent border-none focus:ring-0 text-slate-600 font-medium" title="Deri më datë"/>{(analyticsStartDate || analyticsEndDate) && (<button onClick={() => { setAnalyticsStartDate(''); setAnalyticsEndDate(''); }} className="text-sm text-red-500 hover:bg-red-50 px-3 py-1 rounded-lg font-bold ml-2 transition-colors">Pastro</button>)}<button onClick={handleExportExcel} className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors ml-2 shadow-lg shadow-emerald-500/20"><Download size={18}/> Export Excel</button></div></div><div className="grid grid-cols-2 md:grid-cols-4 gap-6"><StatCard title="Dërgesa të Mbyllura" value={analyticsData.length} trend="Total" trendUp={true} icon={CheckCircle} color="bg-blue-500" /><StatCard title="KM Totale" value={`${analyticsData.reduce((sum, o) => sum + (o.total_km || 0), 0).toLocaleString()} km`} trend="Distanca" trendUp={true} icon={MapPin} color="bg-indigo-500" /><StatCard title="Nafta (0.38)" value={`${analyticsData.reduce((sum, o) => sum + (o.fuel_cost || 0), 0).toFixed(2)} L`} trend="Shpenzime" trendUp={false} icon={Fuel} color="bg-amber-500" /><StatCard title="Të Ardhurat" value={`${analyticsData.reduce((sum, o) => sum + (o.price || 0), 0).toLocaleString()} €`} trend="Fitimi" trendUp={true} icon={Euro} color="bg-emerald-500" /></div><div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden p-2"><table className="w-full text-sm text-left"><thead className="bg-slate-50/50 text-xs uppercase text-slate-500 font-bold border-b border-gray-100"><tr><th className="px-6 py-5 rounded-tl-2xl">Nr. Order</th><th className="px-6 py-5">Periudha</th><th className="px-6 py-5">Shoferi</th><th className="px-6 py-5">Relacioni</th><th className="px-6 py-5 text-center">KM (KS/Int)</th><th className="px-6 py-5 text-right">Totali KM</th><th className="px-6 py-5 text-right">Nafta (0.38)</th><th className="px-6 py-5 rounded-tr-2xl text-center">Veprime</th></tr></thead><tbody className="divide-y divide-gray-50">{analyticsData.length > 0 ? (analyticsData.slice((analyticsPage - 1) * itemsPerPage, analyticsPage * itemsPerPage).map(o => (<tr key={o.id} className="hover:bg-slate-50 transition-colors"><td className="px-6 py-4 font-bold text-blue-600">{o.order_number}</td><td className="px-6 py-4 text-slate-500 text-xs">{o.start_date || '-'} <br/> {o.end_date || '-'}</td><td className="px-6 py-4 font-medium text-slate-700">{o.driver.name}</td><td className="px-6 py-4 text-xs text-slate-500">{(o.loading_address || '').split(',')[0]} <ArrowRight size={10} className="inline mx-1"/> {(o.unloading_address || '').split(',')[0]}</td><td className="px-6 py-4 text-center text-slate-600 text-xs"><span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{o.km_kosovo || 0}</span> / <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">{o.km_international || 0}</span></td><td className="px-6 py-4 text-right font-bold text-slate-800">{o.total_km || 0}</td><td className="px-6 py-4 text-right font-bold text-amber-600">{o.skip_fuel ? (<span className="text-slate-400 text-xs italic">Nuk aplikohet</span>) : (`${(o.fuel_cost || 0).toFixed(2)} L`)}</td><td className="px-6 py-4 text-center"><button onClick={() => { setFinishingOrder(o); setModalType(null); setSelectedEntity(null); setShowModal(true); }} className="p-2 bg-slate-100 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil size={16}/></button></td></tr>))) : (<tr><td colSpan="9" className="p-12 text-center text-slate-400 italic">Nuk ka të dhëna për këtë periudhë.</td></tr>)}</tbody></table></div><Pagination totalItems={analyticsData.length} itemsPerPage={itemsPerPage} currentPage={analyticsPage} setCurrentPage={setAnalyticsPage} setItemsPerPage={setItemsPerPage}/></div>)}
          
          {/* ARCHIVE PAGE */}
          {activePage === 'archive' && (
             <div className="animate-fade-in space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-slate-50 text-slate-600 rounded-2xl"><RefreshCw size={28}/></div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">Arkiva e Të Dhënave</h3>
                            <p className="text-sm text-slate-500 font-medium">Menaxhoni dhe riktheni elementet e çaktivizuar</p>
                        </div>
                    </div>
                    <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                        {['drivers', 'clients', 'trucks', 'trailers'].map(tab => (
                            <button key={tab} onClick={() => setActiveArchiveTab(tab)} className={`px-4 py-2 text-sm font-bold rounded-xl capitalize transition-all ${activeArchiveTab === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                {tab === 'drivers' ? 'Shoferë' : tab === 'clients' ? 'Klientë' : tab === 'trucks' ? 'Kamionë' : 'Rimorkio'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 p-6">
                    <div className="mb-6 relative w-full md:w-96">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Kërko në arkivë..." value={archiveSearch} onChange={(e) => setArchiveSearch(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"/>
                    </div>
                    
                    {activeArchiveTab === 'drivers' && (
                        <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {archivedDrivers.map(d => (
                                <div key={d.id} className="border border-slate-200 rounded-2xl p-4 flex justify-between items-center bg-slate-50 opacity-75 hover:opacity-100 transition-opacity">
                                    <div><p className="font-bold text-slate-700">{d.name}</p><p className="text-xs text-slate-500 uppercase">{d.license_number}</p></div>
                                    <button onClick={() => handleRestore(d.id, 'driver')} className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-colors font-bold text-xs flex items-center gap-1"><RefreshCw size={14}/> Rikthe</button>
                                </div>
                            ))}
                        </div>
                        {archivedDrivers.length === 0 && <p className="text-slate-400 italic text-sm p-4 text-center">Asnjë shofer i arkivuar.</p>}
                        </>
                    )}
                     {activeArchiveTab === 'clients' && (
                        <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {archivedClients.map(c => (
                                <div key={c.id} className="border border-slate-200 rounded-2xl p-4 flex justify-between items-center bg-slate-50 opacity-75 hover:opacity-100 transition-opacity">
                                    <div><p className="font-bold text-slate-700">{c.name}</p><p className="text-xs text-slate-500">{c.contact_person}</p></div>
                                    <button onClick={() => handleRestore(c.id, 'client')} className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-colors font-bold text-xs flex items-center gap-1"><RefreshCw size={14}/> Rikthe</button>
                                </div>
                            ))}
                        </div>
                        {archivedClients.length === 0 && <p className="text-slate-400 italic text-sm p-4 text-center">Asnjë klient i arkivuar.</p>}
                        </>
                    )}
                    {activeArchiveTab === 'trucks' && (
                        <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {archivedTrucks.map(t => (
                                <div key={t.id} className="border border-slate-200 rounded-2xl p-4 flex justify-between items-center bg-slate-50 opacity-75 hover:opacity-100 transition-opacity">
                                    <div><p className="font-bold text-slate-700">{t.plate}</p><p className="text-xs text-slate-500 uppercase">{t.brand} {t.model}</p></div>
                                    <button onClick={() => handleRestore(t.id, 'truck')} className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-colors font-bold text-xs flex items-center gap-1"><RefreshCw size={14}/> Rikthe</button>
                                </div>
                            ))}
                        </div>
                        {archivedTrucks.length === 0 && <p className="text-slate-400 italic text-sm p-4 text-center">Asnjë kamion i arkivuar.</p>}
                        </>
                    )}
                    {activeArchiveTab === 'trailers' && (
                        <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {archivedTrailers.map(t => (
                                <div key={t.id} className="border border-slate-200 rounded-2xl p-4 flex justify-between items-center bg-slate-50 opacity-75 hover:opacity-100 transition-opacity">
                                    <div><p className="font-bold text-slate-700">{t.plate}</p><p className="text-xs text-slate-500 uppercase">{t.model} ({t.type})</p></div>
                                    <button onClick={() => handleRestore(t.id, 'trailer')} className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-colors font-bold text-xs flex items-center gap-1"><RefreshCw size={14}/> Rikthe</button>
                                </div>
                            ))}
                        </div>
                        {archivedTrailers.length === 0 && <p className="text-slate-400 italic text-sm p-4 text-center">Asnjë rimorkio e arkivuar.</p>}
                        </>
                    )}
                </div>
             </div>
          )}
        </div>
      </main>
      
      {/* --- MODAL (Kept same logic, just ensure it renders) --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/80 backdrop-blur-sm p-4">
          <div className={`bg-white w-full ${selectedEntity && !isEditing ? 'max-w-4xl' : 'max-w-2xl'} rounded-3xl shadow-2xl animate-scale-in overflow-hidden flex flex-col max-h-[90vh] border border-gray-200`}>
             {/* ... (Modal Header) ... */}
             <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
                {finishingOrder ? 'Raporti i Përfundimit' : (!isEditing && selectedEntity?.type === 'client' && `Historiku: ${selectedEntity.data.name}`)}
                {!finishingOrder && !isEditing && selectedEntity?.type === 'driver' && `Profili: ${selectedEntity.data.name}`}
                {!finishingOrder && !isEditing && selectedEntity?.type === 'order_details' && `Detajet: ${selectedEntity.data.order_number}`}
                {!finishingOrder && (!selectedEntity || isEditing) && (
                   <>
                    {modalType === 'order' && (isEditing ? 'Ndrysho Urdhëresën' : 'Urdhëresë e Re')}
                    {modalType === 'client' && (isEditing ? 'Ndrysho Klientin' : 'Regjistro Klient')}
                    {modalType === 'driver' && (isEditing ? 'Ndrysho Shoferin' : 'Regjistro Shofer')}
                    {modalType === 'truck' && (isEditing ? 'Ndrysho Kamionin' : 'Regjistro Kamion')}
                    {modalType === 'trailer' && (isEditing ? 'Ndrysho Rimorkion' : 'Regjistro Rimorkio')}
                   </>
                )}
              </h3>
              <div className="flex gap-2">
                  {!finishingOrder && !isEditing && selectedEntity && selectedEntity.type !== 'order_details' && (
                      <button onClick={() => { setIsEditing(true); setModalType(selectedEntity.type); }} className="bg-amber-100 text-amber-600 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-amber-200 transition-colors flex items-center gap-2 shadow-sm"><Pencil size={16}/> Ndrysho</button>
                  )}
                  <button onClick={() => { setShowModal(false); setSelectedEntity(null); setIsEditing(false); setFinishingOrder(null); }} className="p-2.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-xl transition-all"><X size={24}/></button>
              </div>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1">
                {/* ... (Detail Views Logic - Re-inserted to ensure functionality) ... */}
                {selectedEntity?.type === 'order_details' && !isEditing && (
                    <div className="space-y-8">
                       <div className="flex justify-between items-start bg-blue-50 p-8 rounded-3xl border border-blue-100 shadow-sm"><div><p className="text-xs text-blue-500 uppercase font-bold tracking-widest mb-2">Urdhëresa</p><h1 className="text-4xl font-black text-slate-800 tracking-tighter">{selectedEntity.data.order_number}</h1><div className="mt-4">{getStatusBadge(selectedEntity.data.status)}</div></div><div className="grid grid-cols-3 gap-12 text-right"><div><p className="text-xs text-slate-400 uppercase font-bold tracking-wider flex items-center justify-end gap-1 mb-1"><Calendar size={14}/> Planifikuar</p><p className="text-xl font-bold text-slate-700">{selectedEntity.data.loading_date}</p></div><div><p className="text-xs text-slate-400 uppercase font-bold tracking-wider flex items-center justify-end gap-1 mb-1"><Clock size={14}/> Filloi më</p><p className={`text-xl font-bold ${selectedEntity.data.start_date ? 'text-blue-600' : 'text-slate-300'}`}>{selectedEntity.data.start_date || '--/--/----'}</p></div><div><p className="text-xs text-slate-400 uppercase font-bold tracking-wider flex items-center justify-end gap-1 mb-1"><CheckCircle size={14}/> Përfundoi më</p><p className={`text-xl font-bold ${selectedEntity.data.end_date ? 'text-emerald-600' : 'text-slate-300'}`}>{selectedEntity.data.end_date || '--/--/----'}</p></div></div></div>
                        {selectedEntity.data.status === 'PERFUNDOI' && (<div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100 grid grid-cols-4 gap-6 text-center shadow-sm"><div><p className="text-xs font-bold text-emerald-600 uppercase mb-2">KM Brenda</p><p className="text-2xl font-black text-emerald-800">{selectedEntity.data.km_kosovo} km</p></div><div><p className="text-xs font-bold text-emerald-600 uppercase mb-2">KM Jashtë</p><p className="text-2xl font-black text-emerald-800">{selectedEntity.data.km_international} km</p></div><div><p className="text-xs font-bold text-emerald-600 uppercase mb-2">Total KM</p><p className="text-3xl font-black text-emerald-900">{selectedEntity.data.total_km} km</p></div><div><p className="text-xs font-bold text-emerald-600 uppercase flex items-center justify-center gap-1 mb-2"><Fuel size={14}/> Derivate (0.38)</p><p className="text-3xl font-black text-emerald-900">{selectedEntity.data.skip_fuel ? '---' : `${selectedEntity.data.fuel_cost?.toFixed(2)} L`}</p></div></div>)}
                        <div className="grid grid-cols-2 gap-8"><div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-lg shadow-gray-100/50"><h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><User/> Klienti</h4><p className="text-lg font-bold">{selectedEntity.data.client.name}</p><p className="text-slate-500">{selectedEntity.data.client.address}</p></div><div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-lg shadow-gray-100/50"><h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Truck/> Transporti</h4><p className="text-lg font-bold">{selectedEntity.data.driver.name}</p><p className="text-slate-500">{selectedEntity.data.truck.plate} • {selectedEntity.data.trailer.plate}</p></div></div>
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative overflow-hidden"><div className="absolute top-0 right-0 p-4 opacity-5"><MapPin size={100} /></div><div className="grid grid-cols-3 gap-4 items-center relative z-10"><div><p className="text-xs font-bold text-blue-500 uppercase mb-1 flex items-center gap-1"><CheckCircle size={10}/> Nisja</p><p className="text-xl font-bold text-slate-800">{selectedEntity.data.loading_address}</p></div><div className="flex flex-col items-center justify-center"><div className="w-full h-0.5 bg-slate-300 relative"><div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-200 p-1.5 rounded-full"><ArrowRight size={16} className="text-slate-600"/></div></div><p className="text-xs font-bold text-slate-500 mt-3 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">{selectedEntity.data.transport_type}</p></div><div className="text-right"><p className="text-xs font-bold text-red-500 uppercase mb-1 flex items-center justify-end gap-1">Destinacioni <MapPin size={10}/></p><p className="text-xl font-bold text-slate-800">{selectedEntity.data.unloading_address}</p></div></div></div>
                    </div>
                )}
                {selectedEntity?.type === 'driver' && (<div className="space-y-6"><div className="flex items-center gap-6 mb-6"><div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-4xl font-bold text-slate-400">{selectedEntity.data.name.charAt(0)}</div><div><h2 className="text-2xl font-bold text-slate-800">{selectedEntity.data.name}</h2><p className="text-slate-500 font-medium">Patenta: {selectedEntity.data.license_number}</p><div className="flex gap-4 mt-2"><span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><User size={12}/> {selectedEntity.data.age} vjeç</span><span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Euro size={12}/> {selectedEntity.data.salary} / muaj</span></div></div></div><div><div className="flex justify-between items-end mb-3"><h4 className="font-bold text-slate-700 flex items-center gap-2"><History size={18}/> Historiku i Udhëtimeve</h4><div className="flex gap-2 items-center bg-gray-50 p-1.5 rounded-lg border border-gray-200"><Filter size={14} className="text-slate-400 ml-1"/><input type="date" value={historyStartDate} onChange={(e) => setHistoryStartDate(e.target.value)} className="text-xs bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-blue-500" title="Nga data"/><span className="text-slate-400">-</span><input type="date" value={historyEndDate} onChange={(e) => setHistoryEndDate(e.target.value)} className="text-xs bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-blue-500" title="Deri më datë"/>{(historyStartDate || historyEndDate) && (<button onClick={() => { setHistoryStartDate(''); setHistoryEndDate(''); }} className="text-xs text-red-500 hover:text-red-700 font-medium px-1">X</button>)}</div></div><div className="overflow-hidden rounded-xl border border-gray-200 max-h-[350px] overflow-y-auto"><table className="w-full text-sm text-left"><thead className="bg-gray-50 text-xs uppercase text-slate-500 font-bold sticky top-0 z-10"><tr><th className="px-4 py-3 bg-gray-50">Data</th><th className="px-4 py-3 bg-gray-50">Klienti</th><th className="px-4 py-3 bg-gray-50">Relacioni</th><th className="px-4 py-3 bg-gray-50">Mallra</th></tr></thead><tbody className="divide-y divide-gray-100">{getDriverHistory(selectedEntity.data.id).length > 0 ? (getDriverHistory(selectedEntity.data.id).map(o => (<tr key={o.id} className="hover:bg-gray-50"><td className="px-4 py-3 text-slate-500">{o.loading_date}</td><td className="px-4 py-3 font-medium text-slate-700">{o.client.name}</td><td className="px-4 py-3 text-xs">{o.loading_address ? o.loading_address.split(',')[0] : '---'} -> {o.unloading_address ? o.unloading_address.split(',')[0] : '---'}</td><td className="px-4 py-3 text-slate-500 italic truncate max-w-[150px]">{o.goods_desc || '---'}</td></tr>))) : (<tr><td colSpan="4" className="px-4 py-8 text-center text-slate-400 italic">Asnjë udhëtim i gjetur për këtë periudhë.</td></tr>)}</tbody></table></div></div></div>)}
                {selectedEntity?.type === 'client' && (<div className="space-y-8"><div className="grid grid-cols-2 gap-6"><div className="bg-blue-50 p-5 rounded-2xl border border-blue-100"><h4 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Building size={14}/> Kompania</h4><div className="space-y-3"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold shadow-sm">{selectedEntity.data.name.charAt(0)}</div><div><p className="font-bold text-slate-800">{selectedEntity.data.name}</p><p className="text-xs text-slate-500">{selectedEntity.data.address}</p></div></div><div className="h-px bg-blue-200/50 my-2"></div><div className="text-sm space-y-1"><p className="flex justify-between"><span className="text-slate-500">Kontakt:</span> <span className="font-medium">{selectedEntity.data.contact_person}</span></p><p className="flex justify-between"><span className="text-slate-500">Email:</span> <span className="font-medium">{selectedEntity.data.email}</span></p><div className="flex justify-between items-center pt-1"><span className="text-slate-500">Tel:</span> <div className="flex gap-2"><span className="font-medium">{selectedEntity.data.phone}</span><WhatsAppButton phone={selectedEntity.data.phone} /></div></div></div></div></div><div className="bg-slate-50 p-5 rounded-2xl border border-slate-200"><h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Briefcase size={14}/> Spedicioni</h4>{selectedEntity.data.spedicion_name ? (<div className="space-y-3"><div><p className="font-bold text-slate-800">{selectedEntity.data.spedicion_name}</p><p className="text-xs text-slate-500">Ndërmjetësues Logjistik</p></div><div className="h-px bg-slate-200 my-2"></div><div className="text-sm space-y-1"><p className="flex justify-between"><span className="text-slate-500">Email:</span> <span className="font-medium">{selectedEntity.data.spedicion_email || '--'}</span></p><div className="flex justify-between items-center pt-1"><span className="text-slate-500">Tel:</span> <div className="flex gap-2"><span className="font-medium">{selectedEntity.data.spedicion_phone || '--'}</span>{selectedEntity.data.spedicion_phone && <WhatsAppButton phone={selectedEntity.data.spedicion_phone} />}</div></div></div></div>) : (<div className="h-full flex items-center justify-center text-slate-400 italic text-sm">Nuk ka të dhëna për spedicionin</div>)}</div></div><div className="grid grid-cols-3 gap-4"><div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between"><div><p className="text-xs text-slate-400 font-bold uppercase">Total Dërgesa</p><p className="text-2xl font-bold text-slate-800">{getClientHistory(selectedEntity.data.id).length}</p></div><div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Package size={20}/></div></div><div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between"><div><p className="text-xs text-slate-400 font-bold uppercase">Të Përfunduara</p><p className="text-2xl font-bold text-emerald-600">{getClientHistory(selectedEntity.data.id).filter(o => o.status === 'PERFUNDOI').length}</p></div><div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle size={20}/></div></div><div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between"><div><p className="text-xs text-slate-400 font-bold uppercase">Totali i Faturuar</p><p className="text-2xl font-bold text-purple-600">{getClientHistory(selectedEntity.data.id).reduce((sum, o) => sum + (o.price || 0), 0)} €</p></div><div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><Euro size={20}/></div></div></div><div><div className="flex justify-between items-end mb-3"><h4 className="font-bold text-slate-700 flex items-center gap-2"><History size={18}/> Historiku i Dërgesave</h4><div className="flex gap-2 items-center bg-gray-50 p-1.5 rounded-lg border border-gray-200"><Filter size={14} className="text-slate-400 ml-1"/><input type="date" value={historyStartDate} onChange={(e) => setHistoryStartDate(e.target.value)} className="text-xs bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-blue-500" title="Nga data"/><span className="text-slate-400">-</span><input type="date" value={historyEndDate} onChange={(e) => setHistoryEndDate(e.target.value)} className="text-xs bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-blue-500" title="Deri më datë"/>{(historyStartDate || historyEndDate) && (<button onClick={() => { setHistoryStartDate(''); setHistoryEndDate(''); }} className="text-xs text-red-500 hover:text-red-700 font-medium px-1">X</button>)}</div></div><div className="overflow-hidden rounded-xl border border-gray-200 max-h-[300px] overflow-y-auto"><table className="w-full text-sm text-left"><thead className="bg-gray-50 text-xs uppercase text-slate-500 font-bold sticky top-0 z-10"><tr><th className="px-4 py-3 bg-gray-50">Nr. Order</th><th className="px-4 py-3 bg-gray-50">Data</th><th className="px-4 py-3 bg-gray-50">Relacioni</th><th className="px-4 py-3 bg-gray-50">Statusi</th><th className="px-4 py-3 bg-gray-50 text-right">Çmimi</th></tr></thead><tbody className="divide-y divide-gray-100">{getClientHistory(selectedEntity.data.id).length > 0 ? (getClientHistory(selectedEntity.data.id).map(o => (<tr key={o.id} className="hover:bg-gray-50"><td className="px-4 py-3 font-medium text-blue-600">{o.order_number}</td><td className="px-4 py-3">{o.loading_date}</td><td className="px-4 py-3"><div className="flex flex-col text-xs"><span className="font-medium">{o.loading_address ? o.loading_address.split(',')[0] : '---'}</span><span className="text-slate-400 pl-1">↓</span><span className="font-medium">{o.unloading_address ? o.unloading_address.split(',')[0] : '---'}</span></div></td><td className="px-4 py-3">{getStatusBadge(o.status)}</td><td className="px-4 py-3 text-right font-bold text-slate-700">{o.price} €</td></tr>))) : (<tr><td colSpan="5" className="px-4 py-8 text-center text-slate-400 italic">Asnjë dërgesë e regjistruar për këtë klient.</td></tr>)}</tbody></table></div></div></div>)}
                {selectedEntity?.type === 'truck' && !isEditing && (<div className="space-y-6">
                    <div className="flex items-center gap-6 mb-6"><div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shadow-inner"><Truck size={48}/></div><div><h2 className="text-3xl font-black text-slate-800 tracking-tight">{selectedEntity.data.plate}</h2><p className="text-slate-500 font-bold uppercase tracking-wider">{selectedEntity.data.brand} {selectedEntity.data.model} • {selectedEntity.data.year}</p><span className="mt-2 inline-block bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-mono font-bold border border-slate-200">VIN: {selectedEntity.data.chassis_number || '---'}</span></div></div>
                    
                    {/* KM STATS GRID */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">KM Fillestare</p>
                            <p className="text-xl font-bold text-slate-700">
                                {((parseFloat(selectedEntity.data.current_km) || 0) - getTruckHistory(selectedEntity.data.id).reduce((sum, o) => sum + (o.total_km || 0), 0)).toLocaleString()} km
                            </p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                            <p className="text-xs font-bold text-blue-400 uppercase mb-1">Të Shtuara (Puna)</p>
                            <p className="text-xl font-bold text-blue-700">
                                +{getTruckHistory(selectedEntity.data.id).reduce((sum, o) => sum + (o.total_km || 0), 0).toLocaleString()} km
                            </p>
                        </div>
                        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 shadow-sm">
                            <p className="text-xs font-bold text-emerald-500 uppercase mb-1 flex items-center gap-1"><MapPin size={12}/> Totale Aktuale</p>
                            <p className="text-2xl font-black text-emerald-700">
                                {parseInt(selectedEntity.data.current_km).toLocaleString()} km
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"><h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><History size={18}/> Historiku i Rrugëve</h4><div className="overflow-hidden rounded-xl border border-gray-100"><table className="w-full text-sm text-left"><thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold"><tr><th className="px-4 py-3">Data</th><th className="px-4 py-3">Shoferi</th><th className="px-4 py-3">Relacioni</th><th className="px-4 py-3 text-right">KM</th></tr></thead><tbody className="divide-y divide-gray-50">{getTruckHistory(selectedEntity.data.id).length > 0 ? (getTruckHistory(selectedEntity.data.id).map(o => (<tr key={o.id} className="hover:bg-slate-50"><td className="px-4 py-3 text-slate-500 font-medium">{o.loading_date}</td><td className="px-4 py-3">{o.driver.name}</td><td className="px-4 py-3 text-xs text-slate-500">{(o.loading_address || '').split(',')[0]} -> {(o.unloading_address || '').split(',')[0]}</td><td className="px-4 py-3 text-right font-bold text-slate-700">{o.total_km ? `+${o.total_km}` : '-'}</td></tr>))) : (<tr><td colSpan="4" className="px-4 py-8 text-center text-slate-400 italic">Asnjë rrugë e regjistruar.</td></tr>)}</tbody></table></div></div></div>)}
                {selectedEntity?.type === 'trailer' && !isEditing && (<div className="space-y-6"><div className="flex items-center gap-6 mb-6"><div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center shadow-inner"><Server size={48}/></div><div><h2 className="text-3xl font-black text-slate-800 tracking-tight">{selectedEntity.data.plate}</h2><p className="text-slate-500 font-bold uppercase tracking-wider">{selectedEntity.data.model} • {selectedEntity.data.type}</p><div className="flex gap-3 mt-3"><span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-mono font-bold border border-slate-200">VIN: {selectedEntity.data.chassis_number || '---'}</span><span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-lg text-xs font-bold border border-purple-100">Kapaciteti: {selectedEntity.data.capacity || '---'}</span></div></div></div><div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"><h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><History size={18}/> Përdorimi në Rrugë</h4><div className="overflow-hidden rounded-xl border border-gray-100"><table className="w-full text-sm text-left"><thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold"><tr><th className="px-4 py-3">Data</th><th className="px-4 py-3">Kamioni</th><th className="px-4 py-3">Relacioni</th><th className="px-4 py-3 text-right">Statusi</th></tr></thead><tbody className="divide-y divide-gray-50">{getTrailerHistory(selectedEntity.data.id).length > 0 ? (getTrailerHistory(selectedEntity.data.id).map(o => (<tr key={o.id} className="hover:bg-slate-50"><td className="px-4 py-3 text-slate-500 font-medium">{o.loading_date}</td><td className="px-4 py-3">{o.truck?.plate || '---'}</td><td className="px-4 py-3 text-xs text-slate-500">{(o.loading_address || '').split(',')[0]} -> {(o.unloading_address || '').split(',')[0]}</td><td className="px-4 py-3 text-right">{getStatusBadge(o.status)}</td></tr>))) : (<tr><td colSpan="4" className="px-4 py-8 text-center text-slate-400 italic">Asnjë përdorim i regjistruar.</td></tr>)}</tbody></table></div></div></div>)}
                
                {/* --- FORMS --- */}
                {((!selectedEntity && !finishingOrder) || isEditing || (modalType && !selectedEntity)) && (
                    <form onSubmit={modalType === 'order' ? handleSubmitOrder : modalType === 'client' ? handleSubmitClient : modalType === 'driver' ? handleSubmitDriver : modalType === 'truck' ? handleSubmitTruck : modalType === 'trailer' ? handleSubmitTrailer : undefined} className="grid grid-cols-2 gap-6">
                        {modalType === 'order' && (<><div className="col-span-2 grid grid-cols-2 gap-4"><div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase ml-1">Klienti</label><select required name="client_id" defaultValue={isEditing ? selectedEntity.data.client_id : ''} className="w-full p-3.5 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"><option value="">Zgjidh Klientin</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div><div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase ml-1">Shoferi</label><select required name="driver_id" defaultValue={isEditing ? selectedEntity.data.driver_id : ''} className="w-full p-3.5 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"><option value="">Zgjidh Shoferin</option>{drivers.filter(d => d.status === 'AVAILABLE' || (isEditing && d.id === selectedEntity.data.driver_id)).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div></div><div className="col-span-2 grid grid-cols-2 gap-4"><div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase ml-1">Kamioni</label><select required name="truck_id" defaultValue={isEditing ? selectedEntity.data.truck_id : ''} className="w-full p-3.5 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"><option value="">Zgjidh Kamionin</option>{trucks.filter(t => t.status === 'AVAILABLE' || (isEditing && t.id === selectedEntity.data.truck_id)).map(t => <option key={t.id} value={t.id}>{t.plate}</option>)}</select></div><div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase ml-1">Rimorkio</label><select required name="trailer_id" defaultValue={isEditing ? selectedEntity.data.trailer_id : ''} className="w-full p-3.5 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"><option value="">Zgjidh Rimorkion</option>{trailers.filter(t => t.status === 'AVAILABLE' || (isEditing && t.id === selectedEntity.data.trailer_id)).map(t => <option key={t.id} value={t.id}>{t.plate}</option>)}</select></div></div><div className="col-span-2 grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100"><div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase ml-1">Data e Ngarkimit</label><input required type="date" name="loading_date" defaultValue={isEditing ? selectedEntity.data.loading_date : ''} className="w-full p-3.5 bg-white border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100"/></div><div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase ml-1">Lloji i Transportit</label><select required name="transport_type" defaultValue={isEditing ? selectedEntity.data.transport_type : 'FTL'} className="w-full p-3.5 bg-white border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100"><option value="FTL">FTL (Kamion i Plotë)</option><option value="LTL">LTL (Grupazh)</option></select></div><div className="col-span-2 space-y-1"><label className="text-xs font-bold text-slate-500 uppercase ml-1">Përshkrimi i Mallit</label><textarea required name="goods_desc" rows="2" defaultValue={isEditing ? selectedEntity.data.goods_desc : ''} placeholder="Shkruaj detajet e mallit..." className="w-full p-3.5 bg-white border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100"></textarea></div></div>{!isEditing && (<><div className="col-span-2 space-y-2"><label className="text-xs font-bold text-blue-600 uppercase ml-1 flex items-center gap-1"><MapPin size={12}/> Adresa e Ngarkimit</label><div className="grid grid-cols-2 gap-4"><select required name="loading_country" className="p-3.5 bg-slate-50 border-none rounded-2xl" onChange={(e) => setLoadingCountry(e.target.value)}><option value="">Zgjidh Shtetin</option>{Object.keys(locations).sort().map(c => <option key={c} value={c}>{c}</option>)}</select><select required name="loading_city" className="p-3.5 bg-slate-50 border-none rounded-2xl" disabled={!loadingCountry}><option value="">Zgjidh Qytetin</option>{loadingCountry && locations[loadingCountry].map(c => <option key={c} value={c}>{c}</option>)}</select></div></div><div className="col-span-2 space-y-2"><label className="text-xs font-bold text-red-600 uppercase ml-1 flex items-center gap-1"><MapPin size={12}/> Adresa e Shkarkimit</label><div className="grid grid-cols-2 gap-4"><select required name="unloading_country" className="p-3.5 bg-slate-50 border-none rounded-2xl" onChange={(e) => setUnloadingCountry(e.target.value)}><option value="">Zgjidh Shtetin</option>{Object.keys(locations).sort().map(c => <option key={c} value={c}>{c}</option>)}</select><select required name="unloading_city" className="p-3.5 bg-slate-50 border-none rounded-2xl" disabled={!unloadingCountry}><option value="">Zgjidh Qytetin</option>{unloadingCountry && locations[unloadingCountry].map(c => <option key={c} value={c}>{c}</option>)}</select></div></div></>)}{isEditing && (<div className="col-span-2 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-800"><p className="font-bold">Adresat aktuale:</p><p>Nisja: {selectedEntity.data.loading_address}</p><p>Destinacioni: {selectedEntity.data.unloading_address}</p><p className="mt-2 text-xs italic">Për t'i ndryshuar, fshijeni dhe krijoni një të re (për siguri).</p></div>)}<div className="col-span-2 space-y-1"><label className="text-xs font-bold text-emerald-600 uppercase ml-1">Çmimi i Transportit</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">€</span><input required name="price" type="number" defaultValue={isEditing ? selectedEntity.data.price : ''} placeholder="0.00" className="w-full pl-8 pr-4 py-3.5 bg-emerald-50 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-200 font-bold text-emerald-700"/></div></div></>)}
                        {modalType === 'client' && (<><div className="col-span-2 space-y-4"><div className="bg-blue-50 p-4 rounded-xl border border-blue-100"><h4 className="text-sm font-bold text-blue-800 uppercase mb-3 flex items-center gap-2"><Building size={16}/> Të Dhënat e Kompanisë</h4><div className="grid grid-cols-2 gap-4"><input required name="name" defaultValue={isEditing ? selectedEntity.data.name : ''} placeholder="Emri i Kompanisë *" className="col-span-2 p-3 bg-white border border-blue-200 rounded-xl"/><input required name="contact_person" defaultValue={isEditing ? selectedEntity.data.contact_person : ''} placeholder="Personi Kontaktues *" className="p-3 bg-white border border-blue-200 rounded-xl"/><PhoneInput required name="phone" defaultValue={isEditing ? selectedEntity.data.phone : ''} placeholder="Nr. Tel (Kontaktuesi) *"/><input name="email" type="email" defaultValue={isEditing ? selectedEntity.data.email : ''} placeholder="Email (Kontaktuesi)" className="col-span-2 p-3 bg-white border border-blue-200 rounded-xl"/><input required name="address" defaultValue={isEditing ? selectedEntity.data.address : ''} placeholder="Adresa e plotë *" className="col-span-2 p-3 bg-white border border-blue-200 rounded-xl"/></div></div><div className="bg-slate-50 p-4 rounded-xl border border-slate-200"><h4 className="text-sm font-bold text-slate-600 uppercase mb-3 flex items-center gap-2"><Briefcase size={16}/> Të Dhënat e Spedicionit (Opsionale)</h4><div className="grid grid-cols-2 gap-4"><input name="spedicion_name" defaultValue={isEditing ? selectedEntity.data.spedicion_name : ''} placeholder="Emri i Spedicionit" className="col-span-2 p-3 bg-white border border-slate-200 rounded-xl"/><PhoneInput name="spedicion_phone" defaultValue={isEditing ? selectedEntity.data.spedicion_phone : ''} placeholder="Nr. Tel (Spedicioni)"/><input name="spedicion_email" type="email" defaultValue={isEditing ? selectedEntity.data.spedicion_email : ''} placeholder="Email (Spedicioni)" className="p-3 bg-white border border-slate-200 rounded-xl"/></div></div></div></>)}
                        {modalType === 'driver' && (<><input required name="name" defaultValue={isEditing ? selectedEntity.data.name : ''} placeholder="Emri dhe Mbiemri *" className="col-span-2 p-3 bg-slate-50 border border-slate-200 rounded-xl"/><input required name="license_number" defaultValue={isEditing ? selectedEntity.data.license_number : ''} placeholder="Numri i Patentës *" className="p-3 bg-slate-50 border border-slate-200 rounded-xl"/><PhoneInput required name="phone" defaultValue={isEditing ? selectedEntity.data.phone : ''} placeholder="Numri i Telefonit *"/><input name="age" type="number" defaultValue={isEditing ? selectedEntity.data.age : ''} placeholder="Mosha" className="p-3 bg-slate-50 border border-slate-200 rounded-xl"/><input name="salary" type="number" defaultValue={isEditing ? selectedEntity.data.salary : ''} placeholder="Paga (€)" className="p-3 bg-slate-50 border border-slate-200 rounded-xl"/></>)}
                        {modalType === 'truck' && (<><input required name="plate" defaultValue={isEditing ? selectedEntity.data.plate : ''} placeholder="Targa (AA 123 AA) *" className="p-3 bg-slate-50 border border-slate-200 rounded-xl uppercase"/><input name="chassis_number" defaultValue={isEditing ? selectedEntity.data.chassis_number : ''} placeholder="Numri i Shasisë (VIN)" className="p-3 bg-slate-50 border border-slate-200 rounded-xl uppercase"/><input required name="brand" defaultValue={isEditing ? selectedEntity.data.brand : ''} placeholder="Marka (p.sh. Volvo) *" className="p-3 bg-slate-50 border border-slate-200 rounded-xl"/><input required name="model" defaultValue={isEditing ? selectedEntity.data.model : ''} placeholder="Modeli (p.sh. FH16) *" className="p-3 bg-slate-50 border border-slate-200 rounded-xl"/><input required name="year" type="number" defaultValue={isEditing ? selectedEntity.data.year : ''} placeholder="Viti i Prodhimit *" className="p-3 bg-slate-50 border border-slate-200 rounded-xl"/><input required name="current_km" type="number" defaultValue={isEditing ? selectedEntity.data.current_km : ''} placeholder="KM Aktuale *" className="p-3 bg-slate-50 border border-slate-200 rounded-xl"/></>)}
                        {modalType === 'trailer' && (<><input required name="plate" defaultValue={isEditing ? selectedEntity.data.plate : ''} placeholder="Targa (AA 001 R) *" className="col-span-2 p-3 bg-slate-50 border border-slate-200 rounded-xl uppercase"/><input name="chassis_number" defaultValue={isEditing ? selectedEntity.data.chassis_number : ''} placeholder="Numri i Shasisë (VIN)" className="col-span-2 p-3 bg-slate-50 border border-slate-200 rounded-xl uppercase"/><input required name="model" defaultValue={isEditing ? selectedEntity.data.model : ''} placeholder="Modeli (p.sh. Schmitz) *" className="p-3 bg-slate-50 border border-slate-200 rounded-xl"/><input required name="type" defaultValue={isEditing ? selectedEntity.data.type : ''} placeholder="Lloji (p.sh. Frigo, Mushama) *" className="p-3 bg-slate-50 border border-slate-200 rounded-xl"/><input required name="capacity" defaultValue={isEditing ? selectedEntity.data.capacity : ''} placeholder="Kapaciteti (p.sh. 24 ton) *" className="col-span-2 p-3 bg-slate-50 border border-slate-200 rounded-xl"/></>)}
                        <div className="col-span-2 pt-4 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white pb-2"><button type="button" onClick={() => setShowModal(false)} className="px-6 py-3.5 rounded-2xl text-slate-500 font-bold hover:bg-slate-50 transition-colors">Anulo</button><button type="submit" className="bg-blue-600 text-white font-bold px-8 py-3.5 rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-600/30 hover:scale-105 transition-all">{isEditing ? 'Përditëso' : 'Ruaj'}</button></div>
                    </form>
                )}

                {finishingOrder && (
                    <div className="space-y-6">
                        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex items-center gap-4"><div className="p-3 bg-amber-100 rounded-2xl text-amber-600"><Fuel size={24}/></div><div><h4 className="font-bold text-amber-800 text-lg">Raporti i Udhëtimit</h4><p className="text-sm text-amber-600">Plotësoni kilometrat për të llogaritur konsumin.</p></div></div>
                        <form onSubmit={completeOrder} className="space-y-4">
                            <div><label className="text-xs font-bold text-slate-500 uppercase ml-1">KM Brenda Kosovës</label><input required name="km_kosovo" type="number" defaultValue={finishingOrder.km_kosovo || ''} placeholder="0" className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 font-bold text-slate-800"/></div>
                            <div><label className="text-xs font-bold text-slate-500 uppercase ml-1">KM Jashtë Kosovës</label><input required name="km_international" type="number" defaultValue={finishingOrder.km_international || ''} placeholder="0" className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 font-bold text-slate-800"/></div>
                            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-2xl border border-red-100 cursor-pointer hover:bg-red-100 transition-colors">
                                <input type="checkbox" name="skip_fuel" id="skip_fuel" defaultChecked={finishingOrder.skip_fuel} className="w-5 h-5 text-red-600 rounded focus:ring-red-500 cursor-pointer"/>
                                <label htmlFor="skip_fuel" className="font-bold text-red-700 text-sm cursor-pointer select-none flex items-center gap-2"><Ban size={16}/> Mos llogarit derivate për këtë udhëtim</label>
                            </div>
                            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3"><button type="button" onClick={() => { setFinishingOrder(null); setShowModal(false); }} className="px-6 py-3.5 rounded-2xl text-slate-500 font-bold hover:bg-slate-50 transition-colors">Anulo</button><button type="submit" className="bg-emerald-600 text-white font-bold px-8 py-3.5 rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/30 hover:scale-105 transition-all">Ruaj Raportin</button></div>
                        </form>
                    </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

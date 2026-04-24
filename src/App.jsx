import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, addDoc, updateDoc, serverTimestamp, enableIndexedDbPersistence } from 'firebase/firestore';
import { Package, ShieldAlert, PlusCircle, MinusCircle, Tag, RotateCcw, Box, Check, X, Search, Activity, Hexagon, FileText, BookOpen, LogOut, Trash2, Edit, Settings, LayoutDashboard, MessageSquare, Wrench, ChevronDown, ExternalLink, Download, FileBarChart, Printer, AlertTriangle, Copy, FileSpreadsheet, WifiOff } from 'lucide-react';

// --- FIREBASE INITIALIZATION ---
const localConfig = {
  apiKey: "AIzaSyDrdjI6AzzHCOx7qd8wZbmFe4giEzH5dQw",
  authDomain: "stock-mpdn.firebaseapp.com",
  projectId: "stock-mpdn",
  storageBucket: "stock-mpdn.firebasestorage.app",
  messagingSenderId: "1001441693395",
  appId: "1:1001441693395:web:e64580079e04a97db30e26",
  measurementId: "G-K9XLMBMWYS"
};

const firebaseConfig = typeof window !== 'undefined' && window.__firebase_config ? JSON.parse(window.__firebase_config) : localConfig;
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// AKTIFKAN OFFLINE PERSISTENCE (Penyimpanan Cache Offline)
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn("Multiple tabs open, persistence can only be enabled in one tab at a a time.");
    } else if (err.code === 'unimplemented') {
      console.warn("The current browser does not support all of the features required to enable persistence");
    }
  });
} catch (e) {
  console.warn("Persistence try block failed", e);
}

const getAppId = () => (typeof window !== 'undefined' && window.__app_id) ? window.__app_id.split('/').join('-') : 'default-app-id';

const getDbCollection = (colName) => {
  return collection(db, 'artifacts', getAppId(), 'public', 'data', colName);
};

const getDbDoc = (colName, documentId) => {
  return doc(db, 'artifacts', getAppId(), 'public', 'data', colName, documentId);
};

// --- DATA MENU EXTERNAL & DOKUMEN ---
const EXT_LINKS = [
  { id: 'keluhan', label: 'Keluhan Pelanggan', url: 'https://mvi-pdn.github.io/Keluhan-Pelanggan/', icon: MessageSquare },
  { id: 'rakitan', label: 'Status Rakitan', url: 'https://mvi-pdn.github.io/Rakitan-MPDN/', icon: Wrench }
];

const DOC_LIST = [
  { id: 'pengembangan', label: 'Pengembangan', isGroup: true, items: [
    { id: 'peng-fco', label: 'FCO', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { id: 'peng-fci', label: 'FCI', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { id: 'peng-dci', label: 'DCI', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { id: 'peng-kiosk', label: 'KIOSK', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { id: 'peng-inverter', label: 'INVERTER', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { id: 'peng-brainstate', label: 'BRAINSTATE', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { id: 'peng-perfecto', label: 'Perfecto', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { id: 'peng-screenview', label: 'Screenview', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { id: 'peng-visionmu', label: 'VisionMu', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { id: 'peng-volks-blitz', label: 'Volks Blitz', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
  ]},
  { id: 'design-3d', label: 'Design 3D', isGroup: true, items: [
    { id: 'des-fco', label: 'FCO', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { id: 'des-fci', label: 'FCI', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { id: 'des-dci', label: 'DCI', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { id: 'des-kiosk', label: 'KIOSK', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { id: 'des-inverter', label: 'INVERTER', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { id: 'des-brainstate', label: 'BRAINSTATE', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { id: 'des-perfecto', label: 'Perfecto', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { id: 'des-screenview', label: 'Screenview', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { id: 'des-visionmu', label: 'VisionMu', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { id: 'des-volks-blitz', label: 'Volks Blitz', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
  ]},
  { id: 'sop', label: 'SOP (Standard Operating Procedure)', isGroup: true, items: [
    { id: 'sop-rakitan', label: 'SOP Rakitan', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { id: 'sop-fci', label: 'SOP FCI', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { id: 'sop-fco', label: 'SOP FCO', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { id: 'sop-dci', label: 'SOP DCI', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { id: 'sop-kiosk', label: 'SOP KIOSK', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { id: 'sop-monitor', label: 'SOP Monitor', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { id: 'sop-qc', label: 'SOP QC', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
  ]}
];

// --- KATALOG & SMART RULES ---
const LOKASI = ['MPDN Strada', 'MVI SMKN 26'];
const TARGET_ALOKASI = ['IVP', 'MLDS'];

// 💡 PANDUAN NAMBAH PRODUK BARU 💡
// Kalau lu mau nambah produk, cukup edit bagian CATALOG ini aja bree.
// Contoh: Kalo mau nambah Monitor LED merk "Samsung" ukuran "98 inch", 
// lu tinggal tambahin 'Samsung' di variants, dan '98"' di subVariants.
const CATALOG = {
  Monitor: {
    IFP: { variants: ['Philips', 'Newline', 'Microvision'], subVariants: ['65"', '75"', '86"'] },
    VDW: { variants: ['Microvision', 'Philips'], subVariants: { 'Microvision': ['4935', '5535', '5517', '5588'], 'Philips': ['49BDL2105X-ik', '55BDL2105X-ik'] } }
  },
  Kiosk: {
    KioskSlim: { variants: ['Kiosk Slim'], subVariants: ['-'] },
    KioskFAT: { variants: ['Kiosk FAT'], subVariants: ['-'] }
  },
  LED: {
    MVIDCI: { subVariants: ['P1.2', 'P1.5', 'P1.86', 'P2.0', 'P2.5'] },
    MVIFCI: { subVariants: ['P1.86', 'P2.5', 'P4.0'] },
    MVIFCIL: { subVariants: ['P1.86', 'P2.5', 'P4.0'] },
    MVIFCO: { subVariants: ['P4.0', 'P5.0', 'P6.0', 'P8.0', 'P10.0'] }
  }
};

const getAvailableRC = (type, subVarian) => {
  if (!type || !subVarian) return [];
  if (type === 'MVIDCI' && ['P1.2', 'P1.5', 'P1.86', 'P2.0'].includes(subVarian)) return ['MRV432', 'MRV532'];
  if ((type === 'MVIDCI' && subVarian === 'P2.5') || type === 'MVIFCI' || type === 'MVIFCIL' || type === 'MVIFCO') return ['MRV416', 'MRV416-N'];
  return [];
};

const VALID_PINS = ["admin123", "mpdn2026", "Kurnia123@#", "BosGudang99!", "Faqih123!", "Didi123!", "Ruben123!", "Aziz123!"];

// --- HELPER FUNCTION: VALIDASI SN ---
const validateProcessSNs = (inputSNsString, itemDb) => {
  if (!inputSNsString) return 0;
  // Pisahkan string berdasarkan koma atau spasi
  const inputSNs = inputSNsString.split(/[\s,]+/).map(s => s.trim()).filter(Boolean);
  if (inputSNs.length === 0) return 0;

  // Tarik semua SN yang pernah diinput di DB
  const validSNs = (itemDb.snList || []).map(s => s.rangeSN.toLowerCase());
  
  // Cari SN mana yang diketik admin tapi gak ada di DB
  const invalidSNs = inputSNs.filter(sn => !validSNs.includes(sn.toLowerCase()));
  
  if (invalidSNs.length > 0) {
    throw new Error(`GAGAL: SN tidak terdaftar di sistem! (${invalidSNs.join(', ')})`);
  }
  return inputSNs.length; // Mengembalikan jumlah SN (Qty)
};


// --- UI COMPONENTS ---
const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const timer = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(timer); }, []);
  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
       <span className="text-2xl sm:text-3xl font-bold text-amber-400 font-mono drop-shadow-[0_0_10px_rgba(251,191,36,0.6)] leading-none tracking-wider">{time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
    </div>
  );
};
const LiveDate = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const timer = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(timer); }, []);
  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
       <span className="text-sm sm:text-lg font-bold text-amber-400 font-mono drop-shadow-[0_0_10px_rgba(251,191,36,0.6)] leading-none tracking-wider">{time.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
    </div>
  );
};

const Panel = ({ children, title, className = "", headerClass="" }) => (
  <div className={`border border-[#30363d] bg-[#0d1117] flex flex-col rounded-lg overflow-hidden shadow-md ${className}`}>
    {title && <div className={`text-center font-bold text-white text-[11px] sm:text-xs py-2 border-b border-[#30363d] bg-[#161b22] uppercase tracking-widest ${headerClass}`}>{title}</div>}
    <div className="flex-1 flex flex-col p-2 sm:p-3 overflow-hidden">{children}</div>
  </div>
);

const GridCell = ({ label, value, valColor = "text-blue-400 bg-[#09090b]" }) => (
  <div className="flex flex-col border border-[#30363d] rounded-sm overflow-hidden">
    <div className="text-[9px] sm:text-[10px] text-center bg-[#161b22] text-slate-400 py-1 font-semibold uppercase tracking-wider">{label}</div>
    <div className={`flex-1 text-center font-mono text-[11px] sm:text-xs font-bold py-1.5 ${valColor}`}>{value}</div>
  </div>
);

const SectionTitle = ({ title }) => (
  <div className="text-[10px] sm:text-[11px] text-center text-slate-300 bg-[#161b22] py-1 font-bold uppercase tracking-wider mb-2 border border-[#30363d] rounded-sm shadow-sm">{title}</div>
);

export default function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminProfile, setAdminProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [inventory, setInventory] = useState([]);
  const [historyLog, setHistoryLog] = useState([]);
  const [notification, setNotification] = useState(null);
  
  // State deteksi koneksi internet
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  const [txType, setTxType] = useState('inbound');
  const [formData, setFormData] = useState({});
  
  // State untuk Loading / Submitting efek
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchSN, setSearchSN] = useState("");
  
  // State Edit SN Modal & Document Viewer
  const [editModal, setEditModal] = useState(null);
  const [isDocMenuOpen, setIsDocMenuOpen] = useState(false);
  const [isSopMenuOpen, setIsSopMenuOpen] = useState(false);
  const [isPengembanganOpen, setIsPengembanganOpen] = useState(false);
  const [isDesign3DMenuOpen, setIsDesign3DMenuOpen] = useState(false);
  const [activeDoc, setActiveDoc] = useState(null);

  // State Laporan Rakitan
  const [reportMonth, setReportMonth] = useState(new Date().getMonth());
  const [reportYear, setReportYear] = useState(new Date().getFullYear());

  useEffect(() => {
    // Listener koneksi internet
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const initAuth = async () => {
      try {
        if (typeof window !== 'undefined' && window.__initial_auth_token) {
          await signInWithCustomToken(auth, window.__initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) { console.error("Auth error:", err); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubInv = onSnapshot(getDbCollection('inventory'), (snapshot) => {
      setInventory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error("Data Listener Error:", err));
    
    const unsubHist = onSnapshot(getDbCollection('history'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => (b.timestamp?.toMillis() || 0) - (a.timestamp?.toMillis() || 0));
      setHistoryLog(data);
    }, (err) => console.error("History Listener Error:", err));
    
    return () => { unsubInv(); unsubHist(); };
  }, [user]);

  const showNotif = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const addHistory = async (action, details, qty = 0) => {
    try {
      await addDoc(getDbCollection('history'), {
        action, details, qty, user: isAdmin && adminProfile ? adminProfile.name : 'System', timestamp: serverTimestamp()
      });
    } catch (e) { console.error("Log error", e); }
  };

  const handleAdminToggle = () => {
    if (isAdmin) {
      setIsAdmin(false); setAdminProfile(null); 
      setActiveTab('dashboard'); 
      showNotif("Logout Berhasil", "info");
    } else {
      const pin = prompt("Masukkan PIN Admin:");
      if (pin && VALID_PINS.includes(pin)) {
        let extractedName = pin.replace(new RegExp('[^a-zA-Z]', 'g'), '');
        if (!extractedName) extractedName = "Admin";
        extractedName = extractedName.charAt(0).toUpperCase() + extractedName.slice(1).toLowerCase();
        setIsAdmin(true); 
        setAdminProfile({ name: extractedName, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${extractedName}&backgroundColor=0f0f11` });
        showNotif(`Welcome back, ${extractedName}`, "success");
      } else if (pin !== null) { showNotif("PIN Tidak Valid", "error"); }
    }
  };

  const handleCopyText = (text) => {
    if (!text || text === '-') return;
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      showNotif("SN berhasil disalin!", "info");
    } catch (err) {
      showNotif("Gagal menyalin", "error");
    }
    document.body.removeChild(textArea);
  };

  const getStok = (kat, tipe, varian, subVar, target = 'MPDN') => {
    const items = inventory.filter(i => i.kategori === kat && (tipe ? i.tipe === tipe : true) && (varian ? i.varian === varian : true) && (subVar ? i.subVarian === subVar : true));
    if (target === 'MPDN') return items.reduce((sum, i) => sum + (i.stokMPDN || 0), 0);
    if (target === 'IVP') return items.reduce((sum, i) => sum + (i.stokIVP || 0), 0);
    if (target === 'MLDS') return items.reduce((sum, i) => sum + (i.stokMLDS || 0), 0);
    if (target === 'NG') return items.reduce((sum, i) => sum + (i.stokNG || 0), 0);
    return 0;
  };

  const allSNLogs = useMemo(() => {
    let logs = [];
    inventory.forEach(item => {
      if (item.snList && Array.isArray(item.snList)) {
        item.snList.forEach(sn => {
          logs.push({
            ...sn,
            itemId: item.id,
            itemName: `${item.kategori} ${item.tipe !== '-' ? item.tipe : ''} ${item.subVarian}`
          });
        });
      }
    });
    return logs.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [inventory]);

  const filteredSNLogs = useMemo(() => {
    if (!searchSN) return allSNLogs;
    const lowerSearch = searchSN.toLowerCase();
    return allSNLogs.filter(sn => 
      (sn.rangeSN && sn.rangeSN.toLowerCase().includes(lowerSearch)) ||
      (sn.batch && sn.batch.toLowerCase().includes(lowerSearch)) ||
      (sn.project && sn.project.toLowerCase().includes(lowerSearch)) ||
      (sn.itemName && sn.itemName.toLowerCase().includes(lowerSearch))
    );
  }, [allSNLogs, searchSN]);

  const handleDeleteSN = async (itemId, snId, qty, snText) => {
    if (!confirm(`YAKIN INGIN MENGHAPUS INPUT INBOUND INI?\n\n(SN/Range: ${snText} | Qty: ${qty} Unit)\n\nStok di Gudang Pusat akan otomatis dikurangi sebesar ${qty} unit.`)) return;
    try {
      const item = inventory.find(i => i.id === itemId);
      if (!item) return showNotif("Item tidak ditemukan!", "error");
      
      const newSnList = item.snList.filter(sn => sn.id !== snId);
      const newStok = Math.max((item.stokMPDN || 0) - qty, 0); 
      
      await updateDoc(getDbDoc('inventory', itemId), { stokMPDN: newStok, snList: newSnList });
      await addHistory('DELETE', `Menghapus Inbound (SN: ${snText}). Stok WIP Pusat dikurangi ${qty} unit.`, qty);
      showNotif("Data SN & Stok berhasil dihapus!", "success");
    } catch(e) { showNotif("Gagal menghapus data", "error"); }
  };

  const handleSaveEditSN = async () => {
    try {
      const item = inventory.find(i => i.id === editModal.itemId);
      if (!item) throw new Error("Item tidak ditemukan");

      const updatedSnList = item.snList.map(sn => 
        sn.id === editModal.id 
          ? { ...sn, batch: editModal.batch, rangeSN: editModal.rangeSN, project: editModal.project } 
          : sn
      );

      await updateDoc(getDbDoc('inventory', editModal.itemId), { snList: updatedSnList });
      await addHistory('EDIT', `Mengedit Data Inbound (SN Baru: ${editModal.rangeSN || '-'})`);
      
      setEditModal(null);
      showNotif("Data SN berhasil diperbarui!", "success");
    } catch (e) {
      showNotif("Gagal mengedit data", "error");
    }
  };

  // Custom processTx function to allow state persistence & tactile loading state
  const processTx = async (actionFn, successMsg, resetState) => {
    if (isSubmitting) return; // Cegah double klik
    setIsSubmitting(true);
    try { 
      await actionFn(); 
      // Jika offline, beri notif khusus bahwa data disimpan sementara
      if (isOffline) {
         showNotif("Data Disimpan Offline! (Akan tersinkronisasi saat sinyal kembali)", "info");
      } else {
         showNotif(successMsg); 
      }
      if (resetState) {
        setFormData(resetState);
      } else {
        setFormData({ txType: formData.txType }); 
      }
    } 
    catch (e) { showNotif(e.message || "Transaksi Gagal", "error"); }
    finally {
      setIsSubmitting(false);
    }
  };

  const handleInbound = () => processTx(async () => {
    const { lokasi, kategori, tipe, varian, subVarian, rc, qty, batch, rangeSN, projectSN, processSNs } = formData;
    const isLED = kategori === 'LED';

    if (!lokasi || !kategori) throw new Error("Lokasi & Kategori wajib diisi");

    const itemId = `${lokasi}-${kategori}-${tipe || ''}-${varian || ''}-${subVarian || ''}-${rc || ''}`.replace(/\s+/g, '-').toLowerCase();
    const existing = inventory.find(i => i.id === itemId);
    const docRef = getDbDoc('inventory', itemId);

    let finalQty = 0;
    let newSnEntries = [];
    let logDetail = '';

    if (isLED) {
      finalQty = parseInt(qty);
      if (!finalQty || finalQty <= 0) throw new Error("Volume Qty wajib diisi untuk LED");

      // Validasi Anti Duplikat khusus LED
      if (existing && rangeSN && rangeSN !== '-') {
        const isDuplicate = existing.snList.some(sn => sn.rangeSN.toLowerCase() === rangeSN.toLowerCase());
        if (isDuplicate) throw new Error(`GAGAL: SN "${rangeSN}" sudah terdaftar di sistem!`);
      }

      newSnEntries = [{
        id: Date.now().toString(),
        batch: batch || '-',
        rangeSN: rangeSN || '-',
        project: projectSN || '-',
        qty: finalQty,
        date: new Date().toISOString()
      }];

      logDetail = `+${finalQty} ${kategori} ${tipe||''} ${subVarian||''} -> ${lokasi}`;
      if (rangeSN && rangeSN !== '-') logDetail += ` (SN: ${rangeSN})`;
      if (batch && batch !== '-') logDetail += ` [Batch: ${batch}]`;
      if (projectSN) logDetail += ` [Ket: ${projectSN}]`; 

    } else {
      // NON-LED Logic (Monitor, Kiosk)
      const inputSNs = (processSNs || '').split(/[\s,]+/).map(s => s.trim()).filter(Boolean);
      finalQty = inputSNs.length;
      if (finalQty === 0) throw new Error("Serial Number wajib diisi (minimal 1)!");

      // Validasi Anti Duplikat untuk setiap SN Monitor
      if (existing) {
         const existingSNs = existing.snList.map(sn => sn.rangeSN.toLowerCase());
         const dupes = inputSNs.filter(sn => existingSNs.includes(sn.toLowerCase()));
         if (dupes.length > 0) throw new Error(`GAGAL: SN (${dupes.join(', ')}) sudah terdaftar di sistem!`);
      }

      const timestamp = Date.now();
      newSnEntries = inputSNs.map((sn, idx) => ({
        id: (timestamp + idx).toString(),
        batch: '-',
        rangeSN: sn,
        project: projectSN || '-',
        qty: 1,
        date: new Date().toISOString()
      }));

      logDetail = `+${finalQty} ${kategori} ${tipe||''} ${varian||''} ${subVarian||''} -> ${lokasi} [SN: ${inputSNs.join(', ')}]`;
      if (projectSN) logDetail += ` [Ket: ${projectSN}]`;
    }

    if (existing) {
      await updateDoc(docRef, { stokMPDN: existing.stokMPDN + finalQty, snList: [...(existing.snList || []), ...newSnEntries] });
    } else {
      await setDoc(docRef, { 
        kategori, tipe: tipe || '-', varian: varian || '-', subVarian: subVarian || '-', rc: rc || '-', 
        lokasiAsal: lokasi, stokMPDN: finalQty, stokIVP: 0, stokMLDS: 0, stokNG: 0, alokasi: [], snList: newSnEntries
      });
    }
    
    await addHistory('INBOUND', logDetail, finalQty);
  }, "Stok Masuk & Record SN Berhasil Disimpan", 
  // Jika Non-LED, pertahankan form dan hanya kosongkan SN (Rapid Scanning Mode)
  formData.kategori === 'LED' ? null : { ...formData, processSNs: '' });

  const handleTagging = () => processTx(async () => {
    const { itemId, target, project, qty, processSNs } = formData;
    if (!itemId || !target || !project) throw new Error("Data belum lengkap");
    const item = inventory.find(i => i.id === itemId);
    
    let finalQty = parseInt(qty);
    if (item.kategori !== 'LED') {
       if (!processSNs) throw new Error("Daftar SN wajib diisi untuk kategori ini!");
       finalQty = validateProcessSNs(processSNs, item);
    }
    if (!finalQty || finalQty <= 0) throw new Error("Qty / Jumlah SN tidak valid");
    
    if (item.stokMPDN < finalQty) throw new Error("Stok Gudang Pusat tidak cukup");
    
    const newAlokasi = [...(item.alokasi || []), { id: Date.now().toString(), target, project, qty: finalQty, date: new Date().toISOString() }];
    await updateDoc(getDbDoc('inventory', itemId), { stokMPDN: item.stokMPDN - finalQty, [`stok${target}`]: item[`stok${target}`] + finalQty, alokasi: newAlokasi });
    
    let logText = `${finalQty} unit ${item.kategori} ${item.varian} ke ${target} (Project: ${project})`;
    if (processSNs) logText += ` [SN List: ${processSNs}]`;
    await addHistory('TAGGING', logText, finalQty);
  }, "Tagging Berhasil", formData.kategori !== 'LED' ? { ...formData, processSNs: '' } : null);

  const handleRevert = () => processTx(async () => {
    const { itemId, alokasiId, qty, reason, processSNs } = formData;
    if (!itemId || !alokasiId || !reason) throw new Error("Rincian wajib diisi");
    const item = inventory.find(i => i.id === itemId);
    
    let finalQty = parseInt(qty);
    if (item.kategori !== 'LED') {
       if (!processSNs) throw new Error("Daftar SN wajib diisi untuk kategori ini!");
       finalQty = validateProcessSNs(processSNs, item);
    }
    if (!finalQty || finalQty <= 0) throw new Error("Qty / Jumlah SN tidak valid");
    
    const alokasiIndex = item.alokasi.findIndex(a => a.id === alokasiId);
    const alokasi = item.alokasi[alokasiIndex];
    if (alokasi.qty < finalQty) throw new Error("Jumlah ditarik melebihi alokasi");
    
    let newAlokasiList = [...item.alokasi];
    if (alokasi.qty === finalQty) newAlokasiList.splice(alokasiIndex, 1); else newAlokasiList[alokasiIndex].qty -= finalQty;
    
    await updateDoc(getDbDoc('inventory', itemId), { stokMPDN: item.stokMPDN + finalQty, [`stok${alokasi.target}`]: item[`stok${alokasi.target}`] - finalQty, alokasi: newAlokasiList });
    
    let logText = `${finalQty} unit ditarik dari ${alokasi.target} (${alokasi.project}). Alasan: ${reason}`;
    if (processSNs) logText += ` [SN List: ${processSNs}]`;
    await addHistory('REVERT', logText, finalQty);
  }, "Revert Berhasil", formData.kategori !== 'LED' ? { ...formData, processSNs: '' } : null);

  const handleOutbound = () => processTx(async () => {
    const { itemId, alokasiId, qty, reason, processSNs } = formData;
    if (!itemId || !alokasiId) throw new Error("Data belum lengkap");
    const item = inventory.find(i => i.id === itemId);
    
    let finalQty = parseInt(qty);
    if (item.kategori !== 'LED') {
       if (!processSNs) throw new Error("Daftar SN wajib diisi untuk kategori ini!");
       finalQty = validateProcessSNs(processSNs, item);
    }
    if (!finalQty || finalQty <= 0) throw new Error("Qty / Jumlah SN tidak valid");
    
    if (alokasiId === 'MPDN') {
      if (item.stokMPDN < finalQty) throw new Error("Jumlah keluar melebihi stok Gudang Pusat");
      await updateDoc(getDbDoc('inventory', itemId), { stokMPDN: item.stokMPDN - finalQty });
      let logText = `${finalQty} unit dikirim langsung dari Gudang Pusat. Ket: ${reason || '-'}`;
      if (processSNs) logText += ` [SN List: ${processSNs}]`;
      await addHistory('OUTBOUND', logText, finalQty);
    } else if (alokasiId === 'NG') {
      if ((item.stokNG || 0) < finalQty) throw new Error("Jumlah keluar melebihi stok NG");
      await updateDoc(getDbDoc('inventory', itemId), { stokNG: item.stokNG - finalQty });
      let logText = `${finalQty} unit NG dikeluarkan/dibuang. Ket: ${reason || '-'}`;
      if (processSNs) logText += ` [SN List: ${processSNs}]`;
      await addHistory('OUTBOUND', logText, finalQty);
    } else {
      const alokasiIndex = item.alokasi.findIndex(a => a.id === alokasiId);
      const alokasi = item.alokasi[alokasiIndex];
      if (alokasi.qty < finalQty) throw new Error("Jumlah keluar melebihi alokasi project");
      let newAlokasiList = [...item.alokasi];
      if (alokasi.qty === finalQty) newAlokasiList.splice(alokasiIndex, 1); else newAlokasiList[alokasiIndex].qty -= finalQty;
      await updateDoc(getDbDoc('inventory', itemId), { [`stok${alokasi.target}`]: item[`stok${alokasi.target}`] - finalQty, alokasi: newAlokasiList });
      let logText = `${finalQty} unit dikirim ke ${alokasi.project} (${alokasi.target}). Ket: ${reason || '-'}`;
      if (processSNs) logText += ` [SN List: ${processSNs}]`;
      await addHistory('OUTBOUND', logText, finalQty);
    }
  }, "Outbound Berhasil", formData.kategori !== 'LED' ? { ...formData, processSNs: '' } : null);

  const handleReject = () => processTx(async () => {
    const { itemId, qty, reason, rejectMode, processSNs } = formData;
    const isRestore = rejectMode === 'restore';
    if (!itemId || !reason) throw new Error("Pilih aset dan isi alasannya!");
    
    const item = inventory.find(i => i.id === itemId);
    
    let finalQty = parseInt(qty);
    if (item.kategori !== 'LED') {
       if (!processSNs) throw new Error("Daftar SN wajib diisi untuk kategori ini!");
       finalQty = validateProcessSNs(processSNs, item);
    }
    if (!finalQty || finalQty <= 0) throw new Error("Qty / Jumlah SN tidak valid");

    if (isRestore) {
      if ((item.stokNG || 0) < finalQty) throw new Error("Jumlah pulih melebihi stok NG yang ada");
      await updateDoc(getDbDoc('inventory', itemId), { 
        stokMPDN: item.stokMPDN + finalQty,
        stokNG: item.stokNG - finalQty
      });
      let logText = `${finalQty} unit ${item.kategori} ${item.varian} dipulihkan dari NG ke Pusat. Keterangan: ${reason}`;
      if (processSNs) logText += ` [SN List: ${processSNs}]`;
      await addHistory('REJECT', logText, finalQty);
    } else {
      if (item.stokMPDN < finalQty) throw new Error("Jumlah reject melebihi stok Gudang Pusat saat ini");
      await updateDoc(getDbDoc('inventory', itemId), { 
        stokMPDN: item.stokMPDN - finalQty,
        stokNG: (item.stokNG || 0) + finalQty
      });
      let logText = `${finalQty} unit ${item.kategori} ${item.varian} dipindah ke NG. Alasan: ${reason}`;
      if (processSNs) logText += ` [SN List: ${processSNs}]`;
      await addHistory('REJECT', logText, finalQty);
    }
  }, formData.rejectMode === 'restore' ? "Barang NG Berhasil Dipulihkan" : "Data Barang NG Berhasil Disimpan", formData.kategori !== 'LED' ? { ...formData, processSNs: '' } : null);

  // --- CHART CALCULATIONS ---
  
  // STATS GLOBAL: WIP, Titipan, NG, & Categories (Tanpa Loop Berulang-ulang)
  const globalStats = useMemo(() => {
    let wip = 0, titipan = 0, ng = 0;
    let led = 0, monitor = 0, kiosk = 0;
    
    inventory.forEach(i => {
      const itemTotal = (i.stokMPDN || 0) + (i.stokIVP || 0) + (i.stokMLDS || 0) + (i.stokNG || 0);
      
      wip += (i.stokMPDN || 0);
      titipan += (i.stokIVP || 0) + (i.stokMLDS || 0);
      ng += (i.stokNG || 0);
      
      if (i.kategori === 'LED') led += itemTotal;
      else if (i.kategori === 'Monitor') monitor += itemTotal;
      else if (i.kategori === 'Kiosk') kiosk += itemTotal;
    });

    return { wip, titipan, ng, led, monitor, kiosk, grand: wip + titipan + ng };
  }, [inventory]);

  // BEST PRODUCT BERDASARKAN TOTAL GLOBAL INBOUND DARI HISTORI
  const bestProductData = useMemo(() => {
    let mvidci = 0, mvifci = 0, mvifco = 0, ifp = 0, vdw = 0, kioskFat = 0, kioskSlim = 0;
    historyLog.forEach(log => {
      if (log.action === 'INBOUND') {
        const text = (log.details || '').toUpperCase();
        const q = parseInt(log.qty) || 0;
        
        if (text.includes('MVIDCI')) mvidci += q;
        else if (text.includes('MVIFCI') || text.includes('MVIFCIL')) mvifci += q;
        else if (text.includes('MVIFCO')) mvifco += q;
        else if (text.includes('IFP') || text.includes('MONITOR IFP')) ifp += q;
        else if (text.includes('VDW') || text.includes('MONITOR VDW')) vdw += q;
        else if (text.includes('KIOSK FAT')) kioskFat += q;
        else if (text.includes('KIOSK SLIM')) kioskSlim += q;
      }
    });
    
    return [
      { label: 'MVIFCI', val: mvifci },
      { label: 'MVIFCO', val: mvifco },
      { label: 'MVIDCI', val: mvidci },
      { label: 'IFP', val: ifp },
      { label: 'VDW', val: vdw },
      { label: 'KIOSK FAT', val: kioskFat },
      { label: 'KIOSK SLIM', val: kioskSlim }
    ].sort((a,b) => b.val - a.val); // Sort dari yang paling banyak dirakit
  }, [historyLog]);
  
  const maxBestProd = Math.max(...bestProductData.map(d => d.val), 10);

  const monthlyOutboundData = useMemo(() => {
    const months = new Array(12).fill(0);
    historyLog.forEach(log => {
       if ((log.action === 'OUTBOUND' || log.action === 'TAGGING') && log.timestamp) {
         const date = new Date(log.timestamp.toMillis());
         if (date.getFullYear() === new Date().getFullYear()) {
           let q = log.qty || 0;
           if (!q) { 
             const match = log.details.match(new RegExp('(?:\\\\+)?(\\d+)')); 
             if (match) q = parseInt(match[1], 10); 
           }
           months[date.getMonth()] += q;
         }
       }
    });
    return months;
  }, [historyLog]);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
  const maxOutbound = Math.max(...monthlyOutboundData, 10);

  const parseLogDetails = (details) => {
    let lokasi = '-';
    let unit = '-';
    let pitch = '-';
    let sn = '-';
    let project = '-';

    try {
      const snMatch = details.match(/\(SN:\s*(.*?)\)/) || details.match(/\[SN List:\s*(.*?)\]/) || details.match(/\[SN:\s*(.*?)\]/);
      if (snMatch) sn = snMatch[1];

      const ketMatch = details.match(/\[Ket:\s*(.*?)\]/);
      if (ketMatch) project = ketMatch[1];

      const locMatch = details.match(/->\s*(.*?)(?:\s*\(SN:|\s*\[SN:|\s*\[Batch:|\s*\[Ket:|$)/);
      if (locMatch) lokasi = locMatch[1].trim();

      const itemMatch = details.match(/^\+\d+\s+(.*?)\s+->/);
      if (itemMatch) {
        const itemStr = itemMatch[1].trim(); 
        const parts = itemStr.split(' ');
        
        if (parts[0] === 'LED') {
          unit = parts[1] || '-';
          pitch = parts.slice(2).join(' ') || '-';
        } else if (parts[0] === 'Monitor') {
          unit = parts[1] || '-';
          pitch = parts.slice(2).join(' ') || '-';
        } else if (parts[0] === 'Kiosk') {
          unit = parts.slice(0, 2).join(' ') || 'Kiosk';
          pitch = parts.slice(2).join(' ') || '-';
        } else {
          unit = parts[0] || '-';
          pitch = parts.slice(1).join(' ') || '-';
        }
      } else {
        unit = details;
      }
    } catch(e) {
      unit = details;
    }

    return { lokasi, unit, pitch, sn, project };
  };

  // --- RENDERERS ---
  const renderGSheetDashboard = () => (
    <div className="flex-1 w-full h-full flex flex-col lg:flex-row gap-3 overflow-hidden bg-[#09090b] p-3 animate-in fade-in duration-500 font-sans print:hidden">
      
      {/* KOLOM 1: W.I.P (Kiri) */}
      <div className="w-full lg:w-56 flex flex-col shrink-0 h-full overflow-y-auto custom-scrollbar pr-1 pb-2">
        <Panel title="STOCK W.I.P" className="min-h-min h-auto shrink-0 mb-3">
           <SectionTitle title="Interactive Flat Panel" />
           <div className="space-y-3 mb-4">
             {['Microvision', 'Newline', 'Philips'].map(merk => (
               <div key={merk}>
                 <div className="text-[10px] sm:text-[11px] text-center text-slate-300 font-bold mb-1 uppercase tracking-wider">{merk}</div>
                 <div className="grid grid-cols-3 gap-1">
                   <GridCell label="65" value={getStok('Monitor', 'IFP', merk, '65"')} />
                   <GridCell label="75" value={getStok('Monitor', 'IFP', merk, '75"')} />
                   <GridCell label="86" value={getStok('Monitor', 'IFP', merk, '86"')} />
                 </div>
               </div>
             ))}
           </div>
           
           <SectionTitle title="Videowall" />
           <div className="space-y-3">
             <div>
               <div className="text-[10px] sm:text-[11px] text-center text-slate-300 font-bold mb-1 uppercase tracking-wider">MICROVISION</div>
               <div className="grid grid-cols-4 gap-1">
                 {['4935', '5535', '5517', '5588'].map(sv => <GridCell key={sv} label={sv} value={getStok('Monitor', 'VDW', 'Microvision', sv)} valColor="text-emerald-400 bg-[#09090b]" />)}
               </div>
             </div>
             <div>
               <div className="text-[10px] sm:text-[11px] text-center text-slate-300 font-bold mb-1 uppercase tracking-wider">PHILIPS</div>
               <div className="grid grid-cols-2 gap-1">
                 {['49BDL', '55BDL'].map((sv,i) => <GridCell key={sv} label={sv} value={getStok('Monitor', 'VDW', 'Philips', i===0?'49BDL2105X-ik':'55BDL2105X-ik')} valColor="text-emerald-400 bg-[#09090b]" />)}
               </div>
             </div>
           </div>
        </Panel>

        {/* PANEL NG UPDATE: Dipecah jadi IFP dan VIDEO WALL */}
        <Panel title="UNIT NOT GOOD (REJECT)" className="min-h-min shrink-0 border-rose-900/50 mt-3" headerClass="text-rose-500 bg-rose-950/20 border-rose-900/50 py-2">
           <div className="flex flex-col justify-center mt-1">
              <div className="text-[10px] text-center text-rose-400/80 font-bold mb-1.5 uppercase tracking-wider">IFP</div>
              <div className="grid grid-cols-3 gap-1.5 mb-3">
                 <GridCell label="MICROVISION" value={getStok('Monitor', 'IFP', 'Microvision', null, 'NG')} valColor="text-rose-500 text-sm" />
                 <GridCell label="NEWLINE" value={getStok('Monitor', 'IFP', 'Newline', null, 'NG')} valColor="text-rose-500 text-sm" />
                 <GridCell label="PHILIPS" value={getStok('Monitor', 'IFP', 'Philips', null, 'NG')} valColor="text-rose-500 text-sm" />
              </div>

              <div className="text-[10px] text-center text-rose-400/80 font-bold mb-1.5 uppercase tracking-wider">VIDEO WALL</div>
              <div className="grid grid-cols-2 gap-1.5">
                 <GridCell label="MICROVISION" value={getStok('Monitor', 'VDW', 'Microvision', null, 'NG')} valColor="text-rose-500 text-sm" />
                 <GridCell label="PHILIPS" value={getStok('Monitor', 'VDW', 'Philips', null, 'NG')} valColor="text-rose-500 text-sm" />
              </div>
              <div className="text-[9px] text-center text-slate-500 font-medium tracking-wide mt-2 pt-2 border-t border-rose-900/50">Total Layar Cacat / Retur Servis</div>
           </div>
        </Panel>
      </div>

      {/* KOLOM 2: CENTER (LED Table, Charts, Tracking, Histori) */}
      <div className="flex-1 flex flex-col gap-3 min-w-0 h-full overflow-y-auto lg:overflow-hidden pb-2 pr-1 lg:pr-0 custom-scrollbar lg:scrollbar-none">
         
         {/* TOP ROW: Time, Main LED Table, Date */}
         <div className="flex flex-col md:flex-row gap-3 shrink-0">
            {/* Time Box */}
            <div className="w-full md:w-40 flex flex-col gap-3">
               <Panel title="TIME" className="h-20 justify-center items-center bg-gradient-to-b from-[#161b22] to-[#0d1117]">
                 <LiveClock />
               </Panel>
               <Panel title="KIOSK FAT">
                 <div className="text-center font-mono text-3xl font-bold text-white py-2">{getStok('Kiosk', 'KioskFAT')}</div>
                 <div className="text-[10px] text-center text-slate-500 pb-1 font-semibold uppercase tracking-wider">IN / OUT</div>
               </Panel>
            </div>

            {/* LED Complex Table */}
            <Panel title="DASHBOARD INTERACTIVE MICROVISION JAKARTA" className="flex-1" headerClass="text-sm sm:text-base py-3 text-blue-400 tracking-widest drop-shadow-md">
               <div className="grid grid-cols-4 divide-x divide-[#30363d] border border-[#30363d] h-full rounded-sm overflow-hidden">
                  <div className="flex flex-col">
                     <div className="text-[10px] sm:text-xs text-center bg-[#1a1a1e] text-slate-300 py-2 font-bold border-b border-[#30363d] uppercase tracking-widest border-t-2 border-t-blue-500/50">MVIFCO</div>
                     <div className="flex-1 grid grid-cols-5 text-center">
                        {['P4.0', 'P5.0', 'P6.0', 'P8.0', 'P10'].map(p => (
                          <div key={p} className="flex flex-col border-r border-[#30363d] last:border-0">
                            <div className="text-[10px] sm:text-[11px] text-slate-400 py-2 border-b border-[#30363d] font-semibold">{p}</div>
                            <div className="flex-1 flex items-center justify-center text-sm sm:text-base font-mono font-bold text-blue-400 bg-blue-900/10">{getStok('LED', 'MVIFCO', null, p==='P10'?'P10.0':p)}</div>
                          </div>
                        ))}
                     </div>
                  </div>
                  <div className="flex flex-col">
                     <div className="text-[10px] sm:text-xs text-center bg-[#1a1a1e] text-slate-300 py-2 font-bold border-b border-[#30363d] uppercase tracking-widest border-t-2 border-t-rose-500/50">MVIFCI</div>
                     <div className="flex-1 grid grid-cols-3 text-center">
                        {['P1.86', 'P2.5', 'P4.0'].map(p => (
                          <div key={p} className="flex flex-col border-r border-[#30363d] last:border-0">
                            <div className="text-[10px] sm:text-[11px] text-slate-400 py-2 border-b border-[#30363d] font-semibold">{p}</div>
                            <div className="flex-1 flex items-center justify-center text-sm sm:text-base font-mono font-bold text-rose-400 bg-rose-900/10">{getStok('LED', 'MVIFCI', null, p)}</div>
                          </div>
                        ))}
                     </div>
                  </div>
                  <div className="flex flex-col">
                     <div className="text-[10px] sm:text-xs text-center bg-[#1a1a1e] text-slate-300 py-2 font-bold border-b border-[#30363d] uppercase tracking-widest border-t-2 border-t-indigo-500/50">MVIFCIL</div>
                     <div className="flex-1 grid grid-cols-3 text-center">
                        {['P1.86', 'P2.5', 'P4.0'].map(p => (
                          <div key={p} className="flex flex-col border-r border-[#30363d] last:border-0">
                            <div className="text-[10px] sm:text-[11px] text-slate-400 py-2 border-b border-[#30363d] font-semibold">{p}</div>
                            <div className="flex-1 flex items-center justify-center text-sm sm:text-base font-mono font-bold text-indigo-400 bg-indigo-900/10">{getStok('LED', 'MVIFCIL', null, p)}</div>
                          </div>
                        ))}
                     </div>
                  </div>
                  <div className="flex flex-col">
                     <div className="text-[10px] sm:text-xs text-center bg-[#1a1a1e] text-slate-300 py-2 font-bold border-b border-[#30363d] uppercase tracking-widest border-t-2 border-t-emerald-500/50">MVIDCI</div>
                     <div className="flex-1 grid grid-cols-5 text-center">
                        {['P1.2', 'P1.5', 'P1.8', 'P2.0', 'P2.5'].map(p => (
                          <div key={p} className="flex flex-col border-r border-[#30363d] last:border-0">
                            <div className="text-[10px] sm:text-[11px] text-slate-400 py-2 border-b border-[#30363d] font-semibold">{p}</div>
                            <div className="flex-1 flex items-center justify-center text-sm sm:text-base font-mono font-bold text-emerald-400 bg-emerald-900/10">{getStok('LED', 'MVIDCI', null, p==='P1.8'?'P1.86':p)}</div>
                          </div>
                        ))}
                     </div>
                  </div>
               </div>
            </Panel>

            {/* Date Box */}
            <div className="w-full md:w-40 flex flex-col gap-3">
               <Panel title="DATE TODAY" className="h-20 justify-center items-center bg-gradient-to-b from-[#161b22] to-[#0d1117]">
                 <LiveDate />
               </Panel>
               <Panel title="KIOSK SLIM">
                 <div className="text-center font-mono text-3xl font-bold text-white py-2">{getStok('Kiosk', 'KioskSlim')}</div>
                 <div className="text-[10px] text-center text-slate-500 pb-1 font-semibold uppercase tracking-wider">IN / OUT</div>
               </Panel>
            </div>
         </div>

         {/* MIDDLE ROW: CHARTS */}
         <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-3 min-h-0">
            
            <Panel className="flex-1 relative pb-3 overflow-hidden">
               <div className="text-center text-[10px] sm:text-[11px] font-bold text-white mt-2 uppercase tracking-widest drop-shadow-md">Pengeluaran Tahunan</div>
               <div className="flex-1 flex items-end justify-between px-2 sm:px-4 pb-8 mt-5 relative h-32 sm:h-40">
                 <div className="absolute inset-0 flex flex-col justify-between opacity-20 pointer-events-none pb-8 border-b border-slate-700">
                    <div className="w-full h-px bg-slate-500"></div><div className="w-full h-px bg-slate-500"></div><div className="w-full h-px bg-slate-500"></div>
                 </div>
                 {monthlyOutboundData.map((val, i) => {
                   const pct = Math.min((val/maxOutbound)*100, 100);
                   return (
                     <div key={i} className="flex flex-col items-center flex-1 z-10 h-full justify-end relative">
                        <div className="w-full h-full flex flex-col justify-end items-center relative group cursor-default">
                           {/* Solid Bar, No Track Background */}
                           <div className="w-full max-w-[16px] sm:max-w-[24px] bg-rose-600/90 border-t-2 border-l border-r border-rose-400 transition-all duration-700 relative rounded-t-sm" style={{height: `${pct}%`, minHeight: val>0?'4px':'0'}}>
                              {/* Angka Statis Selalu Muncul di atas Bar */}
                              {val > 0 && <span className="absolute -top-4 sm:-top-5 left-1/2 -translate-x-1/2 text-[7px] sm:text-[9px] text-white font-bold font-mono">{val}</span>}
                           </div>
                        </div>
                        <div className="text-[7px] sm:text-[9px] text-slate-400 mt-2 font-bold uppercase tracking-wider">{monthNames[i]}</div>
                     </div>
                   )
                 })}
               </div>
               <div className="absolute bottom-2 left-0 w-full text-center text-[8px] sm:text-[9px] text-slate-500 tracking-wide">Total Outbound & Tagging ({new Date().getFullYear()})</div>
            </Panel>

            <Panel className="flex-1 flex flex-col justify-around py-4 px-4 relative">
               {/* Global Stock Status */}
               <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-3">
                     <span className="text-[10px] sm:text-[11px] font-bold text-white uppercase tracking-widest drop-shadow-md">STATUS STOK GLOBAL</span>
                     <span className="text-[10px] sm:text-xs font-mono font-bold text-blue-400 bg-blue-900/20 px-2 py-0.5 rounded border border-blue-800/30 shadow-inner">TOTAL: {globalStats.grand}</span>
                  </div>
                  
                  <div className="space-y-3">
                     {/* W.I.P */}
                     <div>
                        <div className="flex justify-between text-[9px] font-bold mb-1">
                           <span className="text-slate-400 tracking-wider">W.I.P (READY)</span>
                           <span className="text-blue-400 font-mono">{globalStats.wip} <span className="text-slate-500 font-sans ml-0.5">({globalStats.grand ? ((globalStats.wip/globalStats.grand)*100).toFixed(1) : 0}%)</span></span>
                        </div>
                        <div className="h-2 w-full bg-[#161b22] rounded-full overflow-hidden border border-[#30363d]/50">
                           <div className="h-full bg-blue-500 transition-all duration-700" style={{width: `${globalStats.grand ? (globalStats.wip/globalStats.grand)*100 : 0}%`}}></div>
                        </div>
                     </div>
                     
                     {/* TITIPAN */}
                     <div>
                        <div className="flex justify-between text-[9px] font-bold mb-1">
                           <span className="text-slate-400 tracking-wider">TITIPAN (PROJECT)</span>
                           <span className="text-emerald-400 font-mono">{globalStats.titipan} <span className="text-slate-500 font-sans ml-0.5">({globalStats.grand ? ((globalStats.titipan/globalStats.grand)*100).toFixed(1) : 0}%)</span></span>
                        </div>
                        <div className="h-2 w-full bg-[#161b22] rounded-full overflow-hidden border border-[#30363d]/50">
                           <div className="h-full bg-emerald-500 transition-all duration-700" style={{width: `${globalStats.grand ? (globalStats.titipan/globalStats.grand)*100 : 0}%`}}></div>
                        </div>
                     </div>

                     {/* NG */}
                     <div>
                        <div className="flex justify-between text-[9px] font-bold mb-1">
                           <span className="text-slate-400 tracking-wider">UNIT NOT GOOD (NG)</span>
                           <span className="text-rose-400 font-mono">{globalStats.ng} <span className="text-slate-500 font-sans ml-0.5">({globalStats.grand ? ((globalStats.ng/globalStats.grand)*100).toFixed(1) : 0}%)</span></span>
                        </div>
                        <div className="h-2 w-full bg-[#161b22] rounded-full overflow-hidden border border-[#30363d]/50">
                           <div className="h-full bg-rose-500 transition-all duration-700" style={{width: `${globalStats.grand ? (globalStats.ng/globalStats.grand)*100 : 0}%`}}></div>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="w-full h-px bg-[#30363d] my-5"></div>

               {/* Category Distribution */}
               <div className="flex-1 flex flex-col justify-center">
                  <div className="text-[10px] sm:text-[11px] font-bold text-white mb-3 uppercase tracking-widest drop-shadow-md">DISTRIBUSI KATEGORI</div>
                  <div className="space-y-3">
                     {/* LED */}
                     <div>
                        <div className="flex justify-between text-[9px] font-bold mb-1">
                           <span className="text-slate-400 tracking-wider">LED DISPLAY</span>
                           <span className="text-purple-400 font-mono">{globalStats.led} <span className="text-slate-500 font-sans ml-0.5">({globalStats.grand ? ((globalStats.led/globalStats.grand)*100).toFixed(1) : 0}%)</span></span>
                        </div>
                        <div className="h-1.5 w-full bg-[#161b22] rounded-full overflow-hidden border border-[#30363d]/50">
                           <div className="h-full bg-purple-500 transition-all duration-700" style={{width: `${globalStats.grand ? (globalStats.led/globalStats.grand)*100 : 0}%`}}></div>
                        </div>
                     </div>

                     {/* MONITOR */}
                     <div>
                        <div className="flex justify-between text-[9px] font-bold mb-1">
                           <span className="text-slate-400 tracking-wider">MONITOR (IFP/VDW)</span>
                           <span className="text-sky-400 font-mono">{globalStats.monitor} <span className="text-slate-500 font-sans ml-0.5">({globalStats.grand ? ((globalStats.monitor/globalStats.grand)*100).toFixed(1) : 0}%)</span></span>
                        </div>
                        <div className="h-1.5 w-full bg-[#161b22] rounded-full overflow-hidden border border-[#30363d]/50">
                           <div className="h-full bg-sky-500 transition-all duration-700" style={{width: `${globalStats.grand ? (globalStats.monitor/globalStats.grand)*100 : 0}%`}}></div>
                        </div>
                     </div>

                     {/* KIOSK */}
                     <div>
                        <div className="flex justify-between text-[9px] font-bold mb-1">
                           <span className="text-slate-400 tracking-wider">KIOSK</span>
                           <span className="text-amber-400 font-mono">{globalStats.kiosk} <span className="text-slate-500 font-sans ml-0.5">({globalStats.grand ? ((globalStats.kiosk/globalStats.grand)*100).toFixed(1) : 0}%)</span></span>
                        </div>
                        <div className="h-1.5 w-full bg-[#161b22] rounded-full overflow-hidden border border-[#30363d]/50">
                           <div className="h-full bg-amber-500 transition-all duration-700" style={{width: `${globalStats.grand ? (globalStats.kiosk/globalStats.grand)*100 : 0}%`}}></div>
                        </div>
                     </div>
                  </div>
               </div>
            </Panel>

            <Panel className="flex-1 pt-4 pb-2">
               <div className="text-center text-[10px] sm:text-[11px] font-bold text-white mb-4 uppercase tracking-widest drop-shadow-md">BEST PRODUCT (GLOBAL INBOUND)</div>
               <div className="flex flex-col justify-center h-full px-2 sm:px-4 gap-3 pb-2 overflow-y-auto custom-scrollbar">
                  {bestProductData.map(d => {
                    const pct = d.val > 0 ? Math.max((d.val/maxBestProd)*100, 2) : 0;
                    return (
                    <div key={d.label} className="flex items-center gap-3 w-full">
                       <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 w-20 text-right tracking-wider truncate">{d.label}</span>
                       <div className="flex-1 bg-[#1c212b] border border-[#30363d]/50 h-4 sm:h-5 relative rounded-sm overflow-hidden flex items-center">
                          <div className="h-full bg-blue-600 transition-all duration-150" style={{width: `${pct}%`}}></div>
                          {d.val > 0 && <span className="absolute left-2 text-[9px] sm:text-[10px] text-white font-mono font-bold drop-shadow-md">{d.val}</span>}
                       </div>
                    </div>
                  )})}
               </div>
            </Panel>
         </div>

         {/* BOTTOM ROW: SN Tracking & Histori Editor */}
         <div className="flex flex-col lg:flex-row gap-3 shrink-0 h-64 lg:h-56">
            <Panel className="flex-[3] flex flex-col bg-[#161b22] overflow-hidden p-0 sm:p-0">
               <div className="flex items-center justify-between p-2.5 border-b border-[#30363d] bg-[#0d1117] shrink-0">
                  <div className="flex items-center gap-2">
                     <Search size={14} className="text-blue-400"/>
                     <span className="text-[11px] font-bold text-blue-400 uppercase tracking-widest">Tracking Serial Number & Histori</span>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Cari Batch Module / SN / Project..." 
                    value={searchSN}
                    onChange={e => setSearchSN(e.target.value)}
                    className="bg-[#161b22] border border-[#30363d] text-[11px] text-slate-200 px-3 py-1 rounded-md w-36 sm:w-56 focus:border-blue-500 hover:border-slate-500 outline-none transition-all shadow-inner"
                  />
               </div>
               <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                     <thead className="sticky top-0 bg-[#161b22] shadow-md z-10">
                        <tr className="border-b border-[#30363d]">
                           <th className="py-2 px-3 text-[9px] text-slate-400 font-bold uppercase tracking-wider">Tanggal</th>
                           <th className="py-2 px-3 text-[9px] text-slate-400 font-bold uppercase tracking-wider">Spesifikasi Item</th>
                           <th className="py-2 px-3 text-[9px] text-slate-400 font-bold uppercase tracking-wider">Batch Module</th>
                           <th className="py-2 px-3 text-[9px] text-slate-400 font-bold uppercase tracking-wider">Range SN / Serial</th>
                           <th className="py-2 px-3 text-[9px] text-slate-400 font-bold uppercase tracking-wider">Keterangan / Project</th>
                           <th className="py-2 px-3 text-[9px] text-slate-400 font-bold uppercase tracking-wider text-center">Qty</th>
                           {isAdmin && <th className="py-2 px-3 text-[9px] text-slate-400 font-bold uppercase tracking-wider text-center">Aksi</th>}
                        </tr>
                     </thead>
                     <tbody>
                        {filteredSNLogs.length === 0 ? (
                          <tr><td colSpan={isAdmin ? "7" : "6"} className="text-center py-6 text-[11px] font-medium text-slate-500">Tidak ada riwayat Serial Number</td></tr>
                        ) : filteredSNLogs.map(sn => (
                          <tr key={sn.id} className="border-b border-[#30363d]/50 hover:bg-[#1f2937]/60 transition-colors cursor-default">
                             <td className="py-2 px-3 text-[11px] text-slate-400 font-mono whitespace-nowrap">
                               {sn.date ? new Date(sn.date).toLocaleDateString('id-ID', {day:'2-digit', month:'short', year:'2-digit'}) : '-'}
                             </td>
                             <td className="py-2 px-3 text-[11px] text-slate-200 font-bold">{sn.itemName}</td>
                             <td className="py-2 px-3 text-[11px] text-emerald-400 font-mono font-semibold">{sn.batch}</td>
                             <td className="py-2 px-3 text-[11px] text-blue-400 font-mono font-semibold flex items-center gap-2 group">
                               {sn.rangeSN}
                               {isAdmin && sn.rangeSN !== '-' && (
                                 <button onClick={() => handleCopyText(sn.rangeSN)} className="text-slate-500 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" title="Copy SN">
                                   <Copy size={12}/>
                                 </button>
                               )}
                             </td>
                             <td className="py-2 px-3 text-[11px] text-slate-400 truncate max-w-[140px]" title={sn.project}>{sn.project}</td>
                             <td className="py-2 px-3 text-[11px] text-white font-bold text-center">{sn.qty}</td>
                             {isAdmin && (
                               <td className="py-2 px-3 text-center whitespace-nowrap">
                                 <button onClick={() => {
                                    const item = inventory.find(i => i.id === sn.itemId);
                                    setEditModal({
                                        ...sn,
                                        lokasiAsal: item?.lokasiAsal || '',
                                        kategori: item?.kategori || '',
                                        tipe: item?.tipe && item.tipe !== '-' ? item.tipe : '',
                                        varian: item?.varian && item.varian !== '-' ? item.varian : '',
                                        subVarian: item?.subVarian && item.subVarian !== '-' ? item.subVarian : '',
                                        rc: item?.rc && item.rc !== '-' ? item.rc : '',
                                        oldItemId: sn.itemId,
                                        oldQty: sn.qty
                                    });
                                 }} className="text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 p-1.5 rounded border border-blue-500/30 mr-1.5 active:scale-95" title="Edit Data Lengkap SN">
                                    <Edit size={14}/>
                                 </button>
                                 <button onClick={() => handleDeleteSN(sn.itemId, sn.id, sn.qty, sn.rangeSN)} className="text-rose-500 hover:text-rose-400 transition-colors bg-rose-500/10 p-1.5 rounded border border-rose-500/30 active:scale-95" title="Hapus & Tarik Stok">
                                    <Trash2 size={14}/>
                                 </button>
                               </td>
                             )}
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </Panel>

            <Panel title="HISTORI EDITOR" className="flex-[2] overflow-hidden" headerClass="text-emerald-400 bg-emerald-950/10 py-2">
               <div className="flex-1 overflow-y-auto custom-scrollbar mt-1 space-y-0 pr-1">
                 {historyLog.length === 0 ? (
                   <div className="text-center text-[11px] text-slate-500 py-8">Belum ada riwayat sistem</div>
                 ) : historyLog.slice(0, 50).map(log => (
                   <div key={log.id} className="flex items-center gap-3 py-2.5 border-b border-[#30363d]/40 hover:bg-[#161b22] transition-colors px-2.5 cursor-default">
                     <span className={`text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider w-16 text-center shrink-0 ${
                       log.action === 'INBOUND' ? 'bg-emerald-500/20 text-emerald-400' :
                       log.action === 'TAGGING' ? 'bg-purple-500/20 text-purple-400' :
                       log.action === 'REVERT' ? 'bg-amber-500/20 text-amber-400' : 
                       log.action === 'EDIT' ? 'bg-blue-500/20 text-blue-400' : 
                       log.action === 'REJECT' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-500/20 text-slate-400'
                     }`}>{log.action}</span>
                     <span className="text-[10px] text-slate-500 font-mono shrink-0 w-10 text-center">
                       {log.timestamp ? new Date(log.timestamp.toMillis()).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'}) : ''}
                     </span>
                     <div className="text-[10px] sm:text-[11px] text-slate-300 font-medium truncate flex-1" title={log.details}>{log.details}</div>
                     <div className="text-[9px] text-slate-500 font-semibold tracking-wide italic shrink-0 w-16 text-right truncate">{log.user}</div>
                   </div>
                 ))}
               </div>
            </Panel>
         </div>
      </div>

      {/* KOLOM 3: TITIPAN (Kanan) */}
      <div className="w-full lg:w-56 flex flex-col gap-3 shrink-0 h-full overflow-y-auto custom-scrollbar pl-1 pb-2">
         
         <Panel title="TITIPAN MLDS" className="min-h-min">
            <SectionTitle title="MVIFCO" />
            <div className="grid grid-cols-5 gap-1 mb-3">
              {['P4.0', 'P5.0', 'P6.0', 'P8.0', 'P10'].map(p => <GridCell key={p} label={p.replace('P','')} value={getStok('LED', 'MVIFCO', null, p==='P10'?'P10.0':p, 'MLDS')} valColor="text-amber-400 bg-[#09090b]"/>)}
            </div>

            <SectionTitle title="MVIFCI" />
            <div className="grid grid-cols-3 gap-1 mb-3">
              {['P1.8', 'P2.5', 'P4.0'].map(p => <GridCell key={p} label={p.replace('P','')} value={getStok('LED', 'MVIFCI', null, p==='P1.8'?'P1.86':p, 'MLDS')} valColor="text-amber-400 bg-[#09090b]"/>)}
            </div>

            <SectionTitle title="MVIFCIL" />
            <div className="grid grid-cols-3 gap-1 mb-3">
              {['P1.8', 'P2.5', 'P4.0'].map(p => <GridCell key={p} label={p.replace('P','')} value={getStok('LED', 'MVIFCIL', null, p==='P1.8'?'P1.86':p, 'MLDS')} valColor="text-amber-400 bg-[#09090b]"/>)}
            </div>

            <SectionTitle title="MVIDCI" />
            <div className="grid grid-cols-5 gap-1">
              {['P1.2', 'P1.5', 'P1.8', 'P2.0', 'P2.5'].map(p => <GridCell key={p} label={p.replace('P','')} value={getStok('LED', 'MVIDCI', null, p==='P1.8'?'P1.86':p, 'MLDS')} valColor="text-amber-400 bg-[#09090b]"/>)}
            </div>
         </Panel>

         <Panel title="TITIPAN IVP" className="min-h-min">
            <SectionTitle title="IFP" />
            <div className="flex mb-1">
               <div className="w-16"></div>
               <div className="flex-1 grid grid-cols-3 text-center text-[9px] text-slate-400 font-bold uppercase tracking-widest px-0.5">
                  <div>65"</div><div>75"</div><div>86"</div>
               </div>
            </div>
            <div className="space-y-2 mb-3">
               {['Microvision', 'Newline', 'Philips'].map(merk => (
                 <div key={merk} className="flex border border-[#30363d] rounded-sm overflow-hidden">
                    <div className="w-16 text-[8px] flex items-center justify-center bg-[#161b22] text-slate-400 font-bold uppercase truncate px-1">{merk}</div>
                    <div className="flex-1 grid grid-cols-3 divide-x divide-[#30363d]">
                       {['65"', '75"', '85"'].map(u => <div key={u} className="text-[10px] sm:text-[11px] font-mono font-bold text-center text-blue-400 py-1 bg-[#09090b]">{getStok('Monitor', 'IFP', merk, u, 'IVP')}</div>)}
                    </div>
                 </div>
               ))}
            </div>

            <SectionTitle title="VIDEO WALL" />
            <div className="flex mt-2 mb-1">
               <div className="w-16"></div>
               <div className="flex-1 grid grid-cols-4 text-center text-[8px] text-slate-400 font-bold uppercase tracking-widest px-0.5">
                  <div>4935</div><div>5535</div><div>5517</div><div>5588</div>
               </div>
            </div>
            <div className="space-y-2">
               <div className="flex border border-[#30363d] rounded-sm overflow-hidden">
                  <div className="w-16 text-[8px] flex items-center justify-center bg-[#161b22] text-slate-400 font-bold uppercase truncate px-1">Microvision</div>
                  <div className="flex-1 grid grid-cols-4 divide-x divide-[#30363d]">
                     {['4935', '5535', '5517', '5588'].map(u => <div key={u} className="text-[10px] sm:text-[11px] font-mono font-bold text-center text-blue-400 py-1 bg-[#09090b]">{getStok('Monitor', 'VDW', 'Microvision', u, 'IVP')}</div>)}
                  </div>
               </div>

               <div className="flex mt-2 mb-1">
                  <div className="w-16"></div>
                  <div className="flex-1 grid grid-cols-2 text-center text-[8px] text-slate-400 font-bold uppercase tracking-widest px-0.5">
                     <div>49BDL</div><div>55BDL</div>
                  </div>
               </div>
               <div className="flex border border-[#30363d] rounded-sm overflow-hidden">
                  <div className="w-16 text-[9px] flex items-center justify-center bg-[#161b22] text-slate-400 font-bold uppercase truncate px-1">Philips</div>
                  <div className="flex-1 grid grid-cols-2 divide-x divide-[#30363d]">
                     {['49BDL2105X-ik', '55BDL2105X-ik'].map(u => <div key={u} className="text-[10px] sm:text-[11px] font-mono font-bold text-center text-blue-400 py-1 bg-[#09090b]">{getStok('Monitor', 'VDW', 'Philips', u, 'IVP')}</div>)}
                  </div>
               </div>
            </div>
         </Panel>

      </div>
    </div>
  );

  const renderLaporan = () => {
    const filteredLog = historyLog.filter(log => {
      if (log.action !== 'INBOUND') return false;
      if (!log.timestamp) return false;
      const date = new Date(log.timestamp.toMillis());
      return date.getMonth() === reportMonth && date.getFullYear() === reportYear;
    });

    const totalStrada = filteredLog.reduce((sum, log) => log.details.includes('Strada') ? sum + log.qty : sum, 0);
    const totalSMKN = filteredLog.reduce((sum, log) => log.details.includes('SMKN 26') ? sum + log.qty : sum, 0);
    const totalAll = totalStrada + totalSMKN;

    const handleExportCSV = () => {
      if (filteredLog.length === 0) return showNotif("Tidak ada data untuk diexport", "error");
      
      let csvContent = "\uFEFF";
      csvContent += "No;Tanggal;Lokasi;Unit;Pitch/Spek;SN/Range SN;Qty;Project/Keterangan;Admin\n";
      
      filteredLog.forEach((log, index) => {
        const { lokasi, unit, pitch, sn, project } = parseLogDetails(log.details);
        const dateStr = log.timestamp ? new Date(log.timestamp.toMillis()).toLocaleDateString('id-ID') : '-';
        const row = [index + 1, dateStr, `"${lokasi}"`, `"${unit}"`, `"${pitch}"`, `"${sn}"`, log.qty, `"${project}"`, `"${log.user}"`].join(";");
        csvContent += row + "\n";
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `Laporan_Rakitan_${monthNames[reportMonth]}_${reportYear}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotif("File Excel berhasil diunduh!", "success");
    };

    return (
      <div className="flex-1 w-full h-full flex flex-col bg-white print:bg-white text-black overflow-y-auto print:overflow-visible">
        {/* Kontrol Laporan (Hidden saat Print) */}
        <div className="p-4 sm:p-6 border-b border-gray-200 bg-slate-50 print:hidden shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Bulan</label>
              <select value={reportMonth} onChange={e => setReportMonth(Number(e.target.value))} className="bg-white border border-gray-300 text-sm rounded-md px-3 py-1.5 outline-none focus:border-blue-500 shadow-sm">
                {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tahun</label>
              <select value={reportYear} onChange={e => setReportYear(Number(e.target.value))} className="bg-white border border-gray-300 text-sm rounded-md px-3 py-1.5 outline-none focus:border-blue-500 shadow-sm">
                {[...Array(5)].map((_, i) => {
                  const y = new Date().getFullYear() - 2 + i;
                  return <option key={y} value={y}>{y}</option>
                })}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleExportCSV} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-md transition-all duration-150 active:scale-95" title="Download Format Excel">
              <FileSpreadsheet size={18} /> Export Excel
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md transition-all duration-150 active:scale-95">
              <Printer size={18} /> Cetak PDF
            </button>
          </div>
        </div>

        {/* Halaman Cetak Laporan */}
        <div className="p-8 sm:p-12 w-full max-w-6xl mx-auto print:p-0 print:max-w-none">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold uppercase tracking-widest border-b-2 border-black pb-3 inline-block mb-2">REKAPAN LAPORAN RAKITAN</h1>
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-600">PERIODE: {monthNames[reportMonth]} {reportYear}</p>
          </div>

          {/* Kartu Summary */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="border-2 border-black rounded-lg p-4 text-center bg-gray-50 print:bg-transparent">
               <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">TOTAL MPDN STRADA</div>
               <div className="text-3xl font-bold font-mono">{totalStrada}</div>
            </div>
            <div className="border-2 border-black rounded-lg p-4 text-center bg-gray-50 print:bg-transparent">
               <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">TOTAL MVI SMKN 26</div>
               <div className="text-3xl font-bold font-mono">{totalSMKN}</div>
            </div>
            <div className="border-2 border-black rounded-lg p-4 text-center bg-blue-50 print:bg-transparent">
               <div className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-2">TOTAL KESELURUHAN</div>
               <div className="text-4xl font-bold font-mono text-blue-700 print:text-black">{totalAll}</div>
            </div>
          </div>

          {/* Tabel Data */}
          <table className="w-full border-collapse border-2 border-black text-sm">
             <thead>
                <tr className="bg-gray-100 print:bg-transparent">
                   <th className="border border-black px-3 py-3 text-center w-12 font-bold uppercase tracking-wider text-[11px]">No</th>
                   <th className="border border-black px-3 py-3 text-left font-bold uppercase tracking-wider text-[11px]">Tanggal</th>
                   <th className="border border-black px-3 py-3 text-left font-bold uppercase tracking-wider text-[11px]">Lokasi</th>
                   <th className="border border-black px-3 py-3 text-left font-bold uppercase tracking-wider text-[11px]">Unit</th>
                   <th className="border border-black px-3 py-3 text-left font-bold uppercase tracking-wider text-[11px]">Pitch / Spek</th>
                   <th className="border border-black px-3 py-3 text-left font-bold uppercase tracking-wider text-[11px]">SN / Range SN</th>
                   <th className="border border-black px-3 py-3 text-center font-bold uppercase tracking-wider text-[11px] w-16">Qty</th>
                   <th className="border border-black px-3 py-3 text-left font-bold uppercase tracking-wider text-[11px]">Project / Ket</th>
                   <th className="border border-black px-3 py-3 text-left font-bold uppercase tracking-wider text-[11px]">Admin</th>
                </tr>
             </thead>
             <tbody>
                {filteredLog.length === 0 ? (
                  <tr><td colSpan="9" className="border border-black px-4 py-8 text-center italic text-gray-500">Tidak ada data rakitan di periode ini.</td></tr>
                ) : filteredLog.map((log, index) => {
                  const { lokasi, unit, pitch, sn, project } = parseLogDetails(log.details);
                  return (
                    <tr key={log.id}>
                      <td className="border border-black px-3 py-2.5 text-center font-mono text-xs">{index + 1}</td>
                      <td className="border border-black px-3 py-2.5 font-mono text-xs whitespace-nowrap">
                        {log.timestamp ? new Date(log.timestamp.toMillis()).toLocaleDateString('id-ID', {day:'2-digit', month:'long', year:'numeric'}) : '-'}
                      </td>
                      <td className="border border-black px-3 py-2.5 text-xs font-semibold">{lokasi}</td>
                      <td className="border border-black px-3 py-2.5 text-xs font-bold">{unit}</td>
                      <td className="border border-black px-3 py-2.5 text-xs font-mono">{pitch}</td>
                      <td className="border border-black px-3 py-2.5 text-xs font-mono">{sn}</td>
                      <td className="border border-black px-3 py-2.5 text-center font-bold font-mono text-sm">{log.qty}</td>
                      <td className="border border-black px-3 py-2.5 text-xs font-semibold">{project}</td>
                      <td className="border border-black px-3 py-2.5 text-gray-600 text-xs uppercase tracking-wide">{log.user}</td>
                    </tr>
                  )
                })}
             </tbody>
          </table>
          
          <div className="mt-16 flex justify-end">
             <div className="flex flex-col items-center w-48">
               <p className="text-xs mb-16 uppercase tracking-wider text-gray-800 w-full text-center">Mengetahui,</p>
               <p className="text-sm font-bold border-b border-black w-full text-center pb-1">Teguh D</p>
               <p className="text-[10px] mt-1.5 uppercase tracking-widest text-gray-500 text-center">Manager</p>
             </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDocumentViewer = () => (
    <div className="flex-1 w-full h-full flex flex-col gap-3 overflow-hidden bg-[#09090b] p-3 animate-in fade-in duration-500 font-sans print:hidden">
      <div className="border border-[#30363d] bg-[#0d1117] flex flex-col rounded-lg overflow-hidden shadow-md flex-1">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#30363d] bg-[#161b22]">
          <span className="font-bold text-white text-xs sm:text-sm uppercase tracking-widest flex items-center gap-2">
            <FileText size={16} className="text-blue-400"/> {activeDoc?.label || 'DOKUMEN'}
          </span>
          {activeDoc?.url && (
            <a href={activeDoc.url} target="_blank" rel="noopener noreferrer" download
               className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] sm:text-xs font-bold rounded-md transition-colors shadow-sm cursor-pointer active:scale-95">
               <Download size={14} /> Download PDF
            </a>
          )}
        </div>
        <div className="flex-1 p-0 overflow-hidden bg-[#161b22]">
           {activeDoc?.url ? (
             <iframe src={activeDoc.url} className="w-full h-full border-none" title={activeDoc.label} />
           ) : (
             <div className="flex flex-col gap-2 h-full items-center justify-center text-slate-500">
                <FileText size={48} className="opacity-20"/>
                <span className="text-sm font-medium tracking-wider">Pilih dokumen dari menu samping</span>
             </div>
           )}
        </div>
      </div>
    </div>
  );

  const renderForm = () => {
    if (!isAdmin) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-500 animate-in fade-in duration-300 bg-[#09090b] print:hidden">
          <ShieldAlert size={64} className="mb-4 text-slate-600"/>
          <h2 className="text-2xl font-bold text-slate-300 mb-2 tracking-widest uppercase">Restricted Area</h2>
          <p className="text-sm text-center max-w-md mb-6">You need admin privileges to execute stock mutations.</p>
          <button onClick={handleAdminToggle} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-sm font-bold transition-all duration-150 shadow-lg hover:-translate-y-0.5 active:scale-95 active:translate-y-0">
            Login Admin
          </button>
        </div>
      );
    }

    const activeTx = formData.txType || 'inbound';
    const getVdwVariants = () => formData.kategori === 'Monitor' && formData.tipe === 'VDW' ? Object.keys(CATALOG.Monitor.VDW.subVariants) : CATALOG[formData.kategori]?.[formData.tipe]?.variants || CATALOG[formData.kategori]?.variants || [];
    const getSubVariants = () => formData.kategori === 'Monitor' && formData.tipe === 'VDW' && formData.varian ? CATALOG.Monitor.VDW.subVariants[formData.varian] || [] : CATALOG[formData.kategori]?.[formData.tipe]?.subVariants || CATALOG[formData.kategori]?.subVariants || [];

    const isSelectedItemLED = formData.itemId && inventory.find(i => i.id === formData.itemId)?.kategori === 'LED';

    const InputClass = "w-full p-3 bg-[#151518] border border-[#27272a] rounded-lg text-slate-200 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all";
    const LabelClass = "block text-[11px] font-semibold text-slate-400 mb-1.5 tracking-wide uppercase";

    return (
      <div className="max-w-4xl mx-auto w-full h-full flex flex-col animate-in slide-in-from-bottom-4 duration-500 py-4 px-4 print:hidden">
        <div className="bg-[#0f0f11] border border-[#1f1f23] rounded-2xl flex flex-col overflow-hidden flex-1 shadow-2xl">
          
          <div className="flex gap-2 border-b border-[#1f1f23] pb-5 mb-5 mt-4 px-6 pt-3 overflow-x-auto custom-scrollbar relative">
             {/* Indikator Mode Offline di Form */}
             {isOffline && (
               <div className="absolute top-0 right-4 flex items-center gap-1.5 text-[9px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 animate-pulse">
                 <WifiOff size={10} /> OFFLINE MODE
               </div>
             )}

            {[ { id: 'inbound', label: 'INBOUND', icon: PlusCircle },
               { id: 'tagging', label: 'TAGGING', icon: Tag },
               { id: 'revert', label: 'REVERT', icon: RotateCcw },
               { id: 'reject', label: 'REJECT / NG', icon: AlertTriangle },
               { id: 'outbound', label: 'OUTBOUND', icon: MinusCircle }
            ].map(t => (
              <button key={t.id} onClick={() => setFormData({ txType: t.id })}
                className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 px-2 rounded-full text-xs font-bold transition-all duration-150 active:scale-95 ${
                  activeTx === t.id ? (t.id === 'reject' ? 'bg-rose-600 text-white shadow-md shadow-rose-900/20' : 'bg-blue-600 text-white shadow-md shadow-blue-900/20') : 'bg-[#151518] border border-[#27272a] text-slate-400 hover:text-slate-200 hover:border-slate-600'
                }`}>
                <t.icon size={16} /> {t.label}
              </button>
            ))}
          </div>

          <div className="overflow-y-auto custom-scrollbar flex-1 px-8 pb-8">
            {activeTx === 'inbound' && (
              <div className="space-y-6 max-w-2xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className={LabelClass}>Lokasi Gudang</label>
                    <select className={InputClass} value={formData.lokasi || ''} onChange={e => setFormData({...formData, lokasi: e.target.value, kategori: '', tipe: ''})}>
                      <option value="">-- Pilih --</option>{LOKASI.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={LabelClass}>Kategori Unit</label>
                    <select className={InputClass} value={formData.kategori || ''} onChange={e => setFormData({...formData, kategori: e.target.value, tipe: '', varian: '', subVarian: ''})} disabled={!formData.lokasi}>
                      <option value="">-- Pilih --</option>
                      {formData.lokasi === 'MVI SMKN 26' ? <option value="Monitor">Monitor</option> : Object.keys(CATALOG).map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
                  {formData.kategori && CATALOG[formData.kategori] && Object.keys(CATALOG[formData.kategori])[0] !== 'variants' && !CATALOG[formData.kategori].KioskSlim && (
                     <div>
                       <label className={LabelClass}>Tipe Panel</label>
                       <select className={InputClass} value={formData.tipe || ''} onChange={e => setFormData({...formData, tipe: e.target.value, varian: '', subVarian: '', rc: ''})}>
                         <option value="">-- Pilih --</option>{Object.keys(CATALOG[formData.kategori]).map(t => <option key={t} value={t}>{t}</option>)}
                       </select>
                     </div>
                  )}
                  {((formData.kategori === 'Kiosk') || (formData.tipe && formData.kategori !== 'LED')) && (
                    <div>
                      <label className={LabelClass}>Varian / Merk</label>
                      <select className={InputClass} value={formData.varian || ''} onChange={e => setFormData({...formData, varian: e.target.value, subVarian: ''})}>
                        <option value="">-- Pilih --</option>{formData.kategori === 'Kiosk' ? ['Kiosk Slim', 'Kiosk FAT'].map(v => <option key={v} value={v}>{v}</option>) : getVdwVariants().map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                  )}
                  {((formData.kategori === 'LED' && formData.tipe) || (formData.varian && formData.kategori !== 'Kiosk')) && (
                     <div>
                       <label className={LabelClass}>Spesifikasi / Ukuran</label>
                       <select className={InputClass} value={formData.subVarian || ''} onChange={e => setFormData({...formData, subVarian: e.target.value, rc: ''})}>
                         <option value="">-- Pilih --</option>{getSubVariants().map(v => <option key={v} value={v}>{v}</option>)}
                       </select>
                     </div>
                  )}
                  
                  {formData.kategori === 'LED' && formData.subVarian && (
                     <div>
                       <label className={LabelClass}>Receiving Card (Opsional)</label>
                       <select className={InputClass} value={formData.rc || ''} onChange={e => setFormData({...formData, rc: e.target.value})}>
                         <option value="">-- Pilih --</option>{getAvailableRC(formData.tipe, formData.subVarian).map(r => <option key={r} value={r}>{r}</option>)}
                       </select>
                     </div>
                  )}

                  {formData.kategori === 'LED' && (
                     <div>
                       <label className={`${LabelClass} text-blue-400`}>Batch Module (Khusus LED)</label>
                       <input type="text" className={`${InputClass} border-blue-900/50`} placeholder="Contoh: 2601" value={formData.batch || ''} onChange={e => setFormData({...formData, batch: e.target.value})} />
                     </div>
                  )}
                  
                  {/* INPUT KHUSUS LED */}
                  {formData.kategori === 'LED' && (
                     <div className="sm:col-span-2">
                       <label className={`${LabelClass} text-blue-400`}>Range SN / Serial Number</label>
                       <input type="text" className={`${InputClass} border-blue-900/50`} placeholder="Contoh: 0001-0100 atau SN12345" value={formData.rangeSN || ''} onChange={e => setFormData({...formData, rangeSN: e.target.value})} />
                     </div>
                  )}

                  {/* INPUT KHUSUS SELAIN LED */}
                  {formData.kategori && formData.kategori !== 'LED' && (
                     <div className="sm:col-span-2">
                       <label className={`${LabelClass} text-blue-400`}>Daftar Serial Number (Wajib - Pisahkan dgn Koma/Spasi)</label>
                       <textarea className={`${InputClass} min-h-[80px] border-blue-900/50`} placeholder="Misal: SN123, SN456" value={formData.processSNs || ''} onChange={e => setFormData({...formData, processSNs: e.target.value})} />
                     </div>
                  )}

                  <div className="sm:col-span-2">
                     <label className={`${LabelClass} text-blue-400`}>Keterangan / Nama Project (Opsional)</label>
                     <input type="text" className={`${InputClass} border-blue-900/50`} placeholder="Contoh: RS Medika (Kosongkan jika stok gudang)" value={formData.projectSN || ''} onChange={e => setFormData({...formData, projectSN: e.target.value})} />
                  </div>

                  <div className="sm:col-span-2 mt-2">
                    <label className={LabelClass}>{formData.kategori === 'LED' ? 'Volume Unit Masuk (Qty)' : 'Total Unit Masuk (Dihitung Otomatis)'}</label>
                    {formData.kategori === 'LED' ? (
                      <input type="number" min="1" className={`${InputClass} text-3xl font-mono text-center py-3`} placeholder="0" value={formData.qty || ''} onChange={e => setFormData({...formData, qty: e.target.value})} />
                    ) : (
                      <div className={`${InputClass} text-3xl font-mono text-center py-3 bg-[#0a0a0c] text-blue-400 border-dashed border-blue-900/50`}>
                        {formData.processSNs ? formData.processSNs.split(/[\s,]+/).filter(Boolean).length : 0} Unit
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={handleInbound} disabled={isSubmitting} className={`w-full py-4 mt-6 text-white text-sm font-bold rounded-lg transition-all duration-150 shadow-md hover:-translate-y-0.5 active:scale-95 active:shadow-sm uppercase tracking-widest flex justify-center items-center gap-2 disabled:opacity-50 disabled:pointer-events-none ${isOffline ? 'bg-amber-600 hover:bg-amber-500' : 'bg-blue-600 hover:bg-blue-500'}`}>
                   {isSubmitting ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : isOffline ? 'Simpan Offline (Menunggu Sinyal)' : 'Execute Inbound'}
                </button>
              </div>
            )}

            {activeTx === 'tagging' && (
              <div className="space-y-6 max-w-2xl mx-auto">
                <div>
                  <label className={LabelClass}>Pilih Aset Gudang Pusat (WIP)</label>
                  <select className={InputClass} value={formData.itemId || ''} onChange={e => {
                    const sel = inventory.find(i => i.id === e.target.value);
                    setFormData({...formData, itemId: e.target.value, target: sel ? (sel.kategori === 'Monitor' ? 'IVP' : 'MLDS') : ''});
                  }}>
                    <option value="">-- Tampilkan Item Tersedia --</option>
                    {inventory.filter(i => i.stokMPDN > 0).map(i => (
                      <option key={i.id} value={i.id}>{i.kategori} {i.tipe!=="-"?i.tipe:""} {i.varian!=="-"?i.varian:""} {i.subVarian} (Tersedia: {i.stokMPDN} Unit)</option>
                    ))}
                  </select>
                </div>
                
                {formData.itemId && !isSelectedItemLED && (
                  <div>
                    <label className={`${LabelClass} text-blue-400`}>Daftar Serial Number (Wajib - Pisahkan dgn Koma/Spasi)</label>
                    <textarea className={`${InputClass} min-h-[80px] border-blue-900/50`} placeholder="Misal: SN123, SN456" value={formData.processSNs || ''} onChange={e => setFormData({...formData, processSNs: e.target.value})} />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className={LabelClass}>Target Alokasi <span className="text-blue-500 ml-1">(Locked)</span></label>
                    <select disabled className={`${InputClass} opacity-60 bg-[#0f0f11] font-bold`} value={formData.target || ''}>
                      <option value="">-- Terkunci Otomatis --</option>
                      <option value="IVP">IVP</option><option value="MLDS">MLDS</option>
                    </select>
                  </div>
                  <div>
                    <label className={LabelClass}>ID Project / Nama Klien</label>
                    <input type="text" className={InputClass} placeholder="Contoh: PRJ-RS-MEDIKA" value={formData.project || ''} onChange={e => setFormData({...formData, project: e.target.value})} />
                  </div>
                  <div className="sm:col-span-2 mt-2">
                    <label className={LabelClass}>{isSelectedItemLED ? 'Volume Booking (Qty)' : 'Total Unit (Dihitung Otomatis)'}</label>
                    {isSelectedItemLED ? (
                       <input type="number" min="1" className={`${InputClass} text-3xl font-mono text-center py-3`} placeholder="0" value={formData.qty || ''} onChange={e => setFormData({...formData, qty: e.target.value})} />
                    ) : (
                       <div className={`${InputClass} text-3xl font-mono text-center py-3 bg-[#0a0a0c] text-blue-400 border-dashed border-blue-900/50`}>
                          {formData.processSNs ? formData.processSNs.split(/[\s,]+/).filter(Boolean).length : 0} Unit
                       </div>
                    )}
                  </div>
                </div>
                <button onClick={handleTagging} disabled={isSubmitting} className={`w-full py-4 mt-6 text-white text-sm font-bold rounded-lg transition-all duration-150 shadow-md hover:-translate-y-0.5 active:scale-95 active:shadow-sm uppercase tracking-widest flex justify-center items-center gap-2 disabled:opacity-50 disabled:pointer-events-none ${isOffline ? 'bg-amber-600 hover:bg-amber-500' : 'bg-blue-600 hover:bg-blue-500'}`}>
                   {isSubmitting ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : isOffline ? 'Simpan Offline' : 'Execute Tagging'}
                </button>
              </div>
            )}

            {(activeTx === 'revert' || activeTx === 'outbound') && (
              <div className="space-y-6 max-w-2xl mx-auto">
                <div>
                  <label className={LabelClass}>Pilih Aset yang Tersedia</label>
                  <select className={InputClass} value={formData.itemId || ''} onChange={e => setFormData({...formData, itemId: e.target.value, alokasiId: ''})}>
                    <option value="">-- Daftar Item --</option>
                    {inventory.filter(i => activeTx === 'revert' ? ((i.alokasi && i.alokasi.length > 0) || i.stokNG > 0) : ((i.stokMPDN > 0) || (i.alokasi && i.alokasi.length > 0) || i.stokNG > 0)).map(i => <option key={i.id} value={i.id}>{i.kategori} {i.tipe!=="-"?i.tipe:""} {i.varian!=="-"?i.varian:""} {i.subVarian}</option>)}
                  </select>
                </div>
                {formData.itemId && (
                  <div>
                    <label className={LabelClass}>{activeTx === 'revert' ? 'Pilih Project / Lokasi NG' : 'Pilih Sumber Stok'}</label>
                    <select className={InputClass} value={formData.alokasiId || ''} onChange={e => setFormData({...formData, alokasiId: e.target.value})}>
                      <option value="">{activeTx === 'revert' ? '-- Daftar Project / NG --' : '-- Pilih Sumber --'}</option>
                      {activeTx === 'outbound' && inventory.find(i => i.id === formData.itemId)?.stokMPDN > 0 && (
                        <option value="MPDN">Gudang Pusat (W.I.P) — Sisa {inventory.find(i => i.id === formData.itemId)?.stokMPDN} Unit</option>
                      )}
                      {activeTx === 'outbound' && inventory.find(i => i.id === formData.itemId)?.stokNG > 0 && (
                        <option value="NG">Unit Not Good (NG) — Sisa {inventory.find(i => i.id === formData.itemId)?.stokNG} Unit</option>
                      )}
                      {inventory.find(i => i.id === formData.itemId)?.alokasi.map(a => <option key={a.id} value={a.id}>[{a.target}] {a.project} — {a.qty} Unit</option>)}
                    </select>
                  </div>
                )}

                {formData.itemId && !isSelectedItemLED && (
                  <div>
                    <label className={`${LabelClass} text-blue-400`}>Daftar Serial Number (Wajib - Pisahkan dgn Koma/Spasi)</label>
                    <textarea className={`${InputClass} min-h-[80px] border-blue-900/50`} placeholder="Misal: SN123, SN456" value={formData.processSNs || ''} onChange={e => setFormData({...formData, processSNs: e.target.value})} />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="mt-2">
                    <label className={LabelClass}>{isSelectedItemLED ? 'Volume Eksekusi (Qty)' : 'Total Unit (Dihitung Otomatis)'}</label>
                    {isSelectedItemLED ? (
                       <input type="number" min="1" className={`${InputClass} text-3xl font-mono text-center py-3`} placeholder="0" value={formData.qty || ''} onChange={e => setFormData({...formData, qty: e.target.value})} />
                    ) : (
                       <div className={`${InputClass} text-3xl font-mono text-center py-3 bg-[#0a0a0c] text-blue-400 border-dashed border-blue-900/50`}>
                          {formData.processSNs ? formData.processSNs.split(/[\s,]+/).filter(Boolean).length : 0} Unit
                       </div>
                    )}
                  </div>
                  <div className="mt-2">
                    <label className={LabelClass}>{activeTx === 'revert' ? 'Alasan Penarikan' : 'Tujuan Pengiriman / Ket'}</label>
                    <input type="text" className={InputClass} placeholder={activeTx === 'revert' ? "Misal: Dibatalkan" : "Misal: Dikirim ke Klien A"} value={formData.reason || ''} onChange={e => setFormData({...formData, reason: e.target.value})} />
                  </div>
                </div>
                
                {activeTx === 'revert' ? (
                  <button onClick={handleRevert} disabled={isSubmitting} className={`w-full py-4 mt-6 text-white text-sm font-bold rounded-lg transition-all duration-150 shadow-md hover:-translate-y-0.5 active:scale-95 active:shadow-sm uppercase tracking-widest flex justify-center items-center gap-2 disabled:opacity-50 disabled:pointer-events-none ${isOffline ? 'bg-amber-600 hover:bg-amber-500' : 'bg-amber-600 hover:bg-amber-500'}`}>
                    {isSubmitting ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : isOffline ? 'Simpan Offline' : 'Execute Revert (Tarik ke Pusat)'}
                  </button>
                ) : (
                  <button onClick={handleOutbound} disabled={isSubmitting} className={`w-full py-4 mt-6 text-white text-sm font-bold rounded-lg transition-all duration-150 shadow-md hover:-translate-y-0.5 active:scale-95 active:shadow-sm uppercase tracking-widest flex justify-center items-center gap-2 disabled:opacity-50 disabled:pointer-events-none ${isOffline ? 'bg-amber-600 hover:bg-amber-500' : 'bg-rose-600 hover:bg-rose-500'}`}>
                    {isSubmitting ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : isOffline ? 'Simpan Offline' : 'Execute Outbound (Kirim Project)'}
                  </button>
                )}
              </div>
            )}

            {activeTx === 'reject' && (
              <div className="space-y-6 max-w-2xl mx-auto">
                <div className="flex bg-[#1a1a1a] p-1 rounded-lg mb-6 border border-[#30363d]">
                  <button onClick={() => setFormData({...formData, rejectMode: 'to_ng'})} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all duration-150 active:scale-95 ${!formData.rejectMode || formData.rejectMode === 'to_ng' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>Pindah ke NG (Barang Rusak)</button>
                  <button onClick={() => setFormData({...formData, rejectMode: 'restore'})} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all duration-150 active:scale-95 ${formData.rejectMode === 'restore' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>Pulihkan dari NG (Servis OK)</button>
                </div>

                <div>
                  <label className={LabelClass}>Pilih Aset Monitor</label>
                  <select className={InputClass} value={formData.itemId || ''} onChange={e => setFormData({...formData, itemId: e.target.value})}>
                    <option value="">-- Daftar Monitor Tersedia --</option>
                    {inventory.filter(i => (formData.rejectMode === 'restore' ? i.stokNG > 0 : i.stokMPDN > 0) && i.kategori === 'Monitor').map(i => (
                      <option key={i.id} value={i.id}>{i.kategori} {i.tipe!=="-"?i.tipe:""} {i.varian!=="-"?i.varian:""} {i.subVarian} (Tersedia: {formData.rejectMode === 'restore' ? i.stokNG : i.stokMPDN} Unit)</option>
                    ))}
                  </select>
                </div>

                {formData.itemId && (
                  <div>
                    <label className={`${LabelClass} text-blue-400`}>Daftar Serial Number (Wajib - Pisahkan dgn Koma/Spasi)</label>
                    <textarea className={`${InputClass} min-h-[80px] border-blue-900/50`} placeholder="Misal: SN123, SN456" value={formData.processSNs || ''} onChange={e => setFormData({...formData, processSNs: e.target.value})} />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="mt-2">
                    <label className={LabelClass}>Total Unit (Dihitung Otomatis)</label>
                    <div className={`${InputClass} text-3xl font-mono text-center py-3 bg-[#0a0a0c] text-blue-400 border-dashed border-blue-900/50`}>
                      {formData.processSNs ? formData.processSNs.split(/[\s,]+/).filter(Boolean).length : 0} Unit
                    </div>
                  </div>
                  <div className="mt-2">
                    <label className={LabelClass}>{formData.rejectMode === 'restore' ? 'Keterangan Perbaikan' : 'Alasan / Keterangan Kerusakan'}</label>
                    <input type="text" className={InputClass} placeholder={formData.rejectMode === 'restore' ? "Misal: Selesai diservis / Ganti part" : "Misal: Layar pecah / Blank"} value={formData.reason || ''} onChange={e => setFormData({...formData, reason: e.target.value})} />
                  </div>
                </div>
                
                {formData.rejectMode === 'restore' ? (
                  <button onClick={handleReject} disabled={isSubmitting} className={`w-full py-4 mt-6 text-white text-sm font-bold rounded-lg transition-all duration-150 shadow-md hover:-translate-y-0.5 active:scale-95 active:shadow-sm uppercase tracking-widest flex justify-center items-center gap-2 disabled:opacity-50 disabled:pointer-events-none ${isOffline ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}>
                    {isSubmitting ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : isOffline ? 'Simpan Offline' : 'Execute Restore (Pulihkan ke Pusat)'}
                  </button>
                ) : (
                  <button onClick={handleReject} disabled={isSubmitting} className={`w-full py-4 mt-6 text-white text-sm font-bold rounded-lg transition-all duration-150 shadow-md hover:-translate-y-0.5 active:scale-95 active:shadow-sm uppercase tracking-widest flex justify-center items-center gap-2 disabled:opacity-50 disabled:pointer-events-none ${isOffline ? 'bg-amber-600 hover:bg-amber-500' : 'bg-rose-600 hover:bg-rose-500'}`}>
                    {isSubmitting ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : isOffline ? 'Simpan Offline' : 'Execute Reject (Pindah ke NG)'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#050505] text-slate-300 font-sans overflow-hidden text-sm selection:bg-blue-500/30">
      
      {/* NOTIFICATION: Pindah ke Pojok Kanan Atas */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2.5 px-6 py-3 rounded-full shadow-2xl text-white font-bold tracking-wide animate-in slide-in-from-top-4 fade-in duration-300 border ${notification.type === 'error' ? 'bg-rose-600 border-rose-500' : notification.type === 'info' ? 'bg-blue-600 border-blue-500' : 'bg-emerald-600 border-emerald-500'} print:hidden`}>
          {notification.type === 'error' ? <X size={18}/> : <Check size={18}/>}
          {notification.msg}
        </div>
      )}

      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="w-16 sm:w-56 bg-[#0a0a0a] border-r border-[#1a1a1a] flex flex-col shrink-0 z-20 print:hidden">
        <div className="pt-6 sm:pt-8 pb-4 sm:pb-6 px-2 sm:px-6 flex justify-center sm:justify-start items-center">
          <img 
             src="https://github.com/MVI-PDN/Keluhan-Pelanggan/blob/main/microvision-logo.webp?raw=true" 
             alt="Microvision Logo" 
             className="h-10 sm:h-14 w-auto object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.1)] -ml-1"
          />
        </div>
        
        <div className="flex-1 flex flex-col gap-1.5 px-2 sm:px-4 mt-4 overflow-y-auto custom-scrollbar pb-4">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'mutasi', label: 'Form Mutasi', icon: Activity },
            { id: 'laporan', label: 'Laporan Rakitan', icon: FileBarChart }
          ].map(tab => {
            const isMutasiDisabled = tab.id === 'mutasi' && !isAdmin;
            return (
              <button key={tab.id} onClick={() => { if(!isMutasiDisabled) setActiveTab(tab.id); }}
                className={`flex items-center justify-center sm:justify-start gap-3 px-2 sm:px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-[0.98] ${
                  activeTab === tab.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a1a1a]'
                } ${isMutasiDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
                <tab.icon size={20} /> <span className="hidden sm:block">{tab.label}</span>
              </button>
            )
          })}

          {/* DOKUMEN DROPDOWN */}
          <div className="flex flex-col gap-1 w-full mt-1">
            <button onClick={() => setIsDocMenuOpen(!isDocMenuOpen)}
              className={`flex items-center justify-center sm:justify-between px-2 sm:px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-[0.98] hover:bg-[#1a1a1a] ${activeTab === 'document' || isDocMenuOpen ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}>
              <div className="flex items-center gap-3">
                 <BookOpen size={20} /> <span className="hidden sm:block">Dokumen</span>
              </div>
              <ChevronDown size={16} className={`hidden sm:block transition-transform ${isDocMenuOpen ? 'rotate-180 text-blue-400' : ''}`} />
            </button>

            {isDocMenuOpen && (
              <div className="flex flex-col gap-1 pl-2 sm:pl-7 pr-2 animate-in slide-in-from-top-2 duration-200">
                {DOC_LIST.map(doc => {
                  if (doc.isGroup) {
                    const isOpen = doc.id === 'sop' ? isSopMenuOpen : doc.id === 'pengembangan' ? isPengembanganOpen : isDesign3DMenuOpen;
                    const toggleOpen = () => {
                      if (doc.id === 'sop') setIsSopMenuOpen(!isSopMenuOpen);
                      else if (doc.id === 'pengembangan') setIsPengembanganOpen(!isPengembanganOpen);
                      else setIsDesign3DMenuOpen(!isDesign3DMenuOpen);
                    };

                    return (
                      <div key={doc.id} className="flex flex-col gap-1 w-full">
                        <button onClick={toggleOpen}
                          className={`flex items-center justify-between py-2.5 px-3 rounded-lg transition-all duration-150 active:scale-95 text-left text-[11px] font-bold ${isOpen ? 'text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a1a1a]'}`}>
                          <span className="hidden sm:block">{doc.label}</span>
                          <FileText size={14} className="sm:hidden mx-auto"/>
                          <ChevronDown size={14} className={`hidden sm:block transition-transform ${isOpen ? 'rotate-180 text-blue-400' : ''}`} />
                        </button>
                        
                        {isOpen && (
                          <div className="flex flex-col gap-1 pl-3 sm:pl-4 border-l border-[#30363d] ml-3 sm:ml-2 animate-in slide-in-from-top-1 duration-200">
                            {doc.items.map(subDoc => (
                              <button key={subDoc.id} onClick={() => { setActiveTab('document'); setActiveDoc(subDoc); }}
                                className={`text-left text-[10px] font-bold py-2 px-3 rounded-lg transition-all duration-150 active:scale-95 ${
                                  activeTab === 'document' && activeDoc?.id === subDoc.id ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-500 hover:text-slate-300 hover:bg-[#1a1a1a] border border-transparent'
                                }`}>
                                <span className="hidden sm:block truncate">{subDoc.label}</span>
                                <FileText size={12} className="sm:hidden mx-auto"/>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  }
                  
                  return (
                    <button key={doc.id} onClick={() => { setActiveTab('document'); setActiveDoc(doc); }}
                      className={`text-left text-[11px] font-bold py-2 px-3 rounded-lg transition-all duration-150 active:scale-95 ${
                        activeTab === 'document' && activeDoc?.id === doc.id ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a1a1a] border border-transparent'
                      }`}>
                      <span className="hidden sm:block">{doc.label}</span>
                      <FileText size={14} className="sm:hidden mx-auto"/>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* EXTERNAL LINKS */}
          <div className="mt-1">
            {EXT_LINKS.map(link => (
              <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center sm:justify-start gap-3 px-2 sm:px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-95 text-slate-400 hover:text-blue-400 hover:bg-blue-900/10 group">
                <link.icon size={20} /> <span className="hidden sm:block">{link.label}</span>
                <ExternalLink size={14} className="hidden sm:block ml-auto opacity-0 group-hover:opacity-100 transition-opacity"/>
              </a>
            ))}
          </div>
        </div>

        {/* Support Section & Profile */}
        <div className="p-4 sm:p-6 border-t border-[#1a1a1a] shrink-0">
          {isAdmin && adminProfile ? (
            <div className="flex items-center justify-between bg-[#161b22] p-3 rounded-xl border border-[#30363d] cursor-pointer hover:border-slate-500 transition-all duration-150 active:scale-95 shadow-sm" onClick={handleAdminToggle} title="Logout">
              <div className="flex items-center gap-3 overflow-hidden">
                <img src={adminProfile.avatar} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-blue-500/50 bg-[#0d1117] shrink-0" />
                <div className="flex flex-col truncate hidden sm:flex">
                  <span className="text-sm font-bold text-white truncate">{adminProfile.name}</span>
                  <span className="text-[10px] text-emerald-400 font-bold tracking-widest flex items-center gap-1.5 mt-0.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> ADMIN</span>
                </div>
              </div>
              <LogOut size={16} className="text-slate-400 hover:text-rose-400 shrink-0 hidden sm:block"/>
            </div>
          ) : (
            <button onClick={handleAdminToggle} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[#27272a] hover:border-slate-500 transition-all duration-150 text-slate-300 font-semibold text-sm hover:bg-[#1a1a1a] active:scale-95" title="Login Admin">
              <Settings size={18} className="sm:hidden"/>
              <span className="hidden sm:block">Admin Access</span>
            </button>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#09090b] print:bg-white print:m-0 print:p-0">
        <style>{`
          @media print {
            body { background: white !important; color: black !important; }
            .print\\:hidden { display: none !important; }
            .print\\:block { display: block !important; }
            .print\\:bg-white { background-color: white !important; }
            .print\\:text-black { color: black !important; }
            .print\\:overflow-visible { overflow: visible !important; }
            .print\\:p-0 { padding: 0 !important; }
            .print\\:max-w-none { max-width: none !important; }
            .print\\:bg-transparent { background-color: transparent !important; }
          }
        `}</style>
        {/* DYNAMIC CONTENT */}
        {activeTab === 'dashboard' && renderGSheetDashboard()}
        {activeTab === 'mutasi' && renderForm()}
        {activeTab === 'document' && renderDocumentViewer()}
        {activeTab === 'laporan' && renderLaporan()}

        {/* MODAL EDIT SUPER LENGKAP */}
        {editModal && (
           <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 print:hidden">
              <div className="bg-[#0f0f11] border border-[#30363d] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl animate-in zoom-in-95 duration-200">
                 <h3 className="text-white font-bold mb-5 uppercase tracking-widest text-sm flex items-center gap-2 border-b border-[#30363d] pb-3">
                   <Edit size={16} className="text-blue-400"/> Edit Data Inbound Lengkap
                 </h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Lokasi Gudang */}
                    <div>
                        <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Lokasi Gudang</label>
                        <select className="w-full bg-[#161b22] border border-[#30363d] rounded-lg p-2.5 text-xs text-white focus:border-blue-500 outline-none" value={editModal.lokasiAsal} onChange={e => setEditModal({...editModal, lokasiAsal: e.target.value, kategori: '', tipe: ''})}>
                            {LOKASI.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>
                    {/* Kategori Unit */}
                    <div>
                        <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Kategori Unit</label>
                        <select className="w-full bg-[#161b22] border border-[#30363d] rounded-lg p-2.5 text-xs text-white focus:border-blue-500 outline-none" value={editModal.kategori} onChange={e => setEditModal({...editModal, kategori: e.target.value, tipe: '', varian: '', subVarian: ''})}>
                            {editModal.lokasiAsal === 'MVI SMKN 26' ? <option value="Monitor">Monitor</option> : Object.keys(CATALOG).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </div>
                    {/* Tipe Panel */}
                    {editModal.kategori && CATALOG[editModal.kategori] && Object.keys(CATALOG[editModal.kategori])[0] !== 'variants' && !CATALOG[editModal.kategori].KioskSlim && (
                         <div>
                           <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Tipe Panel</label>
                           <select className="w-full bg-[#161b22] border border-[#30363d] rounded-lg p-2.5 text-xs text-white focus:border-blue-500 outline-none" value={editModal.tipe || ''} onChange={e => setEditModal({...editModal, tipe: e.target.value, varian: '', subVarian: '', rc: ''})}>
                             <option value="">-- Pilih --</option>{Object.keys(CATALOG[editModal.kategori]).map(t => <option key={t} value={t}>{t}</option>)}
                           </select>
                         </div>
                    )}
                    {/* Varian / Merk */}
                    {((editModal.kategori === 'Kiosk') || (editModal.tipe && editModal.kategori !== 'LED')) && (
                        <div>
                          <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Varian / Merk</label>
                          <select className="w-full bg-[#161b22] border border-[#30363d] rounded-lg p-2.5 text-xs text-white focus:border-blue-500 outline-none" value={editModal.varian || ''} onChange={e => setEditModal({...editModal, varian: e.target.value, subVarian: ''})}>
                            <option value="">-- Pilih --</option>{editModal.kategori === 'Kiosk' ? ['Kiosk Slim', 'Kiosk FAT'].map(v => <option key={v} value={v}>{v}</option>) : (editModal.kategori === 'Monitor' && editModal.tipe === 'VDW' ? Object.keys(CATALOG.Monitor.VDW.subVariants) : CATALOG[editModal.kategori]?.[editModal.tipe]?.variants || CATALOG[editModal.kategori]?.variants || []).map(v => <option key={v} value={v}>{v}</option>)}
                          </select>
                        </div>
                    )}
                    {/* Spesifikasi / Ukuran */}
                    {((editModal.kategori === 'LED' && editModal.tipe) || (editModal.varian && editModal.kategori !== 'Kiosk')) && (
                         <div>
                           <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Spesifikasi / Ukuran</label>
                           <select className="w-full bg-[#161b22] border border-[#30363d] rounded-lg p-2.5 text-xs text-white focus:border-blue-500 outline-none" value={editModal.subVarian || ''} onChange={e => setEditModal({...editModal, subVarian: e.target.value, rc: ''})}>
                             <option value="">-- Pilih --</option>{(editModal.kategori === 'Monitor' && editModal.tipe === 'VDW' && editModal.varian ? CATALOG.Monitor.VDW.subVariants[editModal.varian] || [] : CATALOG[editModal.kategori]?.[editModal.tipe]?.subVariants || CATALOG[editModal.kategori]?.subVariants || []).map(v => <option key={v} value={v}>{v}</option>)}
                           </select>
                         </div>
                    )}
                    {/* Receiving Card */}
                    {editModal.kategori === 'LED' && editModal.subVarian && (
                         <div>
                           <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Receiving Card (Opsional)</label>
                           <select className="w-full bg-[#161b22] border border-[#30363d] rounded-lg p-2.5 text-xs text-white focus:border-blue-500 outline-none" value={editModal.rc || ''} onChange={e => setEditModal({...editModal, rc: e.target.value})}>
                             <option value="">-- Pilih --</option>{getAvailableRC(editModal.tipe, editModal.subVarian).map(r => <option key={r} value={r}>{r}</option>)}
                           </select>
                         </div>
                    )}

                    {/* Batch Module */}
                    {editModal.kategori === 'LED' && (
                         <div>
                           <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Batch Module</label>
                           <input type="text" className="w-full bg-[#161b22] border border-[#30363d] rounded-lg p-2.5 text-xs text-white focus:border-blue-500 outline-none" value={editModal.batch} onChange={e => setEditModal({...editModal, batch: e.target.value})} />
                         </div>
                    )}
                    
                    {/* SN */}
                    <div className={editModal.kategori === 'LED' ? '' : 'sm:col-span-2'}>
                       <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Range SN / Serial Number</label>
                       <input type="text" className="w-full bg-[#161b22] border border-[#30363d] rounded-lg p-2.5 text-xs text-white focus:border-blue-500 outline-none" value={editModal.rangeSN} onChange={e => setEditModal({...editModal, rangeSN: e.target.value})} />
                    </div>

                    {/* Project */}
                    <div className="sm:col-span-2">
                       <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Keterangan / Project</label>
                       <input type="text" className="w-full bg-[#161b22] border border-[#30363d] rounded-lg p-2.5 text-xs text-white focus:border-blue-500 outline-none" value={editModal.project} onChange={e => setEditModal({...editModal, project: e.target.value})} />
                    </div>

                    {/* Qty */}
                    {editModal.kategori === 'LED' && (
                       <div className="sm:col-span-2">
                         <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Volume Unit Masuk (Qty)</label>
                         <input type="number" min="1" className="w-full bg-[#0a0a0c] border border-[#30363d] rounded-lg p-3 text-xl font-mono text-center text-blue-400 focus:border-blue-500 outline-none border-dashed" value={editModal.qty} onChange={e => setEditModal({...editModal, qty: e.target.value})} />
                       </div>
                    )}
                 </div>
                 
                 <div className="flex gap-3 mt-8">
                    <button onClick={() => setEditModal(null)} className="flex-1 py-2.5 rounded-lg border border-[#30363d] text-slate-300 text-xs font-bold hover:bg-[#161b22] transition-all duration-150 active:scale-95">Batal</button>
                    <button onClick={async () => {
                        try {
                            const oldItemId = editModal.oldItemId;
                            const oldItem = inventory.find(i => i.id === oldItemId);
                            if (!oldItem) throw new Error("Item lama tidak ditemukan");

                            const newLoc = editModal.lokasiAsal;
                            const newCat = editModal.kategori;
                            const newTipe = editModal.tipe;
                            const newVar = editModal.varian;
                            const newSubVar = editModal.subVarian;
                            const newRc = editModal.rc;
                            const isLED = newCat === 'LED';

                            const newItemId = `${newLoc}-${newCat}-${newTipe || ''}-${newVar || ''}-${newSubVar || ''}-${newRc || ''}`.replace(/\s+/g, '-').toLowerCase();
                            const newItem = inventory.find(i => i.id === newItemId);

                            let parsedQty = parseInt(editModal.qty);
                            if (!isLED) parsedQty = 1; 

                            const diffQty = parsedQty - editModal.oldQty;

                            const updatedSnEntry = {
                                id: editModal.id,
                                batch: isLED ? (editModal.batch || '-') : '-',
                                rangeSN: editModal.rangeSN || '-',
                                project: editModal.project || '-',
                                qty: parsedQty,
                                date: editModal.date || new Date().toISOString()
                            };

                            if (oldItemId === newItemId) {
                                if (oldItem.stokMPDN + diffQty < 0) throw new Error("Gagal: Stok WIP akan menjadi negatif! Hapus/Revert alokasi dulu.");
                                const updatedSnList = oldItem.snList.map(sn => sn.id === editModal.id ? updatedSnEntry : sn);
                                await updateDoc(getDbDoc('inventory', oldItemId), {
                                    snList: updatedSnList,
                                    stokMPDN: oldItem.stokMPDN + diffQty
                                });
                            } else {
                                if (oldItem.stokMPDN - editModal.oldQty < 0) throw new Error("Gagal: Stok asal tidak cukup untuk dipindah, sedang ada alokasi!");

                                const filteredSnList = oldItem.snList.filter(sn => sn.id !== editModal.id);
                                await updateDoc(getDbDoc('inventory', oldItemId), {
                                    snList: filteredSnList,
                                    stokMPDN: oldItem.stokMPDN - editModal.oldQty
                                });

                                if (newItem) {
                                    await updateDoc(getDbDoc('inventory', newItemId), {
                                        snList: [...(newItem.snList || []), updatedSnEntry],
                                        stokMPDN: newItem.stokMPDN + parsedQty
                                    });
                                } else {
                                    await setDoc(getDbDoc('inventory', newItemId), {
                                        kategori: newCat, tipe: newTipe || '-', varian: newVar || '-', subVarian: newSubVar || '-', rc: newRc || '-',
                                        lokasiAsal: newLoc, stokMPDN: parsedQty, stokIVP: 0, stokMLDS: 0, stokNG: 0, alokasi: [], snList: [updatedSnEntry]
                                    });
                                }
                            }

                            await addHistory('EDIT', `Update Spesifikasi/SN Inbound: ${updatedSnEntry.rangeSN} (Qty: ${editModal.oldQty} -> ${parsedQty})`);
                            setEditModal(null);
                            showNotif("Data Inbound berhasil diperbarui secara menyeluruh!", "success");
                        } catch (e) {
                            showNotif(e.message || "Gagal mengedit data", "error");
                        }
                    }} className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all duration-150 shadow-md shadow-blue-900/20 active:scale-95 active:shadow-sm">Simpan Perubahan Lengkap</button>
                 </div>
              </div>
           </div>
        )}
      </main>

    </div>
  );
}

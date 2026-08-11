import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, addDoc, updateDoc, deleteDoc, serverTimestamp, enableIndexedDbPersistence } from 'firebase/firestore';
import { Package, ShieldAlert, PlusCircle, MinusCircle, Tag, RotateCcw, Box, Check, X, Search, Activity, Hexagon, FileText, BookOpen, LogOut, Trash2, Edit, Settings, LayoutDashboard, MessageSquare, Wrench, ChevronDown, ExternalLink, Download, FileBarChart, Printer, AlertTriangle, Copy, FileSpreadsheet, WifiOff, Info, Users, Link } from 'lucide-react';

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

try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') console.warn("Multiple tabs open, persistence can only be enabled in one tab at a time.");
    else if (err.code === 'unimplemented') console.warn("Browser tidak support persistence");
  });
} catch (e) { console.warn("Persistence failed", e); }

const appId = typeof window !== 'undefined' && window.__app_id ? window.__app_id.replace(/\//g, '-') : 'default-app-id';
const getDbCollection = (colName) => collection(db, 'artifacts', appId, 'public', 'data', colName);
const getDbDoc = (colName, documentId) => doc(db, 'artifacts', appId, 'public', 'data', colName, documentId);

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

const LOKASI = ['MPDN Strada', 'MVI SMKN 26'];
const TARGET_ALOKASI = ['IVP', 'MLDS'];
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

const OJT_WEEKS = [
    { id: 1, label: "Minggu 1", dateRange: "20 - 24 Juli 2026" }, { id: 3, label: "Minggu 3", dateRange: "3 - 7 Agustus 2026" }, { id: 5, label: "Minggu 5", dateRange: "18 - 21 Agustus 2026" }, { id: 7, label: "Minggu 7", dateRange: "31 Agustus - 4 September 2026" }, { id: 9, label: "Minggu 9", dateRange: "14 - 18 September 2026" },
    { id: 11, label: "Minggu 11", dateRange: "12 - 16 Oktober 2026" }, { id: 13, label: "Minggu 13", dateRange: "26 - 30 Oktober 2026" }, { id: 15, label: "Minggu 15", dateRange: "9 - 13 November 2026" }, { id: 17, label: "Minggu 17", dateRange: "23 - 27 November 2026" }, { id: 19, label: "Minggu 19", dateRange: "11 - 15 Januari 2027" },
    { id: 21, label: "Minggu 21", dateRange: "25 - 29 Januari 2027" }, { id: 23, label: "Minggu 23", dateRange: "8 - 12 Februari 2027" }, { id: 25, label: "Minggu 25", dateRange: "1 - 5 Maret 2027" }, { id: 27, label: "Minggu 27", dateRange: "22 - 24 Maret 2027" }, { id: 29, label: "Minggu 29", dateRange: "5 - 9 April 2027" },
    { id: 31, label: "Minggu 31", dateRange: "19 - 23 April 2027" }, { id: 33, label: "Minggu 33", dateRange: "3 - 7 Mei 2027" }, { id: 34, label: "Minggu 34", dateRange: "10 - 14 Mei 2027" }, { id: 35, label: "Minggu 35", dateRange: "18 - 21 Mei 2027" }, { id: 36, label: "Minggu 36", dateRange: "24 - 28 Mei 2027" }
];

const RAW_STUDENT_BLOCKS = [
    { weeks: [1, 23], data: [ { class: "XI TM 1", names: ["AIDUL FAHRI WAHYUDI", "ANTONIUS TIRTO NUGROHO", "AURA BINTANG ANTHEA"] }, { class: "XI TP 1", names: ["ADAM SETIAWAN", "ADNAN ZANUAR ASMARUDIN", "ALIEF SYAHPUTRA"] }, { class: "XI TSM 1", names: ["AKBAR PRILIAN PUTRA", "ARIS WAHYUDI", "BENEDIKTUS PASCUAL HADI PRAMONO"] }, { class: "XI TIP 1", names: ["ALEXANDER CHRISTIAN KWOK", "ANDIKA", "BILLY NATHANAEL"] }, { class: "XI TIP 3", names: ["AFIF HAUZAN", "ALFIAH RAMADHANI", "DAEYNARO MORISH"] } ]},
    { weeks: [3, 25], data: [ { class: "XI TM 1", names: ["CASTHON VADHELYNO", "CHRISTO ALEXANDER ARITONANG", "CLEMENT PERMANDIAN ODANG"] }, { class: "XI TP 1", names: ["ALVIN LIE", "ARSAH NURAIS", "BENEDICT EMMANUEL HUBERT"] }, { class: "XI TSM 1", names: ["CHRISTIAN MELKIANO HASIBUAN", "DAFA SETIAWAN", "DAFFA EL-SOYJI"] }, { class: "XI TIP 1", names: ["BRANDON YIP", "DELVIN ALFIANO TJHIA", "DESIREE JOANA"] }, { class: "XI TIP 3", names: ["DAMIANUS RAJA ROMA", "DIENSYA ERSIZIAN LILISONYA", "DINAR PUTRI FEBRIANTI"] } ]},
    { weeks: [5, 27], data: [ { class: "XI TM 1", names: ["DWI PARULIAN HASIBUAN", "EKA", "FATHAN NIZAR HARISNO"] }, { class: "XI TP 1", names: ["BIMO KUMORO PRADITYA", "CEN RIKI ALFANGGO", "FADHIL DIRGA ARIFUDIN"] }, { class: "XI TSM 1", names: ["DAFFA KHAIRUN IRSAN", "DIMAS WAHID SUSENO", "FARELIO KHARISMA RIZKI"] }, { class: "XI TIP 1", names: ["EDWARD GALYS SUGANDA", "EFOD ALBEN", "FILBERT HARYO TENGGARA"] }, { class: "XI TIP 3", names: ["FAHIRA SADYYA AMIRA", "FAISHAL AL AZHAR", "FEBRIYANTI"] } ]},
    { weeks: [7, 29], data: [ { class: "XI TM 1", names: ["Gabriel Ernest Helmi", "GREGORIUS DANIEL AGCA HARYANTO", "HASANATUL NAFIZA ANASTASYA"] }, { class: "XI TP 1", names: ["FARIQ MAULANA", "FELIX SUHENDRA", "FREDY SETYO PRATAMA"] }, { class: "XI TSM 1", names: ["MUHAMMAD TORRES AL-HABSY", "FRUMENSIUS ORLANDO EVAN MUJIONO", "GRAND LUCKY SURYA BENZEMA"] }, { class: "XI TIP 1", names: ["FLYNN ANTONIO LIUSANDY", "GILBERT GAVIER", "JANSSEN NATHANAEL"] }, { class: "XI TIP 3", names: ["GERALD ELDEN HUN", "JOCELLYNE LIVIA", "KENZIE GAVRILA SIMANJUNTAK"] } ]},
    { weeks: [9, 31], data: [ { class: "XI TM 1", names: ["JEFFERSON HAIDEE NADIA", "KARUNA JULIAN", "LEONARDO LU"] }, { class: "XI TP 1", names: ["GHALIH PUTRA PRATAMA", "GLEN JENIVER SINURAT", "HAIKAL AZRIEL AL FATHIR"] }, { class: "XI TSM 1", names: ["HAIKAL JIDAN ALI", "JOSHUA PURNAMA", "KHAIRIL ANWAR"] }, { class: "XI TIP 1", names: ["JEREMY KENNETH WIJAYA", "JESSEN CHRISTIAN", "JONATHAN AARON FRAMON"] }, { class: "XI TIP 3", names: ["LUKMAN ARDIYANSAH", "MELVIN JOHANNES IRIANTO", "MEYSNA KAYFA"] } ]},
    { weeks: [11, 33], data: [ { class: "XI TM 1", names: ["LIONEL RITCHIE TANJAYA", "MIKHAEL REVANDY", "MOZAKY FIERS SANTOSO"] }, { class: "XI TP 1", names: ["JUNOT PANCA SAPUTRA", "KAUTSAR KAMIL", "M. FAJAR REVOLUSI BUDIAN"] }, { class: "XI TSM 1", names: ["LEONARD NG", "M. MUALIF RUSDI", "MUHAMAD DIKA KURNIAWAN"] }, { class: "XI TIP 1", names: ["KEIKO AURELIA", "KENRICH TIMOTHY CHAN", "KEVIN LAY WIRAWAN"] }, { class: "XI TIP 3", names: ["MUHAMAD RAHAGI PUTRA", "MUHAMMAD RIADI AL-BASYIR", "MUHAMMAD ZIDANE FAIZ ALMALIKU"] } ]},
    { weeks: [13, 34], data: [ { class: "XI TM 1", names: ["MUHAMMAD SOLEH BIJAKSANA LUBIS", "NAJLAA NABILAH HILMII", "NETOFA ZERI ABIMAEL"] }, { class: "XI TP 1", names: ["MICHAEL ROVERINO", "MUHAMMAD HAFIZH ALIEF AL FAKHRI", "MUHAMMAD NOVIANTO SAPUTRA"] }, { class: "XI TSM 1", names: ["MUHAMAD SATRIA DWI SAPUTRA", "MUHAMMAD ADYA ALVAUZY", "MUHAMMAD AFPRIZAL VIRGIANTO"] }, { class: "XI TIP 1", names: ["KHEVIN", "MARVEL SUWANDI", "MICHAEL CHAN"] }, { class: "XI TIP 3", names: ["MUTIA RAMADANI", "NISZARA CAHYA NINDITA", "NOVTREE DEAN GHIFARI"] } ]},
    { weeks: [15, 35], data: [ { class: "XI TM 1", names: ["NURHAQIKI SITEFU", "PRADITA BAGUS ANOM AJI", "PRAJNA BADRA"] }, { class: "XI TP 1", names: ["MUHAMMAD REZKY APRILIANTO", "MUHAMMAD SYAHPUTRA", "RADITYA RAHARDIAN NEZED"] }, { class: "XI TSM 1", names: ["MUHAMMAD NAZIR FARIKHI", "MUHAMMAD RIDWAN ALBANTANI", "NABIL SAJID AL-DIMAH"] }, { class: "XI TIP 1", names: ["PIERCE JACOB SUHENDRA", "SANNY HUANG", "STEVE ANDREAN"] }, { class: "XI TIP 3", names: ["RADITHYA RAFAEL DEV SINGH", "RAFAEL HANDERI LIU", "RALF KARIM DONOVAN"] } ]},
    { weeks: [17, 36], data: [ { class: "XI TM 1", names: ["RASYA AINU NAJWUS AL FAZAN", "RENDI SANDIKA SIMAMORA", "RIO SAPUTRA"] }, { class: "XI TP 1", names: ["RAFFI SAPUTRA", "RIKI SUDIRO", "RINDI ANTIKA SARI"] }, { class: "XI TSM 1", names: ["RENDY", "RIZKY ALIF RAMADHAN", "RIZZKI IBNU AQIL"] }, { class: "XI TIP 1", names: ["STEWART NATHANAEL LIM", "VINNO YAKIN", "WIENJU FERYANTO LAY"] }, { class: "XI TIP 3", names: ["REZA", "RICHARD PRASETYA WIJAYA", "RIRIN OKTAVIA"] } ]},
    { weeks: [19, 21], data: [ { class: "XI TM 1", names: ["RISKA RADISTY CERISYA PUTRI", "RISKY MARSIKKAT HAMONANGAN SIH.", "SANDY RIYANTO"] }, { class: "XI TP 1", names: ["SAKHA ZENAVALI DAFIRE", "VERNAND PARULIAN S", "VINCENTIUS ARCHILLES NOVIAR"] }, { class: "XI TSM 1", names: ["ROBBI ADILAH PANGESTU", "AHMAD FAUZAAN", "MUHAMAD DARMANSYAH"] }, { class: "XI TIP 1", names: ["YOSUA AGUERO", "", ""] }, { class: "XI TIP 3", names: ["SAFIRA RIZKIYANI", "VALINO SANDY HARJANTON", "ZOVAN SHUPARI"] } ]}
];

let INITIAL_STUDENTS = [];
let idCounter = 1;

RAW_STUDENT_BLOCKS.forEach(block => {
    block.weeks.forEach(weekId => {
        block.data.forEach(group => {
            group.names.forEach(studentName => {
                if(studentName.trim() !== "") {
                    INITIAL_STUDENTS.push({
                        id: `S${idCounter}_W${weekId}`,
                        name: studentName,
                        class: group.class,
                        weekId: weekId,
                        daily: { senin: '', selasa: '', rabu: '', kamis: '', jumat: '' },
                        notes: "",
                        rakitan: { indoor: '', diecast: '', outdoor: '' }
                    });
                    idCounter++;
                }
            });
        });
    });
});

const validateProcessSNs = (inputSNsString, itemDb) => {
  if (!inputSNsString) return 0;
  const inputSNs = inputSNsString.split(/[\s,]+/).map(s => s.trim()).filter(Boolean);
  if (inputSNs.length === 0) return 0;
  const validSNs = (itemDb.snList || []).map(s => s.rangeSN.toLowerCase());
  const invalidSNs = inputSNs.filter(sn => !validSNs.includes(sn.toLowerCase()));
  if (invalidSNs.length > 0) throw new Error(`GAGAL: SN tidak terdaftar! (${invalidSNs.join(', ')})`);
  return inputSNs.length; 
};

const getEngineerFullName = (shortName) => {
  if (!shortName) return 'Engineer';
  const nameMap = {
    'faqih': 'F. Faqih Fadly',
    'ruben': 'Ruben Nata',
    'didi': 'Dedi Kurniawan',
    'kurnia': 'Dedi Kurniawan',
    'aziz': 'Aziz M.',
    'bosgudang': 'Kepala Gudang',
    'mpdn': 'Engineer MPDN'
  };
  const lowerName = String(shortName).toLowerCase();
  if (nameMap[lowerName]) return nameMap[lowerName];
  if (lowerName.includes('admin') || lowerName.includes('system')) return 'Engineer';
  return shortName;
};

const playSound = (type) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    const now = ctx.currentTime;

    if (type === 'success' || type === 'info') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(700, now); osc.frequency.setValueAtTime(1046.50, now + 0.1); 
      gainNode.gain.setValueAtTime(0, now); gainNode.gain.linearRampToValueAtTime(0.2, now + 0.02); gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now); osc.stop(now + 0.3);
    } else if (type === 'error') {
      osc.type = 'square'; osc.frequency.setValueAtTime(250, now); gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.1, now + 0.01); gainNode.gain.setValueAtTime(0.1, now + 0.1); gainNode.gain.linearRampToValueAtTime(0, now + 0.11);
      gainNode.gain.setValueAtTime(0, now + 0.15); gainNode.gain.linearRampToValueAtTime(0.1, now + 0.16); gainNode.gain.setValueAtTime(0.1, now + 0.3); gainNode.gain.linearRampToValueAtTime(0, now + 0.35);
      osc.start(now); osc.stop(now + 0.4);
    }
  } catch (e) { console.warn("Audio tidak disupport", e); }
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

const SectionTitle = ({ title }) => <div className="text-[10px] sm:text-[11px] text-center text-slate-300 bg-[#161b22] py-1 font-bold uppercase tracking-wider mb-2 border border-[#30363d] rounded-sm shadow-sm">{title}</div>;

export default function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminProfile, setAdminProfile] = useState(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [inventory, setInventory] = useState([]);
  const [historyLog, setHistoryLog] = useState([]);
  const [ojtReports, setOjtReports] = useState([]);
  const [ojtAttendanceData, setOjtAttendanceData] = useState([]);
  
  const [notification, setNotification] = useState(null);
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);
  
  const getTodayDateString = () => new Date().toISOString().split('T')[0];
  
  const [txType, setTxType] = useState('inbound');
  const [formData, setFormData] = useState({ tglMutasi: getTodayDateString() });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchSN, setSearchSN] = useState("");
  const [editModal, setEditModal] = useState(null);
  const [isDocMenuOpen, setIsDocMenuOpen] = useState(false);
  const [isSopMenuOpen, setIsSopMenuOpen] = useState(false);
  const [isPengembanganOpen, setIsPengembanganOpen] = useState(false);
  const [isDesign3DMenuOpen, setIsDesign3DMenuOpen] = useState(false);
  const [activeDoc, setActiveDoc] = useState(null);
  
  const [reportMonth, setReportMonth] = useState(new Date().getMonth());
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [reportLocation, setReportLocation] = useState('Semua');
  const [dashboardYear, setDashboardYear] = useState(new Date().getFullYear().toString());

  // OJT States
  const [activeOjtSubTab, setActiveOjtSubTab] = useState('presensi');
  const [selectedOjtWeek, setSelectedOjtWeek] = useState(3);
  const [editOjtModal, setEditOjtModal] = useState(null);
  const [filterOjtYear, setFilterOjtYear] = useState(new Date().getFullYear().toString());
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkStatus, setBulkStatus] = useState('Hadir');

  useEffect(() => {
    const savedAdmin = localStorage.getItem('mpdn_admin_profile');
    if (savedAdmin) {
      try {
        const parsedProfile = JSON.parse(savedAdmin);
        setIsAdmin(true); setAdminProfile(parsedProfile);
      } catch (e) { localStorage.removeItem('mpdn_admin_profile'); }
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const initAuth = async () => {
      try {
        if (typeof window !== 'undefined' && window.__initial_auth_token) await signInWithCustomToken(auth, window.__initial_auth_token);
        else await signInAnonymously(auth);
      } catch (err) { console.error("Auth error:", err); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => { unsubscribe(); window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubInv = onSnapshot(getDbCollection('inventory'), (snapshot) => { setInventory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); });
    const unsubHist = onSnapshot(getDbCollection('history'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => (b.timestamp?.toMillis() || 0) - (a.timestamp?.toMillis() || 0));
      setHistoryLog(data);
    });
    const unsubOjtReports = onSnapshot(getDbCollection('ojt_reports'), (snapshot) => {
      setOjtReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubOjtAttendance = onSnapshot(getDbCollection('ojt_attendance'), (snapshot) => {
      setOjtAttendanceData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => { unsubInv(); unsubHist(); unsubOjtReports(); unsubOjtAttendance(); };
  }, [user]);

  const showNotif = (msg, type = 'success') => {
    setNotification({ msg, type }); playSound(type); setTimeout(() => setNotification(null), 4000);
  };

  const handleAdminToggle = () => {
    if (isAdmin) {
      setIsAdmin(false); setAdminProfile(null); localStorage.removeItem('mpdn_admin_profile'); setActiveTab('dashboard'); showNotif("Logout Berhasil", "info");
    } else {
      setShowPinModal(true);
      setPinInput("");
    }
  };

  const verifyPin = () => {
      if (VALID_PINS.includes(pinInput)) {
        let extractedName = pinInput.replace(new RegExp('[^a-zA-Z]', 'g'), '');
        let fullName = getEngineerFullName(extractedName);
        let role = extractedName.toLowerCase() === 'aziz' ? 'Supervisor' : 'Engineer';
        setIsAdmin(true); 
        const newProfile = { name: fullName, role: role, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${extractedName}&backgroundColor=0f0f11` };
        setAdminProfile(newProfile); localStorage.setItem('mpdn_admin_profile', JSON.stringify(newProfile));
        showNotif(`Welcome back, ${fullName}`, "success");
        setShowPinModal(false);
      } else { 
        showNotif("PIN Tidak Valid", "error"); 
      }
  };

  const handleCopyText = (text) => {
    if (!text || text === '-') return;
    const textArea = document.createElement("textarea"); textArea.value = text; document.body.appendChild(textArea); textArea.select();
    try { document.execCommand('copy'); showNotif("SN berhasil disalin!", "info"); } catch (err) { showNotif("Gagal menyalin", "error"); } document.body.removeChild(textArea);
  };

  const getStok = (kat, tipe, varian, subVar, target = 'MPDN') => {
    const items = inventory.filter(i => i.kategori === kat && (tipe ? i.tipe === tipe : true) && (varian ? i.varian === varian : true) && (subVar ? i.subVarian === subVar : true));
    if (target === 'MPDN') return items.reduce((sum, i) => sum + (i.stokMPDN || 0), 0);
    if (target === 'IVP') return items.reduce((sum, i) => sum + (i.stokIVP || 0), 0);
    if (target === 'MLDS') return items.reduce((sum, i) => sum + (i.stokMLDS || 0), 0);
    if (target === 'NG') return items.reduce((sum, i) => sum + (i.stokNG || 0), 0);
    return 0;
  };

  const addHistory = async (action, details, qty = 0, explicitDate = null) => {
    try { 
      let payload = { action, details, qty, user: isAdmin && adminProfile ? adminProfile.name : 'System', timestamp: serverTimestamp() };
      if (explicitDate) {
        payload.timestamp = new Date(explicitDate + 'T12:00:00Z'); 
      }
      await addDoc(getDbCollection('history'), payload); 
    } catch (e) {}
  };

  // ... (Inbound, Tagging, Revert, Outbound, Reject actions remain the same)
  const processTx = async (actionFn, successMsg, resetState) => {
    if (isSubmitting) return; setIsSubmitting(true);
    try { 
      await actionFn(); 
      if (isOffline) showNotif("Data Disimpan Offline! (Akan tersinkronisasi saat sinyal kembali)", "info");
      else showNotif(successMsg); 
      if (resetState) setFormData({ ...resetState, tglMutasi: getTodayDateString() }); 
      else setFormData({ txType: formData.txType, tglMutasi: getTodayDateString() }); 
    } 
    catch (e) { showNotif(e.message || "Transaksi Gagal", "error"); }
    finally { setIsSubmitting(false); }
  };

  const handleInbound = () => processTx(async () => {
    const { lokasi, kategori, tipe, varian, subVarian, rc, qty, batch, rangeSN, projectSN, processSNs, tglMutasi } = formData;
    const isLED = kategori === 'LED';
    if (!lokasi || !kategori) throw new Error("Lokasi & Kategori wajib diisi");
    const mutasiDateISO = tglMutasi ? new Date(tglMutasi + 'T12:00:00Z').toISOString() : new Date().toISOString();
    const itemId = `${lokasi}-${kategori}-${tipe || ''}-${varian || ''}-${subVarian || ''}-${rc || ''}`.replace(/\s+/g, '-').toLowerCase();
    const existing = inventory.find(i => i.id === itemId);
    const docRef = getDbDoc('inventory', itemId);
    let finalQty = 0; let newSnEntries = []; let logDetail = '';
    const adminName = isAdmin && adminProfile ? adminProfile.name : 'System';

    if (isLED) {
      finalQty = parseInt(qty); if (!finalQty || finalQty <= 0) throw new Error("Volume Qty wajib diisi untuk LED");
      if (existing && rangeSN && rangeSN !== '-') {
        const isDuplicate = existing.snList.some(sn => sn.rangeSN.toLowerCase() === rangeSN.toLowerCase());
        if (isDuplicate) throw new Error(`GAGAL: SN "${rangeSN}" sudah terdaftar di sistem!`);
      }
      newSnEntries = [{ id: Date.now().toString(), batch: batch || '-', rangeSN: rangeSN || '-', project: projectSN || '-', qty: finalQty, date: mutasiDateISO, user: adminName }];
      logDetail = `+${finalQty} ${kategori} ${tipe||''} ${subVarian||''} -> ${lokasi}`;
      if (rangeSN && rangeSN !== '-') logDetail += ` (SN: ${rangeSN})`; if (batch && batch !== '-') logDetail += ` [Batch: ${batch}]`; if (projectSN) logDetail += ` [Ket: ${projectSN}]`; 
    } else {
      const inputSNs = (processSNs || '').split(/[\s,]+/).map(s => s.trim()).filter(Boolean);
      finalQty = inputSNs.length; if (finalQty === 0) throw new Error("Serial Number wajib diisi (minimal 1)!");
      if (existing) {
         const existingSNs = existing.snList.map(sn => sn.rangeSN.toLowerCase());
         const dupes = inputSNs.filter(sn => existingSNs.includes(sn.toLowerCase()));
         if (dupes.length > 0) throw new Error(`GAGAL: SN (${dupes.join(', ')}) sudah terdaftar!`);
      }
      const timestamp = Date.now();
      newSnEntries = inputSNs.map((sn, idx) => ({ id: (timestamp + idx).toString(), batch: '-', rangeSN: sn, project: projectSN || '-', qty: 1, date: mutasiDateISO, user: adminName }));
      logDetail = `+${finalQty} ${kategori} ${tipe||''} ${varian||''} ${subVarian||''} -> ${lokasi} [SN: ${inputSNs.join(', ')}]`; if (projectSN) logDetail += ` [Ket: ${projectSN}]`;
    }
    if (existing) await updateDoc(docRef, { stokMPDN: existing.stokMPDN + finalQty, snList: [...(existing.snList || []), ...newSnEntries] });
    else await setDoc(docRef, { kategori, tipe: tipe || '-', varian: varian || '-', subVarian: subVarian || '-', rc: rc || '-', lokasiAsal: lokasi, stokMPDN: finalQty, stokIVP: 0, stokMLDS: 0, stokNG: 0, alokasi: [], snList: newSnEntries });
    await addHistory('INBOUND', logDetail, finalQty, tglMutasi);
  }, "Stok Masuk & Record SN Berhasil Disimpan", formData.kategori === 'LED' ? null : { ...formData, processSNs: '' });

  const handleTagging = () => processTx(async () => {
    const { itemId, target, project, qty, processSNs, tglMutasi } = formData;
    const mutasiDateISO = tglMutasi ? new Date(tglMutasi + 'T12:00:00Z').toISOString() : new Date().toISOString();
    if (!itemId || !target || !project) throw new Error("Data belum lengkap");
    const item = inventory.find(i => i.id === itemId);
    let finalQty = parseInt(qty);
    if (item.kategori !== 'LED') { if (!processSNs) throw new Error("Daftar SN wajib diisi!"); finalQty = validateProcessSNs(processSNs, item); }
    if (!finalQty || finalQty <= 0) throw new Error("Qty / Jumlah SN tidak valid");
    if (item.stokMPDN < finalQty) throw new Error("Stok Gudang Pusat tidak cukup");
    const newAlokasi = [...(item.alokasi || []), { id: Date.now().toString(), target, project, qty: finalQty, date: mutasiDateISO }];
    await updateDoc(getDbDoc('inventory', itemId), { stokMPDN: item.stokMPDN - finalQty, [`stok${target}`]: item[`stok${target}`] + finalQty, alokasi: newAlokasi });
    let logText = `${finalQty} unit ${item.kategori} ${item.varian} ke ${target} (Project: ${project})`; if (processSNs) logText += ` [SN List: ${processSNs}]`;
    await addHistory('TAGGING', logText, finalQty, tglMutasi);
  }, "Tagging Berhasil", formData.kategori !== 'LED' ? { ...formData, processSNs: '' } : null);

  const handleRevert = () => processTx(async () => {
    const { itemId, alokasiId, qty, reason, processSNs, tglMutasi } = formData;
    if (!itemId || !alokasiId || !reason) throw new Error("Rincian wajib diisi");
    const item = inventory.find(i => i.id === itemId);
    let finalQty = parseInt(qty);
    if (item.kategori !== 'LED') { if (!processSNs) throw new Error("Daftar SN wajib diisi!"); finalQty = validateProcessSNs(processSNs, item); }
    if (!finalQty || finalQty <= 0) throw new Error("Qty / Jumlah SN tidak valid");
    const alokasiIndex = item.alokasi.findIndex(a => a.id === alokasiId); const alokasi = item.alokasi[alokasiIndex];
    if (alokasi.qty < finalQty) throw new Error("Jumlah ditarik melebihi alokasi");
    let newAlokasiList = [...item.alokasi];
    if (alokasi.qty === finalQty) newAlokasiList.splice(alokasiIndex, 1); else newAlokasiList[alokasiIndex].qty -= finalQty;
    await updateDoc(getDbDoc('inventory', itemId), { stokMPDN: item.stokMPDN + finalQty, [`stok${alokasi.target}`]: item[`stok${alokasi.target}`] - finalQty, alokasi: newAlokasiList });
    let logText = `${finalQty} unit ditarik dari ${alokasi.target} (${alokasi.project}). Alasan: ${reason}`; if (processSNs) logText += ` [SN List: ${processSNs}]`;
    await addHistory('REVERT', logText, finalQty, tglMutasi);
  }, "Revert Berhasil", formData.kategori !== 'LED' ? { ...formData, processSNs: '' } : null);

  const handleOutbound = () => processTx(async () => {
    const { itemId, alokasiId, qty, reason, processSNs, tglMutasi } = formData;
    if (!itemId || !alokasiId) throw new Error("Data belum lengkap");
    const item = inventory.find(i => i.id === itemId);
    let finalQty = parseInt(qty);
    if (item.kategori !== 'LED') { if (!processSNs) throw new Error("Daftar SN wajib diisi!"); finalQty = validateProcessSNs(processSNs, item); }
    if (!finalQty || finalQty <= 0) throw new Error("Qty / Jumlah SN tidak valid");
    if (alokasiId === 'MPDN') {
      if (item.stokMPDN < finalQty) throw new Error("Jumlah keluar melebihi stok Gudang Pusat");
      await updateDoc(getDbDoc('inventory', itemId), { stokMPDN: item.stokMPDN - finalQty });
      let logText = `${finalQty} unit dikirim dari Pusat. Ket: ${reason || '-'}`; if (processSNs) logText += ` [SN List: ${processSNs}]`; await addHistory('OUTBOUND', logText, finalQty, tglMutasi);
    } else if (alokasiId === 'NG') {
      if ((item.stokNG || 0) < finalQty) throw new Error("Jumlah keluar melebihi stok NG");
      await updateDoc(getDbDoc('inventory', itemId), { stokNG: item.stokNG - finalQty });
      let logText = `${finalQty} unit NG dikeluarkan. Ket: ${reason || '-'}`; if (processSNs) logText += ` [SN List: ${processSNs}]`; await addHistory('OUTBOUND', logText, finalQty, tglMutasi);
    } else {
      const alokasiIndex = item.alokasi.findIndex(a => a.id === alokasiId); const alokasi = item.alokasi[alokasiIndex];
      if (alokasi.qty < finalQty) throw new Error("Jumlah keluar melebihi alokasi project");
      let newAlokasiList = [...item.alokasi];
      if (alokasi.qty === finalQty) newAlokasiList.splice(alokasiIndex, 1); else newAlokasiList[alokasiIndex].qty -= finalQty;
      await updateDoc(getDbDoc('inventory', itemId), { [`stok${alokasi.target}`]: item[`stok${alokasi.target}`] - finalQty, alokasi: newAlokasiList });
      let logText = `${finalQty} unit dikirim ke ${alokasi.project} (${alokasi.target}). Ket: ${reason || '-'}`; if (processSNs) logText += ` [SN List: ${processSNs}]`; await addHistory('OUTBOUND', logText, finalQty, tglMutasi);
    }
  }, "Outbound Berhasil", formData.kategori !== 'LED' ? { ...formData, processSNs: '' } : null);

  const handleReject = () => processTx(async () => {
    const { itemId, qty, reason, rejectMode, processSNs, tglMutasi } = formData;
    const isRestore = rejectMode === 'restore';
    if (!itemId || !reason) throw new Error("Pilih aset dan isi alasannya!");
    const item = inventory.find(i => i.id === itemId);
    let finalQty = parseInt(qty);
    if (item.kategori !== 'LED') { if (!processSNs) throw new Error("Daftar SN wajib diisi!"); finalQty = validateProcessSNs(processSNs, item); }
    if (!finalQty || finalQty <= 0) throw new Error("Qty / Jumlah SN tidak valid");
    if (isRestore) {
      if ((item.stokNG || 0) < finalQty) throw new Error("Jumlah pulih melebihi stok NG");
      await updateDoc(getDbDoc('inventory', itemId), { stokMPDN: item.stokMPDN + finalQty, stokNG: item.stokNG - finalQty });
      let logText = `${finalQty} unit ${item.kategori} ${item.varian} dipulihkan dari NG. Ket: ${reason}`; if (processSNs) logText += ` [SN List: ${processSNs}]`; await addHistory('REJECT', logText, finalQty, tglMutasi);
    } else {
      if (item.stokMPDN < finalQty) throw new Error("Jumlah reject melebihi stok Pusat");
      await updateDoc(getDbDoc('inventory', itemId), { stokMPDN: item.stokMPDN - finalQty, stokNG: (item.stokNG || 0) + finalQty });
      let logText = `${finalQty} unit ${item.kategori} ${item.varian} dipindah ke NG. Alasan: ${reason}`; if (processSNs) logText += ` [SN List: ${processSNs}]`; await addHistory('REJECT', logText, finalQty, tglMutasi);
    }
  }, formData.rejectMode === 'restore' ? "Barang NG Berhasil Dipulihkan" : "Data Barang NG Berhasil Disimpan", formData.kategori !== 'LED' ? { ...formData, processSNs: '' } : null);

  const handleUploadOJT = async () => {
    const { tahun, bulan, minggu, linkOJT } = formData;
    if (!tahun || !bulan || !minggu) { showNotif("Tahun, Bulan, dan Minggu wajib diisi!", "error"); return; }
    if (!linkOJT) { showNotif("Masukkan link Google Drive / PDF!", "error"); return; }
    setIsSubmitting(true);
    try {
      let finalUrl = linkOJT;
      if (finalUrl.includes('drive.google.com/file/d/')) {
         const fileIdMatch = finalUrl.match(/d\/([a-zA-Z0-9_-]+)/);
         if (fileIdMatch && fileIdMatch[1]) finalUrl = `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
      }
      const docId = `${tahun}-${bulan}-${minggu}`.replace(/\s+/g, '');
      await setDoc(getDbDoc('ojt_reports', docId), { tahun, bulan, minggu, label: minggu, url: finalUrl, uploadedAt: new Date().toISOString(), uploader: adminProfile?.name || 'Engineer' });
      await addHistory('UPLOAD', `Link Laporan OJT ${minggu} ${bulan} ${tahun} berhasil disimpan.`);
      showNotif("Link Laporan OJT berhasil disimpan!", "success");
      setFormData({ txType: 'upload_ojt', tglMutasi: getTodayDateString() });
    } catch (error) { showNotif(error.message || "Gagal menyimpan link OJT", "error"); }
    finally { setIsSubmitting(false); }
  };

  const handleDeleteSN = async (itemId, snId, qty, snText) => {
    if (!confirm(`YAKIN INGIN MENGHAPUS INPUT INBOUND INI?\n\n(SN/Range: ${snText} | Qty: ${qty} Unit)\n\nStok di Gudang Pusat akan otomatis dikurangi sebesar ${qty} unit.`)) return;
    try {
      const item = inventory.find(i => i.id === itemId); if (!item) return showNotif("Item tidak ditemukan!", "error");
      const newSnList = item.snList.filter(sn => sn.id !== snId);
      const newStok = Math.max((item.stokMPDN || 0) - qty, 0); 
      await updateDoc(getDbDoc('inventory', itemId), { stokMPDN: newStok, snList: newSnList });
      await addHistory('DELETE', `Menghapus Inbound (SN: ${snText}). Stok WIP Pusat dikurangi ${qty} unit.`, qty);
      showNotif("Data SN & Stok berhasil dihapus!", "success");
    } catch(e) { showNotif("Gagal menghapus data", "error"); }
  };

  const handleDeleteOJT = async (report) => {
    if (!confirm(`YAKIN INGIN MENGHAPUS LAPORAN OJT?\n\nBulan: ${report.bulan}\nMinggu: ${report.minggu}\nTahun: ${report.tahun}`)) return;
    try {
       await deleteDoc(getDbDoc('ojt_reports', report.id));
       await addHistory('DELETE', `Menghapus Dokumen OJT ${report.minggu} ${report.bulan} ${report.tahun}`);
       showNotif("Dokumen OJT berhasil dihapus!", "success");
    } catch (e) { showNotif("Gagal menghapus dokumen", "error"); }
  };

  const mergedStudents = INITIAL_STUDENTS.map(student => {
    const fbData = ojtAttendanceData.find(d => d.id === student.id);
    if (fbData) {
        return {
            ...student,
            daily: fbData.daily || { senin: '', selasa: '', rabu: '', kamis: '', jumat: '' },
            notes: fbData.notes || '',
            rakitan: fbData.rakitan || { indoor: '', diecast: '', outdoor: '' },
            weekId: fbData.assignedWeekId || student.weekId
        };
    }
    return student;
  });

  const parseDatesForHeaders = (dateRangeStr) => {
    let days = ['','','','',''];
    const match = dateRangeStr.match(/(\d+)\s*-\s*(\d+)\s*([A-Za-z]+)\s*(\d{4})/);
    if(match) {
        let start = parseInt(match[1]);
        let month = match[3];
        let year = match[4];
        let monthMap = {'Januari':'01','Februari':'02','Maret':'03','April':'04','Mei':'05','Juni':'06','Juli':'07','Agustus':'08','September':'09','Oktober':'10','November':'11','Desember':'12'};
        let m = monthMap[month] || '01';
        for(let i=0; i<5; i++) {
            days[i] = `${(start+i).toString().padStart(2, '0')}/${m}/${year}`;
        }
    }
    return days;
  };

  const handleCycleDailyStatus = async (studentId, dayStr, currentDaily) => {
    if (!isAdmin) return;
    const statuses = ['', 'Hadir', 'Sakit', 'Izin', 'Alpa'];
    const currentVal = currentDaily[dayStr] || '';
    const nextIdx = (statuses.indexOf(currentVal) + 1) % statuses.length;
    const nextStatus = statuses[nextIdx];

    const newDaily = { ...currentDaily, [dayStr]: nextStatus };
    try {
        const studentIndex = mergedStudents.findIndex(s => s.id === studentId);
        if (studentIndex > -1) {
            const studentData = mergedStudents[studentIndex];
            const updateData = { daily: newDaily, notes: studentData.notes, rakitan: studentData.rakitan, assignedWeekId: studentData.weekId };
            await setDoc(getDbDoc('ojt_attendance', studentId), updateData, { merge: true });
        }
    } catch (error) {
        showNotif("Gagal menyimpan absensi", "error");
    }
  };

  const handleSaveStudentEdit = async (studentId, notes, assignedWeekId) => {
   try {
       const studentIndex = mergedStudents.findIndex(s => s.id === studentId);
       if (studentIndex > -1) {
           const studentData = mergedStudents[studentIndex];
           const updateData = { notes, rakitan: studentData.rakitan, assignedWeekId, daily: studentData.daily };
           await setDoc(getDbDoc('ojt_attendance', studentId), updateData, { merge: true });
           showNotif("Data siswa berhasil diperbarui.", "success");
       }
   } catch (error) {
       showNotif("Gagal menyimpan data", "error");
   }
  };

  const handleUpdateRakitan = async (studentId, type, value) => {
    try {
        const studentIndex = mergedStudents.findIndex(s => s.id === studentId);
        if (studentIndex > -1) {
            const studentData = mergedStudents[studentIndex];
            const newRakitan = { ...studentData.rakitan, [type]: value };
            const updateData = { rakitan: newRakitan, notes: studentData.notes, assignedWeekId: studentData.weekId, daily: studentData.daily };
            await setDoc(getDbDoc('ojt_attendance', studentId), updateData, { merge: true });
        }
    } catch (error) {
        console.error("Failed updating rakitan", error);
    }
  };

  const filteredStudentsForBulk = mergedStudents.filter(s => s.weekId === selectedOjtWeek);

  const handleBulkSave = async () => {
    setIsSubmitting(true);
    try {
        const batchPromises = filteredStudentsForBulk.map(student => {
            const newDaily = {
                senin: bulkStatus, selasa: bulkStatus, rabu: bulkStatus, kamis: bulkStatus, jumat: bulkStatus
            };
            const updateData = {
                daily: newDaily, notes: student.notes || '', rakitan: student.rakitan || { indoor: '', diecast: '', outdoor: '' }, assignedWeekId: student.weekId
            };
            return setDoc(getDbDoc('ojt_attendance', student.id), updateData, { merge: true });
        });
        await Promise.all(batchPromises);
        showNotif(`Semua hari untuk seluruh siswa di-set menjadi ${bulkStatus}.`, "success");
        setShowBulkModal(false);
    } catch (e) {
        showNotif("Gagal melakukan aksi cepat", "error");
    }
    setIsSubmitting(false);
  };

  const handleCheckAllDay = async (dayStr) => {
    if (!isAdmin) return;
    setIsSubmitting(true);
    
    // Cek apakah semua siswa di hari tersebut sudah ditandai hadir
    const isAllPresent = filteredStudentsForBulk.length > 0 && filteredStudentsForBulk.every(s => s.daily[dayStr] === 'Hadir');
    // Jika semua sudah hadir, maka target kita mengosongkan (''), jika belum, tandai 'Hadir'
    const targetStatus = isAllPresent ? '' : 'Hadir';

    try {
        const batchPromises = filteredStudentsForBulk.map(student => {
            const newDaily = { ...student.daily, [dayStr]: targetStatus };
            const updateData = {
                daily: newDaily, notes: student.notes || '', rakitan: student.rakitan || { indoor: '', diecast: '', outdoor: '' }, assignedWeekId: student.weekId
            };
            return setDoc(getDbDoc('ojt_attendance', student.id), updateData, { merge: true });
        });
        await Promise.all(batchPromises);
        
        if (targetStatus === 'Hadir') {
            showNotif(`Semua siswa ditandai Hadir pada hari ${dayStr.toUpperCase()}.`, "success");
        } else {
            showNotif(`Semua presensi hari ${dayStr.toUpperCase()} dikosongkan.`, "info");
        }
    } catch (e) {
        showNotif("Gagal mengubah status presensi", "error");
    }
    setIsSubmitting(false);
  };

  const handleClearAllWeekly = async () => {
    if (!isAdmin) return;
    setIsSubmitting(true);
    try {
        const batchPromises = filteredStudentsForBulk.map(student => {
            const newDaily = { senin: '', selasa: '', rabu: '', kamis: '', jumat: '' };
            const updateData = {
                daily: newDaily, notes: student.notes || '', rakitan: student.rakitan || { indoor: '', diecast: '', outdoor: '' }, assignedWeekId: student.weekId
            };
            return setDoc(getDbDoc('ojt_attendance', student.id), updateData, { merge: true });
        });
        await Promise.all(batchPromises);
        showNotif("Semua data presensi minggu ini berhasil dikosongkan.", "success");
    } catch (e) {
        showNotif("Gagal mengosongkan data", "error");
    }
    setIsSubmitting(false);
  };

  const renderDailyBadge = (status) => {
    if (status === 'Hadir') return <Check size={16} className="text-emerald-400 mx-auto drop-shadow-md"/>;
    if (status === 'Sakit') return <span className="text-amber-400 font-bold text-sm">S</span>;
    if (status === 'Izin') return <span className="text-blue-400 font-bold text-sm">i</span>;
    if (status === 'Alpa') return <span className="text-rose-500 font-bold text-sm">A</span>;
    return <span className="text-slate-600 font-bold">-</span>;
  };

  const allSNLogs = useMemo(() => {
    let logs = [];
    inventory.forEach(item => { if (item.snList && Array.isArray(item.snList)) { item.snList.forEach(sn => { logs.push({ ...sn, itemId: item.id, itemName: `${item.kategori} ${item.tipe !== '-' ? item.tipe : ''} ${item.subVarian}` }); }); } });
    return logs.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [inventory]);

  const filteredSNLogs = useMemo(() => {
    if (!searchSN) return allSNLogs;
    const lowerSearch = searchSN.toLowerCase();
    const searchNormalized = lowerSearch.replace(/[\s-]/g, '');
    return allSNLogs.filter(sn => {
      const itemNormalized = (sn.itemName || '').toLowerCase().replace(/[\s-]/g, '');
      return ( (sn.rangeSN && sn.rangeSN.toLowerCase().includes(lowerSearch)) || (sn.batch && sn.batch.toLowerCase().includes(lowerSearch)) || (sn.project && sn.project.toLowerCase().includes(lowerSearch)) || itemNormalized.includes(searchNormalized) );
    });
  }, [allSNLogs, searchSN]);

  const searchHint = useMemo(() => {
    if (!searchSN || searchSN.trim().length < 2 || filteredSNLogs.length === 0) return null;
    const latestMatch = [...filteredSNLogs].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    const isOutbound = historyLog.some(log => (log.action === 'OUTBOUND' || log.action === 'TAGGING') && latestMatch.rangeSN && latestMatch.rangeSN !== '-' && log.details.includes(latestMatch.rangeSN) );
    let status = 'IN (Di Gudang)';
    if (!latestMatch.rangeSN || latestMatch.rangeSN === '-') status = 'N/A';
    else if (isOutbound) status = 'OUT / Dialokasikan';
    return { ...latestMatch, status };
  }, [searchSN, filteredSNLogs, historyLog]);

  const globalStats = useMemo(() => {
    let wip = 0, titipan = 0, ng = 0; let led = 0, monitor = 0, kiosk = 0;
    inventory.forEach(i => {
      const itemTotal = (i.stokMPDN || 0) + (i.stokIVP || 0) + (i.stokMLDS || 0) + (i.stokNG || 0);
      wip += (i.stokMPDN || 0); titipan += (i.stokIVP || 0) + (i.stokMLDS || 0); ng += (i.stokNG || 0);
      if (i.kategori === 'LED') led += itemTotal; else if (i.kategori === 'Monitor') monitor += itemTotal; else if (i.kategori === 'Kiosk') kiosk += itemTotal;
    });
    return { wip, titipan, ng, led, monitor, kiosk, grand: wip + titipan + ng };
  }, [inventory]);

  const bestProductData = useMemo(() => {
    let mvidci = 0, mvifci = 0, mvifco = 0, ifp = 0, vdw = 0, kioskFat = 0, kioskSlim = 0;
    inventory.forEach(item => {
      if (item.snList && Array.isArray(item.snList)) {
        item.snList.forEach(sn => {
          if (sn.date && new Date(sn.date).getFullYear().toString() === dashboardYear) {
            const totalQty = parseInt(sn.qty) || 1;
            const t = item.kategori; const tipe = item.tipe || ''; const varian = item.varian || '';
            if (t === 'LED' && tipe === 'MVIDCI') mvidci += totalQty;
            else if (t === 'LED' && (tipe === 'MVIFCI' || tipe === 'MVIFCIL')) mvifci += totalQty;
            else if (t === 'LED' && tipe === 'MVIFCO') mvifco += totalQty;
            else if (t === 'Monitor' && tipe === 'IFP') ifp += totalQty;
            else if (t === 'Monitor' && tipe === 'VDW') vdw += totalQty;
            else if (t === 'Kiosk' && varian === 'Kiosk FAT') kioskFat += totalQty;
            else if (t === 'Kiosk' && varian === 'Kiosk Slim') kioskSlim += totalQty;
          }
        });
      }
    });
    return [ { label: 'MVIFCI', val: mvifci }, { label: 'MVIFCO', val: mvifco }, { label: 'MVIDCI', val: mvidci }, { label: 'IFP', val: ifp }, { label: 'VDW', val: vdw }, { label: 'KIOSK FAT', val: kioskFat }, { label: 'KIOSK SLIM', val: kioskSlim }].sort((a,b) => b.val - a.val); 
  }, [inventory, dashboardYear]);
  const maxBestProd = Math.max(...bestProductData.map(d => d.val), 10);

  const monthlyOutboundData = useMemo(() => {
    const months = new Array(12).fill(0);
    historyLog.forEach(log => {
       if ((log.action === 'OUTBOUND' || log.action === 'TAGGING' || log.action === 'REVERT') && log.timestamp) {
         const date = new Date(log.timestamp.toMillis());
         if (date.getFullYear().toString() === dashboardYear) {
           let q = log.qty || 0; if (!q) { const match = log.details.match(new RegExp('(?:\\\\+)?(\\d+)')); if (match) q = parseInt(match[1], 10); }
           if (log.action === 'REVERT') months[date.getMonth()] -= q; 
           else months[date.getMonth()] += q; 
         }
       }
    });
    return months.map(val => Math.max(0, val));
  }, [historyLog, dashboardYear]);
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const maxOutbound = Math.max(...monthlyOutboundData, 10);

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

      {/* KOLOM 2: CENTER */}
      <div className="flex-1 flex flex-col gap-3 min-w-0 h-full overflow-y-auto lg:overflow-hidden pb-2 pr-1 lg:pr-0 custom-scrollbar lg:scrollbar-none">
         <div className="flex flex-col md:flex-row gap-3 shrink-0">
            <div className="w-full md:w-40 flex flex-col gap-3">
               <Panel title="FILTER GRAFIK" className="h-20 justify-center items-center bg-gradient-to-b from-[#161b22] to-[#0d1117]">
                 <div className="flex flex-col items-center w-full px-2">
                    <select value={dashboardYear} onChange={e => setDashboardYear(e.target.value)} className="bg-[#0f0f11] text-blue-400 font-bold border border-[#30363d] rounded-md p-1.5 outline-none text-xs cursor-pointer focus:border-blue-500 w-full text-center shadow-inner">
                       {[...Array(5)].map((_, i) => { const y = new Date().getFullYear() - 2 + i; return <option key={y} value={y.toString()}>{y}</option> })}
                    </select>
                 </div>
               </Panel>
               <Panel title="KIOSK FAT">
                 <div className="text-center font-mono text-3xl font-bold text-white py-2">{getStok('Kiosk', null, 'Kiosk FAT')}</div>
                 <div className="text-[10px] text-center text-slate-500 pb-1 font-semibold uppercase tracking-wider">IN / OUT</div>
               </Panel>
            </div>
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
            <div className="w-full md:w-40 flex flex-col gap-3">
               <Panel title="SYSTEM STATUS" className="h-20 justify-center items-center bg-gradient-to-b from-[#161b22] to-[#0d1117]">
                 <div className="flex flex-col items-center justify-center w-full h-full gap-1.5">
                   <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                      <span className="text-[10px] sm:text-[11px] font-bold text-emerald-400 tracking-widest">SERVER RUNNING</span>
                   </div>
                   <span className="text-[8px] text-slate-500 uppercase tracking-wider">Real-time Synced</span>
                 </div>
               </Panel>
               <Panel title="KIOSK SLIM">
                 <div className="text-center font-mono text-3xl font-bold text-white py-2">{getStok('Kiosk', null, 'Kiosk Slim')}</div>
                 <div className="text-[10px] text-center text-slate-500 pb-1 font-semibold uppercase tracking-wider">IN / OUT</div>
               </Panel>
            </div>
         </div>

         <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-3 min-h-0 mt-2">
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
                           <div className="w-full max-w-[16px] sm:max-w-[24px] bg-rose-600/90 border-t-2 border-l border-r border-rose-400 transition-all duration-700 relative rounded-t-sm" style={{height: `${pct}%`, minHeight: val>0?'4px':'0'}}>
                              {val > 0 && <span className="absolute -top-4 sm:-top-5 left-1/2 -translate-x-1/2 text-[7px] sm:text-[9px] text-white font-bold font-mono">{val}</span>}
                           </div>
                        </div>
                        <div className="text-[7px] sm:text-[9px] text-slate-400 mt-2 font-bold uppercase tracking-wider">{monthNames[i].substring(0,3)}</div>
                     </div>
                   )
                 })}
               </div>
               <div className="absolute bottom-2 left-0 w-full text-center text-[8px] sm:text-[9px] text-slate-500 tracking-wide">Total Outbound & Tagging ({dashboardYear})</div>
            </Panel>

            <Panel className="flex-1 flex flex-col justify-around py-4 px-4 relative">
               <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-3">
                     <span className="text-[10px] sm:text-[11px] font-bold text-white uppercase tracking-widest drop-shadow-md">STATUS STOK GLOBAL</span>
                     <span className="text-[10px] sm:text-xs font-mono font-bold text-blue-400 bg-blue-900/20 px-2 py-0.5 rounded border border-blue-800/30 shadow-inner">TOTAL: {globalStats.grand}</span>
                  </div>
                  <div className="space-y-3">
                     <div>
                        <div className="flex justify-between text-[9px] font-bold mb-1">
                           <span className="text-slate-400 tracking-wider">W.I.P (READY)</span>
                           <span className="text-blue-400 font-mono">{globalStats.wip} <span className="text-slate-500 font-sans ml-0.5">({globalStats.grand ? ((globalStats.wip/globalStats.grand)*100).toFixed(1) : 0}%)</span></span>
                        </div>
                        <div className="h-2 w-full bg-[#161b22] rounded-full overflow-hidden border border-[#30363d]/50">
                           <div className="h-full bg-blue-500 transition-all duration-700" style={{width: `${globalStats.grand ? (globalStats.wip/globalStats.grand)*100 : 0}%`}}></div>
                        </div>
                     </div>
                     <div>
                        <div className="flex justify-between text-[9px] font-bold mb-1">
                           <span className="text-slate-400 tracking-wider">TITIPAN (PROJECT)</span>
                           <span className="text-emerald-400 font-mono">{globalStats.titipan} <span className="text-slate-500 font-sans ml-0.5">({globalStats.grand ? ((globalStats.titipan/globalStats.grand)*100).toFixed(1) : 0}%)</span></span>
                        </div>
                        <div className="h-2 w-full bg-[#161b22] rounded-full overflow-hidden border border-[#30363d]/50">
                           <div className="h-full bg-emerald-500 transition-all duration-700" style={{width: `${globalStats.grand ? (globalStats.titipan/globalStats.grand)*100 : 0}%`}}></div>
                        </div>
                     </div>
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
               <div className="flex-1 flex flex-col justify-center">
                  <div className="text-[10px] sm:text-[11px] font-bold text-white mb-3 uppercase tracking-widest drop-shadow-md">DISTRIBUSI KATEGORI</div>
                  <div className="space-y-3">
                     <div>
                        <div className="flex justify-between text-[9px] font-bold mb-1">
                           <span className="text-slate-400 tracking-wider">LED DISPLAY</span>
                           <span className="text-purple-400 font-mono">{globalStats.led} <span className="text-slate-500 font-sans ml-0.5">({globalStats.grand ? ((globalStats.led/globalStats.grand)*100).toFixed(1) : 0}%)</span></span>
                        </div>
                        <div className="h-1.5 w-full bg-[#161b22] rounded-full overflow-hidden border border-[#30363d]/50">
                           <div className="h-full bg-purple-500 transition-all duration-700" style={{width: `${globalStats.grand ? (globalStats.led/globalStats.grand)*100 : 0}%`}}></div>
                        </div>
                     </div>
                     <div>
                        <div className="flex justify-between text-[9px] font-bold mb-1">
                           <span className="text-slate-400 tracking-wider">MONITOR (IFP/VDW)</span>
                           <span className="text-sky-400 font-mono">{globalStats.monitor} <span className="text-slate-500 font-sans ml-0.5">({globalStats.grand ? ((globalStats.monitor/globalStats.grand)*100).toFixed(1) : 0}%)</span></span>
                        </div>
                        <div className="h-1.5 w-full bg-[#161b22] rounded-full overflow-hidden border border-[#30363d]/50">
                           <div className="h-full bg-sky-500 transition-all duration-700" style={{width: `${globalStats.grand ? (globalStats.monitor/globalStats.grand)*100 : 0}%`}}></div>
                        </div>
                     </div>
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
               <div className="text-center text-[10px] sm:text-[11px] font-bold text-white mb-4 uppercase tracking-widest drop-shadow-md">BEST PRODUCT ({dashboardYear})</div>
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

         <div className="flex flex-col lg:flex-row gap-3 shrink-0 h-64 lg:h-56">
            <Panel className="flex-[3] flex flex-col bg-[#161b22] overflow-hidden p-0 sm:p-0">
               <div className="flex items-center justify-between p-2.5 border-b border-[#30363d] bg-[#0d1117] shrink-0">
                  <div className="flex items-center gap-2">
                     <Search size={14} className="text-blue-400"/>
                     <span className="text-[11px] font-bold text-blue-400 uppercase tracking-widest">Tracking Serial Number & Histori</span>
                  </div>
                  <input type="text" placeholder="Cari Batch Module / SN / Project..." value={searchSN} onChange={e => setSearchSN(e.target.value)} className="bg-[#161b22] border border-[#30363d] text-[11px] text-slate-200 px-3 py-1 rounded-md w-36 sm:w-56 focus:border-blue-500 hover:border-slate-500 outline-none transition-all shadow-inner"/>
               </div>
               {searchHint && (
                 <div className="bg-blue-950/20 border-b border-blue-900/50 px-3 py-2 flex flex-col sm:flex-row sm:items-center justify-between shrink-0 gap-2">
                    <div className="flex items-center gap-2 text-[10px] text-blue-200">
                       <Info size={14} className="text-blue-400 shrink-0"/>
                       <span>Info <strong>{searchHint.itemName}</strong> Terakhir: SN <strong className="text-emerald-400">{searchHint.rangeSN}</strong> (Tgl Input: {new Date(searchHint.date).toLocaleDateString('id-ID')})</span>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider text-center shrink-0 ${searchHint.status.includes('IN') ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-800/50' : searchHint.status === 'N/A' ? 'bg-gray-800 text-gray-400 border border-gray-700' : 'bg-orange-900/50 text-orange-400 border border-orange-800/50'}`}>
                       STATUS: {searchHint.status}
                    </span>
                 </div>
               )}
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
                        {filteredSNLogs.length === 0 ? (<tr><td colSpan={isAdmin ? "7" : "6"} className="text-center py-6 text-[11px] font-medium text-slate-500">Tidak ada riwayat Serial Number</td></tr>) : filteredSNLogs.map(sn => (
                          <tr key={sn.id} className="border-b border-[#30363d]/50 hover:bg-[#1f2937]/60 transition-colors cursor-default">
                             <td className="py-2 px-3 text-[11px] text-slate-400 font-mono whitespace-nowrap">{sn.date ? new Date(sn.date).toLocaleDateString('id-ID', {day:'2-digit', month:'short', year:'2-digit'}) : '-'}</td>
                             <td className="py-2 px-3 text-[11px] text-slate-200 font-bold">{sn.itemName}</td>
                             <td className="py-2 px-3 text-[11px] text-emerald-400 font-mono font-semibold">{sn.batch}</td>
                             <td className="py-2 px-3 text-[11px] text-blue-400 font-mono font-semibold flex items-center gap-2 group">
                               {sn.rangeSN}
                               {isAdmin && sn.rangeSN !== '-' && ( <button onClick={() => handleCopyText(sn.rangeSN)} className="text-slate-500 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" title="Copy SN"><Copy size={12}/></button>)}
                             </td>
                             <td className="py-2 px-3 text-[11px] text-slate-400 truncate max-w-[140px]" title={sn.project}>{sn.project}</td>
                             <td className="py-2 px-3 text-[11px] text-white font-bold text-center">{sn.qty}</td>
                             {isAdmin && (
                               <td className="py-2 px-3 text-center whitespace-nowrap">
                                 <button onClick={() => {
                                    const item = inventory.find(i => i.id === sn.itemId);
                                    setEditModal({ ...sn, lokasiAsal: item?.lokasiAsal || '', kategori: item?.kategori || '', tipe: item?.tipe && item.tipe !== '-' ? item.tipe : '', varian: item?.varian && item.varian !== '-' ? item.varian : '', subVarian: item?.subVarian && item.subVarian !== '-' ? item.subVarian : '', rc: item?.rc && item.rc !== '-' ? item.rc : '', oldItemId: sn.itemId, oldQty: sn.qty });
                                 }} className="text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 p-1.5 rounded border border-blue-500/30 mr-1.5 active:scale-95" title="Edit Data Lengkap SN"><Edit size={14}/></button>
                                 <button onClick={() => handleDeleteSN(sn.itemId, sn.id, sn.qty, sn.rangeSN)} className="text-rose-500 hover:text-rose-400 transition-colors bg-rose-500/10 p-1.5 rounded border border-rose-500/30 active:scale-95" title="Hapus & Tarik Stok"><Trash2 size={14}/></button>
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
                 {historyLog.length === 0 ? ( <div className="text-center text-[11px] text-slate-500 py-8">Belum ada riwayat sistem</div> ) : historyLog.slice(0, 50).map(log => (
                   <div key={log.id} className="flex items-center gap-3 py-2.5 border-b border-[#30363d]/40 hover:bg-[#161b22] transition-colors px-2.5 cursor-default">
                     <span className={`text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider w-16 text-center shrink-0 ${log.action === 'INBOUND' ? 'bg-emerald-500/20 text-emerald-400' : log.action === 'TAGGING' ? 'bg-purple-500/20 text-purple-400' : log.action === 'REVERT' ? 'bg-amber-500/20 text-amber-400' : log.action === 'EDIT' ? 'bg-blue-500/20 text-blue-400' : log.action === 'REJECT' ? 'bg-rose-500/20 text-rose-400' : log.action === 'UPLOAD' ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-500/20 text-slate-400'}`}>{log.action}</span>
                     <span className="text-[10px] text-slate-500 font-mono shrink-0 w-10 text-center">{log.timestamp ? new Date(log.timestamp.toMillis()).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'}) : ''}</span>
                     <div className="text-[10px] sm:text-[11px] text-slate-300 font-medium truncate flex-1" title={log.details}>{log.details}</div>
                     <div className="text-[9px] text-slate-500 font-semibold tracking-wide italic shrink-0 w-24 text-right truncate" title={getEngineerFullName(log.user)}>{getEngineerFullName(log.user)}</div>
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
                       {['65"', '75"', '86"'].map(u => <div key={u} className="text-[10px] sm:text-[11px] font-mono font-bold text-center text-blue-400 py-1 bg-[#09090b]">{getStok('Monitor', 'IFP', merk, u, 'IVP')}</div>)}
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
    if (!isAdmin) return null; 
    let data = [];
    inventory.forEach(item => {
      if (item.snList && Array.isArray(item.snList)) {
        item.snList.forEach(sn => {
          if (!sn.date) return;
          const snDate = new Date(sn.date);
          if (snDate.getMonth() === reportMonth && snDate.getFullYear() === reportYear) {
            const locCheck = item.lokasiAsal || '-';
            if (reportLocation !== 'Semua' && !locCheck.includes(reportLocation)) return;
            let unitName = item.kategori;
            if (item.kategori === 'Kiosk') unitName = item.varian;
            else {
              if (item.tipe && item.tipe !== '-') unitName += ` ${item.tipe}`;
              if (item.varian && item.varian !== '-') unitName += ` ${item.varian}`;
            }
            let engineerName = sn.user;
            if (!engineerName || engineerName === 'System' || engineerName === 'Engineer') {
              const matchedLog = historyLog.find(log => {
                if (log.action !== 'INBOUND') return false;
                if (sn.rangeSN && sn.rangeSN !== '-') return log.details.includes(sn.rangeSN);
                if (log.timestamp && sn.date) {
                  const diff = Math.abs(log.timestamp.toMillis() - new Date(sn.date).getTime());
                  return diff < 60000 && log.details.includes(item.kategori);
                }
                return false;
              });
              if (matchedLog && matchedLog.user) engineerName = matchedLog.user;
            }
            data.push({
              id: sn.id, tanggal: snDate, lokasi: item.lokasiAsal || '-', unit: unitName.trim(), pitch: item.subVarian && item.subVarian !== '-' ? item.subVarian : '-',
              sn: sn.rangeSN || '-', qty: parseInt(sn.qty) || 1, project: sn.project || '-', user: getEngineerFullName(engineerName)
            });
          }
        });
      }
    });

    data.sort((a, b) => {
      const locA = a.lokasi.toLowerCase(); const locB = b.lokasi.toLowerCase();
      if (locA.includes('strada') && !locB.includes('strada')) return -1;
      if (!locA.includes('strada') && locB.includes('strada')) return 1;
      return a.tanggal - b.tanggal; 
    });

    const filteredReportData = data;
    const totalStrada = filteredReportData.reduce((sum, item) => item.lokasi.includes('Strada') ? sum + item.qty : sum, 0);
    const totalSMKN = filteredReportData.reduce((sum, item) => item.lokasi.includes('SMKN 26') ? sum + item.qty : sum, 0);
    const totalAll = totalStrada + totalSMKN;

    const handleExportCSV = () => {
      if (filteredReportData.length === 0) return showNotif("Tidak ada data untuk diexport", "error");
      let csvContent = "\uFEFF";
      csvContent += "No;Tanggal;Lokasi;Unit;Pitch/Spek;SN/Range SN;Qty;Project/Keterangan;Engineer/SPV\n";
      filteredReportData.forEach((item, index) => {
        const dateStr = item.tanggal.toLocaleDateString('id-ID');
        const row = [index + 1, dateStr, `"${item.lokasi}"`, `"${item.unit}"`, `"${item.pitch}"`, `"${item.sn}"`, item.qty, `"${item.project}"`, `"${item.user}"`].join(";");
        csvContent += row + "\n";
      });
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a"); const url = URL.createObjectURL(blob);
      link.setAttribute("href", url); link.setAttribute("download", `Laporan_Rakitan_${monthNames[reportMonth]}_${reportYear}.csv`);
      link.style.visibility = 'hidden'; document.body.appendChild(link); link.click(); document.body.removeChild(link);
      showNotif("File Excel berhasil diunduh!", "success");
    };

    return (
      <div className="flex-1 w-full h-full flex flex-col bg-white print:bg-white text-black overflow-y-auto print:overflow-visible">
        <div className="p-4 sm:p-6 border-b border-gray-200 bg-slate-50 print:hidden shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Lokasi</label>
              <select value={reportLocation} onChange={e => setReportLocation(e.target.value)} className="bg-white border border-gray-300 text-sm rounded-md px-3 py-1.5 outline-none focus:border-blue-500 shadow-sm">
                <option value="Semua">Semua Lokasi</option><option value="Strada">MPDN Strada</option><option value="SMKN 26">MVI SMKN 26</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Bulan</label>
              <select value={reportMonth} onChange={e => setReportMonth(Number(e.target.value))} className="bg-white border border-gray-300 text-sm rounded-md px-3 py-1.5 outline-none focus:border-blue-500 shadow-sm">
                {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tahun</label>
              <select value={reportYear} onChange={e => setReportYear(Number(e.target.value))} className="bg-white border border-gray-300 text-sm rounded-md px-3 py-1.5 outline-none focus:border-blue-500 shadow-sm">
                {[...Array(5)].map((_, i) => { const y = new Date().getFullYear() - 2 + i; return <option key={y} value={y}>{y}</option> })}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleExportCSV} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-md transition-all duration-150 active:scale-95" title="Download Format Excel"><FileSpreadsheet size={18} /> Export Excel</button>
            <button onClick={() => window.print()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md transition-all duration-150 active:scale-95"><Printer size={18} /> Cetak PDF</button>
          </div>
        </div>

        <div className="p-8 sm:p-12 w-full max-w-6xl mx-auto print:p-0 print:max-w-none">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold uppercase tracking-widest border-b-2 border-black pb-3 inline-block mb-2">REKAPAN LAPORAN RAKITAN</h1>
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-600">PERIODE: {monthNames[reportMonth]} {reportYear}</p>
          </div>
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="border-2 border-black rounded-lg p-4 text-center bg-gray-50 print:bg-transparent"><div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">TOTAL MPDN STRADA</div><div className="text-3xl font-bold font-mono">{totalStrada}</div></div>
            <div className="border-2 border-black rounded-lg p-4 text-center bg-gray-50 print:bg-transparent"><div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">TOTAL MVI SMKN 26</div><div className="text-3xl font-bold font-mono">{totalSMKN}</div></div>
            <div className="border-2 border-black rounded-lg p-4 text-center bg-blue-50 print:bg-transparent"><div className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-2">TOTAL KESELURUHAN</div><div className="text-4xl font-bold font-mono text-blue-700 print:text-black">{totalAll}</div></div>
          </div>
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
                   <th className="border border-black px-3 py-3 text-left font-bold uppercase tracking-wider text-[11px]">Engineer / SPV</th>
                </tr>
             </thead>
             <tbody>
                {filteredReportData.length === 0 ? (
                  <tr><td colSpan="9" className="border border-black px-4 py-8 text-center italic text-gray-500">Tidak ada data rakitan di periode ini.</td></tr>
                ) : filteredReportData.map((item, index) => {
                  return (
                    <tr key={item.id}>
                      <td className="border border-black px-3 py-2.5 text-center font-mono text-xs">{index + 1}</td>
                      <td className="border border-black px-3 py-2.5 font-mono text-xs whitespace-nowrap">{item.tanggal.toLocaleDateString('id-ID', {day:'2-digit', month:'long', year:'numeric'})}</td>
                      <td className="border border-black px-3 py-2.5 text-xs font-semibold">{item.lokasi}</td>
                      <td className="border border-black px-3 py-2.5 text-xs font-bold">{item.unit}</td>
                      <td className="border border-black px-3 py-2.5 text-xs font-mono">{item.pitch}</td>
                      <td className="border border-black px-3 py-2.5 text-xs font-mono">{item.sn}</td>
                      <td className="border border-black px-3 py-2.5 text-center font-bold font-mono text-sm">{item.qty}</td>
                      <td className="border border-black px-3 py-2.5 text-xs font-semibold">{item.project}</td>
                      <td className="border border-black px-3 py-2.5 text-gray-600 text-xs uppercase tracking-wide">{item.user}</td>
                    </tr>
                  )
                })}
             </tbody>
          </table>
          <div className="mt-16 flex justify-between px-4 sm:px-24">
             <div className="flex flex-col items-center w-48">
               <p className="text-xs mb-16 uppercase tracking-wider text-gray-800 w-full text-center">Dibuat Oleh,</p>
               <p className="text-sm font-bold border-b border-black w-full text-center pb-1">{isAdmin && adminProfile ? adminProfile.name : '(.......................)'}</p>
               <p className="text-[10px] mt-1.5 uppercase tracking-widest text-gray-500 text-center">{isAdmin && adminProfile ? (adminProfile.role || (adminProfile.name === 'Aziz M.' ? 'Supervisor' : 'Engineer')) : 'Engineer'}</p>
             </div>
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

  const renderOjtReportTable = () => {
        const filteredStudents = mergedStudents.filter(s => s.weekId === selectedOjtWeek);
        const selectedWeekObj = OJT_WEEKS.find(w => w.id === selectedOjtWeek);
        const parsedDates = selectedWeekObj ? parseDatesForHeaders(selectedWeekObj.dateRange) : ['','','','',''];

        return (
            <div className="flex-1 w-full h-full bg-white print:bg-white text-black overflow-y-auto">
                <div className="p-4 sm:p-6 border-b border-gray-200 bg-slate-50 print:hidden flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><FileBarChart size={20} className="text-blue-600"/> Laporan Absensi Mingguan</h2>
                        <p className="text-sm text-gray-500 mt-1">Pilih minggu untuk melihat dan mencetak data kehadiran.</p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <select value={selectedOjtWeek} onChange={(e) => setSelectedOjtWeek(parseInt(e.target.value))} className="w-full sm:w-64 bg-white border border-gray-300 text-gray-900 text-sm font-semibold rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none transition-all shadow-sm">
                            {OJT_WEEKS.map(w => <option key={w.id} value={w.id}>{w.label} ({w.dateRange})</option>)}
                        </select>
                        <button onClick={() => window.print()} className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap"><Printer size={18}/> Cetak PDF</button>
                    </div>
                </div>

                <div className="p-4 sm:p-8 max-w-full print:p-0">
                    <div className="text-center mb-6 mt-4">
                        <h1 className="text-xl font-bold uppercase tracking-widest text-black">ABSENSI OJT SMK STRADA</h1>
                    </div>
                    
                    <div className="mb-4">
                        <table className="text-sm font-semibold">
                            <tbody>
                                <tr><td className="pr-4 pb-1">Periode</td><td className="pr-4 pb-1">:</td><td className="border border-black px-4 pb-1">{selectedWeekObj?.dateRange}</td></tr>
                                <tr><td className="pr-4 pb-1">Jadwal</td><td className="pr-4 pb-1">:</td><td className="border border-black px-4 pb-1">{selectedWeekObj?.label}</td></tr>
                                <tr><td className="pr-4">Waktu</td><td className="pr-4">:</td><td className="border border-black px-4">09:00 - 18:00</td></tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="overflow-x-auto print:overflow-visible">
                        <table className="w-full text-xs text-center border-collapse border border-black min-w-[1000px]">
                            <thead className="bg-[#fde047] print:bg-[#fde047] text-black border border-black">
                                <tr>
                                    <th rowSpan="2" className="border border-black p-2 w-10">NO</th>
                                    <th rowSpan="2" className="border border-black p-2 min-w-[150px]">Nama Siswa</th>
                                    <th rowSpan="2" className="border border-black p-2 min-w-[80px]">Kelas<br/>Jurusan</th>
                                    <th colSpan="2" className="border border-black p-1">Senin<br/><span className="font-normal text-[10px]">{parsedDates[0]}</span></th>
                                    <th colSpan="2" className="border border-black p-1">Selasa<br/><span className="font-normal text-[10px]">{parsedDates[1]}</span></th>
                                    <th colSpan="2" className="border border-black p-1">Rabu<br/><span className="font-normal text-[10px]">{parsedDates[2]}</span></th>
                                    <th colSpan="2" className="border border-black p-1">Kamis<br/><span className="font-normal text-[10px]">{parsedDates[3]}</span></th>
                                    <th colSpan="2" className="border border-black p-1">Jumat<br/><span className="font-normal text-[10px]">{parsedDates[4]}</span></th>
                                    <th colSpan="3" className="border border-black p-1">Rakitan</th>
                                    <th rowSpan="2" className="border border-black p-2 min-w-[120px]">Keterangan</th>
                                </tr>
                                <tr>
                                    <th className="border border-black p-1 w-10">09:00</th><th className="border border-black p-1 w-10">18:00</th>
                                    <th className="border border-black p-1 w-10">09:00</th><th className="border border-black p-1 w-10">18:00</th>
                                    <th className="border border-black p-1 w-10">09:00</th><th className="border border-black p-1 w-10">18:00</th>
                                    <th className="border border-black p-1 w-10">09:00</th><th className="border border-black p-1 w-10">18:00</th>
                                    <th className="border border-black p-1 w-10">09:00</th><th className="border border-black p-1 w-10">18:00</th>
                                    <th className="border border-black p-1 w-12 text-[10px]">INDOOR</th>
                                    <th className="border border-black p-1 w-12 text-[10px]">DIECAST</th>
                                    <th className="border border-black p-1 w-12 text-[10px]">OUTDOOR</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.length === 0 ? (
                                    <tr><td colSpan="17" className="border border-black p-4 italic text-gray-500">Tidak ada data siswa untuk minggu ini.</td></tr>
                                ) : filteredStudents.map((student, index) => {
                                    
                                    const getPrintChar = (status) => {
                                        if (status === 'Hadir') return '✓';
                                        if (status === 'Sakit') return 'S';
                                        if (status === 'Izin') return 'i';
                                        if (status === 'Alpa') return 'A';
                                        return '';
                                    };

                                    return (
                                        <tr key={student.id} className="border-b border-black hover:bg-gray-50 print:bg-transparent transition-colors">
                                            <td className="border border-black p-1 font-mono">{index + 1}</td>
                                            <td className="border border-black p-1 text-left pl-2 font-bold whitespace-nowrap">{student.name}</td>
                                            <td className="border border-black p-1 font-semibold">{student.class.replace(' ', '')}</td>
                                            
                                            <td className="border border-black p-1 text-center font-bold text-gray-800 align-middle text-sm">{getPrintChar(student.daily.senin)}</td>
                                            <td className="border border-black p-1 text-center font-bold text-gray-800 align-middle text-sm">{getPrintChar(student.daily.senin)}</td>
                                            
                                            <td className="border border-black p-1 text-center font-bold text-gray-800 align-middle text-sm">{getPrintChar(student.daily.selasa)}</td>
                                            <td className="border border-black p-1 text-center font-bold text-gray-800 align-middle text-sm">{getPrintChar(student.daily.selasa)}</td>
                                            
                                            <td className="border border-black p-1 text-center font-bold text-gray-800 align-middle text-sm">{getPrintChar(student.daily.rabu)}</td>
                                            <td className="border border-black p-1 text-center font-bold text-gray-800 align-middle text-sm">{getPrintChar(student.daily.rabu)}</td>
                                            
                                            <td className="border border-black p-1 text-center font-bold text-gray-800 align-middle text-sm">{getPrintChar(student.daily.kamis)}</td>
                                            <td className="border border-black p-1 text-center font-bold text-gray-800 align-middle text-sm">{getPrintChar(student.daily.kamis)}</td>
                                            
                                            <td className="border border-black p-1 text-center font-bold text-gray-800 align-middle text-sm">{getPrintChar(student.daily.jumat)}</td>
                                            <td className="border border-black p-1 text-center font-bold text-gray-800 align-middle text-sm">{getPrintChar(student.daily.jumat)}</td>
                                            
                                            <td className="border border-black p-0 bg-green-50 print:bg-transparent align-middle">
                                                <input type="number" min="0" value={student.rakitan.indoor} onChange={(e) => handleUpdateRakitan(student.id, 'indoor', e.target.value)} className={`w-full h-full text-center bg-transparent focus:ring-0 focus:outline-none p-1 font-mono font-bold ${!isAdmin ? 'pointer-events-none' : ''} print:hidden`}/>
                                                <span className="hidden print:inline-block font-mono">{student.rakitan.indoor}</span>
                                            </td>
                                            <td className="border border-black p-0 bg-green-50 print:bg-transparent align-middle">
                                                <input type="number" min="0" value={student.rakitan.diecast} onChange={(e) => handleUpdateRakitan(student.id, 'diecast', e.target.value)} className={`w-full h-full text-center bg-transparent focus:ring-0 focus:outline-none p-1 font-mono font-bold ${!isAdmin ? 'pointer-events-none' : ''} print:hidden`}/>
                                                <span className="hidden print:inline-block font-mono">{student.rakitan.diecast}</span>
                                            </td>
                                            <td className="border border-black p-0 bg-green-50 print:bg-transparent align-middle">
                                                <input type="number" min="0" value={student.rakitan.outdoor} onChange={(e) => handleUpdateRakitan(student.id, 'outdoor', e.target.value)} className={`w-full h-full text-center bg-transparent focus:ring-0 focus:outline-none p-1 font-mono font-bold ${!isAdmin ? 'pointer-events-none' : ''} print:hidden`}/>
                                                <span className="hidden print:inline-block font-mono">{student.rakitan.outdoor}</span>
                                            </td>
                                            
                                            <td className="border border-black p-1 text-[10px] text-rose-600 font-semibold text-left pl-1">
                                                {student.notes ? <span className="italic text-gray-600 font-bold">{student.notes}</span> : ''}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 text-[10px] italic font-semibold text-gray-700">
                        <p>* i : Izin</p>
                        <p>* S : Sakit</p>
                        <p>* A : Alpa</p>
                    </div>

                    <div className="mt-12 flex justify-between text-center text-[11px] text-black font-semibold w-full pb-4">
                        <div className="w-40">
                            <div className="h-16"></div>
                            <p className="border-b border-black font-bold">Ruben Nata</p>
                            <p>PRODUKSI</p>
                        </div>
                        <div className="w-40">
                            <div className="h-16"></div>
                            <p className="border-b border-black font-bold">Teguh Drajat</p>
                            <p>MANAGER PRODUKSI</p>
                        </div>
                        <div className="w-40">
                            <div className="h-16"></div>
                            <p className="border-b border-black font-bold">Parida</p>
                            <p>MANAGER OPERASIONAL</p>
                        </div>
                        <div className="w-40">
                            <div className="h-16"></div>
                            <p className="border-b border-black font-bold">Sutrisno</p>
                            <p>SMK STRADA</p>
                        </div>
                    </div>
                </div>
            </div>
        );
  };

  const renderOJT = () => {
    const handleOpenOJT = (month, weekLabel, url) => {
      if (!url) { showNotif(`File PDF untuk ${month} ${weekLabel} belum tersedia / belum diunggah.`, 'error'); return; }
      setActiveDoc({ label: `Laporan OJT - ${month} ${weekLabel}`, url: url });
      setActiveTab('document');
    };

    const currentYearReports = ojtReports.filter(r => r.tahun === filterOjtYear);

    return (
      <div className="flex-1 w-full h-full flex flex-col overflow-hidden bg-[#09090b] font-sans">
         <div className="flex bg-[#161b22] border-b border-[#30363d] shrink-0 print:hidden">
            <button onClick={() => setActiveOjtSubTab('presensi')} className={`flex items-center gap-2 px-6 py-4 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeOjtSubTab === 'presensi' ? 'border-blue-500 text-blue-400 bg-blue-500/10' : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#1a1a1e]'}`}><Activity size={18}/> Kelola Presensi</button>
            <button onClick={() => setActiveOjtSubTab('laporan')} className={`flex items-center gap-2 px-6 py-4 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeOjtSubTab === 'laporan' ? 'border-blue-500 text-blue-400 bg-blue-500/10' : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#1a1a1e]'}`}><Printer size={18}/> Laporan Cetak</button>
            <button onClick={() => setActiveOjtSubTab('arsip')} className={`flex items-center gap-2 px-6 py-4 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeOjtSubTab === 'arsip' ? 'border-blue-500 text-blue-400 bg-blue-500/10' : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#1a1a1e]'}`}><BookOpen size={18}/> Arsip PDF</button>
         </div>

         {activeOjtSubTab === 'presensi' && (
            <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-hidden animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 bg-[#161b22] p-4 rounded-xl border border-[#30363d] shrink-0">
                    <div>
                        <h2 className="text-white font-bold text-lg">Kehadiran Harian Siswa</h2>
                        <p className="text-xs text-slate-400">Klik ikon di kolom hari untuk mengubah status (Hadir, Sakit, Izin, Alpa).</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select value={selectedOjtWeek} onChange={(e) => setSelectedOjtWeek(parseInt(e.target.value))} className="bg-[#0f0f11] border border-[#30363d] text-slate-200 text-sm font-bold rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 shadow-inner">
                            {OJT_WEEKS.map(w => <option key={w.id} value={w.id}>{w.label} ({w.dateRange})</option>)}
                        </select>
                        {isAdmin && (
                            <div className="flex items-center gap-2">
                                <button onClick={handleClearAllWeekly} disabled={isSubmitting || filteredStudentsForBulk.length === 0} className="bg-rose-600 hover:bg-rose-500 text-white px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-95 disabled:opacity-50" title="Hapus semua presensi">
                                    <Trash2 size={14}/> Kosongkan Semua
                                </button>
                                <button onClick={() => setShowBulkModal(true)} disabled={isSubmitting || filteredStudentsForBulk.length === 0} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-95 disabled:opacity-50">
                                    <Check size={14}/> Set Status (Multi)
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1 bg-[#0d1117] rounded-xl border border-[#30363d]">
                    <table className="w-full text-left text-slate-300">
                        <thead className="text-[10px] sm:text-xs text-slate-400 uppercase bg-[#1a1a1e] border-b border-[#30363d] sticky top-0 z-10 shadow-md">
                            <tr>
                                <th scope="col" className="px-3 py-4 w-12 text-center font-bold tracking-wider border-r border-[#30363d]">No</th>
                                <th scope="col" className="px-4 py-4 font-bold tracking-wider border-r border-[#30363d]">Nama Siswa</th>
                                <th scope="col" className="px-4 py-4 font-bold tracking-wider whitespace-nowrap border-r border-[#30363d]">Kelas</th>
                                <th scope="col" className="px-2 py-4 text-center font-bold tracking-wider">Senin</th>
                                <th scope="col" className="px-2 py-4 text-center font-bold tracking-wider">Selasa</th>
                                <th scope="col" className="px-2 py-4 text-center font-bold tracking-wider">Rabu</th>
                                <th scope="col" className="px-2 py-4 text-center font-bold tracking-wider">Kamis</th>
                                <th scope="col" className="px-2 py-4 text-center font-bold tracking-wider border-r border-[#30363d]">Jumat</th>
                                {isAdmin && <th scope="col" className="px-4 py-4 text-center font-bold tracking-wider">Aksi</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudentsForBulk.length === 0 ? (
                                <tr>
                                    <td colSpan={isAdmin ? "9" : "8"} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-500">
                                            <Users size={32} className="mb-2 opacity-50"/>
                                            <p className="font-semibold text-sm">Tidak ada siswa terjadwal.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredStudentsForBulk.map((student, index) => {
                                return (
                                    <tr key={student.id} className="border-b border-[#1f1f23] hover:bg-[#161b22] transition-colors">
                                        <td className="px-3 py-3 text-center text-xs font-mono border-r border-[#1f1f23]">{index + 1}</td>
                                        <td className="px-4 py-3 text-xs font-bold text-white whitespace-nowrap border-r border-[#1f1f23]">
                                            {student.name}
                                            {student.notes && <p className="text-[10px] text-amber-400/80 font-normal mt-1 flex items-center gap-1 truncate max-w-[150px]" title={student.notes}><MessageSquare size={10}/> {student.notes}</p>}
                                        </td>
                                        <td className="px-4 py-3 text-xs font-semibold whitespace-nowrap border-r border-[#1f1f23]">{student.class}</td>
                                        
                                        {['senin', 'selasa', 'rabu', 'kamis', 'jumat'].map(day => (
                                            <td key={day} className={`px-1 py-2 text-center align-middle ${day === 'jumat' ? 'border-r border-[#1f1f23]' : ''}`}>
                                                {isAdmin ? (
                                                    <button 
                                                        onClick={() => handleCycleDailyStatus(student.id, day, student.daily)} 
                                                        className={`w-8 h-8 rounded border flex items-center justify-center transition-colors mx-auto active:scale-90 ${student.daily[day] === 'Hadir' ? 'bg-emerald-900/30 border-emerald-500/50' : student.daily[day] === 'Sakit' ? 'bg-amber-900/30 border-amber-500/50' : student.daily[day] === 'Izin' ? 'bg-blue-900/30 border-blue-500/50' : student.daily[day] === 'Alpa' ? 'bg-rose-900/30 border-rose-500/50' : 'bg-[#0f0f11] border-[#30363d] hover:border-slate-500'}`}
                                                        title={`Ubah status ${day}`}
                                                    >
                                                        {renderDailyBadge(student.daily[day])}
                                                    </button>
                                                ) : (
                                                    <div className="w-8 h-8 mx-auto flex items-center justify-center">
                                                        {renderDailyBadge(student.daily[day])}
                                                    </div>
                                                )}
                                            </td>
                                        ))}

                                        {isAdmin && (
                                            <td className="px-4 py-3 text-center">
                                                <button onClick={() => setEditOjtModal(student)} className="text-blue-400 hover:text-white hover:bg-blue-600 inline-flex items-center justify-center bg-blue-500/10 w-8 h-8 rounded-lg transition-colors border border-blue-500/30 active:scale-95" title="Rolling Jadwal / Keterangan">
                                                    <Edit size={14}/>
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                )
                            })}
                        </tbody>
                        {isAdmin && filteredStudentsForBulk.length > 0 && (
                            <tfoot className="text-[10px] sm:text-xs text-slate-400 uppercase bg-[#1a1a1e] border-t-2 border-[#30363d] sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                                <tr>
                                    <td colSpan="3" className="px-4 py-3 text-right font-bold tracking-wider border-r border-[#30363d] text-emerald-500">
                                        <div className="flex items-center justify-end gap-2">
                                            <Check size={14}/> TANDAI HADIR SEMUA PER HARI:
                                        </div>
                                    </td>
                                    {['senin', 'selasa', 'rabu', 'kamis', 'jumat'].map(day => {
                                        const isAllPresent = filteredStudentsForBulk.length > 0 && filteredStudentsForBulk.every(s => s.daily[day] === 'Hadir');
                                        return (
                                        <td key={`check-all-${day}`} className={`px-1 py-2 text-center align-middle ${day === 'jumat' ? 'border-r border-[#30363d]' : ''}`}>
                                            <button 
                                                onClick={() => handleCheckAllDay(day)} 
                                                disabled={isSubmitting}
                                                className={`w-8 h-8 rounded border flex items-center justify-center transition-colors mx-auto active:scale-90 disabled:opacity-50 ${isAllPresent ? 'bg-emerald-900/50 border-emerald-500 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'border-[#30363d] bg-[#0f0f11] hover:border-emerald-500/50 hover:bg-emerald-900/30 text-emerald-500/50 hover:text-emerald-400'}`}
                                                title={isAllPresent ? `Kosongkan Semua - ${day.toUpperCase()}` : `Tandai Semua Hadir - ${day.toUpperCase()}`}
                                            >
                                                <Check size={14}/>
                                            </button>
                                        </td>
                                    )})}
                                    <td className="px-4 py-3 text-center">
                                        <button 
                                            onClick={handleClearAllWeekly}
                                            disabled={isSubmitting}
                                            className="w-8 h-8 rounded border border-rose-500/30 bg-rose-500/10 hover:bg-rose-600 text-rose-500 hover:text-white flex items-center justify-center transition-colors mx-auto active:scale-90 disabled:opacity-50"
                                            title="Kosongkan Semua Presensi Minggu Ini"
                                        >
                                            <Trash2 size={14}/>
                                        </button>
                                    </td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
         )}

         {activeOjtSubTab === 'laporan' && renderOjtReportTable()}

         {activeOjtSubTab === 'arsip' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 animate-in fade-in duration-300 custom-scrollbar">
                <div className="text-center mb-6 flex flex-col items-center">
                    <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-widest drop-shadow-md flex items-center justify-center gap-3">
                        <BookOpen className="text-emerald-400" size={24}/> ARSIP LAPORAN PDF OJT
                    </h2>
                    <p className="text-xs text-slate-500 mt-2 uppercase tracking-wider">Pilih tahun arsip untuk melihat laporan yang diupload via form mutasi.</p>
                    <div className="mt-4 flex items-center gap-2 bg-[#161b22] px-4 py-2 rounded-lg border border-[#30363d]">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tahun Arsip:</span>
                        <select value={filterOjtYear} onChange={e => setFilterOjtYear(e.target.value)} className="bg-[#0f0f11] text-blue-400 font-bold border border-[#30363d] rounded p-1 outline-none">
                            {[...Array(5)].map((_, i) => { const y = new Date().getFullYear() - 2 + i; return <option key={y} value={y.toString()}>{y}</option> })}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {monthNames.map((monthStr, idx) => (
                        <Panel key={idx} title={monthStr} className="min-h-min" headerClass="text-emerald-400 bg-emerald-950/10 border-emerald-900/30">
                            <div className="grid grid-cols-2 gap-2 mt-1">
                                {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((wLabel, wIdx) => {
                                    const reportData = currentYearReports.find(r => r.bulan === monthStr && r.minggu === wLabel);
                                    const isAvailable = !!reportData?.url;
                                    return (
                                        <div key={wIdx} className="relative group">
                                            <button onClick={() => handleOpenOJT(monthStr, wLabel, reportData?.url)}
                                                className={`w-full flex flex-col items-center justify-center gap-1.5 p-3 border rounded-md transition-all duration-150 active:scale-95 ${
                                                    isAvailable ? 'bg-[#1a1a1e] border-[#30363d] text-slate-300 hover:border-emerald-500/50 hover:bg-emerald-900/10 hover:text-emerald-400 shadow-sm' 
                                                            : 'bg-[#0f0f11] border-[#1f1f23] text-slate-600 hover:border-slate-700 cursor-not-allowed'
                                                }`}
                                                title={isAvailable ? `Buka Laporan ${monthStr} ${wLabel}` : 'File Belum Diunggah (Gunakan Form Mutasi)'}
                                            >
                                                <FileText size={18} className={isAvailable ? 'text-emerald-500/70' : 'opacity-30'} />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">{wLabel}</span>
                                            </button>
                                            {isAdmin && isAvailable && (
                                                <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={(e) => { e.stopPropagation(); setFormData({ txType: 'upload_ojt', tahun: reportData.tahun, bulan: reportData.bulan, minggu: reportData.minggu, linkOJT: reportData.url || '' }); setActiveTab('mutasi'); showNotif("Silakan update Link Google Drive.", "info"); }} className="p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-500 shadow-md" title="Timpa File (Edit)"><Edit size={12}/></button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteOJT(reportData); }} className="p-1.5 bg-rose-600 text-white rounded-full hover:bg-rose-500 shadow-md" title="Hapus File"><Trash2 size={12}/></button>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </Panel>
                    ))}
                </div>
            </div>
         )}
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
          <p className="text-sm text-center max-w-md mb-6">Anda memerlukan hak akses Engineer untuk mengeksekusi mutasi stok.</p>
          <button onClick={handleAdminToggle} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-sm font-bold transition-all duration-150 shadow-lg hover:-translate-y-0.5 active:scale-95 active:translate-y-0">
            Login Engineer
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

    const TX_NOTES = {
      inbound: "INFO: Gunakan form ini untuk mendaftarkan stok barang baru (hasil perakitan / restock) ke Gudang Pusat (W.I.P).",
      tagging: "INFO: Gunakan form ini untuk mem-booking atau mengalokasikan stok dari Gudang Pusat (W.I.P) ke tim Project (IVP / MLDS).",
      revert: "INFO: Gunakan form ini untuk menarik atau membatalkan stok yang sudah di-Tagging kembali ke Gudang Pusat (W.I.P).",
      reject: "INFO: Gunakan form ini untuk memindahkan barang yang cacat/rusak ke daftar NG, atau memulihkan barang NG yang sudah selesai diservis.",
      outbound: "INFO: Gunakan form ini untuk mengeluarkan barang secara permanen dari sistem (dikirim ke lokasi project klien, dibuang, dll).",
      upload_ojt: "INFO: Gunakan form ini untuk menyimpan Link Google Drive Laporan PDF OJT. Dokumen yang dihubungkan akan otomatis muncul di menu Siswa OJT."
    };

    let lastSNInfo = null;
    if (activeTx === 'inbound' && formData.lokasi && formData.kategori) {
        const currentItemId = `${formData.lokasi}-${formData.kategori}-${formData.tipe || ''}-${formData.varian || ''}-${formData.subVarian || ''}-${formData.rc || ''}`.replace(/\s+/g, '-').toLowerCase();
        const existingItem = inventory.find(i => i.id === currentItemId);
        if (existingItem && existingItem.snList && existingItem.snList.length > 0) {
            const sortedSNs = [...existingItem.snList].sort((a, b) => {
                const dateDiff = new Date(b.date) - new Date(a.date);
                if (dateDiff !== 0) return dateDiff;
                return parseInt(b.id) - parseInt(a.id);
            });
            lastSNInfo = sortedSNs[0];
        }
    }

    return (
      <div className="max-w-4xl mx-auto w-full h-full flex flex-col animate-in slide-in-from-bottom-4 duration-500 py-4 px-4 print:hidden">
        <div className="bg-[#0f0f11] border border-[#1f1f23] rounded-2xl flex flex-col overflow-hidden flex-1 shadow-2xl">
          
          <div className="flex gap-2 border-b border-[#1f1f23] pb-5 mb-5 mt-4 px-6 pt-3 overflow-x-auto custom-scrollbar relative">
             {isOffline && (
               <div className="absolute top-0 right-4 flex items-center gap-1.5 text-[9px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 animate-pulse">
                 <WifiOff size={10} /> OFFLINE MODE
               </div>
             )}
            {[ { id: 'inbound', label: 'INBOUND', icon: PlusCircle },
               { id: 'tagging', label: 'TAGGING', icon: Tag },
               { id: 'revert', label: 'REVERT', icon: RotateCcw },
               { id: 'reject', label: 'REJECT / NG', icon: AlertTriangle },
               { id: 'outbound', label: 'OUTBOUND', icon: MinusCircle },
               { id: 'upload_ojt', label: 'UPLOAD OJT', icon: Link }
            ].map(t => {
              const ActionIcon = t.icon;
              return (
              <button key={t.id} onClick={() => setFormData({ txType: t.id, tglMutasi: getTodayDateString() })}
                className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 px-2 rounded-full text-xs font-bold transition-all duration-150 active:scale-95 ${
                  activeTx === t.id ? (t.id === 'reject' ? 'bg-rose-600 text-white shadow-md shadow-rose-900/20' : t.id === 'upload_ojt' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/20' : 'bg-blue-600 text-white shadow-md shadow-blue-900/20') : 'bg-[#151518] border border-[#27272a] text-slate-400 hover:text-slate-200 hover:border-slate-600'
                }`}>
                <ActionIcon size={16} /> {t.label}
              </button>
            )})}
          </div>

          <div className={`border rounded-lg p-3 mx-8 mb-4 flex items-start gap-3 animate-in fade-in duration-300 ${activeTx === 'upload_ojt' ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-blue-950/20 border-blue-900/50'}`}>
            <Info className={`${activeTx === 'upload_ojt' ? 'text-emerald-500' : 'text-blue-500'} mt-0.5 shrink-0`} size={16}/>
            <p className={`text-xs leading-relaxed font-medium tracking-wide ${activeTx === 'upload_ojt' ? 'text-emerald-200' : 'text-blue-200'}`}>
              {TX_NOTES[activeTx]}
            </p>
          </div>

          <div className="overflow-y-auto custom-scrollbar flex-1 px-8 pb-8">
            
            {activeTx === 'upload_ojt' && (
              <div className="space-y-6 max-w-xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className={LabelClass}>Tahun Arsip</label>
                    <select className={InputClass} value={formData.tahun || ''} onChange={e => setFormData({...formData, tahun: e.target.value})}>
                      <option value="">-- Pilih Tahun --</option>
                      {[...Array(5)].map((_, i) => { const y = new Date().getFullYear() - 2 + i; return <option key={y} value={y.toString()}>{y}</option> })}
                    </select>
                  </div>
                  <div>
                    <label className={LabelClass}>Bulan Laporan</label>
                    <select className={InputClass} value={formData.bulan || ''} onChange={e => setFormData({...formData, bulan: e.target.value})}>
                      <option value="">-- Pilih Bulan --</option>
                      {monthNames.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className={LabelClass}>Pilih Minggu (Week)</label>
                    <select className={InputClass} value={formData.minggu || ''} onChange={e => setFormData({...formData, minggu: e.target.value})}>
                      <option value="">-- Pilih Minggu --</option>
                      {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className={`${LabelClass} text-emerald-400`}>Paste Link Google Drive (Wajib)</label>
                    <input type="url" className={`${InputClass} border-emerald-900/50`} placeholder="https://drive.google.com/file/d/..." value={formData.linkOJT || ''} onChange={e => setFormData({...formData, linkOJT: e.target.value})} />
                  </div>
                </div>
                <button onClick={handleUploadOJT} disabled={isSubmitting} className={`w-full py-4 mt-6 text-white text-sm font-bold rounded-lg transition-all duration-150 shadow-md hover:-translate-y-0.5 active:scale-95 active:shadow-sm uppercase tracking-widest flex justify-center items-center gap-2 disabled:opacity-50 disabled:pointer-events-none bg-emerald-600 hover:bg-emerald-500`}>
                   {isSubmitting ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Simpan Link Laporan'}
                </button>
              </div>
            )}

            {activeTx === 'inbound' && (
              <div className="space-y-6 max-w-2xl mx-auto">
                <div className="w-full bg-[#161b22] p-4 rounded-xl border border-[#30363d]">
                  <label className={`${LabelClass} text-emerald-400 flex items-center gap-2`}><Hexagon size={12}/> TANGGAL RAKITAN / INBOUND</label>
                  <input type="date" className={`${InputClass} border-emerald-900/50 text-emerald-400 font-bold bg-[#0d1117]`} value={formData.tglMutasi || ''} onChange={e => setFormData({...formData, tglMutasi: e.target.value})} />
                  <p className="text-[9px] text-slate-500 mt-1.5 tracking-wide italic">*Default adalah hari ini. Ubah jika Anda mencatat data rakitan di hari sebelumnya.</p>
                </div>

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
                  {formData.kategori === 'LED' && (
                     <div className="sm:col-span-2">
                       <label className={`${LabelClass} text-blue-400`}>Range SN / Serial Number</label>
                       <input type="text" className={`${InputClass} border-blue-900/50`} placeholder="Contoh: 0001-0100 atau SN12345" value={formData.rangeSN || ''} onChange={e => setFormData({...formData, rangeSN: e.target.value})} />
                       {lastSNInfo && (
                         <div className="text-[10px] text-emerald-400 mt-2 flex items-center gap-1.5 bg-emerald-950/20 p-2 rounded border border-emerald-900/30">
                           <Info size={14}/> <span>Range SN Terakhir: <strong>{lastSNInfo.rangeSN}</strong> (Tanggal Input: {new Date(lastSNInfo.date).toLocaleDateString('id-ID')})</span>
                         </div>
                       )}
                     </div>
                  )}
                  {formData.kategori && formData.kategori !== 'LED' && (
                     <div className="sm:col-span-2">
                       <label className={`${LabelClass} text-blue-400`}>Daftar Serial Number (Wajib - Pisahkan dgn Koma/Spasi)</label>
                       <textarea className={`${InputClass} min-h-[80px] border-blue-900/50`} placeholder="Misal: SN123, SN456" value={formData.processSNs || ''} onChange={e => setFormData({...formData, processSNs: e.target.value})} />
                       {lastSNInfo && (
                         <div className="text-[10px] text-emerald-400 mt-2 flex items-center gap-1.5 bg-emerald-950/20 p-2 rounded border border-emerald-900/30">
                           <Info size={14} className="shrink-0"/> <span className="truncate w-full block">SN Terakhir Diinput: <strong>{lastSNInfo.rangeSN}</strong> (Tanggal Input: {new Date(lastSNInfo.date).toLocaleDateString('id-ID')})</span>
                         </div>
                       )}
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
                <div className="w-full bg-[#161b22] p-4 rounded-xl border border-[#30363d]">
                  <label className={`${LabelClass} text-blue-400 flex items-center gap-2`}><Hexagon size={12}/> TANGGAL ALOKASI</label>
                  <input type="date" className={`${InputClass} border-blue-900/50 text-blue-400 font-bold bg-[#0d1117]`} value={formData.tglMutasi || ''} onChange={e => setFormData({...formData, tglMutasi: e.target.value})} />
                </div>
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
                <div className="w-full bg-[#161b22] p-4 rounded-xl border border-[#30363d]">
                  <label className={`${LabelClass} ${activeTx === 'revert' ? 'text-amber-400' : 'text-rose-400'} flex items-center gap-2`}><Hexagon size={12}/> TANGGAL {activeTx.toUpperCase()}</label>
                  <input type="date" className={`${InputClass} ${activeTx === 'revert' ? 'border-amber-900/50 text-amber-400' : 'border-rose-900/50 text-rose-400'} font-bold bg-[#0d1117]`} value={formData.tglMutasi || ''} onChange={e => setFormData({...formData, tglMutasi: e.target.value})} />
                </div>
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
                <div className="w-full bg-[#161b22] p-4 rounded-xl border border-[#30363d]">
                  <label className={`${LabelClass} ${formData.rejectMode === 'restore' ? 'text-emerald-400' : 'text-rose-400'} flex items-center gap-2`}><Hexagon size={12}/> TANGGAL EKSEKUSI</label>
                  <input type="date" className={`${InputClass} ${formData.rejectMode === 'restore' ? 'border-emerald-900/50 text-emerald-400' : 'border-rose-900/50 text-rose-400'} font-bold bg-[#0d1117]`} value={formData.tglMutasi || ''} onChange={e => setFormData({...formData, tglMutasi: e.target.value})} />
                </div>
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
      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2.5 px-6 py-3 rounded-full shadow-2xl text-white font-bold tracking-wide animate-in slide-in-from-top-4 fade-in duration-300 border ${notification.type === 'error' ? 'bg-rose-600 border-rose-500' : notification.type === 'info' ? 'bg-blue-600 border-blue-500' : 'bg-emerald-600 border-emerald-500'} print:hidden`}>
          {notification.type === 'error' ? <X size={18}/> : <Check size={18}/>}
          {notification.msg}
        </div>
      )}

      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="w-16 sm:w-56 bg-[#0a0a0a] border-r border-[#1a1a1a] flex flex-col shrink-0 z-20 print:hidden">
        <div className="pt-6 sm:pt-8 pb-4 sm:pb-6 px-2 sm:px-6 flex justify-center sm:justify-start items-center">
          <img src="https://github.com/MVI-PDN/Keluhan-Pelanggan/blob/main/microvision-logo.webp?raw=true" alt="Microvision Logo" className="h-10 sm:h-14 w-auto object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.1)] -ml-1" />
        </div>
        
        <div className="flex-1 flex flex-col gap-1.5 px-2 sm:px-4 mt-4 overflow-y-auto custom-scrollbar pb-4">
          {[ { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }, { id: 'mutasi', label: 'Form Mutasi', icon: Activity }, { id: 'ojt', label: 'Siswa OJT', icon: Users }, { id: 'laporan', label: 'Laporan Rakitan', icon: FileBarChart } ].map(tab => {
            const isMutasiDisabled = tab.id === 'mutasi' && !isAdmin; 
            const isLaporanHidden = tab.id === 'laporan' && !isAdmin;
            if (isLaporanHidden) return null;
            const TabIcon = tab.icon;
            return (
              <button key={tab.id} onClick={() => { if(!isMutasiDisabled) setActiveTab(tab.id); }} className={`flex items-center justify-center sm:justify-start gap-3 px-2 sm:px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-[0.98] ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a1a1a]'} ${isMutasiDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
                <TabIcon size={20} /> <span className="hidden sm:block">{tab.label}</span>
              </button>
            )
          })}

          <div className="flex flex-col gap-1 w-full mt-1">
            <button onClick={() => setIsDocMenuOpen(!isDocMenuOpen)} className={`flex items-center justify-center sm:justify-between px-2 sm:px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-[0.98] hover:bg-[#1a1a1a] ${activeTab === 'document' || isDocMenuOpen ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}>
              <div className="flex items-center gap-3"><BookOpen size={20} /> <span className="hidden sm:block">Dokumen</span></div>
              <ChevronDown size={16} className={`hidden sm:block transition-transform ${isDocMenuOpen ? 'rotate-180 text-blue-400' : ''}`} />
            </button>

            {isDocMenuOpen && (
              <div className="flex flex-col gap-1 pl-2 sm:pl-7 pr-2 animate-in slide-in-from-top-2 duration-200">
                {DOC_LIST.map(doc => {
                  if (doc.isGroup) {
                    const isOpen = doc.id === 'sop' ? isSopMenuOpen : doc.id === 'pengembangan' ? isPengembanganOpen : isDesign3DMenuOpen;
                    const toggleOpen = () => { if (doc.id === 'sop') setIsSopMenuOpen(!isSopMenuOpen); else if (doc.id === 'pengembangan') setIsPengembanganOpen(!isPengembanganOpen); else setIsDesign3DMenuOpen(!isDesign3DMenuOpen); };
                    return (
                      <div key={doc.id} className="flex flex-col gap-1 w-full">
                        <button onClick={toggleOpen} className={`flex items-center justify-between py-2.5 px-3 rounded-lg transition-all duration-150 active:scale-95 text-left text-[11px] font-bold ${isOpen ? 'text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a1a1a]'}`}>
                          <span className="hidden sm:block">{doc.label}</span><FileText size={14} className="sm:hidden mx-auto"/><ChevronDown size={14} className={`hidden sm:block transition-transform ${isOpen ? 'rotate-180 text-blue-400' : ''}`} />
                        </button>
                        {isOpen && (
                          <div className="flex flex-col gap-1 pl-3 sm:pl-4 border-l border-[#30363d] ml-3 sm:ml-2 animate-in slide-in-from-top-1 duration-200">
                            {doc.items.map(subDoc => (
                              <button key={subDoc.id} onClick={() => { setActiveTab('document'); setActiveDoc(subDoc); }} className={`text-left text-[10px] font-bold py-2 px-3 rounded-lg transition-all duration-150 active:scale-95 ${activeTab === 'document' && activeDoc?.id === subDoc.id ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-500 hover:text-slate-300 hover:bg-[#1a1a1a] border border-transparent'}`}>
                                <span className="hidden sm:block truncate">{subDoc.label}</span><FileText size={12} className="sm:hidden mx-auto"/>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  }
                  return (
                    <button key={doc.id} onClick={() => { setActiveTab('document'); setActiveDoc(doc); }} className={`text-left text-[11px] font-bold py-2 px-3 rounded-lg transition-all duration-150 active:scale-95 ${activeTab === 'document' && activeDoc?.id === doc.id ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a1a1a] border border-transparent'}`}>
                      <span className="hidden sm:block">{doc.label}</span><FileText size={14} className="sm:hidden mx-auto"/>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="mt-1">
            {EXT_LINKS.map(link => {
              const LinkIcon = link.icon;
              return (
              <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center sm:justify-start gap-3 px-2 sm:px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-95 text-slate-400 hover:text-blue-400 hover:bg-blue-900/10 group">
                <LinkIcon size={20} /> <span className="hidden sm:block">{link.label}</span><ExternalLink size={14} className="hidden sm:block ml-auto opacity-0 group-hover:opacity-100 transition-opacity"/>
              </a>
            )})}
          </div>
        </div>

        <div className="p-4 sm:p-6 border-t border-[#1a1a1a] shrink-0">
          {isAdmin && adminProfile ? (
            <div className="flex items-center justify-between bg-[#161b22] p-3 rounded-xl border border-[#30363d] cursor-pointer hover:border-slate-500 transition-all duration-150 active:scale-95 shadow-sm" onClick={handleAdminToggle} title="Logout">
              <div className="flex items-center gap-3 overflow-hidden">
                <img src={adminProfile.avatar} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-blue-500/50 bg-[#0d1117] shrink-0" />
                <div className="flex flex-col truncate hidden sm:flex"><span className="text-sm font-bold text-white truncate">{adminProfile.name}</span><span className="text-[10px] text-emerald-400 font-bold tracking-widest flex items-center gap-1.5 mt-0.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> {adminProfile.role ? adminProfile.role.toUpperCase() : 'ENGINEER'}</span></div>
              </div>
              <LogOut size={16} className="text-slate-400 hover:text-rose-400 shrink-0 hidden sm:block"/>
            </div>
          ) : (
            <button onClick={handleAdminToggle} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[#27272a] hover:border-slate-500 transition-all duration-150 text-slate-300 font-semibold text-sm hover:bg-[#1a1a1a] active:scale-95" title="Login Engineer">
              <Settings size={18} className="sm:hidden"/><span className="hidden sm:block">Engineer Access</span>
            </button>
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-[#09090b] print:bg-white print:m-0 print:p-0">
        <style>{`@media print { body { background: white !important; color: black !important; } .print\\:hidden { display: none !important; } .print\\:block { display: block !important; } .print\\:bg-white { background-color: white !important; } .print\\:text-black { color: black !important; } .print\\:overflow-visible { overflow: visible !important; } .print\\:p-0 { padding: 0 !important; } .print\\:max-w-none { max-width: none !important; } .print\\:bg-transparent { background-color: transparent !important; } }`}</style>
        {activeTab === 'dashboard' && renderGSheetDashboard()}
        {activeTab === 'mutasi' && renderForm()}
        {activeTab === 'ojt' && renderOJT()}
        {activeTab === 'document' && renderDocumentViewer()}
        {activeTab === 'laporan' && renderLaporan()}
        
        {}
        {showPinModal && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0f0f11] border border-[#30363d] rounded-xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
               <h3 className="text-white font-bold mb-2 text-center text-lg">Akses Engineer</h3>
               <p className="text-slate-400 text-xs text-center mb-6">Silakan masukkan PIN Anda untuk melanjutkan.</p>
               <input type="password" autoFocus placeholder="••••••••" value={pinInput} onChange={e => setPinInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && verifyPin()} className="w-full bg-[#161b22] border border-[#30363d] rounded-lg p-3 text-center text-lg text-white font-mono tracking-[0.5em] focus:border-blue-500 outline-none mb-6 shadow-inner" />
               <div className="flex gap-3">
                  <button onClick={() => setShowPinModal(false)} className="flex-1 py-3 rounded-lg border border-[#30363d] text-slate-300 text-sm font-bold hover:bg-[#161b22] transition-all duration-150 active:scale-95">Batal</button>
                  <button onClick={verifyPin} className="flex-1 py-3 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-500 transition-all duration-150 shadow-md active:scale-95">Masuk</button>
               </div>
            </div>
          </div>
        )}

        {showBulkModal && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0f0f11] border border-[#30363d] rounded-xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-4 border-b border-[#30363d] pb-3">
                    <h3 className="text-white font-bold uppercase tracking-widest text-sm flex items-center gap-2"><Check size={16} className="text-blue-400"/> Aksi Cepat (Tandai Semua)</h3>
                    <button onClick={() => setShowBulkModal(false)} className="text-slate-500 hover:text-rose-400 transition-colors"><X size={20}/></button>
                </div>
                <div className="mb-6">
                    <p className="text-xs text-slate-300 mb-4 leading-relaxed">Terapkan status kehadiran untuk <span className="font-bold text-emerald-400">semua hari (Senin-Jumat)</span> ke seluruh siswa ({filteredStudentsForBulk.length} orang) pada {OJT_WEEKS.find(w=>w.id===selectedOjtWeek)?.label}.</p>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Pilih Status</label>
                    <div className="grid grid-cols-2 gap-2">
                        {['Hadir', 'Sakit', 'Izin', 'Alpa'].map(status => (
                            <button key={status} onClick={() => setBulkStatus(status)} className={`py-2.5 rounded-lg border font-bold text-xs transition-all ${bulkStatus === status ? 'bg-blue-600 border-blue-500 text-white shadow-md' : 'bg-[#161b22] border-[#30363d] text-slate-400 hover:border-slate-500'}`}>
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setShowBulkModal(false)} className="flex-1 py-2.5 rounded-lg border border-[#30363d] text-slate-300 text-xs font-bold hover:bg-[#161b22] transition-all duration-150 active:scale-95">Batal</button>
                    <button onClick={handleBulkSave} disabled={isSubmitting} className="flex-1 py-2.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-all duration-150 shadow-md active:scale-95 disabled:opacity-50">Terapkan</button>
                </div>
            </div>
          </div>
        )}

        {editOjtModal && (
            <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-[#0f0f11] border border-[#30363d] rounded-xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-5 border-b border-[#30363d] pb-3">
                        <h3 className="text-white font-bold uppercase tracking-widest text-sm flex items-center gap-2"><Edit size={16} className="text-blue-400"/> Rolling Jadwal & Catatan</h3>
                        <button onClick={() => setEditOjtModal(null)} className="text-slate-500 hover:text-rose-400 transition-colors"><X size={20}/></button>
                    </div>
                    
                    <div className="bg-blue-900/20 border border-blue-500/30 p-3 rounded-lg mb-5">
                        <p className="text-xs text-blue-200">Siswa: <span className="font-bold text-white text-sm">{editOjtModal.name}</span></p>
                        <p className="text-xs text-blue-300 mt-1">Kelas: <span className="font-semibold text-white">{editOjtModal.class}</span></p>
                    </div>

                    <div className="mb-5">
                        <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Jadwal Minggu (Rolling Siswa)</label>
                        <p className="text-[10px] text-slate-500 mb-2 leading-relaxed">Ubah opsi ini jika Anda ingin memindahkan siswa ini (atau menukar tempatnya) ke minggu yang berbeda.</p>
                        <select value={editOjtModal.weekId} onChange={e => setEditOjtModal({...editOjtModal, weekId: parseInt(e.target.value)})} className="w-full bg-[#161b22] border border-[#30363d] text-white text-sm font-semibold rounded-lg focus:border-blue-500 outline-none p-3 shadow-inner">
                            {OJT_WEEKS.map(w => <option key={w.id} value={w.id}>{w.label} ({w.dateRange})</option>)}
                        </select>
                    </div>

                    <div className="mb-6">
                        <label className="block text-[10px] text-amber-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5"><MessageSquare size={12}/> Catatan Khusus Laporan (Opsional)</label>
                        <textarea rows="3" className="w-full bg-[#161b22] border border-[#30363d] rounded-lg p-3 text-sm text-white focus:border-amber-500 outline-none shadow-inner custom-scrollbar" placeholder="Misal: Surat dokter menyusul / Tukar jadwal dengan Budi..." value={editOjtModal.notes || ''} onChange={e => setEditOjtModal({...editOjtModal, notes: e.target.value})}></textarea>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-[#30363d]">
                        <button onClick={() => setEditOjtModal(null)} className="px-5 py-2.5 rounded-lg border border-[#30363d] text-slate-300 text-xs font-bold hover:bg-[#161b22] transition-all duration-150 active:scale-95">Batal</button>
                        <button onClick={() => {
                            handleSaveStudentEdit(editOjtModal.id, editOjtModal.notes, editOjtModal.weekId);
                            setEditOjtModal(null);
                        }} className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all duration-150 shadow-md shadow-blue-900/20 active:scale-95 flex items-center gap-2"><Check size={14}/> Simpan Data</button>
                    </div>
                </div>
            </div>
        )}

        {editModal && (
           <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 print:hidden">
              <div className="bg-[#0f0f11] border border-[#30363d] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl animate-in zoom-in-95 duration-200">
                 <h3 className="text-white font-bold mb-5 uppercase tracking-widest text-sm flex items-center gap-2 border-b border-[#30363d] pb-3"><Edit size={16} className="text-blue-400"/> Edit Data Inbound Lengkap</h3>
                 
                 <div className="mb-4 bg-[#161b22] p-3 rounded-lg border border-[#30363d]">
                   <label className="block text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Hexagon size={12}/> TANGGAL RECORD INBOUND</label>
                   <input type="date" className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-2.5 text-xs text-blue-400 font-bold focus:border-blue-500 outline-none" value={editModal.date ? editModal.date.split('T')[0] : getTodayDateString()} onChange={e => setEditModal({...editModal, date: new Date(e.target.value + 'T12:00:00Z').toISOString()})} />
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Lokasi Gudang</label>
                        <select className="w-full bg-[#161b22] border border-[#30363d] rounded-lg p-2.5 text-xs text-white focus:border-blue-500 outline-none" value={editModal.lokasiAsal} onChange={e => setEditModal({...editModal, lokasiAsal: e.target.value, kategori: '', tipe: ''})}>{LOKASI.map(l => <option key={l} value={l}>{l}</option>)}</select>
                    </div>
                    <div>
                        <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Kategori Unit</label>
                        <select className="w-full bg-[#161b22] border border-[#30363d] rounded-lg p-2.5 text-xs text-white focus:border-blue-500 outline-none" value={editModal.kategori} onChange={e => setEditModal({...editModal, kategori: e.target.value, tipe: '', varian: '', subVarian: ''})}>{editModal.lokasiAsal === 'MVI SMKN 26' ? <option value="Monitor">Monitor</option> : Object.keys(CATALOG).map(k => <option key={k} value={k}>{k}</option>)}</select>
                    </div>
                    {editModal.kategori && CATALOG[editModal.kategori] && Object.keys(CATALOG[editModal.kategori])[0] !== 'variants' && !CATALOG[editModal.kategori].KioskSlim && (
                         <div>
                           <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Tipe Panel</label>
                           <select className="w-full bg-[#161b22] border border-[#30363d] rounded-lg p-2.5 text-xs text-white focus:border-blue-500 outline-none" value={editModal.tipe || ''} onChange={e => setEditModal({...editModal, tipe: e.target.value, varian: '', subVarian: '', rc: ''})}><option value="">-- Pilih --</option>{Object.keys(CATALOG[editModal.kategori]).map(t => <option key={t} value={t}>{t}</option>)}</select>
                         </div>
                    )}
                    {((editModal.kategori === 'Kiosk') || (editModal.tipe && editModal.kategori !== 'LED')) && (
                        <div>
                          <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Varian / Merk</label>
                          <select className="w-full bg-[#161b22] border border-[#30363d] rounded-lg p-2.5 text-xs text-white focus:border-blue-500 outline-none" value={editModal.varian || ''} onChange={e => setEditModal({...editModal, varian: e.target.value, subVarian: ''})}><option value="">-- Pilih --</option>{editModal.kategori === 'Kiosk' ? ['Kiosk Slim', 'Kiosk FAT'].map(v => <option key={v} value={v}>{v}</option>) : (editModal.kategori === 'Monitor' && editModal.tipe === 'VDW' ? Object.keys(CATALOG.Monitor.VDW.subVariants) : CATALOG[editModal.kategori]?.[editModal.tipe]?.variants || CATALOG[editModal.kategori]?.variants || []).map(v => <option key={v} value={v}>{v}</option>)}</select>
                        </div>
                    )}
                    {((editModal.kategori === 'LED' && editModal.tipe) || (editModal.varian && editModal.kategori !== 'Kiosk')) && (
                         <div>
                           <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Spesifikasi / Ukuran</label>
                           <select className="w-full bg-[#161b22] border border-[#30363d] rounded-lg p-2.5 text-xs text-white focus:border-blue-500 outline-none" value={editModal.subVarian || ''} onChange={e => setEditModal({...editModal, subVarian: e.target.value, rc: ''})}><option value="">-- Pilih --</option>{(editModal.kategori === 'Monitor' && editModal.tipe === 'VDW' && editModal.varian ? CATALOG.Monitor.VDW.subVariants[editModal.varian] || [] : CATALOG[editModal.kategori]?.[editModal.tipe]?.subVariants || CATALOG[editModal.kategori]?.subVariants || []).map(v => <option key={v} value={v}>{v}</option>)}</select>
                         </div>
                    )}
                    {editModal.kategori === 'LED' && editModal.subVarian && (
                         <div>
                           <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Receiving Card (Opsional)</label>
                           <select className="w-full bg-[#161b22] border border-[#30363d] rounded-lg p-2.5 text-xs text-white focus:border-blue-500 outline-none" value={editModal.rc || ''} onChange={e => setEditModal({...editModal, rc: e.target.value})}><option value="">-- Pilih --</option>{getAvailableRC(editModal.tipe, editModal.subVarian).map(r => <option key={r} value={r}>{r}</option>)}</select>
                         </div>
                    )}
                    {editModal.kategori === 'LED' && (
                         <div>
                           <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Batch Module</label>
                           <input type="text" className="w-full bg-[#161b22] border border-[#30363d] rounded-lg p-2.5 text-xs text-white focus:border-blue-500 outline-none" value={editModal.batch} onChange={e => setEditModal({...editModal, batch: e.target.value})} />
                         </div>
                    )}
                    <div className={editModal.kategori === 'LED' ? '' : 'sm:col-span-2'}>
                       <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Range SN / Serial Number</label>
                       <input type="text" className="w-full bg-[#161b22] border border-[#30363d] rounded-lg p-2.5 text-xs text-white focus:border-blue-500 outline-none" value={editModal.rangeSN} onChange={e => setEditModal({...editModal, rangeSN: e.target.value})} />
                    </div>
                    <div className="sm:col-span-2">
                       <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Keterangan / Project</label>
                       <input type="text" className="w-full bg-[#161b22] border border-[#30363d] rounded-lg p-2.5 text-xs text-white focus:border-blue-500 outline-none" value={editModal.project} onChange={e => setEditModal({...editModal, project: e.target.value})} />
                    </div>
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
                            const oldItemId = editModal.oldItemId; const oldItem = inventory.find(i => i.id === oldItemId); if (!oldItem) throw new Error("Item lama tidak ditemukan");
                            const newLoc = editModal.lokasiAsal; const newCat = editModal.kategori; const newTipe = editModal.tipe; const newVar = editModal.varian; const newSubVar = editModal.subVarian; const newRc = editModal.rc; const isLED = newCat === 'LED';
                            const newItemId = `${newLoc}-${newCat}-${newTipe || ''}-${newVar || ''}-${newSubVar || ''}-${newRc || ''}`.replace(/\s+/g, '-').toLowerCase(); const newItem = inventory.find(i => i.id === newItemId);
                            let parsedQty = parseInt(editModal.qty); if (!isLED) parsedQty = 1; 
                            const diffQty = parsedQty - editModal.oldQty;
                            const updatedSnEntry = { id: editModal.id, batch: isLED ? (editModal.batch || '-') : '-', rangeSN: editModal.rangeSN || '-', project: editModal.project || '-', qty: parsedQty, date: editModal.date || new Date().toISOString(), user: isAdmin && adminProfile ? adminProfile.name : 'System' };
                            if (oldItemId === newItemId) {
                                if (oldItem.stokMPDN + diffQty < 0) throw new Error("Gagal: Stok WIP akan menjadi negatif! Hapus/Revert alokasi dulu.");
                                const updatedSnList = oldItem.snList.map(sn => sn.id === editModal.id ? updatedSnEntry : sn);
                                await updateDoc(getDbDoc('inventory', oldItemId), { snList: updatedSnList, stokMPDN: oldItem.stokMPDN + diffQty });
                            } else {
                                if (oldItem.stokMPDN - editModal.oldQty < 0) throw new Error("Gagal: Stok asal tidak cukup untuk dipindah, sedang ada alokasi!");
                                const filteredSnList = oldItem.snList.filter(sn => sn.id !== editModal.id);
                                await updateDoc(getDbDoc('inventory', oldItemId), { snList: filteredSnList, stokMPDN: oldItem.stokMPDN - editModal.oldQty });
                                if (newItem) { await updateDoc(getDbDoc('inventory', newItemId), { snList: [...(newItem.snList || []), updatedSnEntry], stokMPDN: newItem.stokMPDN + parsedQty });
                                } else { await setDoc(getDbDoc('inventory', newItemId), { kategori: newCat, tipe: newTipe || '-', varian: newVar || '-', subVarian: newSubVar || '-', rc: newRc || '-', lokasiAsal: newLoc, stokMPDN: parsedQty, stokIVP: 0, stokMLDS: 0, stokNG: 0, alokasi: [], snList: [updatedSnEntry] }); }
                            }
                            await addHistory('EDIT', `Update Spesifikasi/SN Inbound: ${updatedSnEntry.rangeSN} (Qty: ${editModal.oldQty} -> ${parsedQty})`, 0, editModal.date.split('T')[0]);
                            setEditModal(null); showNotif("Data Inbound berhasil diperbarui secara menyeluruh!", "success");
                        } catch (e) { showNotif(e.message || "Gagal mengedit data", "error"); }
                    }} className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all duration-150 shadow-md shadow-blue-900/20 active:scale-95 active:shadow-sm">Simpan Perubahan Lengkap</button>
                 </div>
              </div>
           </div>
        )}
      </main>
    </div>
  );
}

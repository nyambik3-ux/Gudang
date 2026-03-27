"use client";
import { useState, useEffect } from "react";

// URL GAS SAKTI YANG BARU
const GAS_URL = "https://script.google.com/macros/s/AKfycbzUMVlz1g9_hLTtmzB7t_XRCyKYmMkmzmdUzCmAlc03FOb3sjRooxuQA1T6sKyaSD8WCA/exec";

export default function GudangApp() {
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // State Data
  const [stokData, setStokData] = useState([]);
  const [masterBarang, setMasterBarang] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  
  // State Transaksi
  const [selectedBarang, setSelectedBarang] = useState(null);
  const [jumlah, setJumlah] = useState("");

  // Ambil Data Saat Role Dipilih
  useEffect(() => {
    if (role === "admin") fetchMaster();
    if (role === "akuntan") fetchStok();
  }, [role]);

  const fetchMaster = async () => {
    const res = await fetch(`${GAS_URL}?action=readData&sheet=Barang`);
    const data = await res.json();
    setMasterBarang(data);
  };

  const fetchStok = async () => {
    setLoading(true);
    const res = await fetch(`${GAS_URL}?action=readData&sheet=Stok`);
    const data = await res.json();
    setStokData(data);
    setLoading(false);
  };

  // Logic Search Suggestion
  useEffect(() => {
    if (searchQuery.length > 0 && masterBarang.length > 0) {
      const filtered = masterBarang.filter(item => 
        item["Nama Barang"].toLowerCase().includes(searchQuery.toLowerCase()) ||
        item["Kode"].toString().includes(searchQuery)
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions([]);
    }
  }, [searchQuery]);

  const handleTransaksi = async (tipe) => {
    if (!selectedBarang || !jumlah) return alert("Pilih barang & isi jumlah!");
    setLoading(true);
    
    const payload = {
      action: tipe === "MASUK" ? "inputMasuk" : "inputKeluar",
      kode: selectedBarang["Kode"],
      nama: selectedBarang["Nama Barang"],
      jumlah: jumlah,
      user: userId
    };

    try {
      await fetch(GAS_URL, {
        method: "POST",
        body: JSON.stringify(payload)
      });
      alert(`Berhasil Simpan & Kirim Telegram: ${tipe}`);
      setSearchQuery("");
      setSelectedBarang(null);
      setJumlah("");
    } catch (e) { alert("Gagal Simpan!"); }
    setLoading(false);
  };

  if (!role) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
        <div className="bg-slate-800 p-8 rounded-3xl shadow-2xl w-full max-w-md text-center border border-slate-700">
          <h1 className="text-3xl font-black mb-6 text-cyan-400">WAREHOUSE SYSTEM</h1>
          <input type="text" placeholder="ID PEGAWAI" className="w-full text-center text-2xl p-4 bg-slate-900 rounded-xl mb-6 border-2 border-slate-700 outline-none focus:border-cyan-500" value={userId} onChange={(e) => setUserId(e.target.value.replace(/\D/g, ""))} />
          <div className="grid grid-cols-1 gap-3">
            <button onClick={() => setRole("admin")} className="bg-blue-600 p-4 rounded-xl font-bold hover:bg-blue-500 transition-all">👤 ADMIN GUDANG</button>
            <button onClick={() => setRole("akuntan")} className="bg-green-600 p-4 rounded-xl font-bold hover:bg-green-500 transition-all">📊 AKUNTAN (STOK)</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-3xl shadow-lg border border-slate-200">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
          <h2 className="text-xl font-black uppercase tracking-tighter">🚀 {role} DASHBOARD</h2>
          <button onClick={() => { setRole(null); setSelectedBarang(null); }} className="text-red-500 font-bold text-sm">LOGOUT</button>
        </div>

        {/* --- UI ADMIN (SEARCH & INPUT) --- */}
        {role === "admin" && (
          <div className="space-y-6">
            <div className="relative">
              <label className="text-xs font-bold text-slate-400 uppercase ml-2">Cari Barang</label>
              <input 
                type="text" 
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-400 outline-none transition-all" 
                placeholder="Ketik Nama atau Kode..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {filteredSuggestions.length > 0 && (
                <div className="absolute z-50 w-full bg-white mt-2 rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
                  {filteredSuggestions.map((item, idx) => (
                    <div key={idx} onClick={() => { setSelectedBarang(item); setSearchQuery(item["Nama Barang"]); setFilteredSuggestions([]); }} className="p-4 hover:bg-blue-50 cursor-pointer border-b last:border-0 flex justify-between">
                      <span className="font-bold">{item["Nama Barang"]}</span>
                      <span className="text-slate-400 text-xs font-mono">{item["Kode"]}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedBarang && (
              <div className="p-6 bg-blue-50 rounded-3xl border-2 border-blue-100 animate-in fade-in slide-in-from-top-4">
                <p className="text-xs font-bold text-blue-400 mb-1">DATA BARANG DIPILIH:</p>
                <h3 className="text-2xl font-black text-slate-800 uppercase">{selectedBarang["Nama Barang"]}</h3>
                <p className="text-sm text-slate-500 mb-6 font-mono">ID: {selectedBarang["Kode"]} | Satuan: {selectedBarang["Satuan"]}</p>
                
                <div className="flex gap-4">
                  <input type="number" className="w-1/3 p-4 rounded-xl border-none text-2xl font-black text-center shadow-inner" placeholder="Qty" value={jumlah} onChange={(e) => setJumlah(e.target.value)} />
                  <button onClick={() => handleTransaksi("MASUK")} disabled={loading} className="flex-1 bg-blue-600 text-white rounded-xl font-black shadow-lg shadow-blue-200 active:scale-95 transition-all">{loading ? "..." : "📥 MASUK"}</button>
                  <button onClick={() => handleTransaksi("KELUAR")} disabled={loading} className="flex-1 bg-red-500 text-white rounded-xl font-black shadow-lg shadow-red-200 active:scale-95 transition-all">{loading ? "..." : "📤 KELUAR"}</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- UI AKUNTAN (TABLE STOK) --- */}
        {role === "akuntan" && (
          <div className="overflow-x-auto">
            <button onClick={fetchStok} className="mb-4 text-xs bg-slate-100 px-3 py-1 rounded-full font-bold text-slate-5

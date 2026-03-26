"use client";
import { useState, useEffect } from "react";

const GAS_URL = "https://script.google.com/macros/s/AKfycbxs7YINMbJBcCiLp7Iwl3HbfQMZX26wfEARMGfSZDVchWKspzkRavioJn5rXKeslLJK/exec";

export default function GudangApp() {
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);

  // State Master Data (Buat Sugest)
  const [masterBarang, setMasterBarang] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);

  // State Admin & Transaksi
  const [kodeBarang, setKodeBarang] = useState("");
  const [formData, setFormData] = useState({ nama: "", satuan: "", minStok: "", isBaru: false });
  const [statusCheck, setStatusCheck] = useState("");
  const [jumlahAksi, setJumlahAksi] = useState("");

  // Ambil data master barang pas login jadi Admin
  useEffect(() => {
    if (role === "admin" || role === "akuntan") {
      fetchMasterBarang();
    }
  }, [role]);

  const fetchMasterBarang = async () => {
    try {
      const res = await fetch(`${GAS_URL}?action=readData&sheet=Barang`);
      const data = await res.json();
      setMasterBarang(data);
    } catch (e) { console.error("Gagal ambil master data"); }
  };

  // Logic Search Suggestion
  useEffect(() => {
    if (searchQuery.length > 1) {
      const filtered = masterBarang.filter(item => 
        item["Nama Barang"].toLowerCase().includes(searchQuery.toLowerCase()) ||
        item["Kode"].toString().includes(searchQuery)
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions([]);
    }
  }, [searchQuery, masterBarang]);

  const pilihBarang = (item) => {
    setKodeBarang(item["Kode"]);
    setSearchQuery(item["Nama Barang"]);
    setFormData({ 
      nama: item["Nama Barang"], 
      satuan: item["Satuan"], 
      minStok: item["Minimum Stok"], 
      isBaru: false 
    });
    setStatusCheck("found");
    setFilteredSuggestions([]);
  };

  const handleLogin = (selectedRole) => {
    if (!/^\d+$/.test(userId)) return alert("ID Pegawai wajib ANGKA!");
    setRole(selectedRole);
  };

  // --- UI Login & Header (Sama kayak sebelumnya) ---
  if (!role) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
        <div className="bg-slate-800 p-8 rounded-3xl shadow-2xl w-full max-w-md text-center border border-slate-700">
          <h1 className="text-4xl font-black mb-2 text-cyan-400">Vercel Gudang</h1>
          <input type="text" placeholder="ID Pegawai" className="w-full text-center text-3xl p-4 bg-slate-900 rounded-2xl mb-8 border-2 border-slate-700 outline-none focus:border-cyan-500" value={userId} onChange={(e) => setUserId(e.target.value.replace(/\D/g, ""))} />
          <div className="grid grid-cols-1 gap-3">
            <button onClick={() => handleLogin("admin")} className="bg-blue-600 p-4 rounded-xl font-bold">👤 Admin</button>
            <button onClick={() => handleLogin("akuntan")} className="bg-green-600 p-4 rounded-xl font-bold">📊 Akuntan</button>
            <button onClick={() => handleLogin("staff")} className="bg-orange-600 p-4 rounded-xl font-bold">🛠️ Staff</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-900 font-sans">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h2 className="text-2xl font-black capitalize">🚀 Dashboard {role}</h2>
          <button onClick={() => setRole(null)} className="text-slate-400 font-bold hover:text-red-500">Logout</button>
        </div>

        {/* --- UI ADMIN DENGAN SEARCH SUGGEST --- */}
        {role === "admin" && (
          <div className="space-y-6">
            <div className="relative">
              <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-widest">Cari Nama Barang / Kode</label>
              <input 
                type="text" 
                className="w-full p-4 border-2 border-slate-200 rounded-2xl text-lg focus:border-blue-500 outline-none transition-all shadow-sm" 
                placeholder="Ketik 'kacang' atau '101'..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              
              {/* Box Suggestion */}
              {filteredSuggestions.length > 0 && (
                <div className="absolute z-50 w-full bg-white mt-2 rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-60 overflow-y-auto">
                  {filteredSuggestions.map((item, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => pilihBarang(item)}
                      className="p-4 hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-0 flex justify-between items-center"
                    >
                      <div>
                        <span className="font-bold text-slate-800">{item["Nama Barang"]}</span>
                        <p className="text-xs text-slate-400">Kode: {item["Kode"]}</p>
                      </div>
                      <span className="text-xs bg-slate-100 px-2 py-1 rounded-md text-slate-500 font-mono">{item["Satuan"]}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form Eksekusi (Hanya muncul kalau barang sudah dipilih) */}
            {statusCheck === "found" && (
              <div className="p-8 rounded-[2rem] bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100 animate-in fade-in zoom-in duration-300">
                <div className="mb-6">
                  <p className="text-blue-600 font-bold text-sm uppercase mb-1">Konfirmasi Barang:</p>
                  <h3 className="text-3xl font-black text-slate-800 uppercase italic tracking-tight">{formData.nama}</h3>
                  <p className="text-slate-500">Kode: <span className="font-mono font-bold">{kodeBarang}</span> | Satuan: {formData.satuan}</p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-2xl shadow-inner">
                  <div className="flex flex-col w-full md:w-32">
                    <span className="text-[10px] font-bold text-slate-400 ml-2 mb-1 uppercase">Jumlah</span>
                    <input type="number" className="w-full p-2 text-2xl font-black text-center border-none outline-none focus:ring-0" value={jumlahAksi} onChange={(e) => setJumlahAksi(e.target.value)} placeholder="0" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <button onClick={() => alert("Masuk")} className="bg-blue-600 text-white py-4 rounded-xl font-black hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95">📥 MASUK</button>
                    <button onClick={() => alert("Keluar")} className="bg-red-500 text-white py-4 rounded-xl font-black hover:bg-red-600 shadow-lg shadow-red-200 transition-all active:scale-95">📤 KELUAR</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Akuntan & Staff (Bisa pake logic lama lo) */}
        {role === "akuntan" && <p className="text-center p-10 text-slate-400">Silakan buka tabel stok di sheet Akuntan.</p>}
        {role === "staff" && <p className="text-center p-10 text-slate-400">Silakan gunakan form request darurat.</p>}

      </div>
    </div>
  );
}

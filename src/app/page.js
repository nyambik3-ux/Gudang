"use client";
import { useState, useEffect } from "react";

// ⚠️ WAJIB: Ganti dengan URL Web App GAS lo!
const GAS_URL = "https://script.google.com/macros/s/AKfycbxs7YINMbJBcCiLp7Iwl3HbfQMZX26wfEARMGfSZDVchWKspzkRavioJn5rXKeslLJK/exec";

// --- Komponen Loading Spinner ---
const Spinner = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default function GudangApp() {
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState(null); 
  const [loading, setLoading] = useState(false);

  // State Admin
  const [kodeBarang, setKodeBarang] = useState("");
  const [formData, setFormData] = useState({ nama: "", satuan: "", minStok: "", isBaru: false });
  const [statusCheck, setStatusCheck] = useState(""); 
  const [jumlahAksi, setJumlahAksi] = useState("");

  // State Akuntan
  const [dataStok, setDataStok] = useState([]);

  // State Staff
  const [formReq, setFormReq] = useState({ detail: "", jumlah: "", alasan: "" });

  // === FUNGSI LOGIN ===
  const handleLogin = (selectedRole) => {
    if (!/^\d+$/.test(userId)) return alert("⚠️ ID Pegawai wajib berupa ANGKA!");
    setRole(selectedRole);
    if (selectedRole === "akuntan") fetchDataStok();
  };

  // === FUNGSI ADMIN ===
  const checkKode = async () => {
    if (!kodeBarang) return alert("Masukkkan kode barang!");
    setLoading(true);
    try {
      const res = await fetch(`${GAS_URL}?action=checkBarang&kode=${kodeBarang}`);
      const result = await res.json();
      if (result.status === "found") {
        setStatusCheck("found");
        setFormData({ nama: result.data["Nama Barang"], satuan: result.data["Satuan"], minStok: result.data["Minimum Stok"], isBaru: false });
      } else {
        setStatusCheck("not_found");
        setFormData({ nama: "", satuan: "", minStok: "", isBaru: true });
        alert("Barang Belum Terdaftar! Silakan lengkapi detail.");
      }
    } catch (e) { alert("Gagal koneksi ke database!"); }
    setLoading(false);
  };

  const submitTransaksi = async (jenisTransaksi) => {
    if (!jumlahAksi || jumlahAksi <= 0) return alert("Jumlah wajib diisi & positif!");
    setLoading(true);
    try {
      await fetch(GAS_URL, {
        method: "POST",
        body: JSON.stringify({ action: jenisTransaksi, kode: kodeBarang, jumlah: jumlahAksi, user: userId, isBaru: formData.isBaru, nama: formData.nama, satuan: formData.satuan, minStok: formData.minStok })
      });
      alert(`✅ Berhasil input barang ${jenisTransaksi === 'inputMasuk' ? 'Masuk' : 'Keluar'}!`);
      // Reset Form
      setKodeBarang(""); setStatusCheck(""); setJumlahAksi("");
    } catch (e) { alert("Gagal simpan transaksi!"); }
    setLoading(false);
  };

  // === FUNGSI AKUNTAN ===
  const fetchDataStok = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${GAS_URL}?action=readData&sheet=Stok`);
      const result = await res.json();
      setDataStok(result);
    } catch (e) { alert("Gagal ambil data stok!"); }
    setLoading(false);
  };

  // === FUNGSI STAFF ===
  const submitRequest = async () => {
    if (!formReq.detail || !formReq.jumlah || !formReq.alasan) return alert("Lengkapi form request!");
    setLoading(true);
    try {
      await fetch(GAS_URL, {
        method: "POST",
        body: JSON.stringify({ action: "requestStaff", user: userId, detail: formReq.detail, jumlah: formReq.jumlah, alasan: formReq.alasan })
      });
      alert("✅ Request terkirim ke Telegram Bos! Mohon tunggu approval.");
      setFormReq({ detail: "", jumlah: "", alasan: "" });
    } catch (e) { alert("Gagal kirim request!"); }
    setLoading(false);
  };

  // === FUNGSI LOGOUT ===
  const handleLogout = () => {
    setRole(null);
    setUserId("");
    setKodeBarang("");
    setStatusCheck("");
  };

  // ================= RENDER UI =================

  // 1. TAMPILAN LOGIN (GLASS MORPHISM)
  if (!role) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-white flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 -left-40 w-80 h-80 bg-purple-700 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

        <div className="bg-white/5 backdrop-blur-2xl p-10 rounded-[2rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] w-full max-w-lg text-center border border-white/10 relative z-10 transform transition-all hover:scale-[1.01]">
          <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 mb-2 tracking-tighter">
            Vercel Gudang
          </h1>
          <p className="text-slate-400 mb-10 text-lg">Input ID Pegawai & Pilih Role Anda</p>
          
          <input 
            type="text" 
            pattern="\d*" 
            maxLength="6"
            placeholder="12345" 
            className="w-full text-center text-5xl font-mono tracking-widest p-6 border-2 border-white/10 bg-black/30 rounded-2xl mb-10 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-slate-700" 
            value={userId} 
            onChange={(e) => setUserId(e.target.value.replace(/\D/g, ""))} 
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button onClick={() => handleLogin("admin")} className="group bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 rounded-2xl font-bold text-lg hover:shadow-[0_0_20px_0_rgba(59,130,246,0.5)] transition-all hover:-translate-y-1">
              <span className="block text-3xl mb-1 group-hover:animate-bounce">👤</span> Admin
            </button>
            <button onClick={() => handleLogin("akuntan")} className="group bg-gradient-to-br from-green-600 to-green-700 text-white p-6 rounded-2xl font-bold text-lg hover:shadow-[0_0_20px_0_rgba(34,197,94,0.5)] transition-all hover:-translate-y-1 hover:animation-delay-200">
              <span className="block text-3xl mb-1 group-hover:animate-pulse">📊</span> Akuntan
            </button>
            <button onClick={() => handleLogin("staff")} className="group bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-2xl font-bold text-lg hover:shadow-[0_0_20px_0_rgba(249,115,22,0.5)] transition-all hover:-translate-y-1 hover:animation-delay-400">
              <span className="block text-3xl mb-1 group-hover:animate-wiggle">🛠️</span> Staff
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. TAMPILAN DASHBOARD (DASHBOARD FEEL)
  return (
    <div className="min-h-screen bg-[#f0f4f8] text-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl text-white text-2xl shadow-inner ${role === 'admin' ? 'bg-blue-600' : role === 'akuntan' ? 'bg-green-600' : 'bg-orange-500'}`}>
              {role === 'admin' ? '👤' : role === 'akuntan' ? '📊' : '🛠️'}
            </div>
            <div>
              <h2 className="text-3xl font-extrabold capitalize tracking-tight">
                Dashboard <span className={role === 'admin' ? 'text-blue-600' : role === 'akuntan' ? 'text-green-600' : 'text-orange-600'}>{role}</span>
              </div>
              <p className="text-slate-500">Selamat bekerja, ID: <span className="font-mono font-bold text-slate-700">{userId}</span></p>
            </div>
          </div>
          <button onClick={handleLogout} className="bg-slate-100 text-slate-700 font-semibold px-6 py-3 rounded-full hover:bg-red-50 hover:text-red-600 transition group flex items-center gap-2">
            Logout <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>

        {/* --- UI ADMIN --- */}
        {role === "admin" && (
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <label className="block text-lg font-semibold text-slate-700 mb-3">Scan / Ketik Kode Barang (Angka)</label>
              <div className="flex flex-col md:flex-row gap-3">
                <input 
                  type="text" 
                  className="flex-1 p-4 border-2 border-slate-200 rounded-2xl text-lg font-mono tracking-wider focus:border-blue-500 focus:ring-blue-500 focus:ring-2 outline-none transition" 
                  placeholder="Contoh: 1001" 
                  value={kodeBarang} 
                  onChange={(e) => setKodeBarang(e.target.value.replace(/\D/g, ""))} 
                />
                <button onClick={checkKode} disabled={loading} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition flex items-center justify-center min-w-[150px]">
                  {loading ? <><Spinner /> Mencari...</> : "🔍 Check Kode"}
                </button>
              </div>
            </div>

            {statusCheck && (
              <div className={`p-8 rounded-3xl shadow-lg border-l-8 ${statusCheck === "found" ? "bg-green-50 border-green-400" : "bg-amber-50 border-amber-400"} animate-fadeIn`}>
                {statusCheck === "not_found" && (
                  <div className="space-y-4 mb-6">
                    <p className="font-bold text-2xl text-amber-800">✨ Registrasi Barang Baru</p>
                    <p className="text-amber-700">Kode ini belum terdaftar. Tolong lengkapi datanya dulu, bro.</p>
                    <input type="text" placeholder="Nama Barang (Cth: Semen Tiga Roda)" className="w-full p-4 border rounded-xl bg-white focus:ring-amber-500 focus:ring-2 outline-none" onChange={(e)=>setFormData({...formData, nama: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="Satuan (Cth: Sak/Pcs)" className="w-full p-4 border rounded-xl bg-white focus:ring-amber-500 focus:ring-2 outline-none" onChange={(e)=>setFormData({...formData, satuan: e.target.value})} />
                      <input type="number" placeholder="Stok Minimum" className="w-full p-4 border rounded-xl bg-white focus:ring-amber-500 focus:ring-2 outline-none" onChange={(e)=>setFormData({...formData, minStok: e.target.value})} />
                    </div>
                  </div>
                )}
                {statusCheck === "found" && (
                    <div className="mb-6">
                        <p className="text-sm text-green-700 font-semibold uppercase tracking-wider">📦 Barang Ditemukan</p>
                        <p className="font-extrabold text-4xl text-green-900 tracking-tight">{formData.nama}</p>
                        <p className="text-lg text-green-800">Satuan: <span className="font-bold">{formData.satuan}</span> | Min. Stok: <span className="font-bold">{formData.minStok}</span></p>
                    </div>
                )}

                {/* Eksekusi Transaksi */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
                  <input type="number" placeholder="Jumlah..." className="w-full md:w-40 p-4 border-2 rounded-xl text-center text-2xl font-bold focus:border-cyan-500 focus:ring-cyan-500 focus:ring-2 outline-none" value={jumlahAksi} onChange={(e)=>setJumlahAksi(e.target.value)} />
                  <div className="grid grid-cols-2 gap-3 w-full flex-1">
                    <button onClick={() => submitTransaksi("inputMasuk")} disabled={loading} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition flex items-center justify-center gap-2">
                        {loading ? <Spinner /> : "📥 Barang MASUK"}
                    </button>
                    {statusCheck === "found" && (
                      <button onClick={() => submitTransaksi("inputKeluar")} disabled={loading} className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-xl font-bold text-lg hover:from-red-600 hover:to-red-700 transition flex items-center justify-center gap-2">
                          {loading ? <Spinner /> : "📤 Barang KELUAR"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- UI AKUNTAN --- */}
        {role === "akuntan" && (
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">📊 Laporan Stok Real-time</h3>
                <button onClick={fetchDataStok} disabled={loading} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition text-sm flex items-center gap-1">
                    {loading ? <Spinner /> : "🔄 Refresh"}
                </button>
            </div>
            
            <div className="overflow-x-auto">
              {loading ? <p className="text-center text-slate-500 p-10">Memuat data...</p> : (
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500 text-sm">
                      <th className="p-4 pl-0">KODE</th>
                      <th className="p-4">NAMA BARANG</th>
                      <th className="p-4 text-right">STOK SEKARANG</th>
                      <th className="p-4 text-center">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataStok.map((item, idx) => {
                      const stokSekarang = parseInt(item["Stok Sekarang"]);
                      const minStok = parseInt(item["Minimum Stok"]);
                      const isLow = stokSekarang <= minStok;
                      return (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 group">
                          <td className="p-4 pl-0 font-mono text-slate-500">{item["Kode"]}</td>
                          <td className="p-4 font-semibold text-slate-800">{item["Nama Barang"]}</td>
                          <td className={`p-4 text-right font-extrabold text-xl ${isLow ? 'text-red-600' : 'text-slate-900'}`}>
                              {stokSekarang} <span className="text-sm font-normal text-slate-500">{item["Satuan"]}</span>
                          </td>
                          <td className="p-4 text-center">
                            {isLow ? (
                                <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-800 py-1.5 px-3 rounded-full text-xs font-bold animate-pulse">
                                  <span className="w-2 h-2 bg-red-600 rounded-full"></span> ⚠️ RE-STOCK
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-800 py-1.5 px-3 rounded-full text-xs font-bold">
                                  <span className="w-2 h-2 bg-green-600 rounded-full"></span> AMAN
                                </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* --- UI STAFF --- */}
        {role === "staff" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-8 rounded-3xl text-white shadow-xl shadow-orange-500/20 border border-orange-400">
                <h3 className="text-3xl font-extrabold mb-2 tracking-tight">🚨 Request Barang Darurat</h3>
                <p className="opacity-90 mb-6 text-lg">Gunakan form ini jika barang tidak ada di sistem / butuh cepat. Permintaan langsung dikirim ke Telegram Bos.</p>
                <div className="space-y-4">
                    <input type="text" placeholder="Apa nama barangnya? (Cth: Kopi Kapal Api)" className="w-full p-4 border rounded-xl bg-white text-slate-900 focus:ring-cyan-400 focus:ring-4 outline-none placeholder:text-slate-400" value={formReq.detail} onChange={(e)=>setFormReq({...formReq, detail: e.target.value})} />
                    <input type="number" placeholder="Butuh berapa banyak? (Cth: 10)" className="w-full p-4 border rounded-xl bg-white text-slate-900 focus:ring-cyan-400 focus:ring-4 outline-none placeholder:text-slate-400" value={formReq.jumlah} onChange={(e)=>setFormReq({...formReq, jumlah: e.target.value})} />
                    <textarea placeholder="Kenapa butuh cepat, bro?" className="w-full p-4 border rounded-xl bg-white text-slate-900 focus:ring-cyan-400 focus:ring-4 outline-none placeholder:text-slate-400" rows="3" value={formReq.alasan} onChange={(e)=>setFormReq({...formReq, alasan: e.target.value})}></textarea>
                    <button onClick={submitRequest} disabled={loading} className="w-full bg-slate-950 text-white font-bold py-5 rounded-xl text-lg hover:bg-black transition flex items-center justify-center gap-2">
                        {loading ? <><Spinner /> Mengirim...</> : "🚀 Kirim Request ke Telegram Bos"}
                    </button>
                </div>
            </div>
          </div>
        )}

      </div>
      
      {/* Tailwind CSS Animations (Custom) */}
      <style jsx global>{`
        @keyframes blob { 0% { translate: 0 0; scale: 1; } 33% { translate: 30px -50px; scale: 1.1; } 66% { translate: -20px 20px; scale: 0.9; } 100% { translate: 0 0; scale: 1; } }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        @keyframes wiggle { 0%, 100% { rotate: -3deg; } 50% { rotate: 3deg; } }
        .group-hover\:animate-wiggle { group-hover: animation: wiggle 0.3s ease-in-out infinite; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
}

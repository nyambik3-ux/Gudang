"use client";
import { useState } from "react";

// ⚠️ WAJIB: Ganti dengan URL Web App GAS lo!
const GAS_URL = "https://script.google.com/macros/s/AKfycbxs7YINMbJBcCiLp7Iwl3HbfQMZX26wfEARMGfSZDVchWKspzkRavioJn5rXKeslLJK/exec";

// --- Komponen Loading Spinner ---
const Spinner = () => (
  <svg className="animate-spin h-5 w-5 text-white inline-block mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default function GudangApp() {
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState(null); 
  const [loading, setLoading] = useState(false);

  const [kodeBarang, setKodeBarang] = useState("");
  const [formData, setFormData] = useState({ nama: "", satuan: "", minStok: "", isBaru: false });
  const [statusCheck, setStatusCheck] = useState(""); 
  const [jumlahAksi, setJumlahAksi] = useState("");
  const [dataStok, setDataStok] = useState([]);
  const [formReq, setFormReq] = useState({ detail: "", jumlah: "", alasan: "" });

  const handleLogin = (selectedRole) => {
    if (!/^\d+$/.test(userId)) return alert("⚠️ ID Pegawai wajib berupa ANGKA!");
    setRole(selectedRole);
    if (selectedRole === "akuntan") fetchDataStok();
  };

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
        alert("Barang Belum Terdaftar!");
      }
    } catch (e) { alert("Gagal koneksi ke database!"); }
    setLoading(false);
  };

  const submitTransaksi = async (jenisTransaksi) => {
    if (!jumlahAksi || jumlahAksi <= 0) return alert("Jumlah wajib diisi!");
    setLoading(true);
    try {
      await fetch(GAS_URL, {
        method: "POST",
        body: JSON.stringify({ action: jenisTransaksi, kode: kodeBarang, jumlah: jumlahAksi, user: userId, isBaru: formData.isBaru, nama: formData.nama, satuan: formData.satuan, minStok: formData.minStok })
      });
      alert(`✅ Berhasil!`);
      setKodeBarang(""); setStatusCheck(""); setJumlahAksi("");
    } catch (e) { alert("Gagal simpan!"); }
    setLoading(false);
  };

  const fetchDataStok = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${GAS_URL}?action=readData&sheet=Stok`);
      const result = await res.json();
      setDataStok(result);
    } catch (e) { alert("Gagal ambil data!"); }
    setLoading(false);
  };

  const submitRequest = async () => {
    if (!formReq.detail || !formReq.jumlah || !formReq.alasan) return alert("Lengkapi form!");
    setLoading(true);
    try {
      await fetch(GAS_URL, {
        method: "POST",
        body: JSON.stringify({ action: "requestStaff", user: userId, detail: formReq.detail, jumlah: formReq.jumlah, alasan: formReq.alasan })
      });
      alert("✅ Terkirim ke Telegram!");
      setFormReq({ detail: "", jumlah: "", alasan: "" });
    } catch (e) { alert("Gagal!"); }
    setLoading(false);
  };

  if (!role) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
        <div className="bg-slate-800 p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-700 text-center">
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">Vercel Gudang</h1>
          <p className="text-slate-400 mb-8">Pilih akses sesuai jabatan</p>
          <input type="text" placeholder="ID Pegawai" className="w-full text-center text-3xl p-4 border-2 border-slate-700 bg-slate-900 rounded-2xl mb-8 focus:border-cyan-500 outline-none transition-all" value={userId} onChange={(e) => setUserId(e.target.value.replace(/\D/g, ""))} />
          <div className="grid grid-cols-1 gap-3">
            <button onClick={() => handleLogin("admin")} className="bg-blue-600 p-4 rounded-xl font-bold hover:bg-blue-700 transition">👤 Login Admin</button>
            <button onClick={() => handleLogin("akuntan")} className="bg-green-600 p-4 rounded-xl font-bold hover:bg-green-700 transition">📊 Login Akuntan</button>
            <button onClick={() => handleLogin("staff")} className="bg-orange-600 p-4 rounded-xl font-bold hover:bg-orange-700 transition">🛠️ Login Staff</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-900">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <div>
            <h2 className="text-2xl font-black capitalize text-slate-800">🚀 Dashboard {role}</h2>
            <p className="text-sm text-slate-500 font-mono tracking-tight">User ID: {userId}</p>
          </div>
          <button onClick={() => setRole(null)} className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg font-bold hover:bg-red-50 hover:text-red-600 transition">Logout</button>
        </div>

        {role === "admin" && (
          <div className="space-y-6">
            <div className="flex gap-2">
              <input type="text" className="flex-1 p-4 border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none" placeholder="ID Barang..." value={kodeBarang} onChange={(e) => setKodeBarang(e.target.value.replace(/\D/g, ""))} />
              <button onClick={checkKode} disabled={loading} className="bg-slate-900 text-white px-6 rounded-xl font-bold">
                {loading ? "..." : "Check"}
              </button>
            </div>
            {statusCheck && (
              <div className={`p-6 rounded-2xl border-2 ${statusCheck === 'found' ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                {statusCheck === "not_found" && (
                  <div className="space-y-3 mb-4">
                    <p className="font-bold text-amber-800">✨ Barang Baru</p>
                    <input type="text" placeholder="Nama Barang" className="w-full p-2 border rounded bg-white" onChange={(e)=>setFormData({...formData, nama: e.target.value})} />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="Satuan" className="w-full p-2 border rounded bg-white" onChange={(e)=>setFormData({...formData, satuan: e.target.value})} />
                      <input type="number" placeholder="Min Stok" className="w-full p-2 border rounded bg-white" onChange={(e)=>setFormData({...formData, minStok: e.target.value})} />
                    </div>
                  </div>
                )}
                {statusCheck === "found" && <p className="font-extrabold text-2xl text-green-800 mb-4">📦 {formData.nama}</p>}
                <div className="flex gap-2">
                  <input type="number" placeholder="Qty" className="w-24 p-2 border rounded-xl font-bold" value={jumlahAksi} onChange={(e)=>setJumlahAksi(e.target.value)} />
                  <button onClick={() => submitTransaksi("inputMasuk")} disabled={loading} className="flex-1 bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700">📥 Masuk</button>
                  {statusCheck === "found" && <button onClick={() => submitTransaksi("inputKeluar")} disabled={loading} className="flex-1 bg-red-600 text-white p-3 rounded-xl font-bold hover:bg-red-700">📤 Keluar</button>}
                </div>
              </div>
            )}
          </div>
        )}

        {role === "akuntan" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider"><th className="p-4">Kode</th><th className="p-4">Nama</th><th className="p-4">Stok</th><th className="p-4">Status</th></tr></thead>
              <tbody>
                {dataStok.map((item, idx) => {
                  const isLow = parseInt(item["Stok Sekarang"]) <= parseInt(item["Minimum Stok"]);
                  return (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="p-4 font-mono text-slate-400">{item["Kode"]}</td><td className="p-4 font-bold">{item["Nama Barang"]}</td>
                      <td className={`p-4 font-black ${isLow ? 'text-red-600' : 'text-slate-900'}`}>{item["Stok Sekarang"]}</td>
                      <td className="p-4">{isLow ? <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-bold">RESTOCK</span> : <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">AMAN</span>}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {role === "staff" && (
          <div className="bg-orange-50 p-6 rounded-2xl border border-orange-200">
            <h3 className="font-bold text-orange-800 mb-4 text-xl">🚨 Request Darurat</h3>
            <div className="space-y-3">
              <input type="text" placeholder="Nama Barang..." className="w-full p-3 border rounded-xl" value={formReq.detail} onChange={(e)=>setFormReq({...formReq, detail: e.target.value})} />
              <input type="number" placeholder="Jumlah" className="w-full p-3 border rounded-xl" value={formReq.jumlah} onChange={(e)=>setFormReq({...formReq, jumlah: e.target.value})} />
              <textarea placeholder="Alasan..." className="w-full p-3 border rounded-xl" rows="3" value={formReq.alasan} onChange={(e)=>setFormReq({...formReq, alasan: e.target.value})}></textarea>
              <button onClick={submitRequest} disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-black transition">
                {loading ? <Spinner /> : "🚀 Kirim ke Bos"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

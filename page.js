"use client";
import { useState, useEffect } from "react";

// ⚠️ WAJIB: Ganti dengan URL Web App GAS lo yang paling baru!
const GAS_URL = "https://script.google.com/macros/s/AKfycbxs7YINMbJBcCiLp7Iwl3HbfQMZX26wfEARMGfSZDVchWKspzkRavioJn5rXKeslLJK/exec";

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
    if (!/^\d+$/.test(userId)) return alert("⚠️ Login ID harus ANGKA saja!");
    setRole(selectedRole);
    if (selectedRole === "akuntan") fetchDataStok();
  };

  // === FUNGSI ADMIN ===
  const checkKode = async () => {
    if (!kodeBarang) return alert("Isi kode barang dulu!");
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
        alert("Barang Belum Terdaftar! Silakan isi detail.");
      }
    } catch (e) { alert("Gagal cek database!"); }
    setLoading(false);
  };

  const submitTransaksi = async (jenisTransaksi) => { // 'inputMasuk' atau 'inputKeluar'
    if (!jumlahAksi) return alert("Isi jumlahnya dulu bro!");
    setLoading(true);
    try {
      await fetch(GAS_URL, {
        method: "POST",
        body: JSON.stringify({
          action: jenisTransaksi,
          kode: kodeBarang,
          jumlah: jumlahAksi,
          user: userId,
          isBaru: formData.isBaru,
          nama: formData.nama,
          satuan: formData.satuan,
          minStok: formData.minStok
        })
      });
      alert(`Berhasil input barang ${jenisTransaksi === 'inputMasuk' ? 'Masuk' : 'Keluar'}!`);
      // Reset Form
      setKodeBarang(""); setStatusCheck(""); setJumlahAksi("");
    } catch (e) { alert("Gagal simpan data!"); }
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
        body: JSON.stringify({
          action: "requestStaff",
          user: userId,
          detail: formReq.detail,
          jumlah: formReq.jumlah,
          alasan: formReq.alasan
        })
      });
      alert("✅ Request terkirim ke Telegram Bos! Tunggu di-approve.");
      setFormReq({ detail: "", jumlah: "", alasan: "" });
    } catch (e) { alert("Gagal kirim request!"); }
    setLoading(false);
  };

  // ================= RENDER UI =================

  // 1. TAMPILAN LOGIN
  if (!role) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Gudang System</h1>
          <p className="text-gray-500 mb-6">Masukkan ID (Angka Saja)</p>
          <input type="text" pattern="\d*" placeholder="Contoh: 12345" className="w-full text-center text-2xl p-4 border-2 rounded-xl mb-6 focus:border-blue-500 outline-none" value={userId} onChange={(e) => setUserId(e.target.value.replace(/\D/g, ""))} />
          <div className="grid grid-cols-3 gap-3">
            <button onClick={() => handleLogin("admin")} className="bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">Admin</button>
            <button onClick={() => handleLogin("akuntan")} className="bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700">Akuntan</button>
            <button onClick={() => handleLogin("staff")} className="bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600">Staff</button>
          </div>
        </div>
      </div>
    );
  }

  // 2. TAMPILAN UMUM (Header)
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-2xl font-bold capitalize">⚡ Dashboard {role}</h2>
          <button onClick={() => setRole(null)} className="text-red-500 font-semibold hover:underline">Logout</button>
        </div>

        {/* --- UI ADMIN --- */}
        {role === "admin" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input type="text" className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Ketik Kode Barang..." value={kodeBarang} onChange={(e) => setKodeBarang(e.target.value.replace(/\D/g, ""))} />
              <button onClick={checkKode} disabled={loading} className="bg-slate-800 text-white px-6 rounded-lg">{loading ? "..." : "Check"}</button>
            </div>

            {statusCheck && (
              <div className={`p-4 rounded-lg border ${statusCheck === "found" ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
                {statusCheck === "not_found" && (
                  <div className="space-y-3 mb-4">
                    <p className="font-bold text-amber-800">✨ Barang Baru Terdeteksi</p>
                    <input type="text" placeholder="Nama Barang" className="w-full p-2 border rounded" onChange={(e)=>setFormData({...formData, nama: e.target.value})} />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="Satuan" className="w-full p-2 border rounded" onChange={(e)=>setFormData({...formData, satuan: e.target.value})} />
                      <input type="number" placeholder="Min Stok" className="w-full p-2 border rounded" onChange={(e)=>setFormData({...formData, minStok: e.target.value})} />
                    </div>
                  </div>
                )}
                {statusCheck === "found" && <p className="font-bold text-green-800 mb-4">📦 {formData.nama} ({formData.satuan})</p>}

                {/* Eksekusi Masuk/Keluar */}
                <div className="flex gap-2 items-center">
                  <input type="number" placeholder="Jumlah..." className="w-32 p-2 border rounded" value={jumlahAksi} onChange={(e)=>setJumlahAksi(e.target.value)} />
                  <button onClick={() => submitTransaksi("inputMasuk")} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">📥 Masuk</button>
                  {statusCheck === "found" && (
                    <button onClick={() => submitTransaksi("inputKeluar")} className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600">📤 Keluar</button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- UI AKUNTAN --- */}
        {role === "akuntan" && (
          <div className="overflow-x-auto">
            {loading ? <p className="text-center text-gray-500">Memuat data stok...</p> : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 border-b">Kode</th>
                    <th className="p-3 border-b">Nama Barang</th>
                    <th className="p-3 border-b">Sisa Stok</th>
                    <th className="p-3 border-b">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dataStok.map((item, idx) => {
                    const isLow = parseInt(item["Stok Sekarang"]) <= parseInt(item["Minimum Stok"]);
                    return (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="p-3 border-b">{item["Kode"]}</td>
                        <td className="p-3 border-b">{item["Nama Barang"]}</td>
                        <td className="p-3 border-b font-bold">{item["Stok Sekarang"]} {item["Satuan"]}</td>
                        <td className="p-3 border-b">
                          {isLow ? <span className="bg-red-100 text-red-700 py-1 px-2 rounded text-xs font-bold">⚠️ Restock</span> : <span className="text-green-600 font-bold">Aman</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* --- UI STAFF --- */}
        {role === "staff" && (
          <div className="space-y-4">
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
              <h3 className="font-bold text-orange-800 mb-2">🚨 Form Request Barang Darurat</h3>
              <p className="text-sm text-orange-600 mb-4">Gunakan form ini jika barang tidak ada di sistem dan butuh approval segera.</p>
              
              <div className="space-y-3">
                <input type="text" placeholder="Nama Barang yang diminta..." className="w-full p-3 border rounded-lg" value={formReq.detail} onChange={(e)=>setFormReq({...formReq, detail: e.target.value})} />
                <input type="number" placeholder="Jumlah (Misal: 5)" className="w-full p-3 border rounded-lg" value={formReq.jumlah} onChange={(e)=>setFormReq({...formReq, jumlah: e.target.value})} />
                <textarea placeholder="Alasan butuh cepat..." className="w-full p-3 border rounded-lg" rows="3" value={formReq.alasan} onChange={(e)=>setFormReq({...formReq, alasan: e.target.value})}></textarea>
                
                <button onClick={submitRequest} disabled={loading} className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition">
                  {loading ? "Mengirim..." : "Kirim Request ke Telegram Bos"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

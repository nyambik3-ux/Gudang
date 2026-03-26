export const metadata = {
  title: 'Gudang System',
  description: 'Sistem Manajemen Gudang dengan Telegram',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        {/* BARIS DI BAWAH INI WAJIB ADA BIAR UI CAKEP */}
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-slate-50">{children}</body>
    </html>
  )
}

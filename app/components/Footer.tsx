export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-center py-8 mt-6 text-sm border-t border-slate-800">
      <p className="font-semibold text-white mb-1">TransferMundo</p>
      <p suppressHydrationWarning>© {new Date().getFullYear()} · Choose your airport transfer!</p>
      <nav className="mt-3 flex justify-center gap-4 text-xs">
        <a href="/about" className="hover:text-white transition-colors">About TransferMundo</a>
      </nav>
    </footer>
  )
}

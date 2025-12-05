import { Triangle, Home } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="bg-[#1062eb] text-white min-h-screen flex flex-col antialiased">
      <header className="absolute top-8 left-8 md:top-10 md:left-10 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white rounded flex items-center justify-center shadow-sm">
            <Triangle className="w-5 h-5 text-[#1062eb] fill-current translate-y-[1px]" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col justify-center h-full">
            <span className="text-xs font-semibold tracking-widest leading-none uppercase opacity-90 mb-[2px]">
              Ambition
            </span>
            <span className="text-xs font-semibold tracking-widest leading-none uppercase opacity-90">
              Valley
            </span>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col justify-center items-center w-full px-6 md:px-0">
        <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
          <h1 className="text-8xl font-bold mb-4 text-white/20">404</h1>

          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
            Pagina niet gevonden
          </h2>

          <p className="text-lg text-blue-200/80 mb-8">
            De pagina die je zoekt bestaat niet of is verplaatst.
          </p>

          <Link
            href="/"
            className="
              flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#1062eb] rounded-lg
              font-semibold
              hover:bg-blue-50 transition-colors duration-200
              shadow-lg shadow-black/10
            "
          >
            <Home className="w-5 h-5" strokeWidth={2} />
            Naar de belasting check
          </Link>
        </div>
      </main>
    </div>
  );
}

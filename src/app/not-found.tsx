import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="bg-[#1062eb] text-white min-h-screen flex flex-col antialiased relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-cyan-400/10 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Logo */}
      <header className="absolute top-4 left-4 sm:top-8 sm:left-8 md:top-10 md:left-10 z-10">
        <Image
          src="/av-logo-white.png"
          alt="Ambition Valley"
          width={160}
          height={40}
          className="h-8 md:h-10 w-auto"
          priority
        />
      </header>

      <main className="flex-grow flex flex-col justify-center items-center w-full px-6 md:px-0 relative z-10">
        <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto animate-fade-in-up">
          <h1 className="text-8xl sm:text-9xl font-bold mb-4 text-white/10">404</h1>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 gradient-text">
            Pagina niet gevonden
          </h2>

          <p className="text-lg text-white/60 mb-8 font-light">
            De pagina die je zoekt bestaat niet of is verplaatst.
          </p>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#1062eb] rounded-2xl font-bold text-base shadow-xl shadow-black/25 hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Naar de belasting check
          </Link>
        </div>
      </main>
    </div>
  );
}

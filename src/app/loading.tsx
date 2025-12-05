import Image from 'next/image';

export default function Loading() {
  return (
    <div className="bg-[#1062eb] text-white min-h-screen flex flex-col antialiased relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-cyan-400/10 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2" />
      </div>

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
        <div className="flex flex-col items-center justify-center text-center animate-fade-in-up">
          <div className="animate-spin w-10 h-10 border-2 border-white border-t-transparent rounded-full mb-6" />
          <p className="text-xl text-white/60">
            Even geduld...
          </p>
        </div>
      </main>
    </div>
  );
}

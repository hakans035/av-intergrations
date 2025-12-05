import { Triangle } from 'lucide-react';

export default function Loading() {
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
        <div className="flex flex-col items-center justify-center text-center">
          <div className="animate-spin w-10 h-10 border-2 border-white border-t-transparent rounded-full mb-6" />
          <p className="text-xl text-blue-200/80">
            Even geduld...
          </p>
        </div>
      </main>
    </div>
  );
}

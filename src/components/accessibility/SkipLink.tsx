'use client';

interface SkipLinkProps {
  targetId: string;
  label?: string;
}

export function SkipLink({ targetId, label = 'Ga naar inhoud' }: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className="
        sr-only focus:not-sr-only
        focus:absolute focus:top-4 focus:left-4 focus:z-50
        focus:bg-white focus:text-[#1062eb] focus:px-4 focus:py-2
        focus:rounded-lg focus:font-medium focus:shadow-lg
        focus:outline-none focus:ring-2 focus:ring-blue-500
      "
    >
      {label}
    </a>
  );
}

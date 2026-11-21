import React, { useState } from 'react';
import { Gem } from 'lucide-react';

interface LuxuryImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  loading?: 'lazy' | 'eager';
}

export function LuxuryImage({
  src,
  alt,
  className = 'w-full h-full object-cover',
  containerClassName = '',
  loading = 'lazy',
}: LuxuryImageProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#F8F5EF] via-[#FFFFFF] to-[#E9DFCE]/60 text-[#7D602B] p-6 text-center ${containerClassName}`}
        role="img"
        aria-label={alt}
      >
        <Gem className="w-6 h-6 mb-2 stroke-[1.25] text-[#C6A66B]" aria-hidden="true" />
        <span className="font-editorial text-sm tracking-wide text-[#292929]/85 line-clamp-2">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-[#F8F5EF] ${containerClassName}`}>
      {!loaded && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#F8F5EF] via-[#E9DFCE]/60 to-[#F8F5EF] animate-pulse"
        />
      )}
      <img
        src={src}
        alt={alt}
        loading={loading}
        referrerPolicy="no-referrer"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`${className} transition-opacity duration-500 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}

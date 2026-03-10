"use client";

import { Zap } from "lucide-react";

export function Header() {
  return (
    <header className="bg-black border-b border-[#f5db00]/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#f5db00] rounded-lg flex items-center justify-center">
                  <span className="text-black font-black text-xl sm:text-2xl tracking-tighter">PXL</span>
                  <span className="text-black font-bold text-lg sm:text-xl absolute -right-1 -top-1">.</span>
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-white font-bold text-xl tracking-wide">PXL Energy</h1>
                <p className="text-[#f5db00] text-xs font-medium -mt-1">This is your power-up!</p>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-[#f5db00] fill-[#f5db00]" />
            <h2 className="text-white font-semibold text-lg sm:text-xl">Butikssökare</h2>
          </div>

          {/* Stats */}
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <p className="text-[#f5db00] font-bold text-lg">50+</p>
              <p className="text-gray-400 text-xs">Butiker</p>
            </div>
            <div className="w-px h-8 bg-gray-700" />
            <div className="text-right">
              <p className="text-[#f5db00] font-bold text-lg">21</p>
              <p className="text-gray-400 text-xs">Regioner</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

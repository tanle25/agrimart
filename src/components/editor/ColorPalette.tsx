'use client';
import React from 'react';
import { Check } from 'lucide-react';

interface ColorPaletteProps {
  selectedColor?: string | null;
  onSelect: (color: string) => void;
  className?: string;
}

// 8 Columns (Hues) x 9 Rows (Shades)
// Organized vertically from Darkest (Row 1) to Lightest (Row 9)
export const COLOR_PALETTE = [
  // Row 1: Deepest / Black (High Contrast Text)
  ['#000000', '#450a0a', '#431407', '#422006', '#022c22', '#042f2e', '#172554', '#3b0764'],
  // Row 2: Darker
  ['#111827', '#7f1d1d', '#7c2d12', '#713f12', '#064e3b', '#134e4a', '#1e3a8a', '#4c1d95'],
  // Row 3: Dark
  ['#374151', '#991b1b', '#9a3412', '#854d0e', '#14532d', '#115e59', '#1e40af', '#5b21b6'],
  // Row 4: Medium Dark
  ['#4b5563', '#b91c1c', '#c2410c', '#a16207', '#15803d', '#0f766e', '#1d4ed8', '#6d28d9'],
  // Row 5: Primary / Vibrant (Base Colors)
  ['#6b7280', '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6'],
  // Row 6: Medium Light
  ['#9ca3af', '#f87171', '#fb923c', '#facc15', '#4ade80', '#2dd4bf', '#60a5fa', '#a78bfa'],
  // Row 7: Light
  ['#d1d5db', '#fca5a5', '#fdba74', '#fde047', '#86efac', '#5eead4', '#93c5fd', '#c4b5fd'],
  // Row 8: Very Light
  ['#e5e7eb', '#fecaca', '#fed7aa', '#fef08a', '#bbf7d0', '#99f6e4', '#bfdbfe', '#ddd6fe'],
  // Row 9: White / Tint (Backgrounds)
  ['#ffffff', '#fef2f2', '#fff7ed', '#fefce8', '#f0fdf4', '#f0fdfa', '#eff6ff', '#f5f3ff']
];

// Helper to determine if checkmark should be white or black based on bg luminance
export const isLightColor = (hex: string) => {
    if (!hex || hex === 'transparent') return true;
    // Handle short hex (e.g. #fff)
    if (hex.length === 4) {
        hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }
    const c = hex.substring(1);      // strip #
    const rgb = parseInt(c, 16);   // convert rrggbb to decimal
    const r = (rgb >> 16) & 0xff;  // extract red
    const g = (rgb >>  8) & 0xff;  // extract green
    const b = (rgb >>  0) & 0xff;  // extract blue
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
    return luma > 180;
};

export const ColorPalette: React.FC<ColorPaletteProps> = ({ selectedColor, onSelect, className = '' }) => {
  // Normalize selected color to lowercase for comparison
  const normalizedSelected = selectedColor?.toLowerCase();

  return (
    <div className={`space-y-1 ${className}`}>
        {COLOR_PALETTE.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-1 justify-between">
                {row.map((color) => (
                    <button
                        key={color}
                        onClick={(e) => {
                            e.preventDefault();
                            onSelect(color);
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                        className="w-6 h-6 rounded-full border border-gray-200 hover:scale-110 hover:shadow-sm hover:border-gray-400 hover:z-10 transition-all relative group/color focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
                        style={{ backgroundColor: color }}
                        title={color}
                    >
                        {normalizedSelected === color && (
                            <div className={`absolute inset-0 flex items-center justify-center animate-in zoom-in duration-200 ${isLightColor(color) ? 'text-gray-900' : 'text-white'}`}>
                                <Check size={12} strokeWidth={3} />
                            </div>
                        )}
                    </button>
                ))}
            </div>
        ))}
    </div>
  );
};

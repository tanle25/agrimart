import * as Slider from '@radix-ui/react-slider';
import { useCallback } from 'react';

/**
 * Proper Dual-Range Slider Implementation using Radix UI
 * Guarantees accessibility, touch support, and correct interaction on all devices.
 */
interface DualRangeSliderProps {
    min: number;
    max: number;
    step: number;
    value: [number, number];
    onChange: (value: [number, number]) => void;
}

export function DualRangeSlider({ min, max, step, value, onChange }: DualRangeSliderProps) {
    // Safety guard: ensure max is strictly greater than min
    const safeMax = max > min ? max : min + (step || 100);

    // Radix requires array for values
    const handleChange = useCallback((newValue: number[]) => {
        onChange(newValue as [number, number]);
    }, [onChange]);

    return (
        <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-6"
            value={value}
            max={safeMax}
            min={min}
            step={step}
            minStepsBetweenThumbs={step}
            onValueChange={handleChange}
        >
            <Slider.Track className="bg-gray-200 relative grow rounded-full h-1.5 cursor-pointer">
                <Slider.Range className="absolute bg-emerald-500 rounded-full h-full" />
            </Slider.Track>

            <Slider.Thumb
                className="block w-5 h-5 bg-emerald-600 border-2 border-white shadow-md rounded-full hover:scale-110 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-transform cursor-grab active:cursor-grabbing"
                aria-label="Giá tối thiểu"
            />
            <Slider.Thumb
                className="block w-5 h-5 bg-emerald-600 border-2 border-white shadow-md rounded-full hover:scale-110 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-transform cursor-grab active:cursor-grabbing"
                aria-label="Giá tối đa"
            />
        </Slider.Root>
    );
}

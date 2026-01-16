'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Globe, X, Locate, Loader2 } from 'lucide-react';

const PRESETS = [
    { label: 'New York', value: 'New York, USA' },
    { label: 'London', value: 'London, UK' },
    { label: 'Tokyo', value: 'Tokyo, Japan' },
    { label: 'Paris', value: 'Paris, France' },
    { label: 'Hanoi', value: 'Hanoi, Vietnam' },
    { label: 'Sydney', value: 'Sydney, Australia' },
];

interface MapDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onInsert: (src: string) => void;
}

export const MapDialog: React.FC<MapDialogProps> = ({ isOpen, onClose, onInsert }) => {
    const [location, setLocation] = useState('');
    const [zoom, setZoom] = useState(13);
    const [debouncedLocation, setDebouncedLocation] = useState('');
    const [loadingLoc, setLoadingLoc] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLocation('');
            setZoom(13);
            setDebouncedLocation('');
        }
    }, [isOpen]);

    // Debounce location for preview to avoid flashing iframe updates
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedLocation(location);
        }, 800);
        return () => clearTimeout(timer);
    }, [location]);

    const getEmbedUrl = (loc: string, z: number) => {
        if (!loc) return '';
        return `https://maps.google.com/maps?q=${encodeURIComponent(loc)}&t=m&z=${z}&output=embed&iwloc=near`;
    };

    const previewUrl = useMemo(() => getEmbedUrl(debouncedLocation, zoom), [debouncedLocation, zoom]);

    const handleInsert = () => {
        if (!location) return;
        const finalUrl = getEmbedUrl(location, zoom);
        onInsert(finalUrl);
        onClose();
    };

    const handleCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setLoadingLoc(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                // Use coordinates as the location query
                setLocation(`${latitude}, ${longitude}`);
                setLoadingLoc(false);
            },
            (error) => {
                console.error("Error getting location:", error.message);
                let msg = "Unable to retrieve your location.";
                if (error.code === 1) msg = "Location permission denied. Please allow access.";
                else if (error.code === 2) msg = "Location unavailable.";
                else if (error.code === 3) msg = "Location request timed out.";
                
                alert(msg);
                setLoadingLoc(false);
            }
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-[700px] bg-white rounded-2xl shadow-2xl flex overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-100 h-[450px]">
                
                {/* Left Controls */}
                <div className="w-72 bg-gray-50 border-r border-gray-200 p-6 flex flex-col gap-5">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <MapPin className="text-blue-600" size={20} />
                            Insert Map
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">Embed a Google Map location.</p>
                    </div>

                    <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Location</label>
                            <div className="relative flex items-center">
                                <input 
                                    autoFocus
                                    type="text" 
                                    placeholder="City, Address, or Coordinates"
                                    className="w-full pl-3 pr-9 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                                <button 
                                    onClick={handleCurrentLocation}
                                    className="absolute right-2 p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    title="Use Current Location"
                                    disabled={loadingLoc}
                                >
                                    {loadingLoc ? <Loader2 size={16} className="animate-spin text-blue-600"/> : <Locate size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex justify-between">
                                <span>Zoom Level</span>
                                <span className="text-gray-400 font-normal">{zoom}</span>
                            </label>
                            <input 
                                type="range" 
                                min="2" max="20" 
                                value={zoom}
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Presets</label>
                            <div className="flex flex-wrap gap-2">
                                {PRESETS.map(p => (
                                    <button 
                                        key={p.label}
                                        onClick={() => setLocation(p.value)}
                                        className="px-2.5 py-1.5 bg-white border border-gray-200 hover:border-blue-400 hover:text-blue-600 rounded-md text-xs font-medium text-gray-600 transition-all shadow-sm"
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                        <button onClick={onClose} className="flex-1 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
                        <button 
                            onClick={handleInsert} 
                            disabled={!location}
                            className="flex-1 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-md disabled:opacity-50 disabled:shadow-none transition-all"
                        >
                            Insert Map
                        </button>
                    </div>
                </div>

                {/* Right Preview */}
                <div className="flex-1 bg-gray-100 relative flex items-center justify-center">
                    <button 
                        onClick={onClose}
                        className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-colors z-10 shadow-sm"
                    >
                        <X size={18} />
                    </button>

                    {previewUrl ? (
                        <iframe 
                            src={previewUrl}
                            width="100%" 
                            height="100%" 
                            style={{ border: 0 }} 
                            allowFullScreen 
                            loading="lazy" 
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="text-center text-gray-400 flex flex-col items-center gap-3">
                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                                <Globe size={32} className="text-gray-400" />
                            </div>
                            <span className="text-sm font-medium">Enter a location to preview</span>
                        </div>
                    )}
                    
                    {/* Overlay warning for potential embed issues */}
                    {previewUrl && (
                        <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg text-[10px] text-gray-500 shadow-sm border border-gray-200 text-center">
                            Note: Some locations may require a valid Google Maps API Key in production environment.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
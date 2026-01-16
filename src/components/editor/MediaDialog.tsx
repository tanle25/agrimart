'use client';
import React, { useState, useEffect } from 'react';
import { 
  X, UploadCloud, LayoutGrid, Globe, Film, 
  FileVideo, FileAudio, Loader2, CheckCircle2, 
  Link as LinkIcon 
} from 'lucide-react';
import { uploadFile, getMediaLibrary, EditorConfig, defaultEditorConfig } from './editorConfig';

// MOCK DATA FOR LIBRARY (fallback khi không có mediaLibraryUrl)
const MOCK_LIBRARY = {
    images: [
        'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400&q=80',
        'https://images.unsplash.com/photo-1682686581854-5e71f58e7e3f?w=400&q=80',
        'https://images.unsplash.com/photo-1682695796954-bad25145f863?w=400&q=80',
        'https://images.unsplash.com/photo-1682685797769-481b48245053?w=400&q=80',
        'https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=400&q=80',
        'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=400&q=80',
        'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80'
    ],
    videos: ['https://www.w3schools.com/html/mov_bbb.mp4'],
    audio: ['https://www.w3schools.com/html/horse.mp3']
};

interface MediaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'image' | 'video' | 'audio';
  editor: any;
  config?: EditorConfig;
}

export const MediaDialog: React.FC<MediaDialogProps> = ({ isOpen, onClose, type, editor, config = defaultEditorConfig }) => {
    const [view, setView] = useState<'upload' | 'link' | 'library'>('upload');
    const [url, setUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [libraryItems, setLibraryItems] = useState<string[]>([]);
    const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
    
    // Reset state when opening/changing type
    useEffect(() => {
        if(isOpen) {
            setView('upload');
            setUrl('');
            setIsUploading(false);
            setLibraryItems([]);
        }
    }, [isOpen, type]);

    // Load media library when switching to library view
    useEffect(() => {
        if (isOpen && view === 'library' && libraryItems.length === 0) {
            setIsLoadingLibrary(true);
            getMediaLibrary(type, config)
                .then(items => {
                    setLibraryItems(items);
                    setIsLoadingLibrary(false);
                })
                .catch(error => {
                    console.warn('Failed to load media library:', error);
                    setIsLoadingLibrary(false);
                });
        }
    }, [isOpen, view, type, config]);

    if (!isOpen) return null;

    const handleInsert = (insertUrl: string) => {
        if (!insertUrl) return;

        if (type === 'image') {
            editor.chain().focus().setImage({ src: insertUrl }).run();
        } else if (type === 'video') {
            // Regex to check if the URL is YouTube or Vimeo
            const isYoutube = insertUrl.match(/^(https?:\/\/)?(www\.|music\.)?(youtube\.com|youtu\.be)(?:\/.*)?$/);
            const isVimeo = insertUrl.match(/^(https?:\/\/)?(www\.)?(vimeo\.com)(?:\/.*)?$/);

            if (isYoutube || isVimeo) {
                editor.chain().focus().setYoutubeVideo({ src: insertUrl }).run();
            } else {
                // Fallback for direct HTML5 video files (mp4, webm, etc.)
                // Requires the custom 'Video' extension in Editor.tsx
                editor.chain().focus().setVideo({ src: insertUrl }).run();
            }
        } else if (type === 'audio') {
            editor.chain().focus().setAudio({ src: insertUrl }).run();
        }
        onClose();
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const uploadedUrl = await uploadFile(file, config);
            handleInsert(uploadedUrl);
        } catch (error) {
            console.error('Upload failed:', error);
            // Fallback to base64 if upload fails
            const reader = new FileReader();
            reader.onload = (event) => {
                handleInsert(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        } finally {
            setIsUploading(false);
        }
    };

    const getTitle = () => {
        if (type === 'image') return 'Insert Image';
        if (type === 'video') return 'Insert Video';
        return 'Insert Audio';
    }

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>

            {/* Modal Content - Big Fixed Size */}
            <div className="relative w-[800px] h-[600px] bg-white rounded-2xl shadow-2xl flex overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-100">
                
                {/* Sidebar */}
                <div className="w-56 bg-gray-50 border-r border-gray-100 flex flex-col">
                    <div className="p-6 pb-4">
                        <h3 className="text-lg font-bold text-gray-800">{getTitle()}</h3>
                        <p className="text-xs text-gray-500 mt-1">Select source</p>
                    </div>
                    
                    <div className="flex-1 px-3 space-y-1">
                        <button 
                            onClick={() => setView('upload')}
                            className={`w-full text-left px-3 py-3 rounded-lg flex items-center gap-3 transition-colors ${view === 'upload' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <UploadCloud size={18} />
                            Upload
                        </button>
                         <button 
                            onClick={() => setView('library')}
                            className={`w-full text-left px-3 py-3 rounded-lg flex items-center gap-3 transition-colors ${view === 'library' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <LayoutGrid size={18} />
                            Library
                        </button>
                         <button 
                            onClick={() => setView('link')}
                            className={`w-full text-left px-3 py-3 rounded-lg flex items-center gap-3 transition-colors ${view === 'link' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <Globe size={18} />
                            Embed Link
                        </button>
                    </div>

                    <div className="p-4 border-t border-gray-200">
                         <button onClick={onClose} className="w-full py-2 text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors">
                             Cancel
                         </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col bg-white relative">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex-1 p-8 overflow-y-auto">
                        
                        {/* UPLOAD VIEW */}
                        {view === 'upload' && (
                            <div className="h-full flex flex-col justify-center items-center">
                                {type === 'video' ? (
                                    <div className="text-center max-w-sm mx-auto">
                                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Film size={40} className="text-gray-300" />
                                        </div>
                                        <h4 className="text-gray-900 font-medium mb-2">Video upload disabled</h4>
                                        <p className="text-sm text-gray-500 mb-6">Hosting videos requires significant server resources. Please use the Embed Link tab for YouTube/Vimeo.</p>
                                        <button onClick={() => setView('link')} className="text-blue-600 hover:underline font-medium">Switch to Embed Link</button>
                                    </div>
                                ) : (
                                    <div className={`
                                        w-full max-w-md aspect-[4/3] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer relative
                                        ${isUploading ? 'border-blue-300 bg-blue-50/30' : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'}
                                    `}>
                                         {isUploading ? (
                                            <>
                                                <Loader2 size={48} className="text-blue-500 animate-spin mb-4" />
                                                <span className="text-lg text-blue-600 font-medium">Uploading file...</span>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                                                    <UploadCloud size={40} />
                                                </div>
                                                <span className="text-xl font-medium text-gray-700">Click to upload</span>
                                                <span className="text-sm text-gray-400 mt-2">SVG, PNG, JPG or GIF (max. 10MB)</span>
                                            </>
                                        )}
                                        <input 
                                            type="file" 
                                            accept={type === 'image' ? "image/*" : "audio/*"}
                                            className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                            onChange={handleFileUpload}
                                            disabled={isUploading}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* LIBRARY VIEW */}
                        {view === 'library' && (
                            <div>
                                <h4 className="text-lg font-semibold text-gray-800 mb-4">Media Library</h4>
                                {isLoadingLibrary ? (
                                    <div className="flex items-center justify-center h-64">
                                        <Loader2 size={32} className="text-blue-500 animate-spin" />
                                        <span className="ml-3 text-gray-600">Loading media library...</span>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 gap-4">
                                        {libraryItems.length > 0 ? (
                                            // Use items from API
                                            libraryItems.map((src, i) => (
                                                type === 'image' ? (
                                                    <button 
                                                        key={i} 
                                                        onClick={() => handleInsert(src)}
                                                        className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 hover:border-blue-500 hover:ring-4 hover:ring-blue-500/20 transition-all group bg-gray-50"
                                                    >
                                                        <img src={src} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                            <div className="bg-white/90 text-gray-900 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                                                Select
                                                            </div>
                                                        </div>
                                                    </button>
                                                ) : (
                                                    <button 
                                                        key={i}
                                                        onClick={() => handleInsert(src)}
                                                        className="aspect-video rounded-xl bg-gray-50 border border-gray-200 flex flex-col items-center justify-center hover:bg-blue-50 hover:border-blue-400 transition-all gap-3 group"
                                                    >
                                                        <div className="p-4 bg-white rounded-full shadow-sm group-hover:shadow-md transition-all">
                                                            {type === 'video' ? <FileVideo size={32} className="text-gray-400 group-hover:text-blue-600"/> : <FileAudio size={32} className="text-gray-400 group-hover:text-blue-600"/>}
                                                        </div>
                                                        <span className="text-sm text-gray-500 font-medium group-hover:text-blue-700">Media {i+1}</span>
                                                    </button>
                                                )
                                            ))
                                        ) : (
                                            // Fallback to mock data if no API configured
                                            <>
                                                {type === 'image' && MOCK_LIBRARY.images.map((src, i) => (
                                                    <button 
                                                        key={i} 
                                                        onClick={() => handleInsert(src)}
                                                        className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 hover:border-blue-500 hover:ring-4 hover:ring-blue-500/20 transition-all group bg-gray-50"
                                                    >
                                                        <img src={src} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                            <div className="bg-white/90 text-gray-900 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                                                Select
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}
                                                {type !== 'image' && [1,2,3,4,5,6].map((_, i) => (
                                                    <button 
                                                        key={i}
                                                        onClick={() => {
                                                            if (type === 'video') {
                                                                handleInsert(MOCK_LIBRARY.videos[0]);
                                                            } else {
                                                                handleInsert(MOCK_LIBRARY.audio[0]);
                                                            }
                                                        }}
                                                        className="aspect-video rounded-xl bg-gray-50 border border-gray-200 flex flex-col items-center justify-center hover:bg-blue-50 hover:border-blue-400 transition-all gap-3 group"
                                                    >
                                                        <div className="p-4 bg-white rounded-full shadow-sm group-hover:shadow-md transition-all">
                                                            {type === 'video' ? <FileVideo size={32} className="text-gray-400 group-hover:text-blue-600"/> : <FileAudio size={32} className="text-gray-400 group-hover:text-blue-600"/>}
                                                        </div>
                                                        <span className="text-sm text-gray-500 font-medium group-hover:text-blue-700">Media_File_{i+1}.{type === 'video' ? 'mp4' : 'mp3'}</span>
                                                    </button>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* LINK VIEW */}
                        {view === 'link' && (
                            <div className="h-full flex flex-col justify-center items-center max-w-lg mx-auto">
                                <div className="w-full space-y-6">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Globe size={32} />
                                        </div>
                                        <h4 className="text-xl font-semibold text-gray-900">Embed from Web</h4>
                                        <p className="text-gray-500 mt-2">Paste the URL of the {type} you want to insert.</p>
                                    </div>

                                    <div className="flex items-center gap-3 px-4 py-4 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 transition-all">
                                        <LinkIcon size={20} className="text-gray-400 shrink-0" />
                                        <input 
                                            autoFocus
                                            className="flex-1 min-w-0 bg-transparent text-lg outline-none placeholder:text-gray-400 text-gray-800"
                                            placeholder="https://..."
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleInsert(url)}
                                        />
                                    </div>

                                    <button 
                                        onClick={() => handleInsert(url)} 
                                        disabled={!url}
                                        className="w-full py-3.5 bg-blue-600 text-white rounded-xl text-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transform active:scale-[0.98]"
                                    >
                                        Embed {type === 'image' ? 'Image' : 'Media'}
                                    </button>
                                    
                                    <div className="flex justify-center gap-4 text-xs text-gray-400 pt-4">
                                        <span className="flex items-center gap-1"><CheckCircle2 size={12}/> Secure</span>
                                        <span className="flex items-center gap-1"><CheckCircle2 size={12}/> Fast Load</span>
                                        {type === 'video' && <span className="flex items-center gap-1"><CheckCircle2 size={12}/> {type === 'video' ? 'YouTube / Vimeo / MP4' : 'MP3 / WAV'}</span>}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
export const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;

    // Get backend URL from env or default
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001';

    // Ensure no double slash if backend_url ends with / or url starts with /
    const baseUrl = BACKEND_URL.replace(/\/+$/, '');
    // If it's just a filename (no slashes), assume it needs /api/media prefix
    if (!url.includes('/')) {
        return `${baseUrl}/api/media/${url}`;
    }

    // Ensure no double slash if backend_url ends with / or url starts with /
    const cleanUrl = url.replace(/^\/+/, '');

    return `${baseUrl}/${cleanUrl}`;
};

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

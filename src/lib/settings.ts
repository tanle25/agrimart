
export interface GlobalSettings {
    general: {
        siteTitle: string;
        tagline: string;
        logo: string;
        favicon: string;
        language: string;
        timezone: string;
        metaKeywords: string;
        metaDescription: string;
    };
    store: {
        email: string;
        phone: string;
        address: string;
        mapUrl: string;
        facebook: string;
        instagram: string;
        youtube: string;
        zalo: string;
    };
    shipping: {
        feeInner: number;
        feeOuter: number;
        freeShipEnabled: boolean;
        freeShipThreshold: number;
    };
    appearance?: {
        hero?: {
            mode: string;
            items: HeroItem[];
        };
        // Allow other appearance keys but try to be specific where possible
        [key: string]: unknown;
    };
}

export interface HeroItem {
    id: string;
    image: string;
    title?: string;
    link?: string;
    [key: string]: unknown;
}

export const defaultSettings: GlobalSettings = {
    general: {
        siteTitle: 'AgriMart - Nông Sản Sạch Việt Nam',
        tagline: 'Mang hương vị thiên nhiên về ngôi nhà bạn',
        logo: '',
        favicon: '',
        language: 'vi',
        timezone: 'GMT+07:00',
        metaKeywords: 'nông sản sạch',
        metaDescription: 'AgriMart chuyên cung cấp nông sản sạch.'
    },
    store: {
        email: 'contact@agrimart.vn',
        phone: '1900 1234',
        address: '123 Đường Nguyễn Huệ, TP.HCM',
        mapUrl: '',
        facebook: '',
        instagram: '',
        youtube: '',
        zalo: ''
    },
    shipping: {
        feeInner: 20000,
        feeOuter: 35000,
        freeShipEnabled: true,
        freeShipThreshold: 500000
    }
};

export async function getGlobalSettings(): Promise<GlobalSettings> {
    try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001';
        const res = await fetch(`${backendUrl}/api/settings`, {
            next: { revalidate: 60 } // Revalidate every 60 seconds
        });

        if (!res.ok) {
            console.error('Failed to fetch settings:', res.status);
            return defaultSettings;
        }

        const data = await res.json();
        // Merge with default to ensure all fields exist
        return {
            ...defaultSettings,
            ...data,
            general: { ...defaultSettings.general, ...data.general },
            store: { ...defaultSettings.store, ...data.store },
            shipping: { ...defaultSettings.shipping, ...data.shipping }
        };
    } catch (error) {
        console.error('Error fetching global settings:', error);
        return defaultSettings;
    }
}

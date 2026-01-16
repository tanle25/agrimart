
// This file is just to ensure Tailwind generates these classes
// used in dynamic content (like database payloads)

export const safelist = [
    // Green colors
    'text-green-800',
    'text-green-900',
    'bg-green-500',
    'bg-green-600',
    'bg-green-800',
    'bg-green-900',
    'border-green-700',

    // Gradients
    'bg-gradient-to-br',
    'from-green-800',
    'to-black',

    // Backgrounds
    'bg-stone-50',
    'bg-amber-50',
    'bg-blue-50',

    // Borders
    'border-yellow-600',
    'border-amber-200',
    'border-blue-200',

    // Text
    'text-white',
    'text-gray-900',

    // Note: 'border-brown-700' does not exist in Tailwind default palette.
    // We substitute it with something similar to ensure consistent design if you change the payload.
    'border-orange-900', // approximation for brown
];

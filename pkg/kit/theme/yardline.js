import { registerTheme } from './registry';
/** First Mokei theme: glass HUD on the lavender warehouse-yard clay field. */
export const yardlineTheme = {
    id: 'yardline',
    name: 'Yardline',
    description: 'Glass panels, SF/Inter type, and the existing clay-diorama blues.',
    dataTheme: 'yardline',
    materials: {
        base: '#f7f9fd',
        accent1: '#2563eb',
        accent2: '#f2c14e',
        accent3: '#2f63e6',
        detail: { dark: '#1f2533', mid: '#2a3247', light: '#cbd5e1' },
        ground: '#e9eef8',
    },
};
registerTheme(yardlineTheme);
//# sourceMappingURL=yardline.js.map
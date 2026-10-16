export const AIKIT_SETTINGS = [
    {
        variable: '--g-aikit-message-balloon-background',
        label: 'User message background',
        kind: 'color',
    },
    {variable: '--g-aikit-message-balloon-color', label: 'User message text', kind: 'color'},
    {
        variable: '--g-aikit-chat-container-header-background',
        label: 'Header background',
        kind: 'color',
    },
    {
        variable: '--g-aikit-chat-container-content-chat-background',
        label: 'Conversation background',
        kind: 'color',
    },
    {
        variable: '--g-aikit-chat-container-content-empty-background',
        label: 'Welcome background',
        kind: 'color',
    },
    {
        variable: '--g-aikit-chat-container-footer-chat-background',
        label: 'Conversation footer',
        kind: 'color',
    },
    {variable: '--g-aikit-shimmer-color-from', label: 'Shimmer fade', kind: 'color'},
    {variable: '--g-aikit-shimmer-color-to', label: 'Shimmer highlight', kind: 'color'},
    {variable: '--g-aikit-mascot-body-center-color', label: 'Mascot center', kind: 'color'},
    {variable: '--g-aikit-mascot-body-edge-color', label: 'Mascot edge', kind: 'color'},
    {variable: '--g-aikit-mascot-eye-color', label: 'Mascot eyes', kind: 'color'},
    {variable: '--g-aikit-mascot-pupil-color', label: 'Mascot pupils', kind: 'color'},
    {variable: '--g-aikit-layout-base-padding-m', label: 'Chat padding', kind: 'length'},
    {variable: '--g-aikit-chat-container-mobile-padding', label: 'Mobile padding', kind: 'length'},
    {variable: '--g-aikit-mascot-hero-size', label: 'Welcome mascot size', kind: 'length'},
    {variable: '--g-aikit-mascot-chat-size', label: 'Conversation mascot size', kind: 'length'},
    {variable: '--g-aikit-shimmer-duration', label: 'Shimmer duration', kind: 'duration'},
] as const;

export const PALETTES = [
    'brand',
    'blue',
    'green',
    'yellow',
    'orange',
    'red',
    'purple',
    'cool-grey',
] as const;

export const PRESETS = [
    {name: 'Gravity', color: null},
    {name: 'Iris', color: '#8b5cf6'},
    {name: 'Ocean', color: '#0284c7'},
    {name: 'Forest', color: '#15803d'},
    {name: 'Ember', color: '#ea580c'},
] as const;

import type {ReactNode} from 'react';

export const MASCOT_STATES = [
    'reveal',
    'thinking',
    'done',
    'idle',
    'reading',
    'error',
    'stopped',
    'sleeping',
    'listening',
    'speaking',
] as const;

export type MascotState = (typeof MASCOT_STATES)[number];
export type MascotView = 'hero' | 'chat';
export type MascotAnimationType = 'loop' | 'once';
export type HeroMascotState = Extract<MascotState, 'idle' | 'reading'>;
export type ChatMascotState = MascotState;

/** Ready-to-render animated mascots grouped by their surface and state. */
export type MascotCollection = {
    hero?: Partial<Record<HeroMascotState, ReactNode>>;
    chat?: Partial<Record<ChatMascotState, ReactNode>>;
};

export type MascotThemedAsset<TAsset = string> = {
    type: 'themed';
    light?: TAsset;
    dark?: TAsset;
};

export type MascotAsset<TAsset = string> =
    | {type: 'asset'; value: TAsset}
    | MascotThemedAsset<TAsset>;

export type MascotAssets<TAsset = string> = Partial<Record<MascotState, MascotAsset<TAsset>>>;

export interface MascotRenderContext<TAsset = string> {
    view: MascotView;
    state: MascotState;
    animationType: MascotAnimationType;
    /** Assets after defaults and overrides have been merged. */
    assets?: MascotAssets<TAsset>;
}

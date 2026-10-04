import type { SceneEvent } from '../../kit/scene/types';
type BlankState = {
    label: string;
    shift: number;
    selected: string | null;
    dispatch: (event: SceneEvent) => void;
};
export declare const useBlank: import("zustand").UseBoundStore<import("zustand").StoreApi<BlankState>>;
export {};
//# sourceMappingURL=state.d.ts.map
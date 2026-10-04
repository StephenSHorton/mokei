import { type CanvasProps } from '@react-three/fiber';
import { type ReactNode } from 'react';
import { type SceneQuality } from './quality';
export type SceneCanvasProps = Omit<CanvasProps, 'children'> & {
    quality?: SceneQuality;
    children?: ReactNode;
};
/**
 * Host canvas with library AA / DPR / soft-shadow defaults.
 *
 * Three r186 removed the distinct PCFSoft kernel (WebGL remaps
 * `PCFSoftShadowMap` to `PCFShadowMap` and warns). We still request
 * `PCFSoftShadowMap` on the Canvas so the intent is visible, then pin
 * `PCFShadowMap` so the remap does not re-warn every frame.
 */
export declare function SceneCanvas({ quality, children, dpr, gl, shadows, flat, ...rest }: SceneCanvasProps): import("react").JSX.Element;
/**
 * Applies DPR + PCF shadow type from the quality context. Worlds mount this
 * so a host that still uses a raw `<Canvas>` (Rock today) still gets the
 * library defaults — except `antialias`, which is a context-creation flag
 * and must be set on `SceneCanvas`.
 */
export declare function ApplyCanvasQuality(): null;
//# sourceMappingURL=SceneCanvas.d.ts.map
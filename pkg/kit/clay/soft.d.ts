import { LatheGeometry } from 'three';
type Vec3 = [number, number, number];
/**
 * Shared scale for toy-edge rounding and bevels.
 * 1 keeps the generous post-polish radii; 0 is a hard box.
 * 0.8 sits halfway between the 0.6 crisp pass and the original soft look.
 */
export declare const SOFT_EDGE_SCALE = 0.8;
export declare function scaleSoft(value: number): number;
type SoftBoxProps = {
    size: Vec3;
    color: string;
    position?: Vec3;
    rotation?: Vec3;
    /** Corner radius in world units. Defaults to a generous share of the smallest side. */
    r?: number;
    smooth?: number;
    cast?: boolean;
    receive?: boolean;
    emissive?: string;
};
/** Rounded box with toy-like soft corners. Radius is clamped so it never collapses. */
export declare function SoftBox({ size, color, position, rotation, r, smooth, cast, receive, emissive, }: SoftBoxProps): import("react").JSX.Element;
/** Lathe profile for a cylinder whose top and bottom rims are filleted. */
export declare function useRoundCylinder(radius: number, height: number, fillet: number, segments?: number): LatheGeometry;
type RoundCylProps = {
    radius: number;
    height: number;
    fillet?: number;
    color: string;
    position?: Vec3;
    rotation?: Vec3;
    cast?: boolean;
    segments?: number;
};
export declare function RoundCyl({ radius, height, fillet, color, position, rotation, cast, segments, }: RoundCylProps): import("react").JSX.Element;
/** Chunky toy wheel: rounded tire plus a lighter hub, axis along X. */
export declare function Wheel({ position, radius, width, tire, hub, }: {
    position: Vec3;
    radius?: number;
    width?: number;
    tire?: string;
    hub?: string;
}): import("react").JSX.Element;
export {};
//# sourceMappingURL=soft.d.ts.map
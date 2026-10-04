import { World } from './World';
export { World } from './World';
export { useBlank } from './state';
export declare const blankLook: {
    ground: string;
    road: string;
    grass: string;
    wall: string;
    roof: string;
    accent: string;
    yellow: string;
    cardboard: string;
    tree: string;
    tire: string;
    aoColor: string;
    skyColor: string;
    groundBounce: string;
    cameraZoom: number;
    cameraAzimuth: number;
    cameraElevation: number;
};
export declare const blankScene: {
    id: string;
    name: string;
    description: string;
    themeId: string;
    World: typeof World;
    camera: {
        zoom: number;
        azimuth: number;
        elevation: number;
        target: {
            x: number;
            z: number;
        };
    };
    look: {
        ground: string;
        road: string;
        grass: string;
        wall: string;
        roof: string;
        accent: string;
        yellow: string;
        cardboard: string;
        tree: string;
        tire: string;
        aoColor: string;
        skyColor: string;
        groundBounce: string;
        cameraZoom: number;
        cameraAzimuth: number;
        cameraElevation: number;
    };
    dispatch: (event: import("../../kit").SceneEvent) => void;
};
//# sourceMappingURL=index.d.ts.map
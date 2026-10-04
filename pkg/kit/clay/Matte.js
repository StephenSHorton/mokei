import { jsx as _jsx } from "react/jsx-runtime";
// Fully matte, no specular: Lambert keeps the clay look flat and soft.
export function Matte({ color, emissive }) {
    return _jsx("meshLambertMaterial", { color: color, emissive: emissive ?? '#000000' });
}
//# sourceMappingURL=Matte.js.map
import { jsx as _jsx } from "react/jsx-runtime";
import { useClayColor } from '../theme/materials';
// Fully matte, no specular: Lambert keeps the clay look flat and soft.
export function Matte({ color, material, unsafeColor, emissive }) {
    const resolved = useClayColor({ color, material, unsafeColor });
    return _jsx("meshLambertMaterial", { color: resolved, emissive: emissive ?? '#000000' });
}
//# sourceMappingURL=Matte.js.map
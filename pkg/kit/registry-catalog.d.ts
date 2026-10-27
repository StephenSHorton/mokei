/** Public Pages origin for the shadcn registry. */
export declare const REGISTRY_BASE = "https://stephenshorton.github.io/mokei";
export type RegistryCatalogItem = {
    name: string;
    title: string;
    description: string;
    type: 'registry:theme' | 'registry:ui' | 'registry:lib';
};
export declare const registryCatalog: readonly [{
    readonly name: "theme";
    readonly title: "Mokei theme";
    readonly description: "Glass + clay CSS variables, Tailwind v4 preset, and glass-panel.";
    readonly type: "registry:theme";
}, {
    readonly name: "button";
    readonly title: "Button";
    readonly description: "Primary, outline, ghost, and icon buttons.";
    readonly type: "registry:ui";
}, {
    readonly name: "card";
    readonly title: "Card";
    readonly description: "Glass panel surface used by KPI and inspector cards.";
    readonly type: "registry:ui";
}, {
    readonly name: "badge";
    readonly title: "Badge";
    readonly description: "Pills including success, warning, info, and slate.";
    readonly type: "registry:ui";
}, {
    readonly name: "input";
    readonly title: "Input";
    readonly description: "Search-style field.";
    readonly type: "registry:ui";
}, {
    readonly name: "tabs";
    readonly title: "Tabs";
    readonly description: "Segmented control used by the docks board.";
    readonly type: "registry:ui";
}, {
    readonly name: "tooltip";
    readonly title: "Tooltip";
    readonly description: "Small hover hint.";
    readonly type: "registry:ui";
}, {
    readonly name: "progress";
    readonly title: "Progress";
    readonly description: "Battery and cargo bars.";
    readonly type: "registry:ui";
}, {
    readonly name: "separator";
    readonly title: "Separator";
    readonly description: "Hairline rule.";
    readonly type: "registry:ui";
}, {
    readonly name: "avatar";
    readonly title: "Avatar";
    readonly description: "User chip.";
    readonly type: "registry:ui";
}, {
    readonly name: "kbd";
    readonly title: "Kbd";
    readonly description: "Keyboard hint, as in the search field.";
    readonly type: "registry:ui";
}, {
    readonly name: "label";
    readonly title: "Label";
    readonly description: "Form label.";
    readonly type: "registry:ui";
}, {
    readonly name: "dropdown-menu";
    readonly title: "Dropdown menu";
    readonly description: "Site and user menus.";
    readonly type: "registry:ui";
}, {
    readonly name: "stepper";
    readonly title: "Stepper";
    readonly description: "Shipment tracking steps.";
    readonly type: "registry:ui";
}, {
    readonly name: "select";
    readonly title: "Select";
    readonly description: "Glass select with groups, separators, and a sm size.";
    readonly type: "registry:ui";
}, {
    readonly name: "textarea";
    readonly title: "Textarea";
    readonly description: "Multi-line field with optional auto height.";
    readonly type: "registry:ui";
}, {
    readonly name: "toggle-group";
    readonly title: "Toggle group";
    readonly description: "Segmented toggles and filter chips.";
    readonly type: "registry:ui";
}, {
    readonly name: "radio-group";
    readonly title: "Radio group";
    readonly description: "Radio list or horizontal chips.";
    readonly type: "registry:ui";
}, {
    readonly name: "switch";
    readonly title: "Switch";
    readonly description: "On/off switch that pairs with Label.";
    readonly type: "registry:ui";
}, {
    readonly name: "dialog";
    readonly title: "Dialog";
    readonly description: "Glass modal, plus an alert dialog for confirms.";
    readonly type: "registry:ui";
}, {
    readonly name: "popover";
    readonly title: "Popover";
    readonly description: "Glass popover with an optional arrow.";
    readonly type: "registry:ui";
}, {
    readonly name: "scene";
    readonly title: "Scene contract";
    readonly description: "SceneDefinition + SceneEvent types. Worlds ship via the git package (mokei/scene, mokei/clay).";
    readonly type: "registry:lib";
}];
export declare function registryItemUrl(name: string): string;
export declare function registryAddCommand(name: string): string;
//# sourceMappingURL=registry-catalog.d.ts.map
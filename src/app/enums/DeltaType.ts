export enum DeltaType {
    Number,
    String,
    Boolean,
    Enum,
    Array,
    Object
}

export namespace DeltaType {
    export function requiresCustomCostFunction(type: DeltaType) {
        return type === DeltaType.Array || type === DeltaType.Object;
    }
}
import { DeltaType } from "../enums/DeltaType";
import { LookupTablesService } from "../lookup-tables.service";
import { Delta } from "./Delta";
import { ModifierGroup } from "./Modifier";

export class DeltaGroup {
    objectBeingChanged: Object;
    deltas: Map<string, Delta>;
    lookupTables: LookupTablesService;

    constructor(objectBeingChanged: Object, lookupTables: LookupTablesService) {
        this.objectBeingChanged = objectBeingChanged;
        this.deltas = new Map();
        this.lookupTables = lookupTables;
    }

    getOrCreate(attribute: string, type: DeltaType) {
        if (!(this.deltas.has(attribute))) {
            this.deltas.set(attribute, new Delta(this.objectBeingChanged[attribute], type));
        }
        return this.deltas.get(attribute);
    }

    moddedValue(attribute: string) {
        if (!this.deltas.has(attribute)) {
            return this.objectBeingChanged[attribute];
        }
        return this.deltas.get(attribute).moddedValue();
    }

    increaseValue(attribute: string) {
        const delta = this.getOrCreate(attribute, DeltaType.Number);
        delta.increaseValue(this.lookupTables.increment(attribute));
    }

    decreaseValue(attribute: string, minValue?: number) {
        const delta = this.getOrCreate(attribute, DeltaType.Number);
        if (minValue && delta.moddedValue() == minValue) {
            return;
        } else {
            delta.decreaseValue(this.lookupTables.increment(attribute));
        }
    }

    changeString(attribute: string, newValue: string) {
        this.changeValue(attribute, newValue, DeltaType.String);
    }

    changeBoolean(attribute: string, newValue: boolean) {
        this.changeValue(attribute, newValue, DeltaType.Boolean);
    }

    changeEnum(attribute: string, newValue: number) {
        this.changeValue(attribute, newValue, DeltaType.Enum);
    }

    changeArray(attribute: string, newValue: any, index: number) {
        this.changeValue(attribute, newValue, DeltaType.Array, index);
    }

    private changeValue(attribute: string, newValue: any, type: DeltaType, index?: number) {
        const delta = this.getOrCreate(attribute, type);
        delta.changeValue(newValue, index);
    }

    cost(activeModifiers: ModifierGroup) {
        let totalCost = 0;
        this.deltas.forEach((delta, attribute) => {
            const cost = delta.cost(attribute, this.lookupTables);
            const discount = activeModifiers.getTotalDiscount(attribute, this.lookupTables.maxDiscount(attribute));
            totalCost += Math.round(cost - (cost * discount));
        });
        return totalCost;
    }
}
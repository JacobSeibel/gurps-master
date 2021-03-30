import { DeltaType } from "../enums/DeltaType";
import { LookupTablesService } from "../services/lookup-tables.service";
import { Delta } from "./Delta";
import { ModifierGroup } from "./Modifier";
import { Rank } from "./Rank";

export class DeltaGroup {
    objectBeingChanged: Object;
    deltas: Map<string, Delta>;
    lookupTables: LookupTablesService;
    testing: Rank[];

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

    has(attribute: string) {
        return this.deltas.has(attribute);
    }

    moddedValue(attribute: string) {
        if (!this.deltas.has(attribute)) {
            return this.objectBeingChanged[attribute];
        }
        return this.deltas.get(attribute).moddedValue();
    }

    //TODO: Make various paths based on DeltaType
    valueChange(attribute: string) {
        if (this.deltas.has(attribute)) {
            return this.deltas.get(attribute).valueChange();
        }
        return 0;
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

    changeObject(attribute: string, newValue: any) {
        this.changeValue(attribute, newValue, DeltaType.Object);
    }

    pushToArray(attribute: string, newValue: any) {
        const delta = this.getOrCreate(attribute, DeltaType.Array);
        (delta.moddedValue() as any[]).push(newValue);
    }

    removeFromArray(attribute: string, removeValue: any) {
        const delta = this.getOrCreate(attribute, DeltaType.Array);
        const array = (delta.moddedValue() as any[]);
        return array.splice(array.indexOf(removeValue), 1);
    }

    private changeValue(attribute: string, newValue: any, type: DeltaType, index?: number) {
        const delta = this.getOrCreate(attribute, type);
        delta.changeValue(newValue, index);
    }

    cost(activeModifiers: ModifierGroup) {
        let totalCost = 0;
        this.deltas.forEach((delta, attribute) => {
            if (attribute === 'languages') debugger;
            const cost = delta.cost(attribute, this.lookupTables);
            const discount = activeModifiers.getTotalDiscount(attribute, this.lookupTables.maxDiscount(attribute));
            totalCost += Math.round(cost - (cost * discount));
        });
        return totalCost;
    }
}
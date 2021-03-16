import { throwError } from "rxjs";
import { DeltaType } from "../enums/DeltaType";
import { LookupTablesService } from "../services/lookup-tables.service";

export class Delta {
    private oldValue: any;
    private newValue: any;
    private type: DeltaType;
    customCostFunction: Function;
    calculatedValueFunction: Function;
    
    constructor(oldValue: any, type: DeltaType) {
        this.oldValue = oldValue;
        if (this.type == DeltaType.Array) {
            this.newValue = (oldValue as any[]).concat([]);
        } else {
            this.newValue = oldValue;
        }
        this.type = type;
    }

    moddedValue() {
        return this.newValue;
    }

    valueChange() {
        return this.newValue - this.oldValue;
    }

    increaseValue(amount: number) {
        if (this.type != DeltaType.Number) throwError(new Error('increaseValue requires a Number type'));

        this.newValue += amount;
    }

    decreaseValue(amount: number) {
        if (this.type != DeltaType.Number) throwError(new Error('decreaseValue requires a Number type'));

        this.newValue -= amount;
    }

    addValue(value: any) {
        if (this.type != DeltaType.Array) throwError(new Error('addValue requires an Array type'));
        (this.newValue as any[]).push(value);
    }

    removeValue(value: any) {
        if (this.type != DeltaType.Array) throwError(new Error('removeValue requires an Array type'));
        const array = this.newValue as any[];
        array.splice(array.indexOf(value), 1);
    }

    changeValue(value: any, index?: number) {
        if (this.type == DeltaType.Array) {
            if (index == undefined) throwError(new Error('changeValue requires index when the type is Array'));
            (this.newValue as any[])[index] = value;
        } else {
            this.newValue = value;
        }
    }

    cost(attribute: string, lookupTables: LookupTablesService) {
        if (this.customCostFunction) return this.customCostFunction();
        const newKey = this.type == DeltaType.Enum ? attribute + this.newValue : attribute;
        const oldKey = this.type == DeltaType.Enum ? attribute + this.oldValue : attribute;
        const newPrice = lookupTables.cost(newKey);
        const oldPrice = lookupTables.cost(oldKey);
        switch (this.type) {
            case DeltaType.Number:
                const increment = lookupTables.increment(newKey);
                return (this.newValue - this.oldValue) * newPrice / increment;
            case DeltaType.String:
                return 0;
            case DeltaType.Boolean:
            case DeltaType.Enum:
                return newPrice - oldPrice;
        }
    }
}
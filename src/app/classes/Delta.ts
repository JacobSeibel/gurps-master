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
        if (type === DeltaType.Array) {
            this.newValue = [...oldValue];
        } else {
            this.newValue = oldValue;
        }
        this.type = type;
    }

    moddedValue() {
        return this.newValue;
    }

    valueChange(attribute?: string) {
        let newValue = this.newValue;
        let oldValue = this.oldValue;
        if (attribute) {
            newValue = this.newValue[attribute];
            oldValue = this.oldValue[attribute];
        }
        return newValue - oldValue;
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

    /**
     * Calculates the cost of this particular Delta.
     * @param attribute The string to pass into the lookup tables to find the cost
     * @param lookupTables The lookup tables service
     * @param flag A boolean used as a catch-all for special cases
     */
    cost(attribute: string, lookupTables: LookupTablesService) {
        if (!DeltaType.requiresCustomCostFunction(this.type) && this.customCostFunction) {
            return this.customCostFunction();
        }
        const newKey = this.type == DeltaType.Enum ? attribute + this.newValue : attribute;
        const oldKey = this.type == DeltaType.Enum ? attribute + this.oldValue : attribute;
        const newPrice = lookupTables.cost(newKey);
        const oldPrice = lookupTables.cost(oldKey);
        switch (this.type) {
            case DeltaType.Array:
                return this.calculateArrayCost();
            case DeltaType.Number:
                return this.calculateNumberCost(newKey, newPrice, lookupTables);
            case DeltaType.String:
                return this.calculateStringCost();
            case DeltaType.Boolean:
                return this.calculateBooleanCost(newPrice, oldPrice);
            case DeltaType.Enum:
                return this.calculateEnumCost(newPrice, oldPrice);
            case DeltaType.Object:
                return this.calculateObjectCost();
        }
    }

    private calculateArrayCost() {
        let cost = 0;
        if (!this.customCostFunction) {
            throwError("Array type deltas require a custom cost function. Returning 0 cost.");
            return 0;
        }
        let addedValues = [...this.newValue];
        let removedValues = [];
        for (const oldValue of this.oldValue) {
            let found = false;
            for (const newValue of this.newValue) {
                if (oldValue.id === newValue.id) {
                    cost += this.customCostFunction(newValue) - this.customCostFunction(oldValue);
                    addedValues.splice(addedValues.indexOf(newValue), 1);
                    found = true;
                    break;
                }
            }
            if (!found) {
                removedValues.push(oldValue);
            }
        }
        for (const added of addedValues) {
            cost += this.customCostFunction(added);
        }
        for (const removed of removedValues) {
            cost -= this.customCostFunction(removed);
        }
        return cost;
    }

    private calculateNumberCost(newKey, newPrice, lookupTables: LookupTablesService) {
        const increment = lookupTables.increment(newKey);
        return this.valueChange() * newPrice / increment;
    }

    private calculateStringCost() {
        return 0;
    }

    private calculateBooleanCost(newPrice, oldPrice) {
        return newPrice - oldPrice;
    }

    private calculateEnumCost(newPrice, oldPrice) {
        return newPrice - oldPrice;
    }

    private calculateObjectCost() {
        if (!this.customCostFunction) {
            throwError("Object type deltas require a custom cost function. Returning 0 cost.");
            return 0;
        }
        return this.customCostFunction(this.oldValue, this.newValue);
    }
}
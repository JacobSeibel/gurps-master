import { Component, OnInit } from '@angular/core';
import { LookupTablesService } from '../lookup-tables.service';

@Component({
  selector: 'app-character-sheet',
  templateUrl: './character-sheet.component.html',
  styleUrls: ['./character-sheet.component.scss'],
})
export class CharacterSheetComponent implements OnInit {
  ST_COST = 10;
  DX_COST = 20;
  IQ_COST = 20;
  HT_COST = 10;
  HP_MODIFIER_COST = 2;
  SIZE_MODIFIER_COST = 0;
  costFromST = 0;
  costFromDX = 0;
  costFromIQ = 0;
  costFromHT = 0;
  costFromHPModifier = 0;
  st = 10;
  dx = 10;
  iq = 10;
  ht = 10;
  hpModifier = 0;
  sizeModifier = 0;
  private _basicSpeed;
  private _basicMove;
  constructor(private lookupTables: LookupTablesService) {}
  ngOnInit(): void {}

  increaseAttr(attr: string) {
    this[attr]++;
    this['costFrom' + attr.toUpperCase()] += this[attr.toUpperCase() + '_COST'];
  }
  decreaseAttr(attr: string) {
    if (this[attr] === 1) {
      return;
    }
    this[attr]--;
    this['costFrom' + attr.toUpperCase()] -= this[attr.toUpperCase() + '_COST'];
  }

  increaseModifier(attr: string) {
    this[attr + 'Modifier']++;
    this['costFrom' + attr.toUpperCase() + 'Modifier'] += this[
      attr.toUpperCase() + '_MODIFIER_COST'
    ];
  }
  decreaseModifier(attr: string) {
    this[attr + 'Modifier']--;
    this['costFrom' + attr.toUpperCase() + 'Modifier'] -= this[
      attr.toUpperCase() + '_MODIFIER_COST'
    ];
  }

  calculatedCostFromHPModifier() {
    const effectiveSizeModifier = this.sizeModifier > 8 ? 8 : this.sizeModifier;
    const sizeModifierDiscount = effectiveSizeModifier * 0.1;
    // TODO: Add appropriate rounding rules
    return this.costFromHPModifier * sizeModifierDiscount;
  }

  get cost() {
    return (
      this.costFromST +
      this.costFromDX +
      this.costFromIQ +
      this.costFromHT +
      this.calculatedCostFromHPModifier()
    );
  }

  get basicLift() {
    let lift = (this.st * this.st) / 5;
    if (lift >= 10) {
      lift = Math.round(lift);
    }
    return lift + ' lbs';
  }

  get damageThr() {
    return this.lookupTables.thrustDamage(this.st);
  }

  get damageSw() {
    return this.lookupTables.swingDamage(this.st);
  }

  get basicSpeed() {
    return this._basicSpeed;
  }

  get basicMove() {
    return this._basicMove;
  }

  get hp() {
    return this.st + this.hpModifier;
  }

  get size() {
    if (this.sizeModifier > 0) {
      return '+' + this.sizeModifier;
    }
    return this.sizeModifier;
  }
}

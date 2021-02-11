import { Component, OnInit } from '@angular/core';
import { LookupTablesService } from '../lookup-tables.service';

@Component({
  selector: 'app-character-sheet',
  templateUrl: './character-sheet.component.html',
  styleUrls: ['./character-sheet.component.scss'],
})
export class CharacterSheetComponent implements OnInit {
  // TODO: Allow configuration
  STARTING_POINTS = 125;

  // COSTS
  ST_COST = 10;
  DX_COST = 20;
  IQ_COST = 20;
  HT_COST = 10;

  // MODIFIER COSTS
  HP_MODIFIER_COST = 2;
  WILL_MODIFIER_COST = 5;
  PER_MODIFIER_COST = 5;
  FP_MODIFIER_COST = 3;
  BASICSPEED_MODIFIER_COST = 5;
  BASICMOVE_MODIFIER_COST = 5;
  SIZE_MODIFIER_COST = 0;

  // UNIQUE INCREMENTS
  BASICSPEED_MODIFIER_INCREMENT = 0.25;

  // CALCULATED COSTS (attribute is all-caps)
  costFromST = 0;
  costFromDX = 0;
  costFromIQ = 0;
  costFromHT = 0;
  costFromHPModifier = 0;
  costFromWILLModifier = 0;
  costFromPERModifier = 0;
  costFromFPModifier = 0;
  costFromBASICSPEEDModifier = 0;
  costFromBASICMOVEModifier = 0;

  // DESCRIPTORS
  name = '';
  player = '';
  height = '';
  weight = '';
  appearance = '';
  build = 1;

  // BASIC ATTRIBUTES
  st = 10;
  dx = 10;
  iq = 10;
  ht = 10;

  // MODIFIERS
  hpModifier = 0;
  willModifier = 0;
  sizeModifier = 0;
  perModifier = 0;
  fpModifier = 0;
  basicspeedModifier = 0;
  basicmoveModifier = 0;

  constructor(private lookupTables: LookupTablesService) {}
  ngOnInit(): void {}

  increaseAttr(attr: string) {
    const upperAttr = attr.toUpperCase();
    const incrProp = upperAttr + '_INCREMENT';
    const increment = incrProp in this ? this[incrProp] : 1;
    this[attr] += increment;
    this['costFrom' + upperAttr] += this[upperAttr + '_COST'];
  }
  decreaseAttr(attr: string) {
    if (this[attr] === 1) {
      return;
    }
    const upperAttr = attr.toUpperCase();
    const incrProp = upperAttr + '_INCREMENT';
    const increment = incrProp in this ? this[incrProp] : 1;
    this[attr] -= increment;
    this['costFrom' + upperAttr] -= this[upperAttr + '_COST'];
  }

  increaseModifier(attr: string) {
    const upperAttr = attr.toUpperCase();
    const incrProp = upperAttr + '_MODIFIER_INCREMENT';
    const increment = incrProp in this ? this[incrProp] : 1;
    this[attr + 'Modifier'] += increment;
    this['costFrom' + upperAttr + 'Modifier'] += this[
      upperAttr + '_MODIFIER_COST'
    ];
  }
  decreaseModifier(attr: string) {
    const upperAttr = attr.toUpperCase();
    const incrProp = upperAttr + '_MODIFIER_INCREMENT';
    const increment = incrProp in this ? this[incrProp] : 1;
    this[attr + 'Modifier'] -= increment;
    this['costFrom' + upperAttr + 'Modifier'] -= this[
      upperAttr + '_MODIFIER_COST'
    ];
  }

  calculatedCostFromST() {
    if (this.sizeModifier === 0) {
      return this.costFromST;
    }
    const effectiveSizeModifier = this.sizeModifier > 8 ? 8 : this.sizeModifier;
    const sizeModifierDiscount = effectiveSizeModifier * 0.1;
    // TODO: Add appropriate rounding rules
    return this.costFromST * sizeModifierDiscount;
  }

  calculatedCostFromHPModifier() {
    if (this.sizeModifier === 0) {
      return this.costFromHPModifier;
    }
    const effectiveSizeModifier = this.sizeModifier > 8 ? 8 : this.sizeModifier;
    const sizeModifierDiscount = effectiveSizeModifier * 0.1;
    // TODO: Add appropriate rounding rules
    return this.costFromHPModifier * sizeModifierDiscount;
  }

  // TODO: Why the eff doesn't === work here?
  calculatedCostFromBuild() {
    if (this.build == 0) {
      return -5;
    }
    if (this.build == 2) {
      return -1;
    }
    if (this.build == 3) {
      return -3;
    }
    if (this.build == 4) {
      return -5;
    }
    return 0;
  }

  get pointTotal() {
    return (
      this.calculatedCostFromST() +
      this.costFromDX +
      this.costFromIQ +
      this.costFromHT +
      this.calculatedCostFromHPModifier() +
      this.costFromWILLModifier +
      this.costFromPERModifier +
      this.costFromFPModifier +
      this.costFromBASICSPEEDModifier +
      this.costFromBASICMOVEModifier +
      this.calculatedCostFromBuild()
    );
  }

  get basicLift() {
    let lift = (this.st * this.st) / 5;
    if (lift >= 10) {
      lift = Math.round(lift);
    }
    return lift;
  }

  get damageThr() {
    return this.lookupTables.thrustDamage(this.st);
  }

  get damageSw() {
    return this.lookupTables.swingDamage(this.st);
  }

  get basicspeed() {
    return (this.ht + this.dx) / 4 + this.basicspeedModifier;
  }

  get basicmove() {
    return Math.floor(this.basicspeed) + this.basicmoveModifier;
  }

  get hp() {
    return this.st + this.hpModifier;
  }

  get will() {
    return this.iq + this.willModifier;
  }

  get per() {
    return this.iq + this.perModifier;
  }

  get fp() {
    return this.ht + this.fpModifier;
  }

  get size() {
    if (this.sizeModifier > 0) {
      return '+' + this.sizeModifier;
    }
    return this.sizeModifier;
  }

  get dodge() {
    return Math.floor(this.basicspeed + 3);
  }

  get enc1BasicLift() {
    return this.basicLift * 2;
  }
  get enc1BasicMove() {
    return Math.floor(this.basicmove * 0.8);
  }
  get enc1Dodge() {
    return this.dodge - 1;
  }

  get enc2BasicLift() {
    return this.basicLift * 3;
  }
  get enc2BasicMove() {
    return Math.floor(this.basicmove * 0.6);
  }
  get enc2Dodge() {
    return this.dodge - 2;
  }

  get enc3BasicLift() {
    return this.basicLift * 6;
  }
  get enc3BasicMove() {
    return Math.floor(this.basicmove * 0.4);
  }
  get enc3Dodge() {
    return this.dodge - 3;
  }

  get enc4BasicLift() {
    return this.basicLift * 10;
  }
  get enc4BasicMove() {
    return Math.floor(this.basicmove * 0.2);
  }
  get enc4Dodge() {
    return this.dodge - 4;
  }

  get unspentPoints() {
    return this.STARTING_POINTS - this.pointTotal;
  }
}

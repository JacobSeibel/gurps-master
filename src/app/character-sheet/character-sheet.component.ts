import { Component, OnInit } from '@angular/core';
import { LookupTablesService } from '../lookup-tables.service';
import { ModifierGroup } from '../classes/Modifier';
import { Language } from '../classes/Language';

@Component({
  selector: 'app-character-sheet',
  templateUrl: './character-sheet.component.html',
  styleUrls: ['./character-sheet.component.scss'],
})
export class CharacterSheetComponent implements OnInit {
  // TODO: Allow configuration
  STARTING_POINTS = 125;

  deltas = new Map();
  activeModifiers: ModifierGroup = new ModifierGroup();

  // DESCRIPTORS
  name = '';
  player = '';
  height = '';
  weight = '';
  appearanceDescription = '';
  appearance = 5;
  build = 1;

  // APPEARANCE CHECKBOXES
  androgynous = false;
  impressive = false;
  universal = false;
  offTheShelfLooks = false;

  languages: Language[] = [];
  newLanguageName = '';
  newLanguageSpokenComprehension = 3;
  newLanguageWrittenComprehension;

  constructor(private lookupTables: LookupTablesService) {}
  ngOnInit(): void {}

  increaseStat(stat: string) {
    if (!(this.deltas.has(stat))) {
      this.deltas.set(stat, 0);
    }
    this.deltas.set(stat, this.deltas.get(stat) + this.lookupTables.increment(stat));

    // Special Case: Size modifier adds discount for ST and HP costs
    if (stat === 'size') {
      this.setSizeModifierDiscount();
    }
  }
  decreaseStat(stat: string, minValue?: number) {
    if (minValue && this[stat] === minValue) {
      return;
    }
    if (!(this.deltas.has(stat))) {
      this.deltas.set(stat, 0);
    }
    this.deltas.set(stat, this.deltas.get(stat) - this.lookupTables.increment(stat));

    // Special Case: Size modifier subtracts discount for ST and HP costs
    if (stat === 'size') {
      this.setSizeModifierDiscount();
    }
  }

  setSizeModifierDiscount() {
    const sizeModifier = this.deltas.get('size');
    const effectiveSizeModifier = sizeModifier > 8 ? 8 : sizeModifier;
    const sizeModifierDiscount = effectiveSizeModifier * 0.1;
    this.activeModifiers.setModifier('st', 0, 0, sizeModifierDiscount, 'size');
    this.activeModifiers.setModifier('hp', 0, 0, sizeModifierDiscount, 'size');
  }

  moddedValue(basicValue: number, stat: string) {
    if (this.deltas.has(stat)) {
      return basicValue + this.deltas.get(stat);
    }
    return basicValue;
  }

  appearancePointTotal() {
    const total = this.lookupTables.cost('appearance' + this.appearance);
    let discount = this.universal ? -.25 : 0;
    discount += this.offTheShelfLooks ? .5 : 0;
    return Math.round(total - (total * discount));
  }

  languagePointTotal() {
    if ( this.languages.length === 0 ) {
      return 0;
    }
    let total = 0;
    for (const language of this.languages) {
      total += this.lookupTables.cost('language' + language.spokenComprehension);
    }
    return total - this.lookupTables.cost('language3'); //Reduce cost by the value of the free native language.
  }

  getLanguageCost(language: Language, native?: boolean) {
    const nativeDiscount = native ? this.lookupTables.cost('language3') : 0;
    const spokenCost = this.lookupTables.cost('language' + language.spokenComprehension)/2;
    const writtenCost = this.lookupTables.cost('language' + language.writtenComprehension)/2;
    return spokenCost + writtenCost - nativeDiscount;
  }

  getNewLanguageCost(native: boolean) {
    return this.getLanguageCost(new Language(this.newLanguageName, this.newLanguageSpokenComprehension, this.effectiveNewLanguageWrittenComprehension), native);
  }

  updateLanguageName(name: string, language?: Language) {
    if (!language) {
      this.newLanguageName = name;
    } else {
      language.name = name;
    }
  }

  updateLanguageSpokenComprehension(spokenComprehension: number, language?: Language) {
    if (!language) {
      this.newLanguageSpokenComprehension = spokenComprehension;
    } else {
      language.spokenComprehension = spokenComprehension;
    }
  }

  updateLanguageWrittenComprehension(writtenComprehension: number, language?: Language) {
    if (!language) {
      this.newLanguageWrittenComprehension = writtenComprehension;
    } else {
      language.writtenComprehension = writtenComprehension;
    }
  }

  addLanguage() {
    if (this.newLanguageName !== '' && this.newLanguageSpokenComprehension != -1) {
      const newLanguage = new Language(this.newLanguageName, this.newLanguageSpokenComprehension, this.effectiveNewLanguageWrittenComprehension);
      this.newLanguageName = '';
      this.newLanguageSpokenComprehension = 0;
      this.newLanguageWrittenComprehension = null;
      this.languages.push(newLanguage);
    }
  }

  removeLanguage(language: Language) {
    this.languages.splice(this.languages.indexOf(language), 1);
  }

  get pointTotal() {
    let pointTotal = 0;
    this.deltas.forEach((delta, stat) => {
      const cost = (delta * (this.lookupTables.cost(stat) / this.lookupTables.increment(stat)));
      const discount = this.activeModifiers.getTotalDiscount(stat, this.lookupTables.maxDiscount(stat));
      pointTotal += Math.round(cost - (cost * discount));
    });
    pointTotal += this.lookupTables.cost('build' + this.build);
    pointTotal += this.appearancePointTotal();
    pointTotal += this.languagePointTotal();
    return pointTotal;
  }

  get personalTechLevel() {
    return this.moddedValue(0, 'personalTechLevel');
  }

  get effectiveNewLanguageWrittenComprehension() {
    return this.newLanguageWrittenComprehension ? this.newLanguageWrittenComprehension : this.newLanguageSpokenComprehension;
  }

  get st() {
    return this.moddedValue(10, 'st');
  }
  get dx() {
    return this.moddedValue(10, 'dx');
  }
  get iq() {
    return this.moddedValue(10, 'iq');
  }
  get ht() {
    return this.moddedValue(10, 'ht');
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

  get basicSpeed() {
    return this.moddedValue((this.ht + this.dx) / 4, 'basicSpeed');
  }

  get basicMove() {
    return this.moddedValue(Math.floor(this.basicSpeed), 'basicMove');
  }

  get hp() {
    return this.moddedValue(this.st, 'hp');
  }

  get will() {
    return this.moddedValue(this.iq, 'will');
  }

  get per() {
    return this.moddedValue(this.iq, 'per');
  }

  get fp() {
    return this.moddedValue(this.ht, 'fp');
  }

  get size() {
    const sizeModifier = this.moddedValue(0, 'size');
    if (sizeModifier > 0) {
      return '+' + sizeModifier;
    }
    return sizeModifier;
  }

  get dodge() {
    return Math.floor(this.basicSpeed + 3);
  }

  get enc1BasicLift() {
    return this.basicLift * 2;
  }
  get enc1BasicMove() {
    return Math.floor(this.basicMove * 0.8);
  }
  get enc1Dodge() {
    return this.dodge - 1;
  }

  get enc2BasicLift() {
    return this.basicLift * 3;
  }
  get enc2BasicMove() {
    return Math.floor(this.basicMove * 0.6);
  }
  get enc2Dodge() {
    return this.dodge - 2;
  }

  get enc3BasicLift() {
    return this.basicLift * 6;
  }
  get enc3BasicMove() {
    return Math.floor(this.basicMove * 0.4);
  }
  get enc3Dodge() {
    return this.dodge - 3;
  }

  get enc4BasicLift() {
    return this.basicLift * 10;
  }
  get enc4BasicMove() {
    return Math.floor(this.basicMove * 0.2);
  }
  get enc4Dodge() {
    return this.dodge - 4;
  }

  get unspentPoints() {
    return this.STARTING_POINTS - this.pointTotal;
  }
}

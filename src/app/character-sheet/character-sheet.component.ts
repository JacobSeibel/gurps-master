import { Component, OnInit } from '@angular/core';
import { LookupTablesService } from '../lookup-tables.service';
import { ModifierGroup } from '../classes/Modifier';
import { Language } from '../classes/Language';
import { Reputation } from '../classes/Reputation';
import { Rank } from '../classes/Rank';
import { Character } from '../classes/Character';
import { DeltaGroup } from '../classes/DeltaGroup';
import { DeltaType } from '../enums/DeltaType';

@Component({
  selector: 'app-character-sheet',
  templateUrl: './character-sheet.component.html',
  styleUrls: ['./character-sheet.component.scss'],
})
export class CharacterSheetComponent implements OnInit {
  // TODO: Allow configuration
  STARTING_POINTS = 125;

  deltas: DeltaGroup;
  activeModifiers: ModifierGroup = new ModifierGroup();
  character: Character;

  newLanguage = new Language('', 3, undefined);
  newReputation = new Reputation('', 0, 0, '', 0, false);
  newRank = new Rank('', 0, '', false);

  constructor(private lookupTables: LookupTablesService) {
    this.character = new Character(lookupTables, this.STARTING_POINTS);
    this.deltas = new DeltaGroup(this.character, lookupTables);
  }
  ngOnInit(): void {}

  increaseSize() {
    this.deltas.increaseValue('size');
    this.setSizeModifierDiscount();
  }

  decreaseSize() {
    this.deltas.decreaseValue('size');
    this.setSizeModifierDiscount();
  }

  setSizeModifierDiscount() {
    const sizeModifier = this.deltas.moddedValue('size');
    const effectiveSizeModifier = sizeModifier > 8 ? 8 : sizeModifier;
    const sizeModifierDiscount = effectiveSizeModifier * 0.1;
    this.activeModifiers.setModifier('st', 0, 0, sizeModifierDiscount, 'size');
    this.activeModifiers.setModifier('hp', 0, 0, sizeModifierDiscount, 'size');
  }

  changeAppearanceValue(attribute: string, newValue: number | boolean) {
    if (typeof(newValue) === 'number') {
      this.deltas.changeEnum(attribute, newValue);
    } else {
      this.deltas.changeBoolean(attribute, newValue);
    }
    const appearanceDelta = this.deltas.getOrCreate('appearance', DeltaType.Enum);
    if (!appearanceDelta.customCostFunction) {
      appearanceDelta.customCostFunction = 
        () => {
          const total = this.lookupTables.cost('appearance', this.deltas.moddedValue('appearance'));
          let discount = this.deltas.moddedValue('universal') ? -.25 : 0;
          discount += this.deltas.moddedValue('offTheShelfLooks') ? .5 : 0;
          return Math.round(total - (total * discount));
        }
    }
  }

  languagePointTotal(newLanguage?: Language) {
    let total = 0;
    let freeNative = true;
    for (const language of this.character.languages) {
      total += this.getLanguageCost(language, freeNative);
      freeNative = false;
    }
    if (newLanguage) {
        total += this.getLanguageCost(newLanguage, freeNative);
    }
    return total;
  }

  getLanguageCost(language: Language, freeNative?: boolean) {
    const nativeDiscount = freeNative ? this.lookupTables.cost('language', 3) : 0;
    const spokenCost = this.lookupTables.cost('language', language.spokenComprehension)/2;
    const writtenCost = this.lookupTables.cost('language', language.effectiveWrittenComprehension)/2;
    return spokenCost + writtenCost - nativeDiscount;
  }

  getReputationCost(reputation: Reputation) {
    if ( reputation.free ) 
      return 0;

    let cost = this.lookupTables.cost('repReaction') * reputation.reaction;
    cost = this.lookupTables.cost('repScope', reputation.scope) * cost;
    cost = this.lookupTables.cost('repFrequency', reputation.frequency) * cost;
    cost = Math.floor(cost);
    return cost;
  }

  reputationPointTotal(newReputation?: Reputation) {
    let total = newReputation ? this.getReputationCost(newReputation) : 0;
    for (const reputation of this.character.reputations) {
      total += this.getReputationCost(reputation);
    }
    return total;
  }

  getStatusCost() {
    return this.character.rankReplacesStatus ? 0 : this.lookupTables.cost('status') * this.character.status;
  }

  getRankCost(rank: Rank) {
    const key = rank.replacesStatus ? 'rankReplacesStatus' : 'rank';
    return this.lookupTables.cost(key) * rank.rank;
  }

  rankPointTotal(newRank?: Rank) {
    let total = newRank ? this.getRankCost(newRank) : 0;
    for (const rank of this.character.ranks) {
      total += this.getRankCost(rank);
    }
    return total;
  }
  
  addRank() {
    if (this.newRank.organization) {
      this.character.ranks.push(this.newRank);
      this.newRank = Rank.BLANK;
    }
  }
  
  removeRank(rank: Rank) {
    this.character.ranks.splice(this.character.ranks.indexOf(rank), 1);
  }
  
  addReputation() {
    if (this.newReputation.description !== '' && (this.newReputation.scope == 0 || this.newReputation.group !== '')) {
      this.character.reputations.push(this.newReputation);
      this.newReputation = Reputation.BLANK;
    }
  }
  
  removeReputation(reputation: Reputation) {
    this.character.reputations.splice(this.character.reputations.indexOf(reputation), 1);
  }
  
  increaseReputationReaction(reputation?: Reputation) {
    let reaction = reputation ? reputation.reaction : this.newReputation.reaction;
    if (reaction < 4) {
      reaction++;
      if (reputation) {
        reputation.reaction = reaction;
      } else {
        this.newReputation.reaction = reaction;
      }
    }
  }
  
  decreaseReputationReaction(reputation?: Reputation) {
    let reaction = reputation ? reputation.reaction : this.newReputation.reaction;
    if (reaction > -4) {
      reaction--;
      if (reputation) {
        reputation.reaction = reaction;
      } else {
        this.newReputation.reaction = reaction;
      }
    }
  }
  
  updateLanguageName(name: string, language?: Language) {
    if (!language) {
      this.newLanguage.name = name;
    } else {
      language.name = name;
    }
  }
  
  updateLanguageSpokenComprehension(spokenComprehension: number, language?: Language) {
    if (!language) {
      this.newLanguage.spokenComprehension = spokenComprehension;
    } else {
      language.spokenComprehension = spokenComprehension;
    }
  }
  
  updateLanguageWrittenComprehension(writtenComprehension: number, language?: Language) {
    if (!language) {
      this.newLanguage.writtenComprehension = writtenComprehension;
    } else {
      language.writtenComprehension = writtenComprehension;
    }
  }
  
  addLanguage() {
    if (this.newLanguage.name !== '' && (this.newLanguage.spokenComprehension != 0 || this.newLanguage.effectiveWrittenComprehension != 0)) {
      this.character.languages.push(this.newLanguage);
      this.newLanguage = new Language('', 0, null);
    }
  }
  
  removeLanguage(language: Language) {
    this.character.languages.splice(this.character.languages.indexOf(language), 1);
  }

  changeWealth(value: number) {
    this.deltas.changeEnum('wealth', value);
    this.accountForMultimillionaireLevel();
  }
  
  increaseMultimillionaireLevel() {
    this.deltas.increaseValue('multimillionaireLevel');
    this.accountForMultimillionaireLevel();
  }
  
  decreaseMultimillionaireLevel() {
    this.deltas.decreaseValue('multimillionaireLevel', 1);
    this.accountForMultimillionaireLevel();
  }

  accountForMultimillionaireLevel() {
    const wealthDelta = this.deltas.getOrCreate('wealth', DeltaType.Enum);
    if (!wealthDelta.customCostFunction) {
      wealthDelta.customCostFunction = () => {
        return this.getWealthCost();
      };
    }
  }

  getWealthCost() {
    let multimillionaireExtraCost = 0;
    let effectiveWealthLevel = this.deltas.moddedValue('wealth');
    if (this.deltas.moddedValue('wealth') == 8) {
      multimillionaireExtraCost = this.lookupTables.cost('wealth', 8) * this.deltas.moddedValue('multimillionaireLevel');
      effectiveWealthLevel = 7;
    }
    return this.lookupTables.cost('wealth', effectiveWealthLevel) + multimillionaireExtraCost;
  }

  //TODO: This should calculate pointValue + deltaPoints
  get pointValue() {
    let pointTotal = this.character.pointValue;
    pointTotal += this.deltas.cost(this.activeModifiers);
    pointTotal += this.languagePointTotal();
    pointTotal += this.reputationPointTotal();
    pointTotal += this.rankPointTotal();
    return pointTotal;
  }
  
  get name() {
    return this.deltas.moddedValue('name');
  }
  
  get player() {
    return this.deltas.moddedValue('player');
  }
  
  get availablePoints() {
    return this.character.availablePoints - this.deltas.cost(this.activeModifiers);
  }
  
  get height() {
    return this.deltas.moddedValue('height');
  }
  
  get weight() {
    return this.deltas.moddedValue('weight');
  }
  
  get appearance() {
    return this.deltas.moddedValue('appearance');
  }

  get appearanceDescription() {
    return this.deltas.moddedValue('appearanceDescription');
  }

  get build() {
    return this.deltas.moddedValue('build');
  }

  get personalTechLevel() {
    return this.deltas.moddedValue('personalTechLevel');
  }

  get st() {
    return this.deltas.moddedValue('st');
  }
  get dx() {
    return this.deltas.moddedValue('dx');
  }
  get iq() {
    return this.deltas.moddedValue('iq');
  }
  get ht() {
    return this.deltas.moddedValue('ht');
  }

  get basicSpeed() {
    return this.deltas.moddedValue('basicSpeed');
  }

  get basicMove() {
    return this.deltas.moddedValue('basicMove');
  }

  get hp() {
    return this.deltas.moddedValue('hp');
  }

  get will() {
    return this.deltas.moddedValue('will');
  }

  get per() {
    return this.deltas.moddedValue('per');
  }

  get fp() {
    return this.deltas.moddedValue('fp');
  }

  get size() {
    const sizeModifier = this.deltas.moddedValue('size');
    if (sizeModifier > 0) {
      return '+' + sizeModifier;
    }
    return sizeModifier;
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

  get effectiveStatus() {
    return this.character.effectiveStatus;
  }

  get wealth() {
    return this.deltas.moddedValue('wealth');
  }

  get multimillionaireLevel() {
    return this.deltas.moddedValue('multimillionaireLevel');
  }

  get status() {
    return this.deltas.moddedValue('status');
  }

  get languages() {
    return this.deltas.moddedValue('languages');
  }

  get reputations() {
    return this.deltas.moddedValue('reputations');
  }

  get ranks() {
    return this.deltas.moddedValue('ranks');
  }

  get rankReplacesStatus() {
    return this.deltas.moddedValue('rankReplacesStatus');
  }

  get androgynous() {
    return this.deltas.moddedValue('androgynous');
  }

  get impressive() {
    return this.deltas.moddedValue('impressive');
  }

  get universal() {
    return this.deltas.moddedValue('universal');
  }

  get offTheShelfLooks() {
    return this.deltas.moddedValue('offTheShelfLooks');
  }
}

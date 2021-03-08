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

  languagePointTotal() {
    const languages = this.deltas.moddedValue('languages');
    let total = 0;
    let freeNative = true;
    for (const language of languages) {
      total += this.getLanguageCost(language, freeNative);
      freeNative = false;
    } 
    total += this.getLanguageCost(this.newLanguage, freeNative);
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

  reputationPointTotal() {
    let total = this.getReputationCost(this.newReputation);
    for (const reputation of this.deltas.moddedValue('reputations')) {
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

  rankPointTotal() {
    let total = this.getRankCost(this.newRank);
    for (const rank of this.deltas.moddedValue('ranks')) {
      total += this.getRankCost(rank);
    }
    return total;
  }
  
  addRank() {
    if (this.newRank.organization) {
      this.deltas.pushToArray('ranks', this.newRank);
      const ranksDelta = this.deltas.getOrCreate('ranks', DeltaType.Array);
      if (!ranksDelta.customCostFunction) {
        ranksDelta.customCostFunction = 
        () => {
          return this.rankPointTotal();
        }
      }
      this.newRank = Rank.blank();
    }
  }
  
  removeRank(rank: Rank) {
    this.deltas.removeFromArray('ranks', rank);
  }

  changeRankOrganization(organization: string, rank?: Rank, index?: number) {
    if (rank) {
      rank.organization = organization;
      this.deltas.changeArray('ranks', rank, index);
    } else {
      this.newRank.organization = organization;
    }
  }

  increaseRank(rank?: Rank, index?: number) {
    this.changeRankRank(this.lookupTables.increment('rank'), rank, index);
  }

  decreaseRank(rank?: Rank, index?: number) {
    this.changeRankRank(-this.lookupTables.increment('rank'), rank, index);
  }

  changeRankRank(changeAmt: number, rank: Rank, index: number) {
    if (rank) {
      rank.rank += changeAmt;
      this.deltas.changeArray('ranks', rank, index);
    } else {
      this.newRank.rank += changeAmt;
    }
  }

  changeRankDescription(description: string, rank?: Rank, index?: number) {
    if (rank) {
      rank.description = description;
      this.deltas.changeArray('ranks', rank, index);
    } else {
      this.newRank.description = description;
    }
  }

  changeRankReplacesStatus(rank?: Rank, index?: number) {
    if (rank) {
      rank.replacesStatus = !rank.replacesStatus;
      this.deltas.changeArray('ranks', rank, index);
    } else {
      this.newRank.replacesStatus = !this.newRank.replacesStatus;
    }
  }
  
  addReputation() {
    if (this.newReputation.description !== '' && (this.newReputation.scope == 0 || this.newReputation.group !== '')) {
      this.deltas.pushToArray('reputations', this.newReputation);
      const reputationsDelta = this.deltas.getOrCreate('reputations', DeltaType.Array);
      if (!reputationsDelta.customCostFunction) {
        reputationsDelta.customCostFunction = 
          () => {
            return this.reputationPointTotal();
          }
      }
      this.newReputation = Reputation.blank();
    }
  }
  
  removeReputation(reputation: Reputation) {
    this.deltas.removeFromArray('reputations', reputation);
  }

  changeReputationDescription(description: string, reputation?: Reputation, index?: number) {
    if (reputation) {
      reputation.description = description;
      this.deltas.changeArray('reputations', reputation, index);
    } else {
      this.newReputation.description = description;
    }
  }

  changeReputationScope(scope: number, reputation?: Reputation, index?: number) {
    if (reputation) {
      reputation.scope = scope;
      this.deltas.changeArray('reputations', reputation, index);
    } else {
      this.newReputation.scope = scope;
    }
  }

  changeReputationGroup(group: string, reputation?: Reputation, index?: number) {
    if (reputation) {
      reputation.group = group;
      this.deltas.changeArray('reputations', reputation, index);
    } else {
      this.newReputation.group = group;
    }
  }

  changeReputationFrequency(frequency: number, reputation?: Reputation, index?: number) {
    if (reputation) {
      reputation.frequency = frequency;
      this.deltas.changeArray('reputations', reputation, index);
    } else {
      this.newReputation.frequency = frequency;
    }
  }

  changeReputationFree(reputation?: Reputation, index?: number) {
    if (reputation) {
      reputation.free = !reputation.free;
      this.deltas.changeArray('reputations', reputation, index);
    } else {
      this.newReputation.free = !this.newReputation.free;
    }
  }
  
  increaseReputationReaction(reputation?: Reputation, index?: number) {
    let reaction = reputation ? reputation.reaction : this.newReputation.reaction;
    if (reaction < 4) {
      this.changeReputationReaction(this.lookupTables.increment('reputation'), reputation, index);
    }
  }
  
  decreaseReputationReaction(reputation?: Reputation, index?: number) {
    let reaction = reputation ? reputation.reaction : this.newReputation.reaction;
    if (reaction > -4) {
      this.changeReputationReaction(-this.lookupTables.increment('reputation'), reputation, index);
    }
  }

  changeReputationReaction(changeAmt: number, reputation: Reputation, index: number) {
    if (reputation) {
      reputation.reaction += changeAmt;
      this.deltas.changeArray('reputations', reputation, index);
    } else {
      this.newReputation.reaction += changeAmt;
    }
  }
  
  updateLanguageName(name: string, language?: Language, index?: number) {
    if (!language) {
      this.newLanguage.name = name;
    } else {
      language.name = name;
      this.deltas.changeArray('languages', language, index);
    }
  }
  
  updateLanguageSpokenComprehension(spokenComprehension: number, language?: Language, index?: number) {
    if (!language) {
      this.newLanguage.spokenComprehension = spokenComprehension;
    } else {
      language.spokenComprehension = spokenComprehension;
      this.deltas.changeArray('languages', language, index);
    }
  }
  
  updateLanguageWrittenComprehension(writtenComprehension: number, language?: Language, index?: number) {
    if (!language) {
      this.newLanguage.writtenComprehension = writtenComprehension;
    } else {
      language.writtenComprehension = writtenComprehension;
      this.deltas.changeArray('languages', language, index);
    }
  }
  
  addLanguage() {
    if (this.newLanguage.name !== '' && (this.newLanguage.spokenComprehension != 0 || this.newLanguage.effectiveWrittenComprehension != 0)) {
      this.deltas.pushToArray('languages', this.newLanguage);
      const languagesDelta = this.deltas.getOrCreate('languages', DeltaType.Array);
      if (!languagesDelta.customCostFunction) {
        languagesDelta.customCostFunction = 
          () => {
            return this.languagePointTotal();
          }
      }
      this.newLanguage = Language.blank();
    }
  }
  
  removeLanguage(language: Language) {
    this.deltas.removeFromArray('languages', language);
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

  getLiveCost() {
    let pointTotal = this.deltas.cost(this.activeModifiers);
    if(!this.deltas.has('languages')) {
      pointTotal += this.languagePointTotal();
    }
    if(!this.deltas.has('reputations')) {
      pointTotal += this.reputationPointTotal();
    }
    if(!this.deltas.has('rank')) {
      pointTotal += this.rankPointTotal();
    }
    return pointTotal;
  }

  getEffectiveStatus() {
    return this.character.getEffectiveStatus(this.deltas.moddedValue('status'), this.moddedAndNewArray('ranks', this.newRank));
  }

  moddedAndNewArray(attribute: string, newObject: Object) {
    return this.deltas.moddedValue(attribute).concat([newObject]);
  }

  get pointValue() {
    return this.character.pointValue + this.getLiveCost();
  }
  
  get name() {
    return this.deltas.moddedValue('name');
  }
  
  get player() {
    return this.deltas.moddedValue('player');
  }
  
  get availablePoints() {
    return this.character.availablePoints - this.getLiveCost();
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
    for(const rank of this.moddedAndNewArray('ranks', this.newRank)) {
      if (rank.replacesStatus) {
        return true;
      }
    }
    return false;
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

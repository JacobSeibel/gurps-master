import { Component, OnInit } from '@angular/core';
import { LookupTablesService } from '../lookup-tables.service';
import { ModifierGroup } from '../classes/Modifier';
import { Language } from '../classes/Language';
import { Reputation } from '../classes/Reputation';
import { Rank } from '../classes/Rank';

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

  // LANGUAGE
  languages: Language[] = [];
  newLanguage = new Language('', 3, undefined);

  // WEALTH AND STATUS
  wealth: number = 3;
  multimillionaireLevel: number = 1;
  status: number = 0;

  // REPUTATION
  reputations: Reputation[] = [];
  newReputation = new Reputation('', 0, 0, '', 0, false);

  // RANK
  ranks: Rank[] = [];
  newRank = new Rank('', 0, '', false);
  rankReplacesStatus = false;

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
    const total = this.lookupTables.cost('appearance', this.appearance);
    let discount = this.universal ? -.25 : 0;
    discount += this.offTheShelfLooks ? .5 : 0;
    return Math.round(total - (total * discount));
  }

  languagePointTotal() {
    let total = 0;
    let freeNative = true;
    for (const language of this.languages) {
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
      this.languages.push(this.newLanguage);
      this.newLanguage = new Language('', 0, null);
    }
  }

  removeLanguage(language: Language) {
    this.languages.splice(this.languages.indexOf(language), 1);
  }

  increaseMultimillionaireLevel() {
    this.multimillionaireLevel++;
  }

  decreaseMultimillionaireLevel() {
    if(this.multimillionaireLevel > 1)
      this.multimillionaireLevel--;
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

  addReputation() {
    if (this.newReputation.description !== '' && (this.newReputation.scope == 0 || this.newReputation.group !== '')) {
      this.reputations.push(this.newReputation);
      this.newReputation = new Reputation('', 0, 0, '', 0, false);
    }
  }

  removeReputation(reputation: Reputation) {
    this.reputations.splice(this.reputations.indexOf(reputation), 1);
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
    for (const reputation of this.reputations) {
      total += this.getReputationCost(reputation);
    }
    return total;
  }

  getWealthCost() {
    let multimillionaireExtraCost = 0;
    let effectiveWealthLevel = this.wealth;
    if (this.wealth == 8) {
      multimillionaireExtraCost = this.lookupTables.cost('wealth', 8) * this.multimillionaireLevel;
      effectiveWealthLevel = 7;
    }
    return this.lookupTables.cost('wealth', effectiveWealthLevel) + multimillionaireExtraCost;
  }

  getStatusCost() {
    return this.rankReplacesStatus ? 0 : this.lookupTables.cost('status') * this.status;
  }

  getRankCost(rank: Rank) {
    const key = rank.replacesStatus ? 'rankReplacesStatus' : 'rank';
    return this.lookupTables.cost(key) * rank.rank;
  }

  addRank() {
    if (this.newRank.organization) {
      this.ranks.push(this.newRank);
      this.newRank = new Rank('', 0, '', false);
    }
  }

  rankPointTotal() {
    let total = this.getRankCost(this.newRank);
    for (const rank of this.ranks) {
      total += this.getRankCost(rank);
    }
    return total;
  }

  removeRank(rank: Rank) {
    this.ranks.splice(this.ranks.indexOf(rank), 1);
  }

  getStatusFromRank() {
    let statusMod = 0;
    for (const rank of this.ranks) {
      if (rank.replacesStatus) {
        return {statusMod: rank.rank, replacesStatus: true};
      }
      statusMod += this.lookupTables.rankStatus(rank.rank);
    }
    return {statusMod, replacesStatus: false};
  }

  get pointTotal() {
    let pointTotal = 0;
    this.deltas.forEach((delta, stat) => {
      const cost = (delta * (this.lookupTables.cost(stat) / this.lookupTables.increment(stat)));
      const discount = this.activeModifiers.getTotalDiscount(stat, this.lookupTables.maxDiscount(stat));
      pointTotal += Math.round(cost - (cost * discount));
    });
    pointTotal += this.lookupTables.cost('build', this.build);
    pointTotal += this.appearancePointTotal();
    pointTotal += this.languagePointTotal();
    pointTotal += this.getWealthCost();
    pointTotal += this.reputationPointTotal();
    pointTotal += this.rankPointTotal();
    return pointTotal;
  }

  get personalTechLevel() {
    return this.moddedValue(0, 'personalTechLevel');
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

  get effectiveStatus() {
    const statusFromRank = this.getStatusFromRank();
    if(statusFromRank.replacesStatus) {
      this.rankReplacesStatus = true;
      return statusFromRank.statusMod;
    } else {
      this.rankReplacesStatus = false;
    }
    return this.status + statusFromRank.statusMod;
  }
}

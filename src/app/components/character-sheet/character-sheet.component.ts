import { AfterViewChecked, Component, OnChanges, OnInit } from '@angular/core';
import { LookupTablesService } from '../../services/lookup-tables.service';
import { ModifierGroup } from '../../classes/Modifier';
import { Language } from '../../classes/Language';
import { Reputation } from '../../classes/Reputation';
import { Rank } from '../../classes/Rank';
import { Character } from '../../classes/Character';
import { DeltaGroup } from '../../classes/DeltaGroup';
import { DeltaType } from '../../enums/DeltaType';
import { CharacterService } from 'src/app/services/character.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import * as _ from 'lodash';
import { Appearance } from 'src/app/classes/Appearance';

@Component({
  selector: 'app-character-sheet',
  templateUrl: './character-sheet.component.html',
  styleUrls: ['./character-sheet.component.scss'],
})
export class CharacterSheetComponent implements OnInit {
  // TODO: Allow configuration
  STARTING_POINTS = 125;

  character: Character = new Character(this.lookupTables, this.STARTING_POINTS);
  deltas: DeltaGroup = new DeltaGroup(this.character, this.lookupTables);
  activeModifiers: ModifierGroup = new ModifierGroup();

  newLanguage = new Language('', 0, undefined);
  newReputation = new Reputation('', 0, 0, '', 0, false);
  newRank = new Rank('', 0, '', false);

  constructor(private lookupTables: LookupTablesService,
              private characterService: CharacterService,
              private route: ActivatedRoute) {
  }
  
  async ngOnInit() {
    let id: number;
    this.route.paramMap.subscribe((params: ParamMap) => {
      id = +params.get('id')
    })
    if (id) {
      this.character = await this.getCharacter(id);
      this.deltas = new DeltaGroup(this.character, this.lookupTables);
    }
  }

  async getCharacter(id: number) {
    const unhydratedCharacter = (await this.characterService.character(id)).body;
    return this.characterService.hydrateCharacter(unhydratedCharacter);
  }

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

  changeAppearanceAppearance(appearance: number) {
    let changedAppearance = _.clone(this.deltas.moddedValue('appearance'));
    changedAppearance.appearance = appearance;
    this.changeAppearance(changedAppearance);
  }

  changeAppearanceDescription(description: string) {
    let changedAppearance = _.clone(this.deltas.moddedValue('appearance'));
    changedAppearance.description = description;
    this.changeAppearance(changedAppearance);
  }

  changeAppearanceAndrogynous(androgynous: boolean) {
    let changedAppearance = _.clone(this.deltas.moddedValue('appearance'));
    changedAppearance.androgynous = androgynous;
    this.changeAppearance(changedAppearance);
  }

  changeAppearanceImpressive(impressive: boolean) {
    let changedAppearance = _.clone(this.deltas.moddedValue('appearance'));
    changedAppearance.impressive = impressive;
    this.changeAppearance(changedAppearance);
  }

  changeAppearanceUniversal(universal: boolean) {
    let changedAppearance = _.clone(this.deltas.moddedValue('appearance'));
    changedAppearance.universal = universal;
    this.changeAppearance(changedAppearance);
  }

  changeAppearanceOffTheShelfLooks(offTheShelfLooks: boolean) {
    let changedAppearance = _.clone(this.deltas.moddedValue('appearance'));
    changedAppearance.offTheShelfLooks = offTheShelfLooks;
    this.changeAppearance(changedAppearance);
  }

  changeAppearance(changedAppearance: Appearance) {
    this.deltas.changeObject('appearance', changedAppearance);
    const appearanceDelta = this.deltas.getOrCreate('appearance', DeltaType.Object);
    if (!appearanceDelta.customCostFunction) {
      appearanceDelta.customCostFunction = 
        (oldAppearance: Appearance, newAppearance: Appearance) => {
          debugger
          const total = this.lookupTables.cost('appearance', newAppearance.appearance)
                        - this.lookupTables.cost('appearance', oldAppearance.appearance);
          let discount = newAppearance.universal ? -.25 : 0;
          discount += newAppearance.offTheShelfLooks ? .5 : 0;
          return Math.round(total - (total * discount));
        }
    }
  }

  updateLanguageName(name: string, language?: Language, index?: number) {
    if (!language) {
      this.newLanguage.name = name;
    } else {
      let changedLanguage = _.clone(language);
      changedLanguage.name = name;
      this.deltas.changeArray('languages', changedLanguage, index);
      this.setLanguageCustomCost();
    }
  }
  
  updateLanguageSpokenComprehension(spokenComprehension: number, language?: Language, index?: number) {
    if (!language) {
      this.newLanguage.spokenComprehension = spokenComprehension;
    } else {
      let changedLanguage = _.clone(language);
      changedLanguage.spokenComprehension = spokenComprehension;
      this.deltas.changeArray('languages', changedLanguage, index);
      this.setLanguageCustomCost();
    }
  }
  
  updateLanguageWrittenComprehension(writtenComprehension: number, language?: Language, index?: number) {
    if (!language) {
      this.newLanguage.writtenComprehension = writtenComprehension;
    } else {
      let changedLanguage = _.clone(language);
      changedLanguage.writtenComprehension = writtenComprehension;
      this.deltas.changeArray('languages', changedLanguage, index);
      this.setLanguageCustomCost();
    }
  }
  
  addLanguage() {
    if (this.newLanguage.name !== '' && (this.newLanguage.spokenComprehension != 0 || this.newLanguage.effectiveWrittenComprehension != 0)) {
      this.deltas.pushToArray('languages', this.newLanguage);
      this.setLanguageCustomCost();
      this.newLanguage = Language.blank();
    }
  }
  
  removeLanguage(language: Language) {
    this.deltas.removeFromArray('languages', language);
    this.setLanguageCustomCost();
  }

  getLanguageCost(language: Language, freeNative?: boolean) {
    const nativeDiscount = freeNative ? this.lookupTables.cost('language', 3) : 0;
    const spokenCost = this.lookupTables.cost('language', language.spokenComprehension)/2;
    const writtenCost = this.lookupTables.cost('language', language.effectiveWrittenComprehension)/2;
    return spokenCost + writtenCost - nativeDiscount;
  }

  setLanguageCustomCost() {
    const languagesDelta = this.deltas.getOrCreate('languages', DeltaType.Array);
    if (!languagesDelta.customCostFunction) {
      languagesDelta.customCostFunction = 
        (language: Language) => {
          return this.getLanguageCost(language);
        }
    }
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

  getStatusCost() {
    return this.deltas.moddedValue('rankReplacesStatus') ? 0 : this.lookupTables.cost('status') * this.deltas.moddedValue('status');
  }

  getRankCost(rank: Rank) {
    const key = rank.replacesStatus ? 'rankReplacesStatus' : 'rank';
    return this.lookupTables.cost(key) * rank.rank;
  }
  
  addRank() {
    if (this.newRank.organization) {
      this.deltas.pushToArray('ranks', this.newRank);
      this.setRankCustomCost();
      this.newRank = Rank.blank();
    }
  }
  
  removeRank(rank: Rank) {
    this.deltas.removeFromArray('ranks', rank);
    this.setRankCustomCost();
  }

  changeRankOrganization(organization: string, rank?: Rank, index?: number) {
    if (rank) {
      let changedRank = _.clone(rank);
      changedRank.organization = organization;
      this.deltas.changeArray('ranks', changedRank, index);
      this.setRankCustomCost();
    } else {
      this.newRank.organization = organization;
    }
  }

  increaseRank(rank?: Rank, index?: number) {
    this.changeRankRank(this.lookupTables.increment('rank'), rank, index);
    this.setRankCustomCost();
  }

  decreaseRank(rank?: Rank, index?: number) {
    this.changeRankRank(-this.lookupTables.increment('rank'), rank, index);
    this.setRankCustomCost();
  }

  changeRankRank(changeAmt: number, rank: Rank, index: number) {
    if (rank) {
      let changedRank = _.clone(rank);
      changedRank.rank += changeAmt;
      this.deltas.changeArray('ranks', changedRank, index);
      this.setRankCustomCost();
    } else {
      this.newRank.rank += changeAmt;
    }
  }

  changeRankDescription(description: string, rank?: Rank, index?: number) {
    if (rank) {
      let changedRank = _.clone(rank);
      changedRank.description = description;
      this.deltas.changeArray('ranks', changedRank, index);
      this.setRankCustomCost();
    } else {
      this.newRank.description = description;
    }
  }

  changeRankReplacesStatus(rank?: Rank, index?: number) {
    if (rank) {
      let changedRank = _.clone(rank);
      changedRank.replacesStatus = !changedRank.replacesStatus;
      this.deltas.changeArray('ranks', changedRank, index);
      this.setRankCustomCost();
    } else {
      this.newRank.replacesStatus = !this.newRank.replacesStatus;
    }
  }

  setRankCustomCost() {
    const ranksDelta = this.deltas.getOrCreate('ranks', DeltaType.Array);
    if (!ranksDelta.customCostFunction) {
      ranksDelta.customCostFunction = 
      (rank: Rank) => {
        return this.getRankCost(rank);
      }
    }
  }
  
  addReputation() {
    if (this.newReputation.description !== '' && (this.newReputation.scope == 0 || this.newReputation.group !== '')) {
      this.deltas.pushToArray('reputations', this.newReputation);
      this.setReputationCustomCost();
      this.newReputation = Reputation.blank();
    }
  }
  
  removeReputation(reputation: Reputation) {
    this.deltas.removeFromArray('reputations', reputation);
    this.setReputationCustomCost();
  }

  changeReputationDescription(description: string, reputation?: Reputation, index?: number) {
    if (reputation) {
      let changedReputation = _.clone(reputation);
      changedReputation.description = description;
      this.deltas.changeArray('reputations', changedReputation, index);
      this.setReputationCustomCost();
    } else {
      this.newReputation.description = description;
    }
  }

  changeReputationScope(scope: number, reputation?: Reputation, index?: number) {
    if (reputation) {
      let changedReputation = _.clone(reputation);
      changedReputation.scope = scope;
      this.deltas.changeArray('reputations', changedReputation, index);
      this.setReputationCustomCost();
    } else {
      this.newReputation.scope = scope;
    }
  }

  changeReputationGroup(group: string, reputation?: Reputation, index?: number) {
    if (reputation) {
      let changedReputation = _.clone(reputation);
      changedReputation.group = group;
      this.deltas.changeArray('reputations', changedReputation, index);
      this.setReputationCustomCost();
    } else {
      this.newReputation.group = group;
    }
  }

  changeReputationFrequency(frequency: number, reputation?: Reputation, index?: number) {
    if (reputation) {
      let changedReputation = _.clone(reputation);
      changedReputation.frequency = frequency;
      this.deltas.changeArray('reputations', changedReputation, index);
      this.setReputationCustomCost();
    } else {
      this.newReputation.frequency = frequency;
    }
  }

  changeReputationFree(reputation?: Reputation, index?: number) {
    if (reputation) {
      let changedReputation = _.clone(reputation);
      changedReputation.free = !reputation.free;
      this.deltas.changeArray('reputations', changedReputation, index);
      this.setReputationCustomCost();
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
      let changedReputation = _.clone(reputation);
      changedReputation.reaction += changeAmt;
      this.deltas.changeArray('reputations', changedReputation, index);
      this.setReputationCustomCost();
    } else {
      this.newReputation.reaction += changeAmt;
    }
  }

  setReputationCustomCost() {
    const reputationsDelta = this.deltas.getOrCreate('reputations', DeltaType.Array);
    if (!reputationsDelta.customCostFunction) {
      reputationsDelta.customCostFunction = 
        (reputation: Reputation) => {
          return this.getReputationCost(reputation);
        }
    }
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
    pointTotal += this.getRankCost(this.newRank);
    pointTotal += this.getReputationCost(this.newReputation);
    // Since we are calculating total cost, it doesn't matter that the free native language discount is
    // applied to the exact right Language, and passing that info into the custom cost function is hairy.
    // Therefore, if there is only a new language, we'll just flat reduce total by the native discount
    const onlyNewLanguage = this.deltas.moddedValue('languages').length == 0;
    pointTotal += this.getLanguageCost(this.newLanguage, onlyNewLanguage);
    return pointTotal;
  }

  getEffectiveStatus() {
    return Character.getEffectiveStatus(
      this.deltas.moddedValue('status'),
      this.moddedAndNewArray('ranks', this.newRank),
      this.lookupTables);
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
    return this.deltas.moddedValue('appearance').appearance;
  }

  get appearanceDescription() {
    return this.deltas.moddedValue('appearance').description;
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
    return this.deltas.moddedValue('hp') + this.deltas.valueChange('st');
  }

  get will() {
    return this.deltas.moddedValue('will') + this.deltas.valueChange('iq');
  }

  get per() {
    return this.deltas.moddedValue('per') + this.deltas.valueChange('iq');
  }

  get fp() {
    return this.deltas.moddedValue('fp') + this.deltas.valueChange('ht');
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
    return this.deltas.moddedValue('languages') as Language[];
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
    return this.deltas.moddedValue('appearance').androgynous;
  }

  get impressive() {
    return this.deltas.moddedValue('appearance').impressive;
  }

  get universal() {
    return this.deltas.moddedValue('appearance').universal;
  }

  get offTheShelfLooks() {
    return this.deltas.moddedValue('appearance').offTheShelfLooks;
  }
}

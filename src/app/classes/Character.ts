import { LookupTablesService } from "../lookup-tables.service";
import { Language } from "./Language";
import { Rank } from "./Rank";
import { Reputation } from "./Reputation";

export class Character {
  pointValue = 0;
  availablePoints = 0;

  // DESCRIPTORS
  name = '';
  player = '';
  height = '';
  weight = '';
  appearanceDescription = '';
  appearance = 5;
  build = 1;
  size = 0;

  // ATTRIBUTES
  st = 10;
  dx = 10;
  iq = 10;
  ht = 10;

  // SECONDARY ATTRIBUTES
  basicSpeed = (this.ht + this.dx) / 4;
  basicMove = Math.floor(this.basicSpeed);
  hp = this.st;
  will = this.iq;
  per = this.iq;
  fp = this.ht;

  // APPEARANCE CHECKBOXES
  androgynous = false;
  impressive = false;
  universal = false;
  offTheShelfLooks = false;

  // LANGUAGE
  languages: Language[] = [];

  // WEALTH AND STATUS
  wealth: number = 3;
  multimillionaireLevel: number = 1;
  status: number = 0;

  // REPUTATION
  reputations: Reputation[] = [];

  // RANK
  ranks: Rank[] = [];

  // MISC
  personalTechLevel = 0;


  constructor(private lookupTables: LookupTablesService, availablePoints: number) {
    this.availablePoints = availablePoints;
  }
  
  getStatusFromRank(moddedRanks?: Rank[]) {
    let statusMod = 0;
    const ranks = moddedRanks ? moddedRanks : this.ranks;
    for (const rank of ranks) {
      if (rank.replacesStatus) {
        return {statusMod: rank.rank, replacesStatus: true};
      }
      statusMod += this.lookupTables.rankStatus(rank.rank);
    }
    return {statusMod, replacesStatus: false};
  }

  getEffectiveStatus(moddedStatus?: number, moddedRanks?: Rank[]) {
    const status = moddedStatus ? moddedStatus : this.status;
    const statusFromRank = this.getStatusFromRank(moddedRanks);
    if(statusFromRank.replacesStatus) {
      return statusFromRank.statusMod;
    }
    return status + statusFromRank.statusMod;
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

  get rankReplacesStatus() {
    for(const rank of this.ranks) {
      if (rank.replacesStatus) {
        return true;
      }
    }
    return false;
  }
}
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LookupTablesService {
  private COST_TABLE = {
    st: 10,
    dx: 20,
    iq: 20,
    ht: 10,
    hp: 2,
    will: 5,
    per: 5,
    fp: 3,
    basicSpeed: 5,
    basicMove: 5,
    size: 0,
    build0: -5,
    build1: 0,
    build2: -1,
    build3: -3,
    build4: -5,
    appearance0: -24,
    appearance1: -20,
    appearance2: -16,
    appearance3: -8,
    appearance4: -4,
    appearance5: 0,
    appearance6: 4,
    appearance7: 8,
    appearance8: 16,
    appearance9: 20,
    personalTechLevel: 5,
    language0: 0,
    language1: 2,
    language2: 4,
    language3: 6,
    wealth0: -25,
    wealth1: -15,
    wealth2: -10,
    wealth3: 0,
    wealth4: 10,
    wealth5: 20,
    wealth6: 30,
    wealth7: 50,
    wealth8: 25, //Multimillionaire is 25 points per level
    repReaction: 5,
    repScope0: 1,
    repScope1: .666,
    repScope2: .5,
    repScope3: .333,
    repFrequency0: 1,
    repFrequency1: .5,
    repFrequency2: .333,
    status: 5,
  };

  private INCREMENT_TABLE = {
    basicSpeed: .25
  };

  private MAX_DISCOUNT_TABLE = {
    st: .8
  }

  private DAMAGE_TABLE = {
    1: { thr: '1d-6', sw: '1d-5' },
    3: { thr: '1d-5', sw: '1d-4' },
    5: { thr: '1d-4', sw: '1d-3' },
    7: { thr: '1d-3', sw: '1d-2' },
    9: { thr: '1d-2', sw: '1d-1' },
    10: { thr: '1d-2', sw: '1d' },
    11: { thr: '1d-1', sw: '1d+1' },
    12: { thr: '1d-1', sw: '1d+2' },
    13: { thr: '1d', sw: '2d-1' },
    14: { thr: '1d', sw: '2d' },
    15: { thr: '1d+1', sw: '2d+1' },
    16: { thr: '1d+1', sw: '2d+2' },
    17: { thr: '1d+2', sw: '3d-1' },
    18: { thr: '1d+2', sw: '3d' },
    19: { thr: '2d-1', sw: '3d+1' },
    20: { thr: '2d-1', sw: '3d+2' },
    21: { thr: '2d', sw: '4d-1' },
    22: { thr: '2d', sw: '4d' },
    23: { thr: '2d+1', sw: '4d+1' },
    24: { thr: '2d+1', sw: '4d+2' },
    25: { thr: '2d+2', sw: '5d-1' },
    26: { thr: '2d+2', sw: '5d' },
    27: { thr: '3d-1', sw: '5d+1' },
    29: { thr: '3d', sw: '5d+2' },
    31: { thr: '3d+1', sw: '6d-1' },
    33: { thr: '3d+2', sw: '6d' },
    35: { thr: '4d-1', sw: '6d+1' },
    37: { thr: '4d', sw: '6d+2' },
    39: { thr: '4d+1', sw: '7d-1' },
    45: { thr: '5d', sw: '7d+1' },
    50: { thr: '5d+2', sw: '8d-1' },
    55: { thr: '6d', sw: '8d+1' },
    60: { thr: '7d-1', sw: '9d' },
    65: { thr: '7d+1', sw: '9d+2' },
    70: { thr: '8d', sw: '10d' },
    75: { thr: '8d+2', sw: '10d+2' },
    80: { thr: '8d', sw: '11d' },
    85: { thr: '9d+2', sw: '11d+2' },
    90: { thr: '10d', sw: '12d' },
    95: { thr: '10d+2', sw: '12d+2' },
    100: { thr: '11d', sw: '13d' },
  };
  constructor() {}

  cost(stat: string): number {
    return this.COST_TABLE[stat];
  }

  increment(stat: string) {
    return (stat in this.INCREMENT_TABLE) ? this.INCREMENT_TABLE[stat] : 1;
  }

  maxDiscount(stat: string) {
    return (stat in this.MAX_DISCOUNT_TABLE) ? this.MAX_DISCOUNT_TABLE[stat] : 1;
  }

  private damage(st: number) {
    if (st < 1) {
      console.error('st cannot be less than 1.');
      return;
    }
    if (st >= 110) {
      const addlDice = (st - (st % 10) - 100) / 10;
      return { thr: 11 + addlDice + 'd', sw: 13 + addlDice + 'd' };
    }

    let key = st;
    while (!(key in this.DAMAGE_TABLE)) {
      key--;
    }
    return this.DAMAGE_TABLE[key];
  }

  thrustDamage(st: number) {
    return this.damage(st).thr;
  }

  swingDamage(st: number) {
    return this.damage(st).sw;
  }
}

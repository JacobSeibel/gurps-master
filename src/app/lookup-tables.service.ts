import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LookupTablesService {
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

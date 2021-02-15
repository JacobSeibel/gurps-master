

export class Modifier {
  stat: string;
  actualMod: number;
  effectiveMod: number;
  discount: number;
  source: string;

  constructor(stat: string, actualMod: number, effectiveMod: number, discount: number, source: string) {
    this.stat = stat;
    this.actualMod = actualMod;
    this.effectiveMod = effectiveMod;
    this.discount = discount;
    this.source = source;
  }
}

export class ModifierGroup {
  private modifiers: Modifier[];

  constructor() {
    this.modifiers = [];
  }

  /**
   * Returns an array of modifiers for a given statistic.
   * @param stat string | The statistic to look up all modifiers for
   */
  getModifiers(stat: string) {
    return this.modifiers.filter((modifier) => modifier.stat === stat);
  }

  setModifier(stat: string, actualMod: number, effectiveMod: number, discount: number, source: string) {
    const existing = this.modifiers.find((modifier) => {
      return modifier.stat === stat && modifier.source === source;
    });
    if (existing) {
      existing.effectiveMod = effectiveMod;
      existing.actualMod = actualMod;
      existing.discount = discount;
    } else {
      this.modifiers.push(new Modifier(stat, actualMod, effectiveMod, discount, source));
    }
  }

  /**
   * Returns the total modifier for a given statistic. The modifier is the sum of all
   * modifiers associated with the provided statistic.
   * @param stat string | The statistic to look up the total modifier for.
   */
  getTotalModifier(stat: string) {
    const statModifiers = this.modifiers.filter(
      (modifier) => modifier.stat === stat
    );
    let totalModifier = 0;
    statModifiers.forEach((mod) => (totalModifier += mod.effectiveMod));
    return totalModifier;
  }

  /**
   * Returns the total discount to character point costs for a given statistic. The discount is
   * represented as a value between 0-1, and is expected to be applied by subtracting cost * discount
   * from the total cost.
   * @param stat string | The statistic to look up the discount for.
   * @param maxDiscount number | The highest allowed discount, represented as a value between 0-1.
   */
  getTotalDiscount(stat: string, maxDiscount: number) {
    const statModifiers = this.modifiers.filter(
      (modifier) => modifier.stat === stat
    );
    let totalDiscount = 0;
    statModifiers.forEach((mod) => (totalDiscount += mod.discount));
    return totalDiscount > maxDiscount ? maxDiscount : totalDiscount;
  }
}

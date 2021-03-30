export class Appearance {
    id: number;
    appearance: number;
    description: string;
    androgynous: boolean;
    impressive: boolean;
    universal: boolean;
    offTheShelfLooks: boolean;
  
    constructor(appearance: number, description: string, androgynous: boolean, impressive: boolean, universal: boolean, offTheShelfLooks: boolean) {
      this.appearance = appearance;
      this.description = description;
      this.androgynous = androgynous;
      this.impressive = impressive;
      this.universal = universal;
      this.offTheShelfLooks = offTheShelfLooks;
    }
  
    static blank() {
      return new Appearance(5, '', false, false, false, false);
    }
  }
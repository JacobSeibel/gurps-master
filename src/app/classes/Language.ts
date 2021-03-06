export class Language {
  id: number;
  name: string;
  spokenComprehension: number;
  writtenComprehension: number;

  constructor(name: string, spokenComprehension: number, writtenComprehension?: number) {
    this.name = name;
    this.spokenComprehension = spokenComprehension;
    this.writtenComprehension = writtenComprehension ? writtenComprehension : spokenComprehension;
  }

  get effectiveWrittenComprehension() {
    return this.writtenComprehension ? this.writtenComprehension : this.spokenComprehension;
  }

  static blank() {
    return new Language('', 0, null);
  }
}
export class Language {
  name: string;
  spokenComprehension: number;
  writtenComprehension: number;

  constructor(name: string, spokenComprehension: number, writtenComprehension?: number) {
    this.name = name;
    this.spokenComprehension = spokenComprehension;
    this.writtenComprehension = writtenComprehension ? writtenComprehension : spokenComprehension;
  }
}
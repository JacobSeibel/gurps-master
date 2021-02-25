export class Reputation {
    description: string;
    reaction: number;
    scope: number;
    group: string;
    frequency: number;
    free: boolean;
  
    constructor(description: string, reaction: number, scope: number, group: string, frequency: number, free: boolean) {
      this.description = description;
      this.reaction = reaction;
      this.scope = scope;
      this.group = group;
      this.frequency = frequency;
      this.free = free;
    }
  }
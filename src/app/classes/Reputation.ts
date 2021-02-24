export class Reputation {
    description: string;
    reaction: number;
    scope: number;
    group: string;
    free: boolean;
  
    constructor(description: string, reaction: number, scope: number, group: string, free: boolean) {
      this.description = description;
      this.reaction = reaction;
      this.scope = scope;
      this.group = group;
      this.free = free;
    }
  }
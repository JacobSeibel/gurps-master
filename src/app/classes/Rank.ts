export class Rank {
    organization: string;
    rank: number;
    description: string;
  
    constructor(organization: string, rank: number, description: string) {
      this.organization = organization;
      this.rank = rank;
      this.description = description;
    }
  }
export class Rank {
    organization: string;
    rank: number;
    description: string;
    replacesStatus: boolean;
  
    constructor(organization: string, rank: number, description: string, replacesStatus: boolean) {
      this.organization = organization;
      this.rank = rank;
      this.description = description;
      this.replacesStatus = replacesStatus;
    }

    copy() {
      return new Rank(this.organization, this.rank, this.description, this.replacesStatus);
    }
  }
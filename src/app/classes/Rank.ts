export class Rank {
  id: number;
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

  static blank() {
    return new Rank('', 0, '', false);
  }
}
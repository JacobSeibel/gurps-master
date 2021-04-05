import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Character } from '../classes/Character';
import { LookupTablesService } from './lookup-tables.service';
import { Language } from '../classes/Language';
import { Reputation } from '../classes/Reputation';
import { Rank } from '../classes/Rank';
import { Appearance } from '../classes/Appearance';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CharacterService {

  constructor(private http: HttpClient, private lookupTablesService: LookupTablesService) { }

  characters(): Promise<HttpResponse<{characters: Character[]}>> {
    return this.http.get<{characters: Character[]}>(
      environment.apiUrl + "character",
      {observe: 'response'}).toPromise();
  }

  character(id: number): Promise<HttpResponse<Character>> {
    return this.http.get<Character>(
      environment.apiUrl + `character/${id}`,
      {observe: 'response'}).toPromise();
  }

  update(character: Character): Promise<HttpResponse<Character>> {
    return this.http.put<Character>(
      environment.apiUrl + "character",
      character,
      {observe: 'response'}
    ).toPromise();
  }

  hydrateCharacters(characters: Character[]) {
    const hydratedCharacters = [];
    for (const character of characters) {
      hydratedCharacters.push(this.hydrateCharacter(character));
    }
    return hydratedCharacters;
  }

  hydrateCharacter(character: Character) {
    let hydratedCharacter = new Character(this.lookupTablesService, character.availablePoints);
    for (let key of Object.keys(character)) {
      let value = character[key];
      if (key === 'appearance') {
        value = new Appearance(
          character[key].appearance,
          character[key].description,
          character[key].androgynous,
          character[key].impressive,
          character[key].universal,
          character[key].offTheShelfLooks
        );
        value.id = character[key].id;
      }
      if (key === 'languages') {
        value = [];
        let incomingLanguages = character[key];
        for (let incomingLanguage of incomingLanguages) {
          let newLang = new Language(
            incomingLanguage.name,
            incomingLanguage.spokenComprehension,
            incomingLanguage.writtenComprehension
          );
          newLang.id = incomingLanguage.id;
          value.push(newLang);
        }
      } else if (key === 'reputations') {
        value = [];
        let incomingReputations = character[key];
        for (let incomingReputation of incomingReputations) {
          let newRep = new Reputation(
            incomingReputation.description,
            incomingReputation.reaction,
            incomingReputation.scope,
            incomingReputation.group,
            incomingReputation.frequency,
            incomingReputation.free
          );
          newRep.id = incomingReputation.id;
          value.push(newRep);
        }
      } else if (key === 'ranks') {
        value = [];
        let incomingRanks = character[key];
        for (let incomingRank of incomingRanks) {
          let newRank = new Rank(
            incomingRank.organization,
            incomingRank.rank,
            incomingRank.description,
            incomingRank.replacesStatus
          );
          newRank.id = incomingRank.id;
          value.push(newRank);
        }
      }
      hydratedCharacter[key] = value;
    }
    return hydratedCharacter;
  }
}

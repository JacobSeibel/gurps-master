import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Character } from '../classes/Character';
import { LookupTablesService } from './lookup-tables.service';
import { Language } from '../classes/Language';

@Injectable({
  providedIn: 'root'
})
export class CharacterService {

  constructor(private http: HttpClient, private lookupTablesService: LookupTablesService) { }

  characters(): Promise<HttpResponse<{characters: Character[]}>> {
    return this.http.get<{characters: Character[]}>(
      "http://127.0.0.1:5000/character",
      {observe: 'response'}).toPromise();
  }

  character(id: number): Promise<HttpResponse<Character>> {
    return this.http.get<Character>(
      `http://127.0.0.1:5000/character/${id}`,
      {observe: 'response'}).toPromise();
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
      if (key === 'languages') {
        value = [];
        let incomingLanguages = character[key];
        for (let incomingLanguage of incomingLanguages) {
          let newLang = new Language(
            incomingLanguage.name,
            incomingLanguage.spokenComprehension,
            incomingLanguage.writtenComprehension);
          newLang.id = incomingLanguage.id;
          value.push(newLang);
        }
      }
      hydratedCharacter[key] = value;
    }
    return hydratedCharacter;
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Character } from '../classes/Character';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CharacterService {

  constructor(private http: HttpClient) { }

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
}

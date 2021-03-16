import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Character } from '../classes/Character';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CharacterService {

  constructor(private http: HttpClient) { }

  characters(): Observable<HttpResponse<{characters: Character[]}>> {
    return this.http.get<{characters: Character[]}>(
      "http://127.0.0.1:5000/character",
      {observe: 'response'});
  }
}

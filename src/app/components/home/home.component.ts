import { Component, OnInit } from '@angular/core';
import { Character } from 'src/app/classes/Character';
import { CharacterService } from 'src/app/services/character.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  characterService: CharacterService;

  characters: Character[];
  selectedCharacter: Character;

  constructor(characterService: CharacterService) {
    this.characterService = characterService;
  }

  ngOnInit(): void {
    this.characterService.characters().subscribe((response) => {
      this.characters = response.body.characters;
    })
  }

  openCharacterSheet(): void {

  }

}

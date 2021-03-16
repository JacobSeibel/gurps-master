import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Character } from 'src/app/classes/Character';
import { CharacterService } from 'src/app/services/character.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  characters: Character[];
  selectedCharacterId: number;

  constructor(private characterService: CharacterService, private router: Router) {
    this.characterService = characterService;
  }

  async ngOnInit() {
    this.characters = (await this.characterService.characters()).body.characters;
  }

  openCharacterSheet() {
    if (this.selectedCharacterId) { 
      this.router.navigate([`/character-sheet/${this.selectedCharacterId}`]);
    }
  }

}

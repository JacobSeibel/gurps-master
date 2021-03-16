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

  ngOnInit(): void {
    this.characterService.characters().subscribe((response) => {
      this.characters = response.body.characters;
      console.log(this.characters);
    })
  }

  openCharacterSheet() {
    if (this.selectedCharacterId) { 
      this.router.navigate([`/character-sheet/${this.selectedCharacterId}`]);
    }
  }

}

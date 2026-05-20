import { Component,OnInit,ChangeDetectorRef,inject } from '@angular/core';
import { PersonaRequest } from '../../../model/api/request/persona-request';
import { PersonaResponse } from '../../../model/api/response/persona-response';
import { PersonaService } from '../../../services/persona.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';


@Component({
  selector: 'app-registrar-persona',
  imports: [ReactiveFormsModule,CommonModule,NgxPaginationModule],
  templateUrl: './registrar-persona.html',
  styleUrl: './registrar-persona.scss',
})
export class RegistrarPersona implements OnInit{
  private personaService=inject(PersonaService);
  private cdr=inject(ChangeDetectorRef);

  personaArray:PersonaResponse[]=[];
  page:number=1;

  ngOnInit(): void {
    this.getPersonas();
  }

  getPersonas():void {
    this.personaService.getPersonas().subscribe((result:PersonaResponse[])=>{
      console.log('getPersonas:',result);
      this.personaArray=result;
      this.cdr.detectChanges();
    });
  }

  editarPersona(persona: PersonaResponse):void{

  }

  eliminarPersona(persona:PersonaResponse):void {

  }
}

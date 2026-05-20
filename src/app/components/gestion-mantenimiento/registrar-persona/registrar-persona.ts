import { Component,OnInit,ChangeDetectorRef,inject } from '@angular/core';
import { PersonaRequest } from '../../../model/api/request/persona-request';
import { PersonaResponse } from '../../../model/api/response/persona-response';
import { PersonaService } from '../../../services/persona.service';
import { ReactiveFormsModule, FormControl,FormGroup,Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { SexoService } from '../../../services/sexo.service';
import { Sexo } from '../../../model/sexo';
import { TipoDocumentoService } from '../../../services/tipo-documento.service';
import { TipoDocumento } from '../../../model/tipo-documento';
import { UbigeoService } from '../../../services/ubigeo.service';
import { Ubigeo } from '../../../model/ubigeo';


@Component({
  selector: 'app-registrar-persona',
  imports: [ReactiveFormsModule,CommonModule,NgxPaginationModule],
  templateUrl: './registrar-persona.html',
  styleUrl: './registrar-persona.scss',
})
export class RegistrarPersona implements OnInit{
  private personaService=inject(PersonaService);
  private sexoService=inject(SexoService);
  private tipoDocumentoService=inject(TipoDocumentoService);
  private ubigeoService=inject(UbigeoService);
  private cdr=inject(ChangeDetectorRef);

  title='Registrar Persona';
  personaArray:PersonaResponse[]=[];
  personaRequest:PersonaRequest={} as PersonaRequest;
  sexoArray:Sexo[]=[];
  tipoDocumentoArray:TipoDocumento[]=[];
  ubigeoArray:Ubigeo[]=[];
  page:number=1;
  personaForm:FormGroup;

  constructor(){
    this.personaForm=new FormGroup({
      idPersona:new FormControl(''),
      apellidoPaterno:new FormControl('',Validators.required),
      apellidoMaterno:new FormControl('',Validators.required),
      nombres:new FormControl('',Validators.required),
      idSexo:new FormControl('',Validators.required),
      fechaNacimiento:new FormControl('',Validators.required),
      idTipoDocumento:new FormControl('',Validators.required),
      numDocumento:new FormControl('',Validators.required),
      telefono:new FormControl('',Validators.required),
      direccion:new FormControl('',Validators.required),
      idUbigeo:new FormControl('',Validators.required),
    })
  }

  ngOnInit(): void {
    this.getSexo();
    this.getTipoDocumento();
    this.getUbigeo();
    this.getPersonas();
  }

  getPersonas():void {
    this.personaService.getPersonas().subscribe((result:PersonaResponse[])=>{
      console.log('getPersonas:',result);
      this.personaArray=result;
      this.cdr.detectChanges();
    });
  }

  getSexo():void {
    this.sexoService.getSexo().subscribe((result:Sexo[])=>{
      console.log('getSexo:',result);
      this.sexoArray=result;
      this.cdr.detectChanges();
    });
  }

  setSexo(event: Event): void{
    const inputChangeValue=(event.target as HTMLInputElement).value;
    this.personaForm.controls['idSexo'].setValue(inputChangeValue)
  }

  getTipoDocumento():void {
    this.tipoDocumentoService.getTipoDocumento().subscribe((result:TipoDocumento[])=>{
      console.log('getTipoDocumento:',result);
      this.tipoDocumentoArray=result;
      this.cdr.detectChanges();
    });
  }

  setTipoDocumento(event: Event): void {
    const inputChangeValue=(event.target as HTMLInputElement).value;
    this.personaForm.controls['idTipoDocumento'].setValue(inputChangeValue)
  }

  getUbigeo():void {
    this.ubigeoService.getUbigeo().subscribe((result:Ubigeo[])=>{
      console.log('getUbigeo:',result);
      this.ubigeoArray=result;
      this.cdr.detectChanges();
    });
  }

  setUbigeo(event:Event):void{
    const inputChangeValue=(event.target as HTMLInputElement).value;
    this.personaForm.controls['idUbigeo'].setValue(inputChangeValue)
  }

  setPersonaRequest():void{
    this.personaRequest.idPersona=this.personaForm.get('idPersona')?.value;
    this.personaRequest.apellidoPaterno=this.personaForm.get('apellidoPaterno')?.value;
    this.personaRequest.apellidoMaterno=this.personaForm.get('apellidoMaterno')?.value;
    this.personaRequest.nombres=this.personaForm.get('nombres')?.value;
    this.personaRequest.idSexo=this.personaForm.get('idSexo')?.value;
    this.personaRequest.fechaNacimiento=this.personaForm.get('fechaNacimiento')?.value;
    this.personaRequest.idTipoDocumento=this.personaForm.get('idTipoDocumento')?.value;
    this.personaRequest.numDocumento=this.personaForm.get('numDocumento')?.value;
    this.personaRequest.telefono=this.personaForm.get('telefono')?.value;
    this.personaRequest.direccion=this.personaForm.get('direccion')?.value;
    this.personaRequest.idUbigeo=this.personaForm.get('idUbigeo')?.value;
  }

  registrarPersona(){
    this.setPersonaRequest();

    this.personaService.registrarPersona(this.personaRequest).subscribe((
      result:PersonaResponse)=>{
        console.log('registrarPersona:',result);
    })
  }

  editarPersona(persona: PersonaResponse):void{

  }

  eliminarPersona(persona:PersonaResponse):void {

  }
}

import { Component,OnInit,ChangeDetectorRef,inject } from '@angular/core';
import { PersonaRequest } from '../../../model/api/request/persona-request';
import { PersonaResponse } from '../../../model/api/response/persona-response';
import { PersonaService } from '../../../services/persona.service';
import { ReactiveFormsModule, FormControl, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { SexoService } from '../../../services/sexo.service';
import { Sexo } from '../../../model/sexo';
import { TipoDocumentoService } from '../../../services/tipo-documento.service';
import { TipoDocumento } from '../../../model/tipo-documento';
import { UbigeoService } from '../../../services/ubigeo.service';
import { Ubigeo } from '../../../model/ubigeo';
import Swal from 'sweetalert2';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-registrar-persona',
  imports: [ReactiveFormsModule, CommonModule, NgxPaginationModule, NgbTooltip],
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
  isEdited: boolean=false;
  minDate: string = '';
  maxDate: string = '';

  getErrorMessage(controlName: string): string {
    const control = this.personaForm.get(controlName);
    if (control?.touched || control?.dirty) {
      if (control?.hasError('required')) return 'Este campo es obligatorio';
      if (control?.hasError('ageRange')) return 'Debe tener entre 18 y 80 años';
      if (control?.hasError('sameDigits')) return 'No se permiten todos los dígitos iguales';
      if (control?.hasError('pattern')) {
        switch (controlName) {
          case 'apellidoPaterno':
          case 'apellidoMaterno':
          case 'nombres':
            return 'Solo letras mayúsculas, máx 30';
          case 'numDocumento':
            return 'Debe tener 9 dígitos numéricos';
          case 'telefono':
            return '9 dígitos (no empieza con 0)';
          default:
            return 'Formato inválido';
        }
      }
    }
    return '';
  }

  onEnterKey(event: any): void {
    event.preventDefault();
    const form = event.target.form;
    const index = Array.prototype.indexOf.call(form, event.target);
    const nextElement = form.elements[index + 1];
    if (nextElement) {
      nextElement.focus();
    }
  }

  private ageRangeValidator(min: number, max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const birthDate = new Date(control.value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= min && age <= max ? null : { ageRange: true };
    };
  }

  private noSameDigitsValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const val = control.value.toString();
      if (val.length < 2) return null;
      const allSame = val.split('').every((char: string) => char === val[0]);
      return allSame ? { sameDigits: true } : null;
    };
  }

  constructor(){
    this.personaForm=new FormGroup({
      idPersona:new FormControl(''),
      apellidoPaterno:new FormControl('',[Validators.required,Validators.pattern('^[A-Z][A-Z ]{0,29}$'),]),
      apellidoMaterno:new FormControl('',[Validators.required,Validators.pattern('^[A-Z][A-Z ]{0,29}$'),]),
      nombres:new FormControl('',[Validators.required,Validators.pattern('^[A-Z][A-Z ]{0,29}$'),]),
      idSexo:new FormControl('',Validators.required),
      fechaNacimiento:new FormControl('',[Validators.required, this.ageRangeValidator(18, 80)]),
      idTipoDocumento:new FormControl('',Validators.required),
      numDocumento:new FormControl('',[Validators.required, Validators.pattern('^[0-9]{9}$'), this.noSameDigitsValidator()]),
      telefono:new FormControl('',[Validators.required, Validators.pattern('^[0-9]{9}$'), this.noSameDigitsValidator()]),
      direccion:new FormControl('',Validators.required),
      idUbigeo:new FormControl('',Validators.required),
    })
  }

  ngOnInit(): void {
    this.isEdited=false;
    this.setFechaIni();
    this.getSexo();
    this.getTipoDocumento();
    this.getUbigeo();
    this.getPersonas();
    this.setFormValuesIni();
  }

  setFechaIni(): void {
    const today = new Date();

    // minDate: 80 años atrás desde el 1 de enero
    this.minDate = `${today.getFullYear() - 80}-01-01`;

    // maxDate: 18 años atrás desde hoy
    const max = new Date();
    max.setFullYear(today.getFullYear() - 18);
    this.maxDate = max.toISOString().split('T')[0];
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

  setFormValuesIni(){
    this.personaForm.patchValue({
      idSexo:'I',
      idTipoDocumento:1,
      idUbigeo:'150101'
    })
  }

  refreshForm(){
    this.getPersonas();
    this.personaForm.reset();
    this.isEdited=false;
    this.setFormValuesIni();
  }

  registrarPersona():void{
    this.setPersonaRequest();
    if(this.isEdited) this.actualizarPersona();
    else this.insertarPersona();

  }

  insertarPersona():void{
    Swal.fire({
      title:'Esta seguro de registrar los datos de la persona',
      showCancelButton:true,
      cancelButtonText:'No',
      confirmButtonText:'Si',
      confirmButtonColor:'#000080',
      cancelButtonColor:'#ff0000',
      focusCancel:true,
    }).then((result)=>{
      if(result.isConfirmed){
        this.personaService.registrarPersona(this.personaRequest).subscribe(
        (result:PersonaResponse)=>{
          console.log('registrarPersona:',result);
          this.refreshForm();
          Swal.fire({
            icon:'success',
            title:'registrarPersona...',
            text:'!Se registro exitosamente los datos de la persona!',
            confirmButtonColor:'#000080',
          })
        },
        (err:any)=>{
          Swal.fire({
            icon:'error',
            title:'registrarPersona...',
            text:'!Ah ocurrido un error al registrar datos de la persona!',
            confirmButtonColor:'#ff0000',
          })
        }
      )
      }

    })

  }

  actualizarPersona():void{
    console.log('actualizarPersona:',this.personaRequest);
    this.personaService.actualizarPersona(this.personaRequest).subscribe(
      (result:PersonaResponse)=>{
          console.log('actualizarPersona:',result);
          this.refreshForm();
          Swal.fire({
            icon:'success',
            title:'actualizarPersona...',
            text:'!Se actualizó exitosamente los datos de la persona!',
            confirmButtonColor:'#000080',
          })
        },
        (err:any)=>{
          Swal.fire({
            icon:'error',
            title:'actualizarPersona...',
            text:'!Ah ocurrido un error al actualizar los datos de la persona!',
            confirmButtonColor:'#ff0000',
          })
        }
    )
  }

  editarPersona(persona: PersonaResponse):void{
    Swal.fire({
      title:'Esta seguro de editar los datos de la persona',
      showCancelButton:true,
      cancelButtonText:'No',
      confirmButtonText:'Si',
      confirmButtonColor:'#000080',
      cancelButtonColor:'#ff0000',
      focusCancel:true,
    }).then((result)=>{
      if(result.isConfirmed){
        this.personaForm.patchValue({
        idPersona:persona.idPersona,
        apellidoPaterno:persona.apellidoPaterno,
        apellidoMaterno:persona.apellidoMaterno,
        nombres:persona.nombres,
        idSexo:persona?.sexo?.idSexo,
        fechaNacimiento:persona.fechaNacimiento,
        idTipoDocumento:persona?.tipoDocumento?.idTipoDocumento,
        numDocumento:persona.numDocumento,
        telefono:persona.telefono,
        direccion:persona.direccion,
        idUbigeo:persona?.ubigeo?.idUbigeo
        });
        this.isEdited=true;
      }
    })
  }

  eliminarPersona(persona:PersonaResponse):void {
    Swal.fire({
      title:'Esta seguro de eliminar los datos de la persona',
      showCancelButton:true,
      cancelButtonText:'No',
      confirmButtonText:'Si',
      confirmButtonColor:'#000080',
      cancelButtonColor:'#ff0000',
      focusCancel:true,
    }).then((result)=>{
      if(result.isConfirmed){
        const request:PersonaRequest={...this.personaRequest,idPersona:persona.idPersona}
        this.personaService.eliminarPersona(request).subscribe(
          (result:PersonaResponse)=>{
            console.log('eliminarPersona:',result);
            this.refreshForm();
            Swal.fire({
              icon:'success',
              title:'eliminarPersona...',
              text:'!Se eliminó exitosamente los datos de la persona!',
              confirmButtonColor:'#000080',
            })
          },
          (err:any)=>{
            Swal.fire({
              icon:'error',
              title:'eliminarPersona...',
              text:'!Ah ocurrido un error al eliminar los datos de la persona!',
              confirmButtonColor:'#ff0000',
            })
          }
      )
      }
    })
  }
}

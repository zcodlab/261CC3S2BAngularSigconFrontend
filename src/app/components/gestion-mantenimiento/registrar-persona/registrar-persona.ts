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
  departamentos: Ubigeo[] = [];
  provincias: Ubigeo[] = [];
  distritos: Ubigeo[] = [];
  page:number=1;
  personaForm:FormGroup;
  isEdited: boolean=false;
  minDate: string = '';
  maxDate: string = '';
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  //idUbigeo->aabbcc =150101 donde aa:codigo del departamento bb:codigo de la provincia cc:codigo del distrito
  filterProvincias(idDepartamento: string | undefined): void {
    if (idDepartamento && idDepartamento.length >= 2) {
      const prefix = idDepartamento.substring(0, 2); // aa
      this.provincias = this.ubigeoArray
        .filter(u => u.idUbigeo.startsWith(prefix) &&
                     u.idUbigeo.substring(4, 6) === '01')
        .sort((a, b) => a.provincia.localeCompare(b.provincia));
    } else {
      this.provincias = [];
    }
  }

  filterDistritos(idProvincia: string | undefined): void {
    if (idProvincia && idProvincia.length >= 4) {
      const prefix = idProvincia.substring(0, 4); // aabb
      this.distritos = this.ubigeoArray
        .filter(u => u.idUbigeo.startsWith(prefix) &&
                     u.distrito && u.distrito.trim() !== '')
        .sort((a, b) => a.distrito.localeCompare(b.distrito));
    } else {
      this.distritos = [];
    }
  }

  onDepartamentoChange(): void {
    const idDep = this.personaForm.get('idDepartamento')?.value;
    this.filterProvincias(idDep);
    this.distritos = [];
    this.personaForm.patchValue({ idProvincia: '', idDistrito: '' });
  }

  onProvinciaChange(): void {
    const idProv = this.personaForm.get('idProvincia')?.value;
    this.filterDistritos(idProv);
    this.personaForm.patchValue({ idDistrito: '' });
  }

  //para ordenar la tabla
  sortData(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applySort();
  }

  applySort(): void {
    this.personaArray.sort((a: any, b: any) => {
      let valA = this.getSortValue(a, this.sortColumn);
      let valB = this.getSortValue(b, this.sortColumn);

      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    this.cdr.detectChanges();
  }

  getSortValue(obj: any, column: string): any {
    switch (column) {
      case 'apellidoPaterno': return obj.apellidoPaterno?.toLowerCase();
      case 'apellidoMaterno': return obj.apellidoMaterno?.toLowerCase();
      case 'nombres': return obj.nombres?.toLowerCase();
      case 'sexo': return obj.sexo?.toLowerCase();
      case 'fechaNacimiento': return obj.fechaNacimiento;
      case 'tipoDocumento': return obj.tipoDocumento?.descripcion?.toLowerCase() || '';
      case 'numDocumento': return obj.numDocumento;
      case 'telefono': return obj.telefono;
      case 'direccion': return obj.direccion?.toLowerCase();
      case 'ubigeo': return (obj.ubigeo?.departamento + obj.ubigeo?.provincia + obj.ubigeo?.distrito)?.toLowerCase() || '';
      default: return '';
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.personaForm.get(controlName);
    if (control?.touched || control?.dirty) {
      if (control?.hasError('required')) return 'Este campo es obligatorio';
      if (control?.hasError('ageRange')) return 'Debe tener entre 18 y 80 años';
      if (control?.hasError('sameDigits')) return 'No se permiten todos los dígitos iguales';
      if (control?.hasError('repeatedChars')) return 'No se permiten 3 caracteres iguales seguidos';
      if (control?.hasError('maxConsecutive')) return 'No se permiten más de 4 dígitos iguales seguidos';
      if (control?.hasError('pattern')) {
        switch (controlName) {
          case 'apellidoPaterno':
          case 'apellidoMaterno':
          case 'nombres':
            return 'Solo letras mayúsculas (incluyendo Ñ y tildes), máx 30';
          case 'numDocumento':
            return '9 dígitos, sin 5 repetidos';
          case 'telefono':
            return '9 dígitos, sin 5 repetidos';
          case 'direccion':
            return 'Inicia con letra, un solo número (1-4 dígitos), símbolos: . ° -';
          default:
            return 'Formato inválido';
        }
      }
      if (control?.hasError('minlength')) return `Mínimo ${control.getError('minlength').requiredLength} caracteres`;
      if (control?.hasError('maxlength')) return `Máximo ${control.getError('maxlength').requiredLength} caracteres`;
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
      if (val.length < 7) return null;
      const allSame = val.split('').every((char: string) => char === val[0]);
      return allSame ? { sameDigits: true } : null;
    };
  }

  private maxConsecutiveSameDigitsValidator(max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const val = control.value.toString();
      const regex = new RegExp(`(.)\\1{${max},}`);
      return regex.test(val) ? { maxConsecutive: true } : null;
    };
  }

  private noRepeatedCharsValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const val = control.value.toString();
      // Detecta 3 o más caracteres idénticos consecutivos
      const hasRepeated = /(.)\1\1/.test(val);
      return hasRepeated ? { repeatedChars: true } : null;
    };
  }

  constructor(){
    this.personaForm=new FormGroup({
      idPersona:new FormControl(''),
      apellidoPaterno:new FormControl('',[Validators.required,Validators.pattern(/^[A-ZÑÁÉÍÓÚ][A-ZÑÁÉÍÓÚ ]{0,29}$/),]),
      apellidoMaterno:new FormControl('',[Validators.required,Validators.pattern(/^[A-ZÑÁÉÍÓÚ][A-ZÑÁÉÍÓÚ ]{0,29}$/),]),
      nombres:new FormControl('',[Validators.required,Validators.pattern(/^[A-ZÑÁÉÍÓÚ][A-ZÑÁÉÍÓÚ ]{0,29}$/),]),
      idSexo:new FormControl('',Validators.required),
      fechaNacimiento:new FormControl('',[Validators.required, this.ageRangeValidator(18, 80)]),
      idTipoDocumento:new FormControl('',Validators.required),
      numDocumento:new FormControl('',[Validators.required, Validators.pattern('^[0-9]{9}$'), this.noSameDigitsValidator(), this.maxConsecutiveSameDigitsValidator(4)]),
      telefono:new FormControl('',[Validators.required, Validators.pattern('^[0-9]{9}$'), this.noSameDigitsValidator(), this.maxConsecutiveSameDigitsValidator(4)]),
      direccion:new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(35),
        Validators.pattern(/^[A-ZÑÁÉÍÓÚ][A-ZÑÁÉÍÓÚ .°-]*(\d{1,4}[A-ZÑÁÉÍÓÚ .°-]*)?$/),
        this.noRepeatedCharsValidator()
      ]),
      idDepartamento:new FormControl('',Validators.required),
      idProvincia:new FormControl('',Validators.required),
      idDistrito:new FormControl('',Validators.required),
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

  getTipoDocumento():void {
    this.tipoDocumentoService.getTipoDocumento().subscribe((result:TipoDocumento[])=>{
      this.tipoDocumentoArray=result;
      this.cdr.detectChanges();
    });
  }

  getUbigeo():void {
    this.ubigeoService.getUbigeo().subscribe((result:Ubigeo[])=>{
      this.ubigeoArray=result;
      this.departamentos = result
        .filter(u => u.idUbigeo.substring(2, 6) === '0000')
        .sort((a, b) => a.departamento.localeCompare(b.departamento));

      if (!this.isEdited) {
        this.setUbigeoDefault();
      }
      this.cdr.detectChanges();
    });
  }

  setUbigeoDefault() {
    const idDepDefault = '150000'; // Lima Departamento
    this.filterProvincias(idDepDefault);
    const idProvDefault = '150101'; // Lima Provincia (regla 01)
    this.filterDistritos(idProvDefault);
    const idDistDefault = '150101';

    this.personaForm.patchValue({
      idDepartamento: idDepDefault,
      idProvincia: idProvDefault,
      idDistrito: idDistDefault
    });
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
    this.personaRequest.idUbigeo=this.personaForm.get('idDistrito')?.value;
  }

  setFormValuesIni(){
    this.personaForm.patchValue({
      idSexo:'I',
      idTipoDocumento:1,
      idUbigeo:'150101'
    });
    this.setUbigeoDefault();
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
          Swal.fire({
            icon:'success',
            title:'registrarPersona...',
            text:'!Se registro exitosamente los datos de la persona!',
            confirmButtonColor:'#000080',
          }).then(() => {
            this.refreshForm();
          });
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
          Swal.fire({
            icon:'success',
            title:'actualizarPersona...',
            text:'!Se actualizó exitosamente los datos de la persona!',
            confirmButtonColor:'#000080',
          }).then(() => {
            this.refreshForm();
          });
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

  private formatDateToInput(dateInput: any): string {
    if (!dateInput) return '';
    const date = new Date(dateInput);
    return !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : '';
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
          apellidoPaterno:persona.apellidoPaterno?.toUpperCase(),
          apellidoMaterno:persona.apellidoMaterno?.toUpperCase(),
          nombres:persona.nombres?.toUpperCase(),
          idSexo:persona?.sexo?.idSexo,
          fechaNacimiento:this.formatDateToInput(persona.fechaNacimiento),
          idTipoDocumento:persona?.tipoDocumento?.idTipoDocumento,
          numDocumento:persona.numDocumento,
          telefono:persona.telefono,
          direccion:persona.direccion?.toUpperCase(),
          idUbigeo:persona?.ubigeo?.idUbigeo
        });
        this.isEdited=true;
        this.personaForm.markAllAsTouched();
        this.cdr.detectChanges();
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
            Swal.fire({
              icon:'success',
              title:'eliminarPersona...',
              text:'!Se eliminó exitosamente los datos de la persona!',
              confirmButtonColor:'#000080',
            }).then(() => {
              this.refreshForm();
            });
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

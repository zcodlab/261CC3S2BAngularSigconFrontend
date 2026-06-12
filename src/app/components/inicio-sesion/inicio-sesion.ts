import { Component, inject} from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { UserRequest } from '../../model/api/request/user-request';
import { UserResponse } from '../../model/api/response/user-response';
import { SessionService } from '../../services/session.service';
import { ToastContainer } from '../toast-container/toast-container';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-inicio-sesion',
  imports: [ReactiveFormsModule, RouterModule, ToastContainer, NgbTooltip],
  templateUrl: './inicio-sesion.html',
  styleUrl: './inicio-sesion.scss',
})
export class InicioSesion {
  location = inject(Location);
  router = inject(Router);
  authService = inject(AuthService);
  toastService = inject(ToastService);
  userRequest:UserRequest={} as UserRequest;
  userResponse:UserResponse={} as UserResponse;
  sessionService=inject(SessionService);
  isPasswordVisible: boolean = false;

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  private noSameCharsValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const val = control.value.toString();
      if (val.length < 2) return null;
      const allSame = val.split('').every((char: string) => char === val[0]);
      return allSame ? { sameChars: true } : null;
    };
  }

  private maxConsecutiveValidator(max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const val = control.value.toString();
      const regex = new RegExp(`(.)\\1{${max},}`);
      return regex.test(val) ? { maxConsecutive: true } : null;
    };
  }

  form = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.maxLength(20),
      Validators.pattern(/^[1-9A-Za-z_]{1,12}@[A-Za-z0-9]{3,10}\.[a-z]{2,3}(\.[a-z]{2})?$/),
      this.maxConsecutiveValidator(3)
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(12),
      Validators.pattern(/^\S*$/),
      this.noSameCharsValidator(),
      this.maxConsecutiveValidator(3)
    ]),
  });

  get emailError(): string {
    const control = this.form.get('email');
    if (control?.touched || control?.dirty) {
      if (control?.hasError('required')) return 'El correo es obligatorio';
      if (control?.hasError('maxlength')) return 'Máximo 20 caracteres';
      if (control?.hasError('pattern')) return 'Formato inválido (sin espacios)';
      if (control?.hasError('maxConsecutive')) return 'Máximo 3 caracteres iguales seguidos';
    }
    return '';
  }

  get passwordError(): string {
    const control = this.form.get('password');
    if (control?.touched || control?.dirty) {
      if (control?.hasError('required')) return 'La contraseña es obligatoria';
      if (control?.hasError('minlength')) return 'Mínimo 6 caracteres';
      if (control?.hasError('maxlength')) return 'Máximo 12 caracteres';
      if (control?.hasError('pattern')) return 'No se permiten espacios';
      if (control?.hasError('sameChars')) return 'No pueden ser todos iguales';
      if (control?.hasError('maxConsecutive')) return 'Máximo 3 iguales seguidos';
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

  login() {
    if (this.form.invalid) return;

    // Limpiamos sesión previa para evitar que el interceptor envíe tokens expirados
    this.authService.logout();

    const { email, password } = this.form.value;
    if (!email || !password) return;

    this.userRequest.email=email;
    this.userRequest.password=password;

    this.authService.login(this.userRequest).subscribe(
      (result: UserResponse)=>{
        this.userResponse=result;
        console.log(this.userResponse);
        console.log('Login successful');
        this.authService.setTokens(this.userResponse.token, this.userResponse.refreshToken);
        console.log(this.sessionService.getInfoSession());
        this.toastService.show('Ingreso exitoso', 'success');
        this.router.navigate(['/dashboard']);
      },
      (err:any)=>{
        console.log(err);
        console.log('Login failed');
        this.toastService.show('Ingreso fallido', 'danger');
      }

    );

  }//end login

  onBack() {
    this.location.back();
  }

}

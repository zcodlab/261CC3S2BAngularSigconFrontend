import { Component, inject} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  get emailError(): string {
    const control = this.form.get('email');
    if (control?.touched || control?.dirty) {
      if (control?.hasError('required')) return 'El correo es obligatorio';
      if (control?.hasError('email')) return 'Formato de correo inválido';
    }
    return '';
  }

  get passwordError(): string {
    const control = this.form.get('password');
    if (control?.touched || control?.dirty) {
      if (control?.hasError('required')) return 'La contraseña es obligatoria';
      if (control?.hasError('minlength')) return 'Mínimo 6 caracteres';
    }
    return '';
  }

  login() {
    if (this.form.invalid) return;

    const { email, password } = this.form.value;
    if (!email || !password) return;

    this.userRequest.email=email;
    this.userRequest.password=password;

    this.authService.login(this.userRequest).subscribe(
      (result: UserResponse)=>{
        this.userResponse=result;
        console.log(this.userResponse);
        console.log('Login successful');
        this.authService.setToken(this.userResponse.token);
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

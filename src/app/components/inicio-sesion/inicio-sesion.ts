import { Component, inject} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-inicio-sesion',
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './inicio-sesion.html',
  styleUrl: './inicio-sesion.scss',
})
export class InicioSesion {
  location = inject(Location);
  router = inject(Router);
  authService = inject(AuthService);
  toastService = inject(ToastService)

  form = new FormGroup({
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(2)]),
  });

  login() {
    if (this.form.invalid) return;

    const { email, password } = this.form.value;
    if (!email || !password) return;

    if (this.authService.login(email, password)) {
      this.toastService.show('Ingreso exitoso', 'success');
      console.log('Login successful');
      this.router.navigate(['/']);
    } else {
      this.toastService.show('Ingreso fallido', 'danger');//ALT+96: ` acento grave o invertido
      console.log('Login failed');
    }

  }//end login

  onBack() {
    this.location.back();
  }

}

import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { FacadeService } from '../services/facade.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private facadeService: FacadeService,
    private router: Router
  ) { }

  canActivate(): boolean {
    const rol = this.facadeService.getUserGroup();

    if (rol === 'administrador') {
      return true;
    }

    console.warn('Alerta de Seguridad: Usuario no autorizado intentó entrar a registro.');
    this.router.navigate(['/home']);
    return false;
  }
}

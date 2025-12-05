import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { FacadeService } from '../services/facade.service';

@Injectable({
  providedIn: 'root'
})
export class OwnerGuard implements CanActivate {

  constructor(
    private facadeService: FacadeService,
    private router: Router
  ) { }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const rolUsuario = this.facadeService.getUserGroup();
    const idUsuario = Number(this.facadeService.getUserId());

    const idUrl = Number(route.paramMap.get('id'));

    if (rolUsuario === 'administrador') {
      return true;
    }

    if (idUrl === idUsuario) {
      return true;
    }

    console.warn("Intento de acceso no autorizado a perfil ajeno.");
    this.router.navigate(['/home']);
    return false;
  }
}

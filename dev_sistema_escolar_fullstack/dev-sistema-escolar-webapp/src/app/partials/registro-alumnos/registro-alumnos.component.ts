import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AlumnosService } from 'src/app/services/alumnos.service';
import { FacadeService } from 'src/app/services/facade.service';

@Component({
  selector: 'app-registro-alumnos',
  templateUrl: './registro-alumnos.component.html',
  styleUrls: ['./registro-alumnos.component.scss'],
})
export class RegistroAlumnosComponent implements OnInit {
  @Input() rol: string = '';
  @Input() datos_user: any = {};

  //Para contraseñas
  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';

  public alumno: any = {};
  public token: string = '';
  public errors: any = {};
  public editar: boolean = false;
  public idUser: Number = 0;

  constructor(
    private router: Router,
    private location: Location,
    public activatedRoute: ActivatedRoute,
    private facadeService: FacadeService,
    private alumnosService: AlumnosService
  ) { }

  ngOnInit(): void {
    if (this.activatedRoute.snapshot.params['id'] != undefined) {
      this.editar = true;
      this.idUser = this.activatedRoute.snapshot.params['id'];
      console.log('ID User: ', this.idUser);
      this.alumno = this.datos_user;
      if (this.alumno.fecha_nacimiento) {
        this.alumno.fecha_nacimiento = this.esquemaFecha(this.alumno.fecha_nacimiento);
      }
    } else {
      this.alumno = this.alumnosService.esquemaAlumno();
      this.alumno.rol = this.rol;
      this.token = this.facadeService.getSessionToken();
    }
    console.log('Datos alumno: ', this.alumno);
  }

  public regresar() {
    this.location.back();
  }

  public registrar() {
    this.errors = {};
    this.errors = this.alumnosService.validarAlumno(this.alumno, this.editar);
    if (Object.keys(this.errors).length > 0) {
      return false;
    }
    if (this.alumno.password == this.alumno.confirmar_password) {
      const datosAEnviar = { ...this.alumno };
      if (datosAEnviar.fecha_nacimiento) {
        datosAEnviar.fecha_nacimiento = this.formatDateForServer(datosAEnviar.fecha_nacimiento);
      }
      this.alumnosService.registrarAlumno(datosAEnviar).subscribe(
        (response) => {
          alert('Alumno registrado exitosamente');
          if (this.token && this.token !== '') {
            this.router.navigate(['alumnos']);
          } else {
            this.router.navigate(['/']);
          }
        },
        (error) => {
          alert('Error al registrar alumno');
        }
      );
    } else {
      alert('Las contraseñas no coinciden');
      this.alumno.password = '';
      this.alumno.confirmar_password = '';
    }
  }

  public actualizar() {
    this.errors = {};
    this.errors = this.alumnosService.validarAlumno(this.alumno, this.editar);
    if (Object.keys(this.errors).length > 0) {
      return false;
    }
    const datosAEnviar = { ...this.alumno };
    if (datosAEnviar.fecha_nacimiento) {
      datosAEnviar.fecha_nacimiento = this.formatDateForServer(datosAEnviar.fecha_nacimiento);
    }
    this.alumnosService.actualizarAlumno(datosAEnviar).subscribe(
      (response) => {
        alert('Alumno actualizado exitosamente');
        this.router.navigate(['alumnos']);
      },
      (error) => {
        alert('Error al actualizar el alumno');
      }
    );
  }

  //Funciones para password
  showPassword() {
    if (this.inputType_1 == 'password') {
      this.inputType_1 = 'text';
      this.hide_1 = true;
    } else {
      this.inputType_1 = 'password';
      this.hide_1 = false;
    }
  }

  showPwdConfirmar() {
    if (this.inputType_2 == 'password') {
      this.inputType_2 = 'text';
      this.hide_2 = true;
    } else {
      this.inputType_2 = 'password';
      this.hide_2 = false;
    }
  }

  public changeFecha(event: any) {
    if (event.value) {
      this.alumno.fecha_nacimiento = event.value;
      const fechaNacimiento = event.value;
      const hoy = new Date();
      let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
      const mes = hoy.getMonth() - fechaNacimiento.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
        edad--;
      }
      this.alumno.edad = edad;
      console.log("Fecha objeto:", this.alumno.fecha_nacimiento);
      console.log("Edad calculada:", this.alumno.edad);
    }
  }

  public soloLetras(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    // Permitir solo letras (mayúsculas y minúsculas) y espacio
    if (
      !(charCode >= 65 && charCode <= 90) && // Letras mayúsculas
      !(charCode >= 97 && charCode <= 122) && // Letras minúsculas
      charCode !== 32 // Espacio
    ) {
      event.preventDefault();
    }
  }
  public soloAlfanumericos(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    if (
      !(charCode >= 65 && charCode <= 90) &&
      !(charCode >= 97 && charCode <= 122) &&
      !(charCode >= 48 && charCode <= 57)
    ) {
      event.preventDefault();
    }
  }

  public formatDateForServer(fecha: any): string {
    if (!fecha) return '';
    if (typeof fecha === 'string') return fecha;
    const d = new Date(fecha);
    const year = d.getFullYear();
    const month = ('' + (d.getMonth() + 1)).padStart(2, '0');
    const day = ('' + d.getDate()).padStart(2, '0');
    return [year, month, day].join('-');
  }

  public esquemaFecha(fecha: any): Date {
    if (!fecha) return new Date();
    if (fecha instanceof Date) {
      if (isNaN(fecha.getTime())) return new Date();
      return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 12, 0, 0);
    }
    const fechaStr = fecha.toString();
    if (fechaStr.includes('-')) {
      const partes = fechaStr.split('T')[0].split('-');
      const anio = parseInt(partes[0]);
      const mes = parseInt(partes[1]) - 1;
      const dia = parseInt(partes[2]);
      return new Date(anio, mes, dia, 12, 0, 0);
    }

    return new Date(fecha);
  }
}

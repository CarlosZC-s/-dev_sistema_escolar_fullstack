import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { FacadeService } from 'src/app/services/facade.service';
import { MatRadioChange } from '@angular/material/radio';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { MaestrosService } from 'src/app/services/maestros.service';
import { AlumnosService } from 'src/app/services/alumnos.service';

@Component({
  selector: 'app-registro-usuarios-screen',
  templateUrl: './registro-usuarios-screen.component.html',
  styleUrls: ['./registro-usuarios-screen.component.scss']
})
export class RegistroUsuariosScreenComponent implements OnInit {

  public tipo: string = "registro-usuarios";
  public user: any = {};
  public editar: boolean = false;
  public rol: string = "";
  public idUser: number = 0;

  //Banderas para el tipo de usuario
  public isAdmin: boolean = false;
  public isAlumno: boolean = false;
  public isMaestro: boolean = false;

  public tipo_user: string = "";

  constructor(
    private location: Location,
    public activatedRoute: ActivatedRoute,
    private router: Router,
    public facadeService: FacadeService,
    private administradoresService: AdministradoresService,
    private maestrosService: MaestrosService,
    private alumnosService: AlumnosService
  ) { }

  ngOnInit(): void {
    this.user.tipo_usuario = '';
    //Obtener de la URL el rol para saber cual editar
    if (this.activatedRoute.snapshot.params['rol'] != undefined) {
      this.rol = this.activatedRoute.snapshot.params['rol'];
      console.log("Rol detectado: ", this.rol);
    }

    //El if valida si existe un parámetro ID en la URL
    if (this.activatedRoute.snapshot.params['id'] != undefined) {
      this.editar = true;
      //Asignamos a nuestra variable global el valor del ID que viene por la URL
      this.idUser = this.activatedRoute.snapshot.params['id'];
      console.log("ID User: ", this.idUser);
      //Al iniciar la vista obtiene el usuario por su ID
      this.obtenerUserByID();
    }
  }

  public radioChange(event: MatRadioChange) {
    if (event.value == "administrador") {
      this.isAdmin = true;
      this.isAlumno = false;
      this.isMaestro = false;
      this.tipo_user = "administrador";
    } else if (event.value == "alumno") {
      this.isAdmin = false;
      this.isAlumno = true;
      this.isMaestro = false;
      this.tipo_user = "alumno";
    } else if (event.value == "maestro") {
      this.isAdmin = false;
      this.isAlumno = false;
      this.isMaestro = true;
      this.tipo_user = "maestro";
    }
  }

  public obtenerUserByID() {
    console.log("Obteniendo usuario de tipo: ", this.rol, " con ID: ", this.idUser);
    if (this.rol == "administrador") {
      this.administradoresService.obtenerAdminPorID(this.idUser).subscribe(
        (response) => {
          this.user = response;
          console.log("Usuario original obtenido: ", this.user);
          this.user.first_name = response.user?.first_name || response.first_name;
          this.user.last_name = response.user?.last_name || response.last_name;
          this.user.email = response.user?.email || response.email;
          this.user.tipo_usuario = this.rol;
          this.isAdmin = true;
        }, (error) => {
          console.log("Error: ", error);
          alert("No se pudo obtener el administrador seleccionado");
        }
      );
    } else if (this.rol == "maestros") {
      this.maestrosService.obtenerMaestroPorID(this.idUser).subscribe(
        (response) => {
          this.user = response;
          console.log("Usuario original obtenido: ", this.user);
          this.user.first_name = response.user.first_name;
          this.user.last_name = response.user.last_name;
          this.user.email = response.user.email;
          this.user.tipo_usuario = this.rol;
          this.user.tipo_usuario = "maestro";
          this.tipo_user = "maestro";
          if (this.user.fecha_nacimiento) {
            this.user.fecha_nacimiento = this.esquemaFecha(this.user.fecha_nacimiento);
          }
          this.isMaestro = true;
          console.log("Datos maestro editar: ", this.user);
        }, (error) => {
          alert("No se pudo obtener el maestro seleccionado");
        }
      );
    } else if (this.rol == "alumnos") {
      this.alumnosService.obtenerAlumnoPorID(this.idUser).subscribe(
        (response) => {
          this.user = response;
          this.user.first_name = response.user.first_name;
          this.user.last_name = response.user.last_name;
          this.user.email = response.user.email;
          this.user.tipo_usuario = this.rol;
          this.user.tipo_usuario = "alumno";
          this.tipo_user = "alumno";
          if (this.user.fecha_nacimiento) {
            this.user.fecha_nacimiento = this.esquemaFecha(this.user.fecha_nacimiento);
          }
          this.isAlumno = true;
          console.log("Datos alumno editar: ", this.user);
        }, (error) => {
          alert("No se pudo obtener el alumno seleccionado");
        }
      );
    }

  }

  public esquemaFecha(fecha: any): Date {
    console.log("esquemaFecha recibió:", fecha, "Tipo:", typeof fecha);
    if (!fecha) return new Date();
    if (fecha instanceof Date) {
      if (isNaN(fecha.getTime())) {
        console.error("La fecha recibida es un objeto Date pero es Inválida");
        return new Date();
      }
      return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 12, 0, 0);
    }
    let fechaStr = fecha.toString();
    if (fechaStr.includes('-')) {
      const fechaLimpia = fechaStr.split('T')[0];
      const partes = fechaLimpia.split('-');
      if (partes.length < 3) {
        console.error("Formato de fecha no reconocido (faltan partes):", fechaStr);
        return new Date(fechaStr);
      }
      const anio = parseInt(partes[0]);
      const mes = parseInt(partes[1]) - 1;
      const dia = parseInt(partes[2]);
      if (isNaN(anio) || isNaN(mes) || isNaN(dia)) {
        console.error("Error al parsear números de la fecha:", partes);
        return new Date(fechaStr);
      }
      return new Date(anio, mes, dia, 12, 0, 0);
    }
    else if (fechaStr.includes('/')) {
      const partes = fechaStr.split('/');
      if (partes.length === 3) {
        return new Date(parseInt(partes[2]), parseInt(partes[1]) - 1, parseInt(partes[0]), 12, 0, 0);
      }
    }
    return new Date(fecha);
  }

  public formatDateForServer(fecha: any): string {
    if (!fecha) return '';
    if (typeof fecha === 'string') return fecha;
    const d = new Date(fecha);
    const month = '' + (d.getMonth() + 1);
    const day = '' + d.getDate();
    const year = d.getFullYear();

    return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
  }

  public goBack() {
    this.location.back();
  }
}

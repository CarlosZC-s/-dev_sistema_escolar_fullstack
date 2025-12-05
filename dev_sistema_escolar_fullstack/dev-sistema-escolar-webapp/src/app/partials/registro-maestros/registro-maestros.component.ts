import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { Location } from '@angular/common';
import { MaestrosService } from 'src/app/services/maestros.service';

@Component({
  selector: 'app-registro-maestros',
  templateUrl: './registro-maestros.component.html',
  styleUrls: ['./registro-maestros.component.scss'],
})
export class RegistroMaestrosComponent implements OnInit {
  @Input() rol: string = '';
  @Input() datos_user: any = {};

  //Para contraseñas
  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';

  public maestro: any = {};
  public errors: any = {};
  public editar: boolean = false;
  public token: string = '';
  public idUser: Number = 0;

  //Para el select
  public areas: any[] = [
    { value: '1', viewValue: 'Desarrollo Web' },
    { value: '2', viewValue: 'Programación' },
    { value: '3', viewValue: 'Bases de datos' },
    { value: '4', viewValue: 'Redes' },
    { value: '5', viewValue: 'Matemáticas' },
  ];

  public materias: any[] = [
    { value: '1', nombre: 'Aplicaciones Web' },
    { value: '2', nombre: 'Programación 1' },
    { value: '3', nombre: 'Bases de datos' },
    { value: '4', nombre: 'Tecnologías Web' },
    { value: '5', nombre: 'Minería de datos' },
    { value: '6', nombre: 'Desarrollo móvil' },
    { value: '7', nombre: 'Estructuras de datos' },
    { value: '8', nombre: 'Administración de redes' },
    { value: '9', nombre: 'Ingeniería de Software' },
    { value: '10', nombre: 'Administración de S.O.' },
  ];
  constructor(
    private router: Router,
    private location: Location,
    public activatedRoute: ActivatedRoute,
    private facadeService: FacadeService,
    private maestrosService: MaestrosService
  ) { }

  ngOnInit(): void {
    if (this.activatedRoute.snapshot.params['id'] != undefined) {
      this.editar = true;
      this.idUser = this.activatedRoute.snapshot.params['id'];
      this.maestro = this.datos_user;
      if (this.maestro.fecha_nacimiento) {
        this.maestro.fecha_nacimiento = this.esquemaFecha(this.maestro.fecha_nacimiento);
      }
      if (this.maestro.materias_json) {
        if (typeof this.maestro.materias_json === 'string') {
          try {
            this.maestro.materias_json = JSON.parse(this.maestro.materias_json);
          } catch (e) {
            console.error("Error al parsear materias:", e);
            this.maestro.materias_json = [];
          }
        }
      } else {
        this.maestro.materias_json = [];
      }
      console.log("Materias procesadas:", this.maestro.materias_json);

    } else {
      // Lógica de registro nuevo
      this.maestro = this.maestrosService.esquemaMaestro();
      this.maestro.rol = this.rol;
      this.token = this.facadeService.getSessionToken();
      this.maestro.materias_json = [];
    }
  }

  public regresar() {
    this.location.back();
  }

  public registrar() {
    this.errors = {};
    this.errors = this.maestrosService.validarMaestro(this.maestro, this.editar);
    if (Object.keys(this.errors).length > 0) {
      return false;
    }
    if (this.maestro.password == this.maestro.confirmar_password) {
      const datosAEnviar = { ...this.maestro };

      if (datosAEnviar.fecha_nacimiento) {
        datosAEnviar.fecha_nacimiento = this.formatDateForServer(datosAEnviar.fecha_nacimiento);
      }
      this.maestrosService.registrarMaestro(datosAEnviar).subscribe(
        (response) => {
          alert('Maestro registrado exitosamente');
          console.log('Maestro registrado: ', response);
          if (this.token && this.token !== '') {
            this.router.navigate(['maestros']);
          } else {
            this.router.navigate(['/']);
          }
        },
        (error) => {
          alert('Error al registrar maestro');
          console.error('Error al registrar maestro: ', error);
        }
      );
    } else {
      alert('Las contraseñas no coinciden');
      this.maestro.password = '';
      this.maestro.confirmar_password = '';
    }
  }

  public actualizar() {
    this.errors = {};
    this.errors = this.maestrosService.validarMaestro(this.maestro, this.editar);
    if (Object.keys(this.errors).length > 0) {
      return false;
    }
    console.log('Actualizando maestro: ', this.maestro);
    const datosAEnviar = { ...this.maestro };
    if (datosAEnviar.fecha_nacimiento) {
      datosAEnviar.fecha_nacimiento = this.formatDateForServer(datosAEnviar.fecha_nacimiento);
    }
    this.maestrosService.actualizarMaestro(datosAEnviar).subscribe(
      (response) => {
        alert('Maestro actualizado exitosamente');
        console.log('Maestro actualizado: ', response);
        this.router.navigate(['maestros']);
      },
      (error) => {
        alert('Error al actualizar el maestro');
        console.error('Error: ', error);
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

  //Función para detectar el cambio de fecha
  public changeFecha(event: any) {
    if (event.value) {
      this.maestro.fecha_nacimiento = event.value;
    }
  }

  // Funciones para los checkbox
  public checkboxChange(event: any) {
    console.log('Evento: ', event);
    if (event.checked) {
      this.maestro.materias_json.push(event.source.value);
    } else {
      console.log(event.source.value);
      this.maestro.materias_json.forEach((materia, i) => {
        if (materia == event.source.value) {
          this.maestro.materias_json.splice(i, 1);
        }
      });
    }
    console.log('Array materias: ', this.maestro);
  }

  public revisarSeleccion(nombre: string) {
    if (this.maestro.materias_json) {
      var busqueda = this.maestro.materias_json.find(
        (element: any) => element == nombre
      );
      if (busqueda != undefined) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
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
      !(charCode >= 65 && charCode <= 90) && // Letras mayúsculas (A-Z)
      !(charCode >= 97 && charCode <= 122) && // Letras minúsculas (a-z)
      !(charCode >= 48 && charCode <= 57) // Números (0-9)
    ) {
      event.preventDefault(); // Bloquea cualquier otro caracter
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
      return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 12, 0, 0);
    }

    const fechaStr = fecha.toString().split('T')[0];
    const partes = fechaStr.split('-');

    const anio = parseInt(partes[0]);
    const mes = parseInt(partes[1]) - 1;
    const dia = parseInt(partes[2]);

    return new Date(anio, mes, dia, 12, 0, 0);
  }
}

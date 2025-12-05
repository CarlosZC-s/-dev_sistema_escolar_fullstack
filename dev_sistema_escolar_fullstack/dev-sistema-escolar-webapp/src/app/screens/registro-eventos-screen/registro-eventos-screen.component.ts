import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FacadeService } from 'src/app/services/facade.service';
import { EventosService } from 'src/app/services/eventos.service';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { MaestrosService } from 'src/app/services/maestros.service';
import { MatDialog } from '@angular/material/dialog';
import { EditarEventoModalComponent } from 'src/app/modals/editar-evento-modal/editar-evento-modal.component';

@Component({
  selector: 'app-registro-eventos-screen',
  templateUrl: './registro-eventos-screen.component.html',
  styleUrls: ['./registro-eventos-screen.component.scss']
})
export class RegistroEventosScreenComponent implements OnInit {

  public evento: any = {};
  public errors: any = {};
  public editar: boolean = false;
  public idEvento: number = 0;
  public lista_responsables: any[] = [];
  public token: string = "";
  public minDate: Date = new Date();

  // Opciones para selects
  public tipos_evento: any[] = [
    { value: 'Conferencia', viewValue: 'Conferencia' },
    { value: 'Taller', viewValue: 'Taller' },
    { value: 'Seminario', viewValue: 'Seminario' },
    { value: 'Concurso', viewValue: 'Concurso' }
  ];

  public programas: any[] = [
    { value: 'Ingeniería en Ciencias de la Computación', viewValue: 'Ingeniería en Ciencias de la Computación' },
    { value: 'Licenciatura en Ciencias de la Computación', viewValue: 'Licenciatura en Ciencias de la Computación' },
    { value: 'Ingeniería en Tecnologías de la Información', viewValue: 'Ingeniería en Tecnologías de la Información' }
  ];

  public publico_options: any[] = [
    { value: 'Estudiantes', viewValue: 'Estudiantes' },
    { value: 'Profesores', viewValue: 'Profesores' },
    { value: 'Público en General', viewValue: 'Público en General' }
  ];

  constructor(
    private router: Router,
    private location: Location,
    private activatedRoute: ActivatedRoute,
    private facadeService: FacadeService,
    private eventosService: EventosService,
    private administradoresService: AdministradoresService,
    private maestrosService: MaestrosService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.token = this.facadeService.getSessionToken();


    this.obtenerResponsables();

    if (this.activatedRoute.snapshot.params['id'] != undefined) {
      this.editar = true;
      this.idEvento = this.activatedRoute.snapshot.params['id'];

      this.eventosService.obtenerEventoID(this.idEvento).subscribe(
        (response) => {
          this.evento = response;
          if (this.evento.hora_inicio) {
            this.evento.hora_inicio = this.evento.hora_inicio.slice(0, 5);
          }
          if (this.evento.hora_fin) {
            this.evento.hora_fin = this.evento.hora_fin.slice(0, 5);
          }
          if (!this.evento.publico_objetivo) {
            this.evento.publico_objetivo = [];
          }
          console.log("Evento a editar: ", this.evento);
        }, (error) => {
          alert("No se pudo obtener el evento");
        }
      );
    } else {
      // Registro nuevo
      this.evento = this.eventosService.esquemaEvento();
      this.evento.publico_objetivo = [];
    }
  }

  public obtenerResponsables() {
    this.administradoresService.obtenerListaAdmins().subscribe(
      (admins) => {

        let lista_admins = admins.map((admin: any) => ({
          id: admin.user.id,
          nombre: admin.user.first_name + ' ' + admin.user.last_name + ' (Admin)'
        }));

        this.maestrosService.obtenerListaMaestros().subscribe(
          (maestros) => {
            let lista_maestros = maestros.map((maestro: any) => ({
              id: maestro.user.id,
              nombre: maestro.user.first_name + ' ' + maestro.user.last_name + ' (Maestro)'
            }));

            this.lista_responsables = [...lista_admins, ...lista_maestros];
          }
        );
      }
    );
  }

  public checkboxChange(event: any) {
    if (event.checked) {
      this.evento.publico_objetivo.push(event.source.value);
    } else {
      const index = this.evento.publico_objetivo.indexOf(event.source.value);
      if (index > -1) {
        this.evento.publico_objetivo.splice(index, 1);
      }
    }
    if (!this.isEstudianteSelected()) {
      this.evento.programa_educativo = '';
    }
  }

  public revisarSeleccion(valor: string) {
    if (this.evento.publico_objetivo && Array.isArray(this.evento.publico_objetivo)) {
      return this.evento.publico_objetivo.includes(valor);
    }
    return false;
  }

  public isEstudianteSelected(): boolean {
    if (this.evento.publico_objetivo && Array.isArray(this.evento.publico_objetivo)) {
      return this.evento.publico_objetivo.includes('Estudiantes');
    }
    return false;
  }

  public regresar() {
    this.location.back();
  }

  public registrar() {
    this.errors = this.eventosService.validarEvento(this.evento, this.editar);
    if (!$.isEmptyObject(this.errors)) {
      alert("Error en los datos. Por favor verifica los campos.");
      return false;
    }
    this.formatDateForServer();
    this.eventosService.registrarEvento(this.evento).subscribe(
      (response) => {
        alert("Evento registrado correctamente");
        this.router.navigate(["/home"]);
      }, (error) => {
        alert("No se pudo registrar el evento");
      }
    );
  }

  public actualizar() {
    this.errors = this.eventosService.validarEvento(this.evento, this.editar);
    if (!$.isEmptyObject(this.errors)) {
      alert("Faltan campos por llenar. Revisa los textos en rojo.");
      return false;
    }

    const dialogRef = this.dialog.open(EditarEventoModalComponent, {
      data: { nombre: this.evento.nombre_evento },
      height: '288px',
      width: '328px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.isConfirmed) {

        this.formatDateForServer();

        this.eventosService.actualizarEvento(this.evento).subscribe(
          (response) => {
            this.router.navigate(["/lista-eventos"]);
          }, (error) => {
            alert("No se pudo actualizar el evento");
          }
        );

      } else {
        console.log("Edición cancelada");
      }
    });
  }

  public changeFecha(event: any) {
    if (event.value) {
      this.evento.fecha = event.value;
    }
  }

  private formatDateForServer() {
    if (this.evento.fecha && typeof this.evento.fecha !== 'string') {
      const d = new Date(this.evento.fecha);
      const month = '' + (d.getMonth() + 1);
      const day = '' + d.getDate();
      const year = d.getFullYear();

      this.evento.fecha = [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
    }
  }

  public validarNombre(event: any) {
    const pattern = /[^a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ\s]/g;
    const inputChar = String.fromCharCode(event.charCode);
    if (event.keyCode !== 8 && !/[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ\s]/.test(inputChar)) {
      event.preventDefault();
    }
  }

  public validarLugar(event: any) {
    const inputChar = String.fromCharCode(event.charCode);
    // Solo letras (sin acentos) y números
    if (event.keyCode !== 8 && !/[a-zA-Z0-9\s]/.test(inputChar)) {
      event.preventDefault();
    }
  }

  public validarDescripcion(event: any) {
    const inputChar = String.fromCharCode(event.charCode);
    // Permite letras, números, espacios y .,;()¿?¡!-
    if (event.keyCode !== 8 && !/[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ\s.,;()¿?¡!\-]/.test(inputChar)) {
      event.preventDefault();
    }
  }

  public validarCupo(event: any) {
    const inputChar = String.fromCharCode(event.charCode);
    if (event.keyCode !== 8 && !/[0-9]/.test(inputChar)) {
      event.preventDefault();
      return;
    }
    const valorActual = this.evento.cupo_maximo ? this.evento.cupo_maximo.toString() : '';
    if (valorActual.length >= 3 && event.keyCode !== 8) {
      event.preventDefault();
    }
  }

}

declare var $: any;

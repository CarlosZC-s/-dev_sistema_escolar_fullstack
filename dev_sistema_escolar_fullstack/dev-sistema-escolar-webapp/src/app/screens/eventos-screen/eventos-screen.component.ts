import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { EventosService } from 'src/app/services/eventos.service';
import { MatDialog } from '@angular/material/dialog';
import { EliminarEventoModalComponent } from 'src/app/modals/eliminar-evento-modal/eliminar-evento-modal.component';

@Component({
  selector: 'app-eventos-screen',
  templateUrl: './eventos-screen.component.html',
  styleUrls: ['./eventos-screen.component.scss']
})
export class EventosScreenComponent implements OnInit {

  public name_user: string = "";
  public rol: string = "";
  public token: string = "";
  public lista_eventos: any[] = [];

  displayedColumns: string[] = ['nombre_evento', 'tipo_evento', 'fecha', 'horario', 'lugar', 'responsable_nombre'];

  dataSource = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    public facadeService: FacadeService,
    private eventosService: EventosService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();

    this.token = this.facadeService.getSessionToken();
    if (this.token == "") {
      this.router.navigate(["/"]);
    }

    if (this.rol === 'administrador') {
      this.displayedColumns.push('editar');
      this.displayedColumns.push('eliminar');
    }

    this.obtenerEventos();
    this.initTableFilter();
  }

  initTableFilter() {
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const nombre = data.nombre_evento.trim().toLowerCase();
      return nombre.includes(filter);
    };
  }

  public obtenerEventos() {
    this.eventosService.obtenerListaEventos().subscribe(
      (response) => {
        let eventosFiltrados = response;

        if (this.rol === 'alumno') {
          eventosFiltrados = eventosFiltrados.filter((e: any) =>
            this.esPublicoObjetivo(e.publico_objetivo, ['Estudiantes', 'Público en General'])
          );
        } else if (this.rol === 'maestro') {
          eventosFiltrados = eventosFiltrados.filter((e: any) =>
            this.esPublicoObjetivo(e.publico_objetivo, ['Profesores', 'Público en General'])
          );
        }

        this.lista_eventos = eventosFiltrados;
        console.log("Eventos cargados:", this.lista_eventos);
        this.dataSource.data = this.lista_eventos;

        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        });

      }, (error) => {
        alert("No se pudo obtener la lista de eventos");
      }
    );
  }

  private esPublicoObjetivo(targetArray: any[], permitidos: string[]): boolean {
    if (!Array.isArray(targetArray)) return false;
    return targetArray.some(r => permitidos.includes(r));
  }

  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  public goEditar(idEvento: number) {
    this.router.navigate(["registro-eventos/" + idEvento]);
  }

  public delete(idEvento: number) {
    const dialogRef = this.dialog.open(EliminarEventoModalComponent, {
      data: { id: idEvento },
      height: '288px',
      width: '328px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.isDelete) {
        this.obtenerEventos();
      }
    });
  }
}

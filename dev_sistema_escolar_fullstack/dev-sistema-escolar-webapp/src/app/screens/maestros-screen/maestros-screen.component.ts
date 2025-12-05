import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { MaestrosService } from 'src/app/services/maestros.service';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';

@Component({
  selector: 'app-maestros-screen',
  templateUrl: './maestros-screen.component.html',
  styleUrls: ['./maestros-screen.component.scss']
})

export class MaestrosScreenComponent implements OnInit {

  public name_user: string = "";
  public rol: string = "";
  public token: string = "";
  public userID: number = 0;
  public lista_maestros: any[] = [];

  //Para la tabla
  displayedColumns: string[] = ['id_trabajador', 'nombre', 'email', 'fecha_nacimiento', 'telefono', 'rfc', 'cubiculo', 'area_investigacion', 'editar', 'eliminar'];

  dataSource = new MatTableDataSource<DatosUsuario>();

  private paginator: MatPaginator;
  private sort: MatSort;

  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }

  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSourceAttributes();
  }


  constructor(
    public facadeService: FacadeService,
    public maestrosService: MaestrosService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();
    this.userID = Number(this.facadeService.getUserId());
    //Validar que haya inicio de sesión
    //Obtengo el token del login
    this.token = this.facadeService.getSessionToken();
    console.log("Token: ", this.token);
    if(this.token == ""){
      this.router.navigate(["/"]);
    }
    //Obtener maestros
    this.obtenerMaestros();

    // Le dice a la tabla como debe filtrar
    this.dataSource.filterPredicate = (data: DatosUsuario, filter: string) => {
      // Combina nombre y apellido y los pasa a minúsculas
      const fullName = (data.first_name + ' ' + data.last_name).trim().toLowerCase();
      // Retorna true si el nombre completo incluye el texto del filtro
      return fullName.includes(filter);
    };

    if (this.rol !== 'administrador') {
      // Filtramos para quitar 'eliminar'
      this.displayedColumns = this.displayedColumns.filter(c => c !== 'eliminar');
    }
  }

  setDataSourceAttributes() {
    // Esta función se llamará automáticamente cuando
    // el *ngIf muestre la tabla y el sort/paginator aparezcan.
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }


  // Consumimos el servicio para obtener los maestros
  //Obtener maestros
  public obtenerMaestros() {
    this.maestrosService.obtenerListaMaestros().subscribe(
      (response) => {
        this.lista_maestros = response;
        console.log("Lista users: ", this.lista_maestros);
        if (this.lista_maestros.length > 0) {
          //Agregar datos del nombre e email
          this.lista_maestros.forEach(usuario => {
            usuario.first_name = usuario.user.first_name;
            usuario.last_name = usuario.user.last_name;
            usuario.email = usuario.user.email;
          });
          console.log("Maestros: ", this.lista_maestros);
          this.dataSource.data = this.lista_maestros as DatosUsuario[];
        }
      }, (error) => {
        console.error("Error al obtener la lista de maestros: ", error);
        alert("No se pudo obtener la lista de maestros");
      }
    );
  }

  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;

    // Asigna el valor al filtro (ya limpio y en minúsculas)
    // Esto automáticamente usará el "filterPredicate" que definimos en ngOnInit
    this.dataSource.filter = filterValue.trim().toLowerCase();

    // Resetea a la primera página si hay paginación
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }


  public goEditar(idUser: number) {
    this.router.navigate(["registro-usuarios/maestros/" + idUser]);
  }

  public delete(idUser: number) {
    // Obtenemos el ID del usuario logueado desde el Facade
    const userIdSession = Number(this.facadeService.getUserId());
    if (this.rol === 'administrador' || (this.rol === 'maestro' && userIdSession === idUser)) {

      const dialogRef = this.dialog.open(EliminarUserModalComponent, {
        data: { id: idUser, rol: 'maestro' },
        height: '288px',
        width: '328px'
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result && result.isDelete) {
          console.log("Maestro eliminado");
          window.location.reload();
        } else {
          console.log("No se eliminó el maestro");
        }
      });

    } else {
      alert("No tienes permisos para eliminar este maestro.");
    }
  }

}

//Esto va fuera de la llave que cierra la clase
export interface DatosUsuario {
  id: number,
  id_trabajador: number;
  first_name: string;
  last_name: string;
  email: string;
  fecha_nacimiento: string,
  telefono: string,
  rfc: string,
  cubiculo: string,
  area_investigacion: number,
}

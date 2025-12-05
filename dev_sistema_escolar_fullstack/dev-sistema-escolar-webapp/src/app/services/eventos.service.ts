import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ValidatorService } from './tools/validator.service';
import { ErrorsService } from './tools/errors.service';
import { FacadeService } from './facade.service';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventosService {

  constructor(
    private http: HttpClient,
    private validatorService: ValidatorService,
    private errorService: ErrorsService,
    private facadeService: FacadeService
  ) { }

  public esquemaEvento() {
    return {
      nombre_evento: '',
      tipo_evento: '',
      fecha: '',
      hora_inicio: '',
      hora_fin: '',
      lugar: '',
      descripcion: '',
      cupo_maximo: '',
      responsable: '',
      publico_objetivo: [],
      programa_educativo: ''
    }
  }

  private timeToMinutes(timeStr: string): number {
    if (!timeStr) return 0;

    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    // Ajuste para formato 12 horas
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    return hours * 60 + minutes;
  }

  public validarEvento(data: any, editar: boolean) {
    let error: any = {};

    if (!this.validatorService.required(data["nombre_evento"])) {
      error["nombre_evento"] = this.errorService.required;
    }

    if (!this.validatorService.required(data["tipo_evento"])) {
      error["tipo_evento"] = this.errorService.required;
    }

    if (!this.validatorService.required(data["fecha"])) {
      error["fecha"] = this.errorService.required;
    } else {
      const fechaEvento = new Date(data["fecha"]);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const fechaComparacion = new Date(fechaEvento);
      fechaComparacion.setHours(0, 0, 0, 0);

      if (fechaComparacion < hoy && !editar) {
        error["fecha"] = "La fecha no puede ser anterior al día de hoy.";
      }
    }

    if (!this.validatorService.required(data["hora_inicio"])) {
      error["hora_inicio"] = this.errorService.required;
    }

    if (!this.validatorService.required(data["hora_fin"])) {
      error["hora_fin"] = this.errorService.required;
    }

    // --- CORRECCIÓN DE LA VALIDACIÓN DE HORA ---
    if (data["hora_inicio"] && data["hora_fin"]) {
      const minutosInicio = this.timeToMinutes(data["hora_inicio"]);
      const minutosFin = this.timeToMinutes(data["hora_fin"]);

      // Ahora comparamos números reales (ej: 585 vs 987)
      if (minutosInicio >= minutosFin) {
        error["hora_fin"] = "La hora final debe ser mayor a la hora de inicio.";
      }
    }

    if (!this.validatorService.required(data["lugar"])) {
      error["lugar"] = this.errorService.required;
    }

    if (!this.validatorService.required(data["descripcion"])) {
      error["descripcion"] = this.errorService.required;
    }

    if (!this.validatorService.required(data["cupo_maximo"])) {
      error["cupo_maximo"] = this.errorService.required;
    } else if (data["cupo_maximo"] <= 0) {
      error["cupo_maximo"] = "El cupo debe ser mayor a 0.";
    }

    if (!this.validatorService.required(data["responsable"])) {
      error["responsable"] = this.errorService.required;
    }

    if (!data["publico_objetivo"] || data["publico_objetivo"].length === 0) {
      error["publico_objetivo"] = "Selecciona al menos un público objetivo.";
    }

    if (data["publico_objetivo"] && data["publico_objetivo"].includes("Estudiantes")) {
      if (!this.validatorService.required(data["programa_educativo"])) {
        error["programa_educativo"] = this.errorService.required;
      }
    }

    return error;
  }

  public registrarEvento(data: any): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.post<any>(`${environment.url_api}/eventos/`, data, { headers: headers });
  }

  public obtenerListaEventos(): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.get<any>(`${environment.url_api}/lista-eventos/`, { headers: headers });
  }

  public obtenerEventoID(id: number): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.get<any>(`${environment.url_api}/eventos/?id=${id}`, { headers: headers });
  }

  public actualizarEvento(data: any): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.put<any>(`${environment.url_api}/eventos/`, data, { headers: headers });
  }

  public eliminarEvento(id: number): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.delete<any>(`${environment.url_api}/eventos/?id=${id}`, { headers: headers });
  }
}

import { Component, OnInit } from '@angular/core';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { AdministradoresService } from 'src/app/services/administradores.service';

@Component({
  selector: 'app-graficas-screen',
  templateUrl: './graficas-screen.component.html',
  styleUrls: ['./graficas-screen.component.scss']
})
export class GraficasScreenComponent implements OnInit {

  // Histograma
  lineChartData: any = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [{
      data: [0, 0, 0],
      label: 'Registro de Usuarios',
      backgroundColor: '#F88406',
      borderColor: '#F88406',
      tension: 0.4
    }]
  };
  lineChartOption = { responsive: false };
  lineChartPlugins = [DatalabelsPlugin];

  // Barras
  barChartData: any = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [{
      data: [0, 0, 0],
      label: 'Cantidad de Usuarios',
      backgroundColor: ['#FCFF44', '#82D3FB', '#FB82F5']
    }]
  };
  barChartOption = { responsive: false };
  barChartPlugins = [DatalabelsPlugin];

  // Circular
  pieChartData: any = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#FCFF44', '#F1C8F2', '#31E731']
    }]
  };
  pieChartOption = { responsive: false };
  pieChartPlugins = [DatalabelsPlugin];

  // Dona
  doughnutChartData: any = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#F88406', '#FCFF44', '#31E7E7']
    }]
  };
  doughnutChartOption = { responsive: false };
  doughnutChartPlugins = [DatalabelsPlugin];

  constructor(
    private administradoresServices: AdministradoresService
  ) { }

  ngOnInit(): void {
    this.obtenerTotalUsers();
  }

  public obtenerTotalUsers() {
    this.administradoresServices.getTotalUsuarios().subscribe(
      (response) => {
        console.log("Total usuarios obtenidos: ", response);
        const listaDatos = [response.admins, response.maestros, response.alumnos];

        this.pieChartData = {
          labels: ["Administradores", "Maestros", "Alumnos"],
          datasets: [{
            data: listaDatos,
            backgroundColor: ['#FCFF44', '#F1C8F2', '#31E731']
          }]
        };

        this.doughnutChartData = {
          labels: ["Administradores", "Maestros", "Alumnos"],
          datasets: [{
            data: listaDatos,
            backgroundColor: ['#F88406', '#FCFF44', '#31E7E7']
          }]
        };

        this.barChartData = {
          labels: ["Administradores", "Maestros", "Alumnos"],
          datasets: [{
            data: listaDatos,
            label: 'Total de Usuarios',
            backgroundColor: ['#FCFF44', '#82D3FB', '#FB82F5']
          }]
        };

        this.lineChartData = {
          labels: ["Administradores", "Maestros", "Alumnos"],
          datasets: [{
            data: listaDatos,
            label: 'Tendencia de Usuarios',
            backgroundColor: '#F88406',
            borderColor: '#F88406',
            fill: false,
            tension: 0.1
          }]
        };

      }, (error) => {
        console.error(error);
        alert("No se pudo obtener el total de usuarios");
      }
    );
  }
}

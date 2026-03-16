import { Component } from '@angular/core';
@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

  stats = {
    total: 348,
    activos: 290,
    vencidos: 58,
    ingresos: '$284k'
  };

  barras = [
    { mes: 'OCT', alto: 45 },
    { mes: 'NOV', alto: 60 },
    { mes: 'DIC', alto: 50 },
    { mes: 'ENE', alto: 75 },
    { mes: 'FEB', alto: 65 },
    { mes: 'MAR', alto: 85, activo: true },
  ];

  ultimos = [
    { nombre: 'Lucía Fernández', fecha: 'Hoy, 09:14', estado: 'activo' },
    { nombre: 'Marcos Díaz', fecha: 'Hoy, 08:50', estado: 'activo' },
    { nombre: 'Valentina Ruiz', fecha: 'Ayer, 18:30', estado: 'pendiente' },
    { nombre: 'Tomás Gómez', fecha: 'Ayer, 16:00', estado: 'activo' },
  ];
  
}

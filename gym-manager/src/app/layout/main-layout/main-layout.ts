import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { ModalMiembro } from '../../pages/modal-miembros/modal-miembros';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [Sidebar, RouterOutlet,ModalMiembro],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {

  modalAbierto = false;

  abrirModal() {
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }
}
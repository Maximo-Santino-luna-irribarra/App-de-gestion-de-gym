import { RouterLink, RouterLinkActive } from '@angular/router';
import { ModalMiembro } from '../../pages/modal-miembros/modal-miembros';
import { Component, EventEmitter, Output } from '@angular/core';
@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, ModalMiembro ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  @Output() abrirModalEvent = new EventEmitter<void>();
    
  abrirModal() {
    this.abrirModalEvent.emit();
  }

}

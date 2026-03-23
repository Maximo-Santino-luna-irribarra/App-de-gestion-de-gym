import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalMiembros } from './modal-miembros';

describe('ModalMiembros', () => {
  let component: ModalMiembros;
  let fixture: ComponentFixture<ModalMiembros>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalMiembros],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalMiembros);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

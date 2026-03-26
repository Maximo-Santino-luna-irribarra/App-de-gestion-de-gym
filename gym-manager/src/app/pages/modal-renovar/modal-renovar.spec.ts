import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalRenovar } from './modal-renovar';

describe('ModalRenovar', () => {
  let component: ModalRenovar;
  let fixture: ComponentFixture<ModalRenovar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalRenovar],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalRenovar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

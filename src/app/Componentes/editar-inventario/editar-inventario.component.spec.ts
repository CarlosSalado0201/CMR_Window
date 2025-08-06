import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarInventarioComponent } from './editar-inventario.component';

describe('EditarInventarioComponent', () => {
  let component: EditarInventarioComponent;
  let fixture: ComponentFixture<EditarInventarioComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditarInventarioComponent]
    });
    fixture = TestBed.createComponent(EditarInventarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

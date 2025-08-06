import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProyectoGrandeComponent } from './proyecto-grande.component';

describe('ProyectoGrandeComponent', () => {
  let component: ProyectoGrandeComponent;
  let fixture: ComponentFixture<ProyectoGrandeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProyectoGrandeComponent]
    });
    fixture = TestBed.createComponent(ProyectoGrandeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

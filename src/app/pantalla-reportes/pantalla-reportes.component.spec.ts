import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PantallaReportesComponent } from './pantalla-reportes.component';

describe('PantallaReportesComponent', () => {
  let component: PantallaReportesComponent;
  let fixture: ComponentFixture<PantallaReportesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PantallaReportesComponent]
    });
    fixture = TestBed.createComponent(PantallaReportesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

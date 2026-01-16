import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PantallaprincipalComponent } from './pantallaprincipal.component';

describe('PantallaprincipalComponent', () => {
  let component: PantallaprincipalComponent;
  let fixture: ComponentFixture<PantallaprincipalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PantallaprincipalComponent]
    });
    fixture = TestBed.createComponent(PantallaprincipalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrabajoDiarioComponent } from './trabajo-diario.component';

describe('TrabajoDiarioComponent', () => {
  let component: TrabajoDiarioComponent;
  let fixture: ComponentFixture<TrabajoDiarioComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrabajoDiarioComponent]
    });
    fixture = TestBed.createComponent(TrabajoDiarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

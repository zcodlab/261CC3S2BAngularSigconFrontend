import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarPersona } from './registrar-persona';

describe('RegistrarPersona', () => {
  let component: RegistrarPersona;
  let fixture: ComponentFixture<RegistrarPersona>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrarPersona]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrarPersona);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

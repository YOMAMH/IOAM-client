/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ApmSaasComponent } from './apm-saas.component';

describe('ApmSaasComponent', () => {
  let component: ApmSaasComponent;
  let fixture: ComponentFixture<ApmSaasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApmSaasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApmSaasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

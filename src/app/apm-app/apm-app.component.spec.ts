/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ApmAppComponent } from './apm-app.component';

describe('ApmAppComponent', () => {
  let component: ApmAppComponent;
  let fixture: ComponentFixture<ApmAppComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApmAppComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApmAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

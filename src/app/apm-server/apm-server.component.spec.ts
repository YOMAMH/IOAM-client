/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ApmServerComponent } from './apm-server.component';

describe('ApmServerComponent', () => {
  let component: ApmServerComponent;
  let fixture: ComponentFixture<ApmServerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApmServerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApmServerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

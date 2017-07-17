/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ApmNetopComponent } from './apm-netop.component';

describe('ApmNetopComponent', () => {
  let component: ApmNetopComponent;
  let fixture: ComponentFixture<ApmNetopComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApmNetopComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApmNetopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

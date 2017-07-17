/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { WorkDbOrderMyacceptorderComponent } from './work-db-order-myacceptorder.component';

describe('WorkDbOrderMyacceptorderComponent', () => {
  let component: WorkDbOrderMyacceptorderComponent;
  let fixture: ComponentFixture<WorkDbOrderMyacceptorderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkDbOrderMyacceptorderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkDbOrderMyacceptorderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

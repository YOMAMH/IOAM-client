/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { WorkUnhandleorderManageComponent } from './work-unhandleorder-manage.component';

describe('WorkUnhandleorderManageComponent', () => {
  let component: WorkUnhandleorderManageComponent;
  let fixture: ComponentFixture<WorkUnhandleorderManageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkUnhandleorderManageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkUnhandleorderManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

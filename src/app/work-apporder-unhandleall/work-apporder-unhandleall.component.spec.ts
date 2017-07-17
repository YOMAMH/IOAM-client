/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { WorkApporderUnhandleallComponent } from './work-apporder-unhandleall.component';

describe('WorkApporderUnhandleallComponent', () => {
  let component: WorkApporderUnhandleallComponent;
  let fixture: ComponentFixture<WorkApporderUnhandleallComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkApporderUnhandleallComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkApporderUnhandleallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

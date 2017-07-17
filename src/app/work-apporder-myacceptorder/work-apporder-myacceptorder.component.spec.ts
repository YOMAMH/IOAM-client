/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { WorkApporderMyacceptorderComponent } from './work-apporder-myacceptorder.component';

describe('WorkApporderMyacceptorderComponent', () => {
  let component: WorkApporderMyacceptorderComponent;
  let fixture: ComponentFixture<WorkApporderMyacceptorderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkApporderMyacceptorderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkApporderMyacceptorderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

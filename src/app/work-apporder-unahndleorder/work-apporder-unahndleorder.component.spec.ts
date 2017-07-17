/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { WorkApporderUnahndleorderComponent } from './work-apporder-unahndleorder.component';

describe('WorkApporderUnahndleorderComponent', () => {
  let component: WorkApporderUnahndleorderComponent;
  let fixture: ComponentFixture<WorkApporderUnahndleorderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkApporderUnahndleorderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkApporderUnahndleorderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

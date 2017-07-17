/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { WorkApporderHandledallComponent } from './work-apporder-handledall.component';

describe('WorkApporderHandledallComponent', () => {
  let component: WorkApporderHandledallComponent;
  let fixture: ComponentFixture<WorkApporderHandledallComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkApporderHandledallComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkApporderHandledallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

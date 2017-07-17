/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { UhostRecoveComponent } from './uhost-recove.component';

describe('UhostRecoveComponent', () => {
  let component: UhostRecoveComponent;
  let fixture: ComponentFixture<UhostRecoveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UhostRecoveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UhostRecoveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

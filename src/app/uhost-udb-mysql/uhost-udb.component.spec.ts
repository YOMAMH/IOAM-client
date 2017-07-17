/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { UhostUdbComponent } from './uhost-udb.component';

describe('UhostUdbComponent', () => {
  let component: UhostUdbComponent;
  let fixture: ComponentFixture<UhostUdbComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UhostUdbComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UhostUdbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { UhostUmemComponent } from './uhost-umem.component';

describe('UhostUmemComponent', () => {
  let component: UhostUmemComponent;
  let fixture: ComponentFixture<UhostUmemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UhostUmemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UhostUmemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

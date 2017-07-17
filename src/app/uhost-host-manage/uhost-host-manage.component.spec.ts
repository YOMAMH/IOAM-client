/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { UhostHostManageComponent } from './uhost-host-manage.component';

describe('UhostHostManageComponent', () => {
  let component: UhostHostManageComponent;
  let fixture: ComponentFixture<UhostHostManageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UhostHostManageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UhostHostManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

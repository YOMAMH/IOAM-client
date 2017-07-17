/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { UhostUnetSharebandComponent } from './uhost-unet-shareband.component';

describe('UhostUnetSharebandComponent', () => {
  let component: UhostUnetSharebandComponent;
  let fixture: ComponentFixture<UhostUnetSharebandComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UhostUnetSharebandComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UhostUnetSharebandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AlHostComponent } from './al-host.component';

describe('AlHostComponent', () => {
  let component: AlHostComponent;
  let fixture: ComponentFixture<AlHostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlHostComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

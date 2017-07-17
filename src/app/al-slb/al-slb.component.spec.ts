/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AlSlbComponent } from './al-slb.component';

describe('AlSlbComponent', () => {
  let component: AlSlbComponent;
  let fixture: ComponentFixture<AlSlbComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlSlbComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlSlbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

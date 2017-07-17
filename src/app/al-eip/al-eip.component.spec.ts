/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AlEipComponent } from './al-eip.component';

describe('AlEipComponent', () => {
  let component: AlEipComponent;
  let fixture: ComponentFixture<AlEipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlEipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlEipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

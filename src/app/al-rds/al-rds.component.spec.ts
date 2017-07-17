/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AlRdsComponent } from './al-rds.component';

describe('AlRdsComponent', () => {
  let component: AlRdsComponent;
  let fixture: ComponentFixture<AlRdsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlRdsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlRdsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

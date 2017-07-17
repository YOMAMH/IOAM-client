/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AlVpcComponent } from './al-vpc.component';

describe('AlVpcComponent', () => {
  let component: AlVpcComponent;
  let fixture: ComponentFixture<AlVpcComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlVpcComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlVpcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

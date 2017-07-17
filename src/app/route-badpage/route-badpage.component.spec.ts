/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { RouteBadpageComponent } from './route-badpage.component';

describe('RouteBadpageComponent', () => {
  let component: RouteBadpageComponent;
  let fixture: ComponentFixture<RouteBadpageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RouteBadpageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RouteBadpageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

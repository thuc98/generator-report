import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InputDragDropsComponent } from './input-drag-drops.component';

describe('InputDragDropsComponent', () => {
  let component: InputDragDropsComponent;
  let fixture: ComponentFixture<InputDragDropsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InputDragDropsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputDragDropsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

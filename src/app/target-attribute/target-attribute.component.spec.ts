import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TargetAttributeComponent } from './target-attribute.component';

describe('TargetAttributeComponent', () => {
  let component: TargetAttributeComponent;
  let fixture: ComponentFixture<TargetAttributeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TargetAttributeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TargetAttributeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

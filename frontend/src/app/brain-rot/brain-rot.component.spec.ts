import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrainRotComponent } from './brain-rot.component';

describe('BrainRotComponent', () => {
  let component: BrainRotComponent;
  let fixture: ComponentFixture<BrainRotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrainRotComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrainRotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start brain rot when startBrainRot is called', () => {
    component.startBrainRot();
    expect(component.isActive).toBe(true);
  });

  it('should stop brain rot when stopBrainRot is called', () => {
    component.isActive = true;
    component.stopBrainRot();
    expect(component.isActive).toBe(false);
  });
});

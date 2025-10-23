import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LearningsFromAgentopsComponent } from './learnings-from-agentops.component';

describe('LearningsFromAgentopsComponent', () => {
  let component: LearningsFromAgentopsComponent;
  let fixture: ComponentFixture<LearningsFromAgentopsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LearningsFromAgentopsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LearningsFromAgentopsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

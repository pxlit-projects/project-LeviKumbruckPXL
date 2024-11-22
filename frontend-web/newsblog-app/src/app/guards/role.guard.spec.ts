import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { isRedactorGuard } from './role.guard';

/*
describe('roleGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => isRedactorGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});

*/

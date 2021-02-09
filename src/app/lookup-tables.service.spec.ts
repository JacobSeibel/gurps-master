import { TestBed } from '@angular/core/testing';

import { LookupTablesService } from './lookup-tables.service';

describe('LookupTablesService', () => {
  let service: LookupTablesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LookupTablesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

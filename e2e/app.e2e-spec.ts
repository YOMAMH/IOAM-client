import { TyCmdbClientPage } from './app.po';

describe('ty-cmdb-client App', function() {
  let page: TyCmdbClientPage;

  beforeEach(() => {
    page = new TyCmdbClientPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});

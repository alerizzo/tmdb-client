import { Store } from '../lib';
import { Movie } from '../models';

import { decorate, observable } from 'mobx';

class MovieStore extends Store {
  model = Movie;
  resultsKey = 'results';

  currentSearch = {
    results: null,
    params: {
      query: '',
      page: 1,
    },
  };

  search(query, page) {
    this.currentSearch.params = {
      query: query,
      page: page || 1,
    };

    this.currentSearch.results = super.search(
      this.currentSearch.params,
      '/search/movie'
    );

    return this.currentSearch.results;
  }

  get(id) {
    return super.get(id, movieInCache => !movieInCache.tagline);
  }
}

decorate(MovieStore, {
  currentSearch: observable,
});

export default MovieStore;

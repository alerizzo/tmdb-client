import { RESTClient, LocalStorageClient } from '../lib';
import { observable, decorate } from 'mobx';

import UIStore from './UIStore';
import MovieStore from './MovieStore';
import PeopleStore from './PeopleStore';

class AppStore {
  loading = true;

  settings = {
    refreshRate: 5, // in minutes
  };

  constructor() {
    // create adapters
    this.apiRestClient = new RESTClient(process.env.REACT_APP_TMDB_API_URL);

    this.apiRestClient.apiKey = {
      key: 'api_key',
      value: process.env.REACT_APP_TMDB_API_KEY,
    };

    this.localStorageClient = new LocalStorageClient('tmdb');

    // initialize stores
    this.stores = new Map();

    // Domain stores
    this.stores.set('movies', new MovieStore(this.apiRestClient, this));
    this.stores.set('people', new PeopleStore(this.apiRestClient, this));

    // UI stores
    this.stores.set('ui', new UIStore(this.localStorageClient, this));

    // create easy stores getters
    this.stores.forEach((store, key) => {
      Object.defineProperty(this, key, {
        get: v => store,
      });

      store.updateThreshold = this.settings.refreshRate;
    });

    // grab TMDb API settings just once
    this.apiRestClient.get('/configuration').then(results => {
      this.settings = Object.assign(this.settings, results);
      this.loading = false;
    });
  }

  getPosterURL(path, size) {
    return `${this.settings.images.secure_base_url}${this.settings.images.poster_sizes[size]}${path}`;
  }

  getBackdropURL(path, size) {
    return `${this.settings.images.secure_base_url}${this.settings.images.backdrop_sizes[size]}${path}`;
  }

  getProfileURL(path, size) {
    return `${this.settings.images.secure_base_url}${this.settings.images.profile_sizes[size]}${path}`;
  }
}

decorate(AppStore, {
  loading: observable,
});

export default AppStore;

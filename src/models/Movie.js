import { Model } from '../lib';

export default class Movie extends Model {
  urlRoot = '/movie';

  get year() {
    return this.release_date && this.release_date.substr(0, 4);
  }

  getCrew() {
    return this.appStore.people.search(
      {},
      `/movie/${this.id}/credits`,
      this.id
    );
  }
}

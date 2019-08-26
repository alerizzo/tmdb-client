import { observable, action, toJS, decorate } from 'mobx';

import moment from 'moment';

class Collection {
  items = new Map();
  _lastUpdateAt;
  _status; // empty | first-load | busy | ok | error

  _store;
  _error;
  _onUpdateCallbacks = [];
  _updateCall = 0;

  onCollectionUpdate;

  view;

  constructor(store, view) {
    this._lastUpdateAt = moment('1900-01-01');
    this._status = 'empty';

    this._store = store;

    this.view = view;
  }

  /**
   * Returns a JSON representation
   * of the collection
   */
  toJS() {
    return toJS(this.items);
  }

  /**
   * Returns a shallow array representation
   * of the collection
   */
  toArray() {
    let arr = [];

    this.items.forEach(i => arr.push(i));

    return arr;
  }

  get length() {
    return this.items.size;
  }

  isEmpty() {
    return this._status === 'empty' || this._status === 'first-load';
  }

  isBusy() {
    return this._status === 'busy' || this._status === 'first-load';
  }

  isOk() {
    return this._status === 'ok';
  }

  isError() {
    return this._status === 'error';
  }

  // @action
  clear() {
    this.items.clear();
  }

  find(id) {
    return this.items.get(id.toString());
  }

  // @action
  beginUpdate() {
    this._status = this._status === 'empty' ? 'first-load' : 'busy';
    this._updateCall++;
  }

  // @action
  endUpdate(error, contextData) {
    if (--this._updateCall > 0) return;

    if (error) {
      this._error = error;
      this._status = 'error';
    } else {
      this._status = 'ok';
      this.collectionDidUpdate();
    }

    this._lastUpdateAt = moment();

    while (this._onUpdateCallbacks.length > 0) {
      this._onUpdateCallbacks.shift()(this, error, contextData);
    }
  }

  needsUpdate() {
    if (this._status === 'busy') return false;

    return (
      this._status === 'empty' ||
      moment().diff(this._lastUpdateAt, 'minutes') > this._store.updateThreshold
    );
  }

  // @action
  addOrUpdateModel(model) {
    if (model.id === null) throw new Error('Model must have an ID');

    if (this.items.has(model.id.toString())) {
      let storedModel = this.items.get(model.id.toString());

      //update stored model
      storedModel.set(model.attributes);
      storedModel.endUpdate();

      return storedModel;
    } else {
      this.add(model);
      model.endUpdate();

      return model;
    }
  }

  collectionDidUpdate() {
    this.onCollectionUpdate && this.onCollectionUpdate();
  }

  andThen(_callback) {
    if (this.isOk()) {
      _callback && _callback(this);
      return this;
    }

    if (this.isError()) {
      _callback && _callback(this, this._error);
      return this;
    }

    this._onUpdateCallbacks.push(_callback);

    return this;
  }

  clearCallbacks() {
    this._onUpdateCallbacks = [];
  }

  // @action
  add(model) {
    this.items.set(model.id.toString(), model);
  }

  getContextData() {
    return this._store.viewData(this.view).toJSON();
  }

  get currentPage() {
    return this.getContextData().page;
  }

  get totalRows() {
    return this.getContextData().total;
  }

  get perPageRows() {
    return this.getContextData().perPage;
  }

  get totalPages() {
    const cd = this.getContextData();
    return cd.total / cd.perPage;
  }

  get hasNextPage() {
    return this.currentPage < this.totalPages;
  }
}

decorate(Collection, {
  _lastUpdateAt: observable,
  _status: observable,
  items: observable,
  clear: action,
  beginUpdate: action,
  endUpdate: action,
  addOrUpdateModel: action,
  add: action,
});

export default Collection;

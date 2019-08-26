import { observable, action, decorate } from 'mobx';

import Collection from './Collection';
import DataWrapper from './DataWrapper';

import { hashCode } from '../utils/helpers';

class Store {
  items = new Collection(this); // all items in the store
  views = new Map(); // views contain Collections of items according to UI needs
  contextData = new Map(); // contextData contextual information accoording to UI needs
  fetchResults = new Map(); // stores model-unrelated results; stores DataWrappers

  model = null;
  appStore = null;
  sufix = null;
  adapter = null;
  urlRoot = null;
  resultsKey = null;

  updateThreshold = 2; // minutes -- make this 5

  constructor(adapter, appStore) {
    this.adapter = adapter;
    this.appStore = appStore;

    if (appStore && appStore.settings && appStore.settings.refreshRate) {
      this.updateThreshold = this.appStore.settings.refreshRate;
    }
  }

  get modelRoot() {
    if (this.urlRoot) return this.urlRoot;

    const ModelClass = this.model;
    this.urlRoot = new ModelClass({}, this).urlRoot;

    return this.urlRoot;
  }

  getInnerResult(response) {
    if (this.resultsKey) return response[this.resultsKey] || response;

    return response;
  }

  getContextData(response) {
    if (this.resultsKey) {
      let contextData = Object.assign({}, response);
      delete contextData[this.resultsKey];

      return contextData;
    } else {
      return {};
    }
  }

  view(viewName) {
    let view;

    if (!this.views.has(viewName)) {
      view = new Collection(this, viewName);
      this.views.set(viewName, view);
    } else {
      view = this.views.get(viewName);
    }

    return view;
  }

  viewData(viewName) {
    let viewData;

    if (!this.contextData.has(viewName)) {
      viewData = observable(new Map());
      this.contextData.set(viewName, viewData);
    } else {
      viewData = this.contextData.get(viewName);
    }
    return viewData;
  }

  fetchResult(viewName, defaultData) {
    let view;

    if (!this.fetchResults.has(viewName)) {
      view = new DataWrapper(defaultData, this);
      this.fetchResults.set(viewName, view);
    } else {
      view = this.fetchResults.get(viewName);
    }

    return view;
  }

  getDummy(length = 1) {
    const ModelClass = this.model;
    if (length <= 1) {
      return new ModelClass({}, this);
    } else {
      return Array.from(Array(10)).map(() => new ModelClass({}, this));
    }
  }

  getNew(attrs = {}) {
    const ModelClass = this.model;
    return new ModelClass(attrs, this);
  }

  // @action
  getAll(limit = 1000) {
    return this.search({ per_page: limit }, 'all');
  }

  // @action
  search(filters, apiPath = null, viewName = 'default', forceRefresh = false) {
    const viewFullName = `${viewName}-${hashCode(
      JSON.stringify(filters)
    )}-${this.appStore && this.appStore.loggedInUserKey}`;

    const view = this.view(viewFullName);
    const viewData = this.viewData(viewFullName);

    const url = this.sufix
      ? `${apiPath || this.modelRoot}/${this.sufix}`
      : `${apiPath || this.modelRoot}`;

    if (forceRefresh || view.needsUpdate()) {
      view.beginUpdate();
      const ModelClass = this.model;

      this.adapter.search(url, filters).then(
        res => {
          // clear view
          view.clear();

          //clear viewData
          viewData.clear();

          // get the raw items
          const items = this.getInnerResult(res);
          const contextData = this.getContextData(res);

          // iterate results
          for (var i = 0, l = items.length; i < l; i++) {
            view.add(
              this.items.addOrUpdateModel(new ModelClass(items[i], this))
            );
          }

          viewData.merge(contextData);

          view.endUpdate(null, viewData);

          return view;
        },
        err => {
          view.endUpdate(err);
        }
      );
    }

    return view;
  }

  // @action
  get(id, forceRefresh = false, onFetch = null, filters, apiPath = null) {
    const ModelClass = this.model;
    let item = this.items.find(id);

    if (item === undefined) {
      item = new ModelClass({ id: id }, this);

      this.items.add(item);
    }

    if (
      forceRefresh === true ||
      item.needsUpdate() ||
      (forceRefresh instanceof Function && forceRefresh(item))
    ) {
      item.beginUpdate();
      this.adapter.get(apiPath || this.modelRoot, id, filters).then(
        res => {
          this.items.addOrUpdateModel(
            new ModelClass(this.getInnerResult(res), this)
          );
          item.endUpdate();

          onFetch && onFetch(item);
        },
        err => {
          item.endUpdate(err);
        }
      );
    }

    return item;
  }

  getFirst() {
    const ModelClass = this.model;
    let first = new ModelClass({}, this);
    first.beginUpdate();

    this.search({ per_page: 1 }, 'first').andThen(result => {
      if (result.length > 0) {
        first.set(result.toArray()[0].toJS());
        first.endUpdate();
      } else {
        first.endUpdate(new Error('Collection is empty.'));
      }
    });

    return first;
  }

  save(model, apiPath = null, secure) {
    model.beginUpdate();

    if (model.isNew) {
      this.adapter.post(apiPath || this.modelRoot, model, secure).then(
        res => {
          if (res) {
            model.set(this.getInnerResult(res));
            this.items.addOrUpdateModel(model);
            model.endUpdate();
          }
        },
        err => {
          model.endUpdate(err);
        }
      );
    } else {
      this.adapter.put(apiPath || this.modelRoot, model, null, secure).then(
        res => {
          if (res) {
            model.set(this.getInnerResult(res));
            this.items.addOrUpdateModel(model);
            model.endUpdate();
          }
        },
        err => {
          model.endUpdate(err);
        }
      );
    }
    return model;
  }

  // @action
  destroy(model, apiPath = null) {
    model.beginUpdate();

    this.adapter.delete(apiPath || this.modelRoot, model.id).then(
      res => {
        this.items.addOrUpdateModel(model);
      },
      err => {
        model.endUpdate(err);
      }
    );
  }

  // @action
  fetch(
    action,
    params,
    defaultData = {},
    forceRefresh = false,
    apiPath = null
  ) {
    const viewFullName = `${action}-${hashCode(JSON.stringify(params))}-${this
      .appStore && this.appStore.loggedInUserKey}`;
    let view = this.fetchResult(viewFullName, defaultData);

    if (forceRefresh || view.needsUpdate()) {
      view.beginUpdate();

      this.adapter
        .search(`${apiPath || this.modelRoot}/${action}`, params)
        .then(
          res => {
            // get the raw data
            const data = this.getInnerResult(res);

            view.set(data);

            view.endUpdate();
          },
          err => {
            view.endUpdate(err);
          }
        );
    }

    return view;
  }

  // @action
  store(json) {
    const ModelClass = this.model;
    const modelIdKey = new ModelClass()._primaryKey;

    let item = this.items.find(json[modelIdKey]);

    if (item === undefined) {
      const emptyObj = {};
      emptyObj[modelIdKey] = json[modelIdKey];

      item = new ModelClass(emptyObj, this);

      this.items.add(item);
    }

    item.beginUpdate();

    this.items.addOrUpdateModel(new ModelClass(json, this));

    item.endUpdate();

    return item;
  }

  // @action
  getFromData(itemData) {
    return this.store(itemData);
  }

  // @action
  clear() {
    this.items.clear();

    this.views.forEach((view, key) => {
      view.clear();
    });
    this.views.clear();
  }
}

decorate(Store, {
  items: observable,
  views: observable,
  contextData: observable,
  fetchResults: observable,
  getAll: action,
  search: action,
  get: action,
  getFromData: action,
  save: action,
  destroy: action,
  fetch: action,
  store: action,
  clear: action,
});

export default Store;

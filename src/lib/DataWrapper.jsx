import { observable, action, toJS, decorate } from "mobx";

import moment from "moment";

class DataWrapper {
  attributes = new Map();
  items = [];

  _store = null;
  _error = null;
  _onUpdateCallbacks = [];
  _updateCall = 0;

  _type = "object"; // object | array

  _lastUpdateAt;
  _status; // empty | first-load | busy | ok | error

  constructor(data, store) {
    this._store = store;
    this._status = "empty";

    this.set(data);
  }

  /**
   * DataWrapper shallow serialization
   *
   */
  toJS() {
    return toJS(this._type === "object" ? this.attributes : this.items);
  }

  /**
   * DataWrapper serialization for REST operations
   *
   */
  toParams() {
    return this.toJS();
  }

  isEmpty() {
    return this._status === "empty" || this._status === "first-load";
  }

  isBusy() {
    return this._status === "busy" || this._status === "first-load";
  }

  isOk() {
    return this._status === "ok";
  }

  isError() {
    return this._status === "error";
  }

  get(attribute) {
    if (this.attributes.has(attribute)) {
      return this.attributes.get(attribute);
    }

    return null;
  }

  // @action
  beginUpdate() {
    this._status = this._status === "empty" ? "first-load" : "busy";
    this._updateCall++;
  }

  // @action
  endUpdate(error) {
    if (--this._updateCall > 0) return;

    if (error) {
      this._error = error;
      this._status = "error";
    } else {
      this._status = "ok";
      this.modelDidUpdate();
    }

    while (this._onUpdateCallbacks.length > 0) {
      this._onUpdateCallbacks.shift()(this, error);
    }

    this._lastUpdateAt = moment();
  }

  needsUpdate() {
    if (this._status === "busy") return false;

    return (
      this._status === "empty" ||
      moment().diff(this._lastUpdateAt, "minutes") > this._store.updateThreshold
    ); // this should be parametrized
  }

  transformData(data) {
    return data;
  }

  // @action
  set(data) {
    this._lastUpdateAt = moment();

    this._type = Array.isArray(data) ? "array" : "object";

    if (this._type === "object") {
      this.attributes.merge(this.transformData(data));

      this.attributes.forEach((value, key) => {
        if (this[key] === undefined)
          Object.defineProperty(this, key, {
            set: v => this.attributes.set(key, v),
            get: v => this.get(key)
          });
      });

      this.items.clear();
    } else {
      this.items.replace(this.transformData(data));
      this.attributes.clear();
    }
  }

  modelDidUpdate() {}

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
}

decorate(DataWrapper, {
  _lastUpdateAt: observable,
  _status: observable,
  attributes: observable,
  items: observable,
  beginUpdate: action,
  endUpdate: action,
  set: action
});

export default DataWrapper;

export default class LocalStorageClient {
  namespace = '';

  constructor( namespace ) {
    this.namespace = namespace;
  }

  get(resourcePath, id = null) {
    const stored = localStorage.getItem(`${this.namespace}_${resourcePath}_${ id ? id : 'default'}`);

    if ( stored ) {
      return Promise.resolve(JSON.parse(stored));
    }
    else {
      return Promise.reject( new Error('Not found') );
    }
  }

  post(resourcePath, item) {
    let toStore = JSON.stringify(item.toJS());
    const id = item && item.id;

    localStorage.setItem(`${this.namespace}_${resourcePath}_${ id ? id : 'default'}`, toStore);

    return Promise.resolve(item);
  }

  put(resourcePath, item) {
    return this.post(resourcePath, item);
  }

  delete(resourcePath, id) {
    localStorage.removeItem(`${this.namespace}_${resourcePath}_${ id || 'default'}`)

    return Promise.resolve(id);
  }
}

import { observable, action, decorate } from 'mobx';

import { HTTPError } from '.';

class RESTClient {
  apiURI = '';
  token = null;

  onFetchEnd;
  onFetchStart;
  callQueue = [];

  sendParamsAsJson = false;

  constructor(apiURI, needsAuth = false, token) {
    this.apiURI = apiURI;
    this.token = token;
    this.needsAuth = needsAuth;
  }

  authenticate(authBody, authPath = '/authenticate') {
    return this.sendRequest(authPath, 'POST', authBody, false)
      .then(res => {
        this.token = res.auth_token;
        return res.user;
      })
      .catch(err => Promise.reject(err));
  }

  search(uriPath, filters) {
    if (!this.sendParamsAsJson) {
      return this.sendRequest(
        `${uriPath}${this.getFiltersUrl(filters)}`,
        'GET'
      );
    }

    return this.sendRequest(uriPath, 'GET', filters);
  }

  get(uriPath, id = null, filters) {
    if (!this.sendParamsAsJson) {
      return this.sendRequest(
        id
          ? `${uriPath}/${id}${this.getFiltersUrl(filters)}`
          : `${uriPath}${this.getFiltersUrl(filters)}`,
        'GET'
      );
    }

    return this.sendRequest(`${uriPath}/${id}`, 'GET', filters);
  }

  post(uriPath, item, secure) {
    return this.sendRequest(
      uriPath,
      'POST',
      item.toParams ? item.toParams() : item,
      secure
    );
  }

  put(uriPath, item, itemId = null, secure) {
    return this.sendRequest(
      `${uriPath}/${itemId || item.id}`,
      'PUT',
      item.toParams ? item.toParams() : item,
      secure
    );
  }

  delete(uriPath, id) {
    return this.sendRequest(`${uriPath}/${id}`, 'DELETE');
  }

  sendRequest(
    uriPath,
    method = 'GET',
    params = null,
    secure = true,
    customHeaders = {}
  ) {
    const url = `${this.apiURI}${uriPath}`;

    let headers = {
      'Content-Type': 'application/json',
    };

    let request = {
      method: method,
      headers: headers,
    };

    if (secure && this.needsAuth) {
      headers = Object.assign(
        headers,
        {
          Authorization: `Bearer ${this.token}`,
        },
        customHeaders
      );
    } else {
      headers = Object.assign(headers, customHeaders);
    }

    if (method !== 'GET' && params !== null) {
      request = Object.assign(request, {
        body: JSON.stringify(params),
      });
    } else if (method === 'GET' && this.sendParamsAsJson) {
      request = Object.assign(request, {
        data: JSON.stringify(params),
      });
    }

    let call = fetch(url, request)
      .then(res => {
        if (res.ok) {
          return res
            .json()
            .then(content => {
              this.callQueue.shift();
              this.onFetchEnd && this.onFetchEnd();

              return Promise.resolve(content);
            })
            .catch(err => {
              this.callQueue.shift();
              this.onFetchEnd && this.onFetchEnd();

              return Promise.reject(res); // empty response
            });
        }
        return res.json().then(content => {
          this.callQueue.shift();
          this.onFetchEnd && this.onFetchEnd();

          return Promise.reject(new HTTPError(content.errors || content));
        });
      })
      .catch(err => {
        this.callQueue.shift();
        this.onFetchEnd && this.onFetchEnd();
        return Promise.reject(err);
      });

    this.callQueue.push(call);
    this.onFetchStart && this.onFetchStart();

    return call;
  }

  parseFilterValue(value) {
    if (value._isAMomentObject) {
      return value.toISOString();
    }

    return value;
  }

  getFiltersUrl(filters) {
    let result = [];

    if (this.apiKey) {
      result.push(`${this.apiKey.key}=${this.apiKey.value}`);
    }

    for (var key in filters || {}) {
      if (filters[key] === undefined) {
        result.push(key);
      } else {
        result.push(`${key}=${this.parseFilterValue(filters[key])}`);
      }
    }

    return result.length === 0 ? '' : `?${result.join('&')}`;
  }
}

decorate(RESTClient, {
  token: observable,
  authenticate: action,
  password_recovery: action,
  update_password: action,
});

export default RESTClient;

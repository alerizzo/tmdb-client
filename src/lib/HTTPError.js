export default class HTTPError extends Error {
  response;

  status;
  title;
  innerMessage;
  
  constructor(res) {
    const response = Array.isArray(res) ? res[0] : res;

    super(`${response.status}: ${response.error} (${response.message})`);

    this.response = response;
    this.name = 'HTTPError';

    this.status = response.status;
    this.title = response.error;
    this.innerMessage = response.message;
  }  
}
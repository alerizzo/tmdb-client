import React, { Component } from 'react';

class SearchPage extends Component {
  componentDidMount() {
    document.title = this.props.title || 'TMDb';
  }

  render() {
    const { background, children } = this.props;

    return (
      <div className="page">
        {background && (
          <div className="page-backdrop">
            <img src={background} alt={background} />
          </div>
        )}
        <main>
          <div className="container">{children}</div>
        </main>
        <footer>
          <div className="container">
            <img
              alt="TMDb Logo"
              src="https://www.themoviedb.org/assets/2/v4/logos/primary-green-d70eebe18a5eb5b166d5c1ef0796715b8d1a2cbc698f96d311d62f894ae87085.svg"
            />
            <small>
              This product uses the TMDb API but is not endorsed or certified by
              TMDb.
            </small>
          </div>
        </footer>
      </div>
    );
  }
}

export default SearchPage;

import React, { Component } from 'react';
import { Pane, Spinner, Paragraph } from 'evergreen-ui';
import { withStore } from '../stores';
import { observer } from 'mobx-react';
import { MovieItem, Pager } from './';

const SearchResults = observer(
  class SearchResults extends Component {
    renderLoading() {
      return (
        <Pane
          display="flex"
          alignItems="center"
          justifyContent="center"
          height={400}>
          <Spinner />
        </Pane>
      );
    }

    render() {
      const { query, results, onPageChange } = this.props;

      if (!results || !query) return null;

      if (results.isBusy()) return this.renderLoading();

      const context = results.getContextData();

      return (
        <Pane marginTop={24} marginBottom={48}>
          <Paragraph marginBottom={16} size={500} fontWeight={200}>
            {context.total_results} results for '{query}'
          </Paragraph>
          <Pane marginBottom={36}>
            <div className="columns is-mobile is-multiline">
              {results.toArray().map(movie => (
                <div
                  key={movie.id}
                  className="column is-one-fifth-desktop is-3-tablet is-6-mobile">
                  <MovieItem movie={movie} />
                </div>
              ))}
            </div>
          </Pane>
          <Pane>
            <Pager context={context} onPageChange={onPageChange} />
          </Pane>
        </Pane>
      );
    }
  }
);

export default withStore(SearchResults);

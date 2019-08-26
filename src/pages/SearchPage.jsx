import React, { Component } from 'react';
import { Page, SearchBar, SearchResults } from '../components';
import { withStore } from '../stores';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';

import { Heading } from 'evergreen-ui';

const SearchPage = observer(
  class SearchPage extends Component {
    constructor(props) {
      super(props);

      this.state = {
        ...this.getStateFromParams(),
      };

      this.handleSearch = this.handleSearch.bind(this);
      this.handlePageChange = this.handlePageChange.bind(this);
    }

    getStateFromParams() {
      const params = new URLSearchParams(this.props.location.search);

      return {
        query: params.get('query') || '',
        page: params.get('page') || 1,
      };
    }

    componentDidMount() {
      this.doSearch();
    }

    doSearch() {
      if (this.state.query) {
        this.props.store.movies.search(this.state.query, this.state.page);
      }
    }

    updateURL() {
      this.props.history.push(
        `?query=${this.state.query}&page=${this.state.page}`
      );
    }

    handleSearch(query) {
      this.setState(
        {
          query,
          page: 1,
        },
        () => {
          this.updateURL();
        }
      );
    }

    handlePageChange(page) {
      this.setState(
        {
          page,
        },
        () => {
          this.updateURL();
        }
      );
    }

    componentDidUpdate(prevProps, prevState) {
      if (
        prevState.query !== this.state.query ||
        prevState.page !== this.state.page
      ) {
        this.doSearch();
      }

      // check for URL params change
      const paramsState = this.getStateFromParams();
      if (
        paramsState.query !== this.state.query ||
        paramsState.page !== this.state.page
      ) {
        this.setState(paramsState);
      }
    }

    render() {
      const cs = this.props.store.movies.currentSearch;

      return (
        <Page title="Search movies">
          <Heading size={700} marginTop={96} marginBottom={24}>
            Search movies
          </Heading>
          <SearchBar onSearch={this.handleSearch} query={this.state.query} />
          <SearchResults
            results={cs.results}
            query={this.state.query}
            page={this.state.page}
            onPageChange={this.handlePageChange}
          />
        </Page>
      );
    }
  }
);

export default withRouter(withStore(SearchPage));

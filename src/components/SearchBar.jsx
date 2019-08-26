import React, { Component } from 'react';
import { Pane, SearchInput, Button } from 'evergreen-ui';
import { withStore } from '../stores';
import { observer } from 'mobx-react';

const SearchBar = observer(
  class SearchBar extends Component {
    constructor(props) {
      super(props);

      this.state = {
        query: this.props.query || '',
      };

      this.handleChange = this.handleChange.bind(this);
      this.handleKeyPress = this.handleKeyPress.bind(this);
      this.doSearch = this.doSearch.bind(this);
    }

    handleChange(e) {
      const input = e.target;
      this.setState(state => {
        state[input.name] = input.value;
        return state;
      });
    }

    handleKeyPress(e) {
      if (e.key === 'Enter') {
        this.doSearch();
      }
    }

    doSearch() {
      if (this.state.query !== '') {
        //const result = this.props.store.movies.search(this.state.query);
        this.props.onSearch && this.props.onSearch(this.state.query);
      }
    }

    render() {
      const cs = this.props.store.movies.currentSearch;

      return (
        <Pane flex={1} alignItems="center" display="flex">
          <SearchInput
            placeholder="Search movies..."
            name="query"
            onChange={this.handleChange}
            onKeyPress={this.handleKeyPress}
            value={this.state.query}
            height={40}
            marginRight={8}
            disabled={cs.results && cs.results.isBusy()}
          />
          <Button
            height={40}
            appearance="primary"
            onClick={this.doSearch}
            isLoading={cs.results && cs.results.isBusy()}
            disabled={this.state.query === ''}>
            Search
          </Button>
        </Pane>
      );
    }
  }
);

export default withStore(SearchBar);

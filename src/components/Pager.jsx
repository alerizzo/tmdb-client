import React, { PureComponent } from 'react';
import { Pane, Button, Text } from 'evergreen-ui';

class Pager extends PureComponent {
  constructor(props) {
    super(props);

    this.handlePageClick = this.handlePageClick.bind(this);
  }

  handlePageClick(e) {
    if (e.target.value && this.props.onPageChange) {
      this.props.onPageChange(e.target.value);
    }
  }

  getPages() {
    const context = this.props.context;
    const marginPages = 3;
    const maxTotalPages = 10;

    if (context.total_pages < maxTotalPages) {
      return new Array(context.total_pages).fill(null).map((t, i) => i + 1);
    }

    let pages = [];

    // add first pages
    pages.push(...new Array(marginPages).fill(null).map((t, i) => i + 1));

    // add middle pages
    pages.push(
      ...new Array(1 + marginPages * 2)
        .fill(null)
        .map((t, i) => i + marginPages * -1 + context.page)
    );

    // add final pages
    pages.push(
      ...new Array(marginPages)
        .fill(null)
        .map((t, i) => context.total_pages - i)
    );

    // clean the collection
    pages = [
      ...new Set(
        pages
          .filter(i => i > 0 && i <= context.total_pages)
          .sort((x, y) => x - y)
      ),
    ];

    // add ellipsises where is neccessary
    let result = [];
    let prevPage = 0;

    pages.forEach(p => {
      if (p > prevPage + 1) result.push(null);
      result.push(p);
      prevPage = p;
    });

    return result;
  }

  render() {
    const { context } = this.props;

    return (
      <Pane flex={1} alignItems="center" display="flex">
        {this.getPages().map((page, idx) =>
          page ? (
            <Button
              key={idx}
              value={page}
              onClick={this.handlePageClick}
              disabled={page === context.page}
              appearance="minimal">
              {page}
            </Button>
          ) : (
            <Text key={idx} color="muted">
              ...
            </Text>
          )
        )}
      </Pane>
    );
  }
}

export default Pager;

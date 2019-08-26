import React from 'react';
import AppContext from '../AppContext';

const withStore = Component =>
  class WithStoreHOC extends React.Component {
    render() {
      return (
        <AppContext.Consumer>
          {store => <Component {...this.props} store={store} />}
        </AppContext.Consumer>
      );
    }
  };

export default withStore;

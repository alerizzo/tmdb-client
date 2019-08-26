import React, { Component } from 'react';
import './App.scss';

import { observer } from 'mobx-react';

import AppStore from './stores/AppStore';
import AppContext from './AppContext';
import AppRouter from './AppRouter';

import { Pane, Spinner } from 'evergreen-ui';

const App = observer(
  class App extends Component {
    appStore;

    constructor(props) {
      super(props);
      this.appStore = new AppStore();
    }

    render() {
      return (
        <AppContext.Provider value={this.appStore}>
          {this.appStore.loading ? (
            <Pane
              display="flex"
              alignItems="center"
              justifyContent="center"
              height="100vh">
              <Spinner />
            </Pane>
          ) : (
            <AppRouter />
          )}
        </AppContext.Provider>
      );
    }
  }
);

export default App;

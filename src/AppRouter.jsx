import React, { Component } from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { observer } from 'mobx-react';

// pages
import { SearchPage } from './pages';
import { MoviePage } from './pages';

const AppRouter = observer(
  class AppRouter extends Component {
    render() {
      return (
        <BrowserRouter>
          <Switch>
            <Route exact path={'/'} component={SearchPage} />
            <Route path={'/movie/:id'} component={MoviePage} />

            <Redirect to={'/'} />
          </Switch>
        </BrowserRouter>
      );
    }
  }
);

export default AppRouter;

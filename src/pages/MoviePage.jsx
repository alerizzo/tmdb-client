import React from 'react';
import { Pane, Card, Spinner } from 'evergreen-ui';
import { Page, MovieHeader, MovieSummary, MovieCrew } from '../components';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { withStore } from '../stores';

const MoviePage = observer(
  class MoviePage extends React.Component {
    constructor(props) {
      super(props);
      this.movie = this.props.store.movies.get(this.props.match.params.id);
    }

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
      const movie = this.movie;
      const { store } = this.props;

      if (!movie || movie.isBusy()) return this.renderLoading();

      return (
        <Page
          title={movie.title}
          background={
            movie.backdrop_path && store.getBackdropURL(movie.backdrop_path, 2)
          }>
          <MovieHeader movie={movie} />
          <Card
            elevation={4}
            background="white"
            padding={48}
            marginBottom={48}
            marginLeft={-48}
            marginRight={-48}>
            <MovieSummary movie={movie} />
            <MovieCrew movie={movie} />
          </Card>
        </Page>
      );
    }
  }
);

export default withRouter(withStore(MoviePage));

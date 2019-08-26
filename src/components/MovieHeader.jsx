import React from 'react';
import { withStore } from '../stores';
import { Pane, Button, Heading, Icon, Text } from 'evergreen-ui';
import { Link } from 'react-router-dom';

export default withStore(({ movie, store }) => (
  <div className="columns is-mobile is-multiline pt-5 pb-4 movie-header">
    <div className="column is-8-desktop">
      <Link
        to={`/?query=${store.movies.currentSearch.params.query}&page=${store.movies.currentSearch.params.page}`}>
        <Button appearance="minimal" iconBefore="arrow-left" paddingLeft={0}>
          Go back
        </Button>
      </Link>
      <Heading size={900} marginTop={16} fontWeight={700}>
        <span className="mr-1">{movie.title}</span>
        <span style={{ fontWeight: 200 }}>({movie.year})</span>
      </Heading>
      <Heading size={600} fontWeight="light" marginTop={16}>
        {movie.tagline}
      </Heading>
      <Pane display="flex" marginTop={24} alignItems="baseline">
        <Icon icon="star" color="warning" marginRight="16px" size={16} />
        <Text size={600} fontWeight={700} marginRight="4px">
          {movie.vote_average}{' '}
        </Text>
        <Text size={300} fontWeight={300} marginRight="16px" color="muted">
          of 10
        </Text>
        <Text size={300}>{movie.vote_count} votes</Text>
      </Pane>
    </div>
    <div className="column is-4-desktop">
      <figure className="image is-2by3">
        {movie.poster_path ? (
          <img
            alt={movie.title}
            src={store.getPosterURL(movie.poster_path, 3)}
          />
        ) : (
          <Icon icon="ban-circle" color="#AAA" size={48} />
        )}
      </figure>
    </div>
  </div>
));

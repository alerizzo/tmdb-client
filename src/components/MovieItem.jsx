import React, { PureComponent } from 'react';
import { Icon, Text, Heading, Small, Pane } from 'evergreen-ui';
import { withStore } from '../stores';
import { Link } from 'react-router-dom';

class MovieItem extends PureComponent {
  render() {
    const { movie, store, size } = this.props;

    const commonStyles = {
      color: '#fff',
      display: 'flex',
    };

    return (
      <Pane className="movie-poster">
        <Link to={`/movie/${movie.id}`}>
          <figure className="image is-2by3">
            {movie.poster_path ? (
              <img
                alt={movie.title}
                src={store.getPosterURL(movie.poster_path, size)}
              />
            ) : (
              <Icon icon="ban-circle" color="#AAA" size={48} />
            )}
          </figure>
          <Pane display="flex" flexDirection="column" justifyContent="flex-end">
            <Small size={300} {...commonStyles}>
              {movie.year}
            </Small>
            <Heading
              {...commonStyles}
              size={500}
              maxHeight={40}
              overflow="hidden">
              {movie.title.length > 30
                ? `${movie.title.substr(0, 30)}...`
                : movie.title}
            </Heading>
            <Text size={300} marginTop={8} {...commonStyles}>
              <Icon icon="star" color="#fff" marginRight="8px" size={12} />
              {movie.vote_average} ({movie.vote_count} votes)
            </Text>
          </Pane>
        </Link>
      </Pane>
    );
  }
}

MovieItem.defaultProps = {
  size: 2,
};

export default withStore(MovieItem);

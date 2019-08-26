import React from 'react';
import { withStore } from '../stores';
import { Pane, Text, Paragraph } from 'evergreen-ui';

export default withStore(({ movie, store }) => (
  <div className="columns is-mobile is-multiline">
    <div className="column is-8-desktop">
      <Pane display="flex" marginBottom={16}>
        <Text marginRight={16} fontWeight={700}>
          {movie.genres.map(g => g.name).join(', ')}
        </Text>
        <Text fontWeight={300}>{movie.runtime} minutes</Text>
      </Pane>

      <Paragraph marginBottom={16} size={500}>
        {movie.overview}
      </Paragraph>
    </div>
  </div>
));

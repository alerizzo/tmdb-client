import React from 'react';
import { Pane, Text, Spinner, Heading, Icon } from 'evergreen-ui';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { withStore } from '../stores';

const CrewProfile = ({ person }) => (
  <Pane
    display="flex"
    alignItems="baseline"
    justifyContent="space-between"
    marginTop={8}>
    <Text size={500}>{person.name}</Text>
    <div
      style={{ flexGrow: 1, borderBottom: 'dotted 1px #ccc', margin: '0 8px' }}
    />
    <Text size={300}>{person.job}</Text>
  </Pane>
);

const CastProfile = ({ person, store }) => (
  <Pane
    className="cast-profile"
    display="flex"
    alignItems="center"
    justifyContent="start"
    marginTop={16}
    width="50%">
    <figure className="image mr-2" style={{ width: '45px', height: '68px' }}>
      {person.profile_path ? (
        <img
          src={store.getProfileURL(person.profile_path, 0)}
          alt={person.name}
        />
      ) : (
        <Icon icon="ban-circle" color="#AAA" size={48} />
      )}
    </figure>

    <Pane display="flex" flexDirection="column">
      <Text size={500}>{person.name}</Text>
      <Text size={300}>{person.character}</Text>
    </Pane>
  </Pane>
);

const MovieCrew = observer(
  class MovieCrew extends React.Component {
    constructor(props) {
      super(props);
      this.crew = this.props.movie.getCrew();
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

    renderCredits(arr) {
      const people = arr.filter(p => p.type === 'cast').slice(0, 20);

      if (people.length === 0) return null;

      return (
        <Pane display="flex" flexWrap="wrap">
          {people.map(person => (
            <CastProfile
              key={person.id}
              person={person}
              store={this.props.store}
            />
          ))}
        </Pane>
      );
    }

    renderCrew(title, arr, department, jobs) {
      const people = arr.filter(
        p =>
          p.type === 'crew' &&
          p.department === department &&
          (!jobs || jobs.indexOf(p.job) >= 0)
      );

      if (people.length === 0) return null;

      return (
        <>
          <Heading marginTop={24} size={200}>
            {title}
          </Heading>
          {people.map(person => (
            <CrewProfile key={person.id} person={person} />
          ))}
        </>
      );
    }

    render() {
      const crew = this.crew;

      if (!crew || crew.isBusy()) return this.renderLoading();

      const crewArray = crew.toArray();

      return (
        <div className="columns is-mobile is-multiline mb-5">
          <div className="column is-8-desktop is-12-tablet is-12-mobile">
            <Heading size={200} marginTop={24}>
              Credits
            </Heading>
            {this.renderCredits(crewArray)}
          </div>
          <div className="column is-4-desktop is-12-tablet is-12-mobile">
            {this.renderCrew('Directed by', crewArray, 'Directing', [
              'Director',
            ])}
            {this.renderCrew('Written by', crewArray, 'Writing')}
            {this.renderCrew('Photography by', crewArray, 'Camera', [
              'Director of Photography',
            ])}
            {this.renderCrew('Sound by', crewArray, 'Sound', [
              'Original Music Composer',
            ])}
            {this.renderCrew('Art Direction by', crewArray, 'Art', [
              'Art Direction',
            ])}
            {this.renderCrew('Produced by', crewArray, 'Production', [
              'Producer',
            ])}
          </div>
        </div>
      );
    }
  }
);

export default withRouter(withStore(MovieCrew));

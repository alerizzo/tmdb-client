import React from 'react';
import { Pane, Text, Spinner, Heading } from 'evergreen-ui';
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

    renderCredits(arr) {}

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
        <div className="columns is-mobile is-multiline">
          <div className="column is-8-desktop">
            <Heading size={200}>Credits</Heading>
            {this.renderCredits(crewArray)}
          </div>
          <div className="column is-4-desktop">
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

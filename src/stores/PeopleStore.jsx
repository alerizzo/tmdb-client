import { Store } from '../lib';
import { People } from '../models';

class PeopleStore extends Store {
  model = People;

  getInnerResult(response) {
    let result = [];

    if (response.results) result.push(...response.results);
    if (response.cast)
      result.push(
        ...response.cast.map(cast => ({
          type: 'cast',
          ...cast,
          id: cast.credit_id,
        }))
      );
    if (response.crew)
      result.push(
        ...response.crew.map(crew => ({
          type: 'crew',
          ...crew,
          id: crew.credit_id,
        }))
      );

    return result;
  }
}

export default PeopleStore;

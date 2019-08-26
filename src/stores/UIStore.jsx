import { Store } from '../lib';
import { UISettings } from '../models';

class UIStore extends Store {
  model = UISettings;
  urlRoot = 'UI';

  get settings() {
    return this.get('local') || new UISettings({}, this);
  }
}

export default UIStore;

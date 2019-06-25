

import { appStore, render } from './app.js';
import { connectToSocket } from './connection.js';

(function main() {
  connectToSocket(appStore);
  render();
})();

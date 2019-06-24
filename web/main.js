

import { appStore, render } from './app.js';
import { connectToSocket } from './connection.js';

connectToSocket(appStore);
render();

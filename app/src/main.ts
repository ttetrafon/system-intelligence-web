// styles
import './styles/style.css';
// data
import { AppName } from './util/constants';
import { domainRoot } from './data/config';
import { aliases, routes } from './data/routes';
// components
// services
import { Logger } from 'lib/services/logger';
import { Navigator } from 'lib/services/navigator';
import { State } from 'lib/services/state';

const logger: Logger = Logger.getInstance();
logger.setLevel('debug');

document.body.classList.add('app-loading');

State.getInstance(AppName);
Navigator.getInstance(domainRoot, '#app', routes, aliases);

setTimeout(() => {
  document.body.classList.remove('app-loading');
}, 300);

// components
import './components/header/si-header';
import './components/footer/si-footer';
// styles
import './styles/style.css';
// services
import { Logger } from '../library/lib/services/logger';

const l: Logger = Logger.getInstance();
l.setLevel('error');
l.info("Starting...!");

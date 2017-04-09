import fs from 'fs';
import path from 'path';
import React from 'react';
import { Provider } from 'react-redux';
import bowser from 'bowser';
import createApplicationStore from '../createApplicationStore';
import { includeStoreInBugReports } from '../util/Bugsnag';
import Workspace from './Workspace';
import BrowserError from './BrowserError';
import {getSnapshotFromLocalStorage, persistSnapshotToLocalStorage } from '../actions/index'

const supportedBrowsers = JSON.parse(fs.readFileSync(
  path.join(__dirname, '../../config/browsers.json'),
));

class Application extends React.Component {
  constructor() {
    super();
    const store = createApplicationStore();
    this.state = { store };
    includeStoreInBugReports(store);
    this.handleLoad = this.handleLoad.bind(this);
    this.handleUnload = this.handleUnload.bind(this);
  }

  componentDidMount() {
    window.onload = this.handleLoad;
    window.onunload = this.handleUnload;

    // window.addEventListener('onload', this.handleLoad);
    // window.addEventListener('onunload', this.handleUnload);
  }
  componentWillUnmount() {
    window.removeEventListener('onload', this.handleLoad);
    window.removeEventListener('onunload', this.handleUnload);
  }
  handleLoad() {
    console.log('load event');
    this.state.store.dispatch(getSnapshotFromLocalStorage())
  }
  handleUnload() {
    console.log('unload event');
    this.state.store.dispatch(persistSnapshotToLocalStorage())
  }

  _isUnsupportedBrowser() {
    return bowser.isUnsupportedBrowser(
      supportedBrowsers,
      true,
      window.navigator.userAgent,
    );
  }

  render() {
    if (this._isUnsupportedBrowser()) {
      return <BrowserError browser={bowser} />;
    }

    return (
      <Provider store={this.state.store}>
        <Workspace />
      </Provider>
    );
  }
}

export default Application;

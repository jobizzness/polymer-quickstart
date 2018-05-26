

import { PolymerElement, html } from '@polymer/polymer/polymer-element';

import '@polymer/app-layout/app-drawer/app-drawer.js';
import '@polymer/app-layout/app-header/app-header.js';
import '@polymer/app-layout/app-scroll-effects/effects/waterfall.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';
import { setPassiveTouchGestures } from '@polymer/polymer/lib/utils/settings.js';

import { menuIcon } from '../my-icons.js';
import '../snack-bar.js';

import { connect } from 'pwa-helpers/connect-mixin.js';
import { installRouter } from 'pwa-helpers/router.js';
import { installOfflineWatcher } from 'pwa-helpers/network.js';
import { installMediaQueryWatcher } from 'pwa-helpers/media-query.js';
import { updateMetadata } from 'pwa-helpers/metadata.js';

import { store } from '../../store.js';
import { navigate, updateOffline, updateDrawerState, updateLayout } from '../../actions/app.js';
import template from './template.html';

class MyApp extends connect(store)(PolymerElement) {
  static get template() {
    return html([`${template}`]);
  }

static get properties() {
  return {
    appTitle: String,
    _page: String,
    _drawerOpened: Boolean,
    _snackbarOpened: Boolean,
    _offline: Boolean
  }
}

constructor() {
  super();
  // To force all event listeners for gestures to be passive.
  // See https://www.polymer-project.org/2.0/docs/devguide/gesture-events#use-passive-gesture-listeners
  setPassiveTouchGestures(true);
}

connectedCallback() {
  super.connectedCallback();
  installRouter((location) => store.dispatch(navigate(window.decodeURIComponent(location.pathname))));
  installOfflineWatcher((offline) => store.dispatch(updateOffline(offline)));
  installMediaQueryWatcher(`(min-width: 460px)`,
    (matches) => store.dispatch(updateLayout(matches)));
}

  is_selected(_page, view){
    return _page === view;
  }
_didRender(properties, changeList) {
  if ('_page' in changeList) {
    const pageTitle = properties.appTitle + ' - ' + changeList._page;
    updateMetadata({
      title: pageTitle,
      description: pageTitle
      // This object also takes an image property, that points to an img src.
    });
  }
}

_stateChanged(state) {
  this._page = state.app.page;
  this._offline = state.app.offline;
  this._snackbarOpened = state.app.snackbarOpened;
  this._drawerOpened = state.app.drawerOpened;
}
}

window.customElements.define('sk-app', MyApp);
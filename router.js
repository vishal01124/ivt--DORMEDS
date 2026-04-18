/* ================================================
   DORMEDS - Hash-based Router
   ================================================ */

var Router = (function() {
  function Router() {
    this._routes = {};
    this._currentRoute = null;
    this._beforeEach = null;
    var self = this;
    window.addEventListener('hashchange', function() { self._handleRoute(); });
  }

  Router.prototype.on = function(path, handler) {
    this._routes[path] = handler;
    return this;
  };

  Router.prototype.beforeEach = function(fn) {
    this._beforeEach = fn;
    return this;
  };

  Router.prototype.navigate = function(path) {
    window.location.hash = path;
  };

  Router.prototype.current = function() {
    return this._currentRoute;
  };

  Router.prototype.start = function() {
    this._handleRoute();
  };

  Router.prototype._handleRoute = function() {
    var hash = window.location.hash.slice(1) || '/login';
    var path = hash.split('?')[0];

    if (this._beforeEach) {
      var allowed = this._beforeEach(path, this._currentRoute);
      if (allowed === false) return;
    }

    this._currentRoute = path;

    var handler = this._routes[path];
    if (handler) {
      handler();
    } else {
      var fallback = this._routes['/login'];
      if (fallback) fallback();
    }
  };

  return Router;
})();

var router = new Router();

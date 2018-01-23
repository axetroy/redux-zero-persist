const key_prefix = "persist:";

function _() {}

function mapStateToStorage(store, config) {
  const state = store.getState();
  return new Promise(function(resolve, reject) {
    config.storage.setItem(
      key_prefix + config.key,
      JSON.stringify(state),
      function(err) {
        err ? reject(err) : resolve(state);
      }
    );
  });
}

function mapStorageToState(state, config, cb) {
  config.storage.getItem(key_prefix + config.key, function(err, value) {
    cb(err, Object.assign({}, state, JSON.parse(value)));
  });
}

function Storage() {}

Storage.prototype.getItem = function(key, cb) {
  const val = localStorage.getItem(key);
  setTimeout(function() {
    cb(null, val);
  });
};

Storage.prototype.setItem = function(key, item, cb) {
  localStorage.setItem(key, item);
  setTimeout(function() {
    cb(null, val);
  });
};

Storage.prototype.removeItem = function(key) {
  localStorage.removeItem(key);
  setTimeout(function() {
    cb(null);
  });
};

function persist(config, cb) {
  cb = cb || _;
  config = config || { key: "[rz]", storage: new Storage() };
  mapStorageToState({}, config, cb);

  // return middleware
  return function(store) {
    return function(next) {
      return function(action) {
        const r = next(action);
        if (r && typeof r.then === "function") {
          return next(action).then(function(d) {
            return mapStateToStorage(store, config).then(function() {
              return Promise.resolve(d);
            });
          });
        } else {
          return mapStateToStorage(store, config).then(function() {
            return Promise.resolve(r);
          });
        }
      };
    };
  };
}

module.exports = persist;

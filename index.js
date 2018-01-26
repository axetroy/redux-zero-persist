const key_prefix = "persist:";

function mapStateToStorage(store, config) {
  const state = store.getState();
  return new Promise((resolve, reject) => {
    config.storage.setItem(
      key_prefix + config.key,
      JSON.stringify(state),
      err => (err ? reject(err) : resolve(state))
    );
  });
}

function mapStorageToState(state, config, cb) {
  config.storage.getItem(key_prefix + config.key, (err, value) =>
    cb(err, Object.assign({}, state, JSON.parse(value)))
  );
}

function Storage() {}

Storage.prototype.getItem = function(key, cb) {
  const val = localStorage.getItem(key);
  setTimeout(() => cb(null, val));
};

Storage.prototype.setItem = function(key, item, cb) {
  localStorage.setItem(key, item);
  setTimeout(() => cb(null, val));
};

Storage.prototype.removeItem = function(key) {
  localStorage.removeItem(key);
  setTimeout(() => cb(null));
};

function persist(
  config = { key: "[rc]", storage: new Storage() },
  cb = () => {}
) {
  mapStorageToState({}, config, cb);

  // return middleware
  return state => next => action => {
    const r = next(action);
    if (r && typeof r.then === "function") {
      return next(action).then(d => {
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
}

module.exports = persist;

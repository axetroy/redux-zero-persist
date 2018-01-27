const key_prefix = "persist:";

/**
 * map state to storage
 * @param store
 * @param config
 * @returns {Promise<any>}
 */
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

/**
 * map storage to state
 * @param state
 * @param config
 * @param cb
 */
function mapStorageToState(state, config, cb) {
  config.storage.getItem(key_prefix + config.key, (err, value) =>
    cb(err, Object.assign({}, state, JSON.parse(value)))
  );
}

/**
 * Memory key-value storage
 */
class MemoryStorage {
  constructor() {
    this.store = {};
  }
  getItem(key, cb) {
    setTimeout(() => cb(null, this.store[key]));
  }
  setItem(key, item, cb) {
    setTimeout(() => cb(null, (this.store[key] = item + "") && item));
  }
  removeItem(key, cb) {
    const val = this.store[key];
    setTimeout(() => cb(null, delete this.store[key] && val));
  }
}

function persist(
  config = { key: "[rc]", storage: new MemoryStorage() },
  cb = () => {}
) {
  mapStorageToState({}, config, function(err, state) {
    if (err) {
      config.storage.removeItem(key_prefix + config.key, function(_err) {
        cb(_err, state);
      });
    } else {
      cb(err, state);
    }
  });

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
module.exports.default = persist;
module.exports.MemoryStorage = MemoryStorage;

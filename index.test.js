import test from 'ava';
import { promisify } from 'util';

import createStore from 'redux-zero';
import { applyMiddleware } from 'redux-zero/middleware';

import persist, { MemoryStorage } from './index';

console.log('pid:' + process.pid);

function sleep(ms) {
  return new Promise((resolve,reject)=>{
    setTimeout(function () {
      resolve(ms);
    },ms)
  })
}

test('Basic', async t => {
  const initialState = {};

  const storage = new MemoryStorage();

  // use default storage
  const persistMiddleware = persist(
    { key: '[key]', storage: storage },
    function(err, state) {
      if (err) {
        console.error(err);
      } else {
        store.setState(state);
      }
    }
  );

  const middlewares = applyMiddleware(persistMiddleware);

  const store = createStore(initialState, middlewares);

  store.subscribe(state => {
    storage.setItem('persist:[key]', state);
  });

  store.setState({
    word: 'hello world'
  });

  t.deepEqual(store.getState().word, 'hello world');

  await sleep(1000);

  const storageState = await promisify(storage.getItem).call(storage, 'persist:[key]');

  t.deepEqual(storageState.word, 'hello world');

  t.pass();
});

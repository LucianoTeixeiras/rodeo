import _ from 'lodash';
import path from 'path';

/**
 * @param {string} filename
 * @returns {string}
 * @example const typePrefix = fromFilenameToPrefix(__filename);
 */
function fromFilenameToPrefix(filename) {
  let name = path.parse(filename).name.split('.')[0];

  return toConstantCase(name) + '_';
}

function toConstantCase(str) {
  return _.toUpper(_.snakeCase(str));
}

function addPrefixToKeys(prefix, obj) {
  return _.reduce(obj, (newObj, value, key) => {
    newObj[prefix + key] = value;

    return newObj;
  }, {});
}

function convertKeysToConstantCase(obj) {
  return _.reduce(obj, (newObj, value, key) => {
    newObj[key] = toConstantCase(value);

    return newObj;
  }, {});
}

/**
 * Scope each reducer to within xpath
 * @param xpath
 * @param reducer
 * @returns {Object}
 */
function scopeReducer(xpath, reducer) {
  return _.mapValues(reducer, (fn) => {
    return (state, action) => _.set(state, xpath, fn(_.get(xpath, state), action));
  });
}

/**
 * Scope each reducer to within the content of a tab
 * @param {object }reducer
 * @returns {object}
 */
function tabReducer(reducer) {
  return function (state, action) {

    if (!state) {
      return [];
    }

    const groups = state;

    for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
      const group = groups[groupIndex];

      if (action.groupId === group.groupId || action.groupId === undefined) {
        const tabs = group.tabs;

        for (let tabIndex = 0; tabIndex < tabs.length; tabIndex++) {
          const tab = tabs[tabIndex];

          if (action.id === tab.id || action.id === undefined) {
            const xpath = [groupIndex, 'tabs', tabIndex, 'content'],
              target = _.get(state, xpath),
              newState = target && reducer(_.get(state, xpath), action);

            if (target && newState !== state) {
              state = state.setIn([groupIndex, 'tabs', tabIndex, 'content'], newState);
            }
          }
        }
      }
    }

    return state;
  };
}

/**
 * @param {...function} reducers
 * @return {function}
 * @see https://github.com/acdlite/reduce-reducers/blob/master/src/index.js
 */
function reduceReducers(...reducers) {
  return function (state, action) {
    return reducers.reduce((state, reducer) => reducer(state, action), state);
  };
}

export default {
  addPrefixToKeys,
  convertKeysToConstantCase,
  fromFilenameToPrefix,
  reduceReducers,
  scopeReducer,
  tabReducer,
  toConstantCase
};

"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PubSubAsyncIterator = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _iterall = require("iterall");

/**
 * A class for digesting PubSubEngine events via the new AsyncIterator interface.
 * This implementation is a generic version of the one located at
 * https://github.com/apollographql/graphql-subscriptions/blob/master/src/event-emitter-to-async-iterator.ts
 * @class
 *
 * @constructor
 *
 * @property pullQueue @type {Function[]}
 * A queue of resolve functions waiting for an incoming event which has not yet arrived.
 * This queue expands as next() calls are made without PubSubEngine events occurring in between.
 *
 * @property pushQueue @type {any[]}
 * A queue of PubSubEngine events waiting for next() calls to be made.
 * This queue expands as PubSubEngine events arrice without next() calls occurring in between.
 *
 * @property eventsArray @type {string[]}
 * An array of PubSubEngine event names which this PubSubAsyncIterator should watch.
 *
 * @property allSubscribed @type {Promise<number[]>}
 * A promise of a list of all subscription ids to the passed PubSubEngine.
 *
 * @property listening @type {boolean}
 * Whether or not the PubSubAsynIterator is in listening mode (responding to incoming PubSubEngine events and next() calls).
 * Listening begins as true and turns to false once the return method is called.
 *
 * @property pubsub @type {PubSubEngine}
 * The PubSubEngine whose events will be observed.
 */
var PubSubAsyncIterator =
/*#__PURE__*/
function () {
  function PubSubAsyncIterator(pubsub, eventNames) {
    (0, _classCallCheck2.default)(this, PubSubAsyncIterator);
    (0, _defineProperty2.default)(this, "pullQueue", void 0);
    (0, _defineProperty2.default)(this, "pushQueue", void 0);
    (0, _defineProperty2.default)(this, "eventsArray", void 0);
    (0, _defineProperty2.default)(this, "allSubscribed", void 0);
    (0, _defineProperty2.default)(this, "listening", void 0);
    (0, _defineProperty2.default)(this, "pubsub", void 0);
    this.pubsub = pubsub;
    this.pullQueue = [];
    this.pushQueue = [];
    this.listening = true;
    this.eventsArray = typeof eventNames === 'string' ? [eventNames] : eventNames;
    this.allSubscribed = this.subscribeAll();
  }

  (0, _createClass2.default)(PubSubAsyncIterator, [{
    key: "next",
    value: function () {
      var _next = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee() {
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.allSubscribed;

              case 2:
                return _context.abrupt("return", this.listening ? this.pullValue() : this.return());

              case 3:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function next() {
        return _next.apply(this, arguments);
      }

      return next;
    }()
  }, {
    key: "return",
    value: function () {
      var _return2 = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee2() {
        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.t0 = this;
                _context2.next = 3;
                return this.allSubscribed;

              case 3:
                _context2.t1 = _context2.sent;

                _context2.t0.emptyQueue.call(_context2.t0, _context2.t1);

                return _context2.abrupt("return", {
                  value: undefined,
                  done: true
                });

              case 6:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function _return() {
        return _return2.apply(this, arguments);
      }

      return _return;
    }()
  }, {
    key: "throw",
    value: function () {
      var _throw2 = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee3(err) {
        return _regenerator.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.t0 = this;
                _context3.next = 3;
                return this.allSubscribed;

              case 3:
                _context3.t1 = _context3.sent;

                _context3.t0.emptyQueue.call(_context3.t0, _context3.t1);

                return _context3.abrupt("return", Promise.reject(err));

              case 6:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function _throw(_x) {
        return _throw2.apply(this, arguments);
      }

      return _throw;
    }()
  }, {
    key: _iterall.$$asyncIterator,
    value: function value() {
      return this;
    }
  }, {
    key: "pushValue",
    value: function () {
      var _pushValue = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee4(event) {
        var element;
        return _regenerator.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this.allSubscribed;

              case 2:
                if (this.pullQueue.length !== 0) {
                  element = this.pullQueue.shift();

                  if (element) {
                    element({
                      value: event,
                      done: false
                    });
                  }
                } else {
                  this.pushQueue.push(event);
                }

              case 3:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function pushValue(_x2) {
        return _pushValue.apply(this, arguments);
      }

      return pushValue;
    }()
  }, {
    key: "pullValue",
    value: function pullValue() {
      var _this = this;

      return new Promise(function (resolve) {
        if (_this.pushQueue.length !== 0) {
          resolve({
            value: _this.pushQueue.shift(),
            done: false
          });
        } else {
          _this.pullQueue.push(resolve);
        }
      });
    }
  }, {
    key: "emptyQueue",
    value: function emptyQueue(subscriptionIds) {
      if (this.listening) {
        this.listening = false;
        this.unsubscribeAll(subscriptionIds);
        this.pullQueue.forEach(function (resolve) {
          return resolve({
            value: undefined,
            done: true
          });
        });
        this.pullQueue.length = 0;
        this.pushQueue.length = 0;
      }
    }
  }, {
    key: "subscribeAll",
    value: function subscribeAll() {
      var _this2 = this;

      return Promise.all(this.eventsArray.map(function (eventName) {
        return _this2.pubsub.subscribe(eventName, _this2.pushValue.bind(_this2), {});
      }));
    }
  }, {
    key: "unsubscribeAll",
    value: function unsubscribeAll(subscriptionIds) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = subscriptionIds[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var subscriptionId = _step.value;
          this.pubsub.unsubscribe(subscriptionId);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }]);
  return PubSubAsyncIterator;
}();

exports.PubSubAsyncIterator = PubSubAsyncIterator;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wdWJzdWItYXN5bmMtaXRlcmF0b3IudHMiXSwibmFtZXMiOlsiUHViU3ViQXN5bmNJdGVyYXRvciIsInB1YnN1YiIsImV2ZW50TmFtZXMiLCJwdWxsUXVldWUiLCJwdXNoUXVldWUiLCJsaXN0ZW5pbmciLCJldmVudHNBcnJheSIsImFsbFN1YnNjcmliZWQiLCJzdWJzY3JpYmVBbGwiLCJwdWxsVmFsdWUiLCJyZXR1cm4iLCJlbXB0eVF1ZXVlIiwidmFsdWUiLCJ1bmRlZmluZWQiLCJkb25lIiwiZXJyIiwiUHJvbWlzZSIsInJlamVjdCIsIiQkYXN5bmNJdGVyYXRvciIsImV2ZW50IiwibGVuZ3RoIiwiZWxlbWVudCIsInNoaWZ0IiwicHVzaCIsInJlc29sdmUiLCJzdWJzY3JpcHRpb25JZHMiLCJ1bnN1YnNjcmliZUFsbCIsImZvckVhY2giLCJhbGwiLCJtYXAiLCJldmVudE5hbWUiLCJzdWJzY3JpYmUiLCJwdXNoVmFsdWUiLCJiaW5kIiwic3Vic2NyaXB0aW9uSWQiLCJ1bnN1YnNjcmliZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOztBQUdBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQTZCYUEsbUI7OztBQVNYLCtCQUFZQyxNQUFaLEVBQWtDQyxVQUFsQyxFQUFpRTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQy9ELFNBQUtELE1BQUwsR0FBY0EsTUFBZDtBQUNBLFNBQUtFLFNBQUwsR0FBaUIsRUFBakI7QUFDQSxTQUFLQyxTQUFMLEdBQWlCLEVBQWpCO0FBQ0EsU0FBS0MsU0FBTCxHQUFpQixJQUFqQjtBQUNBLFNBQUtDLFdBQUwsR0FBbUIsT0FBT0osVUFBUCxLQUFzQixRQUF0QixHQUFpQyxDQUFDQSxVQUFELENBQWpDLEdBQWdEQSxVQUFuRTtBQUNBLFNBQUtLLGFBQUwsR0FBcUIsS0FBS0MsWUFBTCxFQUFyQjtBQUNEOzs7Ozs7Ozs7Ozs7O3VCQUdPLEtBQUtELGE7Oztp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QUFBQTtBQUlqRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7ICQkYXN5bmNJdGVyYXRvciB9IGZyb20gJ2l0ZXJhbGwnO1xuaW1wb3J0IHsgUHViU3ViRW5naW5lIH0gZnJvbSAnZ3JhcGhxbC1zdWJzY3JpcHRpb25zJztcblxuLyoqXG4gKiBBIGNsYXNzIGZvciBkaWdlc3RpbmcgUHViU3ViRW5naW5lIGV2ZW50cyB2aWEgdGhlIG5ldyBBc3luY0l0ZXJhdG9yIGludGVyZmFjZS5cbiAqIFRoaXMgaW1wbGVtZW50YXRpb24gaXMgYSBnZW5lcmljIHZlcnNpb24gb2YgdGhlIG9uZSBsb2NhdGVkIGF0XG4gKiBodHRwczovL2dpdGh1Yi5jb20vYXBvbGxvZ3JhcGhxbC9ncmFwaHFsLXN1YnNjcmlwdGlvbnMvYmxvYi9tYXN0ZXIvc3JjL2V2ZW50LWVtaXR0ZXItdG8tYXN5bmMtaXRlcmF0b3IudHNcbiAqIEBjbGFzc1xuICpcbiAqIEBjb25zdHJ1Y3RvclxuICpcbiAqIEBwcm9wZXJ0eSBwdWxsUXVldWUgQHR5cGUge0Z1bmN0aW9uW119XG4gKiBBIHF1ZXVlIG9mIHJlc29sdmUgZnVuY3Rpb25zIHdhaXRpbmcgZm9yIGFuIGluY29taW5nIGV2ZW50IHdoaWNoIGhhcyBub3QgeWV0IGFycml2ZWQuXG4gKiBUaGlzIHF1ZXVlIGV4cGFuZHMgYXMgbmV4dCgpIGNhbGxzIGFyZSBtYWRlIHdpdGhvdXQgUHViU3ViRW5naW5lIGV2ZW50cyBvY2N1cnJpbmcgaW4gYmV0d2Vlbi5cbiAqXG4gKiBAcHJvcGVydHkgcHVzaFF1ZXVlIEB0eXBlIHthbnlbXX1cbiAqIEEgcXVldWUgb2YgUHViU3ViRW5naW5lIGV2ZW50cyB3YWl0aW5nIGZvciBuZXh0KCkgY2FsbHMgdG8gYmUgbWFkZS5cbiAqIFRoaXMgcXVldWUgZXhwYW5kcyBhcyBQdWJTdWJFbmdpbmUgZXZlbnRzIGFycmljZSB3aXRob3V0IG5leHQoKSBjYWxscyBvY2N1cnJpbmcgaW4gYmV0d2Vlbi5cbiAqXG4gKiBAcHJvcGVydHkgZXZlbnRzQXJyYXkgQHR5cGUge3N0cmluZ1tdfVxuICogQW4gYXJyYXkgb2YgUHViU3ViRW5naW5lIGV2ZW50IG5hbWVzIHdoaWNoIHRoaXMgUHViU3ViQXN5bmNJdGVyYXRvciBzaG91bGQgd2F0Y2guXG4gKlxuICogQHByb3BlcnR5IGFsbFN1YnNjcmliZWQgQHR5cGUge1Byb21pc2U8bnVtYmVyW10+fVxuICogQSBwcm9taXNlIG9mIGEgbGlzdCBvZiBhbGwgc3Vic2NyaXB0aW9uIGlkcyB0byB0aGUgcGFzc2VkIFB1YlN1YkVuZ2luZS5cbiAqXG4gKiBAcHJvcGVydHkgbGlzdGVuaW5nIEB0eXBlIHtib29sZWFufVxuICogV2hldGhlciBvciBub3QgdGhlIFB1YlN1YkFzeW5JdGVyYXRvciBpcyBpbiBsaXN0ZW5pbmcgbW9kZSAocmVzcG9uZGluZyB0byBpbmNvbWluZyBQdWJTdWJFbmdpbmUgZXZlbnRzIGFuZCBuZXh0KCkgY2FsbHMpLlxuICogTGlzdGVuaW5nIGJlZ2lucyBhcyB0cnVlIGFuZCB0dXJucyB0byBmYWxzZSBvbmNlIHRoZSByZXR1cm4gbWV0aG9kIGlzIGNhbGxlZC5cbiAqXG4gKiBAcHJvcGVydHkgcHVic3ViIEB0eXBlIHtQdWJTdWJFbmdpbmV9XG4gKiBUaGUgUHViU3ViRW5naW5lIHdob3NlIGV2ZW50cyB3aWxsIGJlIG9ic2VydmVkLlxuICovXG5leHBvcnQgY2xhc3MgUHViU3ViQXN5bmNJdGVyYXRvcjxUPiBpbXBsZW1lbnRzIEFzeW5jSXRlcmF0b3I8VD4ge1xuXG4gIHByaXZhdGUgcHVsbFF1ZXVlOiBGdW5jdGlvbltdO1xuICBwcml2YXRlIHB1c2hRdWV1ZTogYW55W107XG4gIHByaXZhdGUgZXZlbnRzQXJyYXk6IHN0cmluZ1tdO1xuICBwcml2YXRlIGFsbFN1YnNjcmliZWQ6IFByb21pc2U8bnVtYmVyW10+O1xuICBwcml2YXRlIGxpc3RlbmluZzogYm9vbGVhbjtcbiAgcHJpdmF0ZSBwdWJzdWI6IFB1YlN1YkVuZ2luZTtcblxuICBjb25zdHJ1Y3RvcihwdWJzdWI6IFB1YlN1YkVuZ2luZSwgZXZlbnROYW1lczogc3RyaW5nIHwgc3RyaW5nW10pIHtcbiAgICB0aGlzLnB1YnN1YiA9IHB1YnN1YjtcbiAgICB0aGlzLnB1bGxRdWV1ZSA9IFtdO1xuICAgIHRoaXMucHVzaFF1ZXVlID0gW107XG4gICAgdGhpcy5saXN0ZW5pbmcgPSB0cnVlO1xuICAgIHRoaXMuZXZlbnRzQXJyYXkgPSB0eXBlb2YgZXZlbnROYW1lcyA9PT0gJ3N0cmluZycgPyBbZXZlbnROYW1lc10gOiBldmVudE5hbWVzO1xuICAgIHRoaXMuYWxsU3Vic2NyaWJlZCA9IHRoaXMuc3Vic2NyaWJlQWxsKCk7XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgbmV4dCgpIHtcbiAgICBhd2FpdCB0aGlzLmFsbFN1YnNjcmliZWQ7XG4gICAgcmV0dXJuIHRoaXMubGlzdGVuaW5nID8gdGhpcy5wdWxsVmFsdWUoKSA6IHRoaXMucmV0dXJuKCk7XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgcmV0dXJuKCk6IFByb21pc2U8SXRlcmF0b3JSZXN1bHQ8YW55Pj4ge1xuICAgIHRoaXMuZW1wdHlRdWV1ZShhd2FpdCB0aGlzLmFsbFN1YnNjcmliZWQpO1xuICAgIHJldHVybiB7IHZhbHVlOiB1bmRlZmluZWQsIGRvbmU6IHRydWUgfTtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyB0aHJvdyhlcnI6IGFueSkge1xuICAgIHRoaXMuZW1wdHlRdWV1ZShhd2FpdCB0aGlzLmFsbFN1YnNjcmliZWQpO1xuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnIpO1xuICB9XG5cbiAgcHVibGljIFskJGFzeW5jSXRlcmF0b3JdKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBwdXNoVmFsdWUoZXZlbnQ6IGFueSkge1xuICAgIGF3YWl0IHRoaXMuYWxsU3Vic2NyaWJlZDtcbiAgICBpZiAodGhpcy5wdWxsUXVldWUubGVuZ3RoICE9PSAwKSB7XG4gICAgICBsZXQgZWxlbWVudCA9IHRoaXMucHVsbFF1ZXVlLnNoaWZ0KCk7XG4gICAgICBpZiAoZWxlbWVudCkge1xuICAgICAgICBlbGVtZW50KHsgdmFsdWU6IGV2ZW50LCBkb25lOiBmYWxzZSB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wdXNoUXVldWUucHVzaChldmVudCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBwdWxsVmFsdWUoKTogUHJvbWlzZTxJdGVyYXRvclJlc3VsdDxhbnk+PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgaWYgKHRoaXMucHVzaFF1ZXVlLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICByZXNvbHZlKHsgdmFsdWU6IHRoaXMucHVzaFF1ZXVlLnNoaWZ0KCksIGRvbmU6IGZhbHNlIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5wdWxsUXVldWUucHVzaChyZXNvbHZlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgZW1wdHlRdWV1ZShzdWJzY3JpcHRpb25JZHM6IG51bWJlcltdKSB7XG4gICAgaWYgKHRoaXMubGlzdGVuaW5nKSB7XG4gICAgICB0aGlzLmxpc3RlbmluZyA9IGZhbHNlO1xuICAgICAgdGhpcy51bnN1YnNjcmliZUFsbChzdWJzY3JpcHRpb25JZHMpO1xuICAgICAgdGhpcy5wdWxsUXVldWUuZm9yRWFjaChyZXNvbHZlID0+IHJlc29sdmUoeyB2YWx1ZTogdW5kZWZpbmVkLCBkb25lOiB0cnVlIH0pKTtcbiAgICAgIHRoaXMucHVsbFF1ZXVlLmxlbmd0aCA9IDA7XG4gICAgICB0aGlzLnB1c2hRdWV1ZS5sZW5ndGggPSAwO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgc3Vic2NyaWJlQWxsKCkge1xuICAgIHJldHVybiBQcm9taXNlLmFsbCh0aGlzLmV2ZW50c0FycmF5Lm1hcChcbiAgICAgIGV2ZW50TmFtZSA9PiB0aGlzLnB1YnN1Yi5zdWJzY3JpYmUoZXZlbnROYW1lLCB0aGlzLnB1c2hWYWx1ZS5iaW5kKHRoaXMpLCB7fSksXG4gICAgKSk7XG4gIH1cblxuICBwcml2YXRlIHVuc3Vic2NyaWJlQWxsKHN1YnNjcmlwdGlvbklkczogbnVtYmVyW10pIHtcbiAgICBmb3IgKGNvbnN0IHN1YnNjcmlwdGlvbklkIG9mIHN1YnNjcmlwdGlvbklkcykge1xuICAgICAgdGhpcy5wdWJzdWIudW5zdWJzY3JpYmUoc3Vic2NyaXB0aW9uSWQpO1xuICAgIH1cbiAgfVxuXG59XG4iXX0=
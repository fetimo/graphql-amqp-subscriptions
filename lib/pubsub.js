"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AMQPPubSub = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _debug = _interopRequireDefault(require("debug"));

var _publisher = require("./amqp/publisher");

var _subscriber = require("./amqp/subscriber");

var _pubsubAsyncIterator = require("./pubsub-async-iterator");

var logger = (0, _debug.default)('AMQPPubSub');

var AMQPPubSub =
/*#__PURE__*/
function () {
  function AMQPPubSub(options) {
    (0, _classCallCheck2.default)(this, AMQPPubSub);
    (0, _defineProperty2.default)(this, "connection", void 0);
    (0, _defineProperty2.default)(this, "exchange", void 0);
    (0, _defineProperty2.default)(this, "exchangeType", void 0);
    (0, _defineProperty2.default)(this, "queueName", void 0);
    (0, _defineProperty2.default)(this, "exchangeOptions", void 0);
    (0, _defineProperty2.default)(this, "queueOptions", void 0);
    (0, _defineProperty2.default)(this, "publisher", void 0);
    (0, _defineProperty2.default)(this, "subscriber", void 0);
    (0, _defineProperty2.default)(this, "subscriptionMap", void 0);
    (0, _defineProperty2.default)(this, "subsRefsMap", void 0);
    (0, _defineProperty2.default)(this, "unsubscribeMap", void 0);
    (0, _defineProperty2.default)(this, "currentSubscriptionId", void 0);
    // Setup Variables
    this.connection = options.connection;
    this.exchange = options.exchange || '';
    this.exchangeType = options.exchangeType || 'topic';
    this.queueName = options.queueName || '';
    this.exchangeOptions = options.exchangeOptions || {};
    this.queueOptions = options.queueOptions || {};
    this.subscriptionMap = {};
    this.subsRefsMap = {};
    this.unsubscribeMap = {};
    this.currentSubscriptionId = 0; // Initialize AMQP Helper

    this.publisher = new _publisher.AMQPPublisher(this.connection, logger);
    this.subscriber = new _subscriber.AMQPSubscriber(this.connection, logger);
    logger('Finished initializing');
  }

  (0, _createClass2.default)(AMQPPubSub, [{
    key: "publish",
    value: function () {
      var _publish = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee(routingKey, payload) {
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                logger('Publishing message to exchange "%s" for key "%s" (%j)', this.exchange, routingKey, payload);
                return _context.abrupt("return", this.publisher.publish(this.exchange, routingKey, payload));

              case 2:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function publish(_x, _x2) {
        return _publish.apply(this, arguments);
      }

      return publish;
    }()
  }, {
    key: "subscribe",
    value: function () {
      var _subscribe = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee2(routingKey, onMessage) {
        var _this = this;

        var id, refs, newRefs;
        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                id = this.currentSubscriptionId++;
                this.subscriptionMap[id] = {
                  routingKey: routingKey,
                  listener: onMessage
                };
                refs = this.subsRefsMap[routingKey];

                if (!(refs && refs.length > 0)) {
                  _context2.next = 9;
                  break;
                }

                newRefs = [].concat((0, _toConsumableArray2.default)(refs), [id]);
                this.subsRefsMap[routingKey] = newRefs;
                return _context2.abrupt("return", Promise.resolve(id));

              case 9:
                return _context2.abrupt("return", this.subscriber.subscribe(this.exchange, routingKey, this.exchangeType, this.queueName, this.exchangeOptions, this.queueOptions, this.onMessage.bind(this)).then(function (disposer) {
                  console.log('lib routingKey', routingKey);
                  _this.subsRefsMap[routingKey] = [].concat((0, _toConsumableArray2.default)(_this.subsRefsMap[routingKey] || []), [id]);

                  if (_this.unsubscribeMap[routingKey]) {
                    return disposer();
                  }

                  _this.unsubscribeMap[routingKey] = disposer;
                  return Promise.resolve(id);
                }));

              case 10:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function subscribe(_x3, _x4) {
        return _subscribe.apply(this, arguments);
      }

      return subscribe;
    }()
  }, {
    key: "unsubscribe",
    value: function unsubscribe(subId) {
      var routingKey = this.subscriptionMap[subId].routingKey;
      var refs = this.subsRefsMap[routingKey];

      if (!refs) {
        throw new Error("There is no subscription of id \"".concat(subId, "\""));
      }

      if (refs.length === 1) {
        delete this.subscriptionMap[subId];
        return this.unsubscribeForKey(routingKey);
      } else {
        var index = refs.indexOf(subId);
        var newRefs = index === -1 ? refs : [].concat((0, _toConsumableArray2.default)(refs.slice(0, index)), (0, _toConsumableArray2.default)(refs.slice(index + 1)));
        this.subsRefsMap[routingKey] = newRefs;
        delete this.subscriptionMap[subId];
      }

      return Promise.resolve();
    }
  }, {
    key: "asyncIterator",
    value: function asyncIterator(triggers) {
      return new _pubsubAsyncIterator.PubSubAsyncIterator(this, triggers);
    }
  }, {
    key: "onMessage",
    value: function onMessage(routingKey, message) {
      var subscribers = this.subsRefsMap[routingKey]; // Don't work for nothing...

      if (!subscribers || !subscribers.length) {
        this.unsubscribeForKey(routingKey);
        return;
      }

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = subscribers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _subId = _step.value;

          this.subscriptionMap[_subId].listener(message);
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
  }, {
    key: "unsubscribeForKey",
    value: function () {
      var _unsubscribeForKey = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee3(routingKey) {
        return _regenerator.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.unsubscribeMap[routingKey]();

              case 2:
                delete this.subsRefsMap[routingKey];
                delete this.unsubscribeMap[routingKey];

              case 4:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function unsubscribeForKey(_x5) {
        return _unsubscribeForKey.apply(this, arguments);
      }

      return unsubscribeForKey;
    }()
  }]);
  return AMQPPubSub;
}();

exports.AMQPPubSub = AMQPPubSub;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wdWJzdWIudHMiXSwibmFtZXMiOlsibG9nZ2VyIiwiQU1RUFB1YlN1YiIsIm9wdGlvbnMiLCJjb25uZWN0aW9uIiwiZXhjaGFuZ2UiLCJleGNoYW5nZVR5cGUiLCJxdWV1ZU5hbWUiLCJleGNoYW5nZU9wdGlvbnMiLCJxdWV1ZU9wdGlvbnMiLCJzdWJzY3JpcHRpb25NYXAiLCJzdWJzUmVmc01hcCIsInVuc3Vic2NyaWJlTWFwIiwiY3VycmVudFN1YnNjcmlwdGlvbklkIiwicHVibGlzaGVyIiwiQU1RUFB1Ymxpc2hlciIsInN1YnNjcmliZXIiLCJBTVFQU3Vic2NyaWJlciIsInJvdXRpbmdLZXkiLCJwYXlsb2FkIiwicHVibGlzaCIsIm9uTWVzc2FnZSIsImlkIiwibGlzdGVuZXIiLCJyZWZzIiwibGVuZ3RoIiwibmV3UmVmcyIsIlByb21pc2UiLCJyZXNvbHZlIiwic3Vic2NyaWJlIiwiYmluZCIsInRoZW4iLCJkaXNwb3NlciIsImNvbnNvbGUiLCJsb2ciLCJzdWJJZCIsIkVycm9yIiwidW5zdWJzY3JpYmVGb3JLZXkiLCJpbmRleCIsImluZGV4T2YiLCJzbGljZSIsInRyaWdnZXJzIiwiUHViU3ViQXN5bmNJdGVyYXRvciIsIm1lc3NhZ2UiLCJzdWJzY3JpYmVycyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUE7O0FBR0E7O0FBQ0E7O0FBQ0E7O0FBRUEsSUFBTUEsTUFBTSxHQUFHLG9CQUFNLFlBQU4sQ0FBZjs7SUFFYUMsVTs7O0FBaUJYLHNCQUNFQyxPQURGLEVBRUU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNBO0FBQ0EsU0FBS0MsVUFBTCxHQUFrQkQsT0FBTyxDQUFDQyxVQUExQjtBQUNBLFNBQUtDLFFBQUwsR0FBZ0JGLE9BQU8sQ0FBQ0UsUUFBUixJQUFvQixFQUFwQztBQUNBLFNBQUtDLFlBQUwsR0FBb0JILE9BQU8sQ0FB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QztBQUNEO0FBWHVEO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFZekQ7Ozs7OztrREFFK0J6QixVOzs7Ozs7dUJBQ3hCLEtBQUtOLGNBQUwsQ0FBb0JNLFVBQXBCLEc7OztBQUNOLHVCQUFPLEtBQUtQLFdBQUwsQ0FBaUJPLFVBQWpCLENBQVA7QUFDQSx1QkFBTyxLQUFLTixjQUFMLENBQW9CTSxVQUFwQixDQUFQIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUHViU3ViRW5naW5lIH0gZnJvbSAnZ3JhcGhxbC1zdWJzY3JpcHRpb25zJztcbmltcG9ydCBhbXFwIGZyb20gJ2FtcXBsaWInO1xuaW1wb3J0IERlYnVnIGZyb20gJ2RlYnVnJztcblxuaW1wb3J0IHsgUHViU3ViQU1RUE9wdGlvbnMsIFF1ZXVlT3B0aW9ucywgRXhjaGFuZ2VPcHRpb25zIH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7IEFNUVBQdWJsaXNoZXIgfSBmcm9tICcuL2FtcXAvcHVibGlzaGVyJztcbmltcG9ydCB7IEFNUVBTdWJzY3JpYmVyIH0gZnJvbSAnLi9hbXFwL3N1YnNjcmliZXInO1xuaW1wb3J0IHsgUHViU3ViQXN5bmNJdGVyYXRvciB9IGZyb20gJy4vcHVic3ViLWFzeW5jLWl0ZXJhdG9yJztcblxuY29uc3QgbG9nZ2VyID0gRGVidWcoJ0FNUVBQdWJTdWInKTtcblxuZXhwb3J0IGNsYXNzIEFNUVBQdWJTdWIgaW1wbGVtZW50cyBQdWJTdWJFbmdpbmUge1xuXG4gIHByaXZhdGUgY29ubmVjdGlvbjogYW1xcC5Db25uZWN0aW9uO1xuICBwcml2YXRlIGV4Y2hhbmdlOiBzdHJpbmc7XG4gIHByaXZhdGUgZXhjaGFuZ2VUeXBlOiBzdHJpbmc7XG4gIHByaXZhdGUgcXVldWVOYW1lOiBzdHJpbmc7XG4gIHByaXZhdGUgZXhjaGFuZ2VPcHRpb25zOiBFeGNoYW5nZU9wdGlvbnM7XG4gIHByaXZhdGUgcXVldWVPcHRpb25zOiBRdWV1ZU9wdGlvbnM7XG5cbiAgcHJpdmF0ZSBwdWJsaXNoZXI6IEFNUVBQdWJsaXNoZXI7XG4gIHByaXZhdGUgc3Vic2NyaWJlcjogQU1RUFN1YnNjcmliZXI7XG5cbiAgcHJpdmF0ZSBzdWJzY3JpcHRpb25NYXA6IHsgW3N1YklkOiBudW1iZXJdOiB7IHJvdXRpbmdLZXk6IHN0cmluZywgbGlzdGVuZXI6IEZ1bmN0aW9uIH0gfTtcbiAgcHJpdmF0ZSBzdWJzUmVmc01hcDogeyBbdHJpZ2dlcjogc3RyaW5nXTogQXJyYXk8bnVtYmVyPiB9O1xuICBwcml2YXRlIHVuc3Vic2NyaWJlTWFwOiB7IFt0cmlnZ2VyOiBzdHJpbmddOiAoKSA9PiBQcm9taXNlTGlrZTxhbnk+IH07XG4gIHByaXZhdGUgY3VycmVudFN1YnNjcmlwdGlvbklkOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgb3B0aW9uczogUHViU3ViQU1RUE9wdGlvbnNcbiAgKSB7XG4gICAgLy8gU2V0dXAgVmFyaWFibGVzXG4gICAgdGhpcy5jb25uZWN0aW9uID0gb3B0aW9ucy5jb25uZWN0aW9uO1xuICAgIHRoaXMuZXhjaGFuZ2UgPSBvcHRpb25zLmV4Y2hhbmdlIHx8ICcnO1xuICAgIHRoaXMuZXhjaGFuZ2VUeXBlID0gb3B0aW9ucy5leGNoYW5nZVR5cGUgfHwgJ3RvcGljJztcbiAgICB0aGlzLnF1ZXVlTmFtZSA9IG9wdGlvbnMucXVldWVOYW1lIHx8ICcnO1xuICAgIHRoaXMuZXhjaGFuZ2VPcHRpb25zID0gb3B0aW9ucy5leGNoYW5nZU9wdGlvbnMgfHwge307XG4gICAgdGhpcy5xdWV1ZU9wdGlvbnMgPSBvcHRpb25zLnF1ZXVlT3B0aW9ucyB8fCB7fTtcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9uTWFwID0ge307XG4gICAgdGhpcy5zdWJzUmVmc01hcCA9IHt9O1xuICAgIHRoaXMudW5zdWJzY3JpYmVNYXAgPSB7fTtcbiAgICB0aGlzLmN1cnJlbnRTdWJzY3JpcHRpb25JZCA9IDA7XG5cbiAgICAvLyBJbml0aWFsaXplIEFNUVAgSGVscGVyXG4gICAgdGhpcy5wdWJsaXNoZXIgPSBuZXcgQU1RUFB1Ymxpc2hlcih0aGlzLmNvbm5lY3Rpb24sIGxvZ2dlcik7XG4gICAgdGhpcy5zdWJzY3JpYmVyID0gbmV3IEFNUVBTdWJzY3JpYmVyKHRoaXMuY29ubmVjdGlvbiwgbG9nZ2VyKTtcblxuICAgIGxvZ2dlcignRmluaXNoZWQgaW5pdGlhbGl6aW5nJyk7XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgcHVibGlzaChyb3V0aW5nS2V5OiBzdHJpbmcsIHBheWxvYWQ6IGFueSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGxvZ2dlcignUHVibGlzaGluZyBtZXNzYWdlIHRvIGV4Y2hhbmdlIFwiJXNcIiBmb3Iga2V5IFwiJXNcIiAoJWopJywgdGhpcy5leGNoYW5nZSwgcm91dGluZ0tleSwgcGF5bG9hZCk7XG4gICAgcmV0dXJuIHRoaXMucHVibGlzaGVyLnB1Ymxpc2godGhpcy5leGNoYW5nZSwgcm91dGluZ0tleSwgcGF5bG9hZCk7XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgc3Vic2NyaWJlKHJvdXRpbmdLZXk6IHN0cmluZywgb25NZXNzYWdlOiAobWVzc2FnZTogYW55KSA9PiB2b2lkKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICBjb25zdCBpZCA9IHRoaXMuY3VycmVudFN1YnNjcmlwdGlvbklkKys7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25NYXBbaWRdID0ge1xuICAgICAgcm91dGluZ0tleTogcm91dGluZ0tleSxcbiAgICAgIGxpc3RlbmVyOiBvbk1lc3NhZ2VcbiAgICB9O1xuXG4gICAgY29uc3QgcmVmcyA9IHRoaXMuc3Vic1JlZnNNYXBbcm91dGluZ0tleV07XG4gICAgaWYgKHJlZnMgJiYgcmVmcy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBuZXdSZWZzID0gWy4uLnJlZnMsIGlkXTtcbiAgICAgIHRoaXMuc3Vic1JlZnNNYXBbcm91dGluZ0tleV0gPSBuZXdSZWZzO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShpZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnN1YnNjcmliZXIuc3Vic2NyaWJlKFxuICAgICAgICB0aGlzLmV4Y2hhbmdlLCBcbiAgICAgICAgcm91dGluZ0tleSwgXG4gICAgICAgIHRoaXMuZXhjaGFuZ2VUeXBlLCBcbiAgICAgICAgdGhpcy5xdWV1ZU5hbWUsIFxuICAgICAgICB0aGlzLmV4Y2hhbmdlT3B0aW9ucywgXG4gICAgICAgIHRoaXMucXVldWVPcHRpb25zLCBcbiAgICAgICAgdGhpcy5vbk1lc3NhZ2UuYmluZCh0aGlzKVxuICAgICAgKVxuICAgICAgLnRoZW4oZGlzcG9zZXIgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygnbGliIHJvdXRpbmdLZXknLCByb3V0aW5nS2V5KTtcbiAgICAgICAgdGhpcy5zdWJzUmVmc01hcFtyb3V0aW5nS2V5XSA9IFtcbiAgICAgICAgICAuLi4odGhpcy5zdWJzUmVmc01hcFtyb3V0aW5nS2V5XSB8fCBbXSksXG4gICAgICAgICAgaWQsXG4gICAgICAgIF07XG4gICAgICAgIGlmICh0aGlzLnVuc3Vic2NyaWJlTWFwW3JvdXRpbmdLZXldKSB7XG4gICAgICAgICAgcmV0dXJuIGRpc3Bvc2VyKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy51bnN1YnNjcmliZU1hcFtyb3V0aW5nS2V5XSA9IGRpc3Bvc2VyO1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGlkKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyB1bnN1YnNjcmliZShzdWJJZDogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qgcm91dGluZ0tleSA9IHRoaXMuc3Vic2NyaXB0aW9uTWFwW3N1YklkXS5yb3V0aW5nS2V5O1xuICAgIGNvbnN0IHJlZnMgPSB0aGlzLnN1YnNSZWZzTWFwW3JvdXRpbmdLZXldO1xuXG4gICAgaWYgKCFyZWZzKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZXJlIGlzIG5vIHN1YnNjcmlwdGlvbiBvZiBpZCBcIiR7c3ViSWR9XCJgKTtcbiAgICB9XG5cbiAgICBpZiAocmVmcy5sZW5ndGggPT09IDEpIHtcbiAgICAgIGRlbGV0ZSB0aGlzLnN1YnNjcmlwdGlvbk1hcFtzdWJJZF07XG4gICAgICByZXR1cm4gdGhpcy51bnN1YnNjcmliZUZvcktleShyb3V0aW5nS2V5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgaW5kZXggPSByZWZzLmluZGV4T2Yoc3ViSWQpO1xuICAgICAgY29uc3QgbmV3UmVmcyA9XG4gICAgICAgIGluZGV4ID09PSAtMVxuICAgICAgICAgID8gcmVmc1xuICAgICAgICAgIDogWy4uLnJlZnMuc2xpY2UoMCwgaW5kZXgpLCAuLi5yZWZzLnNsaWNlKGluZGV4ICsgMSldO1xuICAgICAgdGhpcy5zdWJzUmVmc01hcFtyb3V0aW5nS2V5XSA9IG5ld1JlZnM7XG4gICAgICBkZWxldGUgdGhpcy5zdWJzY3JpcHRpb25NYXBbc3ViSWRdO1xuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gIH1cblxuICBwdWJsaWMgYXN5bmNJdGVyYXRvcjxUPih0cmlnZ2Vyczogc3RyaW5nIHwgc3RyaW5nW10pOiBBc3luY0l0ZXJhdG9yPFQ+IHtcbiAgICByZXR1cm4gbmV3IFB1YlN1YkFzeW5jSXRlcmF0b3I8VD4odGhpcywgdHJpZ2dlcnMpO1xuICB9XG5cbiAgcHJpdmF0ZSBvbk1lc3NhZ2Uocm91dGluZ0tleTogc3RyaW5nLCBtZXNzYWdlOiBhbnkpOiB2b2lkIHtcbiAgICBjb25zdCBzdWJzY3JpYmVycyA9IHRoaXMuc3Vic1JlZnNNYXBbcm91dGluZ0tleV07XG5cbiAgICAvLyBEb24ndCB3b3JrIGZvciBub3RoaW5nLi4uXG4gICAgaWYgKCFzdWJzY3JpYmVycyB8fCAhc3Vic2NyaWJlcnMubGVuZ3RoKSB7XG4gICAgICB0aGlzLnVuc3Vic2NyaWJlRm9yS2V5KHJvdXRpbmdLZXkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGZvciAoY29uc3Qgc3ViSWQgb2Ygc3Vic2NyaWJlcnMpIHtcbiAgICAgIHRoaXMuc3Vic2NyaXB0aW9uTWFwW3N1YklkXS5saXN0ZW5lcihtZXNzYWdlKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHVuc3Vic2NyaWJlRm9yS2V5KHJvdXRpbmdLZXk6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMudW5zdWJzY3JpYmVNYXBbcm91dGluZ0tleV0oKTtcbiAgICBkZWxldGUgdGhpcy5zdWJzUmVmc01hcFtyb3V0aW5nS2V5XTtcbiAgICBkZWxldGUgdGhpcy51bnN1YnNjcmliZU1hcFtyb3V0aW5nS2V5XTtcbiAgfVxuXG59XG4iXX0=
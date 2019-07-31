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
                  console.log({
                    routingKey: routingKey
                  });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wdWJzdWIudHMiXSwibmFtZXMiOlsibG9nZ2VyIiwiQU1RUFB1YlN1YiIsIm9wdGlvbnMiLCJjb25uZWN0aW9uIiwiZXhjaGFuZ2UiLCJleGNoYW5nZVR5cGUiLCJxdWV1ZU5hbWUiLCJleGNoYW5nZU9wdGlvbnMiLCJxdWV1ZU9wdGlvbnMiLCJzdWJzY3JpcHRpb25NYXAiLCJzdWJzUmVmc01hcCIsInVuc3Vic2NyaWJlTWFwIiwiY3VycmVudFN1YnNjcmlwdGlvbklkIiwicHVibGlzaGVyIiwiQU1RUFB1Ymxpc2hlciIsInN1YnNjcmliZXIiLCJBTVFQU3Vic2NyaWJlciIsInJvdXRpbmdLZXkiLCJwYXlsb2FkIiwicHVibGlzaCIsIm9uTWVzc2FnZSIsImlkIiwibGlzdGVuZXIiLCJyZWZzIiwibGVuZ3RoIiwibmV3UmVmcyIsIlByb21pc2UiLCJyZXNvbHZlIiwic3Vic2NyaWJlIiwiYmluZCIsInRoZW4iLCJkaXNwb3NlciIsImNvbnNvbGUiLCJsb2ciLCJzdWJJZCIsIkVycm9yIiwidW5zdWJzY3JpYmVGb3JLZXkiLCJpbmRleCIsImluZGV4T2YiLCJzbGljZSIsInRyaWdnZXJzIiwiUHViU3ViQXN5bmNJdGVyYXRvciIsIm1lc3NhZ2UiLCJzdWJzY3JpYmVycyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUE7O0FBR0E7O0FBQ0E7O0FBQ0E7O0FBRUEsSUFBTUEsTUFBTSxHQUFHLG9CQUFNLFlBQU4sQ0FBZjs7SUFFYUMsVTs7O0FBaUJYLHNCQUNFQyxPQURGLEVBRUU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNBO0FBQ0EsU0FBS0MsVUFBTCxHQUFrQkQsT0FBTyxDQUFDQyxVQUExQjtBQUNBLFNBQUtDLFFBQUwsR0FBZ0JGLE9BQU8sQ0FBQ0UsUUFBUixJQUFvQixFQUFwQztBQUNBLFNBQUtDLFlBQUwsR0FBb0JILE9BQU8sQ0FB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QXJCLEVBQTRCWixRQUE1QixDQUFxQ29CLE9BQXJDO0FBQ0Q7QUFYdUQ7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQVl6RDs7Ozs7O2tEQUUrQnpCLFU7Ozs7Ozt1QkFDeEIsS0FBS04sY0FBTCxDQUFvQk0sVUFBcEIsRzs7O0FBQ04sdUJBQU8sS0FBS1AsV0FBTCxDQUFpQk8sVUFBakIsQ0FBUDtBQUNBLHVCQUFPLEtBQUtOLGNBQUwsQ0FBb0JNLFVBQXBCLENBQVAiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQdWJTdWJFbmdpbmUgfSBmcm9tICdncmFwaHFsLXN1YnNjcmlwdGlvbnMnO1xuaW1wb3J0IGFtcXAgZnJvbSAnYW1xcGxpYic7XG5pbXBvcnQgRGVidWcgZnJvbSAnZGVidWcnO1xuXG5pbXBvcnQgeyBQdWJTdWJBTVFQT3B0aW9ucywgUXVldWVPcHRpb25zLCBFeGNoYW5nZU9wdGlvbnMgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgQU1RUFB1Ymxpc2hlciB9IGZyb20gJy4vYW1xcC9wdWJsaXNoZXInO1xuaW1wb3J0IHsgQU1RUFN1YnNjcmliZXIgfSBmcm9tICcuL2FtcXAvc3Vic2NyaWJlcic7XG5pbXBvcnQgeyBQdWJTdWJBc3luY0l0ZXJhdG9yIH0gZnJvbSAnLi9wdWJzdWItYXN5bmMtaXRlcmF0b3InO1xuXG5jb25zdCBsb2dnZXIgPSBEZWJ1ZygnQU1RUFB1YlN1YicpO1xuXG5leHBvcnQgY2xhc3MgQU1RUFB1YlN1YiBpbXBsZW1lbnRzIFB1YlN1YkVuZ2luZSB7XG5cbiAgcHJpdmF0ZSBjb25uZWN0aW9uOiBhbXFwLkNvbm5lY3Rpb247XG4gIHByaXZhdGUgZXhjaGFuZ2U6IHN0cmluZztcbiAgcHJpdmF0ZSBleGNoYW5nZVR5cGU6IHN0cmluZztcbiAgcHJpdmF0ZSBxdWV1ZU5hbWU6IHN0cmluZztcbiAgcHJpdmF0ZSBleGNoYW5nZU9wdGlvbnM6IEV4Y2hhbmdlT3B0aW9ucztcbiAgcHJpdmF0ZSBxdWV1ZU9wdGlvbnM6IFF1ZXVlT3B0aW9ucztcblxuICBwcml2YXRlIHB1Ymxpc2hlcjogQU1RUFB1Ymxpc2hlcjtcbiAgcHJpdmF0ZSBzdWJzY3JpYmVyOiBBTVFQU3Vic2NyaWJlcjtcblxuICBwcml2YXRlIHN1YnNjcmlwdGlvbk1hcDogeyBbc3ViSWQ6IG51bWJlcl06IHsgcm91dGluZ0tleTogc3RyaW5nLCBsaXN0ZW5lcjogRnVuY3Rpb24gfSB9O1xuICBwcml2YXRlIHN1YnNSZWZzTWFwOiB7IFt0cmlnZ2VyOiBzdHJpbmddOiBBcnJheTxudW1iZXI+IH07XG4gIHByaXZhdGUgdW5zdWJzY3JpYmVNYXA6IHsgW3RyaWdnZXI6IHN0cmluZ106ICgpID0+IFByb21pc2VMaWtlPGFueT4gfTtcbiAgcHJpdmF0ZSBjdXJyZW50U3Vic2NyaXB0aW9uSWQ6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBvcHRpb25zOiBQdWJTdWJBTVFQT3B0aW9uc1xuICApIHtcbiAgICAvLyBTZXR1cCBWYXJpYWJsZXNcbiAgICB0aGlzLmNvbm5lY3Rpb24gPSBvcHRpb25zLmNvbm5lY3Rpb247XG4gICAgdGhpcy5leGNoYW5nZSA9IG9wdGlvbnMuZXhjaGFuZ2UgfHwgJyc7XG4gICAgdGhpcy5leGNoYW5nZVR5cGUgPSBvcHRpb25zLmV4Y2hhbmdlVHlwZSB8fCAndG9waWMnO1xuICAgIHRoaXMucXVldWVOYW1lID0gb3B0aW9ucy5xdWV1ZU5hbWUgfHwgJyc7XG4gICAgdGhpcy5leGNoYW5nZU9wdGlvbnMgPSBvcHRpb25zLmV4Y2hhbmdlT3B0aW9ucyB8fCB7fTtcbiAgICB0aGlzLnF1ZXVlT3B0aW9ucyA9IG9wdGlvbnMucXVldWVPcHRpb25zIHx8IHt9O1xuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25NYXAgPSB7fTtcbiAgICB0aGlzLnN1YnNSZWZzTWFwID0ge307XG4gICAgdGhpcy51bnN1YnNjcmliZU1hcCA9IHt9O1xuICAgIHRoaXMuY3VycmVudFN1YnNjcmlwdGlvbklkID0gMDtcblxuICAgIC8vIEluaXRpYWxpemUgQU1RUCBIZWxwZXJcbiAgICB0aGlzLnB1Ymxpc2hlciA9IG5ldyBBTVFQUHVibGlzaGVyKHRoaXMuY29ubmVjdGlvbiwgbG9nZ2VyKTtcbiAgICB0aGlzLnN1YnNjcmliZXIgPSBuZXcgQU1RUFN1YnNjcmliZXIodGhpcy5jb25uZWN0aW9uLCBsb2dnZXIpO1xuXG4gICAgbG9nZ2VyKCdGaW5pc2hlZCBpbml0aWFsaXppbmcnKTtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBwdWJsaXNoKHJvdXRpbmdLZXk6IHN0cmluZywgcGF5bG9hZDogYW55KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbG9nZ2VyKCdQdWJsaXNoaW5nIG1lc3NhZ2UgdG8gZXhjaGFuZ2UgXCIlc1wiIGZvciBrZXkgXCIlc1wiICglaiknLCB0aGlzLmV4Y2hhbmdlLCByb3V0aW5nS2V5LCBwYXlsb2FkKTtcbiAgICByZXR1cm4gdGhpcy5wdWJsaXNoZXIucHVibGlzaCh0aGlzLmV4Y2hhbmdlLCByb3V0aW5nS2V5LCBwYXlsb2FkKTtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBzdWJzY3JpYmUocm91dGluZ0tleTogc3RyaW5nLCBvbk1lc3NhZ2U6IChtZXNzYWdlOiBhbnkpID0+IHZvaWQpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGNvbnN0IGlkID0gdGhpcy5jdXJyZW50U3Vic2NyaXB0aW9uSWQrKztcbiAgICB0aGlzLnN1YnNjcmlwdGlvbk1hcFtpZF0gPSB7XG4gICAgICByb3V0aW5nS2V5OiByb3V0aW5nS2V5LFxuICAgICAgbGlzdGVuZXI6IG9uTWVzc2FnZVxuICAgIH07XG5cbiAgICBjb25zdCByZWZzID0gdGhpcy5zdWJzUmVmc01hcFtyb3V0aW5nS2V5XTtcbiAgICBpZiAocmVmcyAmJiByZWZzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IG5ld1JlZnMgPSBbLi4ucmVmcywgaWRdO1xuICAgICAgdGhpcy5zdWJzUmVmc01hcFtyb3V0aW5nS2V5XSA9IG5ld1JlZnM7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGlkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuc3Vic2NyaWJlci5zdWJzY3JpYmUodGhpcy5leGNoYW5nZSwgcm91dGluZ0tleSwgdGhpcy5leGNoYW5nZVR5cGUsIHRoaXMucXVldWVOYW1lLCB0aGlzLmV4Y2hhbmdlT3B0aW9ucywgdGhpcy5xdWV1ZU9wdGlvbnMsIHRoaXMub25NZXNzYWdlLmJpbmQodGhpcykpXG4gICAgICAudGhlbihkaXNwb3NlciA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKHtyb3V0aW5nS2V5fSlcbiAgICAgICAgdGhpcy5zdWJzUmVmc01hcFtyb3V0aW5nS2V5XSA9IFtcbiAgICAgICAgICAuLi4odGhpcy5zdWJzUmVmc01hcFtyb3V0aW5nS2V5XSB8fCBbXSksXG4gICAgICAgICAgaWQsXG4gICAgICAgIF07XG4gICAgICAgIGlmICh0aGlzLnVuc3Vic2NyaWJlTWFwW3JvdXRpbmdLZXldKSB7XG4gICAgICAgICAgcmV0dXJuIGRpc3Bvc2VyKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy51bnN1YnNjcmliZU1hcFtyb3V0aW5nS2V5XSA9IGRpc3Bvc2VyO1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGlkKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyB1bnN1YnNjcmliZShzdWJJZDogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qgcm91dGluZ0tleSA9IHRoaXMuc3Vic2NyaXB0aW9uTWFwW3N1YklkXS5yb3V0aW5nS2V5O1xuICAgIGNvbnN0IHJlZnMgPSB0aGlzLnN1YnNSZWZzTWFwW3JvdXRpbmdLZXldO1xuXG4gICAgaWYgKCFyZWZzKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZXJlIGlzIG5vIHN1YnNjcmlwdGlvbiBvZiBpZCBcIiR7c3ViSWR9XCJgKTtcbiAgICB9XG5cbiAgICBpZiAocmVmcy5sZW5ndGggPT09IDEpIHtcbiAgICAgIGRlbGV0ZSB0aGlzLnN1YnNjcmlwdGlvbk1hcFtzdWJJZF07XG4gICAgICByZXR1cm4gdGhpcy51bnN1YnNjcmliZUZvcktleShyb3V0aW5nS2V5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgaW5kZXggPSByZWZzLmluZGV4T2Yoc3ViSWQpO1xuICAgICAgY29uc3QgbmV3UmVmcyA9XG4gICAgICAgIGluZGV4ID09PSAtMVxuICAgICAgICAgID8gcmVmc1xuICAgICAgICAgIDogWy4uLnJlZnMuc2xpY2UoMCwgaW5kZXgpLCAuLi5yZWZzLnNsaWNlKGluZGV4ICsgMSldO1xuICAgICAgdGhpcy5zdWJzUmVmc01hcFtyb3V0aW5nS2V5XSA9IG5ld1JlZnM7XG4gICAgICBkZWxldGUgdGhpcy5zdWJzY3JpcHRpb25NYXBbc3ViSWRdO1xuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gIH1cblxuICBwdWJsaWMgYXN5bmNJdGVyYXRvcjxUPih0cmlnZ2Vyczogc3RyaW5nIHwgc3RyaW5nW10pOiBBc3luY0l0ZXJhdG9yPFQ+IHtcbiAgICByZXR1cm4gbmV3IFB1YlN1YkFzeW5jSXRlcmF0b3I8VD4odGhpcywgdHJpZ2dlcnMpO1xuICB9XG5cbiAgcHJpdmF0ZSBvbk1lc3NhZ2Uocm91dGluZ0tleTogc3RyaW5nLCBtZXNzYWdlOiBhbnkpOiB2b2lkIHtcbiAgICBjb25zdCBzdWJzY3JpYmVycyA9IHRoaXMuc3Vic1JlZnNNYXBbcm91dGluZ0tleV07XG5cbiAgICAvLyBEb24ndCB3b3JrIGZvciBub3RoaW5nLi4uXG4gICAgaWYgKCFzdWJzY3JpYmVycyB8fCAhc3Vic2NyaWJlcnMubGVuZ3RoKSB7XG4gICAgICB0aGlzLnVuc3Vic2NyaWJlRm9yS2V5KHJvdXRpbmdLZXkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGZvciAoY29uc3Qgc3ViSWQgb2Ygc3Vic2NyaWJlcnMpIHtcbiAgICAgIHRoaXMuc3Vic2NyaXB0aW9uTWFwW3N1YklkXS5saXN0ZW5lcihtZXNzYWdlKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHVuc3Vic2NyaWJlRm9yS2V5KHJvdXRpbmdLZXk6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMudW5zdWJzY3JpYmVNYXBbcm91dGluZ0tleV0oKTtcbiAgICBkZWxldGUgdGhpcy5zdWJzUmVmc01hcFtyb3V0aW5nS2V5XTtcbiAgICBkZWxldGUgdGhpcy51bnN1YnNjcmliZU1hcFtyb3V0aW5nS2V5XTtcbiAgfVxuXG59XG4iXX0=
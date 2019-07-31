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
    (0, _defineProperty2.default)(this, "publisher", void 0);
    (0, _defineProperty2.default)(this, "subscriber", void 0);
    (0, _defineProperty2.default)(this, "subscriptionMap", void 0);
    (0, _defineProperty2.default)(this, "subsRefsMap", void 0);
    (0, _defineProperty2.default)(this, "unsubscribeMap", void 0);
    (0, _defineProperty2.default)(this, "currentSubscriptionId", void 0);
    // Setup Variables
    this.connection = options.connection;
    this.exchange = options.exchange || '';
    this.exchangeType = options.exchange || 'topic';
    this.queueName = options.queueName || '';
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
                return _context2.abrupt("return", this.subscriber.subscribe(this.exchange, routingKey, this.exchangeType, this.queueName, this.onMessage.bind(this)).then(function (disposer) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wdWJzdWIudHMiXSwibmFtZXMiOlsibG9nZ2VyIiwiQU1RUFB1YlN1YiIsIm9wdGlvbnMiLCJjb25uZWN0aW9uIiwiZXhjaGFuZ2UiLCJleGNoYW5nZVR5cGUiLCJxdWV1ZU5hbWUiLCJzdWJzY3JpcHRpb25NYXAiLCJzdWJzUmVmc01hcCIsInVuc3Vic2NyaWJlTWFwIiwiY3VycmVudFN1YnNjcmlwdGlvbklkIiwicHVibGlzaGVyIiwiQU1RUFB1Ymxpc2hlciIsInN1YnNjcmliZXIiLCJBTVFQU3Vic2NyaWJlciIsInJvdXRpbmdLZXkiLCJwYXlsb2FkIiwicHVibGlzaCIsIm9uTWVzc2FnZSIsImlkIiwibGlzdGVuZXIiLCJyZWZzIiwibGVuZ3RoIiwibmV3UmVmcyIsIlByb21pc2UiLCJyZXNvbHZlIiwic3Vic2NyaWJlIiwiYmluZCIsInRoZW4iLCJkaXNwb3NlciIsInN1YklkIiwiRXJyb3IiLCJ1bnN1YnNjcmliZUZvcktleSIsImluZGV4IiwiaW5kZXhPZiIsInNsaWNlIiwidHJpZ2dlcnMiLCJQdWJTdWJBc3luY0l0ZXJhdG9yIiwibWVzc2FnZSIsInN1YnNjcmliZXJzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQTs7QUFHQTs7QUFDQTs7QUFDQTs7QUFFQSxJQUFNQSxNQUFNLEdBQUcsb0JBQU0sWUFBTixDQUFmOztJQUVhQyxVOzs7QUFlWCxzQkFDRUMsT0FERixFQUVFO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNBO0FBQ0EsU0FBS0MsVUFBTCxHQUFrQkQsT0FBTyxDQUFDQyxVQUExQjtBQUNBLFNBQUtDLFFBQUwsR0FBZ0JGLE9BQU8sQ0FBQ0UsUUFBUixJQUFvQixFQUFwQztBQUNBLFNBQUtDLFlBQUwsR0FBb0JILE9BQU8sQ0FBQ0UsUUFBUixJQUFvQixPQUF4QztBQUNBLFNBQUtFLFNBQUwsR0FBaUJKLE9BQU8sQ0FBQ0ksU0FBUixJ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cnQgeyBQdWJTdWJFbmdpbmUgfSBmcm9tICdncmFwaHFsLXN1YnNjcmlwdGlvbnMnO1xuaW1wb3J0IGFtcXAgZnJvbSAnYW1xcGxpYic7XG5pbXBvcnQgRGVidWcgZnJvbSAnZGVidWcnO1xuXG5pbXBvcnQgeyBQdWJTdWJBTVFQT3B0aW9ucyB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBBTVFQUHVibGlzaGVyIH0gZnJvbSAnLi9hbXFwL3B1Ymxpc2hlcic7XG5pbXBvcnQgeyBBTVFQU3Vic2NyaWJlciB9IGZyb20gJy4vYW1xcC9zdWJzY3JpYmVyJztcbmltcG9ydCB7IFB1YlN1YkFzeW5jSXRlcmF0b3IgfSBmcm9tICcuL3B1YnN1Yi1hc3luYy1pdGVyYXRvcic7XG5cbmNvbnN0IGxvZ2dlciA9IERlYnVnKCdBTVFQUHViU3ViJyk7XG5cbmV4cG9ydCBjbGFzcyBBTVFQUHViU3ViIGltcGxlbWVudHMgUHViU3ViRW5naW5lIHtcblxuICBwcml2YXRlIGNvbm5lY3Rpb246IGFtcXAuQ29ubmVjdGlvbjtcbiAgcHJpdmF0ZSBleGNoYW5nZTogc3RyaW5nO1xuICBwcml2YXRlIGV4Y2hhbmdlVHlwZTogc3RyaW5nO1xuICBwcml2YXRlIHF1ZXVlTmFtZTogc3RyaW5nO1xuXG4gIHByaXZhdGUgcHVibGlzaGVyOiBBTVFQUHVibGlzaGVyO1xuICBwcml2YXRlIHN1YnNjcmliZXI6IEFNUVBTdWJzY3JpYmVyO1xuXG4gIHByaXZhdGUgc3Vic2NyaXB0aW9uTWFwOiB7IFtzdWJJZDogbnVtYmVyXTogeyByb3V0aW5nS2V5OiBzdHJpbmcsIGxpc3RlbmVyOiBGdW5jdGlvbiB9IH07XG4gIHByaXZhdGUgc3Vic1JlZnNNYXA6IHsgW3RyaWdnZXI6IHN0cmluZ106IEFycmF5PG51bWJlcj4gfTtcbiAgcHJpdmF0ZSB1bnN1YnNjcmliZU1hcDogeyBbdHJpZ2dlcjogc3RyaW5nXTogKCkgPT4gUHJvbWlzZUxpa2U8YW55PiB9O1xuICBwcml2YXRlIGN1cnJlbnRTdWJzY3JpcHRpb25JZDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIG9wdGlvbnM6IFB1YlN1YkFNUVBPcHRpb25zXG4gICkge1xuICAgIC8vIFNldHVwIFZhcmlhYmxlc1xuICAgIHRoaXMuY29ubmVjdGlvbiA9IG9wdGlvbnMuY29ubmVjdGlvbjtcbiAgICB0aGlzLmV4Y2hhbmdlID0gb3B0aW9ucy5leGNoYW5nZSB8fCAnJztcbiAgICB0aGlzLmV4Y2hhbmdlVHlwZSA9IG9wdGlvbnMuZXhjaGFuZ2UgfHwgJ3RvcGljJztcbiAgICB0aGlzLnF1ZXVlTmFtZSA9IG9wdGlvbnMucXVldWVOYW1lIHx8ICcnO1xuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25NYXAgPSB7fTtcbiAgICB0aGlzLnN1YnNSZWZzTWFwID0ge307XG4gICAgdGhpcy51bnN1YnNjcmliZU1hcCA9IHt9O1xuICAgIHRoaXMuY3VycmVudFN1YnNjcmlwdGlvbklkID0gMDtcblxuICAgIC8vIEluaXRpYWxpemUgQU1RUCBIZWxwZXJcbiAgICB0aGlzLnB1Ymxpc2hlciA9IG5ldyBBTVFQUHVibGlzaGVyKHRoaXMuY29ubmVjdGlvbiwgbG9nZ2VyKTtcbiAgICB0aGlzLnN1YnNjcmliZXIgPSBuZXcgQU1RUFN1YnNjcmliZXIodGhpcy5jb25uZWN0aW9uLCBsb2dnZXIpO1xuXG4gICAgbG9nZ2VyKCdGaW5pc2hlZCBpbml0aWFsaXppbmcnKTtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBwdWJsaXNoKHJvdXRpbmdLZXk6IHN0cmluZywgcGF5bG9hZDogYW55KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbG9nZ2VyKCdQdWJsaXNoaW5nIG1lc3NhZ2UgdG8gZXhjaGFuZ2UgXCIlc1wiIGZvciBrZXkgXCIlc1wiICglaiknLCB0aGlzLmV4Y2hhbmdlLCByb3V0aW5nS2V5LCBwYXlsb2FkKTtcbiAgICByZXR1cm4gdGhpcy5wdWJsaXNoZXIucHVibGlzaCh0aGlzLmV4Y2hhbmdlLCByb3V0aW5nS2V5LCBwYXlsb2FkKTtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBzdWJzY3JpYmUocm91dGluZ0tleTogc3RyaW5nLCBvbk1lc3NhZ2U6IChtZXNzYWdlOiBhbnkpID0+IHZvaWQpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGNvbnN0IGlkID0gdGhpcy5jdXJyZW50U3Vic2NyaXB0aW9uSWQrKztcbiAgICB0aGlzLnN1YnNjcmlwdGlvbk1hcFtpZF0gPSB7XG4gICAgICByb3V0aW5nS2V5OiByb3V0aW5nS2V5LFxuICAgICAgbGlzdGVuZXI6IG9uTWVzc2FnZVxuICAgIH07XG5cbiAgICBjb25zdCByZWZzID0gdGhpcy5zdWJzUmVmc01hcFtyb3V0aW5nS2V5XTtcbiAgICBpZiAocmVmcyAmJiByZWZzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IG5ld1JlZnMgPSBbLi4ucmVmcywgaWRdO1xuICAgICAgdGhpcy5zdWJzUmVmc01hcFtyb3V0aW5nS2V5XSA9IG5ld1JlZnM7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGlkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuc3Vic2NyaWJlci5zdWJzY3JpYmUodGhpcy5leGNoYW5nZSwgcm91dGluZ0tleSwgdGhpcy5leGNoYW5nZVR5cGUsIHRoaXMucXVldWVOYW1lLCB0aGlzLm9uTWVzc2FnZS5iaW5kKHRoaXMpKVxuICAgICAgLnRoZW4oZGlzcG9zZXIgPT4ge1xuICAgICAgICB0aGlzLnN1YnNSZWZzTWFwW3JvdXRpbmdLZXldID0gW1xuICAgICAgICAgIC4uLih0aGlzLnN1YnNSZWZzTWFwW3JvdXRpbmdLZXldIHx8IFtdKSxcbiAgICAgICAgICBpZCxcbiAgICAgICAgXTtcbiAgICAgICAgaWYgKHRoaXMudW5zdWJzY3JpYmVNYXBbcm91dGluZ0tleV0pIHtcbiAgICAgICAgICByZXR1cm4gZGlzcG9zZXIoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnVuc3Vic2NyaWJlTWFwW3JvdXRpbmdLZXldID0gZGlzcG9zZXI7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoaWQpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHVuc3Vic2NyaWJlKHN1YklkOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCByb3V0aW5nS2V5ID0gdGhpcy5zdWJzY3JpcHRpb25NYXBbc3ViSWRdLnJvdXRpbmdLZXk7XG4gICAgY29uc3QgcmVmcyA9IHRoaXMuc3Vic1JlZnNNYXBbcm91dGluZ0tleV07XG5cbiAgICBpZiAoIXJlZnMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlcmUgaXMgbm8gc3Vic2NyaXB0aW9uIG9mIGlkIFwiJHtzdWJJZH1cImApO1xuICAgIH1cblxuICAgIGlmIChyZWZzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgZGVsZXRlIHRoaXMuc3Vic2NyaXB0aW9uTWFwW3N1YklkXTtcbiAgICAgIHJldHVybiB0aGlzLnVuc3Vic2NyaWJlRm9yS2V5KHJvdXRpbmdLZXkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBpbmRleCA9IHJlZnMuaW5kZXhPZihzdWJJZCk7XG4gICAgICBjb25zdCBuZXdSZWZzID1cbiAgICAgICAgaW5kZXggPT09IC0xXG4gICAgICAgICAgPyByZWZzXG4gICAgICAgICAgOiBbLi4ucmVmcy5zbGljZSgwLCBpbmRleCksIC4uLnJlZnMuc2xpY2UoaW5kZXggKyAxKV07XG4gICAgICB0aGlzLnN1YnNSZWZzTWFwW3JvdXRpbmdLZXldID0gbmV3UmVmcztcbiAgICAgIGRlbGV0ZSB0aGlzLnN1YnNjcmlwdGlvbk1hcFtzdWJJZF07XG4gICAgfVxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgfVxuXG4gIHB1YmxpYyBhc3luY0l0ZXJhdG9yPFQ+KHRyaWdnZXJzOiBzdHJpbmcgfCBzdHJpbmdbXSk6IEFzeW5jSXRlcmF0b3I8VD4ge1xuICAgIHJldHVybiBuZXcgUHViU3ViQXN5bmNJdGVyYXRvcjxUPih0aGlzLCB0cmlnZ2Vycyk7XG4gIH1cblxuICBwcml2YXRlIG9uTWVzc2FnZShyb3V0aW5nS2V5OiBzdHJpbmcsIG1lc3NhZ2U6IGFueSk6IHZvaWQge1xuICAgIGNvbnN0IHN1YnNjcmliZXJzID0gdGhpcy5zdWJzUmVmc01hcFtyb3V0aW5nS2V5XTtcblxuICAgIC8vIERvbid0IHdvcmsgZm9yIG5vdGhpbmcuLi5cbiAgICBpZiAoIXN1YnNjcmliZXJzIHx8ICFzdWJzY3JpYmVycy5sZW5ndGgpIHtcbiAgICAgIHRoaXMudW5zdWJzY3JpYmVGb3JLZXkocm91dGluZ0tleSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBzdWJJZCBvZiBzdWJzY3JpYmVycykge1xuICAgICAgdGhpcy5zdWJzY3JpcHRpb25NYXBbc3ViSWRdLmxpc3RlbmVyKG1lc3NhZ2UpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgdW5zdWJzY3JpYmVGb3JLZXkocm91dGluZ0tleTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy51bnN1YnNjcmliZU1hcFtyb3V0aW5nS2V5XSgpO1xuICAgIGRlbGV0ZSB0aGlzLnN1YnNSZWZzTWFwW3JvdXRpbmdLZXldO1xuICAgIGRlbGV0ZSB0aGlzLnVuc3Vic2NyaWJlTWFwW3JvdXRpbmdLZXldO1xuICB9XG5cbn1cbiJdfQ==
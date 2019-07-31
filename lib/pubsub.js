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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wdWJzdWIudHMiXSwibmFtZXMiOlsibG9nZ2VyIiwiQU1RUFB1YlN1YiIsIm9wdGlvbnMiLCJjb25uZWN0aW9uIiwiZXhjaGFuZ2UiLCJleGNoYW5nZVR5cGUiLCJxdWV1ZU5hbWUiLCJleGNoYW5nZU9wdGlvbnMiLCJxdWV1ZU9wdGlvbnMiLCJzdWJzY3JpcHRpb25NYXAiLCJzdWJzUmVmc01hcCIsInVuc3Vic2NyaWJlTWFwIiwiY3VycmVudFN1YnNjcmlwdGlvbklkIiwicHVibGlzaGVyIiwiQU1RUFB1Ymxpc2hlciIsInN1YnNjcmliZXIiLCJBTVFQU3Vic2NyaWJlciIsInJvdXRpbmdLZXkiLCJwYXlsb2FkIiwicHVibGlzaCIsIm9uTWVzc2FnZSIsImlkIiwibGlzdGVuZXIiLCJyZWZzIiwibGVuZ3RoIiwibmV3UmVmcyIsIlByb21pc2UiLCJyZXNvbHZlIiwic3Vic2NyaWJlIiwiYmluZCIsInRoZW4iLCJkaXNwb3NlciIsInN1YklkIiwiRXJyb3IiLCJ1bnN1YnNjcmliZUZvcktleSIsImluZGV4IiwiaW5kZXhPZiIsInNsaWNlIiwidHJpZ2dlcnMiLCJQdWJTdWJBc3luY0l0ZXJhdG9yIiwibWVzc2FnZSIsInN1YnNjcmliZXJzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQTs7QUFHQTs7QUFDQTs7QUFDQTs7QUFFQSxJQUFNQSxNQUFNLEdBQUcsb0JBQU0sWUFBTixDQUFmOztJQUVhQyxVOzs7QUFpQlgsc0JBQ0VDLE9BREYsRUFFRTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ0E7QUFDQSxTQUFLQyxVQUFMLEdBQWtCRCxPQUFPLENBQUNDLFVBQTFCO0FBQ0EsU0FBS0MsUUFBTCxHQUFnQkYsT0FBTyxDQUFDRSxRQUFSLElBQW9CLEVBQXBDO0FBQ0EsU0FBS0MsWUFBTCxHQUFvQkgsT0FBTyxDQUFDRyxZQUFSLElBQXdCLE9B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QTtBQUFBO0FBQUE7QUFBQTtBQVl6RDs7Ozs7O2tEQUUrQnZCLFU7Ozs7Ozt1QkFDeEIsS0FBS04sY0FBTCxDQUFvQk0sVUFBcEIsRzs7O0FBQ04sdUJBQU8sS0FBS1AsV0FBTCxDQUFpQk8sVUFBakIsQ0FBUDtBQUNBLHVCQUFPLEtBQUtOLGNBQUwsQ0FBb0JNLFVBQXBCLENBQVAiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQdWJTdWJFbmdpbmUgfSBmcm9tICdncmFwaHFsLXN1YnNjcmlwdGlvbnMnO1xuaW1wb3J0IGFtcXAgZnJvbSAnYW1xcGxpYic7XG5pbXBvcnQgRGVidWcgZnJvbSAnZGVidWcnO1xuXG5pbXBvcnQgeyBQdWJTdWJBTVFQT3B0aW9ucywgUXVldWVPcHRpb25zLCBFeGNoYW5nZU9wdGlvbnMgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgQU1RUFB1Ymxpc2hlciB9IGZyb20gJy4vYW1xcC9wdWJsaXNoZXInO1xuaW1wb3J0IHsgQU1RUFN1YnNjcmliZXIgfSBmcm9tICcuL2FtcXAvc3Vic2NyaWJlcic7XG5pbXBvcnQgeyBQdWJTdWJBc3luY0l0ZXJhdG9yIH0gZnJvbSAnLi9wdWJzdWItYXN5bmMtaXRlcmF0b3InO1xuXG5jb25zdCBsb2dnZXIgPSBEZWJ1ZygnQU1RUFB1YlN1YicpO1xuXG5leHBvcnQgY2xhc3MgQU1RUFB1YlN1YiBpbXBsZW1lbnRzIFB1YlN1YkVuZ2luZSB7XG5cbiAgcHJpdmF0ZSBjb25uZWN0aW9uOiBhbXFwLkNvbm5lY3Rpb247XG4gIHByaXZhdGUgZXhjaGFuZ2U6IHN0cmluZztcbiAgcHJpdmF0ZSBleGNoYW5nZVR5cGU6IHN0cmluZztcbiAgcHJpdmF0ZSBxdWV1ZU5hbWU6IHN0cmluZztcbiAgcHJpdmF0ZSBleGNoYW5nZU9wdGlvbnM6IEV4Y2hhbmdlT3B0aW9ucztcbiAgcHJpdmF0ZSBxdWV1ZU9wdGlvbnM6IFF1ZXVlT3B0aW9ucztcblxuICBwcml2YXRlIHB1Ymxpc2hlcjogQU1RUFB1Ymxpc2hlcjtcbiAgcHJpdmF0ZSBzdWJzY3JpYmVyOiBBTVFQU3Vic2NyaWJlcjtcblxuICBwcml2YXRlIHN1YnNjcmlwdGlvbk1hcDogeyBbc3ViSWQ6IG51bWJlcl06IHsgcm91dGluZ0tleTogc3RyaW5nLCBsaXN0ZW5lcjogRnVuY3Rpb24gfSB9O1xuICBwcml2YXRlIHN1YnNSZWZzTWFwOiB7IFt0cmlnZ2VyOiBzdHJpbmddOiBBcnJheTxudW1iZXI+IH07XG4gIHByaXZhdGUgdW5zdWJzY3JpYmVNYXA6IHsgW3RyaWdnZXI6IHN0cmluZ106ICgpID0+IFByb21pc2VMaWtlPGFueT4gfTtcbiAgcHJpdmF0ZSBjdXJyZW50U3Vic2NyaXB0aW9uSWQ6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBvcHRpb25zOiBQdWJTdWJBTVFQT3B0aW9uc1xuICApIHtcbiAgICAvLyBTZXR1cCBWYXJpYWJsZXNcbiAgICB0aGlzLmNvbm5lY3Rpb24gPSBvcHRpb25zLmNvbm5lY3Rpb247XG4gICAgdGhpcy5leGNoYW5nZSA9IG9wdGlvbnMuZXhjaGFuZ2UgfHwgJyc7XG4gICAgdGhpcy5leGNoYW5nZVR5cGUgPSBvcHRpb25zLmV4Y2hhbmdlVHlwZSB8fCAndG9waWMnO1xuICAgIHRoaXMucXVldWVOYW1lID0gb3B0aW9ucy5xdWV1ZU5hbWUgfHwgJyc7XG4gICAgdGhpcy5leGNoYW5nZU9wdGlvbnMgPSBvcHRpb25zLmV4Y2hhbmdlT3B0aW9ucyB8fCB7fTtcbiAgICB0aGlzLnF1ZXVlT3B0aW9ucyA9IG9wdGlvbnMucXVldWVPcHRpb25zIHx8IHt9O1xuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25NYXAgPSB7fTtcbiAgICB0aGlzLnN1YnNSZWZzTWFwID0ge307XG4gICAgdGhpcy51bnN1YnNjcmliZU1hcCA9IHt9O1xuICAgIHRoaXMuY3VycmVudFN1YnNjcmlwdGlvbklkID0gMDtcblxuICAgIC8vIEluaXRpYWxpemUgQU1RUCBIZWxwZXJcbiAgICB0aGlzLnB1Ymxpc2hlciA9IG5ldyBBTVFQUHVibGlzaGVyKHRoaXMuY29ubmVjdGlvbiwgbG9nZ2VyKTtcbiAgICB0aGlzLnN1YnNjcmliZXIgPSBuZXcgQU1RUFN1YnNjcmliZXIodGhpcy5jb25uZWN0aW9uLCBsb2dnZXIpO1xuXG4gICAgbG9nZ2VyKCdGaW5pc2hlZCBpbml0aWFsaXppbmcnKTtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBwdWJsaXNoKHJvdXRpbmdLZXk6IHN0cmluZywgcGF5bG9hZDogYW55KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbG9nZ2VyKCdQdWJsaXNoaW5nIG1lc3NhZ2UgdG8gZXhjaGFuZ2UgXCIlc1wiIGZvciBrZXkgXCIlc1wiICglaiknLCB0aGlzLmV4Y2hhbmdlLCByb3V0aW5nS2V5LCBwYXlsb2FkKTtcbiAgICByZXR1cm4gdGhpcy5wdWJsaXNoZXIucHVibGlzaCh0aGlzLmV4Y2hhbmdlLCByb3V0aW5nS2V5LCBwYXlsb2FkKTtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBzdWJzY3JpYmUocm91dGluZ0tleTogc3RyaW5nLCBvbk1lc3NhZ2U6IChtZXNzYWdlOiBhbnkpID0+IHZvaWQpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGNvbnN0IGlkID0gdGhpcy5jdXJyZW50U3Vic2NyaXB0aW9uSWQrKztcbiAgICB0aGlzLnN1YnNjcmlwdGlvbk1hcFtpZF0gPSB7XG4gICAgICByb3V0aW5nS2V5OiByb3V0aW5nS2V5LFxuICAgICAgbGlzdGVuZXI6IG9uTWVzc2FnZVxuICAgIH07XG5cbiAgICBjb25zdCByZWZzID0gdGhpcy5zdWJzUmVmc01hcFtyb3V0aW5nS2V5XTtcbiAgICBpZiAocmVmcyAmJiByZWZzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IG5ld1JlZnMgPSBbLi4ucmVmcywgaWRdO1xuICAgICAgdGhpcy5zdWJzUmVmc01hcFtyb3V0aW5nS2V5XSA9IG5ld1JlZnM7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGlkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuc3Vic2NyaWJlci5zdWJzY3JpYmUodGhpcy5leGNoYW5nZSwgcm91dGluZ0tleSwgdGhpcy5leGNoYW5nZVR5cGUsIHRoaXMucXVldWVOYW1lLCB0aGlzLmV4Y2hhbmdlT3B0aW9ucywgdGhpcy5xdWV1ZU9wdGlvbnMsIHRoaXMub25NZXNzYWdlLmJpbmQodGhpcykpXG4gICAgICAudGhlbihkaXNwb3NlciA9PiB7XG4gICAgICAgIHRoaXMuc3Vic1JlZnNNYXBbcm91dGluZ0tleV0gPSBbXG4gICAgICAgICAgLi4uKHRoaXMuc3Vic1JlZnNNYXBbcm91dGluZ0tleV0gfHwgW10pLFxuICAgICAgICAgIGlkLFxuICAgICAgICBdO1xuICAgICAgICBpZiAodGhpcy51bnN1YnNjcmliZU1hcFtyb3V0aW5nS2V5XSkge1xuICAgICAgICAgIHJldHVybiBkaXNwb3NlcigpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudW5zdWJzY3JpYmVNYXBbcm91dGluZ0tleV0gPSBkaXNwb3NlcjtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShpZCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgdW5zdWJzY3JpYmUoc3ViSWQ6IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHJvdXRpbmdLZXkgPSB0aGlzLnN1YnNjcmlwdGlvbk1hcFtzdWJJZF0ucm91dGluZ0tleTtcbiAgICBjb25zdCByZWZzID0gdGhpcy5zdWJzUmVmc01hcFtyb3V0aW5nS2V5XTtcblxuICAgIGlmICghcmVmcykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGVyZSBpcyBubyBzdWJzY3JpcHRpb24gb2YgaWQgXCIke3N1YklkfVwiYCk7XG4gICAgfVxuXG4gICAgaWYgKHJlZnMubGVuZ3RoID09PSAxKSB7XG4gICAgICBkZWxldGUgdGhpcy5zdWJzY3JpcHRpb25NYXBbc3ViSWRdO1xuICAgICAgcmV0dXJuIHRoaXMudW5zdWJzY3JpYmVGb3JLZXkocm91dGluZ0tleSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGluZGV4ID0gcmVmcy5pbmRleE9mKHN1YklkKTtcbiAgICAgIGNvbnN0IG5ld1JlZnMgPVxuICAgICAgICBpbmRleCA9PT0gLTFcbiAgICAgICAgICA/IHJlZnNcbiAgICAgICAgICA6IFsuLi5yZWZzLnNsaWNlKDAsIGluZGV4KSwgLi4ucmVmcy5zbGljZShpbmRleCArIDEpXTtcbiAgICAgIHRoaXMuc3Vic1JlZnNNYXBbcm91dGluZ0tleV0gPSBuZXdSZWZzO1xuICAgICAgZGVsZXRlIHRoaXMuc3Vic2NyaXB0aW9uTWFwW3N1YklkXTtcbiAgICB9XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICB9XG5cbiAgcHVibGljIGFzeW5jSXRlcmF0b3I8VD4odHJpZ2dlcnM6IHN0cmluZyB8IHN0cmluZ1tdKTogQXN5bmNJdGVyYXRvcjxUPiB7XG4gICAgcmV0dXJuIG5ldyBQdWJTdWJBc3luY0l0ZXJhdG9yPFQ+KHRoaXMsIHRyaWdnZXJzKTtcbiAgfVxuXG4gIHByaXZhdGUgb25NZXNzYWdlKHJvdXRpbmdLZXk6IHN0cmluZywgbWVzc2FnZTogYW55KTogdm9pZCB7XG4gICAgY29uc3Qgc3Vic2NyaWJlcnMgPSB0aGlzLnN1YnNSZWZzTWFwW3JvdXRpbmdLZXldO1xuXG4gICAgLy8gRG9uJ3Qgd29yayBmb3Igbm90aGluZy4uLlxuICAgIGlmICghc3Vic2NyaWJlcnMgfHwgIXN1YnNjcmliZXJzLmxlbmd0aCkge1xuICAgICAgdGhpcy51bnN1YnNjcmliZUZvcktleShyb3V0aW5nS2V5KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IHN1YklkIG9mIHN1YnNjcmliZXJzKSB7XG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbk1hcFtzdWJJZF0ubGlzdGVuZXIobWVzc2FnZSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyB1bnN1YnNjcmliZUZvcktleShyb3V0aW5nS2V5OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLnVuc3Vic2NyaWJlTWFwW3JvdXRpbmdLZXldKCk7XG4gICAgZGVsZXRlIHRoaXMuc3Vic1JlZnNNYXBbcm91dGluZ0tleV07XG4gICAgZGVsZXRlIHRoaXMudW5zdWJzY3JpYmVNYXBbcm91dGluZ0tleV07XG4gIH1cblxufVxuIl19
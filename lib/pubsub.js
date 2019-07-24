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
    (0, _defineProperty2.default)(this, "publisher", void 0);
    (0, _defineProperty2.default)(this, "subscriber", void 0);
    (0, _defineProperty2.default)(this, "subscriptionMap", void 0);
    (0, _defineProperty2.default)(this, "subsRefsMap", void 0);
    (0, _defineProperty2.default)(this, "unsubscribeMap", void 0);
    (0, _defineProperty2.default)(this, "currentSubscriptionId", void 0);
    // Setup Variables
    this.connection = options.connection;
    this.exchange = options.exchange || 'graphql_subscriptions';
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
                return _context2.abrupt("return", this.subscriber.subscribe(this.exchange, routingKey, this.onMessage.bind(this)).then(function (disposer) {
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
      var subscribers = this.subsRefsMap[routingKey]; // Don't work for nothing..

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wdWJzdWIudHMiXSwibmFtZXMiOlsibG9nZ2VyIiwiQU1RUFB1YlN1YiIsIm9wdGlvbnMiLCJjb25uZWN0aW9uIiwiZXhjaGFuZ2UiLCJzdWJzY3JpcHRpb25NYXAiLCJzdWJzUmVmc01hcCIsInVuc3Vic2NyaWJlTWFwIiwiY3VycmVudFN1YnNjcmlwdGlvbklkIiwicHVibGlzaGVyIiwiQU1RUFB1Ymxpc2hlciIsInN1YnNjcmliZXIiLCJBTVFQU3Vic2NyaWJlciIsInJvdXRpbmdLZXkiLCJwYXlsb2FkIiwicHVibGlzaCIsIm9uTWVzc2FnZSIsImlkIiwibGlzdGVuZXIiLCJyZWZzIiwibGVuZ3RoIiwibmV3UmVmcyIsIlByb21pc2UiLCJyZXNvbHZlIiwic3Vic2NyaWJlIiwiYmluZCIsInRoZW4iLCJkaXNwb3NlciIsInN1YklkIiwiRXJyb3IiLCJ1bnN1YnNjcmliZUZvcktleSIsImluZGV4IiwiaW5kZXhPZiIsInNsaWNlIiwidHJpZ2dlcnMiLCJQdWJTdWJBc3luY0l0ZXJhdG9yIiwibWVzc2FnZSIsInN1YnNjcmliZXJzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQTs7QUFHQTs7QUFDQTs7QUFDQTs7QUFFQSxJQUFNQSxNQUFNLEdBQUcsb0JBQU0sWUFBTixDQUFmOztJQUVhQyxVOzs7QUFhWCxzQkFDRUMsT0FERixFQUVFO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ0E7QUFDQSxTQUFLQyxVQUFMLEdBQWtCRCxPQUFPLENBQUNDLFVBQTFCO0FBQ0EsU0FBS0MsUUFBTCxHQUFnQkYsT0FBTyxDQUFDRSxRQUFSLElBQW9CLHVCQUFwQztBQUVBLFNBQUtDLGVBQUwsR0FBdUIsRUFBdkI7QUFDQSxTQUFLQyxXQUFMLEdBQW1CLEVBQW5CO0FBQ0EsU0FBS0MsY0FBTCxHQUFzQixFQUF0QjtBQUNBLFNBQUtDLHFCQUFMLEdBQTZCLENBQTdCLENBUkEsQ0FVQTs7QUFD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QUNBLGVBQU8sS0FBS2hCLGVBQUwsQ0FBcUJ1QixLQUFyQixDQUFQO0FBQ0Q7O0FBQ0QsYUFBT04sT0FBTyxDQUFDQyxPQUFSLEVBQVA7QUFDRDs7O2tDQUV1QlcsUSxFQUErQztBQUNyRSxhQUFPLElBQUlDLHdDQUFKLENBQTJCLElBQTNCLEVBQWlDRCxRQUFqQyxDQUFQO0FBQ0Q7Ozs4QkFFaUJyQixVLEVBQW9CdUIsTyxFQUFvQjtBQUN4RCxVQUFNQyxXQUFXLEdBQUcsS0FBSy9CLFdBQUwsQ0FBaUJPLFVBQWpCLENBQXBCLENBRHdELENBR3hEOztBQUNBLFVBQUksQ0FBQ3dCLFdBQUQsSUFBZ0IsQ0FBQ0EsV0FBVyxDQUFDakIsTUFBakMsRUFBeUM7QUFDdkMsYUFBS1UsaUJBQUwsQ0FBdUJqQixVQUF2QjtBQUNBO0FBQ0Q7O0FBUHVEO0FBQUE7QUFBQTs7QUFBQTtBQVN4RCw2QkFBb0J3QixXQUFwQiw4SEFBaUM7QUFBQSxjQUF0QlQsTUFBc0I7O0FBQy9CLGVBQUt2QixlQUFMLENBQXFCdUIsTUFBckIsRUFBNEJWLFFBQTVCLENBQXFDa0IsT0FBckM7QUFDRDtBQVh1RDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBWXpEOzs7Ozs7a0RBRStCdkIsVTs7Ozs7O3VCQUN4QixLQUFLTixjQUFMLENBQW9CTSxVQUFwQixHOzs7QUFDTix1QkFBTyxLQUFLUCxXQUFMLENBQWlCTyxVQUFqQixDQUFQO0FBQ0EsdUJBQU8sS0FBS04sY0FBTCxDQUFvQk0sVUFBcEIsQ0FBUCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFB1YlN1YkVuZ2luZSB9IGZyb20gJ2dyYXBocWwtc3Vic2NyaXB0aW9ucyc7XG5pbXBvcnQgYW1xcCBmcm9tICdhbXFwbGliJztcbmltcG9ydCBEZWJ1ZyBmcm9tICdkZWJ1Zyc7XG5cbmltcG9ydCB7IFB1YlN1YkFNUVBPcHRpb25zIH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7IEFNUVBQdWJsaXNoZXIgfSBmcm9tICcuL2FtcXAvcHVibGlzaGVyJztcbmltcG9ydCB7IEFNUVBTdWJzY3JpYmVyIH0gZnJvbSAnLi9hbXFwL3N1YnNjcmliZXInO1xuaW1wb3J0IHsgUHViU3ViQXN5bmNJdGVyYXRvciB9IGZyb20gJy4vcHVic3ViLWFzeW5jLWl0ZXJhdG9yJztcblxuY29uc3QgbG9nZ2VyID0gRGVidWcoJ0FNUVBQdWJTdWInKTtcblxuZXhwb3J0IGNsYXNzIEFNUVBQdWJTdWIgaW1wbGVtZW50cyBQdWJTdWJFbmdpbmUge1xuXG4gIHByaXZhdGUgY29ubmVjdGlvbjogYW1xcC5Db25uZWN0aW9uO1xuICBwcml2YXRlIGV4Y2hhbmdlOiBzdHJpbmc7XG5cbiAgcHJpdmF0ZSBwdWJsaXNoZXI6IEFNUVBQdWJsaXNoZXI7XG4gIHByaXZhdGUgc3Vic2NyaWJlcjogQU1RUFN1YnNjcmliZXI7XG5cbiAgcHJpdmF0ZSBzdWJzY3JpcHRpb25NYXA6IHsgW3N1YklkOiBudW1iZXJdOiB7IHJvdXRpbmdLZXk6IHN0cmluZywgbGlzdGVuZXI6IEZ1bmN0aW9uIH0gfTtcbiAgcHJpdmF0ZSBzdWJzUmVmc01hcDogeyBbdHJpZ2dlcjogc3RyaW5nXTogQXJyYXk8bnVtYmVyPiB9O1xuICBwcml2YXRlIHVuc3Vic2NyaWJlTWFwOiB7IFt0cmlnZ2VyOiBzdHJpbmddOiAoKSA9PiBQcm9taXNlTGlrZTxhbnk+IH07XG4gIHByaXZhdGUgY3VycmVudFN1YnNjcmlwdGlvbklkOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgb3B0aW9uczogUHViU3ViQU1RUE9wdGlvbnNcbiAgKSB7XG4gICAgLy8gU2V0dXAgVmFyaWFibGVzXG4gICAgdGhpcy5jb25uZWN0aW9uID0gb3B0aW9ucy5jb25uZWN0aW9uO1xuICAgIHRoaXMuZXhjaGFuZ2UgPSBvcHRpb25zLmV4Y2hhbmdlIHx8ICdncmFwaHFsX3N1YnNjcmlwdGlvbnMnO1xuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25NYXAgPSB7fTtcbiAgICB0aGlzLnN1YnNSZWZzTWFwID0ge307XG4gICAgdGhpcy51bnN1YnNjcmliZU1hcCA9IHt9O1xuICAgIHRoaXMuY3VycmVudFN1YnNjcmlwdGlvbklkID0gMDtcblxuICAgIC8vIEluaXRpYWxpemUgQU1RUCBIZWxwZXJcbiAgICB0aGlzLnB1Ymxpc2hlciA9IG5ldyBBTVFQUHVibGlzaGVyKHRoaXMuY29ubmVjdGlvbiwgbG9nZ2VyKTtcbiAgICB0aGlzLnN1YnNjcmliZXIgPSBuZXcgQU1RUFN1YnNjcmliZXIodGhpcy5jb25uZWN0aW9uLCBsb2dnZXIpO1xuXG4gICAgbG9nZ2VyKCdGaW5pc2hlZCBpbml0aWFsaXppbmcnKTtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBwdWJsaXNoKHJvdXRpbmdLZXk6IHN0cmluZywgcGF5bG9hZDogYW55KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbG9nZ2VyKCdQdWJsaXNoaW5nIG1lc3NhZ2UgdG8gZXhjaGFuZ2UgXCIlc1wiIGZvciBrZXkgXCIlc1wiICglaiknLCB0aGlzLmV4Y2hhbmdlLCByb3V0aW5nS2V5LCBwYXlsb2FkKTtcbiAgICByZXR1cm4gdGhpcy5wdWJsaXNoZXIucHVibGlzaCh0aGlzLmV4Y2hhbmdlLCByb3V0aW5nS2V5LCBwYXlsb2FkKTtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBzdWJzY3JpYmUocm91dGluZ0tleTogc3RyaW5nLCBvbk1lc3NhZ2U6IChtZXNzYWdlOiBhbnkpID0+IHZvaWQpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGNvbnN0IGlkID0gdGhpcy5jdXJyZW50U3Vic2NyaXB0aW9uSWQrKztcbiAgICB0aGlzLnN1YnNjcmlwdGlvbk1hcFtpZF0gPSB7XG4gICAgICByb3V0aW5nS2V5OiByb3V0aW5nS2V5LFxuICAgICAgbGlzdGVuZXI6IG9uTWVzc2FnZVxuICAgIH07XG5cbiAgICBjb25zdCByZWZzID0gdGhpcy5zdWJzUmVmc01hcFtyb3V0aW5nS2V5XTtcbiAgICBpZiAocmVmcyAmJiByZWZzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IG5ld1JlZnMgPSBbLi4ucmVmcywgaWRdO1xuICAgICAgdGhpcy5zdWJzUmVmc01hcFtyb3V0aW5nS2V5XSA9IG5ld1JlZnM7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGlkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuc3Vic2NyaWJlci5zdWJzY3JpYmUodGhpcy5leGNoYW5nZSwgcm91dGluZ0tleSwgdGhpcy5vbk1lc3NhZ2UuYmluZCh0aGlzKSlcbiAgICAgIC50aGVuKGRpc3Bvc2VyID0+IHtcbiAgICAgICAgdGhpcy5zdWJzUmVmc01hcFtyb3V0aW5nS2V5XSA9IFtcbiAgICAgICAgICAuLi4odGhpcy5zdWJzUmVmc01hcFtyb3V0aW5nS2V5XSB8fCBbXSksXG4gICAgICAgICAgaWQsXG4gICAgICAgIF07XG4gICAgICAgIGlmICh0aGlzLnVuc3Vic2NyaWJlTWFwW3JvdXRpbmdLZXldKSB7XG4gICAgICAgICAgcmV0dXJuIGRpc3Bvc2VyKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy51bnN1YnNjcmliZU1hcFtyb3V0aW5nS2V5XSA9IGRpc3Bvc2VyO1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGlkKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyB1bnN1YnNjcmliZShzdWJJZDogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qgcm91dGluZ0tleSA9IHRoaXMuc3Vic2NyaXB0aW9uTWFwW3N1YklkXS5yb3V0aW5nS2V5O1xuICAgIGNvbnN0IHJlZnMgPSB0aGlzLnN1YnNSZWZzTWFwW3JvdXRpbmdLZXldO1xuXG4gICAgaWYgKCFyZWZzKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZXJlIGlzIG5vIHN1YnNjcmlwdGlvbiBvZiBpZCBcIiR7c3ViSWR9XCJgKTtcbiAgICB9XG5cbiAgICBpZiAocmVmcy5sZW5ndGggPT09IDEpIHtcbiAgICAgIGRlbGV0ZSB0aGlzLnN1YnNjcmlwdGlvbk1hcFtzdWJJZF07XG4gICAgICByZXR1cm4gdGhpcy51bnN1YnNjcmliZUZvcktleShyb3V0aW5nS2V5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgaW5kZXggPSByZWZzLmluZGV4T2Yoc3ViSWQpO1xuICAgICAgY29uc3QgbmV3UmVmcyA9XG4gICAgICAgIGluZGV4ID09PSAtMVxuICAgICAgICAgID8gcmVmc1xuICAgICAgICAgIDogWy4uLnJlZnMuc2xpY2UoMCwgaW5kZXgpLCAuLi5yZWZzLnNsaWNlKGluZGV4ICsgMSldO1xuICAgICAgdGhpcy5zdWJzUmVmc01hcFtyb3V0aW5nS2V5XSA9IG5ld1JlZnM7XG4gICAgICBkZWxldGUgdGhpcy5zdWJzY3JpcHRpb25NYXBbc3ViSWRdO1xuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gIH1cblxuICBwdWJsaWMgYXN5bmNJdGVyYXRvcjxUPih0cmlnZ2Vyczogc3RyaW5nIHwgc3RyaW5nW10pOiBBc3luY0l0ZXJhdG9yPFQ+IHtcbiAgICByZXR1cm4gbmV3IFB1YlN1YkFzeW5jSXRlcmF0b3I8VD4odGhpcywgdHJpZ2dlcnMpO1xuICB9XG5cbiAgcHJpdmF0ZSBvbk1lc3NhZ2Uocm91dGluZ0tleTogc3RyaW5nLCBtZXNzYWdlOiBhbnkpOiB2b2lkIHtcbiAgICBjb25zdCBzdWJzY3JpYmVycyA9IHRoaXMuc3Vic1JlZnNNYXBbcm91dGluZ0tleV07XG5cbiAgICAvLyBEb24ndCB3b3JrIGZvciBub3RoaW5nLi5cbiAgICBpZiAoIXN1YnNjcmliZXJzIHx8ICFzdWJzY3JpYmVycy5sZW5ndGgpIHtcbiAgICAgIHRoaXMudW5zdWJzY3JpYmVGb3JLZXkocm91dGluZ0tleSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBzdWJJZCBvZiBzdWJzY3JpYmVycykge1xuICAgICAgdGhpcy5zdWJzY3JpcHRpb25NYXBbc3ViSWRdLmxpc3RlbmVyKG1lc3NhZ2UpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgdW5zdWJzY3JpYmVGb3JLZXkocm91dGluZ0tleTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy51bnN1YnNjcmliZU1hcFtyb3V0aW5nS2V5XSgpO1xuICAgIGRlbGV0ZSB0aGlzLnN1YnNSZWZzTWFwW3JvdXRpbmdLZXldO1xuICAgIGRlbGV0ZSB0aGlzLnVuc3Vic2NyaWJlTWFwW3JvdXRpbmdLZXldO1xuICB9XG5cbn1cbiJdfQ==
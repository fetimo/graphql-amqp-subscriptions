"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AMQPSubscriber = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _common = require("./common");

var AMQPSubscriber =
/*#__PURE__*/
function () {
  function AMQPSubscriber(connection, logger) {
    (0, _classCallCheck2.default)(this, AMQPSubscriber);
    this.connection = connection;
    this.logger = logger;
    (0, _defineProperty2.default)(this, "channel", null);
  }

  (0, _createClass2.default)(AMQPSubscriber, [{
    key: "subscribe",
    value: function () {
      var _subscribe = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee4(exchange, routingKey) {
        var _this = this;

        var exchangeType,
            queueName,
            exchangeOptions,
            queueOptions,
            action,
            promise,
            _args4 = arguments;
        return _regenerator.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                exchangeType = _args4.length > 2 && _args4[2] !== undefined ? _args4[2] : 'topic';
                queueName = _args4.length > 3 && _args4[3] !== undefined ? _args4[3] : '';
                exchangeOptions = _args4.length > 4 && _args4[4] !== undefined ? _args4[4] : {
                  durable: false,
                  autoDelete: true
                };
                queueOptions = _args4.length > 5 && _args4[5] !== undefined ? _args4[5] : {
                  exclusive: true,
                  durable: false,
                  autoDelete: true
                };
                action = _args4.length > 6 ? _args4[6] : undefined;

                if (this.channel) {
                  promise = Promise.resolve(this.channel);
                } else {
                  promise = this.connection.createChannel();
                }

                return _context4.abrupt("return", promise.then(
                /*#__PURE__*/
                function () {
                  var _ref = (0, _asyncToGenerator2.default)(
                  /*#__PURE__*/
                  _regenerator.default.mark(function _callee3(ch) {
                    return _regenerator.default.wrap(function _callee3$(_context3) {
                      while (1) {
                        switch (_context3.prev = _context3.next) {
                          case 0:
                            _this.channel = ch;
                            return _context3.abrupt("return", ch.assertExchange(exchange, exchangeType, exchangeOptions).then(function () {
                              console.log('lib queueName', queueName);
                              return ch.assertQueue(queueName, queueOptions);
                            }).then(
                            /*#__PURE__*/
                            function () {
                              var _ref2 = (0, _asyncToGenerator2.default)(
                              /*#__PURE__*/
                              _regenerator.default.mark(function _callee(queue) {
                                return _regenerator.default.wrap(function _callee$(_context) {
                                  while (1) {
                                    switch (_context.prev = _context.next) {
                                      case 0:
                                        return _context.abrupt("return", ch.bindQueue(queue.queue, exchange, routingKey).then(function () {
                                          return queue;
                                        }));

                                      case 1:
                                      case "end":
                                        return _context.stop();
                                    }
                                  }
                                }, _callee, this);
                              }));

                              return function (_x4) {
                                return _ref2.apply(this, arguments);
                              };
                            }()).then(
                            /*#__PURE__*/
                            function () {
                              var _ref3 = (0, _asyncToGenerator2.default)(
                              /*#__PURE__*/
                              _regenerator.default.mark(function _callee2(queue) {
                                return _regenerator.default.wrap(function _callee2$(_context2) {
                                  while (1) {
                                    switch (_context2.prev = _context2.next) {
                                      case 0:
                                        return _context2.abrupt("return", ch.consume(queue.queue, function (msg) {
                                          var parsedMessage = _common.Logger.convertMessage(msg);

                                          _this.logger('Message arrived from Queue "%s" (%j)', queue.queue, parsedMessage);

                                          action(routingKey, parsedMessage);
                                        }, {
                                          noAck: true
                                        }).then(function (opts) {
                                          _this.logger('Subscribed to Queue "%s" (%s)', queue.queue, opts.consumerTag);

                                          return function () {
                                            _this.logger('Disposing Subscriber to Queue "%s" (%s)', queue.queue, opts.consumerTag);

                                            return ch.cancel(opts.consumerTag);
                                          };
                                        }));

                                      case 1:
                                      case "end":
                                        return _context2.stop();
                                    }
                                  }
                                }, _callee2, this);
                              }));

                              return function (_x5) {
                                return _ref3.apply(this, arguments);
                              };
                            }()).catch(function (err) {
                              return Promise.reject(err);
                            }));

                          case 2:
                          case "end":
                            return _context3.stop();
                        }
                      }
                    }, _callee3, this);
                  }));

                  return function (_x3) {
                    return _ref.apply(this, arguments);
                  };
                }()));

              case 7:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function subscribe(_x, _x2) {
        return _subscribe.apply(this, arguments);
      }

      return subscribe;
    }()
  }]);
  return AMQPSubscriber;
}();

exports.AMQPSubscriber = AMQPSubscriber;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hbXFwL3N1YnNjcmliZXIudHMiXSwibmFtZXMiOlsiQU1RUFN1YnNjcmliZXIiLCJjb25uZWN0aW9uIiwibG9nZ2VyIiwiZXhjaGFuZ2UiLCJyb3V0aW5nS2V5IiwiZXhjaGFuZ2VUeXBlIiwicXVldWVOYW1lIiwiZXhjaGFuZ2VPcHRpb25zIiwiZHVyYWJsZSIsImF1dG9EZWxldGUiLCJxdWV1ZU9wdGlvbnMiLCJleGNsdXNpdmUiLCJhY3Rpb24iLCJjaGFubmVsIiwicHJvbWlzZSIsIlByb21pc2UiLCJyZXNvbHZlIiwiY3JlYXRlQ2hhbm5lbCIsInRoZW4iLCJjaCIsImFzc2VydEV4Y2hhbmdlIiwiY29uc29sZSIsImxvZyIsImFzc2VydFF1ZXVlIiwicXVldWUiLCJiaW5kUXVldWUiLCJjb25zdW1lIiwibXNnIiwicGFyc2VkTWVzc2FnZSIsIkxvZ2dlciIsImNvbnZlcnRNZXNzYWdlIiwibm9BY2siLCJvcHRzIiwiY29uc3VtZXJUYWciLCJjYW5jZWwiLCJjYXRjaCIsImVyciIsInJlamVjdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUdBOztJQUVhQSxjOzs7QUFJWCwwQkFDVUMsVUFEVixFQUVVQyxNQUZWLEVBR0U7QUFBQTtBQUFBO0FBQUE7QUFBQSxtREFMcUMsSUFLckM7QUFFRDs7Ozs7OztrREFHQ0MsUSxFQUNBQyxVOzs7Ozs7Ozs7Ozs7OztBQUNBQyxnQkFBQUEsWSw4REFBdUIsTztBQUN2QkMsZ0JBQUFBLFMsOERBQW9CLEU7QUFDcEJDLGdCQUFBQSxlLDhEQUEwQjtBQUFFQyxrQkFBQUEsT0FBTyxFQUFFLEtBQVg7QUFBa0JDLGtCQUFBQSxVQUFVLEVBQUU7QUFBOUIsaUI7QUFDMUJDLGdCQUFBQSxZLDhEQUF1QjtBQUFFQyxrQkFBQUEsU0FBUyxFQUFFLElBQWI7QUFBbUJILGtCQUFBQSxPQUFPLEVBQUUsS0FBNUI7QUFBbUNDLGtCQUFBQSxVQUFVLEVBQUU7QUFBL0MsaUI7QUFDdkJHLGdCQUFBQSxNOztBQUdBLG9CQUFJLEtBQUtDLE9BQVQsRUFBa0I7QUFDaEJDLGtCQUFBQSxPQUFPLEdBQUdDLE9BQU8sQ0FBQ0MsT0FBUixDQUFnQixLQUFLSCxPQUFyQixDQUFWO0FBQ0QsaUJBRkQsTUFFTztBQUNMQyxrQkFBQUEsT0FBTyxHQUFHLEtBQUtiLFVBQUwsQ0FBZ0JnQixhQUFoQixFQUFWO0FBQ0Q7O2tEQUNNSCxPQUFPLENBQ2JJLElBRE07QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLDRDQUNELGtCQUFNQyxFQUFOO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDSiw0QkFBQSxLQUFJLENBQUNOLE9BQUwsR0FBZU0sRUFBZjtBQURJLDhEQUVHQSxFQUFFLENBQUNDLGNBQUgsQ0FBa0JqQixRQUFsQixFQUE0QkUsWUFBNUIsRUFBMENFLGVBQTFDLEVBQ05XLElBRE0sQ0FDRCxZQUFNO0FBQ1ZHLDhCQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxlQUFaLEVBQTZCaEIsU0FBN0I7QUFDQSxxQ0FBT2EsRUFBRSxDQUFDSSxXQUFILENBQWVqQixTQUFmLEVBQTBCSSxZQUExQixDQUFQO0FBQ0QsNkJBSk0sRUFLTlEsSUFMTTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsd0RBS0QsaUJBQU1NLEtBQU47QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHlFQUNHTCxFQUFFLENBQUNNLFNBQUgsQ0FBYUQsS0FBSyxDQUFDQSxLQUFuQixFQUEwQnJCLFFBQTFCLEVBQW9DQyxVQUFwQyxFQUNOYyxJQURNLENBQ0QsWUFBTTtBQUNWLGlEQUFPTSxLQUFQO0FBQ0QseUNBSE0sQ0FESDs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSwrQkFMQzs7QUFBQTtBQUFBO0FBQUE7QUFBQSxpQ0FXTk4sSUFYTTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsd0RBV0Qsa0JBQU1NLEtBQU47QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLDBFQUNHTCxFQUFFLENBQUNPLE9BQUgsQ0FBV0YsS0FBSyxDQUFDQSxLQUFqQixFQUF3QixVQUFDRyxHQUFELEVBQVM7QUFDdEMsOENBQUlDLGFBQWEsR0FBR0MsZUFBT0MsY0FBUCxDQUFzQkgsR0FBdEIsQ0FBcEI7O0FBQ0EsMENBQUEsS0FBSSxDQUFDekIsTUFBTCxDQUFZLHNDQUFaLEVBQW9Ec0IsS0FBSyxDQUFDQSxLQUExRCxFQUFpRUksYUFBakU7O0FBQ0FoQiwwQ0FBQUEsTUFBTSxDQUFDUixVQUFELEVBQWF3QixhQUFiLENBQU47QUFDRCx5Q0FKTSxFQUlKO0FBQUNHLDBDQUFBQSxLQUFLLEVBQUU7QUFBUix5Q0FKSSxFQUtOYixJQUxNLENBS0QsVUFBQWMsSUFBSSxFQUFJO0FBQ1osMENBQUEsS0FBSSxDQUFDOUIsTUFBTCxDQUFZLCtCQUFaLEVBQTZDc0IsS0FBSyxDQUFDQSxLQUFuRCxFQUEwRFEsSUFBSSxDQUFDQyxXQUEvRDs7QUFDQSxpREFBUSxZQUF3QjtBQUM5Qiw0Q0FBQSxLQUFJLENBQUMvQixNQUFMLENBQVkseUNBQVosRUFBdURzQixLQUFLLENBQUNBLEtBQTdELEVBQW9FUSxJQUFJLENBQUNDLFdBQXpFOztBQUNBLG1EQUFPZCxFQUFFLENBQUNlLE1BQUgsQ0FBVUYsSUFBSSxDQUFDQyxXQUFmLENBQVA7QUFDRCwyQ0FIRDtBQUlELHlDQVhNLENBREg7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsK0JBWEM7O0FBQUE7QUFBQTtBQUFBO0FBQUEsaUNBeUJORSxLQXpCTSxDQXlCQSxVQUFBQyxHQUFHLEVBQUk7QUFDWixxQ0FBT3JCLE9BQU8sQ0FBQ3NCLE1BQVIsQ0FBZUQsR0FBZixDQUFQO0FBQ0QsNkJBM0JNLENBRkg7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsbUJBREM7O0FBQUE7QUFBQTtBQUFBO0FBQUEsb0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgYW1xcCBmcm9tICdhbXFwbGliJztcbmltcG9ydCBEZWJ1ZyBmcm9tICdkZWJ1Zyc7XG5cbmltcG9ydCB7IExvZ2dlciB9IGZyb20gJy4vY29tbW9uJztcblxuZXhwb3J0IGNsYXNzIEFNUVBTdWJzY3JpYmVyIHtcblxuICBwcml2YXRlIGNoYW5uZWw6IGFtcXAuQ2hhbm5lbCB8IG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgY29ubmVjdGlvbjogYW1xcC5Db25uZWN0aW9uLFxuICAgIHByaXZhdGUgbG9nZ2VyOiBEZWJ1Zy5JRGVidWdnZXJcbiAgKSB7XG5cbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBzdWJzY3JpYmUoXG4gICAgZXhjaGFuZ2U6IHN0cmluZyxcbiAgICByb3V0aW5nS2V5OiBzdHJpbmcsXG4gICAgZXhjaGFuZ2VUeXBlOiBzdHJpbmcgPSAndG9waWMnLFxuICAgIHF1ZXVlTmFtZTogc3RyaW5nID0gJycsXG4gICAgZXhjaGFuZ2VPcHRpb25zOiBvYmplY3QgPSB7IGR1cmFibGU6IGZhbHNlLCBhdXRvRGVsZXRlOiB0cnVlIH0sXG4gICAgcXVldWVPcHRpb25zOiBvYmplY3QgPSB7IGV4Y2x1c2l2ZTogdHJ1ZSwgZHVyYWJsZTogZmFsc2UsIGF1dG9EZWxldGU6IHRydWUgfSxcbiAgICBhY3Rpb246IChyb3V0aW5nS2V5OiBzdHJpbmcsIG1lc3NhZ2U6IGFueSkgPT4gdm9pZFxuICApOiBQcm9taXNlPCgpID0+IFByb21pc2VMaWtlPGFueT4+IHtcbiAgICBsZXQgcHJvbWlzZTogUHJvbWlzZUxpa2U8YW1xcC5DaGFubmVsPjtcbiAgICBpZiAodGhpcy5jaGFubmVsKSB7XG4gICAgICBwcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKHRoaXMuY2hhbm5lbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHByb21pc2UgPSB0aGlzLmNvbm5lY3Rpb24uY3JlYXRlQ2hhbm5lbCgpO1xuICAgIH1cbiAgICByZXR1cm4gcHJvbWlzZVxuICAgIC50aGVuKGFzeW5jIGNoID0+IHtcbiAgICAgIHRoaXMuY2hhbm5lbCA9IGNoO1xuICAgICAgcmV0dXJuIGNoLmFzc2VydEV4Y2hhbmdlKGV4Y2hhbmdlLCBleGNoYW5nZVR5cGUsIGV4Y2hhbmdlT3B0aW9ucylcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coJ2xpYiBxdWV1ZU5hbWUnLCBxdWV1ZU5hbWUpXG4gICAgICAgIHJldHVybiBjaC5hc3NlcnRRdWV1ZShxdWV1ZU5hbWUsIHF1ZXVlT3B0aW9ucyk7XG4gICAgICB9KVxuICAgICAgLnRoZW4oYXN5bmMgcXVldWUgPT4ge1xuICAgICAgICByZXR1cm4gY2guYmluZFF1ZXVlKHF1ZXVlLnF1ZXVlLCBleGNoYW5nZSwgcm91dGluZ0tleSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIHJldHVybiBxdWV1ZTtcbiAgICAgICAgfSk7XG4gICAgICB9KVxuICAgICAgLnRoZW4oYXN5bmMgcXVldWUgPT4ge1xuICAgICAgICByZXR1cm4gY2guY29uc3VtZShxdWV1ZS5xdWV1ZSwgKG1zZykgPT4ge1xuICAgICAgICAgIGxldCBwYXJzZWRNZXNzYWdlID0gTG9nZ2VyLmNvbnZlcnRNZXNzYWdlKG1zZyk7XG4gICAgICAgICAgdGhpcy5sb2dnZXIoJ01lc3NhZ2UgYXJyaXZlZCBmcm9tIFF1ZXVlIFwiJXNcIiAoJWopJywgcXVldWUucXVldWUsIHBhcnNlZE1lc3NhZ2UpO1xuICAgICAgICAgIGFjdGlvbihyb3V0aW5nS2V5LCBwYXJzZWRNZXNzYWdlKTtcbiAgICAgICAgfSwge25vQWNrOiB0cnVlfSlcbiAgICAgICAgLnRoZW4ob3B0cyA9PiB7XG4gICAgICAgICAgdGhpcy5sb2dnZXIoJ1N1YnNjcmliZWQgdG8gUXVldWUgXCIlc1wiICglcyknLCBxdWV1ZS5xdWV1ZSwgb3B0cy5jb25zdW1lclRhZyk7XG4gICAgICAgICAgcmV0dXJuICgoKTogUHJvbWlzZUxpa2U8YW55PiA9PiB7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlcignRGlzcG9zaW5nIFN1YnNjcmliZXIgdG8gUXVldWUgXCIlc1wiICglcyknLCBxdWV1ZS5xdWV1ZSwgb3B0cy5jb25zdW1lclRhZyk7XG4gICAgICAgICAgICByZXR1cm4gY2guY2FuY2VsKG9wdHMuY29uc3VtZXJUYWcpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycik7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG59XG4iXX0=
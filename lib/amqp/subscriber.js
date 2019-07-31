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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hbXFwL3N1YnNjcmliZXIudHMiXSwibmFtZXMiOlsiQU1RUFN1YnNjcmliZXIiLCJjb25uZWN0aW9uIiwibG9nZ2VyIiwiZXhjaGFuZ2UiLCJyb3V0aW5nS2V5IiwiZXhjaGFuZ2VUeXBlIiwicXVldWVOYW1lIiwiZXhjaGFuZ2VPcHRpb25zIiwiZHVyYWJsZSIsImF1dG9EZWxldGUiLCJxdWV1ZU9wdGlvbnMiLCJleGNsdXNpdmUiLCJhY3Rpb24iLCJjaGFubmVsIiwicHJvbWlzZSIsIlByb21pc2UiLCJyZXNvbHZlIiwiY3JlYXRlQ2hhbm5lbCIsInRoZW4iLCJjaCIsImFzc2VydEV4Y2hhbmdlIiwiYXNzZXJ0UXVldWUiLCJxdWV1ZSIsImJpbmRRdWV1ZSIsImNvbnN1bWUiLCJtc2ciLCJwYXJzZWRNZXNzYWdlIiwiTG9nZ2VyIiwiY29udmVydE1lc3NhZ2UiLCJub0FjayIsIm9wdHMiLCJjb25zdW1lclRhZyIsImNhbmNlbCIsImNhdGNoIiwiZXJyIiwicmVqZWN0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBR0E7O0lBRWFBLGM7OztBQUlYLDBCQUNVQyxVQURWLEVBRVVDLE1BRlYsRUFHRTtBQUFBO0FBQUE7QUFBQTtBQUFBLG1EQUxxQyxJQUtyQztBQUVEOzs7Ozs7O2tEQUdDQyxRLEVBQ0FDLFU7Ozs7Ozs7Ozs7Ozs7O0FBQ0FDLGdCQUFBQSxZLDhEQUF1QixPO0FBQ3ZCQyxnQkFBQUEsUyw4REFBb0IsRTtBQUNwQkMsZ0JBQUFBLGUsOERBQTBCO0FBQUVDLGtCQUFBQSxPQUFPLEVBQUUsS0FBWDtBQUFrQkMsa0JBQUFBLFVBQVUsRUFBRTtBQUE5QixpQjtBQUMxQkMsZ0JBQUFBLFksOERBQXVCO0FBQUVDLGtCQUFBQSxTQUFTLEVBQUUsSUFBYjtBQUFtQkgsa0JBQUFBLE9BQU8sRUFBRSxLQUE1QjtBQUFtQ0Msa0JBQUFBLFVBQVUsRUFBRTtBQUEvQyxpQjtBQUN2QkcsZ0JBQUFBLE07O0FBR0Esb0JBQUksS0FBS0MsT0FBVCxFQUFrQjtBQUNoQkMsa0JBQUFBLE9BQU8sR0FBR0MsT0FBTyxDQUFDQyxPQUFSLENBQWdCLEtBQUtILE9BQXJCLENBQVY7QUFDRCxpQkFGRCxNQUVPO0FBQ0xDLGtCQUFBQSxPQUFPLEdBQUcsS0FBS2IsVUFBTCxDQUFnQmdCLGFBQWhCLEVBQVY7QUFDRDs7a0RBQ01ILE9BQU8sQ0FDYkksSUFETTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsNENBQ0Qsa0JBQU1DLEVBQU47QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNKLDRCQUFBLEtBQUksQ0FBQ04sT0FBTCxHQUFlTSxFQUFmO0FBREksOERBRUdBLEVBQUUsQ0FBQ0MsY0FBSCxDQUFrQmpCLFFBQWxCLEVBQTRCRSxZQUE1QixFQUEwQ0UsZUFBMUMsRUFDTlcsSUFETSxDQUNELFlBQU07QUFDVixxQ0FBT0MsRUFBRSxDQUFDRSxXQUFILENBQWVmLFNBQWYsRUFBMEJJLFlBQTFCLENBQVA7QUFDRCw2QkFITSxFQUlOUSxJQUpNO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSx3REFJRCxpQkFBTUksS0FBTjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEseUVBQ0dILEVBQUUsQ0FBQ0ksU0FBSCxDQUFhRCxLQUFLLENBQUNBLEtBQW5CLEVBQTBCbkIsUUFBMUIsRUFBb0NDLFVBQXBDLEVBQ05jLElBRE0sQ0FDRCxZQUFNO0FBQ1YsaURBQU9JLEtBQVA7QUFDRCx5Q0FITSxDQURIOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLCtCQUpDOztBQUFBO0FBQUE7QUFBQTtBQUFBLGlDQVVOSixJQVZNO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSx3REFVRCxrQkFBTUksS0FBTjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsMEVBQ0dILEVBQUUsQ0FBQ0ssT0FBSCxDQUFXRixLQUFLLENBQUNBLEtBQWpCLEVBQXdCLFVBQUNHLEdBQUQsRUFBUztBQUN0Qyw4Q0FBSUMsYUFBYSxHQUFHQyxlQUFPQyxjQUFQLENBQXNCSCxHQUF0QixDQUFwQjs7QUFDQSwwQ0FBQSxLQUFJLENBQUN2QixNQUFMLENBQVksc0NBQVosRUFBb0RvQixLQUFLLENBQUNBLEtBQTFELEVBQWlFSSxhQUFqRTs7QUFDQWQsMENBQUFBLE1BQU0sQ0FBQ1IsVUFBRCxFQUFhc0IsYUFBYixDQUFOO0FBQ0QseUNBSk0sRUFJSjtBQUFDRywwQ0FBQUEsS0FBSyxFQUFFO0FBQVIseUNBSkksRUFLTlgsSUFMTSxDQUtELFVBQUFZLElBQUksRUFBSTtBQUNaLDBDQUFBLEtBQUksQ0FBQzVCLE1BQUwsQ0FBWSwrQkFBWixFQUE2Q29CLEtBQUssQ0FBQ0EsS0FBbkQsRUFBMERRLElBQUksQ0FBQ0MsV0FBL0Q7O0FBQ0EsaURBQVEsWUFBd0I7QUFDOUIsNENBQUEsS0FBSSxDQUFDN0IsTUFBTCxDQUFZLHlDQUFaLEVBQXVEb0IsS0FBSyxDQUFDQSxLQUE3RCxFQUFvRVEsSUFBSSxDQUFDQyxXQUF6RTs7QUFDQSxtREFBT1osRUFBRSxDQUFDYSxNQUFILENBQVVGLElBQUksQ0FBQ0MsV0FBZixDQUFQO0FBQ0QsMkNBSEQ7QUFJRCx5Q0FYTSxDQURIOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLCtCQVZDOztBQUFBO0FBQUE7QUFBQTtBQUFBLGlDQXdCTkUsS0F4Qk0sQ0F3QkEsVUFBQUMsR0FBRyxFQUFJO0FBQ1oscUNBQU9uQixPQUFPLENBQUNvQixNQUFSLENBQWVELEdBQWYsQ0FBUDtBQUNELDZCQTFCTSxDQUZIOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLG1CQURDOztBQUFBO0FBQUE7QUFBQTtBQUFBLG9CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGFtcXAgZnJvbSAnYW1xcGxpYic7XG5pbXBvcnQgRGVidWcgZnJvbSAnZGVidWcnO1xuXG5pbXBvcnQgeyBMb2dnZXIgfSBmcm9tICcuL2NvbW1vbic7XG5cbmV4cG9ydCBjbGFzcyBBTVFQU3Vic2NyaWJlciB7XG5cbiAgcHJpdmF0ZSBjaGFubmVsOiBhbXFwLkNoYW5uZWwgfCBudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGNvbm5lY3Rpb246IGFtcXAuQ29ubmVjdGlvbixcbiAgICBwcml2YXRlIGxvZ2dlcjogRGVidWcuSURlYnVnZ2VyXG4gICkge1xuXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgc3Vic2NyaWJlKFxuICAgIGV4Y2hhbmdlOiBzdHJpbmcsXG4gICAgcm91dGluZ0tleTogc3RyaW5nLFxuICAgIGV4Y2hhbmdlVHlwZTogc3RyaW5nID0gJ3RvcGljJyxcbiAgICBxdWV1ZU5hbWU6IHN0cmluZyA9ICcnLFxuICAgIGV4Y2hhbmdlT3B0aW9uczogb2JqZWN0ID0geyBkdXJhYmxlOiBmYWxzZSwgYXV0b0RlbGV0ZTogdHJ1ZSB9LFxuICAgIHF1ZXVlT3B0aW9uczogb2JqZWN0ID0geyBleGNsdXNpdmU6IHRydWUsIGR1cmFibGU6IGZhbHNlLCBhdXRvRGVsZXRlOiB0cnVlIH0sXG4gICAgYWN0aW9uOiAocm91dGluZ0tleTogc3RyaW5nLCBtZXNzYWdlOiBhbnkpID0+IHZvaWRcbiAgKTogUHJvbWlzZTwoKSA9PiBQcm9taXNlTGlrZTxhbnk+PiB7XG4gICAgbGV0IHByb21pc2U6IFByb21pc2VMaWtlPGFtcXAuQ2hhbm5lbD47XG4gICAgaWYgKHRoaXMuY2hhbm5lbCkge1xuICAgICAgcHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSh0aGlzLmNoYW5uZWwpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwcm9taXNlID0gdGhpcy5jb25uZWN0aW9uLmNyZWF0ZUNoYW5uZWwoKTtcbiAgICB9XG4gICAgcmV0dXJuIHByb21pc2VcbiAgICAudGhlbihhc3luYyBjaCA9PiB7XG4gICAgICB0aGlzLmNoYW5uZWwgPSBjaDtcbiAgICAgIHJldHVybiBjaC5hc3NlcnRFeGNoYW5nZShleGNoYW5nZSwgZXhjaGFuZ2VUeXBlLCBleGNoYW5nZU9wdGlvbnMpXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIHJldHVybiBjaC5hc3NlcnRRdWV1ZShxdWV1ZU5hbWUsIHF1ZXVlT3B0aW9ucyk7XG4gICAgICB9KVxuICAgICAgLnRoZW4oYXN5bmMgcXVldWUgPT4ge1xuICAgICAgICByZXR1cm4gY2guYmluZFF1ZXVlKHF1ZXVlLnF1ZXVlLCBleGNoYW5nZSwgcm91dGluZ0tleSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIHJldHVybiBxdWV1ZTtcbiAgICAgICAgfSk7XG4gICAgICB9KVxuICAgICAgLnRoZW4oYXN5bmMgcXVldWUgPT4ge1xuICAgICAgICByZXR1cm4gY2guY29uc3VtZShxdWV1ZS5xdWV1ZSwgKG1zZykgPT4ge1xuICAgICAgICAgIGxldCBwYXJzZWRNZXNzYWdlID0gTG9nZ2VyLmNvbnZlcnRNZXNzYWdlKG1zZyk7XG4gICAgICAgICAgdGhpcy5sb2dnZXIoJ01lc3NhZ2UgYXJyaXZlZCBmcm9tIFF1ZXVlIFwiJXNcIiAoJWopJywgcXVldWUucXVldWUsIHBhcnNlZE1lc3NhZ2UpO1xuICAgICAgICAgIGFjdGlvbihyb3V0aW5nS2V5LCBwYXJzZWRNZXNzYWdlKTtcbiAgICAgICAgfSwge25vQWNrOiB0cnVlfSlcbiAgICAgICAgLnRoZW4ob3B0cyA9PiB7XG4gICAgICAgICAgdGhpcy5sb2dnZXIoJ1N1YnNjcmliZWQgdG8gUXVldWUgXCIlc1wiICglcyknLCBxdWV1ZS5xdWV1ZSwgb3B0cy5jb25zdW1lclRhZyk7XG4gICAgICAgICAgcmV0dXJuICgoKTogUHJvbWlzZUxpa2U8YW55PiA9PiB7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlcignRGlzcG9zaW5nIFN1YnNjcmliZXIgdG8gUXVldWUgXCIlc1wiICglcyknLCBxdWV1ZS5xdWV1ZSwgb3B0cy5jb25zdW1lclRhZyk7XG4gICAgICAgICAgICByZXR1cm4gY2guY2FuY2VsKG9wdHMuY29uc3VtZXJUYWcpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycik7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG59XG4iXX0=
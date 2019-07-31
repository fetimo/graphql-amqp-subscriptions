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
            action,
            promise,
            _args4 = arguments;
        return _regenerator.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                exchangeType = _args4.length > 2 && _args4[2] !== undefined ? _args4[2] : 'topic';
                queueName = _args4.length > 3 && _args4[3] !== undefined ? _args4[3] : '';
                action = _args4.length > 4 ? _args4[4] : undefined;

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
                            return _context3.abrupt("return", ch.assertExchange(exchange, exchangeType, {
                              durable: false,
                              autoDelete: true
                            }).then(function () {
                              return ch.assertQueue(queueName, {
                                exclusive: true,
                                durable: false,
                                autoDelete: true
                              });
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

              case 5:
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hbXFwL3N1YnNjcmliZXIudHMiXSwibmFtZXMiOlsiQU1RUFN1YnNjcmliZXIiLCJjb25uZWN0aW9uIiwibG9nZ2VyIiwiZXhjaGFuZ2UiLCJyb3V0aW5nS2V5IiwiZXhjaGFuZ2VUeXBlIiwicXVldWVOYW1lIiwiYWN0aW9uIiwiY2hhbm5lbCIsInByb21pc2UiLCJQcm9taXNlIiwicmVzb2x2ZSIsImNyZWF0ZUNoYW5uZWwiLCJ0aGVuIiwiY2giLCJhc3NlcnRFeGNoYW5nZSIsImR1cmFibGUiLCJhdXRvRGVsZXRlIiwiYXNzZXJ0UXVldWUiLCJleGNsdXNpdmUiLCJxdWV1ZSIsImJpbmRRdWV1ZSIsImNvbnN1bWUiLCJtc2ciLCJwYXJzZWRNZXNzYWdlIiwiTG9nZ2VyIiwiY29udmVydE1lc3NhZ2UiLCJub0FjayIsIm9wdHMiLCJjb25zdW1lclRhZyIsImNhbmNlbCIsImNhdGNoIiwiZXJyIiwicmVqZWN0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBR0E7O0lBRWFBLGM7OztBQUlYLDBCQUNVQyxVQURWLEVBRVVDLE1BRlYsRUFHRTtBQUFBO0FBQUE7QUFBQTtBQUFBLG1EQUxxQyxJQUtyQztBQUVEOzs7Ozs7O2tEQUdDQyxRLEVBQ0FDLFU7Ozs7Ozs7Ozs7OztBQUNBQyxnQkFBQUEsWSw4REFBdUIsTztBQUN2QkMsZ0JBQUFBLFMsOERBQW9CLEU7QUFDcEJDLGdCQUFBQSxNOztBQUdBLG9CQUFJLEtBQUtDLE9BQVQsRUFBa0I7QUFDaEJDLGtCQUFBQSxPQUFPLEdBQUdDLE9BQU8sQ0FBQ0MsT0FBUixDQUFnQixLQUFLSCxPQUFyQixDQUFWO0FBQ0QsaUJBRkQsTUFFTztBQUNMQyxrQkFBQUEsT0FBTyxHQUFHLEtBQUtSLFVBQUwsQ0FBZ0JXLGFBQWhCLEVBQVY7QUFDRDs7a0RBQ01ILE9BQU8sQ0FDYkksSUFETTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsNENBQ0Qsa0JBQU1DLEVBQU47QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNKLDRCQUFBLEtBQUksQ0FBQ04sT0FBTCxHQUFlTSxFQUFmO0FBREksOERBRUdBLEVBQUUsQ0FBQ0MsY0FBSCxDQUFrQlosUUFBbEIsRUFBNEJFLFlBQTVCLEVBQTBDO0FBQUVXLDhCQUFBQSxPQUFPLEVBQUUsS0FBWDtBQUFrQkMsOEJBQUFBLFVBQVUsRUFBRTtBQUE5Qiw2QkFBMUMsRUFDTkosSUFETSxDQUNELFlBQU07QUFDVixxQ0FBT0MsRUFBRSxDQUFDSSxXQUFILENBQWVaLFNBQWYsRUFBMEI7QUFBRWEsZ0NBQUFBLFNBQVMsRUFBRSxJQUFiO0FBQW1CSCxnQ0FBQUEsT0FBTyxFQUFFLEtBQTVCO0FBQW1DQyxnQ0FBQUEsVUFBVSxFQUFFO0FBQS9DLCtCQUExQixDQUFQO0FBQ0QsNkJBSE0sRUFJTkosSUFKTTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsd0RBSUQsaUJBQU1PLEtBQU47QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHlFQUNHTixFQUFFLENBQUNPLFNBQUgsQ0FBYUQsS0FBSyxDQUFDQSxLQUFuQixFQUEwQmpCLFFBQTFCLEVBQW9DQyxVQUFwQyxFQUNOUyxJQURNLENBQ0QsWUFBTTtBQUNWLGlEQUFPTyxLQUFQO0FBQ0QseUNBSE0sQ0FESDs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSwrQkFKQzs7QUFBQTtBQUFBO0FBQUE7QUFBQSxpQ0FVTlAsSUFWTTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsd0RBVUQsa0JBQU1PLEtBQU47QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLDBFQUNHTixFQUFFLENBQUNRLE9BQUgsQ0FBV0YsS0FBSyxDQUFDQSxLQUFqQixFQUF3QixVQUFDRyxHQUFELEVBQVM7QUFDdEMsOENBQUlDLGFBQWEsR0FBR0MsZUFBT0MsY0FBUCxDQUFzQkgsR0FBdEIsQ0FBcEI7O0FBQ0EsMENBQUEsS0FBSSxDQUFDckIsTUFBTCxDQUFZLHNDQUFaLEVBQW9Ea0IsS0FBSyxDQUFDQSxLQUExRCxFQUFpRUksYUFBakU7O0FBQ0FqQiwwQ0FBQUEsTUFBTSxDQUFDSCxVQUFELEVBQWFvQixhQUFiLENBQU47QUFDRCx5Q0FKTSxFQUlKO0FBQUNHLDBDQUFBQSxLQUFLLEVBQUU7QUFBUix5Q0FKSSxFQUtOZCxJQUxNLENBS0QsVUFBQWUsSUFBSSxFQUFJO0FBQ1osMENBQUEsS0FBSSxDQUFDMUIsTUFBTCxDQUFZLCtCQUFaLEVBQTZDa0IsS0FBSyxDQUFDQSxLQUFuRCxFQUEwRFEsSUFBSSxDQUFDQyxXQUEvRDs7QUFDQSxpREFBUSxZQUF3QjtBQUM5Qiw0Q0FBQSxLQUFJLENBQUMzQixNQUFMLENBQVkseUNBQVosRUFBdURrQixLQUFLLENBQUNBLEtBQTdELEVBQW9FUSxJQUFJLENBQUNDLFdBQXpFOztBQUNBLG1EQUFPZixFQUFFLENBQUNnQixNQUFILENBQVVGLElBQUksQ0FBQ0MsV0FBZixDQUFQO0FBQ0QsMkNBSEQ7QUFJRCx5Q0FYTSxDQURIOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLCtCQVZDOztBQUFBO0FBQUE7QUFBQTtBQUFBLGlDQXdCTkUsS0F4Qk0sQ0F3QkEsVUFBQUMsR0FBRyxFQUFJO0FBQ1oscUNBQU90QixPQUFPLENBQUN1QixNQUFSLENBQWVELEdBQWYsQ0FBUDtBQUNELDZCQTFCTSxDQUZIOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLG1CQURDOztBQUFBO0FBQUE7QUFBQTtBQUFBLG9CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGFtcXAgZnJvbSAnYW1xcGxpYic7XG5pbXBvcnQgRGVidWcgZnJvbSAnZGVidWcnO1xuXG5pbXBvcnQgeyBMb2dnZXIgfSBmcm9tICcuL2NvbW1vbic7XG5cbmV4cG9ydCBjbGFzcyBBTVFQU3Vic2NyaWJlciB7XG5cbiAgcHJpdmF0ZSBjaGFubmVsOiBhbXFwLkNoYW5uZWwgfCBudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGNvbm5lY3Rpb246IGFtcXAuQ29ubmVjdGlvbixcbiAgICBwcml2YXRlIGxvZ2dlcjogRGVidWcuSURlYnVnZ2VyXG4gICkge1xuXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgc3Vic2NyaWJlKFxuICAgIGV4Y2hhbmdlOiBzdHJpbmcsXG4gICAgcm91dGluZ0tleTogc3RyaW5nLFxuICAgIGV4Y2hhbmdlVHlwZTogc3RyaW5nID0gJ3RvcGljJyxcbiAgICBxdWV1ZU5hbWU6IHN0cmluZyA9ICcnLFxuICAgIGFjdGlvbjogKHJvdXRpbmdLZXk6IHN0cmluZywgbWVzc2FnZTogYW55KSA9PiB2b2lkXG4gICk6IFByb21pc2U8KCkgPT4gUHJvbWlzZUxpa2U8YW55Pj4ge1xuICAgIGxldCBwcm9taXNlOiBQcm9taXNlTGlrZTxhbXFwLkNoYW5uZWw+O1xuICAgIGlmICh0aGlzLmNoYW5uZWwpIHtcbiAgICAgIHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUodGhpcy5jaGFubmVsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcHJvbWlzZSA9IHRoaXMuY29ubmVjdGlvbi5jcmVhdGVDaGFubmVsKCk7XG4gICAgfVxuICAgIHJldHVybiBwcm9taXNlXG4gICAgLnRoZW4oYXN5bmMgY2ggPT4ge1xuICAgICAgdGhpcy5jaGFubmVsID0gY2g7XG4gICAgICByZXR1cm4gY2guYXNzZXJ0RXhjaGFuZ2UoZXhjaGFuZ2UsIGV4Y2hhbmdlVHlwZSwgeyBkdXJhYmxlOiBmYWxzZSwgYXV0b0RlbGV0ZTogdHJ1ZSB9KVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICByZXR1cm4gY2guYXNzZXJ0UXVldWUocXVldWVOYW1lLCB7IGV4Y2x1c2l2ZTogdHJ1ZSwgZHVyYWJsZTogZmFsc2UsIGF1dG9EZWxldGU6IHRydWUgfSk7XG4gICAgICB9KVxuICAgICAgLnRoZW4oYXN5bmMgcXVldWUgPT4ge1xuICAgICAgICByZXR1cm4gY2guYmluZFF1ZXVlKHF1ZXVlLnF1ZXVlLCBleGNoYW5nZSwgcm91dGluZ0tleSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIHJldHVybiBxdWV1ZTtcbiAgICAgICAgfSk7XG4gICAgICB9KVxuICAgICAgLnRoZW4oYXN5bmMgcXVldWUgPT4ge1xuICAgICAgICByZXR1cm4gY2guY29uc3VtZShxdWV1ZS5xdWV1ZSwgKG1zZykgPT4ge1xuICAgICAgICAgIGxldCBwYXJzZWRNZXNzYWdlID0gTG9nZ2VyLmNvbnZlcnRNZXNzYWdlKG1zZyk7XG4gICAgICAgICAgdGhpcy5sb2dnZXIoJ01lc3NhZ2UgYXJyaXZlZCBmcm9tIFF1ZXVlIFwiJXNcIiAoJWopJywgcXVldWUucXVldWUsIHBhcnNlZE1lc3NhZ2UpO1xuICAgICAgICAgIGFjdGlvbihyb3V0aW5nS2V5LCBwYXJzZWRNZXNzYWdlKTtcbiAgICAgICAgfSwge25vQWNrOiB0cnVlfSlcbiAgICAgICAgLnRoZW4ob3B0cyA9PiB7XG4gICAgICAgICAgdGhpcy5sb2dnZXIoJ1N1YnNjcmliZWQgdG8gUXVldWUgXCIlc1wiICglcyknLCBxdWV1ZS5xdWV1ZSwgb3B0cy5jb25zdW1lclRhZyk7XG4gICAgICAgICAgcmV0dXJuICgoKTogUHJvbWlzZUxpa2U8YW55PiA9PiB7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlcignRGlzcG9zaW5nIFN1YnNjcmliZXIgdG8gUXVldWUgXCIlc1wiICglcyknLCBxdWV1ZS5xdWV1ZSwgb3B0cy5jb25zdW1lclRhZyk7XG4gICAgICAgICAgICByZXR1cm4gY2guY2FuY2VsKG9wdHMuY29uc3VtZXJUYWcpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycik7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG59XG4iXX0=
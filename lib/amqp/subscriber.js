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
      _regenerator.default.mark(function _callee4(exchange, routingKey, action) {
        var _this = this;

        var promise;
        return _regenerator.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
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
                            return _context3.abrupt("return", ch.assertExchange(exchange, 'topic', {
                              durable: false,
                              autoDelete: true
                            }).then(function () {
                              return ch.assertQueue('', {
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

                              return function (_x5) {
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

                              return function (_x6) {
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

                  return function (_x4) {
                    return _ref.apply(this, arguments);
                  };
                }()));

              case 2:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function subscribe(_x, _x2, _x3) {
        return _subscribe.apply(this, arguments);
      }

      return subscribe;
    }()
  }]);
  return AMQPSubscriber;
}();

exports.AMQPSubscriber = AMQPSubscriber;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hbXFwL3N1YnNjcmliZXIudHMiXSwibmFtZXMiOlsiQU1RUFN1YnNjcmliZXIiLCJjb25uZWN0aW9uIiwibG9nZ2VyIiwiZXhjaGFuZ2UiLCJyb3V0aW5nS2V5IiwiYWN0aW9uIiwiY2hhbm5lbCIsInByb21pc2UiLCJQcm9taXNlIiwicmVzb2x2ZSIsImNyZWF0ZUNoYW5uZWwiLCJ0aGVuIiwiY2giLCJhc3NlcnRFeGNoYW5nZSIsImR1cmFibGUiLCJhdXRvRGVsZXRlIiwiYXNzZXJ0UXVldWUiLCJleGNsdXNpdmUiLCJxdWV1ZSIsImJpbmRRdWV1ZSIsImNvbnN1bWUiLCJtc2ciLCJwYXJzZWRNZXNzYWdlIiwiTG9nZ2VyIiwiY29udmVydE1lc3NhZ2UiLCJub0FjayIsIm9wdHMiLCJjb25zdW1lclRhZyIsImNhbmNlbCIsImNhdGNoIiwiZXJyIiwicmVqZWN0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBR0E7O0lBRWFBLGM7OztBQUlYLDBCQUNVQyxVQURWLEVBRVVDLE1BRlYsRUFHRTtBQUFBO0FBQUE7QUFBQTtBQUFBLG1EQUxxQyxJQUtyQztBQUVEOzs7Ozs7O2tEQUdDQyxRLEVBQ0FDLFUsRUFDQUMsTTs7Ozs7Ozs7QUFHQSxvQkFBSSxLQUFLQyxPQUFULEVBQWtCO0FBQ2hCQyxrQkFBQUEsT0FBTyxHQUFHQyxPQUFPLENBQUNDLE9BQVIsQ0FBZ0IsS0FBS0gsT0FBckIsQ0FBVjtBQUNELGlCQUZELE1BRU87QUFDTEMsa0JBQUFBLE9BQU8sR0FBRyxLQUFLTixVQUFMLENBQWdCUyxhQUFoQixFQUFWO0FBQ0Q7O2tEQUNNSCxPQUFPLENBQ2JJLElBRE07QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLDRDQUNELGtCQUFNQyxFQUFOO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDSiw0QkFBQSxLQUFJLENBQUNOLE9BQUwsR0FBZU0sRUFBZjtBQURJLDhEQUVHQSxFQUFFLENBQUNDLGNBQUgsQ0FBa0JWLFFBQWxCLEVBQTRCLE9BQTVCLEVBQXFDO0FBQUVXLDhCQUFBQSxPQUFPLEVBQUUsS0FBWDtBQUFrQkMsOEJBQUFBLFVBQVUsRUFBRTtBQUE5Qiw2QkFBckMsRUFDTkosSUFETSxDQUNELFlBQU07QUFDVixxQ0FBT0MsRUFBRSxDQUFDSSxXQUFILENBQWUsRUFBZixFQUFtQjtBQUFFQyxnQ0FBQUEsU0FBUyxFQUFFLElBQWI7QUFBbUJILGdDQUFBQSxPQUFPLEVBQUUsS0FBNUI7QUFBbUNDLGdDQUFBQSxVQUFVLEVBQUU7QUFBL0MsK0JBQW5CLENBQVA7QUFDRCw2QkFITSxFQUlOSixJQUpNO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSx3REFJRCxpQkFBTU8sS0FBTjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEseUVBQ0dOLEVBQUUsQ0FBQ08sU0FBSCxDQUFhRCxLQUFLLENBQUNBLEtBQW5CLEVBQTBCZixRQUExQixFQUFvQ0MsVUFBcEMsRUFDTk8sSUFETSxDQUNELFlBQU07QUFDVixpREFBT08sS0FBUDtBQUNELHlDQUhNLENBREg7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsK0JBSkM7O0FBQUE7QUFBQTtBQUFBO0FBQUEsaUNBVU5QLElBVk07QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHdEQVVELGtCQUFNTyxLQUFOO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSwwRUFDR04sRUFBRSxDQUFDUSxPQUFILENBQVdGLEtBQUssQ0FBQ0EsS0FBakIsRUFBd0IsVUFBQ0csR0FBRCxFQUFTO0FBQ3RDLDhDQUFJQyxhQUFhLEdBQUdDLGVBQU9DLGNBQVAsQ0FBc0JILEdBQXRCLENBQXBCOztBQUNBLDBDQUFBLEtBQUksQ0FBQ25CLE1BQUwsQ0FBWSxzQ0FBWixFQUFvRGdCLEtBQUssQ0FBQ0EsS0FBMUQsRUFBaUVJLGFBQWpFOztBQUNBakIsMENBQUFBLE1BQU0sQ0FBQ0QsVUFBRCxFQUFha0IsYUFBYixDQUFOO0FBQ0QseUNBSk0sRUFJSjtBQUFDRywwQ0FBQUEsS0FBSyxFQUFFO0FBQVIseUNBSkksRUFLTmQsSUFMTSxDQUtELFVBQUFlLElBQUksRUFBSTtBQUNaLDBDQUFBLEtBQUksQ0FBQ3hCLE1BQUwsQ0FBWSwrQkFBWixFQUE2Q2dCLEtBQUssQ0FBQ0EsS0FBbkQsRUFBMERRLElBQUksQ0FBQ0MsV0FBL0Q7O0FBQ0EsaURBQVEsWUFBd0I7QUFDOUIsNENBQUEsS0FBSSxDQUFDekIsTUFBTCxDQUFZLHlDQUFaLEVBQXVEZ0IsS0FBSyxDQUFDQSxLQUE3RCxFQUFvRVEsSUFBSSxDQUFDQyxXQUF6RTs7QUFDQSxtREFBT2YsRUFBRSxDQUFDZ0IsTUFBSCxDQUFVRixJQUFJLENBQUNDLFdBQWYsQ0FBUDtBQUNELDJDQUhEO0FBSUQseUNBWE0sQ0FESDs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSwrQkFWQzs7QUFBQTtBQUFBO0FBQUE7QUFBQSxpQ0F3Qk5FLEtBeEJNLENBd0JBLFVBQUFDLEdBQUcsRUFBSTtBQUNaLHFDQUFPdEIsT0FBTyxDQUFDdUIsTUFBUixDQUFlRCxHQUFmLENBQVA7QUFDRCw2QkExQk0sQ0FGSDs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxtQkFEQzs7QUFBQTtBQUFBO0FBQUE7QUFBQSxvQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBhbXFwIGZyb20gJ2FtcXBsaWInO1xuaW1wb3J0IERlYnVnIGZyb20gJ2RlYnVnJztcblxuaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSAnLi9jb21tb24nO1xuXG5leHBvcnQgY2xhc3MgQU1RUFN1YnNjcmliZXIge1xuXG4gIHByaXZhdGUgY2hhbm5lbDogYW1xcC5DaGFubmVsIHwgbnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBjb25uZWN0aW9uOiBhbXFwLkNvbm5lY3Rpb24sXG4gICAgcHJpdmF0ZSBsb2dnZXI6IERlYnVnLklEZWJ1Z2dlclxuICApIHtcblxuICB9XG5cbiAgcHVibGljIGFzeW5jIHN1YnNjcmliZShcbiAgICBleGNoYW5nZTogc3RyaW5nLFxuICAgIHJvdXRpbmdLZXk6IHN0cmluZyxcbiAgICBhY3Rpb246IChyb3V0aW5nS2V5OiBzdHJpbmcsIG1lc3NhZ2U6IGFueSkgPT4gdm9pZFxuICApOiBQcm9taXNlPCgpID0+IFByb21pc2VMaWtlPGFueT4+IHtcbiAgICBsZXQgcHJvbWlzZTogUHJvbWlzZUxpa2U8YW1xcC5DaGFubmVsPjtcbiAgICBpZiAodGhpcy5jaGFubmVsKSB7XG4gICAgICBwcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKHRoaXMuY2hhbm5lbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHByb21pc2UgPSB0aGlzLmNvbm5lY3Rpb24uY3JlYXRlQ2hhbm5lbCgpO1xuICAgIH1cbiAgICByZXR1cm4gcHJvbWlzZVxuICAgIC50aGVuKGFzeW5jIGNoID0+IHtcbiAgICAgIHRoaXMuY2hhbm5lbCA9IGNoO1xuICAgICAgcmV0dXJuIGNoLmFzc2VydEV4Y2hhbmdlKGV4Y2hhbmdlLCAndG9waWMnLCB7IGR1cmFibGU6IGZhbHNlLCBhdXRvRGVsZXRlOiB0cnVlIH0pXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIHJldHVybiBjaC5hc3NlcnRRdWV1ZSgnJywgeyBleGNsdXNpdmU6IHRydWUsIGR1cmFibGU6IGZhbHNlLCBhdXRvRGVsZXRlOiB0cnVlIH0pO1xuICAgICAgfSlcbiAgICAgIC50aGVuKGFzeW5jIHF1ZXVlID0+IHtcbiAgICAgICAgcmV0dXJuIGNoLmJpbmRRdWV1ZShxdWV1ZS5xdWV1ZSwgZXhjaGFuZ2UsIHJvdXRpbmdLZXkpXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICByZXR1cm4gcXVldWU7XG4gICAgICAgIH0pO1xuICAgICAgfSlcbiAgICAgIC50aGVuKGFzeW5jIHF1ZXVlID0+IHtcbiAgICAgICAgcmV0dXJuIGNoLmNvbnN1bWUocXVldWUucXVldWUsIChtc2cpID0+IHtcbiAgICAgICAgICBsZXQgcGFyc2VkTWVzc2FnZSA9IExvZ2dlci5jb252ZXJ0TWVzc2FnZShtc2cpO1xuICAgICAgICAgIHRoaXMubG9nZ2VyKCdNZXNzYWdlIGFycml2ZWQgZnJvbSBRdWV1ZSBcIiVzXCIgKCVqKScsIHF1ZXVlLnF1ZXVlLCBwYXJzZWRNZXNzYWdlKTtcbiAgICAgICAgICBhY3Rpb24ocm91dGluZ0tleSwgcGFyc2VkTWVzc2FnZSk7XG4gICAgICAgIH0sIHtub0FjazogdHJ1ZX0pXG4gICAgICAgIC50aGVuKG9wdHMgPT4ge1xuICAgICAgICAgIHRoaXMubG9nZ2VyKCdTdWJzY3JpYmVkIHRvIFF1ZXVlIFwiJXNcIiAoJXMpJywgcXVldWUucXVldWUsIG9wdHMuY29uc3VtZXJUYWcpO1xuICAgICAgICAgIHJldHVybiAoKCk6IFByb21pc2VMaWtlPGFueT4gPT4ge1xuICAgICAgICAgICAgdGhpcy5sb2dnZXIoJ0Rpc3Bvc2luZyBTdWJzY3JpYmVyIHRvIFF1ZXVlIFwiJXNcIiAoJXMpJywgcXVldWUucXVldWUsIG9wdHMuY29uc3VtZXJUYWcpO1xuICAgICAgICAgICAgcmV0dXJuIGNoLmNhbmNlbChvcHRzLmNvbnN1bWVyVGFnKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGVyciA9PiB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnIpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxufVxuIl19
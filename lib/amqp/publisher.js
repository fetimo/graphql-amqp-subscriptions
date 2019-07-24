"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AMQPPublisher = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var AMQPPublisher =
/*#__PURE__*/
function () {
  function AMQPPublisher(connection, logger) {
    (0, _classCallCheck2.default)(this, AMQPPublisher);
    this.connection = connection;
    this.logger = logger;
    (0, _defineProperty2.default)(this, "channel", null);
  }

  (0, _createClass2.default)(AMQPPublisher, [{
    key: "publish",
    value: function () {
      var _publish = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee2(exchange, routingKey, data) {
        var _this = this;

        var promise;
        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (this.channel) {
                  promise = Promise.resolve(this.channel);
                } else {
                  promise = this.connection.createChannel();
                }

                return _context2.abrupt("return", promise.then(
                /*#__PURE__*/
                function () {
                  var _ref = (0, _asyncToGenerator2.default)(
                  /*#__PURE__*/
                  _regenerator.default.mark(function _callee(ch) {
                    return _regenerator.default.wrap(function _callee$(_context) {
                      while (1) {
                        switch (_context.prev = _context.next) {
                          case 0:
                            _this.channel = ch;
                            return _context.abrupt("return", ch.assertExchange(exchange, 'topic', {
                              durable: false,
                              autoDelete: true
                            }).then(function () {
                              _this.logger('Message sent to Exchange "%s" with Routing Key "%s" (%j)', exchange, routingKey, data);

                              ch.publish(exchange, routingKey, Buffer.from(JSON.stringify(data)));
                              return Promise.resolve();
                            }).catch(function (err) {
                              return Promise.reject(err);
                            }));

                          case 2:
                          case "end":
                            return _context.stop();
                        }
                      }
                    }, _callee, this);
                  }));

                  return function (_x4) {
                    return _ref.apply(this, arguments);
                  };
                }()));

              case 2:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function publish(_x, _x2, _x3) {
        return _publish.apply(this, arguments);
      }

      return publish;
    }()
  }]);
  return AMQPPublisher;
}();

exports.AMQPPublisher = AMQPPublisher;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hbXFwL3B1Ymxpc2hlci50cyJdLCJuYW1lcyI6WyJBTVFQUHVibGlzaGVyIiwiY29ubmVjdGlvbiIsImxvZ2dlciIsImV4Y2hhbmdlIiwicm91dGluZ0tleSIsImRhdGEiLCJjaGFubmVsIiwicHJvbWlzZSIsIlByb21pc2UiLCJyZXNvbHZlIiwiY3JlYXRlQ2hhbm5lbCIsInRoZW4iLCJjaCIsImFzc2VydEV4Y2hhbmdlIiwiZHVyYWJsZSIsImF1dG9EZWxldGUiLCJwdWJsaXNoIiwiQnVmZmVyIiwiZnJvbSIsIkpTT04iLCJzdHJpbmdpZnkiLCJjYXRjaCIsImVyciIsInJlamVjdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUdhQSxhOzs7QUFJWCx5QkFDVUMsVUFEVixFQUVVQyxNQUZWLEVBR0U7QUFBQTtBQUFBO0FBQUE7QUFBQSxtREFMcUMsSUFLckM7QUFFRDs7Ozs7OztrREFFb0JDLFEsRUFBa0JDLFUsRUFBb0JDLEk7Ozs7Ozs7O0FBRXpELG9CQUFJLEtBQUtDLE9BQVQsRUFBa0I7QUFDaEJDLGtCQUFBQSxPQUFPLEdBQUdDLE9BQU8sQ0FBQ0MsT0FBUixDQUFnQixLQUFLSCxPQUFyQixDQUFWO0FBQ0QsaUJBRkQsTUFFTztBQUNMQyxrQkFBQUEsT0FBTyxHQUFHLEtBQUtOLFVBQUwsQ0FBZ0JTLGFBQWhCLEVBQVY7QUFDRDs7a0RBQ01ILE9BQU8sQ0FDYkksSUFETTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsNENBQ0QsaUJBQU1DLEVBQU47QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNKLDRCQUFBLEtBQUksQ0FBQ04sT0FBTCxHQUFlTSxFQUFmO0FBREksNkRBRUdBLEVBQUUsQ0FBQ0MsY0FBSCxDQUFrQlYsUUFBbEIsRUFBNEIsT0FBNUIsRUFBcUM7QUFBRVcsOEJBQUFBLE9BQU8sRUFBRSxLQUFYO0FBQWtCQyw4QkFBQUEsVUFBVSxFQUFFO0FBQTlCLDZCQUFyQyxFQUNOSixJQURNLENBQ0QsWUFBTTtBQUNWLDhCQUFBLEtBQUksQ0FBQ1QsTUFBTCxDQUFZLDBEQUFaLEVBQXdFQyxRQUF4RSxFQUFrRkMsVUFBbEYsRUFBOEZDLElBQTlGOztBQUNBTyw4QkFBQUEsRUFBRSxDQUFDSSxPQUFILENBQVdiLFFBQVgsRUFBcUJDLFVBQXJCLEVBQWlDYSxNQUFNLENBQUNDLElBQVAsQ0FBWUMsSUFBSSxDQUFDQyxTQUFMLENBQWVmLElBQWYsQ0FBWixDQUFqQztBQUNBLHFDQUFPRyxPQUFPLENBQUNDLE9BQVIsRUFBUDtBQUNELDZCQUxNLEVBTU5ZLEtBTk0sQ0FNQSxVQUFBQyxHQUFHLEVBQUk7QUFDWixxQ0FBT2QsT0FBTyxDQUFDZSxNQUFSLENBQWVELEdBQWYsQ0FBUDtBQUNELDZCQVJNLENBRkg7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsbUJBREM7O0FBQUE7QUFBQTtBQUFBO0FBQUEsb0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgYW1xcCBmcm9tICdhbXFwbGliJztcbmltcG9ydCBEZWJ1ZyBmcm9tICdkZWJ1Zyc7XG5cbmV4cG9ydCBjbGFzcyBBTVFQUHVibGlzaGVyIHtcblxuICBwcml2YXRlIGNoYW5uZWw6IGFtcXAuQ2hhbm5lbCB8IG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgY29ubmVjdGlvbjogYW1xcC5Db25uZWN0aW9uLFxuICAgIHByaXZhdGUgbG9nZ2VyOiBEZWJ1Zy5JRGVidWdnZXJcbiAgKSB7XG5cbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBwdWJsaXNoKGV4Y2hhbmdlOiBzdHJpbmcsIHJvdXRpbmdLZXk6IHN0cmluZywgZGF0YTogYW55KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbGV0IHByb21pc2U6IFByb21pc2VMaWtlPGFtcXAuQ2hhbm5lbD47XG4gICAgaWYgKHRoaXMuY2hhbm5lbCkge1xuICAgICAgcHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSh0aGlzLmNoYW5uZWwpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwcm9taXNlID0gdGhpcy5jb25uZWN0aW9uLmNyZWF0ZUNoYW5uZWwoKTtcbiAgICB9XG4gICAgcmV0dXJuIHByb21pc2VcbiAgICAudGhlbihhc3luYyBjaCA9PiB7XG4gICAgICB0aGlzLmNoYW5uZWwgPSBjaDtcbiAgICAgIHJldHVybiBjaC5hc3NlcnRFeGNoYW5nZShleGNoYW5nZSwgJ3RvcGljJywgeyBkdXJhYmxlOiBmYWxzZSwgYXV0b0RlbGV0ZTogdHJ1ZSB9KVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICB0aGlzLmxvZ2dlcignTWVzc2FnZSBzZW50IHRvIEV4Y2hhbmdlIFwiJXNcIiB3aXRoIFJvdXRpbmcgS2V5IFwiJXNcIiAoJWopJywgZXhjaGFuZ2UsIHJvdXRpbmdLZXksIGRhdGEpO1xuICAgICAgICBjaC5wdWJsaXNoKGV4Y2hhbmdlLCByb3V0aW5nS2V5LCBCdWZmZXIuZnJvbShKU09OLnN0cmluZ2lmeShkYXRhKSkpO1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGVyciA9PiB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnIpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==
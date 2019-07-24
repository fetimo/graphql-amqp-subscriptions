"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Logger = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var Logger =
/*#__PURE__*/
function () {
  function Logger() {
    (0, _classCallCheck2.default)(this, Logger);
  }

  (0, _createClass2.default)(Logger, null, [{
    key: "convertMessage",
    value: function convertMessage(msg) {
      var res = null;

      if (msg) {
        try {
          res = JSON.parse(msg.content.toString());
        } catch (e) {
          res = msg.content.toString();
        }
      }

      return res;
    }
  }]);
  return Logger;
}();

exports.Logger = Logger;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hbXFwL2NvbW1vbi50cyJdLCJuYW1lcyI6WyJMb2dnZXIiLCJtc2ciLCJyZXMiLCJKU09OIiwicGFyc2UiLCJjb250ZW50IiwidG9TdHJpbmciLCJlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0lBRWFBLE07Ozs7Ozs7OzttQ0FFb0JDLEcsRUFBc0M7QUFDakUsVUFBSUMsR0FBUSxHQUFHLElBQWY7O0FBQ0EsVUFBSUQsR0FBSixFQUFTO0FBQ1AsWUFBSTtBQUNGQyxVQUFBQSxHQUFHLEdBQUdDLElBQUksQ0FBQ0MsS0FBTCxDQUFXSCxHQUFHLENBQUNJLE9BQUosQ0FBWUMsUUFBWixFQUFYLENBQU47QUFDRCxTQUZELENBRUUsT0FBT0MsQ0FBUCxFQUFVO0FBQ1ZMLFVBQUFBLEdBQUcsR0FBR0QsR0FBRyxDQUFDSSxPQUFKLENBQVlDLFFBQVosRUFBTjtBQUNEO0FBQ0Y7O0FBQ0QsYUFBT0osR0FBUDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGFtcXAgZnJvbSAnYW1xcGxpYic7XG5cbmV4cG9ydCBjbGFzcyBMb2dnZXIge1xuXG4gICAgcHVibGljIHN0YXRpYyBjb252ZXJ0TWVzc2FnZShtc2c6IGFtcXAuQ29uc3VtZU1lc3NhZ2UgfCBudWxsKTogYW55IHtcbiAgICAgIGxldCByZXM6IGFueSA9IG51bGw7XG4gICAgICBpZiAobXNnKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmVzID0gSlNPTi5wYXJzZShtc2cuY29udGVudC50b1N0cmluZygpKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIHJlcyA9IG1zZy5jb250ZW50LnRvU3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXM7XG4gICAgfVxuXG59XG4iXX0=
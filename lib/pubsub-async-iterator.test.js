"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _chai = _interopRequireDefault(require("chai"));

var _chaiAsPromised = _interopRequireDefault(require("chai-as-promised"));

var _sinon = require("sinon");

var _sinonChai = _interopRequireDefault(require("sinon-chai"));

var _iterall = require("iterall");

var _pubsub = require("./pubsub");

var _graphqlSubscriptions = require("graphql-subscriptions");

var _amqplib = _interopRequireDefault(require("amqplib"));

var _graphql = require("graphql");

var _subscription = require("graphql/subscription");

// chai style expect().to.be.true  violates no-unused-expression

/* tslint:disable:no-unused-expression */
_chai.default.use(_chaiAsPromised.default);

_chai.default.use(_sinonChai.default);

var expect = _chai.default.expect;
var FIRST_EVENT = 'FIRST_EVENT';
var conn;

var defaultFilter = function defaultFilter() {
  return true;
};

function buildSchema(iterator) {
  var filterFn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultFilter;
  return new _graphql.GraphQLSchema({
    query: new _graphql.GraphQLObjectType({
      name: 'Query',
      fields: {
        testString: {
          type: _graphql.GraphQLString,
          resolve: function resolve() {
            return 'works';
          }
        }
      }
    }),
    subscription: new _graphql.GraphQLObjectType({
      name: 'Subscription',
      fields: {
        testSubscription: {
          type: _graphql.GraphQLString,
          subscribe: (0, _graphqlSubscriptions.withFilter)(function () {
            return iterator;
          }, filterFn),
          resolve: function resolve() {
            return 'FIRST_EVENT';
          }
        }
      }
    })
  });
}

describe('GraphQL-JS asyncIterator', function () {
  before(function (done) {
    _amqplib.default.connect('amqp://guest:guest@localhost:5672?heartbeat=30').then(function (amqpConn) {
      conn = amqpConn;
      done();
    }).catch(function (err) {
      done(err);
    });
  });
  after(function (done) {
    setTimeout(function () {
      conn.close().then(function () {
        done();
      }).catch(function (err) {
        done(err);
      });
    }, 100);
  });
  it('should allow subscriptions',
  /*#__PURE__*/
  (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee() {
    var query, pubsub, origIterator, schema, results, payload1, r;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            query = (0, _graphql.parse)("\n      subscription S1 {\n\n        testSubscription\n      }\n    ");
            pubsub = new _pubsub.AMQPPubSub({
              connection: conn
            });
            origIterator = pubsub.asyncIterator(FIRST_EVENT);
            schema = buildSchema(origIterator);
            _context.next = 6;
            return (0, _subscription.subscribe)(schema, query);

          case 6:
            results = _context.sent;
            payload1 = results.next();
            expect((0, _iterall.isAsyncIterable)(results)).to.be.true;
            r = payload1.then(function (res) {
              expect(res.value.data.testSubscription).to.equal('FIRST_EVENT');
            });
            setTimeout(function () {
              pubsub.publish(FIRST_EVENT, {});
            }, 100);
            return _context.abrupt("return", r);

          case 12:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  })));
  it('should allow async filter',
  /*#__PURE__*/
  (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee2() {
    var query, pubsub, origIterator, schema, results, payload1, r;
    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            query = (0, _graphql.parse)("\n      subscription S1 {\n\n        testSubscription\n      }\n    ");
            pubsub = new _pubsub.AMQPPubSub({
              connection: conn
            });
            origIterator = pubsub.asyncIterator(FIRST_EVENT);
            schema = buildSchema(origIterator, function () {
              return Promise.resolve(true);
            });
            _context2.next = 6;
            return (0, _subscription.subscribe)(schema, query);

          case 6:
            results = _context2.sent;
            payload1 = results.next();
            expect((0, _iterall.isAsyncIterable)(results)).to.be.true;
            r = payload1.then(function (res) {
              expect(res.value.data.testSubscription).to.equal('FIRST_EVENT');
            });
            setTimeout(function () {
              pubsub.publish(FIRST_EVENT, {});
            }, 100);
            return _context2.abrupt("return", r);

          case 12:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  })));
  it('should detect when the payload is done when filtering', function (done) {
    var query = (0, _graphql.parse)("\n      subscription S1 {\n        testSubscription\n      }\n    ");
    var pubsub = new _pubsub.AMQPPubSub({
      connection: conn
    });
    var origIterator = pubsub.asyncIterator(FIRST_EVENT);
    var counter = 0;

    var filterFn = function filterFn() {
      counter++;

      if (counter > 10) {
        var e = new Error('Infinite loop detected');
        done(e);
        throw e;
      }

      return false;
    };

    var schema = buildSchema(origIterator, filterFn);
    Promise.resolve((0, _subscription.subscribe)(schema, query)).then(function (results) {
      expect((0, _iterall.isAsyncIterable)(results)).to.be.true;
      results = results;
      results.next();
      results.return();
      setTimeout(function () {
        pubsub.publish(FIRST_EVENT, {});
      }, 100);
      setTimeout(function (_) {
        done();
      }, 500);
    });
  });
  it('should clear event handlers',
  /*#__PURE__*/
  (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee3() {
    var query, pubsub, origIterator, returnSpy, schema, results, end, r;
    return _regenerator.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            query = (0, _graphql.parse)("\n      subscription S1 {\n        testSubscription\n      }\n    ");
            pubsub = new _pubsub.AMQPPubSub({
              connection: conn
            });
            origIterator = pubsub.asyncIterator(FIRST_EVENT);
            returnSpy = (0, _sinon.spy)(origIterator, 'return');
            schema = buildSchema(origIterator);
            _context3.next = 7;
            return (0, _subscription.subscribe)(schema, query);

          case 7:
            results = _context3.sent;
            end = results.return();
            r = end.then(function () {
              expect(returnSpy).to.have.been.called;
            });
            pubsub.publish(FIRST_EVENT, {});
            return _context3.abrupt("return", r);

          case 12:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this);
  })));
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wdWJzdWItYXN5bmMtaXRlcmF0b3IudGVzdC50cyJdLCJuYW1lcyI6WyJjaGFpIiwidXNlIiwiY2hhaUFzUHJvbWlzZWQiLCJzaW5vbkNoYWkiLCJleHBlY3QiLCJGSVJTVF9FVkVOVCIsImNvbm4iLCJkZWZhdWx0RmlsdGVyIiwiYnVpbGRTY2hlbWEiLCJpdGVyYXRvciIsImZpbHRlckZuIiwiR3JhcGhRTFNjaGVtYSIsInF1ZXJ5IiwiR3JhcGhRTE9iamVjdFR5cGUiLCJuYW1lIiwiZmllbGRzIiwidGVzdFN0cmluZyIsInR5cGUiLCJHcmFwaFFMU3RyaW5nIiwicmVzb2x2ZSIsInN1YnNjcmlwdGlvbiIsInRlc3RTdWJzY3JpcHRpb24iLCJzdWJzY3JpYmUiLCJkZXNjcmliZSIsImJlZm9yZSIsImRvbmUiLCJhbXFwIiwiY29ubmVjdCIsInRoZW4iLCJhbXFwQ29ubiIsImNhdGNoIiwiZXJyIiwiYWZ0ZXIiLCJzZXRUaW1lb3V0IiwiY2xvc2UiLCJpdCIsInB1YnN1YiIsIlB1YlN1YiIsImNvbm5lY3Rpb24iLCJvcmlnSXRlcmF0b3IiLCJhc3luY0l0ZXJhdG9yIiwic2NoZW1hIiwicmVzdWx0cyIsInBheWxvYWQxIiwibmV4dCIsInRvIiwiYmUiLCJ0cnVlIiwiciIsInJlcyIsInZhbHVlIiwiZGF0YSIsImVxdWFsIiwicHVibGlzaCIsIlByb21pc2UiLCJjb3VudGVyIiwiZSIsIkVycm9yIiwicmV0dXJuIiwiXyIsInJldHVyblNweSIsImVuZCIsImhhdmUiLCJiZWVuIiwiY2FsbGVkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUVBOztBQU1BOztBQU9BOztBQXhCQTs7QUFDQTtBQVlBQSxjQUFLQyxHQUFMLENBQVNDLHVCQUFUOztBQUNBRixjQUFLQyxHQUFMLENBQVNFLGtCQUFUOztBQUNBLElBQU1DLE1BQU0sR0FBR0osY0FBS0ksTUFBcEI7QUFXQSxJQUFN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QkFBVUUsTUFBVixFQUFrQjdCLEtBQWxCLENBWlU7O0FBQUE7QUFZMUI4QixZQUFBQSxPQVowQjtBQWExQm1CLFlBQUFBLEdBYjBCLEdBYXBCbkIsT0FBTyxDQUFDZ0IsTUFBUixFQWJvQjtBQWUxQlYsWUFBQUEsQ0FmMEIsR0FldEJhLEdBQUcsQ0FBQ2pDLElBQUosQ0FBUyxZQUFNO0FBQ3ZCeEIsY0FBQUEsTUFBTSxDQUFDd0QsU0FBRCxDQUFOLENBQWtCZixFQUFsQixDQUFxQmlCLElBQXJCLENBQTBCQyxJQUExQixDQUErQkMsTUFBL0I7QUFDRCxhQUZTLENBZnNCO0FBbUJoQzVCLFlBQUFBLE1BQU0sQ0FBQ2lCLE9BQVAsQ0FBZWhELFdBQWYsRUFBNEIsRUFBNUI7QUFuQmdDLDhDQXFCekIyQyxDQXJCeUI7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsR0FBaEMsR0FBRjtBQXdCRCxDQWxKTyxDQUFSIiwic291cmNlc0NvbnRlbnQiOlsiLy8gY2hhaSBzdHlsZSBleHBlY3QoKS50by5iZS50cnVlICB2aW9sYXRlcyBuby11bnVzZWQtZXhwcmVzc2lvblxuLyogdHNsaW50OmRpc2FibGU6bm8tdW51c2VkLWV4cHJlc3Npb24gKi9cbmltcG9ydCBjaGFpIGZyb20gJ2NoYWknO1xuaW1wb3J0IGNoYWlBc1Byb21pc2VkIGZyb20gJ2NoYWktYXMtcHJvbWlzZWQnO1xuaW1wb3J0IHsgc3B5IH0gZnJvbSAnc2lub24nO1xuaW1wb3J0IHNpbm9uQ2hhaSBmcm9tICdzaW5vbi1jaGFpJztcblxuaW1wb3J0IHsgaXNBc3luY0l0ZXJhYmxlIH0gZnJvbSAnaXRlcmFsbCc7XG5pbXBvcnQgeyBBTVFQUHViU3ViIGFzIFB1YlN1YiB9IGZyb20gJy4vcHVic3ViJztcbmltcG9ydCB7IHdpdGhGaWx0ZXIsIEZpbHRlckZuIH0gZnJvbSAnZ3JhcGhxbC1zdWJzY3JpcHRpb25zJztcbmltcG9ydCB7IEV4ZWN1dGlvblJlc3VsdCB9IGZyb20gJ2dyYXBocWwnO1xuaW1wb3J0IGFtcXAgZnJvbSAnYW1xcGxpYic7XG5cbmNoYWkudXNlKGNoYWlBc1Byb21pc2VkKTtcbmNoYWkudXNlKHNpbm9uQ2hhaSk7XG5jb25zdCBleHBlY3QgPSBjaGFpLmV4cGVjdDtcblxuaW1wb3J0IHtcbiAgcGFyc2UsXG4gIEdyYXBoUUxTY2hlbWEsXG4gIEdyYXBoUUxPYmplY3RUeXBlLFxuICBHcmFwaFFMU3RyaW5nLFxufSBmcm9tICdncmFwaHFsJztcblxuaW1wb3J0IHsgc3Vic2NyaWJlIH0gZnJvbSAnZ3JhcGhxbC9zdWJzY3JpcHRpb24nO1xuXG5jb25zdCBGSVJTVF9FVkVOVCA9ICdGSVJTVF9FVkVOVCc7XG5cbmxldCBjb25uOiBhbXFwLkNvbm5lY3Rpb247XG5jb25zdCBkZWZhdWx0RmlsdGVyID0gKCkgPT4gdHJ1ZTtcblxuZnVuY3Rpb24gYnVpbGRTY2hlbWEoaXRlcmF0b3I6IGFueSwgZmlsdGVyRm46IEZpbHRlckZuID0gZGVmYXVsdEZpbHRlcikge1xuICByZXR1cm4gbmV3IEdyYXBoUUxTY2hlbWEoe1xuICAgIHF1ZXJ5OiBuZXcgR3JhcGhRTE9iamVjdFR5cGUoe1xuICAgICAgbmFtZTogJ1F1ZXJ5JyxcbiAgICAgIGZpZWxkczoge1xuICAgICAgICB0ZXN0U3RyaW5nOiB7XG4gICAgICAgICAgdHlwZTogR3JhcGhRTFN0cmluZyxcbiAgICAgICAgICByZXNvbHZlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiAnd29ya3MnO1xuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0pLFxuICAgIHN1YnNjcmlwdGlvbjogbmV3IEdyYXBoUUxPYmplY3RUeXBlKHtcbiAgICAgIG5hbWU6ICdTdWJzY3JpcHRpb24nLFxuICAgICAgZmllbGRzOiB7XG4gICAgICAgIHRlc3RTdWJzY3JpcHRpb246IHtcbiAgICAgICAgICB0eXBlOiBHcmFwaFFMU3RyaW5nLFxuICAgICAgICAgIHN1YnNjcmliZTogd2l0aEZpbHRlcigoKSA9PiBpdGVyYXRvciwgZmlsdGVyRm4pLFxuICAgICAgICAgIHJlc29sdmU6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAnRklSU1RfRVZFTlQnO1xuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0pLFxuICB9KTtcbn1cblxuZGVzY3JpYmUoJ0dyYXBoUUwtSlMgYXN5bmNJdGVyYXRvcicsICgpID0+IHtcblxuICBiZWZvcmUoKGRvbmUpID0+IHtcbiAgICBhbXFwLmNvbm5lY3QoJ2FtcXA6Ly9ndWVzdDpndWVzdEBsb2NhbGhvc3Q6NTY3Mj9oZWFydGJlYXQ9MzAnKVxuICAgIC50aGVuKGFtcXBDb25uID0+IHtcbiAgICAgIGNvbm4gPSBhbXFwQ29ubjtcbiAgICAgIGRvbmUoKTtcbiAgICB9KVxuICAgIC5jYXRjaChlcnIgPT4ge1xuICAgICAgZG9uZShlcnIpO1xuICAgIH0pO1xuICB9KTtcblxuICBhZnRlcigoZG9uZSkgPT4ge1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgY29ubi5jbG9zZSgpXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIGRvbmUoKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgZG9uZShlcnIpO1xuICAgICAgfSk7XG4gICAgfSwgMTAwKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBhbGxvdyBzdWJzY3JpcHRpb25zJywgYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IHF1ZXJ5ID0gcGFyc2UoYFxuICAgICAgc3Vic2NyaXB0aW9uIFMxIHtcblxuICAgICAgICB0ZXN0U3Vic2NyaXB0aW9uXG4gICAgICB9XG4gICAgYCk7XG4gICAgY29uc3QgcHVic3ViID0gbmV3IFB1YlN1Yih7IGNvbm5lY3Rpb246IGNvbm4gfSk7XG4gICAgY29uc3Qgb3JpZ0l0ZXJhdG9yID0gcHVic3ViLmFzeW5jSXRlcmF0b3IoRklSU1RfRVZFTlQpO1xuICAgIGNvbnN0IHNjaGVtYSA9IGJ1aWxkU2NoZW1hKG9yaWdJdGVyYXRvcik7XG5cbiAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgc3Vic2NyaWJlKHNjaGVtYSwgcXVlcnkpIGFzIEFzeW5jSXRlcmF0b3I8RXhlY3V0aW9uUmVzdWx0PjtcbiAgICBjb25zdCBwYXlsb2FkMSA9IHJlc3VsdHMubmV4dCgpO1xuXG4gICAgZXhwZWN0KGlzQXN5bmNJdGVyYWJsZShyZXN1bHRzKSkudG8uYmUudHJ1ZTtcblxuICAgIGNvbnN0IHIgPSBwYXlsb2FkMS50aGVuKHJlcyA9PiB7XG4gICAgICBleHBlY3QocmVzLnZhbHVlLmRhdGEhLnRlc3RTdWJzY3JpcHRpb24pLnRvLmVxdWFsKCdGSVJTVF9FVkVOVCcpO1xuICAgIH0pO1xuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBwdWJzdWIucHVibGlzaChGSVJTVF9FVkVOVCwge30pO1xuICAgIH0sIDEwMCk7XG5cbiAgICByZXR1cm4gcjtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBhbGxvdyBhc3luYyBmaWx0ZXInLCBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgcXVlcnkgPSBwYXJzZShgXG4gICAgICBzdWJzY3JpcHRpb24gUzEge1xuXG4gICAgICAgIHRlc3RTdWJzY3JpcHRpb25cbiAgICAgIH1cbiAgICBgKTtcbiAgICBjb25zdCBwdWJzdWIgPSBuZXcgUHViU3ViKHsgY29ubmVjdGlvbjogY29ubiB9KTtcbiAgICBjb25zdCBvcmlnSXRlcmF0b3IgPSBwdWJzdWIuYXN5bmNJdGVyYXRvcihGSVJTVF9FVkVOVCk7XG4gICAgY29uc3Qgc2NoZW1hID0gYnVpbGRTY2hlbWEob3JpZ0l0ZXJhdG9yLCAoKSA9PiBQcm9taXNlLnJlc29sdmUodHJ1ZSkpO1xuXG4gICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IHN1YnNjcmliZShzY2hlbWEsIHF1ZXJ5KSBhcyBBc3luY0l0ZXJhdG9yPEV4ZWN1dGlvblJlc3VsdD47XG4gICAgY29uc3QgcGF5bG9hZDEgPSByZXN1bHRzLm5leHQoKTtcblxuICAgIGV4cGVjdChpc0FzeW5jSXRlcmFibGUocmVzdWx0cykpLnRvLmJlLnRydWU7XG5cbiAgICBjb25zdCByID0gcGF5bG9hZDEudGhlbihyZXMgPT4ge1xuICAgICAgZXhwZWN0KHJlcy52YWx1ZS5kYXRhIS50ZXN0U3Vic2NyaXB0aW9uKS50by5lcXVhbCgnRklSU1RfRVZFTlQnKTtcbiAgICB9KTtcblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgcHVic3ViLnB1Ymxpc2goRklSU1RfRVZFTlQsIHt9KTtcbiAgICB9LCAxMDApO1xuXG4gICAgcmV0dXJuIHI7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgZGV0ZWN0IHdoZW4gdGhlIHBheWxvYWQgaXMgZG9uZSB3aGVuIGZpbHRlcmluZycsIChkb25lKSA9PiB7XG4gICAgY29uc3QgcXVlcnkgPSBwYXJzZShgXG4gICAgICBzdWJzY3JpcHRpb24gUzEge1xuICAgICAgICB0ZXN0U3Vic2NyaXB0aW9uXG4gICAgICB9XG4gICAgYCk7XG5cbiAgICBjb25zdCBwdWJzdWIgPSBuZXcgUHViU3ViKHsgY29ubmVjdGlvbjogY29ubiB9KTtcbiAgICBjb25zdCBvcmlnSXRlcmF0b3IgPSBwdWJzdWIuYXN5bmNJdGVyYXRvcihGSVJTVF9FVkVOVCk7XG5cbiAgICBsZXQgY291bnRlciA9IDA7XG5cbiAgICBjb25zdCBmaWx0ZXJGbiA9ICgpID0+IHtcbiAgICAgIGNvdW50ZXIrKztcblxuICAgICAgaWYgKGNvdW50ZXIgPiAxMCkge1xuICAgICAgICBjb25zdCBlID0gbmV3IEVycm9yKCdJbmZpbml0ZSBsb29wIGRldGVjdGVkJyk7XG4gICAgICAgIGRvbmUoZSk7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgY29uc3Qgc2NoZW1hID0gYnVpbGRTY2hlbWEob3JpZ0l0ZXJhdG9yLCBmaWx0ZXJGbik7XG5cbiAgICBQcm9taXNlLnJlc29sdmUoc3Vic2NyaWJlKHNjaGVtYSwgcXVlcnkpKS50aGVuKChyZXN1bHRzOiBBc3luY0l0ZXJhdG9yPEV4ZWN1dGlvblJlc3VsdD4gfCBFeGVjdXRpb25SZXN1bHQpID0+IHtcbiAgICAgIGV4cGVjdChpc0FzeW5jSXRlcmFibGUocmVzdWx0cykpLnRvLmJlLnRydWU7XG4gICAgICByZXN1bHRzID0gPEFzeW5jSXRlcmF0b3I8RXhlY3V0aW9uUmVzdWx0Pj5yZXN1bHRzO1xuXG4gICAgICByZXN1bHRzLm5leHQoKTtcbiAgICAgIHJlc3VsdHMucmV0dXJuISgpO1xuXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcHVic3ViLnB1Ymxpc2goRklSU1RfRVZFTlQsIHt9KTtcbiAgICAgIH0sIDEwMCk7XG5cbiAgICAgIHNldFRpbWVvdXQoXyA9PiB7XG4gICAgICAgIGRvbmUoKTtcbiAgICAgIH0sIDUwMCk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgY2xlYXIgZXZlbnQgaGFuZGxlcnMnLCBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgcXVlcnkgPSBwYXJzZShgXG4gICAgICBzdWJzY3JpcHRpb24gUzEge1xuICAgICAgICB0ZXN0U3Vic2NyaXB0aW9uXG4gICAgICB9XG4gICAgYCk7XG5cbiAgICBjb25zdCBwdWJzdWIgPSBuZXcgUHViU3ViKHsgY29ubmVjdGlvbjogY29ubiB9KTtcbiAgICBjb25zdCBvcmlnSXRlcmF0b3IgPSBwdWJzdWIuYXN5bmNJdGVyYXRvcihGSVJTVF9FVkVOVCk7XG4gICAgY29uc3QgcmV0dXJuU3B5ID0gc3B5KG9yaWdJdGVyYXRvciwgJ3JldHVybicpO1xuICAgIGNvbnN0IHNjaGVtYSA9IGJ1aWxkU2NoZW1hKG9yaWdJdGVyYXRvcik7XG5cbiAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgc3Vic2NyaWJlKHNjaGVtYSwgcXVlcnkpIGFzIEFzeW5jSXRlcmF0b3I8RXhlY3V0aW9uUmVzdWx0PjtcbiAgICBjb25zdCBlbmQgPSByZXN1bHRzLnJldHVybiEoKTtcblxuICAgIGNvbnN0IHIgPSBlbmQudGhlbigoKSA9PiB7XG4gICAgICBleHBlY3QocmV0dXJuU3B5KS50by5oYXZlLmJlZW4uY2FsbGVkO1xuICAgIH0pO1xuXG4gICAgcHVic3ViLnB1Ymxpc2goRklSU1RfRVZFTlQsIHt9KTtcblxuICAgIHJldHVybiByO1xuICB9KTtcblxufSk7XG4iXX0=
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _random = require('./random');

var _random2 = _interopRequireDefault(_random);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Fetch data
function fetchOrders(object) {
    _jquery2.default.get({
        url: baseURL + '/api/orders/',
        beforeSend: authorizeXHR,
        data: {
            "start-date": object.startDate,
            "end-date": object.endDate
        },
        success: object.completionHandler,
        error: function error(response) {
            return console.log(response);
        }
    });
}

function fetchOrder(id, completionHandler) {
    _jquery2.default.get({
        url: baseURL + '/api/orders/' + id + '/',
        beforeSend: authorizeXHR,
        success: completionHandler,
        error: function error(response) {
            return console.log(response);
        }
    });
}

function authorizeXHR(xhr) {
    xhr.setRequestHeader("Authorization", 'Token ' + localStorage.token);
}

// React

var Orders = function (_React$Component) {
    _inherits(Orders, _React$Component);

    function Orders(props) {
        _classCallCheck(this, Orders);

        var _this = _possibleConstructorReturn(this, (Orders.__proto__ || Object.getPrototypeOf(Orders)).call(this, props));

        var dateToday = (0, _moment2.default)();
        var dateLastWeek = (0, _moment2.default)().subtract(7, 'days');

        _this.state = {
            orders: null,
            statusFilter: null,
            dates: {
                startDate: dateLastWeek,
                endDate: dateToday
            }
        };

        _this.onDateChange = _this.onDateChange.bind(_this);
        _this.refreshState = _this.refreshState.bind(_this);

        _this.refreshState();
        return _this;
    }

    _createClass(Orders, [{
        key: 'onDateChange',
        value: function onDateChange(dates) {
            this.setState({ orders: null });

            function toDate(dateString) {
                return (0, _moment2.default)(dateString, 'YYYY-MM-DD');
            }

            dates.startDate = toDate(dates.startDate);
            dates.endDate = toDate(dates.endDate);

            this.state.dates = dates;
            this.refreshState();
        }
    }, {
        key: 'refreshState',
        value: function refreshState() {
            var _this2 = this;

            var toastID = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

            function formatDate(date) {
                return date.format('YYYY-MM-DD');
            }

            var startDate = formatDate(this.state.dates.startDate);
            var endDate = formatDate(this.state.dates.endDate);

            fetchOrders({
                startDate: startDate,
                endDate: endDate,
                completionHandler: function completionHandler(result) {
                    //TODO: Sort by date

                    var orders = result.map(function (order) {
                        order.date_ordered = (0, _moment2.default)(order.date_ordered);
                        return order;
                    });

                    _this2.setState({
                        orders: orders
                    });

                    if (toastID) {
                        var toast = document.getElementById(toastID);
                        iziToast.hide({}, toast);

                        iziToast.success({
                            title: "Refreshed",
                            message: "Data is up to date.",
                            timeout: 2500,
                            progressBar: false
                        });
                    }
                }
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            //TODO: Filter
            var filteredOrders = this.state.orders;

            var refreshData = function refreshData() {
                var toastID = (0, _random2.default)();

                iziToast.info({
                    title: "Fetching updates...",
                    progressBar: false,
                    timeout: false,
                    id: toastID
                });

                _this3.refreshState(toastID);
            };

            return _react2.default.createElement(
                'div',
                { id: 'orders',
                    className: 'container-fluid m-0 p-0 h-100 w-100 d-flex flex-column' },
                _react2.default.createElement(OrderHead, { dates: this.state.dates,
                    onDateChange: this.onDateChange,
                    refreshData: refreshData }),
                _react2.default.createElement(OrderTable, { orders: filteredOrders })
            );
        }
    }]);

    return Orders;
}(_react2.default.Component);

var OrderHead = function (_React$Component2) {
    _inherits(OrderHead, _React$Component2);

    function OrderHead(props) {
        _classCallCheck(this, OrderHead);

        return _possibleConstructorReturn(this, (OrderHead.__proto__ || Object.getPrototypeOf(OrderHead)).call(this, props));
    }

    _createClass(OrderHead, [{
        key: 'render',
        value: function render() {
            var _this5 = this;

            function formatDate(date) {
                return date.format('YYYY-MM-DD');
            }

            var startDate = formatDate(this.props.dates.startDate);
            var endDate = formatDate(this.props.dates.endDate);

            var onDateChange = function onDateChange(event, isStartDate) {
                var value = event.target.value;

                if (isStartDate) {
                    _this5.props.onDateChange({
                        startDate: value,
                        endDate: endDate
                    });
                } else {
                    _this5.props.onDateChange({
                        startDate: startDate,
                        endDate: value
                    });
                }
            };

            return _react2.default.createElement(
                'div',
                { className: 'container-fluid row ml-auto mr-auto bg-light page-head' },
                _react2.default.createElement(
                    'div',
                    { className: 'mr-auto row p-3 pt-5 mt-auto' },
                    _react2.default.createElement(
                        'h4',
                        { className: 'mr-3' },
                        'Orders'
                    ),
                    _react2.default.createElement(
                        'div',
                        null,
                        _react2.default.createElement(
                            'button',
                            { className: 'btn btn-sm btn-outline-primary mr-1',
                                onClick: this.props.refreshData },
                            'Refresh Data'
                        ),
                        _react2.default.createElement(
                            'button',
                            { className: 'btn btn-sm btn-outline-primary' },
                            'Generate Report'
                        )
                    )
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'row pl-3 pb-3 mr-3' },
                    _react2.default.createElement(
                        'div',
                        { className: 'mt-auto mr-2' },
                        _react2.default.createElement(
                            'small',
                            { className: 'text-muted mt-auto mb-2 mr-3 d-block' },
                            'Status filter'
                        ),
                        _react2.default.createElement(
                            'div',
                            { className: 'btn-group',
                                'data-toggle': 'buttons' },
                            _react2.default.createElement(
                                'label',
                                { className: 'btn btn-outline-secondary active' },
                                _react2.default.createElement('input', { type: 'radio',
                                    autoComplete: 'off' }),
                                'All'
                            ),
                            _react2.default.createElement(
                                'label',
                                { className: 'btn btn-outline-secondary' },
                                _react2.default.createElement('input', { type: 'radio',
                                    autoComplete: 'off' }),
                                'Unpaid'
                            ),
                            _react2.default.createElement(
                                'label',
                                { className: 'btn btn-outline-secondary' },
                                _react2.default.createElement('input', { type: 'radio',
                                    autoComplete: 'off' }),
                                'Verifying Payment'
                            ),
                            _react2.default.createElement(
                                'label',
                                { className: 'btn btn-outline-secondary' },
                                _react2.default.createElement('input', { type: 'radio',
                                    autoComplete: 'off' }),
                                'Processing'
                            ),
                            _react2.default.createElement(
                                'label',
                                { className: 'btn btn-outline-secondary' },
                                _react2.default.createElement('input', { type: 'radio',
                                    autoComplete: 'off' }),
                                'Shipped'
                            ),
                            _react2.default.createElement(
                                'label',
                                { className: 'btn btn-outline-secondary' },
                                _react2.default.createElement('input', { type: 'radio',
                                    name: 'options',
                                    autoComplete: 'off' }),
                                'Cancelled'
                            )
                        )
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'mt-auto ml-2 row ' },
                        _react2.default.createElement(
                            'div',
                            { className: 'mr-2' },
                            _react2.default.createElement(
                                'small',
                                { className: 'text-muted mt-auto mb-2 mr-3 d-block' },
                                'Start Date'
                            ),
                            _react2.default.createElement(
                                'div',
                                { className: 'input-group' },
                                _react2.default.createElement('input', { className: 'form-control',
                                    type: 'date',
                                    placeholder: 'Start Date',
                                    value: startDate,
                                    onChange: function onChange(event) {
                                        return onDateChange(event, true);
                                    } })
                            )
                        ),
                        _react2.default.createElement(
                            'div',
                            { className: 'mr-2' },
                            _react2.default.createElement(
                                'small',
                                { className: 'text-muted mt-auto mb-2 mr-3 d-block' },
                                'End Date'
                            ),
                            _react2.default.createElement(
                                'div',
                                { className: 'input-group mb-2 mb-sm-0' },
                                _react2.default.createElement(
                                    'div',
                                    { className: 'input-group' },
                                    _react2.default.createElement('input', { className: 'form-control',
                                        type: 'date',
                                        placeholder: 'End Date',
                                        value: endDate,
                                        onChange: function onChange(event) {
                                            return onDateChange(event, false);
                                        } })
                                )
                            )
                        )
                    )
                )
            );
        }
    }]);

    return OrderHead;
}(_react2.default.Component);

var OrderTable = function (_React$Component3) {
    _inherits(OrderTable, _React$Component3);

    function OrderTable(props) {
        _classCallCheck(this, OrderTable);

        var _this6 = _possibleConstructorReturn(this, (OrderTable.__proto__ || Object.getPrototypeOf(OrderTable)).call(this, props));

        _this6.rows = _this6.rows.bind(_this6);
        return _this6;
    }

    _createClass(OrderTable, [{
        key: 'rows',
        value: function rows() {
            return this.props.orders.map(function (order) {
                return _react2.default.createElement(OrderRow, { key: order.id,
                    order: order });
            });
        }
    }, {
        key: 'render',
        value: function render() {

            if (this.props.orders === null) {
                return OrderTable.loadingState();
            }

            if (this.props.orders.length === 0) {
                return OrderTable.emptyState();
            }

            return _react2.default.createElement(
                'div',
                { className: 'd-flex flex-column page-content' },
                _react2.default.createElement(
                    'table',
                    { className: 'table table-hover page-table d-flex flex-column' },
                    _react2.default.createElement(
                        'thead',
                        { className: 'thead-default' },
                        _react2.default.createElement(
                            'tr',
                            null,
                            _react2.default.createElement(
                                'th',
                                null,
                                'Order Number'
                            ),
                            _react2.default.createElement(
                                'th',
                                null,
                                'Order Total'
                            ),
                            _react2.default.createElement(
                                'th',
                                null,
                                'Order Date'
                            ),
                            _react2.default.createElement(
                                'th',
                                null,
                                'Status'
                            )
                        )
                    ),
                    _react2.default.createElement(
                        'tbody',
                        null,
                        this.rows()
                    )
                ),
                _react2.default.createElement(OrderTableFooter, { orders: this.props.orders })
            );
        }
    }], [{
        key: 'emptyState',
        value: function emptyState() {
            return _react2.default.createElement(
                'div',
                { className: 'container-fluid d-flex flex-column justify-content-center align-items-center h-100 bg-light' },
                _react2.default.createElement(
                    'h3',
                    null,
                    'There\'s nothing here.'
                ),
                _react2.default.createElement(
                    'p',
                    { className: 'text-muted' },
                    'Refine your filters and try again.'
                )
            );
        }
    }, {
        key: 'loadingState',
        value: function loadingState() {
            return _react2.default.createElement(
                'div',
                { className: 'container-fluid d-flex flex-column justify-content-center align-items-center h-100' },
                _react2.default.createElement(
                    'h3',
                    null,
                    'Loading...'
                )
            );
        }
    }]);

    return OrderTable;
}(_react2.default.Component);

var OrderRow = function (_React$Component4) {
    _inherits(OrderRow, _React$Component4);

    function OrderRow(props) {
        _classCallCheck(this, OrderRow);

        var _this7 = _possibleConstructorReturn(this, (OrderRow.__proto__ || Object.getPrototypeOf(OrderRow)).call(this, props));

        _this7.date = _this7.date.bind(_this7);
        _this7.status = _this7.status.bind(_this7);
        _this7.rowClass = _this7.rowClass.bind(_this7);
        return _this7;
    }

    _createClass(OrderRow, [{
        key: 'rowClass',
        value: function rowClass() {
            switch (this.props.order.status) {
                case 'U':
                    return 'table-light';
                case 'V':
                    return 'table-warning';
                case 'P':
                    return 'table-primary';
                case 'S':
                    return 'table-success';
                case 'C':
                    return 'table-danger';
            }

            return '';
        }
    }, {
        key: 'status',
        value: function status() {
            switch (this.props.order.status) {
                case 'U':
                    return 'Unpaid';
                case 'V':
                    return 'Verifying Payment';
                case 'P':
                    return 'Processing';
                case 'S':
                    return 'Shipped';
                case 'C':
                    return 'Cancelled';
            }

            return this.props.order.status;
        }
    }, {
        key: 'date',
        value: function date() {
            return this.props.order.date_ordered.format('LLL');
        }
    }, {
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'tr',
                { className: this.rowClass() },
                _react2.default.createElement(
                    'td',
                    null,
                    this.props.order.id
                ),
                _react2.default.createElement(
                    'td',
                    null,
                    '\u20B1',
                    this.props.order.total_price
                ),
                _react2.default.createElement(
                    'td',
                    null,
                    this.date()
                ),
                _react2.default.createElement(
                    'td',
                    null,
                    this.status()
                )
            );
        }
    }]);

    return OrderRow;
}(_react2.default.Component);

var OrderTableFooter = function (_React$Component5) {
    _inherits(OrderTableFooter, _React$Component5);

    function OrderTableFooter(props) {
        _classCallCheck(this, OrderTableFooter);

        var _this8 = _possibleConstructorReturn(this, (OrderTableFooter.__proto__ || Object.getPrototypeOf(OrderTableFooter)).call(this, props));

        _this8.totalItems = _this8.totalItems.bind(_this8);
        _this8.totalForStatus = _this8.totalForStatus.bind(_this8);
        return _this8;
    }

    _createClass(OrderTableFooter, [{
        key: 'totalItems',
        value: function totalItems() {
            return this.props.orders.length;
        }
    }, {
        key: 'totalForStatus',
        value: function totalForStatus(statusCode) {
            return this.props.orders.filter(function (order) {
                return order.status === statusCode;
            }).length;
        }
    }, {
        key: 'render',
        value: function render() {
            var totalItems = this.totalItems();
            var totalUnpaid = this.totalForStatus('U');
            var totalProcessing = this.totalForStatus('P');
            var totalShipped = this.totalForStatus('S');
            var totalCancelled = this.totalForStatus('C');

            return _react2.default.createElement(
                'div',
                { className: 'table-footer bg-light d-flex align-items-center justify-content-center w-100' },
                _react2.default.createElement(
                    'small',
                    { className: 'mb-0' },
                    totalItems + ' Items | ' + totalUnpaid + ' Unpaid | ' + totalProcessing + ' Processing | ' + totalShipped + ' Shipped | ' + totalCancelled + ' Cancelled'
                )
            );
        }
    }]);

    return OrderTableFooter;
}(_react2.default.Component);

exports.default = Orders;
//# sourceMappingURL=orders.js.map
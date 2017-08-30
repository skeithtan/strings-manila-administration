import React from 'react';
import $ from 'jquery';
import moment from 'moment';
import randomString from './random';

// Fetch data
function fetchOrders(object) {
    $.get({
        url: `${baseURL}/api/orders/`,
        beforeSend: authorizeXHR,
        data: {
            "start-date": object.startDate,
            "end-date": object.endDate
        },
        success: object.completionHandler,
        error: response => console.log(response)
    });
}

function fetchOrder(id, completionHandler) {
    $.get({
        url: `${baseURL}/api/orders/${id}/`,
        beforeSend: authorizeXHR,
        success: completionHandler,
        error: response => console.log(response)
    });
}

function authorizeXHR(xhr) {
    xhr.setRequestHeader("Authorization", `Token ${localStorage.token}`);
}

// React
class Orders extends React.Component {
    constructor(props) {
        super(props);

        const dateToday = moment();
        const dateLastWeek = moment().subtract(7, 'days');

        this.state = {
            orders: null,
            statusFilter: null,
            dates: {
                startDate: dateLastWeek,
                endDate: dateToday,
            }
        };

        this.onDateChange = this.onDateChange.bind(this);
        this.refreshState = this.refreshState.bind(this);

        this.refreshState();
    }

    onDateChange(dates) {
        this.setState({orders: null});

        function toDate(dateString) {
            return moment(dateString, 'YYYY-MM-DD')
        }

        dates.startDate = toDate(dates.startDate);
        dates.endDate = toDate(dates.endDate);

        this.state.dates = dates;
        this.refreshState();
    }

    refreshState(toastID = false) {
        function formatDate(date) {
            return date.format('YYYY-MM-DD');
        }

        const startDate = formatDate(this.state.dates.startDate);
        const endDate = formatDate(this.state.dates.endDate);

        fetchOrders({
            startDate: startDate,
            endDate: endDate,
            completionHandler: result => {
                //TODO: Sort by date

                const orders = result.map(order => {
                    order.date_ordered = moment(order.date_ordered);
                    return order;
                });

                this.setState({
                    orders: orders
                });

                if (toastID) {
                    const toast = document.getElementById(toastID);
                    iziToast.hide({}, toast);

                    iziToast.success({
                        title: "Refreshed",
                        message: "Data is up to date.",
                        timeout: 2500,
                        progressBar: false
                    })
                }
            }
        })
    }


    render() {
        //TODO: Filter
        const filteredOrders = this.state.orders;

        const refreshData = () => {
            const toastID = randomString();

            iziToast.info({
                title: "Fetching updates...",
                progressBar: false,
                timeout: false,
                id: toastID
            });

            this.refreshState(toastID);
        };

        return (
            <div id="orders"
                 className="container-fluid m-0 p-0 h-100 w-100 d-flex flex-column">
                <OrderHead dates={this.state.dates}
                           onDateChange={this.onDateChange}
                           refreshData={refreshData}/>
                <OrderTable orders={filteredOrders}/>
            </div>
        );
    }

}

class OrderHead extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        function formatDate(date) {
            return date.format('YYYY-MM-DD');
        }

        const startDate = formatDate(this.props.dates.startDate);
        const endDate = formatDate(this.props.dates.endDate);

        const onDateChange = (event, isStartDate) => {
            const value = event.target.value;

            if (isStartDate) {
                this.props.onDateChange({
                    startDate: value,
                    endDate: endDate
                })
            } else {
                this.props.onDateChange({
                    startDate: startDate,
                    endDate: value
                })
            }
        };

        return (
            <div className="container-fluid row ml-auto mr-auto bg-light page-head">
                <div className="mr-auto row p-3 pt-5 mt-auto">
                    <h4 className="mr-3">Orders</h4>
                    <div>
                        <button className="btn btn-sm btn-outline-primary mr-1"
                                onClick={this.props.refreshData}>Refresh Data
                        </button>
                        <button className="btn btn-sm btn-outline-primary">Generate Report</button>
                    </div>
                </div>

                <div className="row pl-3 pb-3 mr-3">
                    <div className="mt-auto mr-2">
                        <small className="text-muted mt-auto mb-2 mr-3 d-block">Status filter</small>
                        <div className="btn-group"
                             data-toggle="buttons">
                            <label className="btn btn-outline-secondary active">
                                <input type="radio"
                                       autoComplete="off"/>All
                            </label>
                            <label className="btn btn-outline-secondary">
                                <input type="radio"
                                       autoComplete="off"/>Unpaid
                            </label>
                            <label className="btn btn-outline-secondary">
                                <input type="radio"
                                       autoComplete="off"/>Verifying Payment
                            </label>
                            <label className="btn btn-outline-secondary">
                                <input type="radio"
                                       autoComplete="off"/>Processing
                            </label>
                            <label className="btn btn-outline-secondary">
                                <input type="radio"
                                       autoComplete="off"/>Shipped
                            </label>
                            <label className="btn btn-outline-secondary">
                                <input type="radio"
                                       name="options"
                                       autoComplete="off"/>Cancelled
                            </label>
                        </div>
                    </div>
                    <div className="mt-auto ml-2 row ">
                        <div className="mr-2">
                            <small className="text-muted mt-auto mb-2 mr-3 d-block">Start Date</small>
                            <div className="input-group">
                                <input className="form-control"
                                       type="date"
                                       placeholder="Start Date"
                                       value={startDate}
                                       onChange={event => onDateChange(event, true)}/>
                            </div>
                        </div>
                        <div className="mr-2">
                            <small className="text-muted mt-auto mb-2 mr-3 d-block">End Date</small>
                            <div className="input-group mb-2 mb-sm-0">
                                <div className="input-group">
                                    <input className="form-control"
                                           type="date"
                                           placeholder="End Date"
                                           value={endDate}
                                           onChange={event => onDateChange(event, false)}/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

class OrderTable extends React.Component {
    constructor(props) {
        super(props);
        this.rows = this.rows.bind(this);
    }

    static emptyState() {
        return (
            <div className="container-fluid d-flex flex-column justify-content-center align-items-center h-100 bg-light">
                <h3>There's nothing here.</h3>
                <p className="text-muted">Refine your filters and try again.</p>
            </div>
        )
    }

    static loadingState() {
        return (
            <div className="container-fluid d-flex flex-column justify-content-center align-items-center h-100">
                <h3>Loading...</h3>
            </div>
        );
    }

    rows() {
        return this.props.orders.map(order => <OrderRow key={order.id}
                                                        order={order}/>)
    }

    render() {

        if (this.props.orders === null) {
            return OrderTable.loadingState();
        }

        if (this.props.orders.length === 0) {
            return OrderTable.emptyState();
        }

        return (
            <div className="d-flex flex-column page-content">
                <table className="table table-hover page-table d-flex flex-column">
                    <thead className="thead-default">
                    <tr>
                        <th>Order Number</th>
                        <th>Order Total</th>
                        <th>Order Date</th>
                        <th>Status</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.rows()}
                    </tbody>
                </table>
                <OrderTableFooter orders={this.props.orders}/>
            </div>
        )
    }
}

class OrderRow extends React.Component {
    constructor(props) {
        super(props);

        this.date = this.date.bind(this);
        this.status = this.status.bind(this);
        this.rowClass = this.rowClass.bind(this);
    }

    rowClass() {
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

    status() {
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

    date() {
        return this.props.order.date_ordered.format('LLL');
    }

    render() {
        return (
            <tr className={this.rowClass()}>
                <td>{this.props.order.id}</td>
                <td>₱{this.props.order.total_price}</td>
                <td>{this.date()}</td>
                <td>{this.status()}</td>
            </tr>
        );
    }
}

class OrderTableFooter extends React.Component {
    constructor(props) {
        super(props);

        this.totalItems = this.totalItems.bind(this);
        this.totalForStatus = this.totalForStatus.bind(this);
    }

    totalItems() {
        return this.props.orders.length;
    }

    totalForStatus(statusCode) {
        return this.props.orders.filter(order => {
            return order.status === statusCode;
        }).length;
    }

    render() {
        const totalItems = this.totalItems();
        const totalUnpaid = this.totalForStatus('U');
        const totalProcessing = this.totalForStatus('P');
        const totalShipped = this.totalForStatus('S');
        const totalCancelled = this.totalForStatus('C');


        return (
            <div className="table-footer bg-light d-flex align-items-center justify-content-center w-100">
                <small className="mb-0">{`${totalItems} Items | ${totalUnpaid} Unpaid | ${totalProcessing} Processing | ${totalShipped} Shipped | ${totalCancelled} Cancelled`}</small>
            </div>
        )
    }
}

export default Orders;
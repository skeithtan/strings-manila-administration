import React from 'react';
import $ from 'jquery';

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

        this.state = {
            orders: null,
            statusFilter: null,
        };

        this.refreshState = this.refreshState.bind(this);
        this.refreshState();
    }

    refreshState(showSuccessAlert = false) {
        fetchOrders({
            startDate: "2017-08-23",
            endDate: "2017-08-30",
            completionHandler: result => {
                //TODO: Sort by date

                this.setState({
                    orders: result
                });

                if (showSuccessAlert) {
                    iziToast.success({
                        title: "Refreshed",
                        message: "Data is up to date.",
                        timeout: 1500,
                        progressBar: false
                    })
                }
            }
        })
    }

    static loadingState() {
        return (
            <div className="container-fluid d-flex flex-column justify-content-center align-items-center h-100">
                <h3>Loading...</h3>
            </div>
        );
    }

    render() {
        if (this.state.orders === null) {
            return Orders.loadingState();
        }

        //TODO: Filter
        const filteredOrders = this.state.orders;

        return (
            <div id="orders"
                 className="container-fluid m-0 p-0 h-100 w-100 d-flex flex-column">
                <OrderHead/>
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
        return (
            <div className="container-fluid row ml-auto mr-auto bg-light page-head">
                <div className="mr-auto row pt-5 pl-3 pr-3">
                    <h4 className="mr-3">Orders</h4>
                    <div>
                        <button className="btn btn-sm btn-outline-primary mr-1">Refresh Data</button>
                        <button className="btn btn-sm btn-outline-primary">Generate Report</button>
                    </div>
                </div>

                <div className="row pt-3 pl-3 mr-3">
                    <div className="mb-2 mb-sm-0">
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
                    <div className="row mb-2 ml-2">
                        <div className="mr-2">
                            <small className="text-muted mt-auto mb-2 mr-3 d-block">Start Date</small>
                            <div className="input-group">
                                <input className="form-control"
                                       type="date"
                                       placeholder="Start Date"/>
                            </div>
                        </div>
                        <div className="mr-2">
                            <small className="text-muted mt-auto mb-2 mr-3 d-block">End Date</small>
                            <div className="input-group mb-2 mb-sm-0">

                                <div className="input-group">
                                    <input className="form-control"
                                           type="date"
                                           placeholder="End Date"/>
                                </div>
                            </div>
                        </div>
                        <button className="btn btn-primary mt-auto">Filter</button>
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
            <div>
                <h1>TODO</h1>
            </div>
        )
    }

    rows() {
        return this.props.orders.map(order => <OrderRow key={order.id}
                                                        order={order}/>)
    }

    render() {

        return (
            <div className="d-flex flex-column page-content">
                <table className="table table-hover page-table d-flex flex-column mb-0">
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
            </div>
        )
    }
}

class OrderRow extends React.Component {
    constructor(props) {
        super(props);
    }

    static orderStatus(status) {
        switch (status) {
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

        return status;
    }

    render() {
        const status = OrderRow.orderStatus(this.props.order.status);

        return (
            <tr>
                <td>{this.props.order.id}</td>
                <td>{this.props.order.total_price}</td>
                <td>{this.props.order.date_ordered}</td>
                <td>{status}</td>
            </tr>
        );
    }
}

export default Orders;
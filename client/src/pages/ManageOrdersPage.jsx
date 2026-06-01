import React, { useEffect, useState } from 'react';
import { Container, Table, Badge, Button, Form, Row, Col, Spinner } from 'react-bootstrap';
import { getAllOrders, updateOrderStatus } from '../api/orderApi';
import { toast } from 'react-toastify';

const statusVariant = { pending: 'warning', confirmed: 'info', 'in-progress': 'primary', completed: 'success', cancelled: 'danger' };
const nextStatus = { pending: 'confirmed', confirmed: 'in-progress', 'in-progress': 'completed' };

export default function ManageOrdersPage() {
  const [orders, setOrders]       = useState([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [pages, setPages]         = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading]     = useState(false);

  const load = (p = 1, status = '') => {
    setLoading(true);
    const params = { page: p, limit: 10 };
    if (status) params.status = status;
    getAllOrders(params)
      .then(res => {
        setOrders(res.data.orders);
        setTotal(res.data.total);
        setPage(res.data.page);
        setPages(res.data.pages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(1, statusFilter); }, [statusFilter]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateOrderStatus(id, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      load(page, statusFilter);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <Container className="py-4">
      <h3 className="fw-bold mb-4">Manage Orders</h3>
      <Row className="g-2 mb-3 align-items-center">
        <Col sm={3}>
          <Form.Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'].map(s => (
              <option key={s} value={s} className="text-capitalize">{s}</option>
            ))}
          </Form.Select>
        </Col>
        <Col className="text-muted small">Total: {total} orders</Col>
      </Row>

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
      ) : (
        <>
          <Table responsive hover className="shadow-sm align-middle">
            <thead className="table-dark">
              <tr>
                <th>Order Ref</th>
                <th>Customer</th>
                <th>Provider</th>
                <th>Date</th>
                <th>Cost</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o._id}>
                  <td><code className="small">{o.orderRef}</code></td>
                  <td>
                    <div>{o.user?.name}</div>
                    <div className="text-muted small">{o.user?.email}</div>
                  </td>
                  <td>{o.provider?.name}</td>
                  <td>{new Date(o.serviceDate).toLocaleDateString()}</td>
                  <td>₹{o.estimatedCost}</td>
                  <td>
                    <Badge bg={statusVariant[o.orderStatus] || 'secondary'} className="text-capitalize">
                      {o.orderStatus}
                    </Badge>
                  </td>
                  <td>
                    {nextStatus[o.orderStatus] && (
                      <Button
                        size="sm" variant="outline-primary"
                        onClick={() => handleStatusUpdate(o._id, nextStatus[o.orderStatus])}
                      >
                        → {nextStatus[o.orderStatus]}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Pagination */}
          {pages > 1 && (
            <div className="d-flex gap-2 justify-content-center mt-3">
              <Button variant="outline-secondary" disabled={page <= 1} onClick={() => load(page - 1, statusFilter)}>
                Prev
              </Button>
              <span className="align-self-center">Page {page} of {pages}</span>
              <Button variant="outline-secondary" disabled={page >= pages} onClick={() => load(page + 1, statusFilter)}>
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </Container>
  );
}

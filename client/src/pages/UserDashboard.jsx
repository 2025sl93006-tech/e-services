import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Spinner } from 'react-bootstrap';
import { getMyOrders } from '../api/orderApi';
import { useAuth } from '../context/AuthContext';

const statusVariant = { pending: 'warning', confirmed: 'info', 'in-progress': 'primary', completed: 'success', cancelled: 'danger' };

export default function UserDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getMyOrders()
      .then(res => setOrders(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const count = (status) => orders.filter(o => o.orderStatus === status).length;

  return (
    <Container className="py-4">
      <h2 className="fw-bold mb-4">My Dashboard</h2>
      <p className="text-muted mb-4">Welcome back, <strong>{user?.name}</strong>!</p>

      {/* KPI Cards */}
      <Row className="g-3 mb-4">
        {[
          { label: 'Total Orders',     value: orders.length,      color: 'primary' },
          { label: 'Pending',          value: count('pending'),   color: 'warning' },
          { label: 'Completed',        value: count('completed'), color: 'success' },
          { label: 'Cancelled',        value: count('cancelled'), color: 'danger'  },
        ].map(k => (
          <Col key={k.label} xs={6} md={3}>
            <Card className={`text-white bg-${k.color} text-center shadow-sm`}>
              <Card.Body>
                <div className="display-5 fw-bold">{k.value}</div>
                <div className="small">{k.label}</div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">Recent Orders</h5>
        <Button variant="outline-primary" size="sm" onClick={() => navigate('/user/my-orders')}>
          View All
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-4"><Spinner animation="border" variant="primary" /></div>
      ) : orders.length === 0 ? (
        <div className="text-center text-muted py-4">
          <p>No orders yet.</p>
          <Button variant="primary" onClick={() => navigate('/services')}>Browse Services</Button>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Order Ref</th>
                <th>Provider</th>
                <th>Service Date</th>
                <th>Cost</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map(o => (
                <tr key={o._id}>
                  <td><code>{o.orderRef}</code></td>
                  <td>{o.provider?.name || '—'}</td>
                  <td>{new Date(o.serviceDate).toLocaleDateString()}</td>
                  <td>₹{o.estimatedCost}</td>
                  <td>
                    <Badge bg={statusVariant[o.orderStatus] || 'secondary'} className="text-capitalize">
                      {o.orderStatus}
                    </Badge>
                  </td>
                  <td>
                    <Button size="sm" variant="outline-secondary" onClick={() => navigate(`/user/orders/${o._id}`)}>
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Container>
  );
}

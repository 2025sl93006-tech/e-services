import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { getAllOrders } from '../api/orderApi';
import { getAllCategories } from '../api/categoryApi';
import { getAllProviders } from '../api/serviceApi';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ orders: 0, categories: 0, providers: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getAllOrders(), getAllCategories(), getAllProviders()])
      .then(([ordRes, catRes, provRes]) => {
        const orders    = ordRes.data.total || 0;
        const pending   = ordRes.data.orders?.filter(o => o.orderStatus === 'pending').length || 0;
        const cats      = catRes.data.length || 0;
        const providers = Array.isArray(provRes.data) ? provRes.data.length : 0;
        setStats({ orders, categories: cats, providers, pending });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const kpis = [
    { label: 'Total Orders',   value: stats.orders,     color: 'primary', link: '/admin/orders' },
    { label: 'Pending Orders', value: stats.pending,    color: 'warning', link: '/admin/orders' },
    { label: 'Providers',      value: stats.providers,  color: 'info',    link: '/admin/providers' },
    { label: 'Categories',     value: stats.categories, color: 'success', link: '/admin/categories' },
  ];

  return (
    <Container className="py-4">
      <h2 className="fw-bold mb-4">Admin Dashboard</h2>
      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
      ) : (
        <>
          <Row className="g-3 mb-5">
            {kpis.map(k => (
              <Col key={k.label} xs={6} md={3}>
                <Card
                  className={`text-white bg-${k.color} text-center shadow-sm`}
                  style={{ cursor: 'pointer' }} onClick={() => navigate(k.link)}
                >
                  <Card.Body>
                    <div className="display-5 fw-bold">{k.value}</div>
                    <div className="small">{k.label}</div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <h5 className="fw-bold mb-3">Quick Actions</h5>
          <Row className="g-3">
            {[
              { label: 'Manage Categories', path: '/admin/categories', variant: 'outline-success' },
              { label: 'Manage Providers',  path: '/admin/providers',  variant: 'outline-info'    },
              { label: 'Manage Orders',     path: '/admin/orders',     variant: 'outline-warning'  },
            ].map(a => (
              <Col key={a.label} sm={4}>
                <Button variant={a.variant} className="w-100" onClick={() => navigate(a.path)}>
                  {a.label}
                </Button>
              </Col>
            ))}
          </Row>
        </>
      )}
    </Container>
  );
}

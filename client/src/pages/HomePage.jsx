import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { getAllCategories } from '../api/categoryApi';
import { getAllProviders } from '../api/serviceApi';
import StarRating from '../components/common/StarRating';

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getAllCategories(), getAllProviders({ limit: 6 })])
      .then(([catRes, provRes]) => {
        setCategories(catRes.data);
        const list = Array.isArray(provRes.data) ? provRes.data : provRes.data.providers || [];
        setFeatured(list.slice(0, 6));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Hero */}
      <div className="hero-gradient text-center">
        <Container>
          <h1 className="display-4 fw-bold mb-3">Your Trusted Service Partner</h1>
          <p className="lead mb-4">Find verified professionals for Civil, Electrical, Carpentry, Sanitary and more.</p>
          <Button variant="light" size="lg" onClick={() => navigate('/services')}>
            Explore Services
          </Button>
        </Container>
      </div>

      <Container className="py-5">
        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
        ) : (
          <>
            {/* Category Grid */}
            <h2 className="fw-bold mb-4">Browse by Category</h2>
            <Row className="g-3 mb-5">
              {categories.map(cat => (
                <Col key={cat._id} xs={6} sm={4} md={3} lg={2}>
                  <Card
                    className="category-card text-center border-0 shadow-sm h-100"
                    onClick={() => navigate(`/services?category=${cat._id}`)}
                  >
                    {cat.imageUrl && (
                      <Card.Img
                        variant="top"
                        src={cat.imageUrl}
                        style={{ height: '100px', objectFit: 'cover' }}
                      />
                    )}
                    <Card.Body className="p-2">
                      <Card.Title className="fs-6 mb-0">{cat.name}</Card.Title>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Featured Providers */}
            <h2 className="fw-bold mb-4">Featured Service Providers</h2>
            <Row className="g-4 mb-5">
              {featured.map(p => (
                <Col key={p._id} sm={6} md={4}>
                  <Card className="provider-card h-100 shadow-sm">
                    {p.imageUrl && (
                      <Card.Img
                        variant="top"
                        src={p.imageUrl}
                        style={{ height: '160px', objectFit: 'cover' }}
                      />
                    )}
                    <Card.Body>
                      <Card.Title>{p.name}</Card.Title>
                      <div className="text-muted small mb-1">{p.category?.name} &bull; {p.location}</div>
                      <StarRating rating={p.averageRating} totalReviews={p.totalReviews} />
                      <div className="mt-2 fw-semibold text-primary">₹{p.chargePerHour}/hr</div>
                    </Card.Body>
                    <Card.Footer className="bg-transparent border-0 pb-3">
                      <Button size="sm" variant="primary" onClick={() => navigate(`/services/${p._id}`)}>
                        View Details
                      </Button>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Why Choose Us */}
            <h2 className="fw-bold mb-4">Why Choose e-Services?</h2>
            <Row className="g-4">
              {[
                { icon: '✅', title: 'Verified Professionals', desc: 'Every service provider is background-checked and verified.' },
                { icon: '💰', title: 'Transparent Pricing', desc: 'Know the cost upfront — no hidden charges.' },
                { icon: '⚡', title: 'Quick Booking', desc: 'Place your service order in under 2 minutes.' },
                { icon: '⭐', title: 'Rated & Reviewed', desc: 'Real customer ratings help you choose the best.' },
              ].map(item => (
                <Col key={item.title} sm={6} md={3}>
                  <Card className="text-center border-0 bg-light h-100">
                    <Card.Body>
                      <div className="display-5 mb-2">{item.icon}</div>
                      <Card.Title className="fs-6">{item.title}</Card.Title>
                      <Card.Text className="small text-muted">{item.desc}</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </>
        )}
      </Container>
    </div>
  );
}

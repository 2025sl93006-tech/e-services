import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, InputGroup, Spinner } from 'react-bootstrap';
import { getAllProviders } from '../api/serviceApi';
import { getAllCategories } from '../api/categoryApi';
import StarRating from '../components/common/StarRating';

export default function ServicesPage() {
  const [providers, setProviders]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    location: '',
    minCost:  '',
    maxCost:  '',
    search:   '',
  });

  const fetchProviders = (f) => {
    setLoading(true);
    const params = {};
    if (f.category) params.category = f.category;
    if (f.location) params.location = f.location;
    if (f.minCost)  params.minCost  = f.minCost;
    if (f.maxCost)  params.maxCost  = f.maxCost;
    if (f.search)   params.search   = f.search;
    getAllProviders(params)
      .then(res => setProviders(Array.isArray(res.data) ? res.data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getAllCategories().then(res => setCategories(res.data));
    fetchProviders(filters);
  }, []); // eslint-disable-line

  const handleChange = (e) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (filters.category) setSearchParams({ category: filters.category });
    else setSearchParams({});
    fetchProviders(filters);
  };

  const handleClear = () => {
    const cleared = { category: '', location: '', minCost: '', maxCost: '', search: '' };
    setFilters(cleared);
    setSearchParams({});
    fetchProviders(cleared);
  };

  return (
    <Container className="py-4">
      <h2 className="fw-bold mb-4">Find Services</h2>
      <Row>
        {/* Filter Panel */}
        <Col md={3}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h6 className="fw-bold mb-3">Filters</h6>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select name="category" value={filters.category} onChange={handleChange}>
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Control name="location" value={filters.location} onChange={handleChange} placeholder="e.g. Bangalore" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Min Cost (₹/hr)</Form.Label>
                  <Form.Control type="number" name="minCost" value={filters.minCost} onChange={handleChange} min="0" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Max Cost (₹/hr)</Form.Label>
                  <Form.Control type="number" name="maxCost" value={filters.maxCost} onChange={handleChange} min="0" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Search</Form.Label>
                  <Form.Control name="search" value={filters.search} onChange={handleChange} placeholder="Keyword..." />
                </Form.Group>
                <div className="d-grid gap-2">
                  <Button type="submit" variant="primary">Apply Filters</Button>
                  <Button type="button" variant="outline-secondary" onClick={handleClear}>Clear</Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Results */}
        <Col md={9}>
          {loading ? (
            <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
          ) : providers.length === 0 ? (
            <div className="text-center text-muted py-5">No service providers found.</div>
          ) : (
            <Row className="g-4">
              {providers.map(p => (
                <Col key={p._id} sm={6} lg={4}>
                  <Card className="provider-card h-100 shadow-sm">
                    {p.imageUrl && (
                      <Card.Img variant="top" src={p.imageUrl} style={{ height: '150px', objectFit: 'cover' }} />
                    )}
                    <Card.Body>
                      <Card.Title className="fs-6 mb-1">{p.name}</Card.Title>
                      <div className="text-muted small mb-2">{p.category?.name} &bull; {p.location}</div>
                      <StarRating rating={p.averageRating} totalReviews={p.totalReviews} />
                      <div className="mt-2 fw-semibold text-primary">₹{p.chargePerHour}/hr</div>
                      <div className="small text-muted">Min charge: ₹{p.minCharge}</div>
                    </Card.Body>
                    <Card.Footer className="bg-transparent border-0 pb-3">
                      <Button size="sm" variant="primary" onClick={() => navigate(`/services/${p._id}`)}>
                        View &amp; Book
                      </Button>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>
    </Container>
  );
}

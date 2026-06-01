import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Spinner, Form, Alert } from 'react-bootstrap';
import { getProvider } from '../api/serviceApi';
import { getProviderReviews, createReview } from '../api/reviewApi';
import { getMyOrders } from '../api/orderApi';
import StarRating from '../components/common/StarRating';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function ServiceDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [provider, setProvider] = useState(null);
  const [reviews, setReviews]   = useState([]);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [hasReviewed, setHasReviewed]   = useState(false);
  const [loading, setLoading]   = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  const loadData = () => {
    const tasks = [getProvider(id), getProviderReviews(id)];
    if (user) tasks.push(getMyOrders());
    Promise.all(tasks)
      .then(([provRes, revRes, ordRes]) => {
        setProvider(provRes.data);
        setReviews(revRes.data);
        if (ordRes) {
          const completed = ordRes.data.some(o => o.provider?._id === id && o.orderStatus === 'completed');
          setHasCompleted(completed);
          const reviewed = revRes.data.some(r => r.user?._id === user?.id);
          setHasReviewed(reviewed);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [id]); // eslint-disable-line

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (reviewForm.rating === 0) return toast.error('Please select a rating');
    setSubmitting(true);
    try {
      await createReview({ providerId: id, rating: reviewForm.rating, comment: reviewForm.comment });
      toast.success('Review submitted!');
      setReviewForm({ rating: 0, comment: '' });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;
  if (!provider) return <Container className="py-5"><Alert variant="danger">Provider not found.</Alert></Container>;

  const availabilityVariant = { available: 'success', busy: 'warning', unavailable: 'danger' };

  return (
    <Container className="py-4">
      <Row>
        <Col md={8}>
          {provider.imageUrl && (
            <img src={provider.imageUrl} alt={provider.name} className="img-fluid rounded mb-4 w-100" style={{ maxHeight: '300px', objectFit: 'cover' }} />
          )}
          <h2 className="fw-bold">{provider.name}</h2>
          <div className="mb-2">
            <Badge bg="secondary" className="me-2">{provider.category?.name}</Badge>
            <Badge bg={availabilityVariant[provider.availability] || 'secondary'} className="text-capitalize">
              {provider.availability}
            </Badge>
          </div>
          <StarRating rating={provider.averageRating} totalReviews={provider.totalReviews} />
          <p className="mt-3 text-muted">{provider.description}</p>
          <Row className="g-2 mb-4">
            <Col xs={6}><strong>Location:</strong> {provider.location}</Col>
            <Col xs={6}><strong>Address:</strong> {provider.address}</Col>
            <Col xs={6}><strong>Phone:</strong> {provider.phone}</Col>
            <Col xs={6}><strong>Experience:</strong> {provider.experience} yr{provider.experience !== 1 ? 's' : ''}</Col>
            <Col xs={6}><strong>Rate:</strong> ₹{provider.chargePerHour}/hr</Col>
            <Col xs={6}><strong>Min Charge:</strong> ₹{provider.minCharge}</Col>
          </Row>

          {user && !user.role === 'admin' ? null : null}
          {user && provider.availability === 'available' && (
            <Button variant="primary" size="lg" onClick={() => navigate(`/user/order/${id}`)}>
              Book Now
            </Button>
          )}

          {/* Reviews */}
          <h4 className="fw-bold mt-5 mb-3">Customer Reviews</h4>
          {reviews.length === 0 ? (
            <p className="text-muted">No reviews yet. Be the first!</p>
          ) : (
            reviews.map(r => (
              <Card key={r._id} className="mb-3 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <strong>{r.user?.name || 'Anonymous'}</strong>
                    <small className="text-muted">{new Date(r.createdAt).toLocaleDateString()}</small>
                  </div>
                  <StarRating rating={r.rating} />
                  <p className="mt-2 mb-0 text-muted">{r.comment}</p>
                </Card.Body>
              </Card>
            ))
          )}

          {/* Leave Review */}
          {user && hasCompleted && !hasReviewed && (
            <Card className="mt-4 shadow-sm">
              <Card.Body>
                <h6 className="fw-bold mb-3">Leave a Review</h6>
                <Form onSubmit={handleReviewSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Rating</Form.Label>
                    <div>
                      <StarRating
                        rating={reviewForm.rating}
                        interactive
                        onRate={(r) => setReviewForm(prev => ({ ...prev, rating: r }))}
                      />
                    </div>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Comment</Form.Label>
                    <Form.Control
                      as="textarea" rows={3}
                      value={reviewForm.comment}
                      onChange={e => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                      placeholder="Share your experience..."
                    />
                  </Form.Group>
                  <Button type="submit" variant="success" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          )}

          {user && hasCompleted && hasReviewed && (
            <Alert variant="info" className="mt-3">You have already reviewed this provider.</Alert>
          )}
          {user && !hasCompleted && (
            <Alert variant="secondary" className="mt-3">Complete a service with this provider to leave a review.</Alert>
          )}
          {!user && (
            <Alert variant="warning" className="mt-3">
              <Alert.Link onClick={() => navigate('/login')}>Login</Alert.Link> to book or leave a review.
            </Alert>
          )}
        </Col>

        {/* Sidebar */}
        <Col md={4}>
          <Card className="shadow-sm sticky-top" style={{ top: '80px' }}>
            <Card.Body>
              <h5 className="fw-bold">Quick Book</h5>
              <p className="text-muted small">Ready to hire {provider.name}?</p>
              <div className="mb-2"><strong>₹{provider.chargePerHour}</strong><span className="text-muted">/hr</span></div>
              <div className="text-muted small mb-3">Minimum charge: ₹{provider.minCharge}</div>
              {user ? (
                <Button
                  variant="primary" className="w-100"
                  disabled={provider.availability !== 'available'}
                  onClick={() => navigate(`/user/order/${id}`)}
                >
                  {provider.availability === 'available' ? 'Book Now' : 'Currently Unavailable'}
                </Button>
              ) : (
                <Button variant="outline-primary" className="w-100" onClick={() => navigate('/login')}>
                  Login to Book
                </Button>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

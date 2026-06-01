import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Badge, Button, Spinner, Modal, Form, Alert } from 'react-bootstrap';
import { getMyOrders, cancelOrder } from '../api/orderApi';
import { createReview } from '../api/reviewApi';
import StarRating from '../components/common/StarRating';
import { toast } from 'react-toastify';

const statusVariant = { pending: 'warning', confirmed: 'info', 'in-progress': 'primary', completed: 'success', cancelled: 'danger' };

export default function MyOrdersPage() {
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [cancelModal, setCancelModal] = useState({ show: false, orderId: null });
  const [cancelReason, setCancelReason] = useState('');
  const [reviewModal, setReviewModal]   = useState({ show: false, orderId: null, providerId: null });
  const [reviewForm, setReviewForm]     = useState({ rating: 0, comment: '' });
  const navigate = useNavigate();

  const load = () => {
    getMyOrders()
      .then(res => setOrders(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async () => {
    try {
      await cancelOrder(cancelModal.orderId, cancelReason);
      toast.success('Order cancelled');
      setCancelModal({ show: false, orderId: null });
      setCancelReason('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const handleReviewSubmit = async () => {
    if (!reviewForm.rating) return toast.error('Please select a rating');
    try {
      await createReview({ providerId: reviewModal.providerId, orderId: reviewModal.orderId, ...reviewForm });
      toast.success('Review submitted!');
      setReviewModal({ show: false, orderId: null, providerId: null });
      setReviewForm({ rating: 0, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
  };

  return (
    <Container className="py-4">
      <h3 className="fw-bold mb-4">My Orders</h3>

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
      ) : orders.length === 0 ? (
        <div className="text-center text-muted py-5">
          <p>No orders yet.</p>
          <Button variant="primary" onClick={() => navigate('/services')}>Browse Services</Button>
        </div>
      ) : (
        orders.map(o => (
          <Card key={o._id} className="mb-3 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between flex-wrap gap-2">
                <div>
                  <div className="fw-bold">{o.provider?.name || 'Unknown'}</div>
                  <div className="text-muted small">{o.category?.name} &bull; <code>{o.orderRef}</code></div>
                  <StarRating rating={o.provider?.averageRating} totalReviews={o.provider?.totalReviews} />
                </div>
                <div className="text-end">
                  <Badge bg={statusVariant[o.orderStatus] || 'secondary'} className="text-capitalize mb-1">
                    {o.orderStatus}
                  </Badge>
                  <div className="text-muted small">{new Date(o.serviceDate).toLocaleDateString()}</div>
                  <div className="fw-semibold text-primary">₹{o.estimatedCost}</div>
                </div>
              </div>
              <div className="text-muted small mt-2">{o.serviceAddress}</div>
              <div className="d-flex gap-2 mt-3 flex-wrap">
                <Button size="sm" variant="outline-secondary" onClick={() => navigate(`/user/orders/${o._id}`)}>
                  Details
                </Button>
                {['pending', 'confirmed'].includes(o.orderStatus) && (
                  <Button size="sm" variant="outline-danger"
                    onClick={() => setCancelModal({ show: true, orderId: o._id })}>
                    Cancel
                  </Button>
                )}
                {o.orderStatus === 'completed' && (
                  <Button size="sm" variant="outline-success"
                    onClick={() => {
                      setReviewModal({ show: true, orderId: o._id, providerId: o.provider?._id });
                      setReviewForm({ rating: 0, comment: '' });
                    }}>
                    Leave Review
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>
        ))
      )}

      {/* Cancel Modal */}
      <Modal show={cancelModal.show} onHide={() => setCancelModal({ show: false, orderId: null })}>
        <Modal.Header closeButton><Modal.Title>Cancel Order</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Reason for cancellation</Form.Label>
            <Form.Control
              as="textarea" rows={3} value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              placeholder="Optional reason..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setCancelModal({ show: false, orderId: null })}>Close</Button>
          <Button variant="danger" onClick={handleCancel}>Confirm Cancel</Button>
        </Modal.Footer>
      </Modal>

      {/* Review Modal */}
      <Modal show={reviewModal.show} onHide={() => setReviewModal({ show: false, orderId: null, providerId: null })}>
        <Modal.Header closeButton><Modal.Title>Leave a Review</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Rating</Form.Label>
            <div>
              <StarRating
                rating={reviewForm.rating} interactive
                onRate={(r) => setReviewForm(prev => ({ ...prev, rating: r }))}
              />
            </div>
          </Form.Group>
          <Form.Group>
            <Form.Label>Comment</Form.Label>
            <Form.Control
              as="textarea" rows={3} value={reviewForm.comment}
              onChange={e => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="Share your experience..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setReviewModal({ show: false, orderId: null, providerId: null })}>
            Close
          </Button>
          <Button variant="success" onClick={handleReviewSubmit}>Submit Review</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

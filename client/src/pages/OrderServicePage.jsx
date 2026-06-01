import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { getProvider } from '../api/serviceApi';
import { createOrder } from '../api/orderApi';
import { toast } from 'react-toastify';

const schema = Yup.object({
  serviceDate:    Yup.date().min(new Date(), 'Must be a future date').required('Required'),
  serviceAddress: Yup.string().min(5).required('Required'),
  estimatedHours: Yup.number().min(1).max(24).required('Required'),
  description:    Yup.string(),
});

export default function OrderServicePage() {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    getProvider(providerId).then(res => setProvider(res.data)).catch(console.error);
  }, [providerId]);

  if (!provider) return <div className="text-center py-5">Loading...</div>;

  return (
    <Container className="py-4" style={{ maxWidth: 680 }}>
      <h3 className="fw-bold mb-1">Book Service</h3>
      <p className="text-muted mb-4">Provider: <strong>{provider.name}</strong> &bull; ₹{provider.chargePerHour}/hr</p>
      <Formik
        initialValues={{ serviceDate: '', serviceAddress: '', estimatedHours: 1, description: '' }}
        validationSchema={schema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            const res = await createOrder({ providerId, ...values });
            toast.success(`Order placed! Ref: ${res.data.orderRef}`);
            navigate('/user/my-orders');
          } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to place order');
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => {
          const hours       = parseInt(values.estimatedHours) || 1;
          const estCost     = Math.max(provider.chargePerHour * hours, provider.minCharge);

          return (
            <Form noValidate onSubmit={handleSubmit}>
              <Row className="g-3">
                <Col sm={6}>
                  <Form.Group>
                    <Form.Label>Service Date</Form.Label>
                    <Form.Control
                      type="date" name="serviceDate"
                      value={values.serviceDate} onChange={handleChange} onBlur={handleBlur}
                      isInvalid={touched.serviceDate && !!errors.serviceDate}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <Form.Control.Feedback type="invalid">{errors.serviceDate}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col sm={6}>
                  <Form.Group>
                    <Form.Label>Estimated Hours</Form.Label>
                    <Form.Control
                      type="number" name="estimatedHours" min={1} max={24}
                      value={values.estimatedHours} onChange={handleChange} onBlur={handleBlur}
                      isInvalid={touched.estimatedHours && !!errors.estimatedHours}
                    />
                    <Form.Control.Feedback type="invalid">{errors.estimatedHours}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col xs={12}>
                  <Form.Group>
                    <Form.Label>Service Address</Form.Label>
                    <Form.Control
                      name="serviceAddress"
                      value={values.serviceAddress} onChange={handleChange} onBlur={handleBlur}
                      isInvalid={touched.serviceAddress && !!errors.serviceAddress}
                      placeholder="Full address where service is required"
                    />
                    <Form.Control.Feedback type="invalid">{errors.serviceAddress}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col xs={12}>
                  <Form.Group>
                    <Form.Label>Description <span className="text-muted small">(optional)</span></Form.Label>
                    <Form.Control
                      as="textarea" rows={3} name="description"
                      value={values.description} onChange={handleChange}
                      placeholder="Describe the work needed..."
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Cost Preview */}
              <Alert variant="info" className="mt-4">
                <strong>Estimated Cost:</strong> ₹{provider.chargePerHour} × {hours} hr{hours > 1 ? 's' : ''} = ₹{provider.chargePerHour * hours}
                {provider.minCharge > provider.chargePerHour * hours && (
                  <span> &nbsp;(minimum charge applied: <strong>₹{provider.minCharge}</strong>)</span>
                )}
                <div className="mt-1 fs-5 fw-bold">Total: ₹{estCost}</div>
              </Alert>

              <div className="d-flex gap-2 mt-3">
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Placing Order...' : 'Confirm Booking'}
                </Button>
                <Button variant="outline-secondary" onClick={() => navigate(-1)}>Cancel</Button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </Container>
  );
}

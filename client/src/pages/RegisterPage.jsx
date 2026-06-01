import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, Form, Button, Row, Col } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { register as registerApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const schema = Yup.object({
  name:     Yup.string().min(2).required('Required'),
  email:    Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().min(6, 'Minimum 6 characters').required('Required'),
  phone:    Yup.string().matches(/^[6-9]\d{9}$/, 'Enter valid 10-digit phone'),
  address:  Yup.string(),
});

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  return (
    <Container className="py-5" style={{ maxWidth: 560 }}>
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <h4 className="fw-bold mb-4 text-center">Create Account</h4>
          <Formik
            initialValues={{ name: '', email: '', password: '', phone: '', address: '' }}
            validationSchema={schema}
            onSubmit={async (values, { setSubmitting, setFieldError }) => {
              try {
                const { data } = await registerApi(values);
                login(data.token, data.user);
                toast.success('Account created successfully!');
                navigate('/user/dashboard');
              } catch (err) {
                setFieldError('email', err.response?.data?.message || 'Registration failed');
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
              <Form noValidate onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    name="name" value={values.name} onChange={handleChange} onBlur={handleBlur}
                    isInvalid={touched.name && !!errors.name} placeholder="Rahul Sharma"
                  />
                  <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email" name="email" value={values.email} onChange={handleChange} onBlur={handleBlur}
                    isInvalid={touched.email && !!errors.email} placeholder="you@example.com"
                  />
                  <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password" name="password" value={values.password} onChange={handleChange} onBlur={handleBlur}
                    isInvalid={touched.password && !!errors.password}
                  />
                  <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                </Form.Group>
                <Row>
                  <Col sm={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone</Form.Label>
                      <Form.Control
                        name="phone" value={values.phone} onChange={handleChange} onBlur={handleBlur}
                        isInvalid={touched.phone && !!errors.phone} placeholder="9876543210"
                      />
                      <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col sm={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Address</Form.Label>
                      <Form.Control
                        name="address" value={values.address} onChange={handleChange} onBlur={handleBlur}
                        placeholder="City, State"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Button type="submit" variant="primary" className="w-100" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating account...' : 'Register'}
                </Button>
              </Form>
            )}
          </Formik>
          <p className="text-center mt-3 mb-0 small">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
}

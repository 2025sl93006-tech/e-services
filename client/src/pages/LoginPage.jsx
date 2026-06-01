import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { login as loginApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const schema = Yup.object({
  email:    Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().required('Required'),
});

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  return (
    <Container className="py-5" style={{ maxWidth: 460 }}>
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <h4 className="fw-bold mb-4 text-center">Login to e-Services</h4>
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={schema}
            onSubmit={async (values, { setSubmitting, setFieldError }) => {
              try {
                const { data } = await loginApi(values);
                login(data.token, data.user);
                toast.success(`Welcome back, ${data.user.name}!`);
                navigate(data.user.role === 'admin' ? '/admin' : '/user/dashboard');
              } catch (err) {
                setFieldError('password', err.response?.data?.message || 'Login failed');
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
              <Form noValidate onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email" name="email"
                    value={values.email} onChange={handleChange} onBlur={handleBlur}
                    isInvalid={touched.email && !!errors.email}
                    placeholder="admin@eservices.com"
                  />
                  <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password" name="password"
                    value={values.password} onChange={handleChange} onBlur={handleBlur}
                    isInvalid={touched.password && !!errors.password}
                  />
                  <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                </Form.Group>
                <Button type="submit" variant="primary" className="w-100" disabled={isSubmitting}>
                  {isSubmitting ? 'Logging in...' : 'Login'}
                </Button>
              </Form>
            )}
          </Formik>
          <p className="text-center mt-3 mb-0 small">
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
}

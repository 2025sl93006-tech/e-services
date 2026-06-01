import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Modal, Form, Badge, Row, Col, Spinner, InputGroup } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { getAllProviders, createProvider, updateProvider, deleteProvider } from '../api/serviceApi';
import { getAllCategories } from '../api/categoryApi';
import StarRating from '../components/common/StarRating';
import { toast } from 'react-toastify';

const schema = Yup.object({
  name:           Yup.string().min(2).required('Required'),
  category:       Yup.string().required('Required'),
  description:    Yup.string(),
  location:       Yup.string().required('Required'),
  address:        Yup.string(),
  phone:          Yup.string(),
  email:          Yup.string().email('Invalid email'),
  imageUrl:       Yup.string().url('Must be valid URL'),
  chargePerHour:  Yup.number().min(0).required('Required'),
  minCharge:      Yup.number().min(0),
  experience:     Yup.number().min(0),
  availability:   Yup.string().oneOf(['available', 'busy', 'unavailable']),
});

const emptyProvider = { name: '', category: '', description: '', location: '', address: '', phone: '', email: '', imageUrl: '', chargePerHour: '', minCharge: 0, experience: 0, availability: 'available' };

export default function ManageProvidersPage() {
  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [modal, setModal]           = useState({ show: false, data: null });
  const [search, setSearch]         = useState('');
  const [catFilter, setCatFilter]   = useState('');

  const load = () => {
    Promise.all([getAllProviders(), getAllCategories()])
      .then(([provRes, catRes]) => {
        setProviders(Array.isArray(provRes.data) ? provRes.data : []);
        setCategories(catRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = providers.filter(p =>
    (!catFilter || p.category?._id === catFilter) &&
    (!search || p.name.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase()))
  );

  const openAdd  = () => setModal({ show: true, data: null });
  const openEdit = (p)  => setModal({ show: true, data: p });
  const close    = () => setModal({ show: false, data: null });

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this provider?')) return;
    try {
      await deleteProvider(id);
      toast.success('Provider deactivated');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold mb-0">Manage Providers</h3>
        <Button variant="primary" onClick={openAdd}>+ Add Provider</Button>
      </div>

      <Row className="g-2 mb-3">
        <Col sm={4}>
          <Form.Control
            placeholder="Search by name or location..."
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </Col>
        <Col sm={4}>
          <Form.Select value={catFilter} onChange={e => setCatFilter(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </Form.Select>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
      ) : (
        <Table responsive hover className="shadow-sm align-middle">
          <thead className="table-dark">
            <tr><th>#</th><th>Name</th><th>Category</th><th>Location</th><th>Rate</th><th>Rating</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p._id}>
                <td>{i + 1}</td>
                <td>{p.name}</td>
                <td>{p.category?.name}</td>
                <td>{p.location}</td>
                <td>₹{p.chargePerHour}/hr</td>
                <td><StarRating rating={p.averageRating} totalReviews={p.totalReviews} /></td>
                <td>
                  <Badge bg={p.isActive ? 'success' : 'secondary'} className="me-1">{p.isActive ? 'Active' : 'Inactive'}</Badge>
                  <Badge bg={p.availability === 'available' ? 'success' : p.availability === 'busy' ? 'warning' : 'danger'} className="text-capitalize">
                    {p.availability}
                  </Badge>
                </td>
                <td>
                  <Button size="sm" variant="outline-primary" className="me-1" onClick={() => openEdit(p)}>Edit</Button>
                  <Button size="sm" variant="outline-danger" onClick={() => handleDeactivate(p._id)}>Deactivate</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={modal.show} onHide={close} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{modal.data ? 'Edit Provider' : 'Add Provider'}</Modal.Title>
        </Modal.Header>
        <Formik
          enableReinitialize
          initialValues={modal.data ? {
            name: modal.data.name, category: modal.data.category?._id || modal.data.category,
            description: modal.data.description || '', location: modal.data.location,
            address: modal.data.address || '', phone: modal.data.phone || '',
            email: modal.data.email || '', imageUrl: modal.data.imageUrl || '',
            chargePerHour: modal.data.chargePerHour, minCharge: modal.data.minCharge,
            experience: modal.data.experience, availability: modal.data.availability,
          } : emptyProvider}
          validationSchema={schema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              if (modal.data) {
                await updateProvider(modal.data._id, values);
                toast.success('Provider updated');
              } else {
                await createProvider(values);
                toast.success('Provider created');
              }
              close();
              load();
            } catch (err) {
              toast.error(err.response?.data?.message || 'Failed');
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
            <Form noValidate onSubmit={handleSubmit}>
              <Modal.Body>
                <Row className="g-3">
                  <Col sm={6}>
                    <Form.Group>
                      <Form.Label>Name *</Form.Label>
                      <Form.Control name="name" value={values.name} onChange={handleChange} onBlur={handleBlur} isInvalid={touched.name && !!errors.name} />
                      <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col sm={6}>
                    <Form.Group>
                      <Form.Label>Category *</Form.Label>
                      <Form.Select name="category" value={values.category} onChange={handleChange} onBlur={handleBlur} isInvalid={touched.category && !!errors.category}>
                        <option value="">Select...</option>
                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">{errors.category}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col sm={6}>
                    <Form.Group>
                      <Form.Label>Location *</Form.Label>
                      <Form.Control name="location" value={values.location} onChange={handleChange} onBlur={handleBlur} isInvalid={touched.location && !!errors.location} />
                      <Form.Control.Feedback type="invalid">{errors.location}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col sm={6}>
                    <Form.Group>
                      <Form.Label>Address</Form.Label>
                      <Form.Control name="address" value={values.address} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                  <Col sm={6}>
                    <Form.Group>
                      <Form.Label>Phone</Form.Label>
                      <Form.Control name="phone" value={values.phone} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                  <Col sm={6}>
                    <Form.Group>
                      <Form.Label>Email</Form.Label>
                      <Form.Control type="email" name="email" value={values.email} onChange={handleChange} onBlur={handleBlur} isInvalid={touched.email && !!errors.email} />
                      <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col sm={4}>
                    <Form.Group>
                      <Form.Label>Charge/hr (₹) *</Form.Label>
                      <Form.Control type="number" name="chargePerHour" value={values.chargePerHour} onChange={handleChange} onBlur={handleBlur} isInvalid={touched.chargePerHour && !!errors.chargePerHour} min="0" />
                      <Form.Control.Feedback type="invalid">{errors.chargePerHour}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col sm={4}>
                    <Form.Group>
                      <Form.Label>Min Charge (₹)</Form.Label>
                      <Form.Control type="number" name="minCharge" value={values.minCharge} onChange={handleChange} min="0" />
                    </Form.Group>
                  </Col>
                  <Col sm={4}>
                    <Form.Group>
                      <Form.Label>Experience (yrs)</Form.Label>
                      <Form.Control type="number" name="experience" value={values.experience} onChange={handleChange} min="0" />
                    </Form.Group>
                  </Col>
                  <Col sm={6}>
                    <Form.Group>
                      <Form.Label>Availability</Form.Label>
                      <Form.Select name="availability" value={values.availability} onChange={handleChange}>
                        <option value="available">Available</option>
                        <option value="busy">Busy</option>
                        <option value="unavailable">Unavailable</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col sm={6}>
                    <Form.Group>
                      <Form.Label>Image URL</Form.Label>
                      <Form.Control name="imageUrl" value={values.imageUrl} onChange={handleChange} onBlur={handleBlur} isInvalid={touched.imageUrl && !!errors.imageUrl} placeholder="https://..." />
                      <Form.Control.Feedback type="invalid">{errors.imageUrl}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label>Description</Form.Label>
                      <Form.Control as="textarea" rows={2} name="description" value={values.description} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                </Row>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={close}>Cancel</Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal>
    </Container>
  );
}

import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Modal, Form, Badge, Spinner } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../api/categoryApi';
import { toast } from 'react-toastify';

const schema = Yup.object({
  name:        Yup.string().min(2).required('Required'),
  description: Yup.string(),
  imageUrl:    Yup.string().url('Must be valid URL'),
});

export default function ManageCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [modal, setModal]           = useState({ show: false, data: null });

  const load = () => {
    getAllCategories()
      .then(res => setCategories(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd  = () => setModal({ show: true, data: null });
  const openEdit = (cat) => setModal({ show: true, data: cat });
  const close    = () => setModal({ show: false, data: null });

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this category?')) return;
    try {
      await deleteCategory(id);
      toast.success('Category deactivated');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">Manage Categories</h3>
        <Button variant="primary" onClick={openAdd}>+ Add Category</Button>
      </div>

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
      ) : (
        <Table responsive hover className="shadow-sm">
          <thead className="table-dark">
            <tr><th>#</th><th>Name</th><th>Description</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {categories.map((cat, i) => (
              <tr key={cat._id}>
                <td>{i + 1}</td>
                <td>{cat.name}</td>
                <td className="text-muted small">{cat.description || '—'}</td>
                <td><Badge bg={cat.isActive ? 'success' : 'secondary'}>{cat.isActive ? 'Active' : 'Inactive'}</Badge></td>
                <td>
                  <Button size="sm" variant="outline-primary" className="me-2" onClick={() => openEdit(cat)}>Edit</Button>
                  <Button size="sm" variant="outline-danger" onClick={() => handleDeactivate(cat._id)}>Deactivate</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={modal.show} onHide={close}>
        <Modal.Header closeButton>
          <Modal.Title>{modal.data ? 'Edit Category' : 'Add Category'}</Modal.Title>
        </Modal.Header>
        <Formik
          enableReinitialize
          initialValues={{ name: modal.data?.name || '', description: modal.data?.description || '', imageUrl: modal.data?.imageUrl || '' }}
          validationSchema={schema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              if (modal.data) {
                await updateCategory(modal.data._id, values);
                toast.success('Category updated');
              } else {
                await createCategory(values);
                toast.success('Category created');
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
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    name="name" value={values.name} onChange={handleChange} onBlur={handleBlur}
                    isInvalid={touched.name && !!errors.name}
                  />
                  <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control as="textarea" rows={2} name="description" value={values.description} onChange={handleChange} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Image URL</Form.Label>
                  <Form.Control
                    name="imageUrl" value={values.imageUrl} onChange={handleChange} onBlur={handleBlur}
                    isInvalid={touched.imageUrl && !!errors.imageUrl}
                    placeholder="https://..."
                  />
                  <Form.Control.Feedback type="invalid">{errors.imageUrl}</Form.Control.Feedback>
                </Form.Group>
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

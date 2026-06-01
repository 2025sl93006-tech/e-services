import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BSNavbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <BSNavbar bg="primary" variant="dark" expand="lg" sticky="top">
      <Container>
        <BSNavbar.Brand as={Link} to="/" className="fw-bold fs-4">
          e-Services
        </BSNavbar.Brand>
        <BSNavbar.Toggle aria-controls="nav" />
        <BSNavbar.Collapse id="nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/services">Services</Nav.Link>
          </Nav>
          <Nav>
            {!user ? (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            ) : isAdmin() ? (
              <NavDropdown title={`Admin: ${user.name}`} align="end">
                <NavDropdown.Item as={Link} to="/admin">Dashboard</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/admin/categories">Categories</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/admin/providers">Providers</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/admin/orders">Orders</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <NavDropdown title={user.name} align="end">
                <NavDropdown.Item as={Link} to="/user/dashboard">Dashboard</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/user/my-orders">My Orders</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
}

import React from 'react';
import { Container } from 'react-bootstrap';

export default function Footer() {
  return (
    <footer className="bg-dark text-light py-3 mt-auto">
      <Container className="text-center">
        <small>&copy; {new Date().getFullYear()} e-Services. All rights reserved.</small>
      </Container>
    </footer>
  );
}

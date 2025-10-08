/**
 * Home Page Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomePage from '../page';

describe('HomePage', () => {
  it('should render home page', () => {
    render(<HomePage />);
    expect(screen.getByText(/Content Generator/i)).toBeInTheDocument();
  });

  it('should render welcome message', () => {
    render(<HomePage />);
    const heading = screen.getAllByRole('heading')[0];
    expect(heading).toBeInTheDocument();
  });

  it('should have navigation links', () => {
    render(<HomePage />);
    expect(screen.getByText(/Get Started/i)).toBeInTheDocument();
  });
});

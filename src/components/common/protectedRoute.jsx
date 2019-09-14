import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import authService from '../../services/authService';

const protectedRoute = ({ path, component: Component, render, ...rest }) => {
  return (
    <Route
      // path={path}
      {...rest}
      render={props => {
        if (!authService.getCurrentUser()) return <Redirect to="/" />;
        return Component ? <Component {...props} /> : render(props);
      }}
    />
  );
};

export default protectedRoute;

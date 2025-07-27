import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import LoadingSpinner from './LoadingSpinner';

/**
 * LazyLoader Component
 * 
 * A higher-order component that handles lazy loading of components with a loading fallback.
 * This helps reduce the initial bundle size by loading components only when they're needed.
 */
const LazyLoader = ({
  component: LazyComponent,
  fallback = <LoadingSpinner size="md" />,
  ...props
}) => {
  return (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

LazyLoader.propTypes = {
  /**
   * The lazy-loaded component (from React.lazy())
   */
  component: PropTypes.elementType.isRequired,
  
  /**
   * Fallback UI to show while the component is loading
   */
  fallback: PropTypes.node
};

export default LazyLoader;

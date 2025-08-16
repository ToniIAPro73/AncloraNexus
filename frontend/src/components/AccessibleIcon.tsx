import React from 'react';

interface AccessibleIconProps {
  label: string;
  children: React.ReactElement;
}

const AccessibleIcon: React.FC<AccessibleIconProps> = ({ label, children }) => (
  <span role="img" aria-label={label} title={label}>
    {React.cloneElement(children, { 'aria-hidden': true })}
  </span>
);

export default AccessibleIcon;

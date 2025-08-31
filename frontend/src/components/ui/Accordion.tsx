import React from 'react';
type Props = { items?: any; defaultOpen?: string[]; allowMultiple?: boolean; className?: string; children?: React.ReactNode };
export const Accordion: React.FC<Props> = ({ children, className='' }) => (
  <div className={className}>{children}</div>
);


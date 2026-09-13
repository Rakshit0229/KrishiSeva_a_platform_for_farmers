import React from 'react';
import { isSafeUrl } from '../../utils/sanitize';

export interface SafeLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  fallbackHref?: string;
  children: React.ReactNode;
}

/**
 * SafeLink: Framework-level security component for links
 * - Validates href protocol against XSS schemes (e.g. javascript:, data:)
 * - Automatically injects rel="noopener noreferrer" for new window tabs
 * - Prevents reverse tabnabbing attacks
 */
export const SafeLink: React.FC<SafeLinkProps> = ({
  href,
  fallbackHref = '#',
  target,
  rel,
  children,
  ...rest
}) => {
  const safe = isSafeUrl(href);
  const resolvedHref = safe ? href : fallbackHref;

  // Enforce secure rel when opening in a new window/tab
  let resolvedRel = rel;
  if (target === '_blank') {
    const existing = (rel || '').split(' ').filter(Boolean);
    if (!existing.includes('noopener')) existing.push('noopener');
    if (!existing.includes('noreferrer')) existing.push('noreferrer');
    resolvedRel = existing.join(' ');
  }

  return (
    <a
      href={resolvedHref}
      target={target}
      rel={resolvedRel}
      {...rest}
    >
      {children}
    </a>
  );
};

import { Link, NavLink, useInRouterContext } from 'react-router-dom';

// Renders router links inside a <Router>, plain anchors outside one
// (so components can be mounted on their own, e.g. in unit tests).
export const SafeLink = ({ to, children, ...rest }) => {
  const inRouter = useInRouterContext();
  return inRouter ? (
    <Link to={to} {...rest}>{children}</Link>
  ) : (
    <a href={to} {...rest}>{children}</a>
  );
};

export const SafeNavLink = ({ to, children, ...rest }) => {
  const inRouter = useInRouterContext();
  return inRouter ? (
    <NavLink to={to} className={({ isActive }) => (isActive ? 'active' : undefined)} {...rest}>{children}</NavLink>
  ) : (
    <a href={to} {...rest}>{children}</a>
  );
};

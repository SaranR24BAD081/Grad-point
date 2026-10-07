import { glassCardStyle } from '../styles/styles';

const GlassCard = ({ children, className = '', style = {}, ...rest }) => (
  <section className={`glass-card ${className}`.trim()} style={{ ...glassCardStyle, ...style }} {...rest}>
    {children}
  </section>
);

export default GlassCard;

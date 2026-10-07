const ErrorHandler = ({ error }) => {
  if (!error) return null;
  return (
    <div data-testid="error-handler" className="error-handler" role="alert">
      {error}
    </div>
  );
};

export default ErrorHandler;

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * useFetch(fetchFn) -> { data, loading, error, refetch }
 * fetchFn is an async function; it receives an AbortSignal so axios/fetch calls
 * can be cancelled. Results that arrive after unmount are ignored.
 */
const useFetch = (fetchFn, deps = []) => {
  const fnRef = useRef(fetchFn);
  fnRef.current = fetchFn;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setLoading(true);
    setError(null);

    Promise.resolve()
      .then(() => fnRef.current(controller.signal))
      .then((result) => {
        if (active) setData(result);
      })
      .catch((err) => {
        if (active && !(err && err.name === 'CanceledError')) setError(err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, ...deps]);

  const refetch = useCallback(() => setVersion((v) => v + 1), []);

  return { data, loading, error, refetch };
};

export default useFetch;

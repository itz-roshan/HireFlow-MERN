import { useCallback, useEffect, useState } from 'react';
export function useFetch(fn, deps = []) {
    const [data, setData] = useState(null), [loading, setLoading] = useState(true), [error, setError] = useState('');
    const reload = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const r = await fn();
            setData(r.data.data);
        }
        catch (e) {
            setError(e.response?.data?.message || 'Unable to load data');
        }
        finally {
            setLoading(false);
        }
    }, deps);
    useEffect(() => {
        reload();
    }, [reload]);
    return { data, loading, error, reload, setData };
}

import { useState } from 'react';

export const useErrorHandler = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsync = async (asyncFunction) => {
    try {
      setLoading(true);
      setError('');
      const result = await asyncFunction();
      return result;
    } catch (err) {
      setError(err.message || 'Une erreur est survenue');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError('');

  return {
    error,
    loading,
    handleAsync,
    clearError,
    setError,
    setLoading
  };
};
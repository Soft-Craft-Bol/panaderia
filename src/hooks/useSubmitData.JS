import { useState } from 'react';

const useSubmitData = (submitFunction) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const submitData = async (data) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await submitFunction(data);
      setSuccess(true);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, success, submitData };
};

export default useSubmitData;

import { useState, useEffect } from 'react';

export const useExchangeRate = () => {
  const [exchangeRate, setExchangeRate] = useState(0.85); // Default rate
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isManuallySet, setIsManuallySet] = useState(false);

  const fetchExchangeRate = async () => {
    setIsLoading(true);
    try {
      // Using a free exchange rate API
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();
      const rate = data.rates.EUR;
      
      if (rate) {
        setExchangeRate(rate);
        setLastUpdated(new Date());
        setIsManuallySet(false);
      }
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error);
      // Keep the current rate if fetch fails
    } finally {
      setIsLoading(false);
    }
  };

  const updateExchangeRateManually = (rate: number) => {
    setExchangeRate(rate);
    setIsManuallySet(true);
    setLastUpdated(new Date());
  };

  // Fetch rate on component mount
  useEffect(() => {
    fetchExchangeRate();
  }, []);

  return {
    exchangeRate,
    isLoading,
    lastUpdated,
    isManuallySet,
    fetchExchangeRate,
    updateExchangeRateManually,
  };
};

import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';

const  useDebounce = (value, delay) => {

    const [debounceValue, setDebounceValue] = useState('');

    useEffect(() => {
     const timer = setTimeout(() => {
        setDebounceValue(value)
     }, delay)

     return () => {
       clearTimeout(timer);
     };

    }, [value]);

  return debounceValue;
}

export default useDebounce;
import { useState } from 'react'
import AutoComplete from './components/Autocomplete'
import './App.css'
import { useRef } from 'react';
function App() {
  const myRef = useRef(null);

  return (
    <div ref= {myRef}>
      <div>React machine round Questions</div>
      <AutoComplete myRef={myRef} />
    </div>
  )
}

export default App

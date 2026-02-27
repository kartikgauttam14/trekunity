import React, { useEffect, useRef, useState } from 'react';

const LocationAutocomplete = ({ placeholder, onSelect, value, onChange }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [show, setShow] = useState(false);

    // For a production app, these should be fetched from Google Places API or a database
    const cities = [];

    const handleInput = (e) => {
        const val = e.target.value;
        onChange(val);
        if (val.length > 2) {
            const filtered = cities.filter(c => c.toLowerCase().includes(val.toLowerCase()));
            setSuggestions(filtered);
            setShow(true);
        } else {
            setShow(false);
        }
    };

    const handleSelect = (city) => {
        onSelect(city);
        setShow(false);
    };

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={handleInput}
                onBlur={() => setTimeout(() => setShow(false), 200)}
                style={{ width: '100%' }}
            />
            {show && suggestions.length > 0 && (
                <ul style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    listStyle: 'none',
                    padding: '0.5rem 0',
                    margin: '0.5rem 0 0',
                    zIndex: 1000,
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                }}>
                    {suggestions.map((s, i) => (
                        <li
                            key={i}
                            onClick={() => handleSelect(s)}
                            style={{
                                padding: '0.5rem 1rem',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.background = '#f3f4f6'}
                            onMouseOut={(e) => e.target.style.background = 'transparent'}
                        >
                            {s}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default LocationAutocomplete;

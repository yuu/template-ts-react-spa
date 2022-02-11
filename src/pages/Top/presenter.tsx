import React from 'react';
import { Link } from 'react-router-dom';

const Top = () => {
    console.log('foo');
    return (
        <div>
            <h1>Hello TypeScript</h1>
            <Link to="/about">to about</Link>
        </div>
    );
};

export default Top;

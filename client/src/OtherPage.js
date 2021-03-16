import React from 'react';
import { Link } from 'react-router-dom';

// eslint-disable-next-line
export default () => {
	return (
		<div>
			Im in some other page
			<Link to="/">back home</Link>
		</div>
	);
};

import { Top } from './Top';
import { About } from './About';

export const routes = [
    {
        path: '/',
        exact: true,
        main: Top,
    },
    {
        path: '/about',
        exact: true,
        main: About,
    },
];

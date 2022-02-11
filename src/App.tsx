import React, { FC, Suspense } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { routes } from '@/pages';

const App: FC = () => {
    return (
        <Suspense fallback="loading...">
            <Router>
                <Switch>
                    {routes.map(({ exact, path, main: Component }) => (
                        <Route
                            key={path}
                            exact={exact}
                            path={path}
                            render={() => <Component />}
                        />
                    ))}

                    <Route path="*" render={() => <div>404</div>} />
                </Switch>
            </Router>
        </Suspense>
    );
};

export default App;

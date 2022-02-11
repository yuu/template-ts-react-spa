import React, { FC } from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';

const App: FC = () => {
    return (
        <Router>
            <Switch>
                <Route exact path="/">
                    <div>
                        <h1>Hello TypeScript</h1>
                        <Link to="/about">to about</Link>
                    </div>
                </Route>
                <Route path="/about">
                    <div>
                        <h1>About</h1>
                        <Link to="/">go top</Link>
                    </div>
                </Route>
            </Switch>
        </Router>
    );
};

export default App;

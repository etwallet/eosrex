import dva from 'dva';
import createLoading from 'dva-loading';
import createHistory from 'history/createBrowserHistory';
import registerServiceWorker from './registerServiceWorker';
import './index.css';

const app = dva({
    history: createHistory(),
    onError(e) {
        console.log(e);
    },
});

app.use(createLoading());

app.router(require('./router').default);

app.start('#root');

registerServiceWorker();



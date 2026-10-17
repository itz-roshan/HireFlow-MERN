import Spinner from './Spinner';
export default function PageLoader({ label = 'Loading' }) {
    return (<div className="page-loader">
        <Spinner />
        <span>
            {label}
        </span>
    </div>);
}

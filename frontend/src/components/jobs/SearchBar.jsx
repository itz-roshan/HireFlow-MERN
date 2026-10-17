import { Search, MapPin } from 'lucide-react';
export default function SearchBar({ search, setSearch, location, setLocation, onSearch }) {
    return (<form className="searchbar" onSubmit={e => {
            e.preventDefault();
            onSearch();
        }}>
        <div>
            <Search size={19}/>
            <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Job title, skill or keyword"
            />
        </div>
        <div>
            <MapPin size={19}/>
            <input value={location} onChange={e => setLocation(e.target.value)} placeholder="City or remote"/>
        </div>
        <button className="btn btn-dark">Search jobs</button>
    </form>);
}

import { Link } from 'react-router-dom';

function Navigation() {
  return (
    <nav>
      {/* Use relative paths without leading slashes */}
      <Link to="/">Home</Link>
      <Link to="add-service">Add AMC</Link>
      <Link to="search-services">Search Services</Link>
      {/* ...other links... */}
    </nav>
  );
}

export default Navigation;

import './component-a.css';

function ComponentA({ label = 'Component A' }) {
  return <div className="component-a">{label}</div>;
}

export default ComponentA;

import ComponentA from '../../components/component-a/component-a';
import ComponentB from '../../components/component-b/component-b';
import './landing.css';

function Landing() {
  return (
    <main className="landing">
      <h1>BoletoClick</h1>
      <ComponentA label="Landing page" />
      <ComponentB>
        <p>Frontend CRA boilerplate listo.</p>
      </ComponentB>
    </main>
  );
}

export default Landing;


import Stage from 'modules/workspace/components/Stage';
import ShapesProvider from 'modules/workspace/providers/ShapesProvider';
import WorkspaceProvider from 'modules/workspace/providers/WorkspaceProvider';

const App = () => (
  <WorkspaceProvider>
    <ShapesProvider>
      <div className="App" style={{ backgroundColor: 'moccasin', display: "flex", flexDirection: 'column', justifyContent: "center", alignItems: 'center' }}>
        <Stage />
      </div>
    </ShapesProvider>
  </WorkspaceProvider>
);

export default App;

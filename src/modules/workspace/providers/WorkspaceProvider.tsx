import { createContext, ReactNode, useContext, useRef } from "react";
import { Layer as LayerType } from 'konva/lib/Layer';
import { Stage as StageType } from 'konva/lib/Stage';

export type WorkspaceContextType = {
  stage: React.RefObject<StageType>;
  layer: React.RefObject<LayerType>;
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  stage: { current: null },
  layer: { current: null },
});

interface IProps {
  children: ReactNode;
}

const WorkspaceProvider = ({ children }: IProps) => {
  const stage = useRef<StageType>(null);
  const layer = useRef<LayerType>(null);

  return (
    <WorkspaceContext.Provider value={{ stage, layer }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export default WorkspaceProvider;

export const useWorkspace = () => useContext(WorkspaceContext);

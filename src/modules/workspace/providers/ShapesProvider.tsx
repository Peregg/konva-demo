import { createContext, ReactNode, useContext, useState } from "react";

import { IShape } from "modules/workspace/types/shapes";

type ShapeContextType = {
  shapes: IShape[];
  setShapes: React.Dispatch<React.SetStateAction<IShape[]>>;
}

const ShapeContext = createContext<ShapeContextType>({
  shapes: [],
  setShapes: () => undefined,
});

interface IProps {
  children: ReactNode;
}

const ShapeProvider = ({ children }: IProps) => {
  const [shapes, setShapes] = useState<IShape[]>([]);

  return (
    <ShapeContext.Provider value={{ shapes, setShapes }}>
      {children}
    </ShapeContext.Provider>
  );
};

export default ShapeProvider;

export const useShapes = () => useContext(ShapeContext);

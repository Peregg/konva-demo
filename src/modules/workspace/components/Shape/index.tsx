import { Rect, Transformer } from 'react-konva';
import { useEffect, useRef } from 'react';
import { KonvaEventObject } from 'konva/lib/Node';
import { Rect as RectType } from 'konva/lib/shapes/Rect';
import { Transformer as TransformerType } from 'konva/lib/shapes/Transformer';

import { IShape } from 'modules/workspace/types/shapes';

interface IProps extends IShape {
  onDragMove: (e: KonvaEventObject<DragEvent>) => void;
  onDragEnd: (e: KonvaEventObject<DragEvent>) => void;
  selectNode: (id: string) => () => void;
}

const Shape = (props: IProps) => {
  const rectRef = useRef<RectType>(null);
  const trRef = useRef<TransformerType>(null);

  useEffect(() => {
    if (trRef.current) {
      // we need to attach transformer manually
      trRef.current.setNode(rectRef.current);
      trRef.current?.getLayer()?.batchDraw();
    }
  }, [props.isSelected]);

  return (
    <>
      <Rect
        ref={rectRef}
        {...props}
        draggable={props.isSelected}
        onDblClick={props.selectNode(props.id)} />
      {props.isSelected && (
        <Transformer ref={trRef} rotateEnabled={false} />
      )}
    </>
  );
};

export default Shape;

import Konva from 'konva';
import { v4 as uuid } from 'uuid';
import { useCallback, useMemo } from 'react';
import { Layer, Stage as KonvaStage } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';

import Shape from 'modules/workspace/components/Shape';
import { useShapes } from 'modules/workspace/providers/ShapesProvider';
import { useWorkspace } from 'modules/workspace/providers/WorkspaceProvider';
import { drawGuides, getGuides, getLineGuideStops, getObjectSnappingEdges } from 'modules/workspace/utils/guides';

const Stage = () => {
  const { shapes, setShapes } = useShapes();
  const { stage, layer } = useWorkspace();

  const onDragBox = useCallback((e: KonvaEventObject<DragEvent>) => {
    console.log({e},'kokokos');
    const {x, y} = e.target.absolutePosition();
    layer.current?.find('.guid-line-block').forEach((l) => l.destroy());

    const leftLine = new Konva.Line({
      points: [0, -6000, 0, 6000],
      stroke: 'rgb(0, 161, 255)',
      strokeWidth: 1,
      name: 'guid-line-block',
      dash: [4, 6],
    });
    const rightLine = new Konva.Line({
      points: [0, -6000, 0, 6000],
      stroke: 'rgb(0, 161, 255)',
      strokeWidth: 1,
      name: 'guid-line-block',
      dash: [4, 6],
    });
    layer.current?.add(rightLine);
    layer.current?.add(leftLine);

    console.log(e.target.attrs.width);

    leftLine.absolutePosition({
      x,
      y,
    });
    rightLine.absolutePosition({
      x: x + e.target.attrs.width * e.target.attrs.scaleX,
      y,
    });
  }, [layer]);

  const handleClickOnLayer = (event: KonvaEventObject<MouseEvent>) => {
    const targetShapeId = event.target.attrs.id;
    if (shapes.map(shape => shape.id).includes(targetShapeId)) {
      setShapes(prev => {
        const index = prev.findIndex(prev => prev.id === targetShapeId);

        const shapes = [...prev.map(shape => ({ ...shape, isSelected: false }))];

        shapes.splice(index, 1, {
          ...prev[index],
          isSelected: true,
        });


        return shapes;
      });
    }
    setShapes(prev => prev.map(shape => ({ ...shape, isSelected: false })));
  }

  const onDragBoxEnd = useCallback((id: string) => (e: KonvaEventObject<DragEvent>) => {
    layer.current?.find('.guid-line-block').forEach((l) => l.destroy());
    setShapes(prev => {
      const index = prev.findIndex(prev => prev.id === id);

      const shapes = [...prev];
      shapes.splice(index, 1, {
        ...prev[index],
        x: e.target.attrs.x,
        y: e.target.attrs.y,
        height: e.target.attrs.height,
        width: e.target.attrs.width,
      });
      console.log({ shapes })
      return shapes;
    });
  }, [layer, setShapes]);

  const selectNode = useCallback((id: string) => () => {
    console.log('triggered')
    setShapes(prev => {
      const index = prev.findIndex(prev => prev.id === id);

      const shapes = [...prev];
      shapes.splice(index, 1, {
        ...prev[index],
        isSelected: true,
      });
      console.log({ shapes })
      return shapes;
    });
  }, [setShapes]);

  const renderShapes = useMemo(() => shapes.map(shape => (
    <Shape {...shape} onDragMove={onDragBox} onDragEnd={onDragBoxEnd(shape.id)} selectNode={selectNode} />
  )), [onDragBox, onDragBoxEnd, selectNode, shapes]);

  const addShape = () => {
    setShapes((prev) => ([
      ...prev.map((s) => ({ ...s, isSelected: false })),
      {
        id: uuid(),
        fill: Konva.Util.getRandomColor(),
        width: 100,
        height: 100,
        x: 0,
        y: 0,
        name: 'object',
        isSelected: true,
      }
    ]));
  }

  const onDragEnd = () => {
    layer.current?.find('.guid-line').forEach((l) => l.destroy());
  }


  const onDragMove = (e: KonvaEventObject<DragEvent>) => {
    // clear all previous lines on the screen
    layer.current?.find('.guid-line').forEach((l) => l.destroy());

    // find possible snapping lines
    const lineGuideStops = getLineGuideStops(e.target, stage);

    // find snapping points of current object
    const itemBounds = getObjectSnappingEdges(e.target);

    // now find where can we snap current object
    const guides = getGuides(lineGuideStops, itemBounds);

    // do nothing of no snapping
    if (!guides.length) {
      return;
    }

    drawGuides(guides, layer);

    const absPos = e.target.absolutePosition();
    // now force object position

    guides.forEach((lg) => {
      switch (lg.snap) {
        case 'start': {
          switch (lg.orientation) {
            case 'V': {
              absPos.x = lg.lineGuide + lg.offset;
              break;
            }
            case 'H': {
              absPos.y = lg.lineGuide + lg.offset;
              break;
            }
            default:
              break;
          }
          break;
        }
        case 'center': {
          switch (lg.orientation) {
            case 'V': {
              absPos.x = lg.lineGuide + lg.offset;
              break;
            }
            case 'H': {
              absPos.y = lg.lineGuide + lg.offset;
              break;
            }
            default:
              break;
          }
          break;
        }
        case 'end': {
          switch (lg.orientation) {
            case 'V': {
              absPos.x = lg.lineGuide + lg.offset;
              break;
            }
            case 'H': {
              absPos.y = lg.lineGuide + lg.offset;
              break;
            }
            default:
              break;
          }
          break;
        }
        default:
          break;
      }
    });
    e.target.absolutePosition(absPos);
  }


  return (
    <>
      <button style={{ width: '100px', alignSelf: 'flex-start' }} onClick={addShape}>
        Add shape
      </button>
      <KonvaStage
        style={{ backgroundColor: 'white' }}
        ref={stage}
        width={window.innerWidth * 0.8}
        onClick={handleClickOnLayer}
        height={window.innerHeight}>
          <Layer ref={layer} onDragMove={onDragMove} onDragEnd={onDragEnd}>
            {renderShapes}
          </Layer>
      </KonvaStage>
    </>
  );
};

export default Stage;

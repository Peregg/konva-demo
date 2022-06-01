import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';

import { WorkspaceContextType } from 'modules/workspace/providers/WorkspaceProvider';

const GUIDELINE_OFFSET = 5;

export const getLineGuideStops = (skipShape: KonvaEventObject<DragEvent>['target'], stage: WorkspaceContextType['stage']) => {
  // we can snap to stage borders and the center of the stage
  const vertical: (number | number[])[] = [0, (stage.current?.width() ?? 0) / 2, (stage.current?.width() ?? 0)];
  const horizontal: (number | number[])[] = [0, (stage.current?.height() ?? 0) / 2, (stage.current?.height() ?? 0)];

  console.log(stage.current?.find('.object'), 'kokok');

  // and we snap over edges and center of each object on the canvas
  stage.current?.find('.object').forEach((guideItem) => {
    if (guideItem === skipShape) {
      return;
    }
    var box = guideItem.getClientRect();
    // and we can snap to all edges of shapes
    vertical.push([box.x, box.x + box.width, box.x + box.width / 2]);
    horizontal.push([box.y, box.y + box.height, box.y + box.height / 2]);
  });
  return {
    vertical: vertical.flat(),
    horizontal: horizontal.flat(),
  };
}

// what points of the object will trigger to snapping?
// it can be just center of the object
// but we will enable all edges and center
export const getObjectSnappingEdges = (node: KonvaEventObject<DragEvent>['target']) => {
  var box = node.getClientRect();
  var absPos = node.absolutePosition();

  return {
    vertical: [
      {
        guide: Math.round(box.x),
        offset: Math.round(absPos.x - box.x),
        snap: 'start',
      },
      {
        guide: Math.round(box.x + box.width / 2),
        offset: Math.round(absPos.x - box.x - box.width / 2),
        snap: 'center',
      },
      {
        guide: Math.round(box.x + box.width),
        offset: Math.round(absPos.x - box.x - box.width),
        snap: 'end',
      },
    ],
    horizontal: [
      {
        guide: Math.round(box.y),
        offset: Math.round(absPos.y - box.y),
        snap: 'start',
      },
      {
        guide: Math.round(box.y + box.height / 2),
        offset: Math.round(absPos.y - box.y - box.height / 2),
        snap: 'center',
      },
      {
        guide: Math.round(box.y + box.height),
        offset: Math.round(absPos.y - box.y - box.height),
        snap: 'end',
      },
    ],
  };
}

type Guide = {
  lineGuide: number;
  snap: string;
  orientation?: string;
  diff?: number;
  offset: number;
}

// find all snapping possibilities
export const getGuides = (lineGuideStops: {
  vertical: number[];
  horizontal: number[];
}, itemBounds: {
vertical: {
    guide: number;
    offset: number;
    snap: string;
}[];
horizontal: {
    guide: number;
    offset: number;
    snap: string;
}[];
}) => {
  const resultV: Guide[] = [];
  const resultH: Guide[] = [];

  lineGuideStops.vertical.forEach((lineGuide) => {
    itemBounds.vertical.forEach((itemBound) => {
      var diff = Math.abs(lineGuide - itemBound.guide);
      // if the distance between guild line and object snap point is close we can consider this for snapping
      if (diff < GUIDELINE_OFFSET) {
        resultV.push({
          lineGuide: lineGuide,
          diff: diff,
          snap: itemBound.snap,
          offset: itemBound.offset,
        });
      }
    });
  });

  lineGuideStops.horizontal.forEach((lineGuide) => {
    itemBounds.horizontal.forEach((itemBound) => {
      var diff = Math.abs(lineGuide - itemBound.guide);
      if (diff < GUIDELINE_OFFSET) {
        resultH.push({
          lineGuide: lineGuide,
          diff: diff,
          snap: itemBound.snap,
          offset: itemBound.offset,
        });
      }
    });
  });

  var guides = [];

  // find closest snap
  var minV = resultV.sort((a, b) => (a.diff ?? 0) - (b.diff ?? 0))[0];
  var minH = resultH.sort((a, b) => (a.diff ?? 0) - (b.diff ?? 0))[0];
  if (minV) {
    guides.push({
      lineGuide: minV.lineGuide,
      offset: minV.offset,
      orientation: 'V',
      snap: minV.snap,
    });
  }
  if (minH) {
    guides.push({
      lineGuide: minH.lineGuide,
      offset: minH.offset,
      orientation: 'H',
      snap: minH.snap,
    });
  }
  return guides;
}

export const drawGuides = (guides: Guide[], layer: WorkspaceContextType['layer']) => {
  guides.forEach((lg) => {
    let line;
    if (lg.orientation === 'H') {
      line = new Konva.Line({
        points: [-6000, 0, 6000, 0],
        stroke: 'rgb(0, 161, 255)',
        strokeWidth: 1,
        name: 'guid-line',
        dash: [4, 6],
      });
      layer.current?.add(line);
      line.absolutePosition({
        x: 0,
        y: lg.lineGuide,
      });
    } else if (lg.orientation === 'V') {
      line = new Konva.Line({
        points: [0, -6000, 0, 6000],
        stroke: 'rgb(0, 161, 255)',
        strokeWidth: 1,
        name: 'guid-line',
        dash: [4, 6],
      });
      layer.current?.add(line);
      line.absolutePosition({
        x: lg.lineGuide,
        y: 0,
      });
    }
  });
}

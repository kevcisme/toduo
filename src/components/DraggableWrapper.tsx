import React from 'react';
import { Draggable as OriginalDraggable } from 'react-beautiful-dnd';

// This wrapper component fixes the defaultProps warning in react-beautiful-dnd
// when used with React 18
const DraggableWrapper: React.FC<React.ComponentProps<typeof OriginalDraggable>> = (props) => {
  return <OriginalDraggable {...props} />;
};

export default DraggableWrapper; 
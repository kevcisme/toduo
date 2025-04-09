import React from 'react';
import { Droppable as OriginalDroppable } from 'react-beautiful-dnd';

// This wrapper component fixes the defaultProps warning in react-beautiful-dnd
// when used with React 18
const DroppableWrapper: React.FC<React.ComponentProps<typeof OriginalDroppable>> = (props) => {
  return <OriginalDroppable {...props} />;
};

export default DroppableWrapper; 
import React from 'react';
import { DragDropContext as OriginalDragDropContext } from 'react-beautiful-dnd';

// This wrapper component fixes the defaultProps warning in react-beautiful-dnd
// when used with React 18
const DragDropContextWrapper: React.FC<React.ComponentProps<typeof OriginalDragDropContext>> = (props) => {
  return <OriginalDragDropContext {...props} />;
};

export default DragDropContextWrapper; 
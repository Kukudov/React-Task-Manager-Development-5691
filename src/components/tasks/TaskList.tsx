import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Task, Category } from '@/types';
import TaskItem from './TaskItem';
import SafeIcon from '@/common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiInbox } = FiIcons;

interface TaskListProps {
  tasks: Task[];
  categories: Category[];
  onToggle: (id: string, completed: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onReorder?: (tasks: Task[]) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  categories,
  onToggle,
  onEdit,
  onDelete,
  onReorder
}) => {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !onReorder) return;

    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onReorder(items);
  };

  const getTaskCategory = (task: Task): Category | undefined => {
    return categories.find(cat => cat.id === task.categoryId);
  };

  if (tasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="w-16 h-16 bg-dark-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <SafeIcon icon={FiInbox} className="w-8 h-8 text-dark-400" />
        </div>
        <h3 className="text-lg font-medium text-dark-300 mb-2">No tasks found</h3>
        <p className="text-dark-400">Create your first task to get started!</p>
      </motion.div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="tasks">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-3"
          >
            <AnimatePresence>
              {tasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        ...provided.draggableProps.style,
                        transform: snapshot.isDragging
                          ? provided.draggableProps.style?.transform
                          : 'none',
                      }}
                      className={snapshot.isDragging ? 'z-10' : ''}
                    >
                      <TaskItem
                        task={task}
                        category={getTaskCategory(task)}
                        onToggle={onToggle}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
            </AnimatePresence>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default TaskList;
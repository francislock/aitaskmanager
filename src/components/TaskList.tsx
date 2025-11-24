import { Task } from '@/types';
import TaskCard from './TaskCard';
import styles from './TaskList.module.css';

interface TaskListProps {
    title: string;
    tasks: Task[];
    onToggleComplete: (taskId: string, completed: boolean) => void;
    onEdit: (taskId: string, newContent: string) => void;
    onDelete: (taskId: string) => void;
    onChangePriority: (taskId: string, priority: 'high' | 'medium' | 'low') => void;
    onSubtaskToggle: (subtaskId: string, completed: boolean) => void;
}

export default function TaskList({ title, tasks, onToggleComplete, onEdit, onDelete, onChangePriority, onSubtaskToggle }: TaskListProps) {
    return (
        <div className={styles.container}>
            {tasks.length === 0 ? (
                <div className={styles.empty}>No tasks in this list</div>
            ) : (
                tasks.map(task => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        onToggleComplete={onToggleComplete}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onChangePriority={onChangePriority}
                        onSubtaskToggle={onSubtaskToggle}
                    />
                ))
            )}
        </div>
    );
}

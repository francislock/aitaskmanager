"use client";

import { useState, useEffect } from 'react';
import { Task, Category, List } from '@/types';
import { AIResponse } from '@/types';
import { supabase } from '@/lib/supabase';
import VoiceInput from '@/components/VoiceInput';
import TaskList from '@/components/TaskList';
import ListHeader from '@/components/ListHeader';
import CreateListButton from '@/components/CreateListButton';
import DraggableList from '@/components/DraggableList';
import DraggableTask from '@/components/DraggableTask';
import DroppableList from '@/components/DroppableList';
import { DndContext, closestCenter, DragEndEvent, DragOverEvent, pointerWithin, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lists, setLists] = useState<List[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [debugError, setDebugError] = useState<string | null>(null);

  // Fetch lists and tasks on load
  useEffect(() => {
    const fetchData = async () => {
      // Fetch lists
      const { data: listsData, error: listsError } = await supabase
        .from('lists')
        .select('*')
        .order('order_index', { ascending: true });

      if (listsError) console.error('Error fetching lists:', listsError);
      if (listsData) setLists(listsData as List[]);

      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          *,
          subtasks (
            id,
            parent_task_id,
            content,
            status,
            order_index,
            created_at
          )
        `)
        .order('order_index', { ascending: true, nullsFirst: false });

      if (tasksError) console.error('Error fetching tasks:', tasksError);
      if (tasksData) setTasks(tasksData as Task[]);
    };

    fetchData();
  }, []);

  const handleCommand = async (command: string) => {
    console.log("🎤 Received command:", command);
    setDebugError(null); // Clear any previous errors
    setIsProcessing(true);
    try {
      console.log("🤖 Sending to AI Engine (API Route)...");
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command,
          lists: lists.map(l => ({ id: l.id, name: l.name, emoji: l.emoji }))
        }),
      });

      if (!res.ok) throw new Error('Failed to fetch from AI API');

      const response: AIResponse = await res.json();
      console.log("🤖 AI Response:", JSON.stringify(response, null, 2));

      if (response.message) {
        setDebugError(response.message);
      } else {
        setDebugError(null);
      }

      if (response.intent === 'create_task' && response.tasks) {
        // Prepare tasks for insertion
        const tasksToInsert = response.tasks.map(t => {
          // If we have list_id, use it. Otherwise fall back to list_category
          const taskData: any = {
            content: t.content!,
            status: 'pending',
            suggested_due_date: t.suggested_due_date,
            priority: t.priority || 'medium'
          };

          // Prioritize list_id if available
          if (t.list_id) {
            taskData.list_id = t.list_id;
            // Set a default list_category to satisfy NOT NULL constraint
            taskData.list_category = 'quick_ideas';
          } else if (t.list_category) {
            taskData.list_category = t.list_category;
            // Try to find matching list_id from category
            const matchingList = lists.find(l =>
              l.name.toLowerCase().includes(t.list_category?.replace('_', ' ').toLowerCase() || '')
            );
            if (matchingList) {
              taskData.list_id = matchingList.id;
            }
          } else {
            // No list info provided, use default
            const defaultList = lists.find(l => l.name === 'Quick Ideas') || lists[0];
            if (defaultList) {
              taskData.list_id = defaultList.id;
              taskData.list_category = 'quick_ideas';
            }
          }

          return taskData;
        });

        console.log("💾 Inserting into Supabase:", tasksToInsert);

        // Insert into Supabase
        const { data, error } = await supabase
          .from('tasks')
          .insert(tasksToInsert)
          .select();

        if (error) {
          console.error("❌ Supabase Insert Error:", error);
          throw error;
        }

        console.log("✅ Supabase Insert Success:", data);

        // Insert subtasks if any
        if (data && response.tasks) {
          for (let i = 0; i < data.length; i++) {
            const task = data[i];
            const originalTask = response.tasks[i];

            if (originalTask.subtasks && originalTask.subtasks.length > 0) {
              const subtasksToInsert = originalTask.subtasks.map((st, index) => ({
                parent_task_id: task.id,
                content: st.content!,
                status: 'pending',
                order_index: index
              }));

              const { data: subtasksData, error: subtasksError } = await supabase
                .from('subtasks')
                .insert(subtasksToInsert)
                .select();

              if (subtasksError) {
                console.error("❌ Subtasks Insert Error:", subtasksError);
              } else {
                console.log("✅ Subtasks Inserted:", subtasksData);
                // Attach subtasks to the task
                task.subtasks = subtasksData;
              }
            }
          }
        }

        // Update local state with returned data (includes generated IDs)
        if (data) {
          setTasks(prev => [...prev, ...data as Task[]]);
        }
      } else {
        console.log("⚠️ Intent was not create_task or no tasks found.");
      }
    } catch (error: any) {
      console.error("🚨 Processing Error:", error);
      setDebugError(error.message || JSON.stringify(error));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    try {
      const newStatus = completed ? 'completed' : 'pending';
      const completed_at = completed ? new Date().toISOString() : null;

      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus, completed_at })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, status: newStatus, completed_at: completed_at || undefined } : t
      ));
    } catch (error: any) {
      console.error("Toggle Complete Error:", error);
      setDebugError(error.message);
    }
  };

  const handleEditTask = async (taskId: string, newContent: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ content: newContent })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, content: newContent } : t
      ));
    } catch (error: any) {
      console.error("Edit Task Error:", error);
      setDebugError(error.message);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (error: any) {
      console.error("Delete Task Error:", error);
      setDebugError(error.message);
    }
  };

  const handleChangePriority = async (taskId: string, priority: 'high' | 'medium' | 'low') => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ priority })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, priority } : t
      ));
    } catch (error: any) {
      console.error("Change Priority Error:", error);
      setDebugError(error.message);
    }
  };

  const handleSubtaskToggle = async (subtaskId: string, completed: boolean) => {
    try {
      const newStatus = completed ? 'completed' : 'pending';

      const { error } = await supabase
        .from('subtasks')
        .update({ status: newStatus })
        .eq('id', subtaskId);

      if (error) throw error;

      // Update local state
      setTasks(prev => prev.map(task => ({
        ...task,
        subtasks: task.subtasks?.map(st =>
          st.id === subtaskId ? { ...st, status: newStatus } : st
        )
      })));
    } catch (error: any) {
      console.error("Subtask Toggle Error:", error);
      setDebugError(error.message);
    }
  };

  // List Management Handlers
  const handleCreateList = async (name: string, emoji: string) => {
    try {
      const { data, error } = await supabase
        .from('lists')
        .insert({
          name,
          emoji,
          order_index: lists.length + 1,
          is_default: false
        })
        .select()
        .single();

      if (error) throw error;
      if (data) setLists([...lists, data as List]);
    } catch (error: any) {
      console.error("Create List Error:", error);
      setDebugError(error.message);
    }
  };

  const handleEditList = async (listId: string, name: string, emoji: string) => {
    try {
      const { error } = await supabase
        .from('lists')
        .update({ name, emoji })
        .eq('id', listId);

      if (error) throw error;

      setLists(lists.map(l =>
        l.id === listId ? { ...l, name, emoji } : l
      ));
    } catch (error: any) {
      console.error("Edit List Error:", error);
      setDebugError(error.message);
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (!confirm('Delete this list? All tasks will be moved to Quick Ideas.')) return;

    try {
      // Find default list to move tasks to
      const defaultList = lists.find(l => l.name === 'Quick Ideas');
      if (!defaultList) throw new Error('Default list not found');

      // Move tasks to default list
      await supabase
        .from('tasks')
        .update({ list_id: defaultList.id })
        .eq('list_id', listId);

      // Delete the list
      const { error } = await supabase
        .from('lists')
        .delete()
        .eq('id', listId);

      if (error) throw error;

      setLists(lists.filter(l => l.id !== listId));

      // Refresh tasks to show updated list_id
      const { data: tasksData } = await supabase
        .from('tasks')
        .select(`
          *,
          subtasks (
            id,
            parent_task_id,
            content,
            status,
            order_index,
            created_at
          )
        `)
        .order('created_at', { ascending: true });

      if (tasksData) setTasks(tasksData as Task[]);
    } catch (error: any) {
      console.error("Delete List Error:", error);
      setDebugError(error.message);
    }
  };

  // Drag & Drop Handlers
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    // Check if dragging a list
    const activeList = lists.find(l => l.id === active.id);
    const overList = lists.find(l => l.id === over.id);

    if (activeList && overList) {
      // Reordering lists
      const oldIndex = lists.findIndex(l => l.id === active.id);
      const newIndex = lists.findIndex(l => l.id === over.id);

      const newLists = arrayMove(lists, oldIndex, newIndex);
      setLists(newLists);

      // Update order_index in database
      try {
        for (let i = 0; i < newLists.length; i++) {
          await supabase
            .from('lists')
            .update({ order_index: i + 1 })
            .eq('id', newLists[i].id);
        }
      } catch (error: any) {
        console.error('Error updating list order:', error);
      }
    } else {
      // Handling tasks
      const activeTask = tasks.find(t => t.id === active.id);
      const overTask = tasks.find(t => t.id === over.id);

      if (!activeTask) return;

      // Check if dropping on a droppable zone (empty list)
      const droppableMatch = String(over.id).match(/^droppable-(.+)$/);
      if (droppableMatch) {
        const targetListId = droppableMatch[1];

        // Move task to empty list
        try {
          await supabase
            .from('tasks')
            .update({
              list_id: targetListId,
              order_index: 1
            })
            .eq('id', activeTask.id);

          // Refresh tasks
          const { data } = await supabase
            .from('tasks')
            .select(`
              *,
              subtasks (
                id,
                parent_task_id,
                content,
                status,
                order_index,
                created_at
              )
            `)
            .order('order_index', { ascending: true, nullsFirst: false });

          if (data) setTasks(data as Task[]);
        } catch (error: any) {
          console.error('Error moving task to empty list:', error);
        }
        return;
      }

      // Check if dropping on another task
      if (overTask) {
        // Same list - reorder
        if (activeTask.list_id === overTask.list_id) {
          const listTasks = tasks.filter(t => t.list_id === activeTask.list_id);
          const oldIndex = listTasks.findIndex(t => t.id === active.id);
          const newIndex = listTasks.findIndex(t => t.id === over.id);

          const reorderedTasks = arrayMove(listTasks, oldIndex, newIndex);

          // Update order_index
          try {
            for (let i = 0; i < reorderedTasks.length; i++) {
              await supabase
                .from('tasks')
                .update({ order_index: i + 1 })
                .eq('id', reorderedTasks[i].id);
            }

            // Refresh tasks
            const { data } = await supabase
              .from('tasks')
              .select(`
                *,
                subtasks (
                  id,
                  parent_task_id,
                  content,
                  status,
                  order_index,
                  created_at
                )
              `)
              .order('order_index', { ascending: true, nullsFirst: false });

            if (data) setTasks(data as Task[]);
          } catch (error: any) {
            console.error('Error reordering tasks:', error);
          }
        } else {
          // Different list - move task
          const newListId = overTask.list_id;
          const targetListTasks = tasks.filter(t => t.list_id === newListId);
          const newOrderIndex = targetListTasks.findIndex(t => t.id === over.id) + 1;

          try {
            // Update task's list_id and order_index
            await supabase
              .from('tasks')
              .update({
                list_id: newListId,
                order_index: newOrderIndex
              })
              .eq('id', activeTask.id);

            // Reorder remaining tasks in target list
            const tasksToReorder = targetListTasks.filter(t => (t.order_index || 0) >= newOrderIndex);
            for (const task of tasksToReorder) {
              await supabase
                .from('tasks')
                .update({ order_index: (task.order_index || 0) + 1 })
                .eq('id', task.id);
            }

            // Refresh tasks
            const { data } = await supabase
              .from('tasks')
              .select(`
                *,
                subtasks (
                  id,
                  parent_task_id,
                  content,
                  status,
                  order_index,
                  created_at
                )
              `)
              .order('order_index', { ascending: true, nullsFirst: false });

            if (data) setTasks(data as Task[]);
          } catch (error: any) {
            console.error('Error moving task between lists:', error);
          }
        }
      }
    }
  };

  const getTasksByListId = (listId: string) => {
    return tasks.filter(t => t.list_id === listId);
  };

  const getTasksByCategory = (category: Category) => {
    return tasks.filter(t => t.list_category === category);
  };

  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        {/* Logo and Title Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.25rem',
          marginBottom: '0.25rem'
        }}>
          {/* TAMI Logo - Larger for more prominence */}
          <img
            src="/tami-logo.png"
            alt="TAMI Logo"
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              boxShadow: '0 4px 16px rgba(33, 150, 243, 0.4)',
              transform: 'scale(1.15)',
              objectFit: 'cover'
            }}
          />

          {/* Title and Subtitle Container */}
          <div style={{ textAlign: 'left' }}>
            {/* AI Task Manager Title - Smaller */}
            <h1 style={{
              fontSize: '2rem',
              margin: 0,
              marginBottom: '0.15rem',
              fontFamily: 'var(--font-poppins), sans-serif',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #2196F3 0%, #9C27B0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '0.02em',
              lineHeight: '1.2'
            }}>
              AI Task Manager
            </h1>

            {/* Subtitle - Aligned with title */}
            <p style={{
              color: '#999',
              fontSize: '0.8rem',
              fontFamily: 'var(--font-inter), sans-serif',
              fontWeight: '400',
              margin: 0,
              lineHeight: '1.3'
            }}>
              Voice-First Intelligent Organization
            </p>
          </div>
        </div>
        {debugError && (
          <div style={{ color: 'red', marginTop: '1rem', padding: '1rem', border: '1px solid red' }}>
            Error: {debugError}
          </div>
        )}
      </header>

      <VoiceInput onCommand={handleCommand} isProcessing={isProcessing} />

      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={lists.map(l => l.id)}
          strategy={verticalListSortingStrategy}
        >
          <div style={{ display: 'grid', gap: '2rem' }}>
            {lists.map(list => (
              <DraggableList key={list.id} list={list}>
                <div>
                  <ListHeader
                    list={list}
                    taskCount={getTasksByListId(list.id).length}
                    onEdit={handleEditList}
                    onDelete={!list.is_default ? handleDeleteList : undefined}
                  />

                  <DroppableList
                    listId={list.id}
                    tasks={getTasksByListId(list.id)}
                    onToggleComplete={handleToggleComplete}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    onChangePriority={handleChangePriority}
                    onSubtaskToggle={handleSubtaskToggle}
                  />
                </div>
              </DraggableList>
            ))}

            <CreateListButton onCreate={handleCreateList} />
          </div>
        </SortableContext>
      </DndContext>
    </main>
  );
}

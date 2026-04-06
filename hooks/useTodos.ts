import { useState, useEffect } from "react";
import { Todo } from "@/public/types/todo";
import { dummyData } from "@/public/data/todos";

export default function useTodos() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("todos");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse todos from localStorage", e);
        }
      }
    }
    return dummyData;
  });

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // We use a short timeout so that the setState is not triggered synchronously 
    // within the effect body. This avoids cascading renders, satisfies the React 
    // performance recommendations, and prevents hydration mismatches.
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("todos", JSON.stringify(todos));
    }
  }, [todos, isMounted]);

  function handleCompletedChange(id: number, completed: boolean) {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, completed } : todo
      )
    );
  }

  function handleAddTodo(title: string) {
    setTodos((prevTodos) => [
      {
        id: Date.now(),
        title,
        completed: false,
      },
      ...prevTodos
    ]);
  }

  function handleDeleteTodo(id: number) {
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
  }

  function handleDeleteAllCompleted() {
    setTodos((prevTodos) => prevTodos.filter((todo) => !todo.completed));
  }

  return {
    // Return dummyData until mounted on the client to avoid SSR hydration mismatches
    todos: isMounted ? todos : dummyData,
    handleAddTodo,
    handleCompletedChange,
    handleDeleteTodo,
    handleDeleteAllCompleted,
  };
}
export type UserRole = 'parent' | 'child';

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRoleRecord {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}

export interface Child {
  id: string;
  name: string;
  birth_date: string | null;
  grade: string | null;
  school_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ParentChild {
  id: string;
  parent_id: string;
  child_id: string;
  created_at: string;
}

export interface ChildUserLink {
  id: string;
  child_id: string;
  user_id: string;
  created_at: string;
}

export interface Schedule {
  id: string;
  child_id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string | null;
  all_day: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  child_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Homework {
  id: string;
  child_id: string;
  subject_id: string | null;
  title: string;
  description: string | null;
  due_date: string;
  completed: boolean;
  completed_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  subject?: Subject;
}

export interface Announcement {
  id: string;
  child_id: string;
  title: string;
  content: string | null;
  important: boolean;
  created_by: string | null;
  created_at: string;
}

export interface Exam {
  id: string;
  child_id: string;
  subject_id: string | null;
  title: string;
  description: string | null;
  exam_type: 'prova' | 'trabalho';
  exam_date: string;
  grade: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  subject?: Subject;
}

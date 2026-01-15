-- Create role enum
CREATE TYPE public.user_role AS ENUM ('parent', 'child');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user_roles table for secure role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Create children table
CREATE TABLE public.children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  birth_date DATE,
  grade TEXT,
  school_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create parent_child relationship table
CREATE TABLE public.parent_child (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (parent_id, child_id)
);

-- Create child_user link (for children who have their own login)
CREATE TABLE public.child_user_link (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create schedule (agenda) table
CREATE TABLE public.schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  all_day BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create subjects table
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create homework (tarefas) table
CREATE TABLE public.homework (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create announcements (avisos) table
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  important BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create exams (provas e trabalhos) table
CREATE TABLE public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  exam_type TEXT NOT NULL CHECK (exam_type IN ('prova', 'trabalho')),
  exam_date DATE NOT NULL,
  grade DECIMAL(5,2),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_child ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_user_link ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

-- Security definer function to check if user has role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user is parent of child
CREATE OR REPLACE FUNCTION public.is_parent_of_child(_user_id UUID, _child_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.parent_child
    WHERE parent_id = _user_id
      AND child_id = _child_id
  )
$$;

-- Function to check if user is the child (linked user)
CREATE OR REPLACE FUNCTION public.is_child_user(_user_id UUID, _child_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.child_user_link
    WHERE user_id = _user_id
      AND child_id = _child_id
  )
$$;

-- Function to get child_id for a child user
CREATE OR REPLACE FUNCTION public.get_child_id_for_user(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT child_id
  FROM public.child_user_link
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User roles policies
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Children policies
CREATE POLICY "Parents can view their children"
  ON public.children FOR SELECT
  USING (
    public.is_parent_of_child(auth.uid(), id)
    OR public.is_child_user(auth.uid(), id)
  );

CREATE POLICY "Parents can insert children"
  ON public.children FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'parent'));

CREATE POLICY "Parents can update their children"
  ON public.children FOR UPDATE
  USING (public.is_parent_of_child(auth.uid(), id));

CREATE POLICY "Parents can delete their children"
  ON public.children FOR DELETE
  USING (public.is_parent_of_child(auth.uid(), id));

-- Parent_child policies
CREATE POLICY "Parents can view their relationships"
  ON public.parent_child FOR SELECT
  USING (auth.uid() = parent_id);

CREATE POLICY "Parents can insert relationships"
  ON public.parent_child FOR INSERT
  WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Parents can delete relationships"
  ON public.parent_child FOR DELETE
  USING (auth.uid() = parent_id);

-- Child user link policies
CREATE POLICY "Parents and children can view child links"
  ON public.child_user_link FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.is_parent_of_child(auth.uid(), child_id)
  );

CREATE POLICY "Parents can insert child links"
  ON public.child_user_link FOR INSERT
  WITH CHECK (public.is_parent_of_child(auth.uid(), child_id));

-- Schedules policies
CREATE POLICY "Users can view schedules of their children"
  ON public.schedules FOR SELECT
  USING (
    public.is_parent_of_child(auth.uid(), child_id)
    OR public.is_child_user(auth.uid(), child_id)
  );

CREATE POLICY "Parents can insert schedules"
  ON public.schedules FOR INSERT
  WITH CHECK (public.is_parent_of_child(auth.uid(), child_id));

CREATE POLICY "Parents can update schedules"
  ON public.schedules FOR UPDATE
  USING (public.is_parent_of_child(auth.uid(), child_id));

CREATE POLICY "Parents can delete schedules"
  ON public.schedules FOR DELETE
  USING (public.is_parent_of_child(auth.uid(), child_id));

-- Subjects policies
CREATE POLICY "Users can view subjects of their children"
  ON public.subjects FOR SELECT
  USING (
    public.is_parent_of_child(auth.uid(), child_id)
    OR public.is_child_user(auth.uid(), child_id)
  );

CREATE POLICY "Parents can insert subjects"
  ON public.subjects FOR INSERT
  WITH CHECK (public.is_parent_of_child(auth.uid(), child_id));

CREATE POLICY "Parents can update subjects"
  ON public.subjects FOR UPDATE
  USING (public.is_parent_of_child(auth.uid(), child_id));

CREATE POLICY "Parents can delete subjects"
  ON public.subjects FOR DELETE
  USING (public.is_parent_of_child(auth.uid(), child_id));

-- Homework policies
CREATE POLICY "Users can view homework of their children"
  ON public.homework FOR SELECT
  USING (
    public.is_parent_of_child(auth.uid(), child_id)
    OR public.is_child_user(auth.uid(), child_id)
  );

CREATE POLICY "Parents can insert homework"
  ON public.homework FOR INSERT
  WITH CHECK (public.is_parent_of_child(auth.uid(), child_id));

CREATE POLICY "Parents can update homework"
  ON public.homework FOR UPDATE
  USING (public.is_parent_of_child(auth.uid(), child_id));

CREATE POLICY "Children can update homework completion"
  ON public.homework FOR UPDATE
  USING (public.is_child_user(auth.uid(), child_id));

CREATE POLICY "Parents can delete homework"
  ON public.homework FOR DELETE
  USING (public.is_parent_of_child(auth.uid(), child_id));

-- Announcements policies
CREATE POLICY "Users can view announcements of their children"
  ON public.announcements FOR SELECT
  USING (
    public.is_parent_of_child(auth.uid(), child_id)
    OR public.is_child_user(auth.uid(), child_id)
  );

CREATE POLICY "Parents can insert announcements"
  ON public.announcements FOR INSERT
  WITH CHECK (public.is_parent_of_child(auth.uid(), child_id));

CREATE POLICY "Parents can update announcements"
  ON public.announcements FOR UPDATE
  USING (public.is_parent_of_child(auth.uid(), child_id));

CREATE POLICY "Parents can delete announcements"
  ON public.announcements FOR DELETE
  USING (public.is_parent_of_child(auth.uid(), child_id));

-- Exams policies
CREATE POLICY "Users can view exams of their children"
  ON public.exams FOR SELECT
  USING (
    public.is_parent_of_child(auth.uid(), child_id)
    OR public.is_child_user(auth.uid(), child_id)
  );

CREATE POLICY "Parents can insert exams"
  ON public.exams FOR INSERT
  WITH CHECK (public.is_parent_of_child(auth.uid(), child_id));

CREATE POLICY "Parents can update exams"
  ON public.exams FOR UPDATE
  USING (public.is_parent_of_child(auth.uid(), child_id));

CREATE POLICY "Parents can delete exams"
  ON public.exams FOR DELETE
  USING (public.is_parent_of_child(auth.uid(), child_id));

-- Create trigger for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_children_updated_at
  BEFORE UPDATE ON public.children
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at
  BEFORE UPDATE ON public.schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_homework_updated_at
  BEFORE UPDATE ON public.homework
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exams_updated_at
  BEFORE UPDATE ON public.exams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
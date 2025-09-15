-- Insert default subjects
INSERT INTO public.subjects (name, name_ar, description, icon, color) VALUES
('Chemistry', 'الكيمياء', 'دراسة المواد وخصائصها وتفاعلاتها', '🧪', '#059669'),
('Physics', 'الفيزياء', 'دراسة الطبيعة والمادة والطاقة', '⚛️', '#0891b2'),
('Arabic', 'اللغة العربية', 'دراسة اللغة العربية وآدابها', '📚', '#d97706'),
('English', 'اللغة الإنجليزية', 'دراسة اللغة الإنجليزية ومهاراتها', '🇬🇧', '#7c3aed'),
('Mathematics', 'الرياضيات', 'دراسة الأرقام والعمليات الحسابية', '🔢', '#dc2626')
ON CONFLICT DO NOTHING;

-- Insert sample lessons for Chemistry
INSERT INTO public.lessons (subject_id, title, title_ar, content, order_index, difficulty_level, points_reward, is_published) 
SELECT 
  s.id,
  'Introduction to Atoms',
  'مقدمة في الذرات',
  '{"sections": [{"type": "text", "content": "الذرة هي أصغر وحدة في المادة..."}, {"type": "video", "url": "/videos/atoms-intro.mp4"}, {"type": "quiz", "questions": []}]}',
  1,
  1,
  15,
  true
FROM public.subjects s WHERE s.name = 'Chemistry'
ON CONFLICT DO NOTHING;

INSERT INTO public.lessons (subject_id, title, title_ar, content, order_index, difficulty_level, points_reward, is_published) 
SELECT 
  s.id,
  'Chemical Bonds',
  'الروابط الكيميائية',
  '{"sections": [{"type": "text", "content": "الروابط الكيميائية تربط بين الذرات..."}, {"type": "interactive", "component": "bond-simulator"}]}',
  2,
  2,
  20,
  true
FROM public.subjects s WHERE s.name = 'Chemistry'
ON CONFLICT DO NOTHING;

-- Insert sample questions
INSERT INTO public.questions (subject_id, question_text, question_type, options, correct_answer, explanation, difficulty_level, points, source)
SELECT 
  s.id,
  'ما هو العدد الذري للهيدروجين؟',
  'multiple_choice',
  '["1", "2", "3", "4"]',
  '1',
  'الهيدروجين له بروتون واحد فقط، لذلك عدده الذري هو 1',
  1,
  5,
  'منهج الكيمياء - الصف الأول الثانوي'
FROM public.subjects s WHERE s.name = 'Chemistry'
ON CONFLICT DO NOTHING;

INSERT INTO public.questions (subject_id, question_text, question_type, options, correct_answer, explanation, difficulty_level, points, source)
SELECT 
  s.id,
  'What is the formula for water?',
  'multiple_choice',
  '["H2O", "CO2", "NaCl", "CH4"]',
  'H2O',
  'Water consists of two hydrogen atoms and one oxygen atom',
  1,
  5,
  'Basic Chemistry'
FROM public.subjects s WHERE s.name = 'Chemistry'
ON CONFLICT DO NOTHING;

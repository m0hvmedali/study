-- Add missing name_ar column to subjects table
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS name_ar VARCHAR(255);

-- Update existing subjects with Arabic names
UPDATE subjects SET name_ar = 'الرياضيات' WHERE name = 'Mathematics';
UPDATE subjects SET name_ar = 'العلوم' WHERE name = 'Science';
UPDATE subjects SET name_ar = 'اللغة العربية' WHERE name = 'Arabic Language';
UPDATE subjects SET name_ar = 'اللغة الإنجليزية' WHERE name = 'English Language';
UPDATE subjects SET name_ar = 'التاريخ' WHERE name = 'History';
UPDATE subjects SET name_ar = 'الجغرافيا' WHERE name = 'Geography';
UPDATE subjects SET name_ar = 'الفيزياء' WHERE name = 'Physics';
UPDATE subjects SET name_ar = 'الكيمياء' WHERE name = 'Chemistry';
UPDATE subjects SET name_ar = 'الأحياء' WHERE name = 'Biology';
UPDATE subjects SET name_ar = 'الحاسوب' WHERE name = 'Computer Science';

-- Insert default subjects if table is empty
INSERT INTO subjects (name, name_ar, description, color) 
SELECT 'Mathematics', 'الرياضيات', 'دروس الرياضيات والحساب', '#3b82f6'
WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE name = 'Mathematics');

INSERT INTO subjects (name, name_ar, description, color) 
SELECT 'Science', 'العلوم', 'دروس العلوم العامة', '#10b981'
WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE name = 'Science');

INSERT INTO subjects (name, name_ar, description, color) 
SELECT 'Arabic Language', 'اللغة العربية', 'دروس اللغة العربية والأدب', '#f59e0b'
WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE name = 'Arabic Language');

INSERT INTO subjects (name, name_ar, description, color) 
SELECT 'English Language', 'اللغة الإنجليزية', 'دروس اللغة الإنجليزية', '#ef4444'
WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE name = 'English Language');

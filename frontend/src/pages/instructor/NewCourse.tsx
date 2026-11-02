import { useNavigate } from 'react-router-dom';
import CourseForm from '@/components/instructor/CourseForm';
import PageHeader from '@/components/PageHeader';
import { useTitle } from '@/lib/useTitle';

export default function NewCourse() {
  useTitle('New course');
  const navigate = useNavigate();
  return (
    <>
      <PageHeader title="New course" subtitle="Start with the basics. You can add lessons next." />
      <CourseForm onSaved={(c) => { if (c) navigate(`/instructor/courses/${c.slug}`); }} />
    </>
  );
}

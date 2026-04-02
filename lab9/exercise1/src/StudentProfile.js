import React from 'react';

const StudentProfile = () => {
  const student = {
    name: 'John Doe',
    department: 'Computer Science',
    year: '3rd Year',
    section: 'A',
  };

  return (
    <div>
      <h1>Student Profile</h1>
      <p><strong>Name:</strong> {student.name}</p>
      <p><strong>Department:</strong> {student.department}</p>
      <p><strong>Year:</strong> {student.year}</p>
      <p><strong>Section:</strong> {student.section}</p>
    </div>
  );
};

export default StudentProfile;

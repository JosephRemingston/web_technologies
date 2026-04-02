import React from 'react';

const StudentCard = ({ student }) => {
  return (
    <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px', margin: '16px', width: '200px' }}>
      <h3>{student.name}</h3>
      <p><strong>Department:</strong> {student.department}</p>
      <p><strong>Marks:</strong> {student.marks}</p>
    </div>
  );
};

export default StudentCard;

import React from 'react';
import StudentCard from './StudentCard';
import './App.css';

function App() {
  const students = [
    { name: 'Alice', department: 'Physics', marks: 85 },
    { name: 'Bob', department: 'Chemistry', marks: 92 },
    { name: 'Charlie', department: 'Mathematics', marks: 78 },
  ];

  return (
    <div className="App">
      <h1>Student Cards</h1>
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
        {students.map((student, index) => (
          <StudentCard key={index} student={student} />
        ))}
      </div>
    </div>
  );
}

export default App;

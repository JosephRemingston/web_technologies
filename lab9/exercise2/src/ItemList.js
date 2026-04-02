import React, { useState } from 'react';

const ItemList = () => {
  const [items, setItems] = useState(['Task 1', 'Task 2', 'Task 3']);
  const [newItem, setNewItem] = useState('');

  const handleAddItem = () => {
    if (newItem.trim()) {
      setItems([...items, newItem.trim()]);
      setNewItem('');
    }
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <div>
      <input
        type="text"
        value={newItem}
        onChange={(e) => setNewItem(e.target.value)}
        placeholder="Add a new task"
      />
      <button onClick={handleAddItem}>Add</button>
      {items.length > 0 ? (
        <ul>
          {items.map((item, index) => (
            <li key={index}>
              {item}
              <button onClick={() => handleRemoveItem(index)}>Remove</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No items in the list.</p>
      )}
    </div>
  );
};

export default ItemList;

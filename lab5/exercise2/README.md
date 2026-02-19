# Library Book Tracker - Lab 5 Exercise 2

## Overview
A comprehensive Library Book Tracker system that manages books using local XML file and XML DOM manipulation techniques.

## Features Implemented

### ✅ XML Data Storage
- **books.xml** with complete book information:
  - Book ID (unique identifier)
  - Title
  - Author
  - Availability Status (Available, Checked Out, Reserved, Under Repair)
- 8 sample books included for testing

### ✅ AJAX Implementation
- **GET Request** to load XML data asynchronously
- XMLHttpRequest API with proper callbacks
- Error handling for network issues and file not found
- Cache busting to ensure fresh data on refresh

### ✅ XML DOM Manipulation Methods

#### **Reading XML**
- `responseXML` - Get XML document from AJAX response
- `getElementsByTagName()` - Extract book nodes and child elements
- `getAttribute()` - Read book ID from XML attributes
- `textContent` / `innerText` - Extract text from XML nodes

#### **Creating Nodes**
- `createElement()` - Create new `<book>` element
- `setAttribute()` - Set book ID attribute
- `appendChild()` - Add child elements (title, author, status)

#### **Updating Nodes**
- Find book node by ID attribute
- Update child element text content
- Preserve XML structure integrity

#### **Deleting Nodes**
- `removeChild()` - Remove book node from parent
- Validate before deletion

### ✅ CRUD Operations

**CREATE** → Add New Book
- Form validation before submission
- Dynamic ID assignment
- Create XML node using DOM methods
- Immediate UI refresh without page reload

**READ** → Display All Books
- Parse XML using DOM methods
- Display in formatted table
- Real-time statistics dashboard

**UPDATE** → Modify Book Details
- Edit title, author, or status
- Update XML node in DOM
- Instant UI reflection

**DELETE** → Remove Book
- Confirmation dialog
- Remove from XML DOM
- Update display dynamically

### ✅ Additional Features

**Statistics Dashboard**
- Total books count
- Available books
- Checked out books
- Real-time updates

**Search & Filter**
- Search by title or author
- Filter by availability status
- Instant results

**Quick Actions**
- Toggle status button (Available ↔ Checked Out)
- One-click status change
- Visual status badges

**Data Validation**
- Required field validation
- Empty XML handling
- Malformed XML error detection
- Data consistency checks

**User Experience**
- Success/error notifications
- Loading indicators
- Empty state messages
- Responsive design
- Smooth animations

## File Structure

```
lab5/exercise2/
├── books.xml       # XML data file
├── index.html      # User interface
├── index.js        # XML DOM manipulation logic
├── style.css       # Styling
└── README.md       # Documentation
```

## How to Run

### ⚠️ Important: Web Server Required
Due to CORS restrictions, you **MUST** run this on a local web server.

### Option 1: Python HTTP Server (Recommended)
```bash
cd /Users/josephremingstonl/Downloads/code/web_technologies_lab/lab5/exercise2
python3 -m http.server 8000
```
Then open: **http://localhost:8000**

### Option 2: VS Code Live Server
1. Install "Live Server" extension in VS Code
2. Right-click `index.html` → "Open with Live Server"

### Option 3: Node.js http-server
```bash
cd lab5/exercise2
npx http-server -p 8000
```

## XML Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<library>
    <book id="1">
        <title>To Kill a Mockingbird</title>
        <author>Harper Lee</author>
        <status>Available</status>
    </book>
    <!-- More books... -->
</library>
```

## Key Technologies

### AJAX
- XMLHttpRequest API
- Asynchronous data loading
- GET request implementation
- Response handling

### XML DOM Methods Used
- `getElementsByTagName()` - Node selection
- `getAttribute()` / `setAttribute()` - Attribute manipulation
- `createElement()` - Create new elements
- `appendChild()` - Add nodes to DOM
- `removeChild()` - Delete nodes
- `textContent` - Read/write text content

### JavaScript Features
- ES6 syntax (arrow functions, const/let)
- Event handling
- Form validation
- Array methods (filter, find, forEach)
- LocalStorage for data persistence

### DOM Manipulation
- Dynamic table generation
- Real-time UI updates
- Event listeners
- Form handling

## Usage Instructions

### View Books
- Page automatically loads and displays all books
- View statistics at the top

### Add New Book
1. Fill in the form fields:
   - Book Title (required)
   - Author (required)
   - Availability Status (required)
2. Click "Add Book"
3. See success notification

### Edit Book
1. Click "✏️ Edit" button on any book row
2. Form populates with book data
3. Modify fields as needed
4. Click "Update Book"

### Delete Book
1. Click "🗑️ Delete" button
2. Confirm deletion in dialog
3. Book removed instantly

### Toggle Status (Quick Action)
1. Click "📤" or "📥" button
2. Status switches between Available/Checked Out
3. Instant update

### Search & Filter
- **Search**: Type in search box to find by title/author
- **Filter**: Select status from dropdown
- Results update in real-time

### Refresh Data
- Click "Refresh" button to reload from XML file
- Resets to original XML data

## Error Handling

The system handles:
- ✅ XML file not found
- ✅ Malformed XML syntax
- ✅ Network errors
- ✅ Empty book list
- ✅ Missing XML elements
- ✅ Invalid form input
- ✅ Duplicate operations

## Data Persistence

**Important Note**: 
- Browsers cannot write to local XML files due to security restrictions
- Initial data loads from `books.xml`
- Changes are stored in **LocalStorage**
- Click "Refresh" to reload original XML data
- For production, use a server-side API to save XML changes

## Browser Compatibility

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- Requires JavaScript enabled
- LocalStorage support needed

## Learning Objectives Covered

1. ✅ **AJAX GET Request** - Load XML asynchronously
2. ✅ **XML Parsing** - Use `responseXML` and DOM methods
3. ✅ **DOM Manipulation** - Create, update, delete XML nodes
4. ✅ **Dynamic Updates** - Refresh UI without page reload
5. ✅ **Validation** - Check data before operations
6. ✅ **Formatted Display** - Present XML data in table format
7. ✅ **Data Consistency** - Maintain integrity across operations

## Advanced Features

- 📊 Real-time statistics
- 🔍 Live search functionality
- 🎯 Status filtering
- 🔄 One-click status toggle
- 💾 LocalStorage backup
- ✨ Smooth animations
- 📱 Fully responsive design
- ♿ Accessible UI elements

## Testing the Application

1. **Initial Load**: Verify 8 books display
2. **Add Book**: Create new entry and verify it appears
3. **Edit Book**: Modify existing book details
4. **Delete Book**: Remove a book and confirm deletion
5. **Toggle Status**: Change availability status
6. **Search**: Find books by title/author
7. **Filter**: Show only available/checked out books
8. **Refresh**: Reload original XML data

## Troubleshooting

**Books not loading?**
- Ensure you're running on a web server (not file://)
- Check browser console for errors
- Verify books.xml exists in the same directory

**Changes not persisting?**
- This is expected - XML files can't be modified by browser
- Changes saved to LocalStorage instead
- Use "Refresh" to reload original XML

**Search not working?**
- Clear search box and filter
- Check if books actually exist
- Try refreshing the page

## Technical Notes

- XML DOM manipulation happens in-memory
- Original XML file remains unchanged
- LocalStorage acts as temporary database
- All operations validate data before execution
- XSS protection through HTML escaping

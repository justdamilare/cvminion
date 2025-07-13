# LinkedIn Import System Test Plan

## Overview
This document outlines test cases for the LinkedIn resume import functionality implemented for CVMinion.

## Test Data Examples

### 1. Sample LinkedIn JSON Export
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "emailAddress": "john.doe@example.com",
  "headline": "Senior Software Engineer",
  "summary": "Experienced software engineer with 5+ years developing web applications...",
  "location": {
    "city": "San Francisco",
    "state": "CA",
    "country": "United States"
  },
  "phoneNumbers": [
    { "number": "+1-555-123-4567", "type": "mobile" }
  ],
  "websites": [
    { "url": "https://linkedin.com/in/johndoe", "type": "LinkedIn" },
    { "url": "https://johndoe.dev", "type": "Personal" }
  ]
}
```

### 2. Sample Positions CSV Data
```csv
Company Name,Title,Start Date,End Date,Description,Location
"Tech Corp","Senior Software Engineer","Jan 2020","Present","Led development of microservices architecture...","San Francisco, CA"
"StartupXYZ","Software Engineer","Jun 2018","Dec 2019","Developed React applications and REST APIs...","Remote"
```

### 3. Sample Education CSV Data
```csv
School Name,Degree Name,Field Of Study,Start Date,End Date,Activities
"University of California","Bachelor of Science","Computer Science","Sep 2014","May 2018","Programming Club, Dean's List"
```

## Test Cases

### File Upload Tests
1. **Valid ZIP File**: Upload LinkedIn export ZIP - should extract and parse successfully
2. **Valid JSON File**: Upload single JSON profile - should parse correctly
3. **Valid CSV File**: Upload positions CSV - should parse experience data
4. **Invalid File Type**: Upload .txt file - should show error message
5. **Oversized File**: Upload file > 50MB - should reject with size error
6. **Corrupted ZIP**: Upload invalid ZIP - should handle gracefully

### Data Parsing Tests
1. **Complete Profile**: All fields present - should achieve high completeness %
2. **Minimal Profile**: Only basic info - should handle missing fields gracefully
3. **Date Formats**: Various date formats - should normalize correctly
4. **Special Characters**: Names/descriptions with unicode - should preserve correctly
5. **Empty Fields**: Null/empty values - should handle without errors

### UI/UX Tests
1. **Drag & Drop**: Drag file to upload area - should trigger processing
2. **Progress Indicator**: Large file upload - should show progress
3. **Preview Data**: After processing - should show parsed data preview
4. **Error Handling**: Invalid file - should show clear error messages
5. **Success Flow**: Valid import - should update profile and show confirmation

### Integration Tests
1. **Profile Update**: Import should merge with existing profile data
2. **Database Persistence**: Imported data should save to Supabase
3. **Profile Refresh**: After import, profile should reflect changes
4. **Conflict Resolution**: Existing data vs imported data handling

## Expected Outcomes

### Successful Import
- ✅ File processed without errors
- ✅ Data preview shows parsed information
- ✅ Profile completeness percentage calculated
- ✅ Import button enabled for valid data
- ✅ Profile updated in database
- ✅ UI refreshes with new data
- ✅ Success toast notification

### Error Scenarios
- ❌ Clear error messages for invalid files
- ❌ Validation errors for incomplete data
- ❌ Network errors handled gracefully
- ❌ Import button disabled for invalid data

## Performance Expectations
- File processing: < 10 seconds for typical LinkedIn exports
- Progress updates: Real-time feedback during processing
- Memory usage: Efficient handling of large files
- Error recovery: Clean state reset after errors

## Security Considerations
- File type validation prevents malicious uploads
- File size limits prevent resource exhaustion
- Data sanitization prevents XSS attacks
- No sensitive data logged or stored improperly
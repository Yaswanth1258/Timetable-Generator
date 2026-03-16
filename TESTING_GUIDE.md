# Testing Guide - Timetable Optimization System

## Quick Start (5 minutes)

### Step 1: Verify Backend is Running
```bash
cd d:\projects\server
npm start
# Should show: "Server running in development mode on port 5000"
```

### Step 2: Verify Frontend is Running
```bash
cd d:\projects\client
npm run dev
# Should show: "Local: http://localhost:5173" or similar
```

### Step 3: Login
1. Open browser to `http://localhost:5173`
2. Click Login
3. Email: `admin@college.edu`
4. Password: `password123`
5. Click Login

### Step 4: Generate Timetable
1. Click **Generate** in sidebar
2. **Department Selection**: Check "Computer Science" ✓
3. **Semester**: Select "Semester 3"
4. **Working Days**: All days checked (Mon-Sat)
5. Scroll down, click **"Generate Optimal Timetables"**
6. Wait for completion (30-60 seconds)
7. You should see: "Timetables generated successfully for 1 departments"
8. Timetable will display below automatically

### Step 5: Verify Generated Timetable
1. Look at the timetable table
2. You should see:
   - Days as rows (Monday-Saturday)
   - Time slots as columns (9:00-10:00, 10:00-11:00, etc.)
   - Classes scheduled in most slots
   - At least 1 FREE SLOT per day
   - Information: Subject name, Faculty name, Room name

### Step 6: Publish Timetable
1. Scroll down on the generated timetable
2. Click **"Publish"** button
3. Should see: "Timetable published successfully!"

### Step 7: View Published Timetable
1. Click **View Timetable** in sidebar
2. Select Department: "Computer Science" (optional, or "All departments")
3. Select a timetable from dropdown
4. Should display the timetable you just published

### Step 8: Check Live Updates
1. Click **Live Updates** in sidebar
2. Select Department: "Computer Science"
3. Select Published Timetable from dropdown
4. Should display your published timetable
5. This page allows real-time modifications (faculty, room swaps)

## Troubleshooting

### Issue: No timetable appears after clicking Generate
**Solution**: 
- Check browser console (F12 → Console tab)
- Check server logs for errors
- Verify all required data exists in database:
  - Departments with subjects
  - Faculty with expertise assigned
  - Classrooms available
  - Time slots configured

### Issue: "No published timetables found"
**Solution**:
- You must first Generate a timetable
- Then Publish it (using the Publish button on View Timetable)
- Then it will appear in Live Updates

### Issue: Timetable shows empty slots everywhere
**Solution**:
- This means subjects weren't scheduled
- Check if faculty has expertise assigned to subjects
- Check if enough classrooms exist
- Check server logs for detailed error messages

### Issue: White page or error on Live Updates
**Solution**:
- All errors now display with helpful messages
- If still white, check browser console
- Refresh the page (Ctrl+R)
- Logout and login again

## Advanced Testing

### Test Multiple Departments
1. Go to Generate page
2. Check: Computer Science AND Electrical Engineering
3. Click Generate
4. Both timetables should be generated
5. Can view any of them in dropdown

### Test Different Semesters
1. Go to Generate page
2. Change Semester to 4, 5, 6, etc.
3. Generate - will create for selected semester
4. Each semester has its own subjects

### Test Manual Overrides (Draft Only)
1. Generate and view timetable (not published)
2. Click on any class cell (not breaks, not free slots)
3. Modal appears to change Faculty or Room
4. Select new faculty/room and save
5. Changes applied immediately

## Performance Notes

- **Generation time**: 30-90 seconds depending on data volume
- **Typical results**: 80-95% of all subject hours scheduled
- **Free slots**: Guaranteed 1+ per day minimum
- **Console logs**: Server shows scheduling progress (check terminal)

## Validation Checklist

After following all steps above, verify:

- [ ] Can login successfully
- [ ] Can generate timetable for selected departments
- [ ] Timetable displays with entries for subjects
- [ ] Each day has at least 1 free slot
- [ ] Faculty and room names display correctly
- [ ] Can publish timetable without errors
- [ ] Published timetable appears in View Timetable
- [ ] Published timetable appears in Live Updates
- [ ] Can select and view published timetable in Live Updates
- [ ] No console errors (F12 → Console)
- [ ] No server terminal errors

## Expected Results

✅ Timetable generated with 80%+ of subjects scheduled
✅ Free slot per day maintained
✅ All entries fully populated with details
✅ Can publish and view without errors
✅ Live Updates properly accessible
✅ No white page errors or crashes

---
If all checks pass: **SYSTEM IS WORKING CORRECTLY** ✅

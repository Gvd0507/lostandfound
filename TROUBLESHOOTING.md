## Troubleshooting Guide for Upload Errors

### Quick Checklist:

1. **Is the backend server running?**
   ```bash
   cd backend
   npm start
   ```
   Server should show: `🚀 Server is running on port 5000`

2. **Is the frontend server running?**
   ```bash
   cd frontend
   npm start
   ```
   Should open at `http://localhost:3000`

3. **Are you logged in?**
   - Check if you're logged in with a GITAM email (@student.gitam.edu or @gitam.in)
   - Open browser DevTools (F12) → Application → Local Storage
   - Look for Firebase authentication tokens

4. **Check browser console for errors:**
   - Open DevTools (F12) → Console tab
   - Look for error messages when submitting the form

### Common Error Messages & Solutions:

#### "No token provided" or "Invalid or expired token"
**Solution:** Log out and log back in with your GITAM email

#### "Image is required for found items"
**Solution:** Make sure you've uploaded an image when reporting a found item

#### "Image size should be less than 5MB"
**Solution:** Compress or resize your image before uploading

#### "Failed to upload image. Please check Cloudinary configuration"
**Solution:** Cloudinary is properly configured ✓ (verified)

#### "Database error. Please check database connection"
**Solution:** Database is working ✓ (verified)

#### "Network Error" or "ERR_CONNECTION_REFUSED"
**Solution:** 
- Make sure backend server is running on port 5000
- Check that REACT_APP_API_URL in frontend/.env is set to: http://localhost:5000/api

### Testing the API Manually:

You can test if the API is working by opening this in your browser:
```
http://localhost:5000/health
```
Should return: `{"status":"OK","message":"Server is running"}`

### Debugging Steps:

1. **Check Network Tab in Browser:**
   - Open DevTools (F12) → Network tab
   - Try submitting the form
   - Click on the POST request to /api/lost-items or /api/found-items
   - Check the Response tab for error details

2. **Check Backend Logs:**
   - Look at the terminal where backend is running
   - Errors will be logged there with detailed stack traces

3. **Verify Form Data:**
   - Make sure all required fields are filled:
     - **Lost Items:** itemName, category, description, location, dateLost, secretQuestion, secretAnswer
     - **Found Items:** itemName, category, description, location, dateFound, secretDetail, image (required!)

### Files Fixed:
- ✅ backend/src/server.js - Fixed Windows temp directory issue
- ✅ backend/src/controllers/foundItemsController.js - Added better error messages
- ✅ backend/src/controllers/lostItemsController.js - Added better error messages

### What to do next:
1. Restart the backend server if it was running during the fix
2. Try submitting a form again
3. Check the browser console and backend terminal for specific error messages
4. Share the exact error message if the issue persists

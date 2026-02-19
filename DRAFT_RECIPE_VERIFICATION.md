# Manual Verification Guide - Draft Recipe Visibility

This document provides step-by-step instructions to manually verify that draft recipes are only visible to administrators and recipe authors.

## Prerequisites
- Access to the RecipeBook application
- At least two user accounts:
  - One admin account
  - One regular (non-admin) account
- Access to create and edit recipes

## Test Scenarios

### Scenario 1: Admin User Can See All Draft Recipes

**Setup:**
1. Log in as an admin user
2. Create a test recipe with the following settings:
   - Title: "Admin Draft Recipe"
   - Mark as "Entwurf" (Private/Draft): ✓ checked
   - Save the recipe

**Expected Result:**
- The recipe should appear in the recipe list for the admin user
- The recipe should show a "Entwurf" (Draft) badge
- The admin can view, edit, and delete the recipe

**Verification:**
- ✓ Recipe appears in recipe list
- ✓ Recipe shows draft indicator
- ✓ Recipe can be opened and viewed
- ✓ Recipe can be edited
- ✓ Recipe can be deleted (if needed for cleanup)

---

### Scenario 2: Regular User Can See Their Own Draft Recipes

**Setup:**
1. Log in as a regular (non-admin) user
2. Create a test recipe with the following settings:
   - Title: "My Draft Recipe"
   - Mark as "Entwurf" (Private/Draft): ✓ checked
   - Save the recipe

**Expected Result:**
- The recipe should appear in the recipe list for the regular user
- The recipe should show a "Entwurf" (Draft) badge
- The user can view, edit, and delete their own draft recipe

**Verification:**
- ✓ Recipe appears in recipe list
- ✓ Recipe shows draft indicator
- ✓ Recipe can be opened and viewed
- ✓ Recipe can be edited
- ✓ Recipe can be deleted (if needed for cleanup)

---

### Scenario 3: Regular User Cannot See Other Users' Draft Recipes

**Setup:**
1. Use the admin account to create a draft recipe:
   - Title: "Hidden Admin Draft"
   - Mark as "Entwurf" (Private/Draft): ✓ checked
   - Save the recipe
2. Log out from admin account
3. Log in as a regular (non-admin) user

**Expected Result:**
- The "Hidden Admin Draft" recipe should NOT appear in the recipe list for the regular user
- Attempting to access the recipe directly (if URL is known) should fail or redirect

**Verification:**
- ✓ Recipe does NOT appear in recipe list
- ✓ Cannot access recipe via direct link
- ✓ Only public recipes and user's own drafts are visible

---

### Scenario 4: Public Recipes Are Visible to All Users

**Setup:**
1. Create a recipe as any user:
   - Title: "Public Test Recipe"
   - Mark as "Entwurf" (Private/Draft): ✗ unchecked
   - Save the recipe
2. Log in with different user accounts

**Expected Result:**
- The recipe should appear in the recipe list for all authenticated users
- The recipe should NOT show a "Entwurf" badge
- All users can view the recipe

**Verification:**
- ✓ Recipe appears for all users
- ✓ No draft indicator shown
- ✓ Recipe can be viewed by all users
- ✓ Only author and admins can edit/delete

---

### Scenario 5: Converting Draft to Public

**Setup:**
1. Log in as a regular user
2. Create a draft recipe
3. Edit the recipe
4. Uncheck the "Entwurf" (Private/Draft) checkbox
5. Save the recipe
6. Log in as a different regular user

**Expected Result:**
- Before unchecking: Only visible to author and admins
- After unchecking: Visible to all authenticated users

**Verification:**
- ✓ Recipe becomes visible to all users after publishing
- ✓ Draft badge disappears
- ✓ Recipe appears in other users' recipe lists

---

## Testing Checklist

- [ ] Admin can see all draft recipes (own and others')
- [ ] Regular user can see their own draft recipes
- [ ] Regular user cannot see other users' draft recipes
- [ ] All users can see public recipes
- [ ] Draft recipes show appropriate badge/indicator
- [ ] Converting draft to public makes recipe visible to all
- [ ] Converting public to draft hides recipe from non-authors/non-admins

## Database-Level Security Verification (Optional)

If Firestore security rules are deployed, you can verify them using the Firebase Console:

1. Go to Firebase Console → Firestore Database → Rules
2. Verify that the rules match the content of `firestore.rules`
3. Use the Rules Playground to test access scenarios:
   - Test reading a private recipe as a non-admin, non-author → Should fail
   - Test reading a private recipe as the author → Should succeed
   - Test reading a private recipe as an admin → Should succeed
   - Test reading a public recipe as any user → Should succeed

## Notes

- The `isPrivate` field is used to mark recipes as drafts
- Client-side filtering (in `recipeFirestore.js`) provides immediate UX
- Server-side rules (Firestore) provide actual security enforcement
- Both layers work together for complete security

## Troubleshooting

**If a regular user can see other users' draft recipes:**
- Check that the Firestore security rules are deployed
- Verify client-side filtering in `recipeFirestore.js`
- Clear browser cache and reload
- Check browser console for errors

**If an admin cannot see draft recipes:**
- Verify that the user's `isAdmin` field is set to `true` in Firestore
- Check browser console for errors
- Verify that `currentUser.isAdmin` is correctly passed to `subscribeToRecipes()`

**If recipes are not showing up at all:**
- Check Firebase connection
- Verify authentication is working
- Check browser console for errors
- Ensure `subscribeToRecipes()` is being called with correct parameters

# Manual Testing Guide for Drag and Drop Visual Indicators

This guide provides comprehensive manual testing procedures for the drag and drop visual indicators functionality implemented in the Bio Builder.

## Prerequisites

1. Start the development server: `npm run dev`
2. Navigate to the Bio Builder page (`/my-links`)
3. Ensure you have some elements in the elements panel to drag

## Test Scenarios

### 1. Insertion Indicator Visibility

**Test Case 1.1: Indicators appear during drag**

- **Steps:**
  1. Drag an element from the elements panel
  2. Hover over existing elements in the canvas
- **Expected Result:**
  - Blue insertion indicators should appear above/below existing elements
  - Indicators should have smooth fade-in animations
  - Only one indicator should be visible at a time

**Test Case 1.2: Indicators disappear when not hovering**

- **Steps:**
  1. Start dragging an element
  2. Move mouse away from existing elements
- **Expected Result:**
  - All insertion indicators should fade out smoothly
  - No indicators should remain visible when not over valid drop zones

### 2. Insertion Position Detection

**Test Case 2.1: Top zone insertion**

- **Steps:**
  1. Drag an element over the top 30% of an existing element
- **Expected Result:**
  - Insertion indicator should appear above the target element
  - Indicator should show "Inserir aqui" text for top position

**Test Case 2.2: Bottom zone insertion**

- **Steps:**
  1. Drag an element over the bottom 30% of an existing element
- **Expected Result:**
  - Insertion indicator should appear below the target element
  - No text should appear for bottom position indicators

**Test Case 2.3: Middle zone insertion**

- **Steps:**
  1. Drag an element over the middle 40% of an existing element
- **Expected Result:**
  - Insertion position should be determined by drag direction
  - If dragging from above: indicator appears below target
  - If dragging from below: indicator appears above target

### 3. Real-time Visual Reorganization

**Test Case 3.1: Elements shift during drag**

- **Steps:**
  1. Drag an element from position 0 to position 2
  2. Observe elements at positions 1 and 2 during drag
- **Expected Result:**
  - Elements should shift smoothly to make space for insertion
  - Shifting elements should have reduced opacity (0.75) and slight scale (0.98)
  - Purple tint should be applied to shifting elements

**Test Case 3.2: Zone highlighting**

- **Steps:**
  1. Drag an element over the reorganization zone
- **Expected Result:**
  - Elements in the reorganization zone should have subtle blue tint
  - Zone elements should have slightly reduced opacity (0.9)

### 4. Animation Quality and Performance

**Test Case 4.1: Smooth animations**

- **Steps:**
  1. Perform various drag operations
  2. Observe all animation transitions
- **Expected Result:**
  - All animations should use cubic-bezier easing (0.25, 0.46, 0.45, 0.94)
  - Transitions should be smooth without jank or stuttering
  - Animation duration should be 300ms for most transitions

**Test Case 4.2: Performance under rapid movements**

- **Steps:**
  1. Rapidly move dragged element over multiple targets
  2. Perform quick back-and-forth movements
- **Expected Result:**
  - No lag or performance degradation
  - Indicators should update smoothly without flickering
  - Mouse movement should be throttled to ~60fps (16ms intervals)

### 5. Visual Feedback Accuracy

**Test Case 5.1: Insertion indicator positioning**

- **Steps:**
  1. Test insertion at various positions (beginning, middle, end of list)
- **Expected Result:**
  - Indicators should appear exactly where the element will be inserted
  - Visual position should match actual insertion position after drop

**Test Case 5.2: Multi-element reorganization**

- **Steps:**
  1. Drag elements to create complex reorganizations
  2. Test with lists of 3+ elements
- **Expected Result:**
  - All affected elements should show appropriate visual feedback
  - No elements should be left without proper visual state

### 6. Edge Cases and Error Handling

**Test Case 6.1: Rapid drag cancellation**

- **Steps:**
  1. Start dragging an element
  2. Quickly press Escape or move outside valid areas
- **Expected Result:**
  - All visual indicators should disappear immediately
  - No visual artifacts should remain
  - Elements should return to normal state

**Test Case 6.2: Browser window resize during drag**

- **Steps:**
  1. Start dragging an element
  2. Resize the browser window
- **Expected Result:**
  - Drag operation should continue normally
  - Indicators should adjust to new layout
  - No visual glitches should occur

**Test Case 6.3: Multiple rapid drags**

- **Steps:**
  1. Perform multiple drag operations in quick succession
  2. Don't wait for animations to complete between drags
- **Expected Result:**
  - Each drag should work independently
  - No state should leak between operations
  - Visual feedback should be accurate for each operation

### 7. Accessibility and Keyboard Navigation

**Test Case 7.1: Keyboard drag operations**

- **Steps:**
  1. Use keyboard to initiate drag (Space bar)
  2. Use arrow keys to move element
  3. Use Space to drop or Escape to cancel
- **Expected Result:**
  - Visual indicators should work with keyboard navigation
  - Screen reader announcements should be appropriate
  - Focus management should be maintained

**Test Case 7.2: High contrast mode**

- **Steps:**
  1. Enable high contrast mode in browser/OS
  2. Test all drag operations
- **Expected Result:**
  - All visual indicators should remain visible
  - Contrast should be sufficient for accessibility
  - Colors should adapt appropriately

### 8. Cross-browser Compatibility

**Test Case 8.1: Chrome/Chromium**

- Test all above scenarios in Chrome
- Pay attention to animation smoothness

**Test Case 8.2: Firefox**

- Test all above scenarios in Firefox
- Check for any rendering differences

**Test Case 8.3: Safari (if available)**

- Test all above scenarios in Safari
- Verify WebKit-specific behaviors

### 9. Mobile/Touch Testing (if applicable)

**Test Case 9.1: Touch drag operations**

- **Steps:**
  1. Use touch device or browser dev tools touch simulation
  2. Perform drag operations with touch
- **Expected Result:**
  - Touch drag should work similarly to mouse drag
  - Visual indicators should appear during touch drag
  - Performance should remain smooth

## Test Results Documentation

For each test case, document:

- ✅ Pass / ❌ Fail
- Browser tested
- Any issues or observations
- Screenshots of visual problems (if any)

## Performance Benchmarks

Monitor these metrics during testing:

- Frame rate should stay above 50fps during drag operations
- Memory usage should not increase significantly during extended testing
- CPU usage should remain reasonable

## Known Issues to Verify Fixed

1. ✅ Insertion indicators should not appear when not dragging
2. ✅ Indicators should disappear immediately when drag ends
3. ✅ No visual artifacts should remain after drag operations
4. ✅ Performance should be smooth with multiple elements
5. ✅ Animations should not conflict with each other

## Reporting Issues

If any test fails or issues are found:

1. Document the exact steps to reproduce
2. Note the browser and version
3. Include screenshots or screen recordings
4. Describe expected vs actual behavior
5. Note any console errors or warnings

## Completion Criteria

Manual testing is complete when:

- [ ] All test cases have been executed
- [ ] All critical issues have been documented
- [ ] Performance is acceptable across tested browsers
- [ ] Accessibility requirements are met
- [ ] Visual quality meets design standards

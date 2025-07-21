# Bio Builder Store - Background Persistence

This document explains the background persistence and state management implementation in the bio-builder-store.

## Features Implemented

### 1. Automatic Saving

- **Debounced Auto-save**: Changes are automatically saved 1 second after the last modification
- **Manual Save**: `saveCurrentPage()` method for immediate saving
- **Error Handling**: Failed saves are logged and `lastSaved` timestamp is reset

### 2. State Persistence

- **Zustand Persist Middleware**: Automatically saves/restores state to/from localStorage
- **Selective Persistence**: Only essential data is persisted (not transient UI state)
- **Date Serialization**: Custom serialization handles Date objects properly

### 3. Background Configuration Migration

- **Automatic Migration**: Old pages without `backgroundType` are automatically migrated
- **Backward Compatibility**: Existing `backgroundColor` is preserved as solid background
- **Version Management**: Migration system supports future schema changes

### 4. State Restoration

- **Page Reload**: State is automatically restored from localStorage
- **Navigation**: Background settings persist across navigation
- **Hydration**: Proper handling of SSR/client-side hydration

## Usage

### Store Methods

```typescript
// Background-specific updates (trigger auto-save)
updateBackgroundType("gradient");
updateBackgroundGradient({
  type: "linear",
  direction: 45,
  colors: ["#ff0000", "#00ff00"],
});
updateBackgroundImage({
  url: "image.jpg",
  blur: 5,
  position: "center",
  size: "cover",
});

// General theme updates (trigger auto-save)
updatePageTheme({ backgroundColor: "#ffffff" });

// Manual persistence
await saveCurrentPage();

// Migration (automatic, but can be called manually)
const migratedPage = migrateBackgroundConfig(oldPage);

// Auto-save control
setAutoSave(false); // Disable auto-save
setAutoSave(true); // Enable auto-save
```

### Persistence Configuration

The store uses zustand's persist middleware with the following configuration:

- **Storage**: localStorage with custom Date serialization
- **Partialize**: Only persists `currentPage`, `lastSaved`, and `autoSaveEnabled`
- **Migration**: Handles schema changes between versions
- **Hydration**: Runs migration after state restoration

### Error Handling

- **Save Failures**: Logged to console, `lastSaved` reset to null
- **Storage Unavailable**: Graceful degradation when localStorage is not available
- **Migration Errors**: Old pages are migrated safely with fallbacks

### Performance Considerations

- **Debounced Saves**: Prevents excessive save operations during rapid changes
- **Selective Persistence**: Only essential data is stored to minimize storage usage
- **Lazy Migration**: Migration only runs when needed

## Requirements Satisfied

This implementation satisfies all requirements from the background editor specification:

- **6.1**: Automatic saving to store ✅
- **6.2**: Page reload state restoration ✅
- **6.3**: Navigation persistence ✅
- **6.4**: Error handling and user notification ✅
- **6.5**: Timestamp tracking for modifications ✅

## Future Enhancements

- **Backend Integration**: Replace localStorage with API calls
- **Conflict Resolution**: Handle concurrent edits
- **Offline Support**: Queue changes when offline
- **Compression**: Compress stored data for large pages

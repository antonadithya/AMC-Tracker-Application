# Route Fix Instructions

1. Switch from BrowserRouter to HashRouter in your React App:
```tsx
import { HashRouter } from 'react-router-dom';
<HashRouter>
{/* ...existing routes... */}
</HashRouter>
```

2. Ensure Electron loads the correct file path:
```ts
mainWindow.loadURL(`file://${path.join(__dirname, 'index.html')}`);
```
This setup avoids absolute path issues in a built (production) environment.
```   
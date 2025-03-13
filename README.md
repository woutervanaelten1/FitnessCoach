# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.


# Fitness Chatbot App

A **React Native Expo** application that features a chatbot capable of interacting with users based on their **fitness data**. The chatbot supports **Markdown rendering**, a custom `ChatBubble` component, and various UI optimizations.

## 📌 Features
- **Chatbot for Fitness Insights**: Users can ask questions about their fitness data.
- **Custom Chat UI**: Designed with a `ChatBubble` component for structured conversations.
- **Markdown Support**: Uses `react-native-markdown-display` to format messages.
- **Optimized Performance**: Utilizes `memo`, `useCallback`, and `StyleSheet.create`.
- **Built with React Native & Expo**: Easily deployable across platforms.
- **Graphical Visualizations**: Uses `victory-native` for rendering charts.
- **User Feedback Alerts**: Implements `react-native-toast-message` for notifications.

---

## 📦 Dependencies
This project requires the following **non-standard** packages:

| Package                           | Description |
|-----------------------------------|------------|
| `react-native-markdown-display`   | Renders markdown in chat bubbles. |
| `expo`                            | Framework for React Native apps. |
| `react-native-gesture-handler`    | Handles gestures in Expo. |
| `react-native-reanimated`         | Enables smooth animations. |
| `react-native-svg`                | Provides SVG support for graphical elements. |
| `victory-native`                  | Enables data visualization and charts. |
| `react-native-toast-message`      | Displays toast notifications in the app. |

To install all dependencies, run:
```sh
npm install
```
Or, if using **Yarn**:
```sh
yarn install
```

---

## 🛠 Setup & Installation

### 1️⃣ Install Expo CLI (if not installed)
```sh
npm install -g expo-cli
```

### 2️⃣ Clone this repository
```sh
git clone https://github.com/yourusername/fitness-chatbot.git
cd fitness-chatbot
```

### 3️⃣ Install dependencies
```sh
npm install
```

### 4️⃣ Start the development server
```sh
expo start
```
Scan the QR code with **Expo Go** (iOS/Android) or use an emulator.

---

## 🏗️ Project Structure
The most important parts of the project are highlighted in the following structure:
```
/fitnesscoach
 ├── /app - Main application logic
 │   ├── /auth - Authentication flow
 │   ├── /tabs - Contains main screens - (these folders contain different files)
 │   │   ├── /chat - Handles chat-related functionality: chat page and browsing earlier conversations
 │   │   ├── /dashboard - Displays fitness data and statistics, ranging from an overall dashboard to detailed ones
 │   │   ├── /home - Entry screen of the application
 │   │   ├── /profile - Manages user profile settings
 │   │   ├── /progress - Tracks and manages fitness goals, overview and edit screens
 │   ├── /context - Handles switching between multiple user profiles and managing of the active one
 ├── /assets - Contains images, icons, and other static files
 ├── /components - Reusable UI components
 ├── /constants - Global constants
 ├── app.json - Expo configuration
 ├── config.js - General configuration
```

---

## 🏗️ Layout Structure (`_layout.tsx` Files)
This project follows a **modular layout system** using `_layout.tsx` files in different sections of the app. These files help define the structure and navigation of each section.

### **Key Roles of `_layout.tsx` Files**
- **Navigation Handling**: Each `_layout.tsx` file wraps the respective section in a navigation container.
- **Consistent UI Structure**: Ensures shared headers, footers, or common UI elements across screens.
- **Efficient Routing**: Organizes screens into logical groups, improving maintainability.

---

## 🗨️ `ChatBubble` Component
This project includes a **custom chat UI** that supports markdown-formatted messages.

### 📌 **Features**
✔️ Supports user and bot messages.  
✔️ Uses `react-native-markdown-display` for text formatting.  
✔️ Optimized with `memo` and `useCallback` for performance.

### 📝 **Code Example**
```tsx
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Markdown from "react-native-markdown-display";

type ChatBubbleProps = {
  message: string;
  isUser: boolean;
  maxWidth: number;
  onPress?: () => void;
};

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isUser, maxWidth, onPress }) => {
  const ContainerComponent = onPress ? TouchableOpacity : View;

  return (
    <ContainerComponent
      onPress={onPress}
      style={[
        styles.bubble,
        isUser ? styles.userBubble : styles.botBubble,
        { maxWidth: `${maxWidth}%` },
      ]}
    >
      <View>
        <Markdown
          style={{
            body: {
              fontSize: 16,
              marginVertical: 4,
              color: isUser ? "#FFFFFF" : "#000000",
            },
            bullet_list: {
              marginLeft: 20,
              color: isUser ? "#FFFFFF" : "#000000",
            },
          }}
        >
          {message}
        </Markdown>
      </View>
    </ContainerComponent>
  );
};

const styles = StyleSheet.create({
  bubble: {
    flexShrink: 1,
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    minHeight: 40,
  },
  userBubble: {
    backgroundColor: "#307FE2",
    alignSelf: "flex-end",
  },
  botBubble: {
    backgroundColor: "#E5E7EB",
    alignSelf: "flex-start",
  },
});

export default ChatBubble;
```

---

## 🎨 **Styling**
- **Markdown Colors:**
  - White text for user messages.
  - Black text for bot messages.
- **Uses Tailwind CSS for React Native (if applicable).**

---

## 💡 Troubleshooting
- **App crashes on startup?**  
  Run `expo start --clear` to reset the cache.
- **Markdown not rendering properly?**  
  Ensure `react-native-markdown-display` is installed.
- **Style issues?**  
  Try updating dependencies: `npm update` or `expo doctor`.

---

## 📬 Contact
For any questions, feel free to reach out via **GitHub Issues** or **email@example.com**.
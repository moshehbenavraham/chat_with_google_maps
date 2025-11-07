# Introduction

This sample app is for illustration only. It uses both Gemini (including Grounding with Google Maps) and Google Maps Platform services.  It is your responsibility to review the relevant Terms of Service applicable to your region, and you must confirm that your integration will comply with those terms.  This sample app may show products or functionality that are not available in your region under the Terms of Service for that region.

# Setting Up Your Google Maps API Key

**IMPORTANT:** This demo uses several Google Maps Platform APIs to function correctly. The API key included in the sample code is for demonstration purposes only and is subject to restrictive quotas that may cause the application to fail. To ensure a stable experience and to explore the full capabilities of the application, you **must obtain and use your own API key**.

### 1. Get Your API Key

Follow the instructions in the official documentation to create a new API key. You will need a Google Cloud project with billing enabled.

**[Get an API Key](https://developers.google.com/maps/documentation/javascript/get-api-key)**

### 2. Enable Required APIs

In your Google Cloud project's dashboard, navigate to the "APIs & Services" section and enable the following APIs:

*   **Geocoding API**: Converts addresses into geographic coordinates.
*   **Places API (New)**: Fetches detailed information about points of interest.
*   **Maps Elevation API**: Gets altitude data for 3D map views.
*   **Maps Grounding API**: Allows the Gemini model to access real-time Maps data.
*   **Maps JavaScript API**: Loads and displays the map.

### 3. Configure the API Key in the Application

Once you have your key, replace the placeholder key in the code.

1.  Open the file `App.tsx`.
2.  Find the `<APIProvider>` component.
3.  Replace the value of the `apiKey` prop with your own key.

```typescript
// In App.tsx

<APIProvider
    version={'alpha'}
    apiKey={'YOUR_API_KEY_HERE'} // <--- REPLACE THE EXISTING KEY HERE
    solutionChannel={"gmp_aistudio_itineraryapplet_v1.0.0"}>
  <AppComponent />
</APIProvider>
```

> Failure to use your own key may result in the map failing to load or grounding features being unavailable due to quota limits on the shared demo key.

# Application Architecture: Interactive Day Planner

This document outlines the architecture of the Interactive Day Planner, a web application built with React that showcases a real-time, voice-driven conversational experience using the Gemini API, grounded with data from Google Maps and visualized on a Photorealistic 3D Map.

## 1. Overall Structure & Core Technologies

The application is a **React-based Single Page Application (SPA)**. The architecture is modular, separating concerns into distinct components, hooks, contexts, and utility libraries.

-   **`index.html` & `index.tsx`**: The entry point of the application. It uses an `importmap` to manage modern JavaScript modules and renders the main `App` component into the DOM.
-   **`App.tsx`**: The root component that orchestrates the entire user experience. It initializes context providers and manages the state for the map and grounding responses.
-   **`/components`**: Contains all the reusable React components that make up the UI, such as the `ControlTray` for user input, the `StreamingConsole` for displaying the conversation, and the `Sidebar` for settings.
-   **`/contexts`**: Uses React's Context API to provide global state and functionality. The `LiveAPIContext` is crucial, making the Gemini Live session available throughout the app.
-   **`/hooks`**: Home to custom React hooks, with `use-live-api.ts` being the most significant. This hook encapsulates the logic for managing the connection to the Gemini Live API.
-   **`/lib`**: A collection of client-side libraries and helper functions. This includes the `GenAILiveClient` wrapper, audio processing utilities, state management configuration (Zustand), and tool definitions.
-   **State Management**: The app uses **Zustand**, a lightweight state management library, to handle global UI state, conversation logs, and settings (`lib/state.ts`).

## 2. Codebase Tour

To help you navigate the project, here’s a tour of the most important files and directories:

-   **`App.tsx`**: The main application component. It acts as the primary view controller, orchestrating the layout of all UI components and, most importantly, reacting to global state changes (for markers, routes, and camera targets) to update the 3D map via the `MapController`. It's the central hub that wires everything together.
-   **`hooks/use-live-api.ts`**: The heart of the Gemini Live integration. This custom hook encapsulates all the logic for connecting to the Gemini Live API, managing the session, and handling real-time events like incoming audio, transcriptions, and tool call requests from the model.
-   **`lib/genai-live-client.ts`**: A low-level wrapper around the `@google/genai` SDK. This class simplifies the connection lifecycle and uses an event-emitter pattern to broadcast server messages, providing a clean interface for the `use-live-api` hook to consume.
-   **`lib/tools/tool-registry.ts`**: This is where the application's function-calling capabilities are defined and implemented. It contains the logic for tools like `mapsGrounding` (for searching and discovering places), `frameEstablishingShot` (for wide, establishing views of a city), and the versatile `frameLocations` tool (for displaying specific, known points of interest). These tools are invoked by the Gemini model to interact with Google Maps and update the application's state.
-   **`lib/map-controller.ts`**: An abstraction layer for all interactions with the Photorealistic 3D Map. This class provides a clean, imperative API (e.g., `addMarkers`, `flyTo`, `frameEntities`) that decouples the rest of the application from the specific implementation details of the `<gmp-map-3d>` web component.

### Advanced Concepts

For developers looking for a deeper dive, the following files and methods use advanced syntax or architectural patterns that are worth studying:

-   **`hooks/use-live-api.ts` - The `onToolCall` Handler**
    -   **Concept:** This asynchronous function is the central dispatcher for all function calls requested by the Gemini model.
    -   **Why it's advanced:** It orchestrates multiple complex operations: managing UI loading states (`isAwaitingFunctionResponse`), dynamically looking up and executing functions from the `toolRegistry`, passing a shared `toolContext` object to decouple tools from the UI, and packaging results to send back to the API. This demonstrates a sophisticated event-driven, function-calling pattern.

-   **`lib/tools/tool-registry.ts` - The `mapsGrounding` Implementation**
    -   **Concept:** This function is a self-contained "tool" that the AI can use. It handles a user query, gets grounded data from Google Maps, and updates the application's state.
    -   **Why it's advanced:** It showcases a complex asynchronous workflow. It makes an initial API call to get grounding data, processes that data to extract Place IDs, makes a *second* set of parallel API calls to the Places library to get location details, and finally updates a global Zustand store (`useMapStore`). This multi-step process that interacts with multiple services and updates state from outside the React component tree is a powerful pattern.

-   **`lib/look-at.ts` - The `lookAtWithPadding` Function**
    -   **Concept:** This utility calculates the precise camera position (`center`, `range`, `tilt`) needed to frame a set of geographic points within the map's visible area, accounting for UI elements that cover parts of the screen.
    -   **Why it's advanced:** The implementation involves non-trivial mathematics, including trigonometric calculations (sine, cosine, tangent) and geometric transformations to convert screen-space UI padding into a geographical camera offset. The logic also accounts for the camera's heading, requiring it to rotate the offset vector, which adds another layer of complexity.

-   **`lib/audio-streamer.ts` - The `scheduleNextBuffer` Method**
    -   **Concept:** This method manages the seamless playback of incoming raw audio chunks from the Gemini API.
    -   **Why it's advanced:** It uses the low-level Web Audio API, which is inherently complex. The method manually manages a queue of audio buffers, calculates precise scheduling times (`scheduledTime`) to avoid gaps or overlaps in playback, and uses timers (`setTimeout`) to ensure the queue is processed efficiently without blocking the main thread.

-   **The `components/map-3d/` Directory**
    -   **Concept:** This set of files creates a robust React component wrapper around the `<gmp-map-3d>` web component.
    -   **Why it's advanced:** It combines several advanced React and TypeScript features:
        -   **Type Augmentation (`map-3d-types.ts`):** It uses TypeScript's `declare module` to add type definitions for the experimental Maps 3D library directly to the `@vis.gl/react-google-maps` package, a technique known as declaration merging.
        -   **Ref Forwarding (`map-3d.tsx`):** It uses `forwardRef` and `useImperativeHandle` to give parent components controlled access to the underlying web component's DOM element and its methods.
        -   **Microtask Batching (`use-map-3d-camera-events.ts`):** It uses `queueMicrotask` to batch multiple camera change events that fire in quick succession into a single state update, which is a sophisticated performance optimization technique.

## 3. Key Concepts Explained

This application brings together several powerful technologies. Here’s a brief overview of each:

-   **Gemini Live API**: This is the core technology for the real-time, bidirectional voice conversation. It processes streams of audio input from the user's microphone and returns human-like spoken audio responses from the model, creating a natural conversational experience. The primary integration point is the **`hooks/use-live-api.ts`** file.
-   **Maps Grounding**: This feature allows the Gemini model to access Google Maps' vast, real-time information to provide accurate and relevant answers to location-based questions. When the model needs information about a place, it invokes the **`mapsGrounding`** tool (implemented in **`lib/tools/tool-registry.ts`**), which makes a grounded call to the Gemini API and processes the results.
-   **`@vis.gl/react-google-maps`**: This library simplifies the integration of Google Maps into a React application. It provides the **`<APIProvider>`** component, which handles loading the Google Maps JavaScript API, and the **`useMapsLibrary`** hook, which allows components to safely access specific Maps libraries (like `places` or `maps3d`) only after they are loaded and ready.
-   **Photorealistic 3D Maps**: The immersive map view is powered by the **`<gmp-map-3d>`** web component, an experimental feature of the Google Maps JavaScript API. To make it easier to use in a declarative React environment, a custom wrapper component is provided in **`components/map-3d/`**.

## 4. Gemini Live API Integration

The core of the conversational experience is powered by the Gemini Live API, which enables real-time, low-latency, bidirectional audio streaming.

-   **Connection Management**: The `GenAILiveClient` class (`lib/genai-live-client.ts`) is a custom wrapper around the `@google/genai` SDK. It simplifies the connection lifecycle and uses an event-emitter pattern to broadcast server messages (e.g., `open`, `close`, `audio`, `toolcall`, `inputTranscription`).
-   **`useLiveApi` Hook**: This hook (`hooks/use-live-api.ts`) manages the instance of `GenAILiveClient`. It exposes functions to `connect` and `disconnect` and handles incoming events from the API. Crucially, it contains the `onToolCall` handler that processes function call requests from the model.
-   **Audio Handling**:
    -   **Input**: The `AudioRecorder` class (`lib/audio-recorder.ts`) captures microphone input, processes it using an `AudioWorklet`, and sends PCM audio data to the Gemini Live API via the `sendRealtimeInput` method.
    -   **Output**: The `AudioStreamer` class (`lib/audio-streamer.ts`) receives PCM audio data from the API, queues it, and plays it back seamlessly using the Web Audio API, providing the AI's voice response.
-   **Real-time Transcription**: The application listens for `inputTranscription` and `outputTranscription` events to display the conversation text in the `StreamingConsole` component as it happens, including interim results for a more responsive feel.

## 5. Grounding with Google Maps

To provide accurate, real-world information, the application uses Gemini's ability to ground its responses with Google Maps data.

-   **Tool-Based Invocation**: The model is configured with a `mapsGrounding` tool definition. When the user asks a question that requires location-based information (e.g., "Find some good pizza places in Chicago"), the Gemini model intelligently decides to call this function.
-   **Tool Call Handling**: The `onToolCall` handler in the `useLiveApi` hook intercepts this request. It then calls a helper function (`lib/maps-grounding.ts`) which makes a *separate* request to the Gemini API, this time explicitly invoking the `googleMaps` tool with the user's query.
-   **Data Processing**: The response from this grounding call is a rich `GenerateContentResponse` object containing not only the model's text response but also structured `groundingMetadata`. The `mapsGrounding` tool implementation processes this response, extracting place IDs from the metadata.
-   **UI Updates**: Once place details (like location coordinates and display name) are fetched using the Google Maps Places library, the application updates its state, causing markers for these locations to be rendered on the 3D map. Additionally, the `GroundingWidget` component can be used to display a rich, interactive list of places using a `contextToken` provided in the grounding response.

## 6. Google Maps Photorealistic 3D Maps

The visual centerpiece of the application is the Photorealistic 3D Map, which provides an immersive and detailed view of the locations being discussed.

-   **Web Component Integration**: The map is implemented using the `<gmp-map-3d>` web component, part of the Google Maps JavaScript API's alpha channel.
-   **React Wrapper**: A custom React component, `Map3D` (`components/map-3d/map-3d.tsx`), is used to wrap the web component, making it easy to integrate into the React component tree and manage its properties via props.
-   **Camera Control**: The application controls the map's camera in two main ways:
    1.  **Direct Tool Commands**: Tools like `frameEstablishingShot` and `frameLocations` (when called with `markers: false`) allow the Gemini model to directly command the map to fly to a specific location or to frame a set of coordinates. These tools calculate the optimal camera view and trigger a "fly-to" animation.
    2.  **Reactive State-Driven Framing**: The application's primary method for displaying points of interest is reactive. When tools like `mapsGrounding` or `frameLocations` (with `markers: true`) are called, they don't command the camera directly. Instead, they update a global list of markers in the application's state. A `useEffect` hook in the main `App` component listens for changes to this list, automatically calculates the best camera position to view the new markers using the `lookAtWithPadding` utility, and then triggers the camera animation. This decouples the tool logic from the view logic.

## 7. `@vis.gl/react-google-maps` Library

This library acts as a foundational layer for integrating Google Maps into the React application.

-   **API Loading**: The `<APIProvider>` component is wrapped around the entire app. It handles the asynchronous loading of the Google Maps JavaScript API script, ensuring all necessary libraries are available before they are used.
-   **Library Access**: The `useMapsLibrary` hook is used extensively to gain access to specific Maps libraries when needed. For instance, `useMapsLibrary('places')` is used to fetch place details and render the `GroundingWidget`, while `useMapsLibrary('maps3d')` is used to interact with the 3D map custom elements. This hook-based approach ensures that components only render after their required map libraries are loaded and ready.

## 8. Making This Demo Your Own

This demo is designed as an interactive sandbox. You can easily customize it to explore different personas, conversational flows, and application logic. Here are two ways to get started.

### Basic Customization: Crafting a New Persona and Use Case

The easiest way to change the demo's behavior is by editing the **system instructions**. The AI's personality, goals, and conversational flow are all defined in this prompt. You can edit it live in the **Settings** sidebar or more permanantely in the `lib/constants.ts` file. 

A great example of this is the hidden **"Scavenger Hunt"** persona. By rapidly clicking the settings icon six times, you activate a completely different system prompt (`SCAVENGER_HUNT_PROMPT` in `lib/constants.ts`). This prompt transforms the helpful itinerary planner into a playful game master named "ClueMaster Cory." It uses the **exact same tools** but in a creative new way to create a totally different user experience, guiding the user through a series of riddles to find famous landmarks.

Try crafting your own persona! You could create a formal hotel concierge, a laid-back local guide, or a historical expert.

### Advanced Customization: Adding New Tools and Logic

For more significant changes, you can define entirely new tools and write a system prompt that tells the AI how to use them. This lets you build completely new application behaviors. Tools are defined in `lib/tools/itinerary-planner.ts`, and their implementations (the code that actually runs) are in `lib/tools/tool-registry.ts`.

Here are a couple of sample prompts to get you started on creating a simple "City Explorer" experience:

1.  **Prompt to modify an existing tool:**

    > "I want to add a new feature to the `frameLocations` tool. It should accept an optional `zoomLevel` parameter, which can be 'close', 'medium', or 'far'. This will adjust the camera's `range` accordingly. Please update the tool's definition in `lib/tools/itinerary-planner.ts` and its implementation in `lib/tools/tool-registry.ts`."

2.  **Prompt to create a new system instruction that uses the new feature:**

    > "Now, create a new system instruction for a 'City Explorer' persona. This persona should ask the user for a few places they want to see. Then, it MUST use the `frameLocations` tool to show all places on the map. It should then ask the user if they want a closer look and use the new `zoomLevel` parameter if they say yes."
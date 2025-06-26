# Toddler Experiment

This repository hosts an application that facilitates a conversation between two AI agents. The default experiment simulates a conversation between two toddler-like AI personalities working together to learn about the world. They are assisted by a third "browser" agent that can look up information for them.

The frontend allows users to specify custom agent personalities and names, so other experiments are possible.

## Features

-   **Multi-Agent Conversations:** Simulates conversations between two configurable AI agents.
-   **Web Surfing Agent:** An autonomous web browsing agent assists the primary agents by looking up information online.
-   **Customizable Personas:** Easily configure the names and personalities (system prompts) of the agents through the web interface.
-   **Real-time Streaming:** Conversations are streamed from the backend to the frontend in real-time.
-   **Thinking Process Visibility:** See the "thoughts" of the agents before they produce a response.

## How it Works

The project consists of two main parts:

-   **Backend:** A Python application built with the [`pyautogen`](https://github.com/microsoft/autogen) framework. It manages the AI agents, including the `WebSurferAgent`. It is responsible for orchestrating the conversation flow.
-   **Frontend:** A [Next.js](https://nextjs.org/) application that provides a user-friendly interface for configuring and observing the AI agent conversations. It communicates with the backend via API routes.

When a chat is started from the frontend:
1. The agent configurations are sent to a Next.js API route.
2. The API route writes the configuration to `config.json` and starts the Python backend process (`main.py`).
3. The Python process runs the autogen simulation.
4. The output of the simulation is streamed back to the frontend and displayed in the conversation view.

## Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v20 or later)
-   [pnpm](https://pnpm.io/)
-   [Python](https://www.python.org/) (v3.9 or later)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/toddler-experiment.git
    cd toddler-experiment
    ```

2.  **Install backend dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Install Playwright browsers:**
    The `WebSurferAgent` uses Playwright for browser automation. You need to install the required browser binaries.
    ```bash
    playwright install
    ```

4.  **Configure your LLM provider:**
    This project uses `pyautogen` which supports various LLM providers. The configuration is stored in the `OAI_CONFIG_LIST` file at the root of the project. You need to create this file and add your LLM configuration.

    For example, to use a Google Gemini model, create a file named `OAI_CONFIG_LIST` with the following content, replacing `"YOUR_API_KEY"` with your actual Google AI API key:

    ```json
    [
        {
            "model": "gemini-1.5-flash",
            "api_key": "YOUR_API_KEY",
            "api_type": "google"
        }
    ]
    ```

    You can also configure it to use OpenAI or other models supported by autogen. Please refer to the [autogen documentation](https://microsoft.github.io/autogen/docs/installation/#openai-api-key-and-llm-configuration) for more details.

5.  **Install frontend dependencies:**
    ```bash
    cd frontend
    pnpm install
    ```

## Usage

1.  **Start the frontend development server:**
    ```bash
    cd frontend
    pnpm dev
    ```

2.  **Open the application:**
    Open your web browser and navigate to [http://localhost:3000](http://localhost:3000).

3.  **Configure and start the chat:**
    - You can modify the agent names, system prompts, and the initial message in the text fields.
    - Click "Start Chat" to begin the conversation.
    - The conversation will be displayed in the "Conversation" panel.
    - Click "Stop Chat" to terminate the experiment.

## Project Structure

```
.
├── frontend/             # Next.js frontend application
│   ├── app/              # App Router directory
│   │   ├── api/          # API routes for starting/stopping chat
│   │   └── page.tsx      # Main page component
│   ├── package.json
│   └── ...
├── main.py               # Backend Python script for the autogen experiment
├── config.json           # Configuration for the agents (managed by the frontend)
├── OAI_CONFIG_LIST       # LLM provider configuration (you need to create this)
├── requirements.txt      # Python dependencies
└── README.md             # This file
```

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
